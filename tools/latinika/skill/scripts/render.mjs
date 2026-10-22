// render.mjs — το σταθερό render ενός πακέτου Λατινικών (CDP, χωρίς puppeteer).
//
//   node render.mjs NN                      8 πλάτη × 4 καρτέλες + 3 εικόνες
//   node render.mjs NN --file X.html        άλλο αρχείο (π.χ. το παλιό, για σύγκριση)
//   node render.mjs NN --dump out.json      + το DOM κάθε όψης στα 1440 (για σύγκριση παλιού/νέου)
//
// Ελέγχει: μηδέν οριζόντια υπερχείλιση, μηδέν κουτί κειμένου που ξεχειλίζει
// (εκτός όσων ζουν μέσα σε overflow-x:auto/scroll), μηδέν σφάλμα στο console.
// Exit 1 αν βρει κάτι.
//
// ⚠️ ΠΑΝΤΑ ?v=<ts>: το Page.navigate με άλλο #hash ΔΕΝ ξαναφορτώνει (σταθ. 30).
// ⚠️ Πλάτος ΜΟΝΟ με Emulation.setDeviceMetricsOverride — το --window-size
//    κάτω από ~500 δίνει ψέματα (σταθ. 59).
// ⛔ Ένα πακέτο δεν έχει κανένα <script src> — αν βρεθεί, σταματάει (σταθ. 8).
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';

const REPO = '/Users/alexstathatos/ALS DASHBOARD ALL FILES/als';
const args = process.argv.slice(2);
const NN = +args[0];
if (!NN) { console.error('χρήση: node render.mjs NN [--file X.html] [--dump out.json] [--out DIR]'); process.exit(2); }
const opt = k => { const i = args.indexOf(k); return i > 0 ? args[i + 1] : null; };
const FILE = opt('--file') || path.join(REPO, 'latinika-lectio' + NN + '.html');
const DUMP = opt('--dump');
const OUT = opt('--out') || path.join(os.tmpdir(), 'latinika-render-' + NN);
fs.mkdirSync(OUT, { recursive: true });

const html = fs.readFileSync(FILE, 'utf8');
if (/<script[^>]*\ssrc=/i.test(html)) { console.error('⛔ το πακέτο φορτώνει <script src> — δεν ρεντεράρεται (σταθ. 8)'); process.exit(2); }

const SHELL = path.join(os.homedir(), '.cache/puppeteer/chrome-headless-shell/mac_arm-150.0.7871.24/chrome-headless-shell-mac-arm64/chrome-headless-shell');
const CHROME = fs.existsSync(SHELL) ? SHELL : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PORT = 9400 + Math.floor(Math.random() * 400);
const PROF = fs.mkdtempSync(path.join(os.tmpdir(), 'lat-prof-'));   // φρέσκο profile — ποτέ κλειδωμένο
const ch = spawn(CHROME, ['--headless', '--remote-debugging-port=' + PORT, '--user-data-dir=' + PROF,
  '--allow-file-access-from-files', '--no-first-run', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let tgt;
for (let i = 0; i < 60 && !tgt; i++) { await sleep(200); try { tgt = (await (await fetch('http://127.0.0.1:' + PORT + '/json')).json()).find(t => t.type === 'page'); } catch {} }
if (!tgt) { ch.kill(); console.error('το Chrome δεν σηκώθηκε'); process.exit(2); }
const ws = new WebSocket(tgt.webSocketDebuggerUrl);            // global WebSocket του Node 24
await new Promise(r => ws.onopen = r);
let id = 0; const pend = {}; const errors = [];
ws.onmessage = e => {
  const m = JSON.parse(e.data);
  if (m.id && pend[m.id]) { pend[m.id](m); delete pend[m.id]; return; }
  if (m.method === 'Runtime.exceptionThrown') errors.push('exception: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text));
  if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push('console.error: ' + m.params.args.map(a => a.value || a.description).join(' '));
  if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.params.entry.url || '')) errors.push('log: ' + m.params.entry.text + ' ' + (m.params.entry.url || ''));
};
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async x => {
  const r = await send('Runtime.evaluate', { expression: x, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error('evaluate: ' + JSON.stringify(r.result.exceptionDetails).slice(0, 300));
  return r.result?.result?.value;
};
await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');

const URL0 = 'file://' + FILE;
async function open(w) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: w <= 560 });
  await send('Page.navigate', { url: URL0 + '?v=' + Date.now() + '#keimeno' });
  for (let i = 0; i < 40; i++) { await sleep(100); if (await ev('document.readyState') === 'complete') break; }
  await ev('localStorage.clear()');                      // κάθε πλάτος από καθαρή εγκατάσταση
  await send('Page.navigate', { url: URL0 + '?v=' + Date.now() + '#keimeno' });
  for (let i = 0; i < 40; i++) { await sleep(100); if (await ev('document.readyState') === 'complete') break; }
  await sleep(500);
}
const MEASURE = `(() => {
  const cw = document.documentElement.clientWidth, sw = document.documentElement.scrollWidth;
  const inScroller = e => { for (let p = e.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll') return true; } return false; };
  const bad = [];
  for (const e of document.querySelectorAll('.shell *')) {
    const b = e.getBoundingClientRect();
    if (!b.width || getComputedStyle(e).display === 'none') continue;
    if (inScroller(e) || e.closest('.tabs')) continue;
    if (b.right > cw + 1) bad.push('δεξιά ' + Math.round(b.right) + '>' + cw + ' ' + e.tagName + '.' + (e.className || ''));
    else if (e.children.length === 0 && e.textContent.trim() && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).overflowX !== 'visible')
      bad.push('κείμενο κομμένο ' + e.scrollWidth + '>' + e.clientWidth + ' ' + e.tagName + '.' + (e.className || ''));
  }
  return { cw, sw, bad: bad.slice(0, 6), nbad: bad.length };
})()`;

