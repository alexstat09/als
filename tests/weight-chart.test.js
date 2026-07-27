/* Exercises weight.html across all four ranges and the states Alex's own data
   never reaches: no goal, one entry, two entries, a long gap, imperial units. */
const fs=require('fs'), vm=require('vm'), assert=require('assert');
const HTML=fs.readFileSync('/Users/alexstathatos/ALS DASHBOARD ALL FILES/als/weight.html','utf8');
const SRC=[...HTML.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1])[0];
/* Fixture of choice is Alex's real 149 weigh-ins (Feb–Jul 2026): near-daily,
   a 4 kg range, and 0.335 kg of day-to-day noise — the exact shape the chart
   has to render honestly. It lives outside the repo, so fall back to a
   synthetic stand-in with the same statistics rather than failing. */
const FIXTURE='/Users/alexstathatos/ALS DASHBOARD ALL FILES/BACKUPS/2026-07-14_device-export_538-keys.json';
let REALDATA=null;
try{
  let _r=JSON.parse(fs.readFileSync(FIXTURE,'utf8')).data.po_coach_weights;
  _r=typeof _r==='string'?JSON.parse(_r):_r;
  if(Array.isArray(_r) && _r.length>100) REALDATA=_r;
}catch(e){}
if(!REALDATA){
  console.log('  (real-data fixture absent — using a synthetic stand-in)');
  /* 149 consecutive days ending on the suite's "today" (2026-07-13), so the
     7-day window is populated exactly as the real log's is. */
  REALDATA=[]; const d=new Date('2026-02-15T12:00:00');
  for(let i=0;i<149;i++){
    REALDATA.push({ dateKey:d.toISOString().slice(0,10),
      weight:Math.round((70.5+Math.sin(i/24)*1.4+((i*7919)%13-6)/20)*10)/10, ts:1 });
    d.setDate(d.getDate()+1);
  }
}

let pass=0, fail=0;
function ok(c,m){ if(c) pass++; else { fail++; console.log('  ✗ '+m); } }

function run(opts){
  const els={}, clicks=[];
  function makeEl(id){
    const el={ id, _cls:new Set(), _attr:{}, innerHTML:'', textContent:'', value:'', style:{},
      offsetWidth:52, offsetLeft:2, dataset:{},
      classList:{ add:(...c)=>c.forEach(x=>el._cls.add(x)), remove:(...c)=>c.forEach(x=>el._cls.delete(x)),
                  toggle:(c,f)=>{ f?el._cls.add(c):el._cls.delete(c); }, contains:c=>el._cls.has(c) },
      setAttribute:(k,v)=>{el._attr[k]=String(v);}, getAttribute:k=>el._attr[k]==null?null:el._attr[k],
      removeAttribute:k=>{delete el._attr[k];}, hasAttribute:k=>k in el._attr,
      addEventListener:(ev,fn)=>{ el._h=el._h||{}; el._h[ev]=fn; }, closest:()=>null,
      focus:()=>{}, select:()=>{}, querySelectorAll:()=>[], appendChild:()=>{},
      getBoundingClientRect:()=>({width:opts.w||530,height:214,left:0,top:0}),
      createSVGPoint:()=>({x:0,y:0,matrixTransform:()=>({x:opts.probeX||0})}),
      getScreenCTM:()=>({inverse:()=>({})}),
      getComputedTextLength:()=>70, getTotalLength:()=>800 };
    return el;
  }
  const get=id=>{ if(!els[id]) els[id]=makeEl(id); return els[id]; };
  const store={};
  const localStorage={ getItem:k=>k in store?store[k]:null, setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];} };
  const pills=['7','30','90','0'].map((r,i)=>{ const e=makeEl('pill'+r); e.dataset.wrange=r; e.offsetLeft=2+i*54; if(r==='30') e._cls.add('active'); return e; });
  const document={ getElementById:get,
    querySelector:sel=>sel==='[data-wrange].active'?(pills.find(p=>p._cls.has('active'))||null):get('q:'+sel),
    querySelectorAll:sel=>sel==='[data-wrange]'?pills:[],
    addEventListener:()=>{}, createElement:()=>makeEl('n'), head:{appendChild:()=>{}},
    documentElement:makeEl('html'), body:makeEl('body'), hidden:false };
  const sandbox={ document, localStorage, console,
    window:{ addEventListener:()=>{}, matchMedia:()=>({matches:!!opts.reduce}), ResizeObserver:null },
    requestAnimationFrame:f=>{ if(opts.raf!==false) f(); }, setTimeout:f=>{ f(); return 0; }, clearTimeout:()=>{},
    Math, JSON, parseInt, parseFloat, isNaN, isFinite, String, Number, Array, Object, RegExp, Error };
  sandbox.window.document=document; sandbox.window.localStorage=localStorage;
  const R=Date, NOW=new R(opts.today+'T09:00:00').getTime();
  class FD extends R{ constructor(...a){ if(!a.length) super(NOW); else super(...a); } static now(){ return NOW; } }
  FD.UTC=R.UTC; FD.parse=R.parse; sandbox.Date=FD;

  store['po_coach_weights']=JSON.stringify(opts.data);
  if(opts.goal!=null) store['goals_outcomes_v1']=JSON.stringify([{id:'og-weight',type:'bodyweight',target:opts.goal,unit:'kg'}]);
  if(opts.units) store['po_coach_v1']=JSON.stringify({units:opts.units});

  vm.createContext(sandbox);
  let threw=null;
  try{ vm.runInContext(SRC, sandbox, {filename:'inline.js'}); }catch(e){ threw=e; }
  return { els, store, threw, pills, get,
    chart:()=>(els['wtChartContent']||{}).innerHTML||'',
    all:()=>Object.keys(els).map(k=>(els[k].innerHTML||'')+' '+(els[k].textContent||'')).join(' ') };
}

