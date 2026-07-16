/* ══════════════════════════════════════════════════════════════
   MÉTRON — home-motion.js
   The premium home's motion engine (from the approved demo):
   scroll-reveal cascade, count-up, self-drawing sparklines,
   pointer-tracked specular, spring press, peek dialog, palette.
   Runs AFTER home-live.js so it animates to real values.
   No-JS + reduced-motion safe.
   ══════════════════════════════════════════════════════════════ */
(function () {
  var settle = 'cubic-bezier(0.16,1,0.3,1)';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* live clock */
  function clk() { var d = new Date(); var s = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + ' · ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); var e = document.getElementById('sub'); if (e) e.textContent = s; }
  clk(); setInterval(clk, 60000);

  /* count-up */
  function fmt(v, dec, comma) { var n = dec ? v.toFixed(dec) : Math.round(v); if (comma) return Number(n).toLocaleString('en-US'); return String(n); }
  function countUp(node) {
    if (node.dataset.done) return; node.dataset.done = '1';
    var to = parseFloat(node.dataset.to), dec = parseInt(node.dataset.dec || '0', 10), comma = node.dataset.comma === '1';
    if (reduce || isNaN(to)) { node.textContent = fmt(isNaN(to) ? 0 : to, dec, comma); return; }
    var dur = 750, st = performance.now();
    function f(t) { var p = Math.min(1, (t - st) / dur); p = 1 - Math.pow(1 - p, 3); node.textContent = fmt(to * p, dec, comma); if (p < 1) requestAnimationFrame(f); else node.textContent = fmt(to, dec, comma); }
    requestAnimationFrame(f);
  }
  /* self-drawing sparkline */
  function drawSpark(tile) {
    var pl = tile.querySelector('.spark polyline'); if (!pl) { tile.classList.add('lit'); return; }
    if (reduce) { pl.style.strokeDashoffset = '0'; tile.classList.add('lit'); return; }
    var L = 200; try { L = pl.getTotalLength(); } catch (e) { }
    pl.style.strokeDasharray = L; pl.style.strokeDashoffset = L; pl.getBoundingClientRect();
    pl.style.transition = 'stroke-dashoffset 1.1s ' + settle; pl.style.strokeDashoffset = '0';
    setTimeout(function () { tile.classList.add('lit'); }, 1000);
  }
  function activate(el) {
    var cs = el.querySelectorAll ? el.querySelectorAll('.cnt') : []; Array.prototype.forEach.call(cs, countUp);
    if (el.classList && el.classList.contains('tile')) drawSpark(el);
    if (el.classList && el.classList.contains('focus')) {
      var rf = el.querySelector('.rf');
      if (rf) { var off = (window.__alsReady ? window.__alsReady() : 92.5); if (reduce) rf.style.setProperty('stroke-dashoffset', off, 'important'); else rf.style.strokeDashoffset = off; }
    }
    if (el.id === 'feed') revealFeed();
  }

  /* haptics */
  function haptic(ms) {
    try {
      if (navigator.vibrate) { navigator.vibrate(ms || 8); return; }
      var i = document.querySelector('#iosHaptic input');
      if (i) { i.checked = !i.checked; i.dispatchEvent(new Event('change', { bubbles: true })); }
    } catch (e) { }
  }

  /* skeleton → real for the intelligence feed */
  var feedDone = false;
  function revealFeed() {
    if (feedDone) return; feedDone = true;
    setTimeout(function () {
      var sk = document.getElementById('feedSkel'), re = document.getElementById('feedReal'), ts = document.getElementById('feedTs');
      if (sk) sk.style.display = 'none';
      if (re) { re.style.display = ''; requestAnimationFrame(function () { re.style.opacity = '1'; }); }
      if (ts) ts.textContent = 'updated ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    }, reduce ? 0 : 1100);
  }

  /* progressive-disclosure peek */
  var peekDlg = document.getElementById('peek');
  function openPeek(t) {
    var name = (t.querySelector('.name') || {}).textContent || '';
    var valEl = t.querySelector('.val'); var val = valEl ? valEl.innerHTML : '';
    var sub = (t.querySelector('.sub') || {}).textContent || '';
    var href = t.getAttribute('href') || '#';
    var dir = 'Open ' + name + ' to see the full view.';
    var spark = t.querySelector('.spark'); var sparkHtml = (spark && spark.style.display !== 'none') ? '<div class="peek-spark">' + spark.innerHTML + '</div>' : '';
    peekDlg.innerHTML = '<button class="peek-x" aria-label="Close">×</button><div class="peekbody">'
      + '<div class="peek-ey">' + sub + '</div>'
      + '<div class="peek-val">' + val + '</div>'
      + '<div class="peek-name">' + name + '</div>'
      + sparkHtml
      + '<div class="peek-dir">' + dir + '</div>'
      + '<a class="peek-open" href="' + href + '">Open ' + name + ' →</a></div>';
    if (typeof peekDlg.showModal === 'function') { peekDlg.showModal(); requestAnimationFrame(function () { requestAnimationFrame(function () { peekDlg.classList.add('on'); }); }); } else { location.href = href; }
    var pl = peekDlg.querySelector('.peek-spark polyline'); if (pl && !reduce) { pl.style.strokeDasharray = '200'; pl.style.strokeDashoffset = '200'; requestAnimationFrame(function () { pl.style.transition = 'stroke-dashoffset 1s ' + settle; pl.style.strokeDashoffset = '0'; }); }
    peekDlg.querySelector('.peek-x').addEventListener('click', function () { peekDlg.close(); });
  }
  if (peekDlg) {
    peekDlg.addEventListener('close', function () { peekDlg.classList.remove('on'); });
    peekDlg.addEventListener('click', function (e) { if (e.target === peekDlg) peekDlg.close(); });
    document.querySelectorAll('.tile').forEach(function (t) {
      var b = document.createElement('span'); b.className = 'peek'; b.setAttribute('role', 'button'); b.tabIndex = 0; b.setAttribute('aria-label', 'Peek at ' + ((t.querySelector('.name') || {}).textContent || 'tile'));
      b.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14v6h6"/><path d="M20 10V4h-6"/><path d="M14 10l6-6"/><path d="M10 14l-6 6"/></svg>';
      function fire(e) { e.preventDefault(); e.stopPropagation(); haptic(6); openPeek(t); }
      b.addEventListener('click', fire);
      b.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') fire(e); });
      t.appendChild(b);
    });
  }

  /* subtle haptic on press */
  document.querySelectorAll('.tile, .lbtn, .vault, .nav a').forEach(function (el) {
    el.addEventListener('pointerdown', function () { haptic(6); }, { passive: true });
  });

  /* reveal observer with intra-section stagger */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (!e.isIntersecting) return; var el = e.target; io.unobserve(el);
        var items = el.hasAttribute('data-rise') ? [el] : Array.prototype.slice.call(el.querySelectorAll('[data-rise]'));
        if (!items.length) items = [el];
        items.forEach(function (it, i) {
          var d = reduce ? 0 : i * 60;
          it.style.transitionDelay = d + 'ms';
          requestAnimationFrame(function () { it.classList.add('in'); });
          setTimeout(function () { activate(it); }, d + 130);
        });
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('[data-reveal]').forEach(function (s) { io.observe(s); });
  } else {
    document.querySelectorAll('[data-rise]').forEach(function (it) { it.classList.add('in'); activate(it); });
  }

  /* pointer-tracked specular on tiles */
  document.querySelectorAll('.tile').forEach(function (t) {
    t.addEventListener('pointermove', function (e) {
      var r = t.getBoundingClientRect();
      t.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      t.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  });

  /* command palette */
  var ITEMS = [
    ['Fitness', 'gym.html', 'Train'], ['PR Board', 'pr.html', 'Train'], ['Running', 'run.html', 'Run'],
    ['Nutrition', 'nutrition.html', 'Body'], ['Sleep', 'sleep.html', 'Body'], ['Weight', 'weight.html', 'Body'], ['Caffeine', 'caffeine.html', 'Body'], ['Supplements', 'health.html', 'Body'], ['Measurements', 'measure.html', 'Body'], ['Supplement timing', 'supps.html', 'Body'], ['Meal planner', 'planner.html', 'Body'], ['Water', 'po-water.html', 'Body'], ['Import MyFitnessPal', 'import.html', 'Body'], ['Import Strong', 'import-strong.html', 'Body'], ['Body hub', 'body.html', 'Body'],
    ['Goals', 'main.html', 'Mind'], ['Identity', 'identity.html', 'Mind'], ['Ideas', 'ideas.html', 'Mind'], ['Improve', 'improve.html', 'Mind'],
    ['Finance', 'finance.html', 'Money'], ['Bills', 'bills.html', 'Money'], ['Movies', 'movies.html', 'Life'], ['Your Arc', 'arc.html', 'Life'],
    ['Trends', 'trends.html', 'Life'], ['Insight Engine', 'insights.html', 'Life'], ['Αρχαία', 'arxaia.html', 'Study'], ['Ιστορία', 'istoria.html', 'Study'],
    ['Morning Briefing', 'morning.html', 'Go'], ['Weekly Review', 'weekly.html', 'Go'], ['Coach', 'coach.html', 'Go'], ['Nova', 'nova-chat.html', 'Go'], ['Backup', 'backup.html', 'Go']
  ];
  var q = document.getElementById('q'), res = document.getElementById('res');
  var arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>';
  if (q) {
    q.addEventListener('input', function () {
      var v = q.value.trim().toLowerCase();
      if (!v) { res.classList.remove('on'); res.innerHTML = ''; return; }
      // Only pages this account actually has — the search palette must not
      // offer someone a page we've hidden everywhere else.
      var m = ITEMS.filter(function (i) {
        if (i[0].toLowerCase().indexOf(v) < 0) return false;
        try { return !window.ALSProfile || ALSProfile.has(i[1].replace(/\.html$/, '')); } catch (e) { return true; }
      }).slice(0, 6);
      res.innerHTML = m.length ? m.map(function (i, idx) { return '<a class="pr-item" style="animation-delay:' + (idx * 40) + 'ms" href="' + i[1] + '"><span class="ic">' + arrow + '</span>' + i[0] + '<span class="k">' + i[2] + '</span></a>'; }).join('') : '<div class="pr-item" style="color:var(--faint)">No match</div>';
      res.classList.add('on');
    });
    q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var f = res.querySelector('a.pr-item'); if (f) location.href = f.getAttribute('href'); } });
  }
})();
