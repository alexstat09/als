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

console.log((fail?'✗ ':'✓ ')+pass+' passed, '+fail+' failed');
if(fail) process.exit(1);
