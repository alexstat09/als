/* run.html — shoe intelligence.
   The retirement number is a knee-safety number, so the thing under test is
   not "does it draw nicely" but "does it ever claim to know a shoe it doesn't,
   and does it ever overwrite a limit she set herself". */
var fs=require('fs'), path=require('path');
var SRC=fs.readFileSync(path.join(__dirname,'..','run.html'),'utf8');

var a=SRC.indexOf('    /* ── shoe intelligence');
var b=SRC.indexOf('    /* ── her own photographs');
if(a<0||b<0){ console.error('shoes: anchors missing from run.html'); process.exit(1); }
var SHOE_RETIRE=700;
eval(SRC.slice(a,b));

var pass=0, fail=0;
function ok(cond,msg){ if(cond) pass++; else { fail++; console.log('  ✗ '+msg); } }
function eq(got,want,msg){ ok(got===want, msg+' — got '+JSON.stringify(got)+', wanted '+JSON.stringify(want)); }

/* ── the two pairs Chrissie actually owns ── */
eq(shoeArtSpec({name:'Saucony endrorphin pro 5'}).m,'Saucony Endorphin Pro','her misspelt racer still identifies');
eq(shoeLifeKm({name:'Saucony endrorphin pro 5',retireKm:700}),400,'a carbon racer retires at 400km, not the stored 700');
eq(shoeArtSpec({name:'Saucony endrorphin pro 5'}).plate,true,'the racer draws its plate');
eq(shoeArtSpec({name:'Hoka Bondi 9'}).m,'Hoka Bondi','Bondi identifies');
eq(shoeLifeKm({name:'Hoka Bondi 9',retireKm:700}),800,'max cushion outlasts the flat default');

/* ── it must not guess ── */
['my old blue ones','τα παλιά μου','Nike','','   ','walking shoes','shoes'].forEach(function(n){
  ok(!(shoeIdentify(n)||{}).sure, 'refuses to identify '+JSON.stringify(n));
  eq(shoeLifeKm({name:n,retireKm:640}),640,'unidentified keeps her stored limit ('+JSON.stringify(n)+')');
});

/* ── precedence: her word beats the catalogue beats the stored default ── */
eq(shoeLifeKm({name:'Saucony endrorphin pro 5',retireKm:700,retireUser:520}),520,'an explicit limit always wins');
eq(shoeLifeKm({name:'Hoka Bondi 9',retireKm:700,retireUser:0}),800,'a zero override is ignored, not honoured');

/* ── disambiguation ── */
eq(shoeArtSpec({name:'Nike Pegasus 41'}).m,'Nike Pegasus','a road Pegasus is not the trail one');
eq(shoeArtSpec({name:'nike pegasus trail 5'}).m,'Nike Pegasus Trail','the trail Pegasus is');
eq(shoeArtSpec({name:'saucony endorphin speed 4'}).m,'Saucony Endorphin Speed','Speed is not Pro');
eq(shoeArtSpec({name:'vaporfly next% 4'}).m,'Nike Vaporfly','a model name alone is enough when it is distinctive');

/* ── identification never mutates the shoe ── */
var s={name:'Hoka Bondi 9',retireKm:700,def:true};
var before=JSON.stringify(s); shoeLifeKm(s); shoeArtSpec(s); shoeIdentify(s.name);
eq(JSON.stringify(s),before,'reading a shoe never writes to it');

/* ── catalogue sanity ── */
var seen={};
SHOE_KB.forEach(function(k){
  ok(!seen[k.m],'no duplicate model: '+k.m); seen[k.m]=1;
  ok(k.life>=300&&k.life<=900,k.m+' has a plausible lifespan');
  ok(!!SHOE_CAT[k.cat],k.m+' has a known category');
  ok(!!k.col&&!!k.col.up,k.m+' has a palette');
  ok(k.stack>20&&k.stack<55&&k.drop>=0&&k.drop<=14,k.m+' has plausible geometry');
});
ok(SHOE_KB.length>=60,'catalogue covers the major brands ('+SHOE_KB.length+' models)');

