var fs=require('fs'), vm=require('vm');
var ALS='/Users/alexstathatos/ALS DASHBOARD ALL FILES/als';
var store={};
var sb={console:console,JSON:JSON,Object:Object,Array:Array,Date:Date,Math:Math,String:String,Number:Number,isNaN:isNaN,
 localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}}};
sb.window=sb; vm.createContext(sb);
vm.runInContext(fs.readFileSync(ALS+'/insights-engine.js','utf8'),sb,{filename:'insights-engine.js'});
var E=sb.window.ALSInsights;
var ok=0,bad=0; function is(n,a,b){var p=JSON.stringify(a)===JSON.stringify(b);(p?ok++:bad++);console.log((p?'  ✓ ':'  ✗ FAIL ')+n+(p?'':'  got '+JSON.stringify(a)+' want '+JSON.stringify(b)));}
function ok_(n,c){ (c?ok++:bad++); console.log((c?'  ✓ ':'  ✗ FAIL ')+n); }

// ── build a synthetic person with ONE planted truth and one planted null ──
function dk(i){var d=new Date(2026,0,1); d.setDate(d.getDate()+i); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function build(days, opts){
  opts=opts||{};
  var sleep=[],caf=[],nut=[];
  // deterministic pseudo-random so the test can't flake
  var seed=42; function rnd(){ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; }
  var prot=[];
  for(var i=0;i<days;i++) prot.push(80 + Math.round(rnd()*120));       // 80..200
  for(var i=0;i<days;i++){
    var d=dk(i);
    // PLANTED TRUTH (lag 1): YESTERDAY's protein drives today's recovery.
    var yday = i>0 ? prot[i-1] : 140;
    var rec = 45 + (yday-80)/120*35 + (rnd()-0.5)*8;      // 45..80
    var cafMg = 50 + Math.round(rnd()*250);               // PLANTED NULL vs sleep
    var hrs = 7 + (rnd()-0.5)*1.2;
    sleep.push({dateKey:d, hours:+hrs.toFixed(2), recovery:Math.round(rec), quality:3, energy:3, mood:3, soreness:2});
    nut.push({dateKey:d, kcal:2200, p:prot[i], c:250});
    caf.push({ts:new Date(d+'T09:00:00').getTime(), mg:cafMg});
  }
  store['sleep:logs']=JSON.stringify(sleep);
  store['nut:logs']=JSON.stringify(nut);
  store['caf:logs']=JSON.stringify(caf);
  store['po_workouts']=JSON.stringify([]);
}

console.log('\n1) evaluate() returns EVERY hypothesis, never just the winners');
build(60);
var ev=E.evaluate();
is('one row per hypothesis', ev.length, E._HYP.length);
ok_('every row has a state', ev.every(e=>['confirmed','ruled-out','watching'].includes(e.state)));
ok_('every row has a human title', ev.every(e=>e.title && !/^[a-z]+ → [a-z]+$/.test(e.title)===false || e.title.length>3));
ok_('states include more than one kind', new Set(ev.map(e=>e.state)).size>1);
console.log('   states:', JSON.stringify(ev.reduce((m,e)=>{m[e.state]=(m[e.state]||0)+1;return m;},{})));

console.log('\n2) the planted TRUTH is found, the planted NULL is ruled out');
var byId={}; ev.forEach(e=>byId[e.id]=e);
ok_('protein → recovery confirmed', byId['prot-rec'].state==='confirmed');
ok_('  …and it reads as a real sentence', /recovery runs about/i.test(byId['prot-rec'].text));
ok_('caffeine → sleep NOT confirmed', byId['caf-sleep'].state!=='confirmed');
console.log('   caf-sleep:', byId['caf-sleep'].state, '| n='+byId['caf-sleep'].n, '| d='+byId['caf-sleep'].d);

console.log('\n3) compute() is unchanged for coach / morning / nova');
var c=E.compute();
ok_('compute still returns only confirmed', c.length>0 && c.every(x=>x.text&&x.strength));
// compute() also carries single-series trends (rec-down, wt-trend, best-dow…)
// which are not hypotheses, so only the cross-domain ones can be in evaluate().
var hypIds=new Set(E._HYP.map(h=>h.id));
ok_('every cross-domain result agrees with evaluate', c.filter(x=>hypIds.has(x.id)).every(x=>byId[x.id].state==='confirmed'));

console.log('\n4) "not enough data" is honest, not a guess');
store={}; build(9);
var ev2=E.evaluate();
var w=ev2.filter(e=>e.state==='watching');
ok_('thin data → everything watching', w.length===ev2.length);
ok_('shortfall is a real number', w.every(e=>typeof e.n==='number' && e.n>=0));
ok_('no confirmed claims on 9 days', !ev2.some(e=>e.state==='confirmed'));

console.log('\n5) memory: changes() invents nothing without history');
store['insights:history']=undefined; delete store['insights:history'];
is('no history → no changes', E.changes(ev), []);
// plant an old snapshot where protein→recovery was NOT yet confirmed
store={}; build(60); ev=E.evaluate();
var old={ts:Date.now()-30*86400000, dateKey:'2026-06-20', ids:{}};
ev.forEach(e=>{ old.ids[e.id]={s:(e.id==='prot-rec'?'watching':e.state), d:(e.id==='prot-rec'?0:(e.d||0)), t:0,n:30}; });
store['insights:history']=JSON.stringify([old]);
var ch=E.changes(ev);
ok_('protein→recovery reported as NEW', ch.some(c=>c.id==='prot-rec'&&c.kind==='new'));
ok_('change carries the date it changed since', ch.every(c=>!!c.since));
// and the reverse: something that was confirmed and no longer is
var old2={ts:Date.now()-30*86400000, dateKey:'2026-06-20', ids:{}};
ev.forEach(e=>{ old2.ids[e.id]={s:(e.id==='caf-sleep'?'confirmed':e.state), d:(e.id==='caf-sleep'?0.9:(e.d||0)), t:5,n:40}; });
store['insights:history']=JSON.stringify([old2]);
var ch2=E.changes(ev);
ok_('a dead pattern is reported as BROKEN', ch2.some(c=>c.id==='caf-sleep'&&c.kind==='broken'));

console.log('\n6) snapshot writes at most once a week');
store['insights:history']=JSON.stringify([{ts:Date.now()-2*86400000,dateKey:'x',ids:{}}]);
var before=JSON.parse(store['insights:history']).length;
E.snapshot(ev);
is('recent snapshot not duplicated', JSON.parse(store['insights:history']).length, before);
store['insights:history']=JSON.stringify([{ts:Date.now()-9*86400000,dateKey:'x',ids:{}}]);
E.snapshot(ev);
is('a week later it does record', JSON.parse(store['insights:history']).length, 2);

console.log('\n7) questions answer from the same statistics');
var a=E.answer('recovery',ev);
ok_('recovery question returns buckets', a && Array.isArray(a.confirmed)&&Array.isArray(a.watching)&&Array.isArray(a.ruledOut));
ok_('  and finds the planted protein link', a.confirmed.some(x=>x.id==='prot-rec'));
ok_('confirmed sorted by |t| desc', a.confirmed.every((x,i,arr)=>i===0||Math.abs(arr[i-1].t)>=Math.abs(x.t)));
ok_('caffeine question exists', !!E.answer('caffeine',ev));
is('unknown question → null', E.answer('nope',ev), null);

console.log('\n8) the fields that used to be ignored are now analysed');
var used=new Set(); E._HYP.forEach(h=>{used.add(h.A);used.add(h.B);});
ok_('mood analysed', used.has('mood'));
ok_('soreness analysed', used.has('soreness'));
ok_('kcal analysed', used.has('kcal'));

console.log('\n'+ok+' passed, '+bad+' failed');
process.exit(bad?1:0);
