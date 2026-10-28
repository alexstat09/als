/* launcher.js \u2014 "All": every page in M\u00c9TRON, one press from anywhere.
   Injected by topbar.js, so it exists on every page that carries the shell.

   \u2500\u2500 als-v686: THE APPROVED REDESIGN (demo v1\u2192v5, 28/10/26) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   His verdicts, in order: "i like it much more" \u00b7 the list "a little mediocre"
   \u2192 living group columns \u00b7 "a touch better" \u2192 calmer rows \u00b7 Study shows ONLY
   School Studies ("it opens and contains all the others", two taps is fine,
   and it is where he goes every day, so it gets a big card) \u00b7 then the button.
   The home's own language: near-black, hairlines, Instrument Serif figures,
   Commissioner words, the champagne accent.

   \u2500\u2500 WHY AN INDEX AND NOT A GRID OF ICONS (unchanged since als-v437) \u2500\u2500\u2500\u2500\u2500
   The complaint was FORGETTING pages, not reaching them. So every row says
   where that page stands now, every group shows 14 days of activity, and a
   line at the foot names what has gone quiet.

   \u2500\u2500 THE RULES IT KEEPS \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
   \u00b7 IT NEVER WRITES. Not one setItem / removeItem in this file, no new key,
     nothing synced, nothing in BUNDLES. Reverting it is `git revert` and a
     service-worker bump. tests/launcher.test.js enforces this.
   \u00b7 The numbers come from launcher-data.js, a byte-identical copy of the
     home's metric() readers, so the panel and Home can never disagree.
   \u00b7 The pinned six NEVER REORDER, and nothing here sorts (the test bans it):
     a list that rearranges itself cannot be learned.
   \u00b7 Everything is read LAZILY, on open, never on page load (nut:logs is
     ~563 KB).
   \u00b7 Silent-empty is this project's disease: an absent or unreadable store
     shows NO note and "no history kept", never "0" or "never opened".
   \u00b7 Native <dialog> + showModal(), with `display` scoped to [open] (the
     als-v431 bug) and the top layer, so no ancestor transform can push it
     off-frame (constraint 4).
*/
(function () {
  'use strict';
  if (window.ALSLauncher) return;

  /* \u2500\u2500 The six "today" tiles. Fixed order, never ranked. \u2500\u2500 */
  var PINS = [
    { href: 'nutrition.html', name: 'Food',   c: '#E59A7C' },
    { href: 'gym.html',       name: 'Gym',    c: '#7FCFA4' },
    { href: 'weight.html',    name: 'Weight', c: '#C9A3CF' },
    { href: 'sleep.html',     name: 'Sleep',  c: '#93A8E0' },
    { href: 'po-water.html',  name: 'Water',  c: '#86BFD0' },
    { href: 'supps.html',     name: 'Supps',  c: '#E8B25C' }
  ];

  /* School Studies: the ONE study door. \u0391\u03c1\u03c7\u03b1\u03af\u03b1, \u0386\u03b3\u03bd\u03c9\u03c3\u03c4\u03bf, \u039b\u03b1\u03c4\u03b9\u03bd\u03b9\u03ba\u03ac, \u03a4\u03bf\u03bd\u03b9\u03c3\u03bc\u03cc\u03c2,
     \u0399\u03c3\u03c4\u03bf\u03c1\u03af\u03b1 and \u0388\u03ba\u03b8\u03b5\u03c3\u03b7 live inside it (his rule, 28/10/26), so they are not
     rows here; searching any of them lands on it. `k` = every store whose
     activity counts as "studied that day". */
  var SCHOOL = { href: 'homework.html', name: 'School Studies',
    k: ['hw:v1', 'lat:v1', 'ist:v1', 'ton:v1', 'arx:v1', 'arx:gn', 'agn:v1', 'ekt:v1'] };
  var SUBJECTS = ['\u0391\u03c1\u03c7\u03b1\u03af\u03b1', '\u0386\u03b3\u03bd\u03c9\u03c3\u03c4\u03bf', '\u039b\u03b1\u03c4\u03b9\u03bd\u03b9\u03ba\u03ac', '\u03a4\u03bf\u03bd\u03b9\u03c3\u03bc\u03cc\u03c2', '\u0399\u03c3\u03c4\u03bf\u03c1\u03af\u03b1', '\u0388\u03ba\u03b8\u03b5\u03c3\u03b7', '\u0395\u03c1\u03b3\u03b1\u03c3\u03af\u03b5\u03c2', '\u0394\u03b9\u03b1\u03b3\u03c9\u03bd\u03af\u03c3\u03bc\u03b1\u03c4\u03b1'];

  /* The index. `k` = the stores read for "when was this last used" and the
     14-day strip; a key ending in ':*' is one key per day (stack:taken:DATE).
     A page with no `k` keeps no history and says so. Order is fixed. */
  var GROUPS = [
    { name: 'Body', items: [
      { href: 'nutrition.html', name: 'Nutrition',   k: ['nut:logs'], m: 1 },
      { href: 'sleep.html',     name: 'Sleep',       k: ['sleep:logs'], m: 1 },
      { href: 'weight.html',    name: 'Weight',      k: ['po_coach_weights'], m: 1 },
      { href: 'po-water.html',  name: 'Water',       k: ['po_water_v1'], m: 1 },
      { href: 'caffeine.html',  name: 'Caffeine',    k: ['caf:logs'], m: 1 },
      { href: 'supps.html',     name: 'Supplements', k: ['stack:taken:*'], m: 1 },
      { href: 'planner.html',   name: 'Meal plan',   k: null },
      { href: 'body.html',      name: 'Body',        k: null }
    ]},
    { name: 'Train', items: [
      { href: 'gym.html',      name: 'Fitness',  k: ['po_workouts', 'po_coach_workout_done'], m: 1 },
      { href: 'pr.html',       name: 'PR board', k: null, m: 1 },
      { href: 'measure.html',  name: 'Measure',  k: ['bm:logs'], m: 1 },
      { href: 'run.html',      name: 'Running',  k: null }
    ]},
    { name: 'Life', items: [
      { href: 'finance.html',   name: 'Money',     k: null, m: 1 },
      { href: 'scripture.html', name: 'Scripture', k: ['bible:sessions'] },
      { href: 'movies.html',    name: 'Movies',    k: ['movies:seen'], m: 1 }
    ]},
    { name: 'Mind', items: [
      { href: 'main.html',     name: 'Goals',            k: ['goals:*'], m: 1 },
      { href: 'identity.html', name: 'Identity',         k: ['journal:entries'], m: 1 },
      { href: 'ideas.html',    name: 'Ideas',            k: ['ideas:items'], m: 1 },
      { href: 'improve.html',  name: 'Library',          k: ['improve:videos'], m: 1 },
      { href: 'insights.html', name: 'Insights',         k: null },
      { href: 'coach.html',    name: 'Coach',            k: null },
      { href: 'arc.html',      name: 'Your Arc',         k: null, m: 1 },
      { href: 'morning.html',  name: 'Morning briefing', k: null },
      { href: 'weekly.html',   name: 'Weekly review',    k: null }
    ]}
  ];
  /* Found by search only. study.html is the app's one door to the Notion
     \u00ab\u0397 \u03a7\u03a1\u039f\u039d\u0399\u0391\u00bb; he asked for it off the list, and nothing else links it, so
     search is what keeps it reachable. It opens in a new tab: it is a
     location.replace() stub, and in place it would strand the PWA off-site. */
  var SEARCH_ONLY = [
    { href: 'study.html', name: '\u0397 \u03a7\u03c1\u03bf\u03bd\u03b9\u03ac', ext: true, g: 'Notion' },
    { href: 'index.html', name: 'Home', g: 'Home' }
  ];
  var TOOLS = [
    { href: 'backup.html',        name: 'Back up & restore' },
    { href: 'import.html',        name: 'Import MyFitnessPal' },
    { href: 'import-strong.html', name: 'Import Strong' },
    { href: 'settings.html',      name: 'Settings' }
  ];
  /* What a bare number on a row means, where metric() gives no unit. */
  var SUFFIX = { 'sleep.html': 'recovery', 'ideas.html': 'open', 'improve.html': 'in the queue',
                 'movies.html': 'films', 'arc.html': '' };
  var QUIET = 14;

  /* \u2500\u2500 small helpers \u2500\u2500 */
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fold(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\u03c2/g, '\u03c3');
  }
  function keyOf(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function here() {
    var f = (window.location.pathname || '').toLowerCase().split('/').pop() || 'index.html';
    return f === '' ? 'index.html' : f;
  }
  function phone() { return !!(window.matchMedia && window.matchMedia('(max-width:600px)').matches); }
  function data() { return window.ALSLauncherData || null; }

  /* \u2500\u2500 14 days, oldest first; WIN[13] is today \u2500\u2500 */
  var WIN = [], WINSET = {};
  function makeWin() {
    WIN = []; WINSET = {};
    var d = new Date(); d.setHours(0, 0, 0, 0);
    for (var i = 13; i >= 0; i--) { var x = new Date(d); x.setDate(d.getDate() - i); var k = keyOf(x); WIN.push(k); WINSET[k] = 13 - i; }
  }

  /* \u2500\u2500 Activity: the calendar days a store holds a dated entry for \u2500\u2500\u2500\u2500\u2500
     One scanner answers both questions \u2014 "last used" (the row's age) and
     "which of the last 14 days" (the strips) \u2014 so the two can never contradict
     each other. A day counts when the store carries a timestamp or a
     YYYY-MM-DD (as a value or as an object key) for it. Future dates (a due
     date, a planned run) are ignored: they are not use. Read once per page
     load, lazily, on first open. */
  var actCache = {};
  function scanDays(v, out) {
    var today = WIN[13];
    function add(k) { if (k && k <= today) out[k] = 1; }
    function walk(x, depth) {
      if (depth > 5 || x == null) return;
      if (typeof x === 'number') { if (x > 16e11 && x < 21e11) add(keyOf(new Date(x))); return; }
      if (typeof x === 'string') { if (/^20\d\d-\d\d-\d\d/.test(x)) add(x.slice(0, 10)); return; }
      if (Array.isArray(x)) { for (var i = Math.max(0, x.length - 400); i < x.length; i++) walk(x[i], depth + 1); return; }
      if (typeof x === 'object') {
        var ks = Object.keys(x);
        for (var j = Math.max(0, ks.length - 400); j < ks.length; j++) {
          if (/^20\d\d-\d\d-\d\d$/.test(ks[j])) add(ks[j]);
          walk(x[ks[j]], depth + 1);
        }
      }
    }
    walk(v, 0);
  }
  /* \u2192 { days: {YYYY-MM-DD:1}, read: true } or null when NOTHING could be read */
  function activity(keys) {
    if (!keys || !keys.length) return null;
    var id = keys.join('|');
    if (id in actCache) return actCache[id];
    var days = {}, any = false;
    keys.forEach(function (k) {
      try {
        if (k.slice(-2) === ':*') {
          var pre = k.slice(0, -1);
          WIN.forEach(function (dk) {
            var raw = localStorage.getItem(pre + dk);
            if (raw == null) return;
            any = true;
            var v = JSON.parse(raw);
            var used = Array.isArray(v) ? v.length > 0 : (v && typeof v === 'object') ? Object.keys(v).some(function (x) { return v[x]; }) : !!v;
            if (used) days[dk] = 1;
          });
          return;
        }
        var raw2 = localStorage.getItem(k);
        if (raw2 == null) return;
        any = true;
        scanDays(JSON.parse(raw2), days);
      } catch (e) { /* unreadable \u2192 contributes nothing, never a fake day */ }
    });
    var out = any ? { days: days } : null;
    actCache[id] = out;
    return out;
  }
  function newest(act) {
    if (!act) return null;
    var best = null;
    Object.keys(act.days).forEach(function (k) { if (!best || k > best) best = k; });
    return best;
  }
  function daysAgo(dk) {
    if (!dk) return -1;
    var a = new Date(dk + 'T00:00:00'), b = new Date(WIN[13] + 'T00:00:00');
    return Math.round((b - a) / 86400000);
  }
  function ageText(n) {
    return n < 0 ? '' : n === 0 ? 'today' : n === 1 ? '1d' : n < 7 ? n + 'd' : n < 60 ? Math.round(n / 7) + 'w' : Math.round(n / 30) + 'mo';
  }
  function ageWords(n) {
    return n >= 60 ? Math.round(n / 30) + ' months' : n >= 14 ? Math.round(n / 7) + ' weeks' : n + ' days';
  }
  function strip14(act) {
    var a = []; for (var i = 0; i < 14; i++) a.push(act && act.days[WIN[i]] ? 1 : 0);
    return a;
  }

  /* \u2500\u2500 numbers, from the home's own readers \u2500\u2500 */
  function M(h) { var D = data(); if (!D) return null; try { return D.metric(h); } catch (e) { return null; } }
  function fig(m) {
    if (!m || m.hero == null) return '';
    if (typeof m.hero === 'number') {
      if (m.dec) return m.hero.toFixed(m.dec);
      return m.hero >= 1000 ? Number(m.hero).toLocaleString('en-US') : String(m.hero);
    }
    return String(m.hero);
  }
  function hasValue(m) { return !!(m && m.hero != null && m.hero !== '\u2014' && m.hero !== '\u2014'); }
  function stateOf(h) {
    var m = M(h); if (!hasValue(m)) return '';
    var f = fig(m), u = m.unit || '';
    if (u === '\u20ac') return '\u20ac' + f;
    if (u) return f + ' ' + u;
    if (h in SUFFIX) return SUFFIX[h] ? f + ' ' + SUFFIX[h] : f;
    return m.txt ? f : f;
  }
  /* bright figures, quiet words */
  function figs(t) { return esc(t).replace(/(\u20ac?\d[\d,.]*)/g, '<b>$1</b>'); }

  /* \u2500\u2500 School Studies: the same stores homework.html and the home tile read \u2500\u2500 */
  var FAM = { arxaia: '\u0391\u03c1\u03c7\u03b1\u03af\u03b1', latinika: '\u039b\u03b1\u03c4\u03b9\u03bd\u03b9\u03ba\u03ac', istoria: '\u0399\u03c3\u03c4\u03bf\u03c1\u03af\u03b1', ekthesi: '\u0388\u03ba\u03b8\u03b5\u03c3\u03b7' };
  var FAMC = { arxaia: '#E8A07F', latinika: '#9DB3EC', istoria: '#8FC2AC', ekthesi: '#D3A6D6' };
  var DOW = ['\u039a\u03c5\u03c1', '\u0394\u03b5\u03c5', '\u03a4\u03c1\u03af', '\u03a4\u03b5\u03c4', '\u03a0\u03ad\u03bc', '\u03a0\u03b1\u03c1', '\u03a3\u03ac\u03b2'];
  function famOf(s) { s = String(s || ''); if (s.indexOf('arxaia') === 0) return 'arxaia'; return FAM[s] ? s : null; }
  function school() {
    var out = { ok: false, open: 0, recall: 0, blind: 0, by: { arxaia: 0, latinika: 0, istoria: 0, ekthesi: 0 }, exam: null };
    var D = data(); if (!D) return out;
    var hw = null;
    try { hw = JSON.parse(localStorage.getItem('hw:v1')); } catch (e) { hw = null; }
    var tasks = (hw && hw.tasks && typeof hw.tasks === 'object') ? hw.tasks : {};
    Object.keys(tasks).forEach(function (id) {
      var t = tasks[id]; if (!t || t.done) return;
      out.open++; var f = famOf(t.subject); if (f) out.by[f]++;
    });
    var L = null; try { L = D.lads(); } catch (e) { L = null; }
    if (!L) return out;
    L.stores.forEach(function (s) {
      if (!s.ok) { out.blind++; return; }
      out.recall += s.overdue; var f = famOf(s.exam); if (f) out.by[f] += s.overdue;
    });
    var ex = (hw && hw.exams && typeof hw.exams === 'object') ? hw.exams : {}, today = WIN[13];
    Object.keys(ex).forEach(function (id) {
      var e = ex[id]; if (!e || typeof e !== 'object' || e.done || !e.date || e.date < today) return;
      if (!out.exam || e.date < out.exam.date) out.exam = e;
    });
    out.ok = true;
    return out;
  }
  function examWhen(e) {
    var d = new Date(e.date + 'T00:00:00'), n = daysAgo(e.date) * -1;
    var lab = FAM[famOf(e.subject)] || e.title || '\u0394\u03b9\u03b1\u03b3\u03ce\u03bd\u03b9\u03c3\u03bc\u03b1';
    var when = n === 0 ? '\u03c3\u03ae\u03bc\u03b5\u03c1\u03b1' : n === 1 ? '\u03b1\u03cd\u03c1\u03b9\u03bf' : DOW[d.getDay()] + ' ' + d.getDate() + '/' + (d.getMonth() + 1);
    return lab + ' \u00b7 ' + when;
  }

  /* \u2500\u2500 CSS. No min-width queries: laptop first, collapse with max-width. \u2500\u2500 */
  var CSS = `
dialog.alx{border:none;padding:0;background:transparent;max-width:100vw;max-height:100vh;
  width:100vw;height:100dvh;margin:0;overflow:visible;color:#BDB8AE;
  --a-s1:#0F1013;--a-s2:#15171B;--a-s3:#1C1F24;--a-hair:rgba(255,255,255,.075);--a-hair2:rgba(255,255,255,.13);
  --a-ink:#F2EEE6;--a-ink2:#BDB8AE;--a-ink3:#8E8A83;--a-ink4:#5F5C58;--a-acc:#D9C49A;--a-out:cubic-bezier(.22,1,.36,1);
  --a-serif:"Instrument Serif",Georgia,serif;--a-sans:Commissioner,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  font:15px/1.5 var(--a-sans);-webkit-font-smoothing:antialiased;font-feature-settings:"tnum" 1;}
dialog.alx::backdrop{background:rgba(4,5,7,.6);-webkit-backdrop-filter:blur(7px);backdrop-filter:blur(7px);}
dialog.alx:not([open]){display:none;}
dialog.alx[open]{display:flex;align-items:center;justify-content:center;}
dialog.alx *{box-sizing:border-box;}
dialog.alx a{color:inherit;text-decoration:none;}
dialog.alx button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer;}
.alx-sheet{position:relative;width:min(1100px,calc(100vw - 64px));max-height:min(830px,calc(100dvh - 44px));display:flex;flex-direction:column;
  background:var(--a-s1);border-radius:18px;
  box-shadow:inset 0 0 0 1px var(--a-hair2),inset 0 1px 0 rgba(255,255,255,.05),0 40px 120px rgba(0,0,0,.65);
  animation:alxIn .34s var(--a-out) both;transform-origin:var(--ox,90%) var(--oy,100%);}
.alx-sheet>*{flex-shrink:0;}
@keyframes alxIn{from{opacity:0;transform:scale(.94) translate(var(--dx,0),var(--dy,0));}to{opacity:1;transform:none;}}
dialog.alx.out .alx-sheet{animation:alxOut .18s ease-out both;}
@keyframes alxOut{to{opacity:0;transform:scale(.97);}}
dialog.alx.out::backdrop{opacity:0;transition:opacity .18s;}
.alx-grab{display:none;}
.alx-hd{display:flex;align-items:center;gap:16px;padding:20px 24px 18px 26px;border-bottom:1px solid var(--a-hair);}
.alx-q{flex:1;min-width:0;display:flex;align-items:center;gap:14px;}
.alx-q svg{width:20px;height:20px;color:var(--a-ink3);flex:none;}
.alx-search{flex:1;min-width:0;background:none;border:0;outline:0;color:var(--a-ink);font:400 22px/1.2 var(--a-sans);padding:6px 0;-webkit-appearance:none;}
.alx-search::placeholder{color:var(--a-ink4);}
.alx-home{display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 13px;border-radius:999px;color:var(--a-ink2);font-size:13.5px;
  box-shadow:inset 0 0 0 1px var(--a-hair);transition:background .2s,color .2s;}
.alx-home:hover{background:var(--a-s2);color:var(--a-ink);}
.alx-home svg{width:15px;height:15px;}
.alx-esc{font:500 11.5px/1 var(--a-sans);color:var(--a-ink3);height:28px;padding:0 9px;display:grid;place-items:center;border-radius:7px;box-shadow:inset 0 0 0 1px var(--a-hair2);}
.alx-x{display:none;}
.alx-body{overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;flex:1 1 auto;min-height:0;}
.alx-body>*{flex-shrink:0;}
.alx-pins{display:grid;grid-template-columns:repeat(6,1fr);border-bottom:1px solid var(--a-hair);}
.alx-pin{position:relative;display:flex;flex-direction:column;gap:2px;min-width:0;padding:15px 18px 16px 22px;border-right:1px solid var(--a-hair);transition:background .2s var(--a-out);outline:0;}
.alx-pin:last-child{border-right:0;}
.alx-pin .t{display:flex;align-items:center;gap:8px;font:500 11px/1.2 var(--a-sans);letter-spacing:.08em;text-transform:uppercase;color:var(--a-ink3);}
.alx-pin .t i{width:6px;height:6px;border-radius:50%;flex:none;}
.alx-pin .t em{margin-left:auto;font-style:normal;color:var(--a-ink4);letter-spacing:0;}
.alx-pin .f{font:italic 400 36px/1 var(--a-serif);color:var(--a-ink);letter-spacing:-.01em;margin-top:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.alx-pin .f small{font:400 13px var(--a-sans);font-style:normal;color:var(--a-ink3);margin-left:4px;letter-spacing:0;}
.alx-pin .s{font-size:12.5px;color:var(--a-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-height:1.5em;}
.alx-pin .bar{height:2px;border-radius:2px;background:var(--a-hair);margin-top:10px;overflow:hidden;}
.alx-pin .bar b{display:block;height:100%;border-radius:2px;transform-origin:left;}
.alx-pin:hover,.alx-pin.sel{background:var(--a-s2);}
.alx-idx{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr;column-gap:36px;padding:2px 28px 10px;}
.alx-col{min-width:0;}
.alx-tabs{display:none;}
.alx-g .gh{padding:22px 0 0;}
.alx-g .gt{display:flex;align-items:baseline;gap:10px;}
.alx-g .gn{font:italic 400 30px/1 var(--a-serif);color:var(--a-ink);letter-spacing:-.01em;}
.alx-g .gs{margin-left:auto;font-size:12.5px;color:var(--a-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.alx-g .gs b{font-weight:500;color:var(--a-ink2);}
.alx-strip{display:grid;grid-template-columns:repeat(14,1fr);gap:3px;height:28px;margin:14px 0 5px;align-items:end;}
.alx-strip i{display:block;height:100%;border-radius:2px 2px 1px 1px;transform-origin:bottom;transform:scaleY(var(--s));
  background:linear-gradient(180deg,rgba(255,255,255,.30),rgba(255,255,255,.11));box-shadow:inset 0 1px 0 rgba(255,255,255,.10);
  transition:transform .38s var(--a-out),opacity .25s;}
.alx-strip i.z{background:rgba(255,255,255,.08);box-shadow:none;}
.alx-strip i.t:not(.z),.alx-g.focus .alx-strip i.on{background:linear-gradient(180deg,#D9C49A,#9C8A63);}
.alx-g.focus .alx-strip i{opacity:.28;}
.alx-g.focus .alx-strip i.on{opacity:1;}
.alx-sx{display:flex;justify-content:space-between;font-size:11px;color:var(--a-ink3);margin-bottom:8px;}
.alx-rows{border-top:1px solid var(--a-hair);}
.alx-r{position:relative;display:flex;align-items:center;gap:10px;min-height:39px;padding:0 2px;border-bottom:1px solid rgba(255,255,255,.05);outline:0;transition:background .2s;}
.alx-r .dt{display:none;width:6px;height:6px;border-radius:50%;flex:none;margin-left:-2px;box-shadow:inset 0 0 0 1.25px var(--a-acc);}
.alx-r.quiet .dt{display:block;}
.alx-r .n{font-size:15px;color:var(--a-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;flex:0 1 auto;min-width:0;transition:transform .3s var(--a-out),color .25s;}
.alx-r.old .n{color:var(--a-ink2);}
.alx-r.quiet .n{color:var(--a-ink3);}
.alx-r .a{margin-left:auto;padding-left:8px;font-size:13px;color:var(--a-ink3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:58%;transition:opacity .2s;}
.alx-r .a b{font-weight:400;color:var(--a-ink);}
.alx-r.quiet .a,.alx-r.quiet .a b{color:var(--a-acc);}
.alx-r .x2{font-size:12px;color:var(--a-ink3);margin-left:6px;}
.alx-r .ar{position:absolute;right:2px;color:var(--a-acc);opacity:0;transform:translateX(-6px);transition:opacity .25s var(--a-out),transform .25s var(--a-out);}
.alx-r.here .n::after{content:"";display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--a-acc);margin-left:8px;vertical-align:middle;}
.alx-r:hover .n,.alx-r.sel .n{transform:translateX(3px);color:#fff;}
.alx-r:hover .ar,.alx-r.sel .ar{opacity:1;transform:none;}
.alx-r:hover .a,.alx-r.sel .a{opacity:0;}
.alx-r:hover,.alx-r.sel{background:linear-gradient(90deg,rgba(255,255,255,.035),rgba(255,255,255,0) 85%);}
.alx-r.sel::before{content:"";position:absolute;left:-10px;top:10px;bottom:10px;width:2px;border-radius:2px;background:var(--a-acc);}
.alx-ss{display:flex;flex-direction:column;margin-top:20px;padding:22px 22px 18px;border-radius:14px;outline:0;
  background:linear-gradient(180deg,var(--a-s2),rgba(21,23,27,.4));box-shadow:inset 0 0 0 1px var(--a-hair2),inset 0 1px 0 rgba(255,255,255,.05);
  transition:box-shadow .25s var(--a-out),transform .16s var(--a-out);}
.alx-ss:hover,.alx-ss.sel{box-shadow:inset 0 0 0 1px rgba(217,196,154,.38),inset 0 1px 0 rgba(255,255,255,.06);}
.alx-ss:active{transform:scale(.99);}
.alx-ss .tt{display:flex;align-items:baseline;gap:10px;}
.alx-ss .nm{font:italic 400 38px/1 var(--a-serif);color:var(--a-ink);letter-spacing:-.015em;}
.alx-ss .go{margin-left:auto;color:var(--a-acc);font-size:18px;transition:transform .3s var(--a-out);}
.alx-ss:hover .go,.alx-ss.sel .go{transform:translateX(4px);}
.alx-ss .ans{margin-top:9px;font-size:14.5px;line-height:1.45;color:var(--a-ink2);text-wrap:pretty;}
.alx-ss .big{display:flex;align-items:baseline;gap:10px;margin-top:18px;}
.alx-ss .fg{font:italic 400 76px/.8 var(--a-serif);color:var(--a-ink);letter-spacing:-.02em;}
.alx-ss .lb{font-size:14px;color:var(--a-ink2);}
.alx-ss .sd{margin-left:auto;text-align:right;font-size:13px;line-height:1.55;color:var(--a-ink3);}
.alx-ss .sd b{font-weight:400;color:var(--a-ink);}
.alx-ss .subj{display:grid;grid-template-columns:1fr 1fr;column-gap:18px;row-gap:10px;margin-top:20px;}
.alx-sb{display:grid;grid-template-columns:auto 1fr auto;align-items:center;column-gap:8px;font-size:13.5px;color:var(--a-ink);}
.alx-sb i{width:7px;height:7px;border-radius:50%;}
.alx-sb em{font-style:normal;color:var(--a-ink);}
.alx-sb.z span,.alx-sb.z em{color:var(--a-ink3);}
.alx-sb .br{grid-column:1/-1;height:4px;border-radius:4px;background:rgba(255,255,255,.06);margin-top:6px;overflow:hidden;}
.alx-sb .br b{display:block;height:100%;border-radius:4px;transform-origin:left;}
.alx-ss .sk{margin-top:18px;}
.alx-ss .sk .alx-strip{margin:0 0 5px;height:24px;}
.alx-ss .nx{display:flex;align-items:baseline;gap:10px;white-space:nowrap;margin-top:16px;padding-top:14px;border-top:1px solid var(--a-hair);font-size:13px;color:var(--a-ink3);}
.alx-ss .nx b{margin-left:auto;font-weight:400;color:var(--a-ink);overflow:hidden;text-overflow:ellipsis;}
.alx-res{padding:10px 26px 14px;max-width:760px;}
.alx-res .alx-r{min-height:48px;}
.alx-res .alx-r .g{font-size:12.5px;color:var(--a-ink3);margin-left:auto;}
.alx-res .alx-r .n mark{background:none;color:var(--a-acc);}
.alx-res .alx-r .n .in{margin-left:12px;font-size:13px;color:var(--a-ink3);}
.alx-res .alx-r:hover .g,.alx-res .alx-r.sel .g{opacity:0;}
.alx-none{padding:28px 0 8px;color:var(--a-ink2);font-size:15px;}
.alx-none b{color:var(--a-ink);font-weight:500;}
.alx-ft{display:flex;align-items:center;gap:22px;flex-wrap:wrap;padding:14px 26px 16px;border-top:1px solid var(--a-hair);font-size:13px;color:var(--a-ink3);}
.alx-quiet{flex:1 1 380px;min-width:0;color:var(--a-ink2);}
.alx-quiet a{color:var(--a-ink);border-bottom:1px solid var(--a-hair2);transition:border-color .2s;}
.alx-quiet a:hover{border-color:var(--a-acc);}
.alx-quiet .d{display:inline-block;width:5px;height:5px;border-radius:50%;background:var(--a-acc);margin-right:9px;vertical-align:middle;}
.alx-tools{display:flex;gap:16px;flex-wrap:wrap;}
.alx-tools a{color:var(--a-ink3);transition:color .2s;} .alx-tools a:hover{color:var(--a-ink);}
.alx-keys{display:flex;gap:14px;color:var(--a-ink4);}
.alx-keys b{font-weight:500;color:var(--a-ink3);}
.alx-close{position:fixed;right:18px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:2;height:48px;display:inline-flex;align-items:center;
  padding:5px 18px 5px 5px;border-radius:999px;color:var(--a-ink);font:500 14.5px/1 var(--a-sans);
  background:linear-gradient(180deg,rgba(38,40,46,.92),rgba(17,18,22,.96));
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.10),inset 0 1px 0 rgba(255,255,255,.10),0 1px 1px rgba(0,0,0,.55),0 20px 44px -14px rgba(0,0,0,.75);}
.alx-close .well{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;margin-right:11px;
  background:radial-gradient(120% 120% at 50% 0%,rgba(255,255,255,.07),rgba(255,255,255,.015));box-shadow:inset 0 0 0 1px rgba(255,255,255,.07);}
.alx-close svg{width:14px;height:14px;}
.alx-close path{stroke-dasharray:15;stroke-dashoffset:15;animation:alxDraw .3s var(--a-out) .12s forwards;}
.alx-close path+path{animation-delay:.2s;}
@keyframes alxDraw{to{stroke-dashoffset:0;}}
.alx-sheet .rise{animation:alxRise .42s var(--a-out) both;animation-delay:calc(60ms + var(--i,0)*28ms);}
@keyframes alxRise{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
/* the Close pill sits in the corner only where the panel leaves it room */
@media (max-width:1360px){
  .alx-close{display:none;}
  .alx-x{display:grid;place-items:center;width:36px;height:36px;border-radius:50%;color:var(--a-ink2);box-shadow:inset 0 0 0 1px var(--a-hair);font-size:13px;}
  .alx-esc{display:none;}
}
@media (max-width:1040px){
  .alx-idx{grid-template-columns:1fr 1fr;row-gap:6px;}
  .alx-pins{grid-template-columns:repeat(3,1fr);}
  .alx-pin:nth-child(3n){border-right:0;} .alx-pin:nth-child(-n+3){border-bottom:1px solid var(--a-hair);}
  .alx-keys{display:none;}
}
@media (max-width:600px){
  dialog.alx[open]{align-items:flex-end;}
  .alx-sheet{width:100%;max-height:90dvh;border-radius:24px 24px 0 0;overflow-y:auto;overscroll-behavior:contain;
    animation:alxUp .34s var(--a-out) both;}
  @keyframes alxUp{from{opacity:0;transform:translateY(40px);}to{opacity:1;transform:none;}}
  dialog.alx.out .alx-sheet{animation:alxDown .2s ease-out both;}
  @keyframes alxDown{to{opacity:0;transform:translateY(60px);}}
  .alx-sheet.drag{animation:none;transition:none;}
  .alx-grab{display:block;position:sticky;top:0;z-index:3;width:40px;height:5px;border-radius:5px;background:var(--a-hair2);margin:9px auto 0;}
  .alx-hd{position:sticky;top:0;z-index:2;background:var(--a-s1);padding:10px 14px 12px 18px;gap:10px;}
  .alx-search{font-size:17px;padding:10px 0;}
  .alx-esc,.alx-home span,.alx-keys,.alx-close{display:none;}
  .alx-home{width:44px;height:44px;padding:0;justify-content:center;}
  .alx-x{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;color:var(--a-ink2);box-shadow:inset 0 0 0 1px var(--a-hair);font-size:15px;}
  .alx-body{overflow:visible;flex:none;}
  .alx-pin{padding:13px 12px 14px 14px;}
  .alx-pin .t em{display:none;}
  .alx-pin .f{font-size:30px;margin-top:8px;}
  .alx-pin .f small,.alx-pin .s{font-size:12px;}
  .alx-idx{display:flex;flex-direction:column;padding:0 18px 4px;}
  .alx-col{display:contents;}
  .alx-ss{order:-1;margin-top:16px;padding:20px 18px 16px;}
  .alx-ss .nm{font-size:34px;}
  .alx-ss .fg{font-size:64px;}
  .alx-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin:16px 0 0;padding:4px;border-radius:12px;background:var(--a-s2);box-shadow:inset 0 0 0 1px var(--a-hair);}
  .alx-tabs button{height:44px;border-radius:9px;font-size:14px;color:var(--a-ink3);transition:background .2s,color .2s;}
  .alx-tabs button[aria-selected="true"]{background:var(--a-s3);color:var(--a-ink);box-shadow:inset 0 0 0 1px var(--a-hair2);}
  .alx-g{display:none;} .alx-g.on{display:block;}
  .alx-g .gh{padding-top:16px;}
  .alx-g .gn{font-size:28px;}
  .alx-strip{height:34px;gap:4px;}
  .alx-r{min-height:48px;}
  .alx-r.sel::before{display:none;}
  .alx-res{padding:6px 18px 12px;}
  .alx-ft{padding:16px 18px 28px;gap:14px;}
  .alx-quiet{flex-basis:100%;}
}
@media (prefers-reduced-motion:reduce){
  .alx-sheet,dialog.alx.out .alx-sheet,.alx-sheet .rise,.alx-close path{animation:none!important;}
  .alx-close path{stroke-dashoffset:0;}
  .alx-strip i,.alx-r .n,.alx-r .ar{transition:none;}
}
`;

  var SEARCH_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>';
  var HOME_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1Z"/></svg>';
  var X_SVG = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2.5 2.5l9 9"/><path d="M11.5 2.5l-9 9"/></svg>';

  var dlg = null, sheet = null, input = null, bodyEl = null, footEl = null, sel = -1, TAB = 'Body', SUMS = {};

  function loadFonts() {
    try {
      if (document.querySelector('link[data-alx-fonts]')) return;
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.setAttribute('data-alx-fonts', '');
      l.href = 'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Commissioner:wght@400;500;600&display=swap';
      document.head.appendChild(l);
    } catch (e) {}
  }
  /* The readers and the two pure files they lean on, fetched on first open.
     None of them writes; a failed load leaves dashes, never zeros. */
  var dataWanted = false;
  function loadData() {
    if (dataWanted) return; dataWanted = true;
    var need = [];
    if (!window.ALSLadders) need.push('ladders.js');
    if (!window.ALSWater) need.push('water.js');
    if (!window.ALSLauncherData) need.push('launcher-data.js');
    var left = need.length;
    if (!left) return;
    need.forEach(function (src) {
      var s = document.createElement('script'); s.src = src; s.async = false;
      s.onload = s.onerror = function () {
        if (--left === 0) { actCache = {}; if (dlg && dlg.open && !(input && input.value)) { paintIndex(); paintFoot(); } }
      };
      document.head.appendChild(s);
    });
  }

  function build() {
    if (dlg) return dlg;
    var st = document.createElement('style');
    st.id = 'alx-style'; st.textContent = CSS;
    document.head.appendChild(st);
    loadFonts();
    dlg = document.createElement('dialog');
    dlg.className = 'alx';
    dlg.setAttribute('aria-label', 'All pages');
    dlg.innerHTML =
      '<div class="alx-sheet" role="document">' +
        '<div class="alx-grab" aria-hidden="true"></div>' +
        '<div class="alx-hd">' +
          '<label class="alx-q">' + SEARCH_SVG +
            '<input class="alx-search" id="alxQ" type="text" autocomplete="off" autocorrect="off" spellcheck="false" ' +
            'placeholder="Go to\u2026" aria-label="Search your pages"></label>' +
          '<a class="alx-home" href="index.html">' + HOME_SVG + '<span>Home</span></a>' +
          '<span class="alx-esc" aria-hidden="true">esc</span>' +
          '<button type="button" class="alx-x" id="alxX" aria-label="Close">\u2715</button>' +
        '</div>' +
        '<div class="alx-body" id="alxBody"></div>' +
        '<div class="alx-ft" id="alxFt"></div>' +
      '</div>' +
      '<button type="button" class="alx-close" id="alxClose" aria-label="Close"><span class="well">' + X_SVG + '</span>Close</button>';
    document.body.appendChild(dlg);
    sheet = dlg.querySelector('.alx-sheet');
    input = dlg.querySelector('#alxQ');
    bodyEl = dlg.querySelector('#alxBody');
    footEl = dlg.querySelector('#alxFt');
    dlg.querySelector('#alxX').addEventListener('click', close);
    dlg.querySelector('#alxClose').addEventListener('click', close);
    input.addEventListener('input', function () { search(input.value); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    // Esc: clear the search first, then close \u2014 with the closing motion.
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); if (input.value) { input.value = ''; search(''); } else close(); });
    dlg.addEventListener('keydown', onKey);
    bodyEl.addEventListener('mouseover', function (e) { var a = e.target.closest('.alx-idx .alx-r'); if (a) focusRow(a); });
    bodyEl.addEventListener('mouseout', function (e) {
      var g = e.target.closest('.alx-g'); if (!g) return;
      var to = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest('.alx-g') : null;
      if (to !== g) unfocus(g);
    });
    bodyEl.addEventListener('click', function (e) {
      var t = e.target.closest('.alx-tabs button'); if (!t) return;
      TAB = t.getAttribute('data-t');
      bodyEl.querySelectorAll('.alx-tabs button').forEach(function (b) { b.setAttribute('aria-selected', String(b === t)); });
      bodyEl.querySelectorAll('.alx-g').forEach(function (g) { g.classList.toggle('on', g.getAttribute('data-g') === TAB); });
    });
    wireDrag();
    return dlg;
  }

  /* \u2500\u2500 painting \u2500\u2500 */
  function row(it, nameHtml, right, cls) {
    return '<a class="alx-r' + (cls || '') + (it.href === here() ? ' here' : '') + '" href="' + esc(it.href) + '" data-h="' + esc(it.href) + '"' +
      (it.ext ? ' target="_blank" rel="noopener"' : '') + '>' +
      '<span class="dt" aria-hidden="true"></span>' +
      '<span class="n">' + nameHtml + (it.ext ? '<span class="x2" aria-hidden="true">\u2197</span>' : '') + '</span>' +
      right + '<span class="ar" aria-hidden="true">\u2192</span></a>';
  }
  function pinHtml(p, i) {
    var m = M(p.href), ok = hasValue(m), f = ok ? fig(m) : '\u2014', u = ok ? (m.unit || '') : '', s = m && m.note ? m.note : '';
    var bar = '';
    if (ok && typeof m.hero === 'number' && /^\/\s*\d/.test(u)) {
      var of = parseFloat(u.replace(/^\/\s*/, ''));
      if (of > 0) bar = '<span class="bar"><b style="background:' + p.c + ';transform:scaleX(' + Math.min(1, m.hero / of).toFixed(3) + ')"></b></span>';
    }
    return '<a class="alx-pin rise" style="--i:' + i + '" href="' + p.href + '" data-h="' + p.href + '">' +
      '<span class="t"><i style="background:' + p.c + '"></i>' + esc(p.name) + '<em>' + (i + 1) + '</em></span>' +
      '<span class="f">' + esc(f) + (u ? '<small>' + esc(u) + '</small>' : '') + '</span>' +
      '<span class="s">' + esc(s) + '</span>' + bar + '</a>';
  }
  function stripHtml(vals, mx, today) {
    return '<span class="alx-strip" aria-hidden="true">' + vals.map(function (v, k) {
      var sc = v ? (.18 + .82 * v / mx).toFixed(3) : '.07';
      return '<i class="' + (v ? '' : 'z') + (k === 13 && today ? ' t' : '') + '" style="--s:' + sc + '" data-s="' + sc + '"></i>';
    }).join('') + '</span>';
  }
  function card() {
    var S = school(), m = M('homework.html'), act = activity(SCHOOL.k), u = strip14(act);
    var n = u.reduce(function (t, v) { return t + v; }, 0);
    var fg = '\u2014', lb = '', ans = '';
    if (S.ok && !S.blind) {
      var tot = S.open + S.recall;
      fg = String(tot); lb = tot ? '\u03bd\u03b1 \u03ba\u03ac\u03bd\u03b5\u03b9\u03c2' : '';
      if (!tot) { lb = '\u03ba\u03b1\u03b8\u03b1\u03c1\u03ac'; ans = '\u03a4\u03af\u03c0\u03bf\u03c4\u03b1 \u03b4\u03b5\u03bd \u03c0\u03b5\u03c1\u03b9\u03bc\u03ad\u03bd\u03b5\u03b9. \u039a\u03b1\u03b8\u03b1\u03c1\u03ac.'; }
      else {
        var parts = [];
        if (S.open) parts.push(S.open + (S.open === 1 ? ' \u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1' : ' \u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b5\u03c2'));
        if (S.recall) parts.push(S.recall + ' \u03b3\u03b9\u03b1 \u03b1\u03bd\u03ac\u03ba\u03bb\u03b7\u03c3\u03b7');
        ans = parts.length === 1 ? '\u039c\u03ad\u03bd\u03bf\u03c5\u03bd ' + parts[0] + '.' : '\u039c\u03ad\u03bd\u03bf\u03c5\u03bd ' + tot + ': ' + parts.join(' \u03ba\u03b1\u03b9 ') + '.';
      }
    } else if (m && m.note) { ans = m.note; }
    var mx = Math.max(1, S.by.arxaia, S.by.latinika, S.by.istoria, S.by.ekthesi);
    var subj = ['arxaia', 'latinika', 'istoria', 'ekthesi'].map(function (f) {
      var c = S.by[f];
      return '<span class="alx-sb' + (c ? '' : ' z') + '"><i style="background:' + FAMC[f] + '"></i><span>' + FAM[f] + '</span><em>' + (S.ok ? c : '\u2014') + '</em>' +
        '<span class="br"><b style="background:' + FAMC[f] + ';transform:scaleX(' + (S.ok ? (c / mx) : 0).toFixed(3) + ')"></b></span></span>';
    }).join('');
    return '<a class="alx-ss" href="' + SCHOOL.href + '" data-h="' + SCHOOL.href + '">' +
      '<span class="tt"><span class="nm">School Studies</span><span class="go" aria-hidden="true">\u2192</span></span>' +
      (ans ? '<span class="ans">' + esc(ans) + '</span>' : '') +
      '<span class="big"><span class="fg">' + esc(fg) + '</span><span class="lb">' + esc(lb) + '</span>' +
        (S.ok ? '<span class="sd"><b>' + S.open + '</b> ' + (S.open === 1 ? '\u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1' : '\u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b5\u03c2') + '<br><b>' + S.recall + '</b> \u03b1\u03bd\u03ac\u03ba\u03bb\u03b7\u03c3\u03b7</span>' : '') + '</span>' +
      '<span class="subj">' + subj + '</span>' +
      (act ? '<span class="sk">' + stripHtml(u, 1, u[13]) +
        '<span class="alx-sx"><span>' + n + ' \u03b1\u03c0\u03cc \u03c4\u03b9\u03c2 14 \u03c4\u03b5\u03bb\u03b5\u03c5\u03c4\u03b1\u03af\u03b5\u03c2 \u03bc\u03ad\u03c1\u03b5\u03c2</span><span>\u03c3\u03ae\u03bc\u03b5\u03c1\u03b1</span></span></span>' : '') +
      (S.exam ? '<span class="nx"><span>\u0395\u03c0\u03cc\u03bc\u03b5\u03bd\u03bf \u03b4\u03b9\u03b1\u03b3\u03ce\u03bd\u03b9\u03c3\u03bc\u03b1</span><b>' + esc(examWhen(S.exam)) + '</b></span>' : '') +
    '</a>';
  }
  var COLS = [[], ['Body'], ['Train', 'Life'], ['Mind']];
  function paintIndex() {
    makeWin();
    var h = '<div class="alx-pins">' + PINS.map(pinHtml).join('') + '</div><div class="alx-idx">' +
      '<div class="alx-tabs" role="tablist">' + GROUPS.map(function (G) {
        return '<button type="button" role="tab" data-t="' + G.name + '" aria-selected="' + (G.name === TAB) + '">' + G.name + '</button>';
      }).join('') + '</div>';
    COLS.forEach(function (names, c) {
      h += '<div class="alx-col rise" style="--i:' + (6 + c) + '">';
      if (c === 0) h += card();
      GROUPS.forEach(function (G) { if (names.indexOf(G.name) > -1) h += groupHtml(G); });
      h += '</div>';
    });
    bodyEl.innerHTML = h + '</div>';
    sel = -1;
  }
  function groupHtml(G) {
    var per = [], tracked = 0, wk = 0, rows = '';
    for (var i = 0; i < 14; i++) per.push(0);
    G.items.forEach(function (it) {
      var act = activity(it.k), ago = daysAgo(newest(act));
      it._u = act ? strip14(act) : null;
      if (act) { tracked++; it._u.forEach(function (v, k) { per[k] += v; }); if (ago >= 0 && ago < 7) wk++; }
      var quiet = ago >= QUIET, old = !quiet && !(ago >= 0 && ago < 7) && !!act;
      var st = quiet ? ageWords(ago) : (it.m ? stateOf(it.href) : '') || ageText(ago);
      rows += row(it, esc(it.name), '<span class="a">' + (quiet ? esc(st) : figs(st)) + '</span>', (quiet ? ' quiet' : '') + (old ? ' old' : ''));
    });
    SUMS[G.name] = tracked ? '<b>' + wk + '</b> of ' + tracked + ' this week' : '';
    return '<div class="alx-g' + (G.name === TAB ? ' on' : '') + '" data-g="' + G.name + '">' +
      '<div class="gh"><div class="gt"><span class="gn">' + G.name + '</span><span class="gs">' + SUMS[G.name] + '</span></div>' +
      stripHtml(per, Math.max(1, tracked), per[13]) +
      '<div class="alx-sx"><span>2 weeks ago</span><span>today</span></div></div>' +
      '<div class="alx-rows">' + rows + '</div></div>';
  }
  function paintFoot() {
    makeWin();
    /* the three longest-quiet, picked by hand: nothing in this file sorts */
    var quiet = [];
    GROUPS.forEach(function (G) { G.items.forEach(function (it) {
      var ago = daysAgo(newest(activity(it.k)));
      if (ago >= QUIET) quiet.push({ it: it, ago: ago });
    }); });
    var pick = [];
    while (quiet.length && pick.length < 3) {
      var bi = 0; for (var i = 1; i < quiet.length; i++) if (quiet[i].ago > quiet[bi].ago) bi = i;
      pick.push(quiet.splice(bi, 1)[0]);
    }
    var h = '<div class="alx-quiet">' + (pick.length
      ? '<span class="d"></span>Gone quiet: ' + pick.map(function (q) { return '<span style="white-space:nowrap"><a href="' + esc(q.it.href) + '">' + esc(q.it.name) + '</a> ' + ageWords(q.ago) + '</span>'; }).join(' \u00b7 ') + '.'
      : 'Nothing has gone quiet. Everything you track was used in the last two weeks.') + '</div>';
    h += '<div class="alx-tools">' + TOOLS.map(function (t) { return '<a href="' + esc(t.href) + '">' + esc(t.name) + '</a>'; }).join('') + '</div>';
    h += '<div class="alx-keys"><span><b>\u2191\u2193</b> move</span><span><b>\u21b5</b> open</span><span><b>1\u20136</b> today</span></div>';
    footEl.innerHTML = h;
  }

  /* \u2500\u2500 a row lights the days it was used, in its group's strip \u2500\u2500 */
  function itemOf(h) {
    for (var g = 0; g < GROUPS.length; g++) for (var i = 0; i < GROUPS[g].items.length; i++) if (GROUPS[g].items[i].href === h) return GROUPS[g].items[i];
    return null;
  }
  function focusRow(a) {
    var g = a && a.closest('.alx-g'); if (!g) return;
    var it = itemOf(a.getAttribute('data-h')); if (!it) return;
    unfocus(g); g.classList.add('focus');
    g.querySelectorAll('.alx-strip i').forEach(function (b, k) {
      var on = it._u && it._u[k]; b.classList.toggle('on', !!on); b.style.setProperty('--s', on ? '.78' : '.07');
    });
    var n = it._u ? it._u.reduce(function (t, v) { return t + v; }, 0) : -1;
    g.querySelector('.gs').innerHTML = '<b>' + esc(it.name) + '</b> \u00b7 ' +
      (n < 0 ? 'no history kept' : n === 0 ? 'not in 2 weeks' : n === 14 ? 'every day' : n + ' of 14 days');
  }
  function unfocus(only) {
    (only ? [only] : bodyEl.querySelectorAll('.alx-g.focus')).forEach(function (G) {
      G.classList.remove('focus');
      G.querySelectorAll('.alx-strip i').forEach(function (b) { b.classList.remove('on'); b.style.setProperty('--s', b.getAttribute('data-s')); });
      var s = G.querySelector('.gs'); if (s) s.innerHTML = SUMS[G.getAttribute('data-g')] || '';
    });
  }

  /* \u2500\u2500 search: names, then the words behind them; ranked in buckets, never sorted \u2500\u2500 */
  function search(raw) {
    var s = fold(raw.trim());
    if (!s) { paintIndex(); return; }
    var pool = [{ href: SCHOOL.href, name: SCHOOL.name, g: 'Study', words: SUBJECTS.concat(['school', 'study', 'homework', '\u03c3\u03c7\u03bf\u03bb\u03b5\u03b9\u03bf']) }];
    GROUPS.forEach(function (G) { G.items.forEach(function (it) { pool.push({ href: it.href, name: it.name, g: G.name, words: [] }); }); });
    PINS.forEach(function (p) { pool.push({ href: p.href, name: p.name, g: 'Today', words: [] }); });
    SEARCH_ONLY.concat(TOOLS).forEach(function (it) { pool.push({ href: it.href, name: it.name, g: it.g || 'Tools', ext: it.ext, words: [] }); });
    var B = { 100: [], 80: [], 60: [], 40: [] }, seen = {};
    pool.forEach(function (it) {
      if (seen[it.href]) return;
      var n = fold(it.name), at = n.indexOf(s), sc = -1, inside = '';
      if (at === 0) sc = 100; else if (at > 0) sc = n[at - 1] === ' ' ? 80 : 60;
      else {
        it.words.some(function (w) { if (fold(w).split(' ').some(function (x) { return x.indexOf(s) === 0; })) { inside = w; return true; } return false; });
        if (inside) sc = 40;
      }
      if (sc < 0) return;
      seen[it.href] = 1;
      B[sc].push({ it: it, at: at, inside: SUBJECTS.indexOf(inside) > -1 ? inside : '' });
    });
    var hits = B[100].concat(B[80], B[60], B[40]);
    if (!hits.length) {
      bodyEl.innerHTML = '<div class="alx-res"><div class="alx-none">Nothing called <b>\u201c' + esc(raw.trim()) + '\u201d</b>. Try \u201cfood\u201d, \u201c\u03bb\u03b1\u03c4\u201d or \u201csleep\u201d.</div></div>';
      sel = -1; return;
    }
    var h = '<div class="alx-res">';
    hits.slice(0, 8).forEach(function (x) {
      var it = x.it, nm = esc(it.name);
      if (x.at >= 0) nm = esc(it.name.slice(0, x.at)) + '<mark>' + esc(it.name.slice(x.at, x.at + s.length)) + '</mark>' + esc(it.name.slice(x.at + s.length));
      if (x.inside) nm += '<span class="in">' + esc(x.inside) + ' is in here</span>';
      h += row(it, nm, '<span class="g">' + esc(it.g) + '</span>');
    });
    bodyEl.innerHTML = h + '</div>';
    sel = 0; mark();
  }

  /* \u2500\u2500 keyboard \u2500\u2500 */
  function links() { return Array.prototype.slice.call(bodyEl.querySelectorAll('.alx-ss, .alx-r, .alx-pin')); }
  function mark() {
    var L = links();
    L.forEach(function (a, i) { a.classList.toggle('sel', i === sel); });
    var a = L[sel]; if (a && a.scrollIntoView) a.scrollIntoView({ block: 'nearest' });
    unfocus(); if (a && a.closest('.alx-idx') && a.classList.contains('alx-r')) focusRow(a);
  }
  function onKey(e) {
    var L = links();
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      sel = sel < 0 ? 0 : Math.max(0, Math.min(L.length - 1, sel + (e.key === 'ArrowDown' ? 1 : -1)));
      mark();
    } else if (e.key === 'Enter') {
      var a = L[sel < 0 ? 0 : sel];
      if (a) { e.preventDefault(); a.click(); }
    } else if (!input.value && /^[1-6]$/.test(e.key) && !e.metaKey && !e.ctrlKey && !e.altKey) {
      var p = bodyEl.querySelectorAll('.alx-pin')[+e.key - 1];
      if (p) { e.preventDefault(); p.click(); }
    }
  }

  /* \u2500\u2500 phone: pull the sheet down to close \u2500\u2500 */
  function wireDrag() {
    var y0 = null, dy = 0;
    [dlg.querySelector('.alx-grab'), dlg.querySelector('.alx-hd')].forEach(function (h) {
      h.addEventListener('pointerdown', function (e) {
        if (!phone() || e.target.closest('input,a,button')) return;
        y0 = e.clientY; dy = 0; sheet.classList.add('drag');
        try { h.setPointerCapture(e.pointerId); } catch (x) {}
      });
      h.addEventListener('pointermove', function (e) { if (y0 == null) return; dy = Math.max(0, e.clientY - y0); sheet.style.transform = 'translateY(' + dy + 'px)'; });
      function up() {
        if (y0 == null) return; y0 = null; sheet.classList.remove('drag');
        if (dy > 90) close(); else sheet.style.transform = '';
      }
      h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up);
    });
  }

  /* \u2500\u2500 open from the button's corner; close faster \u2500\u2500 */
  function fab() { return document.getElementById('tbAll'); }
  var closing = 0;
  function open() {
    build();
    clearTimeout(closing); dlg.classList.remove('out'); sheet.style.transform = '';
    loadData();
    input.value = '';
    try { paintIndex(); paintFoot(); } catch (e) {}
    var f = fab();
    if (f && f.getBoundingClientRect) {
      var r = f.getBoundingClientRect();
      sheet.style.setProperty('--ox', Math.round(r.left + r.width / 2 - (window.innerWidth - sheet.offsetWidth) / 2) + 'px');
      sheet.style.setProperty('--oy', '100%');
    }
    if (!dlg.open) dlg.showModal();
    if (f) { f.classList.add('open'); f.setAttribute('aria-expanded', 'true'); }
    // Only reach for the keyboard on a device that has one: on a phone the
    // software keyboard would cover half the sheet.
    if (!phone()) { try { input.focus(); } catch (e) {} }
    if (bodyEl) bodyEl.scrollTop = 0;
  }
  function close() {
    if (!dlg || !dlg.open || dlg.classList.contains('out')) return;
    var f = fab(); if (f) { f.classList.remove('open'); f.setAttribute('aria-expanded', 'false'); }
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    dlg.classList.add('out');
    closing = setTimeout(function () {
      try { dlg.close(); } catch (e) {}
      dlg.classList.remove('out'); sheet.style.transform = '';
    }, reduce ? 0 : 190);
  }
  function toggle() { (dlg && dlg.open && !dlg.classList.contains('out')) ? close() : open(); }

  // "/" opens it from a keyboard, unless the caret is already in a field.
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
    e.preventDefault(); open();
  });

  window.ALSLauncher = { open: open, close: close, toggle: toggle };
})();