const TABS = ['keimeno', 'grammatiki', 'simeioseis', 'kartes'];
const WIDTHS = [1440, 1280, 1180, 1040, 900, 760, 560, 393];
let issues = 0;
const rows = [];
for (const w of WIDTHS) {
  await open(w);
  for (const t of TABS) {
    await ev(`document.querySelector('.tab[data-tab="${t}"]').click()`); await sleep(250);
    const r = await ev(MEASURE);
    const okw = r.sw <= r.cw && r.nbad === 0;
    if (!okw) issues++;
    rows.push(`${okw ? '✓' : '✗'} ${String(w).padStart(4)} ${t.padEnd(10)} sw=${r.sw} cw=${r.cw}` + (r.nbad ? ' · ' + r.bad.join(' | ') : ''));
  }
  /* η Γραμματική «Κατά κατηγορία»: ίδια υπερχείλιση, και ΚΑΜΙΑ γραμμή δεν χάνεται/διπλασιάζεται */
  await ev(`document.querySelector('.tab[data-tab="grammatiki"]').click()`);
  const rowsOf = `JSON.stringify(['tV','tN','tA'].map(id => [...document.querySelectorAll('#'+id+' tr:not(.gh)')].slice(1).map(r => r.innerHTML).sort()))`;
  const before = await ev(rowsOf);
  await ev(`document.querySelector('[data-grp="cat"]').click()`); await sleep(200);
  const after = await ev(rowsOf);
  const gh = await ev(`(() => { const o = []; ['tV','tN','tA'].forEach(id => { let cur = null; for (const r of document.querySelectorAll('#'+id+' tr')) { if (r.classList.contains('gh')) { cur = {l: r.textContent, n: +r.querySelector('i').textContent, c: 0}; o.push(cur); } else if (cur) cur.c++; } }); return o; })()`);
  const rc = await ev(MEASURE);
  const okg = before === after && gh.length > 0 && gh.every(g => g.n === g.c) && rc.sw <= rc.cw && rc.nbad === 0;
  if (!okg) issues++;
  rows.push(`${okg ? '✓' : '✗'} ${String(w).padStart(4)} κατηγορία  ${gh.length} ομάδες` + (before !== after ? ' · ⛔ οι γραμμές ΑΛΛΑΞΑΝ' : '') + (gh.some(g => g.n !== g.c) ? ' · ⛔ λάθος μετρητής ομάδας' : '') + (rc.nbad ? ' · ' + rc.bad.join(' | ') : ''));
  if (w === 1440) console.log('ομάδες: ' + gh.map(g => g.l.replace(/\d+$/, '') + '(' + g.c + ')').join(' · '));
  await ev(`document.querySelector('[data-grp="txt"]').click()`); await sleep(100);

  /* και οι τρεις τρόποι του κειμένου */
  await ev(`document.querySelector('.tab[data-tab="keimeno"]').click()`);
  for (const m of ['tr', 'st', 'rd']) {
    await ev(`document.querySelector('[data-mode="${m}"]').click()`); await sleep(200);
    const r = await ev(MEASURE);
    const okw = r.sw <= r.cw && r.nbad === 0;
    if (!okw) { issues++; rows.push(`✗ ${String(w).padStart(4)} mode:${m} sw=${r.sw} · ${r.bad.join(' | ')}`); }
  }
}
console.log(rows.join('\n'));