function gen(startKey,n,fn){
  const out=[]; const d=new Date(startKey+'T12:00:00');
  for(let i=0;i<n;i++){ out.push({dateKey:d.toISOString().slice(0,10), weight:fn(i), ts:1}); d.setDate(d.getDate()+1); }
  return out;
}

console.log('── RANGES on his real 149 ─────────────────');
['7','30','90','0'].forEach(r=>{
  const t=run({data:REALDATA, goal:72, today:'2026-07-13'});
  ok(!t.threw, 'range '+r+': no throw');
  if(t.threw){ console.log('    '+t.threw.message); return; }
  // click the range pill
  const btn=t.pills.find(p=>p.dataset.wrange===r);
  btn._h.click();
  const c=t.chart(), meta=t.els['wtMeta'].textContent;
  const ticks=[...c.matchAll(/class="wt-ylabel"[^>]*>([^<]*)</g)].map(m=>parseFloat(m[1]));
  const dots=(c.match(/class="wt-daily"/g)||[]).length;
  const span=ticks.length?Math.max(...ticks)-Math.min(...ticks):0;
  console.log('  '+(r==='0'?'ALL':r+'D').padEnd(4)+' dots='+String(dots).padEnd(4)+' ticks=['+ticks.join(' ')+'] | '+meta);
  ok(dots>=2, 'range '+r+': drew dots');
  ok(/class="wt-line"/.test(c), 'range '+r+': trend line');
  ok(ticks.length>=3, 'range '+r+': >=3 gridlines (got '+ticks.length+')');
  ok(span>=2, 'range '+r+': y span >= 2kg (got '+span.toFixed(1)+')');
  ok(!/NaN|undefined|Infinity/.test(c), 'range '+r+': clean numbers');
  ok(!/warn/.test(t.els['wtMeta']._cls.size?[...t.els['wtMeta']._cls].join():''), 'range '+r+': no fallback warning');
});

console.log('\n── EDGE STATES ────────────────────────────');
function edge(name, opts, checks){
  const t=run(opts);
  ok(!t.threw, name+': no throw'+(t.threw?' → '+t.threw.message:''));
  if(t.threw) return;
  ok(!/NaN|undefined|Infinity/.test(t.all()), name+': no NaN/undefined painted');
  checks(t);
}

