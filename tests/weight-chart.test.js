/* weight.html (als-v662 — the approved Midnight design) driven in real Chrome.
   Every network and sync script is removed from the page before it loads
   (σταθ. 8/19: plain string containment on the src= context), the data is
   seeded per scenario and the clock is frozen. Covers all four ranges, the
   states his own data never reaches (empty, one, three, no goal, toward/away
   from a goal, a broken row, a full disk) and — first — DATA SAFETY: the
   storage functions are identical to als-v423, rendering never writes, and
   every write the page makes is exactly the one it was asked for. */
const fs=require('fs'), path=require('path'), os=require('os'), cp=require('child_process');
const REPO=path.resolve(__dirname,'..');
const HTML=fs.readFileSync(path.join(REPO,'weight.html'),'utf8');
const SRC=[...HTML.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n');
const CSS=[...HTML.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');

let pass=0, fail=0;
function ok(c,m){ if(c) pass++; else { fail++; console.log('  ✗ '+m); } }

/* ── his data ── The real log, if a device export is lying around; otherwise a
   stand-in with his shape: near-daily since 8 Feb, a few missed days, a climb to
   ~72 in April, a slide to ~66 by late September, flat since. */
const TODAY='2026-10-21';
function synth(){
  const out=[], d=new Date('2026-02-08T12:00:00Z'), miss=new Set(['2026-03-01','2026-03-02','2026-03-03','2026-03-04','2026-03-05','2026-03-06','2026-04-18','2026-07-19','2026-10-14']);
  for(let i=0;;i++){
    const k=d.toISOString().slice(0,10); if(k>'2026-10-20') break;
    const base= i<60 ? 69.6+i*0.042 : i<160 ? 72.1-(i-60)*0.019 : i<230 ? 70.2-(i-160)*0.065 : 65.9+((i*37)%7)/20;
    if(!miss.has(k)) out.push({ dateKey:k, weight:Math.round((base+((i*7919)%11-5)/22)*10)/10, ts:1 });
    d.setUTCDate(d.getUTCDate()+1);
  }
  return out;
}
let REAL=synth();
for(const f of [path.join(REPO,'..','BACKUPS','weights-fixture.json')]){
  try{ const a=JSON.parse(fs.readFileSync(f,'utf8')); if(Array.isArray(a)&&a.length>100){ REAL=a; console.log('  (fixture: '+f+')'); } }catch(e){}
}
const tOf=k=>Math.floor(Date.UTC(+k.slice(0,4),+k.slice(5,7)-1,+k.slice(8,10))/864e5);
function trendAt(rows,key){ const t=tOf(key); let s=0,n=0; rows.forEach(r=>{ const rt=tOf(r.dateKey); if(rt<=t&&rt>=t-6){ s+=r.weight; n++; } }); return n?s/n:null; }

/* ════════════════ A · STATIC: the storage path is untouched ════════════════ */
console.log('── A · STORAGE PATH (static) ─────────────');
const BASE='18729af';   // als-v423, the last weight.html before this redesign
let OLD=null; try{ OLD=cp.execSync('git show '+BASE+':weight.html',{cwd:REPO,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
ok(!!OLD, 'can read the als-v423 page from git ('+BASE+')');
function fnText(src,name){
  const i=src.indexOf('function '+name+'('); if(i<0) return null;
  let j=src.indexOf('{',i), depth=0;
  for(let k=j;k<src.length;k++){ if(src[k]==='{') depth++; else if(src[k]==='}'){ depth--; if(!depth) return src.slice(i,k+1).split('\n').map(l=>l.trim()).join('\n'); } }
  return null;
}
if(OLD) ['wtDateKey','wtParseKey','wtLoad','wtSave','parseWeight','wtGetSelectedDate','wtSaveEntry','wtDeleteEntry','dayNum','goalWeight','trendRate','isSteady','typicalSwing','monthlyAverages'].forEach(n=>{
  const a=fnText(OLD,n), b=fnText(HTML,n);
  ok(a && b && a===b, n+'() is identical to als-v423 (indentation aside)');
});
ok((HTML.match(/localStorage\.setItem\(/g)||[]).length===1, 'exactly ONE localStorage.setItem in the page');
ok(/function wtSave\(arr\)\{ try\{ localStorage\.setItem\(WT_KEY, JSON\.stringify\(arr\)\); \}catch\(e\)\{\} \}/.test(HTML), '…and it is wtSave(), writing po_coach_weights');
ok(!/localStorage\.removeItem|localStorage\.clear/.test(SRC), 'the page never removes or clears a key');
ok(!/goals_outcomes_v1['"]\s*,/.test(SRC.replace(/ls\('goals_outcomes_v1'\)/g,'')), 'goals_outcomes_v1 is only ever read');
ok(HTML.includes('<script src="vendor/supabase.min.js"></script>') && HTML.includes('<script src="pocoach-sync.js?v=4"></script>'), 'sync wiring (supabase + pocoach-sync) is unchanged');
ok(/window\._weightRerender\s*=/.test(SRC), 'pocoach-sync\'s re-render hook still exists');
ok(!/alsconfirm/i.test(SRC.replace(/\/\*[\s\S]*?\*\//g,'')), 'delete no longer depends on ALSConfirm (σταθ. 56)');

console.log('\n── A · DESIGN CONTRACT (static) ──────────');
ok(!/preserveAspectRatio/.test(HTML), 'never preserveAspectRatio');
ok(!/@media[^{]*min-width/.test(CSS), 'no min-width media query');
ok(/#chart\{[^}]*touch-action:pan-y/.test(CSS), '#chart is touch-action:pan-y');
ok(/prefers-reduced-motion:reduce/.test(CSS) && /reduceMotion/.test(SRC), 'reduced motion in CSS and JS');
ok(CSS.includes('--bg:oklch(13.2% .022 258)'), 'Midnight ground');
ok(/Commissioner/.test(HTML)&&/Literata/.test(HTML)&&/JetBrains\+Mono/.test(HTML), 'Commissioner · Literata · JetBrains Mono');
ok(/\(first\.getDay\(\)\+6\)%7/.test(SRC), 'calendar is Monday-first ((getDay()+6)%7)');
// σταθ. 12: every class toggled from JS exists in CSS
const toggled=new Set(); for(const m of SRC.matchAll(/classList\.(?:add|toggle|remove)\('([a-z-]+)'/g)) toggled.add(m[1]);
toggled.forEach(c=>ok(new RegExp('\\.'+c+'\\b').test(CSS), 'class .'+c+' toggled in JS exists in CSS'));

/* ════════════════ B · DRIVEN in real Chrome ════════════════ */
const vk=path.join(REPO,'video-kit','package.json');
if(!fs.existsSync(path.join(REPO,'video-kit','node_modules','playwright'))){
  ok(false,'Playwright missing: run `npm i && npx playwright install chromium` in video-kit/');
  console.log('\n'+pass+' passed, '+fail+' failed'); process.exit(1);
}
const { chromium }=require(require.resolve('playwright',{paths:[path.dirname(vk)]}));
const STRIP=['src="water.js"','src="topbar.js"','src="vendor/supabase.min.js"','src="pocoach-sync.js','src="nova.js"','src="nova-coach.js'];
let page_=HTML.split('\n').filter(l=>!STRIP.some(s=>l.includes(s))).join('\n');
const survivors=STRIP.filter(s=>page_.includes(s));
ok(!survivors.length && !/<script[^>]+src=/.test(page_), 'harness: no sync/network script survives ('+survivors.join(',')+')');
page_=page_.replace('<meta charset="UTF-8">','<meta charset="UTF-8"><base href="file://'+REPO+'/">');
const TMP=path.join(os.tmpdir(),'wt-harness-'+process.pid+'.html'); fs.writeFileSync(TMP,page_);

(async()=>{
const browser=await chromium.launch();
async function open(o){
  o=o||{};
  const w=o.w||1440;
  const ctx=await browser.newContext({ viewport:{width:w,height:o.h||900}, hasTouch:w<500 });
  await ctx.route('**/*', r=>{ const u=r.request().url(); (u.startsWith('file:')||/fonts\.(googleapis|gstatic)\.com/.test(u)) ? r.continue() : r.abort(); });
  const seed={};
  if(o.raw!=null) seed.po_coach_weights=o.raw; else if(o.data) seed.po_coach_weights=JSON.stringify(o.data);
  if(o.goal!=null) seed.goals_outcomes_v1=JSON.stringify([{id:'og-weight',type:'bodyweight',target:o.goal,unit:'kg'}]);
  if(o.units) seed.po_coach_v1=JSON.stringify({units:o.units});
  await ctx.addInitScript(({S,NOW})=>{
    if(!sessionStorage.getItem('__seeded')){ localStorage.clear(); for(const k in S) localStorage.setItem(k,S[k]); sessionStorage.setItem('__seeded','1'); }
    const R=Date; function F(...a){ if(!(this instanceof F)) return new R(NOW).toString(); return a.length?new R(...a):new R(NOW); }
    F.prototype=R.prototype; F.now=()=>NOW; F.UTC=R.UTC; F.parse=R.parse; window.Date=F;
  },{S:seed,NOW:new Date(TODAY+'T09:00:00').getTime()});
  const page=await ctx.newPage(); const errs=[];
  page.on('pageerror',e=>errs.push(e.message)); page.on('console',m=>{ if(m.type()==='error'&&!/net::ERR/.test(m.text())) errs.push(m.text()); });
  await page.goto('file://'+TMP); await page.waitForTimeout(o.wait||400);
  return { page, ctx, errs, store:()=>page.evaluate(()=>{ const o={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); o[k]=localStorage.getItem(k); } return o; }) };
}
const txt=(p,sel)=>p.evaluate(s=>{ const e=document.querySelector(s); return e?e.textContent:null; },sel);
const vis=(p,sel)=>p.evaluate(s=>{ const e=document.querySelector(s); return !!e && !e.closest('[hidden]') && e.getBoundingClientRect().height>0; },sel);
const sorted=a=>a.slice().sort((x,y)=>x.dateKey.localeCompare(y.dateKey));

console.log('\n── B1 · RANGES on his data ───────────────');
{
  const t=await open({data:REAL});
  for(const r of ['7','30','91','0']){
    await t.page.click('.tabs button[data-r="'+r+'"]'); await t.page.waitForTimeout(150);
    const m=await t.page.evaluate(()=>{ const s=document.getElementById('chart'); const vb=s.viewBox.baseVal;
      return { trends:s.querySelectorAll('.c-trend').length, dots:s.querySelectorAll('.c-dot').length, ticks:[...s.querySelectorAll('.c-tick')].map(x=>x.textContent).filter(x=>/^\d+$/.test(x)).map(Number),
        vbw:vb.width, cw:Math.round(s.getBoundingClientRect().width), html:s.innerHTML, ro:document.getElementById('roD').textContent, pressed:document.querySelector('.tabs [aria-pressed="true"]').dataset.r }; });
    const name=r==='0'?'ALL':r==='91'?'3M':r+'D';
    const span=m.ticks.length?Math.max(...m.ticks)-Math.min(...m.ticks):0;
    console.log('  '+name.padEnd(4)+' dots='+String(m.dots).padEnd(4)+' ticks=['+m.ticks.join(' ')+'] '+m.ro);
    ok(m.pressed===r, name+': tab pressed');
    ok(m.trends===1, name+': exactly ONE trend line');
    ok(m.dots>=2, name+': mornings drawn');
    ok(span>=2, name+': y spans ≥3 kg of gridlines (whole-kg ticks span '+span+')');
    ok(Math.abs(m.vbw-m.cw)<=1, name+': 1 SVG unit = 1 CSS px ('+m.vbw+' vs '+m.cw+')');
    ok(!/NaN|undefined|Infinity/.test(m.html), name+': clean numbers');
  }
  const inView=REAL.filter(e=>tOf(e.dateKey)>tOf(TODAY)-30).length;
  await t.page.click('.tabs button[data-r="30"]'); await t.page.waitForTimeout(150);
  ok(await t.page.evaluate(()=>document.querySelectorAll('#chart .c-dot').length)===inView, '30D: one dot per weigh-in in the last 30 days ('+inView+')');
  ok((await txt(t.page,'#roD'))==='LAST 30 DAYS', '30D: readout names the period');
  ok(!t.errs.length, 'no JS errors ('+t.errs.join(' / ')+')');
  const st=await t.store();
  ok(st.po_coach_weights===JSON.stringify(REAL), 'DATA SAFETY: rendering + 4 range changes leave the weigh-ins byte-identical');
  ok(Object.keys(st).length===1, 'DATA SAFETY: rendering writes no new key ('+Object.keys(st).join(',')+')');
  await t.ctx.close();
}

console.log('\n── B2 · THE TREND is from the full history, by date ──');
{
  const t=await open({data:REAL});
  await t.page.click('.tabs button[data-r="7"]'); await t.page.waitForTimeout(150);
  // the first day on 7D must carry the trend of ITS 7 calendar days, not a warm-up from one sample
  const k0=new Date(tOf(TODAY)*864e5-6*864e5).toISOString().slice(0,10);
  await t.page.locator('#chart').scrollIntoViewIfNeeded();
  const b=await t.page.locator('#chart').boundingBox();
  await t.page.mouse.move(b.x+48, b.y+b.height/2);
  const ro=await t.page.evaluate(()=>({ d:document.getElementById('roD').textContent, tr:document.querySelector('#roB b').textContent }));
  const want=trendAt(REAL,k0).toFixed(1);
  ok(ro.tr===want, '7D first day trend = mean of its 7 calendar days ('+ro.d+': '+ro.tr+' vs '+want+')');
  await t.ctx.close();
  // a missed day widens the window instead of shifting it
  const gap=[{dateKey:'2026-10-10',weight:70,ts:1},{dateKey:'2026-10-11',weight:70,ts:1},{dateKey:'2026-10-12',weight:70,ts:1},{dateKey:'2026-10-16',weight:72,ts:1},{dateKey:'2026-10-20',weight:72,ts:1}];
  const g=await open({data:gap});
  const face=(await txt(g.page,'#wtFace')).replace('kg','');
  ok(face==='72.0', 'missed days: trend on 20 Oct uses only 14–20 Oct (got '+face+', index-based would say 71.2)');
  await g.ctx.close();
}

console.log('\n── B3 · HONEST SENTENCES ─────────────────');
{
  const flat=[]; for(let i=0;i<40;i++){ const d=new Date(tOf(TODAY)*864e5-(40-i)*864e5); flat.push({dateKey:d.toISOString().slice(0,10),weight:66+((i*7)%5-2)/10,ts:1}); }
  let t=await open({data:flat});
  let a=await txt(t.page,'#wtAnswer');
  ok(/holding steady/.test(a) && !/dropping|climbing/.test(a), 'flat data: "holding steady", no direction ('+a+')');
  ok(!/goal/i.test(a), 'no goal set: the sentence says nothing about a goal');
  ok(!(await t.page.$('#chart .c-goal')) && /Lowest/i.test(await txt(t.page,'#stats')), 'no goal: no goal line, stat falls back to Lowest');
  await t.ctx.close();
  const down=[]; for(let i=0;i<40;i++){ const d=new Date(tOf(TODAY)*864e5-(40-i)*864e5); down.push({dateKey:d.toISOString().slice(0,10),weight:Math.round((70-i*0.05+((i*7)%3-1)/20)*10)/10,ts:1}); }
  t=await open({data:down, goal:66});
  a=await txt(t.page,'#wtAnswer');
  ok(/dropping about/.test(a) && /to go/.test(a) && /reach it in (early|mid-|late) /.test(a), 'losing toward a lower goal: pace + distance + when ('+a+')');
  ok(!!(await t.page.$('#chart .c-goal')) && !!(await t.page.$('#chart .c-ahead')), 'goal line + the dashed continuation are drawn');
  ok(await t.page.evaluate(()=>!!document.querySelector('#chart .c-eta')||[...document.querySelectorAll('#chart .c-ahead-s')].some(x=>/≈/.test(x.textContent))), 'the ETA is marked on the chart');
  await t.ctx.close();
  t=await open({data:down, goal:72});
  a=await txt(t.page,'#wtAnswer');
  ok(/moving away from it/.test(a) && !/reach it/.test(a), 'losing while the goal is above: says so honestly ('+a+')');
  ok(!(await t.page.$('#chart .c-eta')), 'moving away: no ETA invented');
  await t.ctx.close();
  t=await open({data:REAL, goal:72});
  ok(await t.page.evaluate(()=>[...document.querySelectorAll('#chart .c-flag-t')].length===0), '30D: REACHED only appears when that day is in view');
  await t.page.click('.tabs button[data-r="0"]'); await t.page.waitForTimeout(150);
  ok(await t.page.evaluate(()=>[...document.querySelectorAll('#chart .c-flag-t')].some(x=>/^REACHED · \d+ [A-Z]{3}$/.test(x.textContent))), 'ALL: "REACHED · <date>" the first time the trend crossed the goal');
  ok(await t.page.evaluate(()=>document.querySelectorAll('.mo.goal').length>=1), 'month columns mark a month that met the goal');
  await t.ctx.close();
}

console.log('\n── B4 · EMPTY AND EARLY STATES ───────────');
{
  let t=await open({data:[]});
  ok((await txt(t.page,'#wtFace')).startsWith('—'), 'empty: face is an em dash');
  ok(/No weigh-ins yet/.test(await txt(t.page,'#wtAnswer')), 'empty: says what to do');
  ok(!(await vis(t.page,'#wtRuler')) && !(await vis(t.page,'#stats')) && !(await vis(t.page,'#chartCard')) && await vis(t.page,'#chartEmpty'), 'empty: ruler/stats/chart hidden, empty card shown');
  ok(!(await vis(t.page,'#wtAlarm')), 'empty is NOT shown as a read failure');
  ok(!t.errs.length, 'empty: no JS errors ('+t.errs.join(' / ')+')');
  await t.ctx.close();
  t=await open({data:REAL.slice(-1)});
  ok(/Early days: 1 morning/.test(await txt(t.page,'#wtAnswer')) && await vis(t.page,'#chartEmpty'), 'one weigh-in: early days, chart waits for a second');
  await t.ctx.close();
  t=await open({data:REAL.slice(-3)});
  ok(/Early days: 3 mornings/.test(await txt(t.page,'#wtAnswer')) && /needs a few more/.test(await txt(t.page,'#stats')) && await vis(t.page,'#chartCard'), 'three weigh-ins: line drawn, no pace claimed');
  ok(!t.errs.length, 'early: no JS errors');
  await t.ctx.close();
}

console.log('\n── B5 · CALENDAR reaches every weigh-in ──');
{
  const t=await open({data:REAL});
  ok(await t.page.evaluate(()=>document.querySelectorAll('#cal .day.blank').length)===3, 'October 2026 starts on Thursday: 3 leading blanks (Monday first)');
  const seen=new Set();
  for(let i=0;i<24;i++){
    (await t.page.evaluate(()=>[...document.querySelectorAll('#cal [data-day]')].filter(b=>b.querySelector('.w')&&/\d/.test(b.querySelector('.w').textContent)).map(b=>b.dataset.day))).forEach(k=>seen.add(k));
    if(await t.page.isDisabled('#calPrev')) break;
    await t.page.click('#calPrev');
  }
  ok(seen.size===REAL.length, 'paging back reaches every weigh-in ('+seen.size+'/'+REAL.length+')');
  ok(await t.page.isDisabled('#calPrev'), 'the back arrow stops at the first month');
  await t.ctx.close();
}

console.log('\n── B6 · WRITES: save, back-fill, edit, delete, undo ──');
{
  const t=await open({data:REAL});
  await t.page.fill('#wtInput','66.4'); await t.page.click('#wtSaveBtn'); await t.page.waitForTimeout(100);
  let after=JSON.parse((await t.store()).po_coach_weights);
  const want=sorted(REAL.concat([{dateKey:TODAY,weight:66.4}]));
  ok(after.length===REAL.length+1 && after.find(e=>e.dateKey===TODAY).weight===66.4, 'save: today stored as 66.4');
  ok(JSON.stringify(after.filter(e=>e.dateKey!==TODAY))===JSON.stringify(REAL), 'save: every other row untouched');
  ok(await vis(t.page,'#logDone') && /66\.4/.test(await txt(t.page,'#doneV')), 'save: card turns into "Today · logged"');
  await t.page.click('#wtEditBtn');
  ok((await t.page.inputValue('#wtInput'))==='66.4' && await vis(t.page,'#logForm'), 'Edit reopens with the saved value');
  await t.page.fill('#wtInput','66.2'); await t.page.click('#wtSaveBtn');
  after=JSON.parse((await t.store()).po_coach_weights);
  ok(after.length===REAL.length+1 && after.find(e=>e.dateKey===TODAY).weight===66.2, 'edit today: replaced, not duplicated');
  // back-fill a missed day from the calendar
  await t.page.click('#cal [data-day="2026-10-14"]'); await t.page.click('#calEdit [data-act="log"]');
  ok(/14 Oct/.test(await txt(t.page,'#wtWhen')), 'back-fill: the card names the day in words');
  await t.page.fill('#wtInput','66.0'); await t.page.click('#wtSaveBtn');
  after=JSON.parse((await t.store()).po_coach_weights);
  ok(after.find(e=>e.dateKey==='2026-10-14')?.weight===66.0 && after.length===REAL.length+2, 'back-fill: 14 Oct stored');
  ok((await t.page.inputValue('#wtDateInput'))===TODAY, 'after a back-fill the card returns to today');
  // edit a past day
  const past=REAL[REAL.length-5];
  await t.page.click('#cal [data-day="'+past.dateKey+'"]'); await t.page.click('#calEdit [data-act="edit"]');
  ok((await t.page.inputValue('#wtInput'))===past.weight.toFixed(1), 'edit past day: value loaded');
  await t.page.fill('#wtInput','64.9'); await t.page.click('#wtSaveBtn');
  after=JSON.parse((await t.store()).po_coach_weights);
  ok(after.find(e=>e.dateKey===past.dateKey).weight===64.9 && after.length===REAL.length+2, 'edit past day: changed in place');
  // delete: two steps
  const victim=REAL[REAL.length-2];
  await t.page.click('#cal [data-day="'+victim.dateKey+'"]');
  await t.page.click('#calEdit [data-act="del"]');
  after=JSON.parse((await t.store()).po_coach_weights);
  ok(after.some(e=>e.dateKey===victim.dateKey), 'delete: the FIRST tap deletes nothing');
  ok(/Tap again/.test(await txt(t.page,'#calEdit [data-act="del"]')), 'delete: first tap arms the button');
  await t.page.click('#calEdit [data-act="del"]');
  after=JSON.parse((await t.store()).po_coach_weights);
  ok(!after.some(e=>e.dateKey===victim.dateKey) && after.length===REAL.length+1, 'delete: the second tap removes exactly that day');
  ok(/Deleted/.test(await txt(t.page,'#calEdit')), 'delete: says what went, offers Undo');
  await t.page.click('#calEdit [data-act="undo"]');
  after=JSON.parse((await t.store()).po_coach_weights);
  const back=after.find(e=>e.dateKey===victim.dateKey);
  ok(back && back.weight===victim.weight && after.length===REAL.length+2, 'Undo brings the same weight back on the same day');
  ok(back && back.ts>1, 'Undo stamps a fresh ts (retires pocoach-sync\'s tombstone)');
  ok(!t.errs.length, 'writes: no JS errors ('+t.errs.join(' / ')+')');
  await t.ctx.close();
}

console.log('\n── B7 · GUARDS: a broken read pauses writes; a failed write says so ──');
{
  const raw=JSON.stringify(REAL.slice(0,-1).concat([{dateKey:'2026-10-20',weight:'66.5'}]));
  let t=await open({raw});
  ok(await vis(t.page,'#wtAlarm') && /Saving is paused/.test(await txt(t.page,'#wtAlarm')), 'unrecognised row: the page says so');
  ok(await t.page.isDisabled('#wtSaveBtn'), 'unrecognised row: Save is off');
  await t.page.evaluate(()=>{ document.getElementById('wtInput').value='66.1'; document.getElementById('wtSaveBtn').disabled=false; document.getElementById('wtSaveBtn').click(); });
  ok((await t.store()).po_coach_weights===raw, 'unrecognised row: even a forced Save leaves the stored text byte-identical');
  await t.ctx.close();
  t=await open({raw:'{not json'});
  ok(await vis(t.page,'#wtAlarm') && /couldn’t read/i.test(await txt(t.page,'#wtAnswer')), 'unreadable: "couldn’t read", never "no weigh-ins yet"');
  ok((await t.store()).po_coach_weights==='{not json', 'unreadable: nothing written over it');
  await t.ctx.close();
  t=await open({raw:JSON.stringify(REAL.concat([{dateKey:REAL[3].dateKey,weight:70,ts:2}]))});
  ok(await t.page.isDisabled('#wtSaveBtn'), 'a day stored twice: Save is off (a write would collapse it)');
  await t.ctx.close();
  t=await open({data:REAL});
  await t.page.evaluate(()=>{ const o=Storage.prototype.setItem; Storage.prototype.setItem=function(k,v){ if(k==='po_coach_weights') throw new DOMException('full','QuotaExceededError'); return o.call(this,k,v); }; });
  await t.page.fill('#wtInput','66.3'); await t.page.click('#wtSaveBtn');
  ok(/NOT stored/.test(await txt(t.page,'#wtSay')), 'full disk: "was NOT stored", not a tick');
  ok(!(await vis(t.page,'#logDone')), 'full disk: the card does not pretend it was logged');
  ok((await t.store()).po_coach_weights===JSON.stringify(REAL), 'full disk: stored data unchanged');
  await t.ctx.close();
}

console.log('\n── B8 · DRAG reads a day; the page still scrolls ──');
{
  const t=await open({data:REAL, w:390, h:844});
  const b=await t.page.locator('#chart').boundingBox();
  await t.page.evaluate(({x,y})=>{ document.getElementById('chart').dispatchEvent(new PointerEvent('pointerdown',{clientX:x,clientY:y,pointerType:'touch',buttons:1,bubbles:true})); },{x:b.x+b.width/2,y:b.y+b.height/2});
  const m=await t.page.evaluate(()=>({ d:document.getElementById('roD').textContent, a:document.querySelector('#roA .lbl').textContent, win:document.querySelectorAll('#chart .c-win').length, wd:document.querySelectorAll('#chart .c-wdot').length, scrub:document.getElementById('chart').classList.contains('scrub') }));
  ok(/^[A-Z]{3} \d+ [A-Z]{3}$/.test(m.d) && /vs trend/i.test(m.a), 'drag: the readout becomes that day ('+m.d+')');
  ok(m.win===1 && m.wd>=1 && m.wd<=7 && m.scrub, 'drag: the 7 mornings behind that trend light up ('+m.wd+'), the rest dim');
  await t.page.evaluate(()=>document.getElementById('chart').dispatchEvent(new PointerEvent('pointercancel',{pointerType:'touch',bubbles:true})));
  ok((await txt(t.page,'#roD'))==='LAST 30 DAYS' && !(await t.page.$('#chart .c-win')), 'a vertical scroll (pointercancel) clears the readout');
  await t.page.focus('#chart'); await t.page.keyboard.press('ArrowLeft');
  ok(/^[A-Z]{3} \d+ [A-Z]{3}$/.test(await txt(t.page,'#roD')), 'keyboard: ← reads a day');
  await t.page.keyboard.press('Escape');
  ok((await txt(t.page,'#roD'))==='LAST 30 DAYS', 'keyboard: Esc returns to the period');
  await t.ctx.close();
}

console.log('\n── B9 · PHONE 390 · LAPTOP 1180 / 1440 ───');
for(const [w,h] of [[390,844],[1180,900],[1440,900]]){
  const t=await open({data:REAL, w, h, wait:900});
  const m=await t.page.evaluate(()=>{
    const de=document.documentElement, small=[], taps=[];
    for(const el of document.querySelectorAll('body *')){
      const r=el.getBoundingClientRect(); if(!r.width||!r.height||el.closest('[hidden]')) continue;
      const cs=getComputedStyle(el); if(cs.visibility==='hidden'||cs.display==='none') continue;
      if([...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()) && parseFloat(cs.fontSize)<11) small.push(el.tagName+':'+cs.fontSize);
      if(/^(BUTTON|A|INPUT)$/.test(el.tagName) && el.id!=='wtInput' && (r.width<44||r.height<44)) taps.push((el.id||el.className||el.tagName)+' '+Math.round(r.width)+'×'+Math.round(r.height));
    }
    return { over:de.scrollWidth-de.clientWidth, small, taps };
  });
  ok(m.over===0, w+': no horizontal scroll ('+m.over+'px)');
  ok(m.taps.length===0, w+': every tap target ≥44×44 ('+m.taps.slice(0,4).join(', ')+')');
  if(w<600) ok(m.small.length===0, w+': no text under 11px ('+m.small.slice(0,4).join(', ')+')');
  ok(!t.errs.length, w+': no JS errors');
  await t.ctx.close();
}

await browser.close();
try{ fs.unlinkSync(TMP); }catch(e){}
console.log('\n'+pass+' passed, '+fail+' failed');
process.exit(fail?1:0);
})().catch(e=>{ console.log('  ✗ harness crashed: '+e.message); try{ fs.unlinkSync(TMP); }catch(_){} process.exit(1); });
