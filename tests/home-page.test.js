/* tests/home-page.test.js — the redesigned Home (als-v684), driven in a REAL Chrome.
 *
 * Why this exists: while building it, one helper rename left a single `el(id)`
 * behind inside setCol(). It threw, every paint is wrapped in try/catch (rightly —
 * one bad store must not blank the page), and so the four columns, the ruler, the
 * week and every row sat on their "—" placeholders with ZERO errors anywhere. That
 * is constraint 10 exactly. Only a render could see it, so this test renders.
 *
 * ⛔ Constraint 8: the harness strips every script that can reach Supabase —
 *    supabase.min.js, sync.js, topbar.js (it INJECTS pocoach-sync.js at runtime),
 *    push.js, reminders.js, nova-coach.js, lock.js — and fetch() is stubbed to
 *    reject. The needle is the src=" context, never the bare name (constraint 19).
 * Constraint 37: everything else loads EXACTLY as the page loads it, via <base>.
 */
const fs = require('fs'), path = require('path'), os = require('os');
const { execFileSync } = require('child_process');
const ALS = path.join(__dirname, '..');
let pass = 0, fail = 0;
function ok(name, cond, extra) { cond ? pass++ : fail++; console.log((cond ? '  ✓ ' : '  ✗ FAIL ') + name + (cond || !extra ? '' : '\n      ' + extra)); }
function section(s) { console.log('\n' + s); }

const CHROME = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find(p => fs.existsSync(p));
const html = fs.readFileSync(path.join(ALS, 'index.html'), 'utf8');
const live = fs.readFileSync(path.join(ALS, 'home-live.js'), 'utf8');

