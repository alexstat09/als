// scripture.html — page→book detection, coverage math, streak, seed integrity.
// Extracts the inline <script>, stubs a DOM + localStorage, drives it in a vm.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'scripture.html'), 'utf8');
let pass = 0, fail = 0;
function ok(cond, msg){ if(cond){ pass++; } else { fail++; console.error('  ✗ ' + msg); } }

// ── minimal DOM stub ──
function makeEl(){
  const el = {
    _html:'', style:{}, dataset:{}, classList:{ _s:new Set(),
      add(){ [].forEach.call(arguments,c=>this._s.add(c)); }, remove(){ [].forEach.call(arguments,c=>this._s.delete(c)); },
      toggle(c,f){ if(f===undefined) f=!this._s.has(c); f?this._s.add(c):this._s.delete(c); return f; }, contains(c){ return this._s.has(c); } },
    children:[], value:'', textContent:'',
    set innerHTML(v){ this._html=String(v); }, get innerHTML(){ return this._html; },
    setAttribute(k,v){ this[k]=v; }, getAttribute(k){ return this[k]; }, removeAttribute(){},
    addEventListener(){}, appendChild(){}, querySelector(){ return makeEl(); }, querySelectorAll(){ return []; },
    closest(){ return null; }, scrollIntoView(){}, focus(){},
    showModal(){ this.open=true; }, close(){ this.open=false; }, open:false
  };
  return el;
}
const els = {};
function el(id){ if(!els[id]) els[id]=makeEl(); return els[id]; }

const store = {};
const localStorage = {
  getItem:(k)=> k in store ? store[k] : null,
  setItem:(k,v)=>{ store[k]=String(v); },
  removeItem:(k)=>{ delete store[k]; },
  key:(i)=> Object.keys(store)[i], get length(){ return Object.keys(store).length; }
};

const listeners = {};
const document = {
  getElementById: el,
  querySelector: (sel)=> el('__'+sel),
  addEventListener:(t,fn)=>{ (listeners[t]=listeners[t]||[]).push(fn); },
  hidden:false
};
const sandbox = {
  document, localStorage, window:{ ALSProfile:null },
  performance:{ now:()=>0 }, requestAnimationFrame:()=>{}, setTimeout:()=>{}, setInterval:()=>{},
  console, Date, Math, JSON, parseInt, parseFloat, String, Number, Array, Object, isNaN
};
sandbox.window.addEventListener = ()=>{};
sandbox.window.initCloudSync = ()=>{};

// pull the FIRST inline <script> that contains the canon (the main IIFE)
const scripts = html.match(/<script>[\s\S]*?<\/script>/g) || [];
const main = scripts.find(s => s.includes('var BIBLE') );
ok(!!main, 'found the main inline script');
const code = main.replace(/^<script>/,'').replace(/<\/script>$/,'');

// expose internals for assertions by appending a hook
const hook = code.replace('window._scriptureRerender=function(){ render(); };',
  'window.__t={ bookOf:bookOf, coverage:coverage, computeStreak:computeStreak, weekDays:weekDays, position:position, sessions:sessions, seedData:seedData, BIBLE:BIBLE, CANON_TOTAL:CANON_TOTAL }; window._scriptureRerender=function(){ render(); };');

vm.createContext(sandbox);
try { vm.runInContext(hook, sandbox); }
catch(e){ fail++; console.error('  ✗ script threw: ' + e.message); }
// fire DOMContentLoaded so seed wiring is defined (no profile → fallback path only via setTimeout, which is stubbed)
(listeners['DOMContentLoaded']||[]).forEach(fn=>{ try{ fn(); }catch(e){} });