/* ── 3 εικόνες ── */
async function shot(name, w, h) {
  /* ⚠️ Το clip μετράει σε συντεταγμένες ΕΓΓΡΑΦΟΥ: μετά από scroll θέλει y = scrollY,
     αλλιώς φωτογραφίζει την κορυφή της σελίδας και μοιάζει με μαύρη οθόνη. */
  const y = await ev('window.scrollY');
  const s = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y, width: w, height: h, scale: 1 } });
  const f = path.join(OUT, name); fs.writeFileSync(f, Buffer.from(s.result.data, 'base64')); return f;
}
await open(1440);
await ev(`(() => { const w = document.querySelectorAll('.la .w')[6]; w.scrollIntoView({block:'center'}); w.click(); })()`); await sleep(300);
await ev(`window.scrollTo(0, document.querySelector('.tools').getBoundingClientRect().top + scrollY - 20)`); await sleep(200);
const s1 = await shot('1-laptop-lexi.png', 1440, 900);
await ev(`document.querySelector('[data-mode="st"]').click()`); await sleep(300);
await ev(`window.scrollTo(0, document.querySelector('.tools').getBoundingClientRect().top + scrollY - 20)`); await sleep(200);
const s2 = await shot('2-domi.png', 1440, 900);
await ev(`document.querySelector('[data-mode="rd"]').click()`);
await ev(`document.querySelector('.tab[data-tab="grammatiki"]').click()`); await sleep(150);
await ev(`document.querySelector('[data-grp="cat"]').click()`); await sleep(200);
await ev(`window.scrollTo(0, document.querySelector('.gtools').getBoundingClientRect().top + scrollY - 20)`); await sleep(200);
const s4 = await shot('4-grammatiki-katigoria.png', 1440, 900);
await ev(`document.querySelector('[data-grp="txt"]').click()`);
await open(393);
const s3 = await shot('3-kinito.png', 393, 900);
console.log('εικόνες:', s1, s2, s3, s4);

/* ── DOM κάθε όψης στα 1440 (απόδειξη ότι δύο αρχεία ζωγραφίζουν το ίδιο) ── */
if (DUMP) {
  await open(1440);
  const d = {};
  for (const t of TABS) {
    await ev(`document.querySelector('.tab[data-tab="${t}"]').click()`); await sleep(200);
    d[t] = await ev(`document.getElementById('p-${t}').innerHTML`);
  }
  await ev(`document.querySelector('.tab[data-tab="keimeno"]').click()`);
  for (const m of ['tr', 'st']) { await ev(`document.querySelector('[data-mode="${m}"]').click()`); await sleep(150); d['mode-' + m] = await ev(`document.getElementById('content').innerHTML`); }
  await ev(`document.querySelector('[data-mode="rd"]').click()`);
  await ev(`document.querySelectorAll('.la .w')[3].click()`); d.word = await ev(`document.getElementById('aside').innerHTML`);
  d.head = await ev(`document.querySelector('.cover').outerHTML + document.querySelector('.band').outerHTML + document.title`);
  fs.writeFileSync(DUMP, JSON.stringify(d, null, 1));
  console.log('DOM →', DUMP);
}

ws.close(); ch.kill(); await sleep(400);
try { fs.rmSync(PROF, { recursive: true, force: true }); } catch {}
if (errors.length) console.log('⛔ console:\n  ' + errors.join('\n  '));
console.log(issues || errors.length ? `✗ ${issues} όψεις με υπερχείλιση · ${errors.length} σφάλματα` : `✓ ${WIDTHS.length} πλάτη × ${TABS.length} καρτέλες + 3 τρόποι: μηδέν υπερχείλιση, μηδέν σφάλμα`);
process.exit(issues || errors.length ? 1 : 0);