/* ── every model must draw finite geometry, new and dead ── */
var drew=0;
SHOE_KB.forEach(function(k,i){
  [0,0.5,1].forEach(function(w){
    var o=shoeArt(k,w,'t'+i);
    ['back','front','flat'].forEach(function(p){
      ok(!/NaN|undefined|Infinity/.test(o[p]), k.m+' draws clean at wear '+w+' ('+p+')');
      drew++;
    });
  });
});
ok(drew===SHOE_KB.length*9,'every model rendered at three wear levels');
/* the keepsake rasterises through Image(), which rejects malformed XML */
var flat=shoeArt(SHOE_KB[0],1,'x').flat;
ok(/^<svg [^>]*width="\d+" height="\d+"/.test(flat),'the keepsake SVG carries explicit width/height');
ok((flat.match(/<svg/g)||[]).length===1 && /<\/svg>$/.test(flat),'the keepsake SVG is a single closed root');

/* ── the GPU mesh ── */
var meshed=0;
SHOE_KB.forEach(function(k){
  [0,0.5,1].forEach(function(w){
    var m=shoeMeshGL(k,w);
    var finite=true, i;
    for(i=0;i<m.pos.length;i++) if(!isFinite(m.pos[i])) finite=false;
    for(i=0;i<m.nrm.length;i++) if(!isFinite(m.nrm[i])) finite=false;
    for(i=0;i<m.col.length;i++) if(!isFinite(m.col[i])||m.col[i]<0||m.col[i]>1) finite=false;
    ok(finite, k.m+' builds finite, in-gamut geometry at wear '+w);
    ok(m.pos.length/3===m.nrm.length/3 && m.pos.length/3===m.col.length/3 && m.pos.length/3===m.shn.length,
       k.m+' has one normal, colour and shininess per vertex at wear '+w);
    var maxI=0; for(i=0;i<m.idx.length;i++) if(m.idx[i]>maxI) maxI=m.idx[i];
    ok(maxI < m.pos.length/3, k.m+' indexes no vertex past the end at wear '+w);
    ok(m.pos.length/3 < 65536, k.m+' fits 16-bit indices at wear '+w);
    ok(m.idx.length%3===0, k.m+' emits whole triangles at wear '+w);
    meshed++;
  });
});
ok(meshed===SHOE_KB.length*3,'every model meshed at three wear levels');
/* normals must be unit length or the lighting goes wrong in a way tests should catch */
var nm=shoeMeshGL(SHOE_KB[0],0.3), badN=0;
for(var q=0;q<nm.nrm.length;q+=3){
  var L=Math.sqrt(nm.nrm[q]*nm.nrm[q]+nm.nrm[q+1]*nm.nrm[q+1]+nm.nrm[q+2]*nm.nrm[q+2]);
  if(Math.abs(L-1)>0.001) badN++;
}
eq(badN,0,'every vertex normal is unit length');
/* the tread is real geometry, so a worn-out shoe must have less of it */
var fresh=shoeMeshGL(SHOE_KB[0],0), dead=shoeMeshGL(SHOE_KB[0],1);
ok(dead.pos.length < fresh.pos.length,'tread lugs disappear as the shoe wears out');
ok(fresh.tris>3000 && fresh.tris<20000,'mesh density is sane ('+fresh.tris+' triangles)');
/* a plated racer and an unplated trainer must not produce identical meshes */
var racer=shoeArtSpec({name:'Saucony endrorphin pro 5'}), bondi=shoeArtSpec({name:'Hoka Bondi 9'});
var mr=shoeMeshGL(racer,0.2), mb=shoeMeshGL(bondi,0.2);
function height(m){ var lo=1e9,hi=-1e9;
  for(var i=1;i<m.pos.length;i+=3){ if(m.pos[i]<lo) lo=m.pos[i]; if(m.pos[i]>hi) hi=m.pos[i]; }
  return hi-lo; }
ok(Math.abs(height(mb)-height(mr))>0.5,
   'a 43mm Bondi stands taller than a 39.5mm racer ('+height(mb).toFixed(1)+' vs '+height(mr).toFixed(1)+')');
ok(racer.plate && !bondi.plate,'only the racer carries a plate');

console.log((fail?'✗ ':'✓ ')+pass+' passed, '+fail+' failed');
if(fail) process.exit(1);