edge('empty log', {data:[], goal:72, today:'2026-07-13'}, t=>{
  ok(t.els['wtNum'].textContent==='—', 'empty: hero is an em dash');
  ok(!t.els['wtEmpty']._cls.has('hidden'), 'empty: empty-state shown');
  ok(t.els['wtChartWrap']._cls.has('hidden'), 'empty: chart hidden');
  ok(t.els['wtStats']._cls.has('hidden'), 'empty: stats hidden');
  ok(t.els['wtMonthsWrap']._cls.has('hidden'), 'empty: month rail hidden');
  ok(/first weight/.test(t.els['novaSays'].textContent), 'empty: nova asks for a first weigh-in');
});

edge('one entry', {data:[{dateKey:'2026-07-13',weight:70.4,ts:1}], goal:72, today:'2026-07-13'}, t=>{
  ok(t.els['wtNum'].textContent==='70.4', 'one: hero shows it');
  ok(t.els['wtChartWrap']._cls.has('hidden'), 'one: chart still hidden');
  ok(t.els['wtMonthsWrap']._cls.has('hidden'), 'one: month rail hidden');
  ok(/data-wdel/.test(t.els['wtHistory'].innerHTML), 'one: history row present');
});

edge('two entries', {data:[{dateKey:'2026-07-12',weight:70.0,ts:1},{dateKey:'2026-07-13',weight:70.4,ts:1}], goal:72, today:'2026-07-13'}, t=>{
  ok(!t.els['wtChartWrap']._cls.has('hidden'), 'two: chart appears');
  ok(/class="wt-line"/.test(t.chart()), 'two: trend line drawn');
  ok(!/class="wt-band"/.test(t.chart()), 'two: NO fluctuation band (too few points to claim a spread)');
  ok(/Not enough days/.test(t.els['wtDelta'].textContent), 'two: says trend is not established yet');
  ok(!/NORMAL SWING/.test(t.els['wtLegend'].innerHTML), 'two: legend omits the band');
});

edge('no goal set', {data:REALDATA, today:'2026-07-13'}, t=>{
  ok(!/class="wt-goal"/.test(t.chart()), 'no goal: no goal line invented');
  ok(!/GOAL/.test(t.els['wtLegend'].innerHTML), 'no goal: legend omits GOAL');
  ok(/LOWEST/.test(t.els['wtStats'].innerHTML), 'no goal: falls back to LOWEST cell');
  ok(!/TO GOAL/.test(t.els['wtStats'].innerHTML), 'no goal: no TO GOAL cell');
  ok(!/to go|over/.test(t.els['novaSays'].textContent), 'no goal: nova does not mention a target');
});

edge('stale log — nothing for 60 days', {data:REALDATA, goal:72, today:'2026-09-20'}, t=>{
  const m=t.els['wtMeta'];
  ok(/No weigh-ins in the last 30 days/.test(m.textContent), 'stale: says so in words (got: '+m.textContent+')');
  ok(m._cls.has('warn'), 'stale: flagged, not silently empty');
  ok(/class="wt-line"/.test(t.chart()), 'stale: still draws the most recent data');
  ok(t.els['wtStreak']._cls.has('hidden'), 'stale: streak hidden');
});

edge('goal far out of reach', {data:REALDATA, goal:95, today:'2026-07-13'}, t=>{
  ok(!/class="wt-goal"/.test(t.chart()), 'far goal: not forced into the scale');
  ok(/TO GOAL/.test(t.els['wtStats'].innerHTML), 'far goal: still stated as a number');
  const ticks=[...t.chart().matchAll(/class="wt-ylabel"[^>]*>([^<]*)</g)].map(m=>parseFloat(m[1]));
  ok(Math.max(...ticks)-Math.min(...ticks)<12, 'far goal: scale stays readable (span '+(Math.max(...ticks)-Math.min(...ticks))+')');
});

