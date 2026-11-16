/* sleep.html (als-v758 — the approved «one ruler» redesign) — DATA SAFETY first.
   A · STATIC: every function that scores, reads or WRITES a night is
       byte-identical to the last page before the redesign (97210b6), and so is
       the whole sync / Garmin-inbox block. The redesign is view only.
   B · DRIVEN in real Chrome with every network and sync script removed
       (σταθ. 8/19: plain string containment on the src= context), the clock
       frozen, the data seeded: renders clean on his shape, her watch night,
       an empty account and a sleep in progress; every control still writes
       exactly what it wrote before; a reload writes nothing. */
const fs=require('fs'), path=require('path'), os=require('os'), cp=require('child_process');
const REPO=path.resolve(__dirname,'..');
const HTML=fs.readFileSync(path.join(REPO,'sleep.html'),'utf8');
const CSS=[...HTML.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
const SRC=[...HTML.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
let pass=0, fail=0;
function ok(c,m){ if(c) pass++; else { fail++; console.log('  ✗ '+m); } }

/* ════════════════ A · STATIC ════════════════ */
console.log('── A · THE ENGINE AND EVERY WRITE PATH ARE UNTOUCHED ──');
const BASE='97210b6';
let OLD=null; try{ OLD=cp.execSync('git show '+BASE+':sleep.html',{cwd:REPO,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
ok(!!OLD, 'can read the pre-redesign page from git ('+BASE+')');
function block(src,marker){
  const i=src.indexOf(marker); if(i<0) return null;
  let j=src.indexOf('{',i), d=0;
  for(let k=j;k<src.length;k++){ if(src[k]==='{') d++; else if(src[k]==='}'){ d--; if(!d) return src.slice(i,k+1); } }
  return null;
}
const SAME=['pad','dateKey','today','ls','lsSave','esc','clamp','getLogs','entryFor','todayEntry','calcHours','fmtHM','durScore','effScore',
  'inBedHours','asleepHours','latencyOf','efficiencyOf','midMin','regularityScore','debtInfo','debtApply','debtScoreOf','recovery','verdictFor',
  'flashNote','recomputeDerived','rescoreAll','migrateSleepModel','setField','hm','getPending','goSleep','cancelSleep','wokeUp','getProfile',
  'saveProfile','targetBed','buzz','daysBetween','elapsedStr','recoveryOf','sleepInsights','fmtMins','watchHtml','feelPct','avgArr','divergence',
  'cafLogs','nutLogs','workouts','prevDay','avg','crossIndex','factorList','recScoreOf','tCrit','variance','welch','factorEffects',
  'consequences','socialJetlag','fmtMinDur','median','habits','projectNight','minToHM','scoreRgb','histNights','toggleTag','backfillScores',
  'protoIsOwner','applyProtoVisibility'];
if(OLD) SAME.forEach(n=>{ const a=block(OLD,'function '+n+'('), b=block(HTML,'function '+n+'('); ok(a&&b&&a===b, n+'() is byte-identical to '+BASE); });
if(OLD){
  ['window._sleepApplyWellness = function','var WATCH_FIELDS','var TAGS = [','var CHECK = [','var LATENCY','var LAT_LBL','var WAKES',"var KEY = 'sleep:logs'","var PEND = 'sleep:pending'","var SLEEP_MODEL_V"]
    .forEach(m=>{ const a=OLD.slice(OLD.indexOf(m), OLD.indexOf('\n', OLD.indexOf(m))), b=HTML.slice(HTML.indexOf(m), HTML.indexOf('\n', HTML.indexOf(m)));
      ok(OLD.indexOf(m)>=0 && a===b, 'unchanged: '+m); });
  ok(block(OLD,'window._sleepApplyWellness = function')===block(HTML,'window._sleepApplyWellness = function'), 'the Garmin merge (_sleepApplyWellness) is byte-identical');
  // the delegated writers for chips, pills and tags
  [".closest('.sl-chip')", ".closest('.sl-pill')", ".closest('.sl-tag')"].forEach(m=>{
    const grab=s=>{ const i=s.indexOf(m); const st=s.lastIndexOf('document.addEventListener', i); return block(s.slice(st), 'document.addEventListener'); };
    ok(grab(OLD)===grab(HTML), 'delegated writer for '+m+' is byte-identical');
  });
  // the whole sync + inbox tail
  const tail=s=>s.slice(s.indexOf('<!-- Cross-device cloud sync -->'));
  ok(tail(OLD)===tail(HTML), 'the sync / Garmin inbox / nova tail of the page is byte-identical');
  // boot order
  ok(/migrateSleepModel\(\);[^\n]*\n\s*backfillScores\(\);\n\s*renderAll\(\);/.test(HTML), 'boot order unchanged: migrate → backfill → render');
}
// target-save writes exactly the same fields as before
const ts=block(HTML,"else if (act === 'target-save')");
ok(ts && /prof\.wakeTime = wg\.value/.test(ts) && /prof\.floor = parseFloat\(fl\.value\) \|\| prof\.floor/.test(ts) && /prof\.ideal = parseFloat\(id\.value\) \|\| prof\.ideal/.test(ts)
  && /if \(prof\.ideal < prof\.floor \+ 0\.5\)/.test(ts) && /delete prof\.need/.test(ts) && /saveProfile\(prof\); editingTarget = false; rescoreAll\(\);/.test(ts), 'profile save writes the same three fields, same guard');
ok((HTML.match(/localStorage\.setItem\(/g)||[]).length===(OLD.match(/localStorage\.setItem\(/g)||[]).length, 'no new localStorage.setItem anywhere');
ok((HTML.match(/lsSave\(/g)||[]).length===(OLD.match(/lsSave\(/g)||[]).length, 'no new lsSave() call anywhere');
ok(!/localStorage\.clear|localStorage\.removeItem\((?!PEND)/.test(SRC), 'the page never clears a key (only the local pending bedtime, as before)');

console.log('\n── A · DESIGN CONTRACT ──');
ok(!/@media[^{]*min-width/.test(CSS), 'no min-width media query (σταθ. 51)');
ok(/dialog\.dlg:not\(\[open\]\)\{display:none;\}/.test(CSS) && !/dialog\.dlg\{[^}]*display:/.test(CSS), 'dialog display only when [open] (σταθ. 4)');
ok(/showModal\(\)/.test(SRC), 'modals are native <dialog> + showModal');
ok(/prefers-reduced-motion:reduce/.test(CSS) && /prefers-reduced-motion: reduce/.test(SRC), 'reduced motion in CSS and JS');
ok(!/page-motion\.js/.test(HTML), 'no observer that births content invisible (σταθ. 39)');
ok(/html\.anim \.rv\{opacity:0/.test(CSS) && !/^\s*\.rv\{[^}]*opacity:0/m.test(CSS), 'sections are visible by default; motion is opt-in');
ok(HTML.includes("'sleep.html': '#recBody .rec-score'") || fs.readFileSync(path.join(REPO,'hero-vt.js'),'utf8').includes("'sleep.html': '#recBody .rec-score'"), 'hero-vt target still named');
ok(/id="recBody"/.test(HTML) && /class="fig rec-score"/.test(HTML), '#recBody .rec-score exists for the travelling number');
const toggled=new Set(); for(const m of SRC.matchAll(/classList\.(?:add|toggle|remove)\('([a-z-]+)'/g)) toggled.add(m[1]);
toggled.forEach(c=>{ if(/^au-mood/.test(c)) return; ok(new RegExp('\\.'+c+'\\b').test(CSS), 'class .'+c+' toggled in JS exists in CSS (σταθ. 12)'); });
['sl-pill','sl-tag','sl-watch','sl-hyp-seg','sl-stage','sl-body'].forEach(c=>ok(new RegExp('\\.'+c+'\\b').test(CSS), '.'+c+' is styled'));
ok(/\.seg button\{/.test(CSS) && /\.fld input/.test(CSS), 'the chips and time inputs are styled through their containers');

/* ════════════════ B · DRIVEN ════════════════ */
const vk=path.join(REPO,'video-kit');
if(!fs.existsSync(path.join(vk,'node_modules','playwright'))){ ok(false,'Playwright missing in video-kit/'); console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(1); }
const { chromium }=require(require.resolve('playwright',{paths:[vk]}));
const STRIP=['src="water.js"','src="topbar.js"','src="vendor/supabase.min.js"','src="sync.js"','src="nova.js"','src="nova-coach.js','src="hero-vt.js"'];
let page_=HTML.split('\n').filter(l=>!STRIP.some(s=>l.includes(s))).join('\n');
ok(!STRIP.some(s=>page_.includes(s)) && !/<script[^>]+src=/.test(page_), 'harness: no sync/network script survives');
page_=page_.replace('<meta charset="UTF-8">','<meta charset="UTF-8"><base href="file://'+REPO+'/"><script>window.fetch=function(){return Promise.reject(new Error("harness"))};</script>');
const TMP=path.join(os.tmpdir(),'sl-harness-'+process.pid+'.html'); fs.writeFileSync(TMP,page_);

// His shape (school year): in bed 21:30–00:45, up 06:35–09:50, latency mostly <10, a few gaps,
// one MCP night with hours only, a morning check-in on some nights.
function his(){
  const out=[], beds=['22:30','22:30','21:30','22:34','21:35','23:01','23:04','23:20','00:00','21:41','22:12','23:02','22:50','23:07','00:44','23:02'];
  const ups =['08:08','06:49','07:25','07:06','06:35','07:15','08:23','08:30','09:40','07:20','07:01','09:29','07:06','08:01','09:48','07:01'];
  const d=new Date('2026-10-01T12:00:00Z'); let i=0;
  while(true){ const k=d.toISOString().slice(0,10); if(k>'2026-11-15') break;
    if(!['2026-10-09','2026-10-20','2026-11-10','2026-11-13','2026-11-14'].includes(k)){
      const e={id:'sl-'+k,ts:1,dateKey:k,bed:beds[i%16],wake:ups[i%16]};
      if(i%3){ e.latency=i%11===0?30:5; e.wakes=i%13===0?2:0; }
      if(i%4===0){ e.energy=4; e.mood=4; e.stress=2; e.soreness=1; e.quality=4; }
      if(k==='2026-10-15'){ delete e.bed; delete e.wake; e.hours=8.5; }
      out.push(e); }
    d.setUTCDate(d.getUTCDate()+1); i++; }
  return out;
}
const PROF={need:9,floor:8,ideal:9,wakeTime:'10:00'};
const RAW=e=>[e.dateKey,e.bed,e.wake,e.hours&&!e.bed?e.hours:'',e.latency,e.wakes,e.energy,e.mood,e.stress,e.soreness,e.quality,(e.tags||[]).join(),e.asleepMeasured,e.bedMeasured].join('|');

(async()=>{
const browser=await chromium.launch();
async function open(o){
  const ctx=await browser.newContext({ viewport:{width:o.w||1440,height:o.h||900}, hasTouch:(o.w||1440)<500 });
  await ctx.route('**/*', r=>{ const u=r.request().url(); (u.startsWith('file:')||/fonts\.(googleapis|gstatic)\.com/.test(u)) ? r.continue() : r.abort(); });
  const seed={}; if(o.logs) seed['sleep:logs']=JSON.stringify(o.logs); seed['sleep:profile']=JSON.stringify(o.prof||PROF); seed['sleep:modelv']='2';
  if(o.pending) seed['sleep:pending']=JSON.stringify({at:new Date(o.now).getTime()-3*3600e3});
  await ctx.addInitScript(({S,NOW})=>{
    if(!sessionStorage.getItem('__s')){ localStorage.clear(); for(const k in S) localStorage.setItem(k,S[k]); sessionStorage.setItem('__s','1'); }
    const D=Date; function F(...a){ if(!(this instanceof F)) return new D(NOW).toString(); return a.length?new D(...a):new D(NOW); }
    F.prototype=D.prototype; F.now=()=>NOW; F.UTC=D.UTC; F.parse=D.parse; window.Date=F;
  },{S:seed,NOW:new Date(o.now||'2026-11-15T21:00:00').getTime()});
  const page=await ctx.newPage(); const errs=[];
  page.on('pageerror',e=>errs.push(e.message)); page.on('console',m=>{ if(m.type()==='error'&&!/net::|harness|Failed to load/.test(m.text())) errs.push(m.text()); });
  await page.goto('file://'+TMP); await page.waitForTimeout(500);
  const logs=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sleep:logs')||'[]'));
  return { page, ctx, errs, logs };
}
const text=(p,s)=>p.evaluate(s=>{ const e=document.querySelector(s); return e?e.textContent:''; },s);

console.log('\n── B1 · HIS NIGHTS ──');
{
  const L=his(), t=await open({logs:L});
  for(const id of ['recBody','rulerBody','rulerSum','tnBody','checkBody','trendBody','consBody','dayBody','patBody','conBody','histBody','wakeAnchorBody']){
    const s=await text(t.page,'#'+id); ok(s.trim().length>20, '#'+id+' is painted');
    ok(!/undefined|NaN|Infinity|\[object/.test(s), '#'+id+' has clean text');
  }
  ok((await text(t.page,'#hdTitle')).startsWith('Asleep for'), 'head answers first: "Asleep for …"');
  { const ln=L.find(x=>x.dateKey==='2026-11-15'); ok((await text(t.page,'#novaSays')).includes('In bed '+ln.bed+', up '+ln.wake), 'lede states last night\'s times ('+ln.bed+' → '+ln.wake+')'); }
  ok(!/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u.test(await t.page.evaluate(()=>document.body.innerText)), 'no emoji anywhere on screen');
  const rows=await t.page.evaluate(()=>document.querySelectorAll('#slNg .nr').length);
  ok(rows===15, 'ruler: tonight + 14 nights ('+rows+')');
  ok(/no bed or wake time/.test(await text(t.page,'#rulerBody')) || !L.slice(-14).some(e=>!e.bed), 'an hours-only night says so instead of drawing nothing (σταθ. 10)');
  ok(await t.page.evaluate(()=>document.documentElement.scrollWidth)===1440, 'no sideways scroll at 1440');
  const after=await t.logs();
  ok(after.length===L.length && after.map(RAW).join(';')===L.map(RAW).join(';'), 'DATA SAFETY: every raw input survives the first render');
  // a reload must write nothing (backfill is idempotent)
  const snap=JSON.stringify(after); await t.page.reload(); await t.page.waitForTimeout(400);
  ok(JSON.stringify(await t.logs())===snap, 'DATA SAFETY: a reload writes nothing');

  // ── every control still writes what it wrote before ──
  await t.page.click('#hdActs [data-open="logDlg"]'); await t.page.waitForTimeout(150);
  ok(await t.page.evaluate(()=>document.getElementById('logDlg').open), 'Edit last night opens the log dialog');
  await t.page.click('#sleepBody .sl-chip[data-chip="latency"][data-val="30"]'); await t.page.waitForTimeout(100);
  let e=(await t.logs()).find(x=>x.dateKey==='2026-11-15');
  ok(e.latency===30, 'latency chip writes latency=30');
  await t.page.click('#sleepBody .sl-chip[data-chip="wakes"][data-val="1"]'); await t.page.waitForTimeout(100);
  e=(await t.logs()).find(x=>x.dateKey==='2026-11-15'); ok(e.wakes===1, 'wakes chip writes wakes=1');
  await t.page.click('#sleepBody .sl-chip[data-chip="wakes"][data-val="1"]'); await t.page.waitForTimeout(100);
  e=(await t.logs()).find(x=>x.dateKey==='2026-11-15'); ok(e.wakes===null, 'tapping the active chip clears it, as before');
  await t.page.fill('#slBed','23:40'); await t.page.waitForTimeout(100);
  e=(await t.logs()).find(x=>x.dateKey==='2026-11-15'); ok(e.bed==='23:40' && e.hours===calcH('23:40',e.wake), 'bed input writes bed and recomputes hours');
  ok(await t.page.evaluate(()=>!!document.getElementById('slBed')), 'the time input survives its own edit (no rebuild mid-pick)');
  await t.page.click('#logDlg [data-close="logDlg"]'); await t.page.waitForTimeout(100);
  ok(!(await t.page.evaluate(()=>document.getElementById('logDlg').open)), 'Done closes the dialog');
  await t.page.click('#checkBody .sl-pill[data-metric="energy"][data-val="2"]'); await t.page.waitForTimeout(100);
  e=(await t.logs()).find(x=>x.dateKey==='2026-11-15'); ok(e.energy===2, 'energy pip writes energy=2');
  await t.page.click('#checkBody .sl-tag[data-tag="alcohol"]'); await t.page.waitForTimeout(100);
  e=(await t.logs()).find(x=>x.dateKey==='2026-11-15'); ok((e.tags||[]).includes('alcohol'), 'tag toggles into tags[]');
  const planL=()=>t.page.evaluate(()=>parseFloat(document.querySelector('#slNg .nr.plan .nt i').style.left));
  const pl0=await planL();
  await t.page.click('#tnBody [data-tn="-60"]'); await t.page.waitForTimeout(100);
  ok(await planL() < pl0, 'picking an earlier bedtime moves tonight\'s plan left on the ruler');
  await t.page.click('[data-trange="0"]'); await t.page.waitForTimeout(100);
  ok(await t.page.evaluate(()=>document.querySelectorAll('#slCh path').length)===1, 'nights over time: exactly ONE trend line');
  await t.page.click('#histBody [data-night="2026-11-12"]'); await t.page.waitForTimeout(100);
  ok(/how it was built/.test(await text(t.page,'#histBody')), 'a night opens to its whole record');
  await t.page.click('#hdProf'); await t.page.waitForTimeout(100);
  await t.page.fill('#slWakeGoal','07:00'); await t.page.selectOption('#slIdeal','8.5');
  await t.page.click('#profDlg [data-sleep-act="target-save"]'); await t.page.waitForTimeout(200);
  const pr=await t.page.evaluate(()=>JSON.parse(localStorage.getItem('sleep:profile')));
  ok(pr.wakeTime==='07:00' && pr.ideal===8.5 && pr.floor===8 && !('need' in pr), 'profile save writes wake/floor/ideal and drops the legacy need');
  ok(!(await t.page.evaluate(()=>document.getElementById('profDlg').open)), 'profile dialog closes on save');
  const fin=await t.logs();
  ok(fin.length===L.length && fin.filter(x=>x.dateKey!=='2026-11-15').map(RAW).join(';')===L.filter(x=>x.dateKey!=='2026-11-15').map(RAW).join(';'), 'DATA SAFETY: nothing but the edited night changed raw inputs');
  ok(!t.errs.length, 'no JS errors ('+t.errs.join(' / ')+')');
  await t.ctx.close();
}
function calcH(b,w){ const x=b.split(':'),y=w.split(':'); let d=(+y[0]*60+ +y[1])-(+x[0]*60+ +x[1]); if(d<=0) d+=1440; return Math.round(d/60*100)/100; }

console.log('\n── B2 · PHONE (390) ──');
{
  const t=await open({logs:his(),w:390,h:844});
  ok(await t.page.evaluate(()=>document.documentElement.scrollWidth)===390, 'no sideways scroll at 390');
  const small=await t.page.evaluate(()=>{ const bad=[]; document.querySelectorAll('body *').forEach(n=>{ if(n.closest('dialog,[hidden],svg')) return; if(![...n.childNodes].some(c=>c.nodeType===3&&c.textContent.trim())) return; const r=n.getBoundingClientRect(); if(!r.width) return; const fs=parseFloat(getComputedStyle(n).fontSize); if(fs<11) bad.push(n.className+':'+fs); }); return bad; });
  ok(!small.length, 'no text under 11px on the phone ('+small.slice(0,5).join(', ')+')');
  const tiny=await t.page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>!b.closest('dialog,[hidden]')).filter(b=>{ const r=b.getBoundingClientRect(); return r.width&&r.height<38; }).map(b=>(b.id||b.className)+':'+Math.round(b.getBoundingClientRect().height)));
  ok(!tiny.length, 'every button is a real target on the phone ('+tiny.join(',')+')');
  ok(!t.errs.length, 'no JS errors on the phone');
  await t.ctx.close();
}

console.log('\n── B3 · HER WATCH NIGHT ──');
{
  const n={id:'sl-2026-11-15',ts:1,dateKey:'2026-11-15',asleepMeasured:7.2,bedMeasured:'23:10',wakeMeasured:'06:40',stages:{deep:60,light:250,rem:90,awake:12},
    hypno:[[0,30,'light'],[30,40,'deep'],[70,200,'light'],[270,60,'rem'],[330,12,'awake'],[342,100,'light']],restingHR:52,hrv:48,garminScore:81,awakeCount:1,measuredBy:'garmin'};
  const t=await open({logs:his().filter(e=>e.dateKey!=='2026-11-15').concat([n])});
  ok(!(await t.page.evaluate(()=>document.getElementById('watchSec').hidden)), 'the watch section appears when a watch measured');
  const w=await text(t.page,'#watchBody');
  ok(/23:10/.test(w) && /06:40/.test(w) && /Garmin scored this night 81/.test(w), 'it shows her measured window and Garmin\'s own number, apart');
  ok(await t.page.evaluate(()=>document.querySelectorAll('.sl-hyp-seg').length)===6, 'the hypnogram draws every stage');
  ok(/23:10/.test(await text(t.page,'#rulerBody')), 'the ruler places a watch-only night by its measured window');
  ok(!t.errs.length, 'no JS errors with a watch night');
  await t.ctx.close();
}

console.log('\n── B4 · EMPTY ACCOUNT · SLEEP IN PROGRESS ──');
{
  const t=await open({logs:[]});
  ok((await text(t.page,'#hdTitle')).includes('How did you'), 'empty: the head asks');
  ok(/line up here/.test(await text(t.page,'#rulerBody')), 'empty: the ruler says what will appear');
  ok(/Not yet/.test(await text(t.page,'#recBody')), 'empty: the score says not yet, not 0');
  ok(await t.page.evaluate(()=>document.getElementById('watchSec').hidden), 'empty: no watch section');
  ok(!t.errs.length, 'empty: no JS errors ('+t.errs.join(' / ')+')');
  await t.ctx.close();
  const p=await open({logs:his(),pending:true,now:'2026-11-16T02:00:00'});
  ok((await text(p.page,'#hdTitle')).startsWith('Asleep since'), 'pending: the head says asleep since');
  ok(await p.page.evaluate(()=>!!document.querySelector('#hdActs [data-sleep-act="woke"]')), 'pending: I woke up is the first action');
  await p.page.click('#hdActs [data-sleep-act="woke"]'); await p.page.waitForTimeout(150);
  const e=(await p.logs()).find(x=>x.dateKey==='2026-11-16');
  ok(e && e.bed==='23:00' && e.wake==='02:00', 'I woke up pairs the pending bedtime with now, as before');
  ok(await p.page.evaluate(()=>localStorage.getItem('sleep:pending')===null), 'and clears the pending bedtime');
  ok(!p.errs.length, 'pending: no JS errors');
  await p.ctx.close();
}

await browser.close(); fs.unlinkSync(TMP);
console.log('\n'+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
