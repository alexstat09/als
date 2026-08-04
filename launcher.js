/* launcher.js — "All": every page in MÉTRON, one press from anywhere.
   Injected by topbar.js, so it exists on every page that carries the shell.

   ── WHY THIS EXISTS ─────────────────────────────────────────────────────
   Alex: "there are too many pages, most of them are so many scrolls away at
   my phone I just forget about them and don't press them any time."
   Measured, he was right: Home is ~5,000px at a 393px phone width — about
   seven screens — and 63% of it is a directory of 21 tiles. The three pages
   he actually reaches (water, nutrition, sleep) are the three sitting in the
   quick row at ZERO scroll. Position beats organisation.

   ── WHY AN INDEX AND NOT A GRID OF ICONS ────────────────────────────────
   A 4-across springboard of 22 glyphs solves *reaching* a page and does
   nothing about *forgetting* one — which was the actual complaint. Icons for
   "Arc" or "Insights" are meaningless squares he would scroll past exactly
   like he scrolls past Home. So this is a table of contents: serif group
   names, text rows, each space in the accent colour it already wears on
   Home, and a quiet recency note on the right ("6d", "3w") that is the one
   thing on screen able to say *you have not opened this in a while*.

   ── THE RULES IT KEEPS ──────────────────────────────────────────────────
   · IT NEVER WRITES. Not one localStorage.setItem in this file, no new key,
     nothing synced, nothing in BUNDLES. Reverting it is `git revert` and a
     service-worker bump — there is no data to migrate back, because none was
     ever created. That is deliberate: the pinned six are hardcoded, not
     stored, precisely so this feature cannot own any state.
   · The pinned six NEVER REORDER. A list that rearranges itself by usage
     cannot be learned, and the whole point is that his thumb stops reading.
     (The Library learned this: "a shelf that moves as videos arrive cannot
     be learned".)
   · Recency is read LAZILY, on open, never on page load — `nut:logs` alone
     is ~563 KB and parsing it to draw a label on every page in the app would
     be a tax on every navigation.
   · An absent or unreadable store shows NO note. It never says "never
     opened", because "I could not read it" and "you have not been here" are
     different sentences (constraint 10).
   · Native <dialog> + showModal(), with `display` scoped to [open] — a bare
     `dialog.x{display:flex}` beats `dialog:not([open]){display:none}` and
     leaves the sheet permanently on screen (the als-v431 bug). The top layer
     also means no ancestor transform can push it off-frame (constraint 4).
*/
(function () {
  'use strict';
  if (window.ALSLauncher) return;

  /* ── The index. Order is canonical and fixed, never by size or use. ──
     `k` is the recency store; a page with no store simply carries no note. */
  var PINS = [
    { href: 'nutrition.html', name: 'Food',   k: 'nut:logs' },
    { href: 'gym.html',       name: 'Gym',    k: 'po_workouts' },
    { href: 'weight.html',    name: 'Weight', k: 'po_coach_weights' },
    { href: 'sleep.html',     name: 'Sleep',  k: 'sleep:logs' },
    { href: 'po-water.html',  name: 'Water',  k: null },
    { href: 'supps.html',     name: 'Supps',  k: null }
  ];

  var GROUPS = [
    { name: 'Train', accent: 'coral', items: [
      { href: 'gym.html',      name: 'Fitness',    k: 'po_workouts' },
      { href: 'pr.html',       name: 'PR board',   k: null },
      { href: 'measure.html',  name: 'Measure',    k: 'bm:logs' },
      { href: 'run.html',      name: 'Running',    k: null }
    ]},
    { name: 'Body', accent: 'emerald', items: [
      { href: 'nutrition.html', name: 'Nutrition',  k: 'nut:logs' },
      { href: 'sleep.html',     name: 'Sleep',      k: 'sleep:logs' },
      { href: 'weight.html',    name: 'Weight',     k: 'po_coach_weights' },
      { href: 'po-water.html',  name: 'Water',      k: null },
      { href: 'caffeine.html',  name: 'Caffeine',   k: 'caf:logs' },
      { href: 'supps.html',     name: 'Supplements',k: null },
      { href: 'planner.html',   name: 'Meal plan',  k: null },
      { href: 'body.html',      name: 'Body',       k: null }
    ]},
    { name: 'Mind', accent: 'violet', items: [
      { href: 'main.html',     name: 'Goals',     k: null },
      { href: 'identity.html', name: 'Identity',  k: 'journal:entries' },
      { href: 'ideas.html',    name: 'Ideas',     k: 'ideas:items' },
      { href: 'improve.html',  name: 'Library',   k: 'improve:videos' },
      { href: 'insights.html', name: 'Insights',  k: null },
      { href: 'coach.html',    name: 'Coach',     k: null },
      { href: 'arc.html',      name: 'Your Arc',  k: null }
    ]},
    { name: 'Life', accent: 'violet', items: [
      { href: 'scripture.html', name: 'Scripture', k: 'bible:sessions' },
      { href: 'movies.html',    name: 'Movies',    k: 'movies:seen' }
    ]},
    { name: 'Money', accent: 'amber', items: [
      { href: 'finance.html', name: 'Money', k: null }
    ]},
    { name: 'Study', accent: 'emerald', items: [
      // ext: opens in a new tab. study.html is a redirect stub to the Notion
      // \u00ab\u0397 \u03a7\u03a1\u039f\u039d\u0399\u0391\u00bb workspace, and it uses location.replace() \u2014 so navigating the
      // PWA to it in place would leave him off-site with no history to go back to.
      { href: 'study.html',   name: '\u0397 \u03a7\u03c1\u03bf\u03bd\u03b9\u03ac', k: null, ext: true },
      { href: 'arxaia.html',  name: '\u0391\u03c1\u03c7\u03b1\u03af\u03b1',   k: null },
      { href: 'latinika.html', name: '\u039b\u03b1\u03c4\u03b9\u03bd\u03b9\u03ba\u03ac', k: 'lat:v1' },
      { href: 'tonos.html',    name: '\u03a4\u03bf\u03bd\u03b9\u03c3\u03bc\u03cc\u03c2', k: 'ton:v1' }
    ]},
    { name: 'Reflect', accent: 'coral', items: [
      { href: 'morning.html', name: 'Morning briefing', k: null },
      { href: 'weekly.html',  name: 'Weekly review',    k: null }
    ]},
    { name: 'Tools', accent: 'amber', items: [
      { href: 'backup.html',        name: 'Back up & restore', k: null },
      { href: 'import.html',        name: 'Import MyFitnessPal', k: null },
      { href: 'import-strong.html', name: 'Import Strong',     k: null },
      { href: 'settings.html',      name: 'Settings',          k: null }
    ]}
  ];

  /* ── Recency: "when did I last touch this?" ──────────────────────────
     Deliberately NOT the same question home-live.js's metric() answers.
     metric() produces a page's VALUE ("28 films"); this produces its AGE.
     Two different questions, so this is not a second copy of that logic and
     the two cannot drift into disagreeing about the same number. */
  var ageCache = null;
  function newestTs(v) {
    var best = 0;
    function scan(x, d) {
      if (d > 4 || x == null) return;
      if (typeof x === 'number') { if (x > 16e11 && x < 21e11) best = Math.max(best, x); return; }
      if (typeof x === 'string') {
        if (/^20\d\d-\d\d-\d\d/.test(x)) { var t = Date.parse(x.slice(0, 10)); if (t) best = Math.max(best, t); }
        return;
      }
      if (Array.isArray(x)) { for (var i = Math.max(0, x.length - 60); i < x.length; i++) scan(x[i], d + 1); return; }
      if (typeof x === 'object') { var ks = Object.keys(x); for (var j = 0; j < ks.length && j < 80; j++) scan(x[ks[j]], d + 1); }
    }
    scan(v, 0);
    return best;
  }
  function ageOf(key) {
    if (!key) return '';
    if (!ageCache) ageCache = {};
    if (key in ageCache) return ageCache[key];
    var out = '';
    try {
      var raw = localStorage.getItem(key);
      // Absent or unreadable → NO note. Never "never".
      if (raw) {
        var ts = newestTs(JSON.parse(raw));
        if (ts) {
          var days = Math.floor((Date.now() - ts) / 86400000);
          out = days <= 0 ? 'today' : days === 1 ? '1d'
              : days < 7 ? days + 'd'
              : days < 60 ? Math.round(days / 7) + 'w'
              : Math.round(days / 30) + 'mo';
        }
      }
    } catch (e) { out = ''; }
    ageCache[key] = out;
    return out;
  }

  /* .alx-fab was styled here and is now styled in topbar.js (als-v438).
     topbar.js CREATES that button and injects its <style> synchronously; this
     file arrives on a separate deferred fetch. Once the button became the only
     navigation control in the app, styling it from here meant a flash of an
     unstyled <button> on every page load. One owner, one definition — two
     copies of a rule is two rules with a delay. */
  var CSS = `
dialog.alx{border:none;padding:0;background:transparent;max-width:100vw;max-height:100vh;
  width:100vw;height:100dvh;margin:0;overflow:visible;}
dialog.alx::backdrop{background:rgba(4,4,6,.62);backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px);}
dialog.alx:not([open]){display:none;}
dialog.alx[open]{display:flex;align-items:flex-end;justify-content:center;}
.alx-sheet{width:100%;max-width:620px;max-height:88dvh;display:flex;flex-direction:column;
  background:linear-gradient(180deg,rgba(22,22,26,.97),rgba(12,12,14,.99));
  border:1px solid rgba(255,255,255,.10);border-bottom:none;
  border-radius:26px 26px 0 0;box-shadow:0 -20px 60px rgba(0,0,0,.6);
  animation:alxUp .34s cubic-bezier(.2,.8,.3,1);}
@keyframes alxUp{from{transform:translateY(26px);opacity:0}to{transform:none;opacity:1}}
.alx-grab{width:38px;height:4px;border-radius:4px;background:rgba(255,255,255,.16);margin:9px auto 2px;flex:none;}
.alx-top{padding:8px 18px 12px;flex:none;display:flex;align-items:center;gap:10px;}
.alx-search{flex:1;min-width:0;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);
  border-radius:12px;padding:10px 13px;color:#F4F1EA;font-size:15px;outline:none;
  font-family:inherit;-webkit-appearance:none;}
.alx-search::placeholder{color:rgba(244,241,234,.34);}
.alx-search:focus{border-color:rgba(63,224,176,.4);}
.alx-x{flex:none;width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,.10);
  background:rgba(255,255,255,.04);color:rgba(244,241,234,.7);font-size:17px;line-height:1;cursor:pointer;}
.alx-body{overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 14px calc(18px + env(safe-area-inset-bottom));
  flex:1 1 auto;min-height:0;}
.alx-pins{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:20px;}
.alx-pin{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:7px;
  padding:14px 6px;border-radius:16px;text-decoration:none;
  border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);
  color:#F4F1EA;transition:background .2s,transform .2s;}
.alx-pin:active{transform:scale(.96);background:rgba(255,255,255,.07);}
.alx-pin svg{width:21px;height:21px;color:#3FE0B0;}
.alx-pin span{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;
  letter-spacing:.1em;text-transform:uppercase;color:rgba(244,241,234,.8);}
.alx-g{margin-bottom:16px;}
.alx-gh{display:flex;align-items:center;gap:10px;margin:0 4px 8px;}
.alx-gh b{font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:400;
  font-size:16px;color:#F4F1EA;letter-spacing:.01em;}
.alx-gh i{flex:1;height:1px;background:currentColor;opacity:.26;}
.alx-rows{display:grid;grid-template-columns:1fr 1fr;gap:2px 10px;}
.alx-r{display:flex;align-items:center;gap:8px;padding:9px 8px;border-radius:10px;
  text-decoration:none;color:rgba(244,241,234,.86);font-size:14px;min-width:0;
  transition:background .18s;}
.alx-r:active,.alx-r:hover{background:rgba(255,255,255,.06);}
.alx-r .d{width:5px;height:5px;border-radius:50%;background:currentColor;opacity:.5;flex:none;}
.alx-r .n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.alx-r .a{flex:none;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:9.5px;
  letter-spacing:.06em;color:rgba(244,241,234,.3);}
.alx-r.here{background:rgba(63,224,176,.10);color:#F4F1EA;}
.alx-r.here .d{background:#3FE0B0;opacity:1;}
.alx-none{padding:26px 8px;text-align:center;color:rgba(244,241,234,.4);font-size:14px;}
.alx-a-coral{color:#FF8E72;}.alx-a-emerald{color:#3FE0B0;}
.alx-a-violet{color:#9B8CFF;}.alx-a-amber{color:#F2C063;}
@media (min-width:560px){.alx-rows{grid-template-columns:repeat(3,1fr);}
  .alx-pins{grid-template-columns:repeat(6,1fr);}
  dialog.alx[open]{align-items:center;}
  .alx-sheet{border-radius:22px;border-bottom:1px solid rgba(255,255,255,.10);max-height:82dvh;}}
@media (prefers-reduced-motion:reduce){.alx-sheet{animation:none;}}
`;

  var ICONS = {
    'nutrition.html': '<path d="M12 7c-2-3.2-6.2-2-6.2 2.2 0 4.3 3.2 8.3 6.2 8.3s6.2-4 6.2-8.3C18.2 5 14 3.8 12 7Z"/><path d="M12 7V3.8"/>',
    'gym.html': '<rect x="1.5" y="9" width="3" height="6" rx="1"/><rect x="19.5" y="9" width="3" height="6" rx="1"/><line x1="6.5" y1="12" x2="17.5" y2="12"/>',
    'weight.html': '<rect x="3.5" y="3" width="17" height="18" rx="2.5"/><path d="M12 13l2.6-3.2"/>',
    'sleep.html': '<path d="M21 12.8A8 8 0 1 1 11.2 3 6 6 0 0 0 21 12.8Z"/>',
    'po-water.html': '<path d="M12 3.5c3.2 3.6 5.5 6.4 5.5 9.2A5.5 5.5 0 0 1 6.5 12.7c0-2.8 2.3-5.6 5.5-9.2Z"/>',
    'supps.html': '<rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)"/><line x1="8" y1="8" x2="16" y2="16"/>'
  };
  function svg(p) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
           'stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function here() {
    var f = (window.location.pathname || '').toLowerCase().split('/').pop() || 'index.html';
    return f === '' ? 'index.html' : f;
  }

  var dlg = null, input = null, bodyEl = null;

  function build() {
    if (dlg) return dlg;
    var st = document.createElement('style');
    st.id = 'alx-style'; st.textContent = CSS;
    document.head.appendChild(st);

    dlg = document.createElement('dialog');
    dlg.className = 'alx';
    dlg.setAttribute('aria-label', 'All pages');

    var cur = here();
    var html = '<div class="alx-sheet" role="document">' +
      '<div class="alx-grab"></div>' +
      '<div class="alx-top">' +
        '<input class="alx-search" id="alxQ" type="search" autocomplete="off" ' +
        'autocorrect="off" spellcheck="false" placeholder="Search your pages\u2026" aria-label="Search pages">' +
        '<button type="button" class="alx-x" id="alxX" aria-label="Close">\u2715</button>' +
      '</div><div class="alx-body" id="alxBody">';

    html += '<div class="alx-pins" data-sec="pins">';
    PINS.forEach(function (p) {
      html += '<a class="alx-pin" href="' + esc(p.href) + '" data-name="' + esc(p.name.toLowerCase()) + '">' +
              svg(ICONS[p.href] || '<circle cx="12" cy="12" r="8"/>') +
              '<span>' + esc(p.name) + '</span></a>';
    });
    html += '</div>';

    GROUPS.forEach(function (g) {
      html += '<div class="alx-g alx-a-' + g.accent + '" data-g="' + esc(g.name.toLowerCase()) + '">' +
              '<div class="alx-gh"><b>' + esc(g.name) + '</b><i></i></div><div class="alx-rows">';
      g.items.forEach(function (it) {
        var isHere = it.href.toLowerCase() === cur;
        html += '<a class="alx-r' + (isHere ? ' here' : '') + '" href="' + esc(it.href) + '" ' +
                (it.ext ? 'target="_blank" rel="noopener" ' : '') +
                'data-name="' + esc(it.name.toLowerCase()) + '"' + (it.k ? ' data-k="' + esc(it.k) + '"' : '') + '>' +
                '<span class="d"></span><span class="n">' + esc(it.name) + '</span>' +
                '<span class="a"></span></a>';
      });
      html += '</div></div>';
    });
    html += '<div class="alx-none" id="alxNone" hidden>Nothing matches that.</div>';
    html += '</div></div>';
    dlg.innerHTML = html;
    document.body.appendChild(dlg);

    input  = dlg.querySelector('#alxQ');
    bodyEl = dlg.querySelector('#alxBody');
    dlg.querySelector('#alxX').addEventListener('click', close);
    input.addEventListener('input', filter);
    // Tapping the backdrop closes. The sheet stops the bubble so a tap inside
    // it never reads as a tap outside.
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    dlg.addEventListener('close', function () { if (input) { input.value = ''; filter(); } });
    return dlg;
  }

  function paintAges() {
    // Lazy, once per page load: the biggest store here is ~563 KB.
    dlg.querySelectorAll('.alx-r[data-k]').forEach(function (r) {
      var el = r.querySelector('.a'); if (!el || el.textContent) return;
      el.textContent = ageOf(r.getAttribute('data-k'));
    });
  }

  function filter() {
    var q = (input.value || '').trim().toLowerCase();
    var shown = 0;
    dlg.querySelectorAll('.alx-r, .alx-pin').forEach(function (a) {
      var hit = !q || (a.getAttribute('data-name') || '').indexOf(q) > -1;
      a.style.display = hit ? '' : 'none';
      if (hit) shown++;
    });
    // A group whose every row is filtered out hides its heading too.
    dlg.querySelectorAll('.alx-g').forEach(function (g) {
      var any = Array.prototype.some.call(g.querySelectorAll('.alx-r'), function (r) { return r.style.display !== 'none'; });
      g.style.display = any ? '' : 'none';
    });
    var pins = dlg.querySelector('[data-sec="pins"]');
    if (pins) pins.style.display = q ? 'none' : '';
    var none = dlg.querySelector('#alxNone');
    if (none) none.hidden = shown > 0;
  }

  function open() {
    build();
    try { paintAges(); } catch (e) {}
    if (!dlg.open) dlg.showModal();
    // Only reach for the keyboard on a device that has one — focusing the
    // field on a phone throws the software keyboard over half the sheet.
    if (window.matchMedia && window.matchMedia('(min-width:560px)').matches) {
      try { input.focus(); } catch (e) {}
    }
    if (bodyEl) bodyEl.scrollTop = 0;
  }
  function close() { try { if (dlg && dlg.open) dlg.close(); } catch (e) {} }
  function toggle() { (dlg && dlg.open) ? close() : open(); }

  // "/" opens it from a keyboard, unless the caret is already in a field.
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
    e.preventDefault(); open();
  });

  window.ALSLauncher = { open: open, close: close, toggle: toggle };
})();