edge('at goal exactly', {data:gen('2026-06-14',30,()=>72.0), goal:72, today:'2026-07-13'}, t=>{
  ok(/holding steady/.test(t.els['wtDelta'].textContent), 'at goal: reads holding steady');
  ok(/right on 72/.test(t.els['novaSays'].textContent), 'at goal: nova says hold it');
  ok(!t.els['wtDelta']._cls.has('off'), 'at goal: not painted as a problem');
  const ticks=[...t.chart().matchAll(/class="wt-ylabel"[^>]*>([^<]*)</g)].map(m=>parseFloat(m[1]));
  ok(Math.max(...ticks)-Math.min(...ticks)>=2, 'at goal: a flat line does not collapse the scale');
});

edge('losing while goal is below (good direction)', {data:gen('2026-06-14',30,i=>78-i*0.05), goal:74, today:'2026-07-13'}, t=>{
  ok(t.els['wtDelta']._cls.has('good'), 'cutting toward a lower goal reads as good');
});
edge('gaining while goal is below (wrong direction)', {data:gen('2026-06-14',30,i=>70+i*0.05), goal:68, today:'2026-07-13'}, t=>{
  ok(t.els['wtDelta']._cls.has('off'), 'gaining away from a lower goal reads as off');
});
edge('gaining toward a higher goal (good)', {data:gen('2026-06-14',30,i=>70+i*0.05), goal:75, today:'2026-07-13'}, t=>{
  ok(t.els['wtDelta']._cls.has('good'), 'bulking toward a higher goal reads as good — the old page painted this amber');
});

edge('imperial units', {data:gen('2026-06-14',30,i=>155+Math.sin(i)*1.5), goal:null, units:'lb', today:'2026-07-13'}, t=>{
  ok(t.els['wtUnit'].textContent==='lb', 'lb: unit label follows the profile');
  ok(/lb/.test(t.els['wtDelta'].textContent), 'lb: trend rate carries the unit');
});

edge('narrow width phone', {data:REALDATA, goal:72, today:'2026-07-13', w:330}, t=>{
  ok(t.els['wtSvg'].getAttribute('viewBox')==='0 0 330 214', 'narrow: viewBox follows the real width');
  const xs=[...t.chart().matchAll(/class="wt-daily" cx="([\d.]+)"/g)].map(m=>parseFloat(m[1]));
  ok(Math.min(...xs)>=34 && Math.max(...xs)<=330-14+0.01, 'narrow: every point stays inside the plot');
});

edge('reduced motion', {data:REALDATA, goal:72, today:'2026-07-13', reduce:true}, t=>{
  ok(/class="wt-line"/.test(t.chart()), 'reduced motion: chart still fully drawn');
});

edge('duplicate + out-of-order + junk rows', {data:[
  {dateKey:'2026-07-13',weight:70.4,ts:3},{dateKey:'2026-07-11',weight:70.0,ts:1},
  {dateKey:'2026-07-12',weight:70.2,ts:2},{dateKey:'2026-07-10',weight:'bad',ts:1},
  null,{weight:70},{dateKey:'2026-07-09',weight:69.8,ts:1}
], goal:72, today:'2026-07-13'}, t=>{
  ok((t.chart().match(/class="wt-daily"/g)||[]).length===4, 'junk: only the 4 valid rows plotted');
  ok(t.els['wtNum'].textContent==='70.4', 'junk: newest valid row is the hero');
});

console.log('\n── DATA SAFETY ────────────────────────────');
const t2=run({data:REALDATA, goal:72, today:'2026-07-13'});
const after=JSON.parse(t2.store['po_coach_weights']);
ok(after.length===149, 'rendering never adds or drops a weigh-in');
ok(JSON.stringify(after)===JSON.stringify(REALDATA.slice().sort((a,b)=>a.dateKey.localeCompare(b.dateKey))), 'weigh-in rows are byte-identical after render');
ok(!('goals_outcomes_v1' in t2.store) || t2.store['goals_outcomes_v1']===JSON.stringify([{id:'og-weight',type:'bodyweight',target:72,unit:'kg'}]), 'the goals row is only ever read, never written');
ok(Object.keys(t2.store).length===2, 'render writes no new localStorage keys (got '+Object.keys(t2.store).join(',')+')');

console.log('\n'+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