const T = sandbox.window.__t;
if(T){
  // ── page → book detection ──
  ok(T.bookOf(1)===null, 'page 1 is before Genesis (null)');
  ok(T.bookOf(2).en==='Genesis', 'page 2 → Genesis');
  ok(T.bookOf(1455).en==='John', 'page 1455 → John (his first reading)');
  ok(T.bookOf(1481).en==='John', 'page 1481 → still John');
  ok(T.bookOf(837).en==='Proverbs', 'page 837 → Proverbs (his ΠΡΜ pages, the 828 fix)');
  ok(T.bookOf(853).en==='Proverbs', 'page 853 → Proverbs');
  ok(T.bookOf(722).en==='Psalms', 'page 722 → Psalms');
  ok(T.bookOf(827).en==='Psalms', 'page 827 → last page before Proverbs is still Psalms');
  ok(T.bookOf(1692).en==='Revelation', 'page 1692 → Revelation');
  ok(T.bookOf(1722).en==='Revelation', 'last scripture page → Revelation');
  ok(T.bookOf(9999)===null, 'page past the maps → null');

  // ── canon integrity: 66 books, contiguous, no overlaps ──
  ok(T.BIBLE.length===66, '66 books total');
  ok(T.BIBLE.filter(b=>b.t==='OT').length===39, '39 OT books');
  ok(T.BIBLE.filter(b=>b.t==='NT').length===27, '27 NT books');
  let contiguous=true, ends=true;
  for(let i=0;i<T.BIBLE.length;i++){ const b=T.BIBLE[i];
    if(b.end<b.p) ends=false;
    if(i>0 && b.p!==T.BIBLE[i-1].end+1) contiguous=false;
  }
  ok(ends, 'every book ends on/after its start');
  ok(contiguous, 'books tile the page range with no gaps/overlaps');
  const abset = new Set(T.BIBLE.map(b=>b.ab));
  ok(abset.size===66, 'all 66 abbreviations are unique');

  // ── coverage math ──
  store['bible:sessions'] = JSON.stringify([
    { id:'a', ts:1, kind:'read', date:'2026-03-18', from:1455, to:1460, book:'John' },
    { id:'b', ts:2, kind:'read', date:'2026-03-19', from:1459, to:1462, book:'John' }, // overlaps a
    { id:'c', ts:3, kind:'reflect', date:'2026-03-20', title:'video' }                  // not counted in pages
  ]);
  let cov = T.coverage();
  ok(cov.pagesRead === (1462-1455+1), 'overlapping ranges merge (1455–1462 = 8 pages)');
  ok(cov.booksTouched===1, 'one book touched (John)');
  ok(cov.perBook['John'].got===8, 'John has 8 pages read');
  ok(cov.booksDone===0, 'John not finished');

  // clamps out-of-range pages, ignores reversed handled at save (here from<=to)
  store['bible:sessions'] = JSON.stringify([{ id:'x', ts:1, kind:'read', date:'2026-05-01', from:722, to:827, book:'Psalms' }]);
  cov = T.coverage();
  ok(cov.perBook['Psalms'].got===106, 'Psalms 722–827 = 106 pages');

  // a fully-covered short book counts as done
  const rev = T.BIBLE.find(b=>b.en==='Revelation');
  store['bible:sessions'] = JSON.stringify([{ id:'r', ts:1, kind:'read', date:'2026-06-01', from:rev.p, to:rev.end, book:'Revelation' }]);
  cov = T.coverage();
  ok(cov.perBook['Revelation'].done===true, 'reading a whole book start→end marks it done');
  ok(cov.booksDone===1, 'booksDone counts it');

  // ── streak: consecutive days, reflection days count ──
  const y=(n)=>{ const d=new Date(); d.setDate(d.getDate()-n); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); };
  store['bible:sessions'] = JSON.stringify([
    { id:'d0', ts:1, kind:'read', date:y(0), from:100, to:101, book:'Exodus' },
    { id:'d1', ts:1, kind:'reflect', date:y(1), title:'thought' },
    { id:'d2', ts:1, kind:'read', date:y(2), from:102, to:103, book:'Exodus' }
  ]);
  ok(T.computeStreak()===3, 'streak = 3 consecutive days (reflection day counts)');
  store['bible:sessions'] = JSON.stringify([{ id:'d2', ts:1, kind:'read', date:y(2), from:1,to:2 }]);
  ok(T.computeStreak()===0, 'a 2-day gap breaks the streak to 0');
  store['bible:sessions'] = JSON.stringify([{ id:'y1', ts:1, kind:'read', date:y(1), from:1,to:2 }]);
  ok(T.computeStreak()===1, 'yesterday-only (today empty) keeps a live streak of 1');

  // ── seed integrity (his notebook) ──
  const seed = T.seedData();
  ok(seed.length===27, 'seed has all 27 notebook entries');
  const ids = new Set(seed.map(s=>s.id));
  ok(ids.size===seed.length, 'seed ids are all unique (no sync duplication)');
  ok(seed.every(s=>s.id.indexOf('seed_')===0), 'seed ids are stable/prefixed');
  const reads = seed.filter(s=>s.kind!=='reflect');
  ok(reads.every(s=>s.book===T.bookOf(s.from).en), 'every seeded reading resolves to the right book');
  ok(seed.filter(s=>s.kind==='reflect').length===2, 'two reflection days (video + denominations)');
  // seed coverage sanity
  store['bible:sessions'] = JSON.stringify(seed);
  cov = T.coverage();
  ok(cov.booksTouched===2, 'seed touches exactly John + Proverbs');
  ok(cov.perBook['John'].got>0 && cov.perBook['Proverbs'].got>0, 'both John and Proverbs have pages');
  ok(cov.pagesRead>0 && cov.pagesRead<T.CANON_TOTAL, 'seed pages within the canon total');
} else {
  fail++; console.error('  ✗ internals not exposed');
}

console.log('scripture.test.js — ' + pass + ' passed, ' + fail + ' failed');
if(fail){ process.exit(1); }