/* ── 1 · static contract ─────────────────────────────────────────── */
section('1 · static contract');
const BAN = ['src="lock.js"', 'src="vendor/supabase.min.js"', 'src="sync.js"', 'src="topbar.js"', 'src="push.js"', 'src="reminders.js"', 'src="nova-coach.js'];
ok('the real page still loads the sync engines (the harness is what strips them)', html.indexOf('src="sync.js"') > -1 && html.indexOf('src="topbar.js"') > -1);
ok('ladders.js loads before home-live.js', html.indexOf('src="ladders.js"') > -1 && html.indexOf('src="ladders.js"') < html.indexOf('src="home-live.js'));
ok('no class="nova" (aurora.css owns .nova: a fixed-size crystal that crushed the panel)', !/class="nova"/.test(html));
ok('no min-width media query (constraint 51)', !/@media[^{]*min-width/.test(html));
ok('no authored numbers in the metric columns', !/class="fig">\d/.test(html));
ok('no leftover el( call in home-live.js (the bug this file was born from)', !/[^a-zA-Z_.$]el\(/.test(live.replace(/var el = document\.getElementById\('vaultLast'\)[\s\S]*?el\.textContent = 'last backup[^\n]*/, '')));
ok('the day card never writes: no setItem in the paint layer except the water writer and arc:seen',
  (live.split('/* ── paint one tile')[1] || '').match(/setItem\(/g).length === 3);
ok('"as needed" supplements are never owed (mirrors supps.html dailyItems)', live.indexOf("(i.window || 'anytime') !== 'occasional'") > -1);

/* ── 1b · the number that travels (hero-vt.js, als-v685) ───────────── */
section('1b · hero-vt: one named element per side, present before the first frame');
{
  const vt = fs.readFileSync(path.join(ALS, 'hero-vt.js'), 'utf8');
  ok('home loads hero-vt.js, not defer', /<script src="hero-vt.js"><\/script>/.test(html));
  ['nutrition.html', 'sleep.html', 'weight.html', 'gym.html'].forEach(pg => {
    ok('home column carries data-vt-hero="' + pg + '" (once)', (html.match(new RegExp('data-vt-hero="' + pg.replace('.', '\\.') + '"', 'g')) || []).length === 1);
    const P = fs.readFileSync(path.join(ALS, pg), 'utf8'), head = P.split('</head>')[0];
    ok(pg + ': hero-vt.js + render-blocking expect link in <head>', /<script src="hero-vt.js"><\/script>/.test(head) && /<link rel="expect" href="#vtReady" blocking="render">/.test(head));
    ok(pg + ': exactly one #vtReady marker, in <body>', (P.match(/id="vtReady"/g) || []).length === 1 && P.indexOf('id="vtReady"') > P.indexOf('</head>'));
    const sel = (vt.match(new RegExp("'" + pg.replace('.', '\\.') + "':\\s*'([^']+)'")) || [])[1];
    const last = sel ? sel.split(' ').pop() : '';
    ok(pg + ': the selector hero-vt.js uses (' + sel + ') exists in the page', !!sel && P.indexOf(last.replace(/^[.#]/, '').replace(/^/, '')) > -1);
  });
  ok('the name is never written in CSS (two of it on one page aborts the transition)', !/view-transition-name:\s*hero-fig/.test(html + fs.readFileSync(path.join(ALS, 'aurora.css'), 'utf8')));
  ok('every name it sets is taken off again', /setTimeout\(off, 2000\)/.test(vt) && /pageshow/.test(vt));
  ok('hero-vt.js is in the SW CORE', fs.readFileSync(path.join(ALS, 'sw.js'), 'utf8').indexOf("'hero-vt.js'") > -1);
}

if (!CHROME) { console.log('\n  ✗ FAIL Chrome not found — the render half did not run'); console.log(`\n${pass} passed, ${fail + 1} failed`); process.exit(1); }

/* ── harness ─────────────────────────────────────────────────────── */
const SEED = String.raw`<script>
window.fetch=function(){return Promise.reject(new Error('harness: no network'))};
(function(){var MODE=location.hash.slice(1)||'full';localStorage.clear();
function K(o){var d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-o);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function D(o,h,m){var d=new Date();d.setHours(h,m,0,0);d.setDate(d.getDate()-o);return d.getTime();}
var put=function(k,v){localStorage.setItem(k,JSON.stringify(v));};
if(MODE==='empty')return;
var W=[];for(var i=60;i>=0;i--)W.push({ts:D(i,7,10),weight:+(66+Math.sin(i/9)*.6).toFixed(1),dateKey:K(i)});put('po_coach_weights',W);
put('stack:items',[{id:'a',name:'Creatine',window:'anytime'},{id:'b',name:'Magnesium',window:'evening'},{id:'c',name:'Valetonina',window:'occasional'}]);
if(MODE==='stale'){put('sleep:logs',[{id:'s',dateKey:K(30),bed:'23:10',wake:'07:00',hours:7.8,recovery:90}]);put('nut:logs',[{id:'n',dateKey:K(40),ts:D(40,13,0),kcal:1500}]);return;}
var SL=[];for(var j=10;j>=0;j--)SL.push({id:'sl'+j,dateKey:K(j),bed:'23:04',wake:'06:58',hours:7.9,recovery:84});put('sleep:logs',SL);
var NL=[],id=0;for(var n=10;n>=0;n--)[[7,30,520,'Γιαούρτι'],[14,0,640,'Κοτόπουλο'],[20,15,470,'Ομελέτα']].forEach(function(m){if(n===0&&m[0]>18)return;NL.push({id:'f'+(id++),dateKey:K(n),ts:D(n,m[0],m[1]),kcal:m[2],protein:30,name:m[3]});});put('nut:logs',NL);
put('po_workouts',[{id:'w',name:'Push',date:K(0),startedAt:new Date(D(0,6,0)).toISOString(),durationSec:3000,volume:14220,entries:[{name:'Bench Press',sets:[{kg:60,reps:8,done:true}]}]}]);
put('caf:logs',[{id:'c',ts:D(0,10,20),mg:95,name:'Freddo espresso'}]);
var wl={};for(var q=10;q>=0;q--)wl[K(q)]=q===0?3:7;put('po_water_v1',{_ts:1,logs:wl,unit:'bottle',glassMl:250,bottleMl:500,profile:{age:17,sex:'m',weightKg:66,activityHrsPerWeek:5}});
put('stack:taken:'+K(1),{a:true,b:true});
})();</script>`;
const PROBE = String.raw`<script>window.__err=[];addEventListener('error',function(e){__err.push(e.message)});
setTimeout(function(){var q=function(s){return document.querySelector(s)},R={};
R.err=__err;R.sw=document.documentElement.scrollWidth;R.iw=innerWidth;
R.nut=(q('#mNut .fig')||{}).textContent;R.sleep=(q('#mSleep .fig')||{}).textContent;R.train=(q('#mTrain .fig')||{}).textContent;R.weight=(q('#mWeight .fig')||{}).textContent;
R.nutLine=(q('#mNut .line')||{}).textContent;R.errCols=document.querySelectorAll('.m.err').length;
R.items=[].map.call(document.querySelectorAll('#tdList .item'),function(i){return i.getAttribute('data-id')+':'+(i.classList.contains('done')?1:0)+':'+i.querySelector('.when').textContent});
R.cells=document.querySelectorAll('#g7 .c').length;R.rowsFilled=[].filter.call(document.querySelectorAll('.row .v'),function(v){return /\d/.test(v.textContent)}).length;
R.ruler=document.querySelectorAll('#ru rect,#ru circle').length;R.ro=(q('#ro')||{}).textContent;R.h1=(q('#homeGreeting')||{}).textContent;R.lede=(q('#lede')||{}).textContent;R.empty=(q('.td-empty')||{}).textContent||'';R.wkP=(q('#wkP')||{}).textContent;
R.greekSerif=[].filter.call(document.querySelectorAll('.fig,h1,h2'),function(e){return /[Ͱ-Ͽἀ-῿]/.test(e.textContent)&&/Instrument/.test(getComputedStyle(e).fontFamily)&&!e.querySelector('.gr')}).map(function(e){return e.textContent.slice(0,30)});
document.body.setAttribute('data-r',encodeURIComponent(JSON.stringify(R)))},2600)</script>`;
let page = html.split('\n').filter(l => !BAN.some(b => l.indexOf(b) > -1)).join('\n');
section('harness');
ok('every sync-capable script is stripped', BAN.every(b => page.indexOf(b) === -1));
page = page.replace('<head>', '<head>\n<base href="file://' + encodeURI(ALS + '/') + '">\n' + SEED).replace('</body>', PROBE + '</body>');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'home-page-'));
const file = path.join(tmp, 'h.html'); fs.writeFileSync(file, page);
function render(mode, w) {
  const out = execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--window-size=' + w + ',900', '--virtual-time-budget=6000', '--dump-dom', 'file://' + file + '#' + mode], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64e6 });
  const m = out.match(/data-r="([^"]*)"/); return m ? JSON.parse(decodeURIComponent(m[1])) : null;
}

/* ── 2 · a full day ──────────────────────────────────────────────── */
section('2 · a full day, 1440');
const F = render('full', 1440);
ok('the probe ran', !!F);
if (F) {
  ok('no JS error', F.err.length === 0, JSON.stringify(F.err));
  ok('no horizontal scroll', F.sw === F.iw, F.sw + '/' + F.iw);
  ok('Nutrition shows today\'s real kcal (1,160)', /1,160/.test(F.nut), F.nut);
  ok('Sleep shows 7:54', /7:54/.test(F.sleep), F.sleep);
  ok('Training shows today\'s session', /Push/.test(F.train), F.train);
  ok('Weight shows a number', /\d+\.\d/.test(F.weight), F.weight);
  ok('no column fell into the error state', F.errCols === 0);
  ok('the day card reads the stores', F.items.some(i => /^food:1:1,160 kcal/.test(i)) && F.items.some(i => /^water:0:3 \/ /.test(i)), JSON.stringify(F.items));
  ok('supplements count DAILY items only (0 / 2, not / 3)', F.items.some(i => i === 'supps:0:0 / 2'), JSON.stringify(F.items));
  ok('the week grid is drawn', F.cells >= 7 * 4, F.cells);
  ok('the index rows carry real values', F.rowsFilled >= 6, F.rowsFilled);
  ok('the ruler drew sleep, meals, coffee and the session', F.ruler >= 6, F.ruler);
  ok('the readout counts what was logged', /meals logged/.test(F.ro) && /95 mg/.test(F.ro), F.ro);
  ok('the lede states measured facts', /1,160 kcal/.test(F.lede) && /Push/.test(F.lede), F.lede);
  ok('no Greek text set in Instrument Serif', F.greekSerif.length === 0, JSON.stringify(F.greekSerif));
}
section('2b · a full day, 390 / 1180');
[390, 1180].forEach(w => { const r = render('full', w); ok(w + ': no horizontal scroll, no error', r && r.sw === r.iw && r.err.length === 0, r && (r.sw + '/' + r.iw + ' ' + r.err)); });

/* ── 3 · his real shape since school: only weigh-ins are current ──── */
section('3 · stale stores are not asked for every day');
const S = render('stale', 1440);
if (S) {
  ok('only the weigh-in is owed (sleep 30d, food 40d old are not)', S.items.length === 1 && /^weight:1:/.test(S.items[0]), JSON.stringify(S.items));
  ok('one item does not claim "the day is closed"', !/closed/.test(S.h1) && /All in/.test(S.h1), S.h1);
  ok('nutrition says "nothing logged", never 0 kcal', /—/.test(S.nut) && /Nothing logged/.test(S.nutLine), S.nut + ' / ' + S.nutLine);
  ok('no error', S.err.length === 0, JSON.stringify(S.err));
}

/* ── 4 · a brand-new account ─────────────────────────────────────── */
section('4 · nothing at all');
const E = render('empty', 1440);
if (E) {
  ok('the day card explains itself instead of drawing an empty frame', /Nothing you are tracking/.test(E.empty), E.empty);
  ok('the week says so in words', /Nothing tracked/.test(E.wkP), E.wkP);
  ok('no invented number anywhere in the columns', [E.nut, E.weight].every(v => /^—$/.test(String(v).trim())), E.nut + ' ' + E.weight);
  ok('no error', E.err.length === 0, JSON.stringify(E.err));
}
try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) { }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
