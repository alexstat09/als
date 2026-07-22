// Run main.html's REAL renderHeatmap against seeded goals.
var fs=require('fs');
var h=fs.readFileSync('/Users/alexstathatos/ALS DASHBOARD ALL FILES/als/main.html','utf8');
var i=h.indexOf('  function renderHeatmap() {');
var j=h.indexOf('\n  // ---------- Boot ----------', i);
var src=h.slice(i,j);

var els={};
function mk(id){ var e={id:id,_h:'',_t:''};
  Object.defineProperty(e,'innerHTML',{get(){return e._h},set(v){e._h=String(v)}});
  Object.defineProperty(e,'textContent',{get(){return e._t},set(v){e._t=String(v)}});
  return e; }
var document={ getElementById:function(id){ return els[id]||(els[id]=mk(id)); } };

// seed: 12 weeks of goals, some days perfect, some partial, some empty
var store={};
var today=new Date(); today.setHours(0,0,0,0);
for(var d=0; d<84; d++){
  var dt=new Date(today); dt.setDate(today.getDate()-d);
  if(d%9===0) continue;                       // some days with nothing logged
  var k=dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
  var n=3, done = d%5===0 ? 0 : (d%3===0 ? 1 : 3);
  store['goals:'+k]=[]; for(var g=0; g<n; g++) store['goals:'+k].push({done:g<done});
}
function getGoals(key){ return store[key]||[]; }

eval(src);
renderHeatmap();

var bars=(els.rhyBars.innerHTML.match(/gm-rhy-b/g)||[]).length;
var ok=0,bad=0; function is(n,c){ (c?ok++:bad++); console.log((c?'  ✓ ':'  ✗ FAIL ')+n); }
is('bars rendered ('+bars+' weeks)', bars===18);
is('bars have real heights', /height:\d+px/.test(els.rhyBars.innerHTML));
is('headline shows a weekly average → "'+els.rhyAvg.innerHTML+'"', /%.*done per week/.test(els.rhyAvg.innerHTML));
is('best week labelled → "'+els.rhyPeak.textContent+'"', /best week \d+%/.test(els.rhyPeak.textContent));
is('axis labelled → "'+els.rhyL.textContent+' … '+els.rhyC.textContent+' … '+els.rhyR.textContent+'"', !!els.rhyL.textContent&&!!els.rhyR.textContent);
is('current week marked', els.rhyBars.innerHTML.indexOf('gm-rhy-b now')>=0);
is('unlogged weeks distinguishable', /gm-rhy-b (none|zero)/.test(els.rhyBars.innerHTML));
is('stats row still filled → "'+els.heatStats.innerHTML.replace(/<[^>]+>/g,' ').trim()+'"', els.heatStats.innerHTML.indexOf('perfect days')>=0);
console.log('\n'+ok+' passed, '+bad+' failed');
process.exit(bad?1:0);
