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
  const steps=['-0.1','0.1'].map(v=>{ const e=makeEl('step'+v); e._attr['data-wstep']=v; return e; });
  const document={ getElementById:get,
    querySelector:sel=>sel==='[data-wrange].active'?(pills.find(p=>p._cls.has('active'))||null):get('q:'+sel),
    querySelectorAll:sel=>sel==='[data-wrange]'?pills:sel==='[data-wstep]'?steps:[],
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
  return { els, store, threw, pills, steps, get,
    type:v=>{ els['wtInput'].value=String(v); els['wtInput']._h.input.call(els['wtInput']); },
    press:i=>steps[i]._h.click(),
    /* Drive the delegated history handler with a synthetic row. */
    tapRow:()=>{
      const row={ _cls:new Set(['wt-history-row']) };
      row.classList={ add:c=>row._cls.add(c), remove:c=>row._cls.delete(c), contains:c=>row._cls.has(c) };
      row.closest=sel=>sel==='[data-wrow]'?row:null;
      const ev={ target:{ closest:sel=>sel==='[data-wrow]'?row:null } };
      els['wtHistory']._h.click.call({ querySelectorAll:()=>[] }, ev);
      return row;
    },
    tapEdit:key=>{
      let edited=null;
      const btn={ getAttribute:()=>key, closest:sel=>sel==='[data-wedit]'?btn:null };
      const row={ _cls:new Set(), classList:{ add:c=>row._cls.add(c), remove:()=>{}, contains:c=>row._cls.has(c) } };
      const ev={ target:{ closest:sel=>sel==='[data-wedit]'?btn:(sel==='[data-wrow]'?row:null) } };
      els['wtHistory']._h.click.call({ querySelectorAll:()=>[] }, ev);
      return { rowOpened:row._cls.has('open') };
    },
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

console.log('\n── THE LOGGING RITUAL ─────────────────────');
{
  const t=run({data:REALDATA, goal:72, today:'2026-07-13'});
  ok(!t.threw, 'ritual: no throw');
  const last=REALDATA.slice().sort((a,b)=>a.dateKey.localeCompare(b.dateKey)).pop().weight;

  ok(t.els['wtInput'].placeholder===last.toFixed(1),
     'field ghosts his last reading ('+t.els['wtInput'].placeholder+' vs '+last.toFixed(1)+')');
  ok(t.els['wtInput'].value==='', 'field is EMPTY, never pre-filled — a stale number must not be committable by one tap');
  ok(/Logging for today/.test(t.els['wtWhen'].textContent), 'says which day it will log (got: '+t.els['wtWhen'].textContent+')');
  ok(!t.els['wtWhen']._cls.has('other'), 'today is not flagged as another day');
  /* the default lives in the markup, and nothing on boot un-hides it */
  ok(/id="wtDateRow"[^>]*class="wt-date-row hidden"|class="wt-date-row hidden"[^>]*id="wtDateRow"/.test(HTML),
     'the date picker ships folded away');
  ok(t.els['wtDateRow']===undefined, 'and boot never touches it, so it stays folded');
  ok(t.els['wtFeedback'].textContent==='', 'no feedback before he types');

  /* steppers */
  t.press(1);
  ok(t.els['wtInput'].value===(last+0.1).toFixed(1), '+ seeds from his last reading → '+t.els['wtInput'].value);
  t.press(1);
  ok(t.els['wtInput'].value===(last+0.2).toFixed(1), '+ again steps by 0.1 → '+t.els['wtInput'].value);
  t.press(0); t.press(0); t.press(0);
  ok(t.els['wtInput'].value===(last-0.1).toFixed(1), '− steps back down → '+t.els['wtInput'].value);
  ok(!/NaN|undefined/.test(t.els['wtInput'].value), 'stepper never produces NaN');

  const t2=run({data:[], goal:null, today:'2026-07-13'});
  t2.press(1);
  ok(t2.els['wtInput'].value==='70.1', 'stepper on an EMPTY log falls back to a sane 70 (got '+t2.els['wtInput'].value+')');

  /* live feedback */
  const t3=run({data:REALDATA, goal:72, today:'2026-07-13'});
  /* Today (13th) is already logged at 70.4, so the day BEFORE it — the 12th at
     70.6 — is the correct reference. Comparing today against itself would say
     nothing. */
  t3.type('70.8');
  ok(/from 70\.6 kg/.test(t3.els['wtFeedback'].textContent), 'feedback compares to the previous DAY, not to today\'s own entry (got: '+t3.els['wtFeedback'].textContent+')');
  ok(/\+0\.2 kg/.test(t3.els['wtFeedback'].textContent), 'feedback states the delta');
  ok(!t3.els['wtFeedback']._cls.has('warn'), 'a normal 0.2 kg move is not flagged');
  t3.type('70.6');
  ok(/No change/.test(t3.els['wtFeedback'].textContent), 'an identical reading says so');
  t3.type('74.0');
  ok(t3.els['wtFeedback']._cls.has('warn'), '+3.6 kg overnight IS flagged against his own 0.34 kg typical swing');
  ok(/Double-check/.test(t3.els['wtFeedback'].textContent), 'the flag tells him what to do');
  t3.type('704');
  ok(t3.els['wtFeedback']._cls.has('bad'), 'a fat-fingered 704 is caught before saving');
  t3.type('7.04');
  ok(t3.els['wtFeedback']._cls.has('warn'), 'a fat-fingered 7.04 is flagged too');
  t3.type('');
  ok(t3.els['wtFeedback'].textContent==='', 'clearing the field clears the feedback');
  ok(!t3.els['wtFeedback']._cls.has('warn') && !t3.els['wtFeedback']._cls.has('bad'), 'and clears its colour');

  /* editing a past day must announce itself */
  const t4=run({data:REALDATA, goal:72, today:'2026-07-13'});
  t4.els['wtHistory']._h.click.call({ querySelectorAll:()=>[] },
    { target:{ closest:sel=>sel==='[data-wedit]'?{ getAttribute:()=>'2026-06-20' }:null } });
  ok(t4.els['wtDateInput'].value==='2026-06-20', 'editing a past day selects that date');
  ok(!t4.els['wtDateRow']._cls.has('hidden'), 'and reveals the date picker');
  ok(/Sat Jun 20/.test(t4.els['wtWhen'].textContent), 'and names the day in words (got: '+t4.els['wtWhen'].textContent+')');
  ok(t4.els['wtWhen']._cls.has('other'), 'and flags that it is not today');
  ok(/Fix this weigh-in/.test(t4.els['wtAsk'].textContent), 'and the prompt changes from asking to fixing');
  ok(t4.els['wtInput'].value==='71.2', 'and loads that day\'s real value (got '+t4.els['wtInput'].value+')');

  /* row tap reveals actions; the Edit button must not be swallowed by it */
  const t5=run({data:REALDATA, goal:72, today:'2026-07-13'});
  const row=t5.tapRow();
  ok(row._cls.has('open'), 'tapping a row opens it');
  ok(!t5.tapEdit('2026-06-20').rowOpened, 'tapping Edit inside a row does NOT merely toggle the row');
  ok(t5.els['wtDateInput'].value==='2026-06-20', 'tapping Edit actually edits');
}

console.log('\n── THE HISTORY LIST ───────────────────────');
{
  const t=run({data:REALDATA, goal:72, today:'2026-07-13'});
  const h=t.els['wtHistory'].innerHTML;
  ok((h.match(/data-wrow=/g)||[]).length===149, 'every row is tappable (got '+(h.match(/data-wrow=/g)||[]).length+')');
  ok((h.match(/wt-row-pos/g)||[]).length===149, 'every row carries a position marker');
  ok((h.match(/wt-row-chev/g)||[]).length===149, 'every row shows there is more behind it');
  ok((h.match(/data-wedit=/g)||[]).length===149 && (h.match(/data-wdel=/g)||[]).length===149,
     'edit + delete survive for every entry — hidden by CSS, never removed');
  ok(/>Delete</.test(h), 'delete is a word now, not a bare glyph');

  /* the marker must actually encode the weight */
  const fracs=[...h.matchAll(/wt-row-pos" style="left:calc\(12px \+ \(100% - 24px\) \* ([\d.]+)\)/g)].map(m=>parseFloat(m[1]));
  ok(fracs.length===149, 'a fraction for every row');
  ok(fracs.every(f=>f>=0 && f<=1), 'every fraction is inside 0..1');
  ok(fracs.some(f=>f===0) && fracs.some(f=>f===1), 'each month pins its own lowest to 0 and highest to 1');
  /* July 2026: rows are newest-first, weights 70.4(13th) .. and the month min/max */
  const july=REALDATA.filter(e=>e.dateKey.slice(0,7)==='2026-07');
  const jw=july.map(e=>e.weight), jmn=Math.min(...jw), jmx=Math.max(...jw);
  const expected=((july.find(e=>e.dateKey==='2026-07-13').weight-jmn)/(jmx-jmn)).toFixed(3);
  ok(fracs[0]===parseFloat(expected), 'the newest row\'s marker matches its place in July ('+fracs[0]+' vs '+expected+')');

  /* a flat month must not divide by zero */
  const flat=[]; const d=new Date('2026-07-01T12:00:00');
  for(let i=0;i<10;i++){ flat.push({dateKey:d.toISOString().slice(0,10),weight:70,ts:1}); d.setDate(d.getDate()+1); }
  const t6=run({data:flat, goal:72, today:'2026-07-13'});
  const f6=[...t6.els['wtHistory'].innerHTML.matchAll(/\* ([\d.]+)\)/g)].map(m=>parseFloat(m[1]));
  ok(f6.length===10 && f6.every(f=>f===0.5), 'a month with zero variation centres every marker instead of NaN');
  ok(!/NaN/.test(t6.els['wtHistory'].innerHTML), 'no NaN in a flat month');
}

console.log('\n── CSS CONTRACT (constraint 11) ───────────');
{
  /* A class toggled from JS but defined nowhere fails SILENTLY — the exact
     bug that left Home's arc band permanently lit. Every class this page
     switches on must resolve in its own <style> or in aurora.css. */
  const STYLE=HTML.match(/<style>([\s\S]*?)<\/style>/)[1];
  const AURORA=fs.readFileSync('/Users/alexstathatos/ALS DASHBOARD ALL FILES/als/aurora.css','utf8');
  const CSS=STYLE+'\n'+AURORA;
  const toggled=new Set();
  for(const m of SRC.matchAll(/classList\.(?:add|remove|toggle)\(([^)]*)\)/g)){
    for(const q of m[1].matchAll(/'([A-Za-z][\w-]*)'/g)) toggled.add(q[1]);
  }
  /* classes emitted inside generated markup */
  for(const m of SRC.matchAll(/class="([^"'{}]*?)"/g)){
    for(const c of m[1].trim().split(/\s+/)) if(c) toggled.add(c);
  }
  ok(toggled.size>15, 'found the page\'s class vocabulary ('+toggled.size+' names)');
  const missing=[...toggled].filter(c=>!new RegExp('\\.'+c.replace(/[-]/g,'\\-')+'(?![\\w-])').test(CSS));
  ok(missing.length===0, 'every JS-toggled class is defined in CSS — missing: '+missing.join(', '));

  /* the specific rules this redesign depends on */
  const need=[
    [/\.wt-history-row\.open[\s\S]{0,120}?\.wt-history-edit-wrap\s*\{[^}]*display:\s*flex/, 'opening a row reveals its actions'],
    [/\.wt-history-edit-wrap\s*\{[^}]*display:\s*none/, 'and they are hidden until then'],
    [/\.wt-history-val\s*\{[^}]*white-space:\s*nowrap/, 'the weight can never wrap onto two lines'],
    [/\.wt-history-date\s*\{[^}]*text-overflow:\s*ellipsis/, 'only the date gives up room'],
    [/\.wt-history-row\.open\s+\.wt-history-delta\s*\{[^}]*display:\s*none/, 'the delta yields to the actions'],
    [/\.wt-row-pos\s*\{[^}]*position:\s*absolute/, 'the position marker is positioned'],
    [/\.wt-chart\s*\{[^}]*touch-action:\s*pan-y/, 'the chart lets a vertical drag scroll the page'],
    [/\.wt-pill-ind\s*\{[^}]*transition:\s*transform[^;}]*;/, 'the range pill animates transform only'],
    [/\.wt-whisk\s*\{/, 'the tether to the trend is styled'],
    [/\.wt-feedback\.warn\s*\{/, 'the warn state is styled'],
    [/\.wt-feedback\.bad\s*\{/, 'the bad state is styled'],
    [/\.wt-when\.other\s*\{/, 'a non-today date is styled']
  ];
  for(const [re,label] of need) ok(re.test(STYLE), label);
  ok(!/\.wt-thread\b/.test(STYLE), 'the second competing line is gone from CSS');
  ok(!/wt-thread/.test(SRC), 'and gone from the JS');
  ok(!/wt-band\b/.test(SRC), 'the old envelope band is fully removed, not just unused');
}

console.log('\n── DATA SAFETY ────────────────────────────');
const t2=run({data:REALDATA, goal:72, today:'2026-07-13'});
const after=JSON.parse(t2.store['po_coach_weights']);
ok(after.length===149, 'rendering never adds or drops a weigh-in');
ok(JSON.stringify(after)===JSON.stringify(REALDATA.slice().sort((a,b)=>a.dateKey.localeCompare(b.dateKey))), 'weigh-in rows are byte-identical after render');
ok(!('goals_outcomes_v1' in t2.store) || t2.store['goals_outcomes_v1']===JSON.stringify([{id:'og-weight',type:'bodyweight',target:72,unit:'kg'}]), 'the goals row is only ever read, never written');
ok(Object.keys(t2.store).length===2, 'render writes no new localStorage keys (got '+Object.keys(t2.store).join(',')+')');

console.log('\n'+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
