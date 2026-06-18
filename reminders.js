/* ════════════════════════════════════════════════════════════════
   ALS Dashboard — Daily Reminders settings (window.ALSReminders)
   Lets Alex turn on smart daily push nudges (weigh-in / training /
   protein / caffeine cutoff / evening wind-down). Stores his push
   subscription + preferences in Supabase so the serverless cron
   (/api/run-reminders) can fire them with the app fully closed.
   Reuses window.ALSPush for the permission/subscribe flow. Renders a
   self-contained AURORA card into #remMount if present.
   Degrades to a silent no-op when push isn't supported / not set up.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var SUPABASE_URL = 'https://oiyvadqfldwbjroiknjc.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_fGKn40f1Ek1Y4j0VComsFA_l4aXkKM-';
  var PREFS_KEY = 'push:prefs', SUBS_KEY = 'push:subscriptions';

  // id → default schedule + copy. Hours match /api/run-reminders defaults.
  var DEFAULTS = {
    weighin:  { on: true, hour: 12, emoji: '⚖️', label: 'Weigh-in',          when: 'if you haven’t logged' },
    training: { on: true, hour: 14, emoji: '💪', label: 'Training nudge',    when: 'when it’s been 3+ days' },
    protein:  { on: true, hour: 19, emoji: '🍗', label: 'Protein check',     when: 'evening if you’re behind' },
    caffeine: { on: true, hour: 14, emoji: '☕️', label: 'Caffeine cutoff',    when: 'if you’ve had any today' },
    journal:  { on: true, hour: 22, emoji: '🧭', label: 'Evening wind-down',  when: 'habits + journal before bed' },
    winddown: { on: false, hour: 22, emoji: '🌙', label: 'Bedtime wind-down',  when: 'at your target bedtime — screens off' }
  };
  var ORDER = ['weighin', 'training', 'protein', 'caffeine', 'journal', 'winddown'];

  function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function fmtHour(h) { var ap = h < 12 ? 'am' : 'pm'; var hr = h % 12; if (hr === 0) hr = 12; return hr + ap; }

  var _supa = null;
  function supa() {
    if (_supa) return _supa;
    try { if (window.supabase) _supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY); } catch (e) {}
    return _supa;
  }
  function readRow(key) {
    var s = supa(); if (!s) return Promise.resolve({});
    return s.from('app_state').select('data').eq('key', key).maybeSingle()
      .then(function (r) { return (r && r.data && r.data.data) || {}; })
      .catch(function () { return {}; });
  }
  function writeRow(key, data) {
    var s = supa(); if (!s) return Promise.resolve();
    return s.from('app_state').upsert({ key: key, data: data, updated_at: new Date().toISOString() }, { onConflict: 'key' })
      .then(function () {}).catch(function () {});
  }

  // Merge stored prefs over defaults so new reminders appear automatically.
  function normalizePrefs(p) {
    p = p || {};
    var out = { enabled: p.enabled === true, tz: p.tz || tz(), reminders: {} };
    ORDER.forEach(function (id) {
      var d = DEFAULTS[id], pr = (p.reminders || {})[id] || {};
      out.reminders[id] = { on: (pr.on != null ? pr.on : d.on), hour: (pr.hour != null ? pr.hour : d.hour) };
    });
    return out;
  }
  function tz() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Athens'; } catch (e) { return 'Europe/Athens'; } }

  // Store this device's subscription in the shared subs map (keyed by endpoint).
  function registerSubscription() {
    var raw = ls('als_push_sub'); if (!raw) return Promise.resolve(false);
    var sub; try { sub = JSON.parse(raw); } catch (e) { return Promise.resolve(false); }
    if (!sub || !sub.endpoint) return Promise.resolve(false);
    return readRow(SUBS_KEY).then(function (row) {
      var subs = (row && row.subs) || {};
      subs[sub.endpoint] = sub;
      return writeRow(SUBS_KEY, { subs: subs }).then(function () { return true; });
    });
  }

  // Ensure the hourly cron schedule exists (once per device, best-effort).
  function ensureCron() {
    if (ls('als_rem_cron')) return;
    try {
      fetch('/api/setup-reminders').then(function (r) { return r.json(); })
        .then(function (j) { if (j && j.ok) { try { localStorage.setItem('als_rem_cron', '1'); } catch (e) {} } })
        .catch(function () {});
    } catch (e) {}
  }

  // ── UI ──────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('rem-styles')) return;
    var s = document.createElement('style'); s.id = 'rem-styles';
    s.textContent = [
      '.rem-wrap{padding:0 20px;margin:0 auto 28px;max-width:1100px}',
      '.rem-hdr{display:flex;align-items:center;gap:10px;margin-bottom:12px}',
      '.rem-hdr-label{font-family:var(--au-mono,ui-monospace);font-size:9.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgba(244,241,234,.34)}',
      '.rem-hdr-line{flex:1;height:1px;background:linear-gradient(90deg,rgba(155,140,255,.22),transparent)}',
      '.rem-card{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:6px 16px;backdrop-filter:blur(8px)}',
      '.rem-master{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 2px}',
      '.rem-master-title{font-family:var(--au-sans,-apple-system);font-size:15px;font-weight:700;color:#F4F1EA}',
      '.rem-master-sub{font-family:var(--au-mono,ui-monospace);font-size:10.5px;letter-spacing:.03em;color:rgba(244,241,234,.42);margin-top:3px}',
      '.rem-list{border-top:1px solid rgba(255,255,255,.06);transition:opacity .2s}',
      '.rem-list.off{opacity:.4;pointer-events:none}',
      '.rem-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 2px;border-bottom:1px solid rgba(255,255,255,.05)}',
      '.rem-row:last-child{border-bottom:none}',
      '.rem-row-main{display:flex;align-items:center;gap:12px;min-width:0}',
      '.rem-emoji{font-size:18px;width:22px;text-align:center;flex:none}',
      '.rem-row-title{font-family:var(--au-sans,-apple-system);font-size:13.5px;font-weight:600;color:#F4F1EA}',
      '.rem-row-sub{font-family:var(--au-mono,ui-monospace);font-size:10px;letter-spacing:.02em;color:rgba(244,241,234,.4);margin-top:2px}',
      '.rem-row-ctrls{display:flex;align-items:center;gap:9px;flex:none}',
      '.rem-time-wrap{position:relative;display:inline-flex}',
      '.rem-time-wrap::after{content:"\\25BE";position:absolute;right:8px;top:50%;transform:translateY(-50%);font-size:8px;color:rgba(52,226,176,.65);pointer-events:none}',
      '.rem-time{font-family:var(--au-mono,ui-monospace);font-size:11px;font-weight:700;letter-spacing:.05em;color:#34E2B0;background:rgba(52,226,176,.07);border:1px solid rgba(52,226,176,.26);border-radius:8px;padding:6px 22px 6px 10px;cursor:pointer;-webkit-appearance:none;appearance:none;outline:none;transition:border-color .2s,box-shadow .2s,background .2s;-webkit-tap-highlight-color:transparent}',
      '.rem-time:hover{background:rgba(52,226,176,.11)}',
      '.rem-time:focus{border-color:#34E2B0;box-shadow:0 0 0 3px rgba(52,226,176,.16)}',
      '.rem-time option{background:#0b0e10;color:#F4F1EA}',
      '.rem-switch{position:relative;width:46px;height:27px;border-radius:14px;border:none;cursor:pointer;flex:none;background:rgba(255,255,255,.1);transition:background .22s ease;-webkit-tap-highlight-color:transparent;padding:0}',
      '.rem-switch.sm{width:40px;height:23px}',
      '.rem-switch[aria-checked="true"]{background:linear-gradient(120deg,#34E2B0,#18C8C0 55%,#9B8CFF)}',
      '.rem-knob{position:absolute;top:3px;left:3px;width:21px;height:21px;border-radius:50%;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.3);transition:transform .22s cubic-bezier(.4,1.3,.5,1)}',
      '.rem-switch.sm .rem-knob{width:17px;height:17px}',
      '.rem-switch[aria-checked="true"] .rem-knob{transform:translateX(19px)}',
      '.rem-switch.sm[aria-checked="true"] .rem-knob{transform:translateX(17px)}',
      '.rem-status{font-family:var(--au-mono,ui-monospace);font-size:10.5px;letter-spacing:.03em;min-height:14px;margin-top:11px;color:rgba(244,241,234,.45)}',
      '.rem-status.ok{color:#34E2B0}.rem-status.warn{color:#F2C063}.rem-status.err{color:#FF6B8B}',
      '.rem-test{display:inline-block;margin-top:9px;font-family:var(--au-mono,ui-monospace);font-size:9.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(244,241,234,.34);background:none;border:none;cursor:pointer;padding:0;text-decoration:underline;text-underline-offset:3px}',
      '.rem-test:hover{color:#F4F1EA}',
      '@media(max-width:440px){.rem-wrap{padding:0 14px}}'
    ].join('');
    document.head.appendChild(s);
  }

  function switchEl(checked, small) {
    var b = document.createElement('button');
    b.className = 'rem-switch' + (small ? ' sm' : '');
    b.setAttribute('role', 'switch');
    b.setAttribute('aria-checked', checked ? 'true' : 'false');
    b.innerHTML = '<span class="rem-knob"></span>';
    return b;
  }

  function render(mount, prefs) {
    injectStyles();
    mount.innerHTML = '';
    var wrap = document.createElement('div'); wrap.className = 'rem-wrap';

    var hdr = document.createElement('div'); hdr.className = 'rem-hdr';
    hdr.innerHTML = '<span class="rem-hdr-label">&#9673; Daily Reminders</span><div class="rem-hdr-line"></div>';
    wrap.appendChild(hdr);

    var card = document.createElement('div'); card.className = 'rem-card';

    // master row
    var master = document.createElement('div'); master.className = 'rem-master';
    var on = prefs.enabled && window.ALSPush && window.ALSPush.enabled && window.ALSPush.enabled();
    var sub = document.createElement('div'); sub.className = 'rem-master-sub'; sub.id = 'remMasterSub';
    sub.textContent = on ? 'On — Nova will nudge you, even with the app closed' : 'Off — turn on to get smart daily nudges';
    var left = document.createElement('div');
    left.innerHTML = '<div class="rem-master-title">Push reminders</div>';
    left.appendChild(sub);
    var mSwitch = switchEl(on, false);
    master.appendChild(left); master.appendChild(mSwitch);
    card.appendChild(master);

    // per-reminder list
    var list = document.createElement('div'); list.className = 'rem-list' + (on ? '' : ' off');
    ORDER.forEach(function (id) {
      var d = DEFAULTS[id], pr = prefs.reminders[id];
      var row = document.createElement('div'); row.className = 'rem-row'; row.dataset.id = id;
      var main = document.createElement('div'); main.className = 'rem-row-main';
      main.innerHTML = '<span class="rem-emoji">' + d.emoji + '</span><div><div class="rem-row-title">' + d.label +
        '</div><div class="rem-row-sub">' + d.when + '</div></div>';

      var ctrls = document.createElement('div'); ctrls.className = 'rem-row-ctrls';
      // editable techy time chip — native picker (iOS-reliable), mono styling
      var timeWrap = document.createElement('span'); timeWrap.className = 'rem-time-wrap';
      var timeSel = document.createElement('select'); timeSel.className = 'rem-time';
      timeSel.setAttribute('aria-label', d.label + ' time');
      for (var hh = 0; hh < 24; hh++) {
        var o = document.createElement('option'); o.value = String(hh); o.textContent = fmtHour(hh);
        if (hh === pr.hour) o.selected = true; timeSel.appendChild(o);
      }
      timeSel.addEventListener('change', function (rid, sel) {
        return function () { prefs.reminders[rid].hour = parseInt(sel.value, 10); writeRow(PREFS_KEY, prefs); };
      }(id, timeSel));
      timeWrap.appendChild(timeSel);

      var rSwitch = switchEl(pr.on !== false, true);
      rSwitch.addEventListener('click', function () {
        prefs.reminders[id].on = !(prefs.reminders[id].on !== false);
        rSwitch.setAttribute('aria-checked', prefs.reminders[id].on ? 'true' : 'false');
        writeRow(PREFS_KEY, prefs);
      });

      ctrls.appendChild(timeWrap); ctrls.appendChild(rSwitch);
      row.appendChild(main); row.appendChild(ctrls);
      list.appendChild(row);
    });
    card.appendChild(list);

    var status = document.createElement('div'); status.className = 'rem-status'; status.id = 'remStatus';
    if (window.ALSPush && !window.ALSPush.supported()) status.textContent = 'On iPhone: add to Home Screen and open from the icon to enable.';
    card.appendChild(status);

    // Fire an immediate test push (reuses /api/fire-push with the stored sub).
    var testBtn = document.createElement('button'); testBtn.className = 'rem-test'; testBtn.textContent = 'Send a test nudge';
    testBtn.style.display = on ? 'inline-block' : 'none';
    card.appendChild(document.createElement('br'));
    card.appendChild(testBtn);

    wrap.appendChild(card); mount.appendChild(wrap);

    function setStatus(msg, cls) { status.textContent = msg; status.className = 'rem-status' + (cls ? ' ' + cls : ''); }

    testBtn.addEventListener('click', function () {
      var raw = ls('als_push_sub'); if (!raw) { setStatus('Turn reminders on first.', 'warn'); return; }
      setStatus('Sending…');
      try {
        fetch('/api/fire-push', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: JSON.parse(raw), title: 'Nova 🌿', body: 'Test nudge — your reminders are working.', tag: 'als-test' })
        }).then(function (r) { return r.json(); }).then(function (j) {
          if (j && j.sent) setStatus('Sent — check your notifications.', 'ok');
          else setStatus('Couldn’t send (' + ((j && j.error) || 'not configured') + ').', 'err');
        }).catch(function () { setStatus('Couldn’t reach the server.', 'err'); });
      } catch (e) { setStatus('Something went wrong.', 'err'); }
    });

    mSwitch.addEventListener('click', function () {
      var turningOn = mSwitch.getAttribute('aria-checked') !== 'true';
      if (turningOn) {
        if (!window.ALSPush || !window.ALSPush.supported()) { setStatus('Push isn’t available here — open the installed app on your phone.', 'warn'); return; }
        setStatus('Asking permission…');
        window.ALSPush.enable().then(function (ok) {
          if (!ok) {
            var why = (window.ALSPush.lastError && window.ALSPush.lastError()) || '';
            var msg = 'Couldn’t enable.';
            if (why.indexOf('permission-denied') === 0) msg = 'Notifications are blocked. On iPhone: Settings ▸ Notifications ▸ this app ▸ Allow — or delete & re-add it to the Home Screen, then retry.';
            else if (why.indexOf('permission-default') === 0) msg = 'You didn’t tap Allow — flip it on again and choose Allow.';
            else if (why === 'no-vapid') msg = 'Push backend isn’t configured (VAPID key missing).';
            else if (why.indexOf('subscribe-failed') === 0) msg = 'iOS refused the subscription: ' + why.replace('subscribe-failed: ', '') + ' — make sure you’re on Wi-Fi/data, then retry.';
            else if (why === 'unsupported') msg = 'Push isn’t available here — open the installed app on your phone.';
            else if (why) msg = 'Couldn’t enable — ' + why;
            setStatus(msg, 'err');
            mSwitch.setAttribute('aria-checked', 'false');
            return;
          }
          prefs.enabled = true; prefs.tz = tz();
          return registerSubscription().then(function () {
            return writeRow(PREFS_KEY, prefs).then(function () {
              ensureCron();
              mSwitch.setAttribute('aria-checked', 'true');
              list.classList.remove('off');
              testBtn.style.display = 'inline-block';
              sub.textContent = 'On — Nova will nudge you, even with the app closed';
              setStatus('You’re set — smart nudges are on.', 'ok');
            });
          });
        }).catch(function () { setStatus('Couldn’t enable — try again.', 'err'); });
      } else {
        prefs.enabled = false;
        writeRow(PREFS_KEY, prefs);
        mSwitch.setAttribute('aria-checked', 'false');
        list.classList.add('off');
        testBtn.style.display = 'none';
        sub.textContent = 'Off — turn on to get smart daily nudges';
        setStatus('Reminders paused.', 'warn');
      }
    });
  }

  function mountInto(el) {
    if (!el) return;
    readRow(PREFS_KEY).then(function (raw) { render(el, normalizePrefs(raw)); });
  }

  function init() {
    var el = document.getElementById('remMount');
    if (el) mountInto(el);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  window.ALSReminders = { mountInto: mountInto, registerSubscription: registerSubscription };
})();
