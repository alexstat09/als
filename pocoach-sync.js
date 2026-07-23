/* ════════════════════════════════════════════════════════════════
   po-coach sync — merge-first, Realtime, never loses weight entries.
   Shared by gym.html and body.html so both pages converge on the same
   Supabase row ("po-coach"). Whichever page edits weights pushes the
   union; the other device receives it instantly via Realtime (and via
   15s polling / foreground re-sync as a fallback).

   Each page may define a rerender hook that this script calls when
   remote data arrives:
     window._gymRerender   — defined by gym.html
     window._bodyRerender  — defined by body.html
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  // Never run twice on one page. Pages that include this script natively set the
  // flag when they run; topbar's ensurePocoachSync() checks it before injecting,
  // so weight sync now runs app-wide without ever double-installing the engine
  // (which would stack the setItem override / duplicate the 15s poll + Realtime).
  if (window.__pocoachSync) return;
  window.__pocoachSync = true;
  var REST    = 'https://oiyvadqfldwbjroiknjc.supabase.co/rest/v1/app_state';
  var SB_BASE = 'https://oiyvadqfldwbjroiknjc.supabase.co';
  var SB_KEY  = 'sb_publishable_fGKn40f1Ek1Y4j0VComsFA_l4aXkKM-';
  var APP_KEY = 'po-coach';
  var KEYS    = ['po_coach_v1', 'po_coach_workout_done', 'po_coach_weights', 'po_coach_photos',
                 'po_tpl_folders', 'po_templates', 'po_exercises', 'po_workouts'];
  /* Array keys merged by union-of-id (never lose templates/history across devices) */
  var ID_UNION = { po_tpl_folders: 1, po_templates: 1, po_exercises: 1, po_workouts: 1 };

  /* ── Deletion tombstones ──────────────────────────────────────────
     Union-of-id ALONE resurrects anything you delete (remote still has
     it → merge re-adds it). So we record removed ids/dateKeys with a
     timestamp; on merge an item is dropped UNLESS it was (re)added AFTER
     the delete (ts compare), and re-adding clears the tombstone. Tombs
     travel in the synced row under `_deletes`. */
  var TOMB_KEY = 'po_synctomb';
  function pj(v){ try { return JSON.parse(v); } catch (e) { return v; } }
  function loadTomb(){ try { return JSON.parse(localStorage.getItem(TOMB_KEY)) || {}; } catch (e) { return {}; } }
  function saveTomb(t){ try { _origSet(TOMB_KEY, JSON.stringify(t)); } catch (e) {} }
  /* When an item was added, in ms. Workouts carry no numeric stamp — only an ISO
     startedAt — which used to coerce to NaN and fall through to 0. */
  function addedAtG(v){
    if (v && typeof v === 'object') {
      var n = +v.ts || +v._ts || 0;
      if (n) return n;
      var iso = v.startedAt || v.date;
      if (iso) { var p = Date.parse(iso); if (!isNaN(p)) return p; }
      return 0;
    }
    if (typeof v === 'number') return v;
    return 0;
  }
  function tombedG(tnode, key, val){
    if (!tnode) return false;
    var t = tnode[key];
    if (typeof t !== 'number') return false;
    return addedAtG(val) <= t;
  }
  // Record removals (now); lift a tombstone ONLY on a genuine re-add.
  //
  // This used to lift a tombstone whenever the id merely appeared in the array
  // being written — but that is exactly what a STALE writer does: a second
  // device (or the Strong importer) still holding the old workout would write
  // it, wipe the "you deleted this" record, and the workout came back for good.
  // A delete may now only be undone by an item stamped AFTER the delete, i.e. a
  // real re-add. (Weight entries carry ts = Date.now() on every save, so
  // re-logging a deleted day still lifts its tombstone exactly as before.)
  function diffTombG(prev, next, tnode, now, isW){
    tnode = (tnode && typeof tnode === 'object') ? tnode : {};
    var kf = isW ? function(e){ return (e && e.dateKey != null) ? 'dk:' + e.dateKey : null; }
                 : function(e){ return (e && e.id != null) ? 'id:' + e.id : null; };
    var P = {}, N = {};
    if (Array.isArray(prev)) prev.forEach(function(e){ var k = kf(e); if (k) P[k] = 1; });
    if (Array.isArray(next)) next.forEach(function(e){ var k = kf(e); if (k == null) return; var a = addedAtG(e); if (!(k in N) || a > N[k]) N[k] = a; });
    for (var k in P) { if (!Object.prototype.hasOwnProperty.call(P, k)) continue; if (!(k in N)) tnode[k] = now; }
    for (var k2 in N) { if (!Object.prototype.hasOwnProperty.call(N, k2)) continue; var t2 = tnode[k2]; if (typeof t2 === 'number' && N[k2] > t2) delete tnode[k2]; }
    return tnode;
  }
  function unionTombG(a, b){
    var out = {};
    [a, b].forEach(function(s){ if (!s) return; for (var k in s){ if (!Object.prototype.hasOwnProperty.call(s, k)) continue; if (!out[k]) out[k] = {}; for (var id in s[k]){ if (!Object.prototype.hasOwnProperty.call(s[k], id)) continue; out[k][id] = Math.max(out[k][id] || 0, s[k][id]); } } });
    return out;
  }

  /* set when a merge throws away an item the cloud still holds but we have deleted
     → the row is dirty and must be rewritten, or the item sits there for ever */
  var tombDropped = false;

  function mergeById(loc, rem, tnode) {
    var map = {}, r = Array.isArray(rem) ? rem : [], l = Array.isArray(loc) ? loc : [];
    for (var i = 0; i < r.length; i++) if (r[i] && r[i].id != null) map['id:' + r[i].id] = r[i];
    for (var j = 0; j < l.length; j++) if (l[j] && l[j].id != null) map['id:' + l[j].id] = l[j]; // local wins same id
    var out = [];
    for (var k in map) {
      if (!Object.prototype.hasOwnProperty.call(map, k)) continue;
      if (tombedG(tnode, k, map[k])) { tombDropped = true; continue; }
      /* it outlived its tombstone (stamped after the delete = a real re-add), so
         retire the tombstone — otherwise this device alone would keep refusing an
         item every other device has accepted back. */
      if (tnode && typeof tnode[k] === 'number') delete tnode[k];
      out.push(map[k]);
    }
    return out;
  }

  // RLS returns a user's rows only when the request carries THEIR access token;
  // the anon publishable key alone now gets nothing. A device that already had
  // the gym/weigh-in history cached never noticed — but a FRESH device pulls an
  // empty history, which is exactly the bug this fixes. apikey stays the
  // publishable key (identifies the project); Authorization carries the signed-in
  // user's JWT, kept current in SESSION_TOKEN. Falls back to the anon key only
  // when signed out, which reads as anon and returns nothing — never another
  // account's data, and (being read-only under RLS) never overwrites the cloud.
  var SESSION_TOKEN = null, SESSION_UID = null, _authListen = false, rtClient = null;
  function authClient() {
    try { return (window.ALSAuth && window.ALSAuth.client) || window.__alsAuthClient || null; }
    catch (e) { return null; }
  }
  function ensureToken() {
    return new Promise(function (resolve) {
      var tries = 0;
      (function tick() {
        var c = authClient();
        if (!c || !c.auth) { if (tries++ < 25) { setTimeout(tick, 120); return; } resolve(null); return; }
        if (!_authListen && c.auth.onAuthStateChange) {
          _authListen = true;
          c.auth.onAuthStateChange(function (_e, sess) {
            SESSION_TOKEN = (sess && sess.access_token) || SESSION_TOKEN;
            SESSION_UID = (sess && sess.user && sess.user.id) || SESSION_UID;
            try { if (rtClient && SESSION_TOKEN) rtClient.realtime.setAuth(SESSION_TOKEN); } catch (e) {}
          });
        }
        c.auth.getSession().then(function (s) {
          var sess = s && s.data && s.data.session;
          SESSION_TOKEN = (sess && sess.access_token) || null;
          SESSION_UID = (sess && sess.user && sess.user.id) || null;
          resolve(SESSION_TOKEN);
        }).catch(function () { resolve(null); });
      })();
    });
  }

  function hdrs() {
    return { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + (SESSION_TOKEN || SB_KEY), 'Content-Type': 'application/json' };
  }

  /* ⚠️ THE BUG THAT COST THREE ROUNDS OF WEIGH-INS (found 22/07/26).
     A row is addressed by (user_id, key) — migration 001 made that the primary
     key — and this engine was upserting with `?on_conflict=key`. Postgres has no
     unique constraint on `key` alone, so EVERY push came back
       42P10: there is no unique or exclusion constraint matching the ON CONFLICT
     as an HTTP 400. Not RLS, not the network, not a busy server: the write was
     malformed and was rejected 100% of the time, on every device, since the
     multi-user migration.

     Everything built on top of it was working perfectly and could not help. The
     confirmed-write discipline (17/07) correctly refused to advance lastJson, so
     the 15s reconciler retried — for ever, against a request that could never
     succeed. Running the engine app-wide (19/07) spread a broken write to more
     pages. The retry was honest; it was retrying an impossible request.

     Verified against the live database: `on_conflict=key` → 42P10/400, while
     `on_conflict=user_id,key` gets past constraint resolution. Keep these three
     helpers as the ONLY way this file addresses a row. */
  function conflictCols() { return SESSION_UID ? 'user_id,key' : 'key'; }
  function rowFor(data) {
    var r = { key: APP_KEY, data: data, updated_at: new Date().toISOString() };
    if (SESSION_UID) r.user_id = SESSION_UID;
    return r;
  }
  function scopeQ() { return SESSION_UID ? '&user_id=eq.' + encodeURIComponent(SESSION_UID) : ''; }

  // Report to the sync watchdog (als-sync-status.js). No-op if absent.
  // The engine NAME matters: the watchdog used to keep one shared counter, so
  // sync.js succeeding cleared pocoach-sync's failures every 15s and the alarm
  // could never fire. Weigh-ins are this engine's, and only this engine can
  // say whether they landed.
  function ss(m, detail) { try { var s = window.ALSSyncStatus; if (s && s[m]) s[m]('gym & weigh-ins', detail); } catch (e) {} }

  /* Call whichever page-specific rerender hooks are present */
  function fireRerender() {
    if (typeof window._gymRerender === 'function')  { try { window._gymRerender(); }  catch(e) {} }
    if (typeof window._bodyRerender === 'function') { try { window._bodyRerender(); } catch(e) {} }
    if (typeof window._weightRerender === 'function') { try { window._weightRerender(); } catch(e) {} }
    if (typeof window._prRerender === 'function') { try { window._prRerender(); } catch(e) {} }
  }

  function isGymKey(k) {
    if (!k) return false;
    for (var i = 0; i < KEYS.length; i++) if (k === KEYS[i]) return true;
    return k.indexOf('po_coach_logs:') === 0;
  }

  function readLocal() {
    var out = {};
    for (var i = 0; i < KEYS.length; i++) {
      var v = localStorage.getItem(KEYS[i]);
      if (v != null) { try { out[KEYS[i]] = JSON.parse(v); } catch(e) { out[KEYS[i]] = v; } }
    }
    for (var j = 0; j < localStorage.length; j++) {
      var k = localStorage.key(j);
      if (k && k.indexOf('po_coach_logs:') === 0) {
        var lv = localStorage.getItem(k);
        if (lv != null) { try { out[k] = JSON.parse(lv); } catch(e) { out[k] = lv; } }
      }
    }
    return out;
  }

  /* Union weight arrays by dateKey. For a same-date conflict the entry with
     the NEWER edit timestamp (e.ts, ms epoch) wins — this is what prevents
     split-brain: a stale device can no longer clobber a fresh edit from
     another device just because it happens to sync last. Legacy entries have
     no ts (treated as 0); on a true tie the later-considered (local) wins,
     preserving the old behaviour for historical data. */
  function mergeWeights(loc, rem, tnode) {
    var map = {};
    var r = Array.isArray(rem) ? rem : [];
    var l = Array.isArray(loc) ? loc : [];
    function consider(e) {
      if (!e || !e.dateKey) return;
      var cur = map[e.dateKey];
      if (!cur) { map[e.dateKey] = e; return; }
      var curTs = +cur.ts || 0, newTs = +e.ts || 0;
      if (newTs >= curTs) map[e.dateKey] = e; // newer edit wins; tie → local (considered last)
    }
    for (var i = 0; i < r.length; i++) consider(r[i]); // remote first
    for (var j = 0; j < l.length; j++) consider(l[j]); // then local
    var out = [];
    for (var dk in map) {
      if (!Object.prototype.hasOwnProperty.call(map, dk)) continue;
      if (tombedG(tnode, 'dk:' + dk, map[dk])) { tombDropped = true; continue; }
      if (tnode && typeof tnode['dk:' + dk] === 'number') delete tnode['dk:' + dk];  // re-logged after the delete → retire the tombstone
      out.push(map[dk]);
    }
    out.sort(function(a, b) { return a.dateKey < b.dateKey ? -1 : a.dateKey > b.dateKey ? 1 : 0; });
    return out;
  }

  /* Merge remote into local — union weights/id-arrays (honoring tombstones),
     local wins for every other key. Also unions + persists tombstones. */
  function mergeData(loc, rem) {
    tombDropped = false;
    if (!rem || typeof rem !== 'object') return loc;
    var tomb = unionTombG(loadTomb(), rem._deletes || {});
    var m = {};
    var lk = Object.keys(loc);
    for (var i = 0; i < lk.length; i++) m[lk[i]] = loc[lk[i]];
    var rk = Object.keys(rem);
    for (var j = 0; j < rk.length; j++) {
      var k = rk[j];
      if (k === '_deletes')         { continue; }
      else if (k === 'po_coach_weights') { m[k] = mergeWeights(loc[k], rem[k], tomb[k]); }
      else if (ID_UNION[k])         { m[k] = mergeById(loc[k], rem[k], tomb[k]); }
      else if (!(k in m))           { m[k] = rem[k]; }
    }
    /* saved AFTER merging: the merges retire tombstones that a genuine re-add has
       outlived, and that retirement has to persist (and be pushed) too. */
    for (var tk in tomb) { if (tomb[tk] && !Object.keys(tomb[tk]).length) delete tomb[tk]; }
    saveTomb(tomb);
    return m;
  }

  var suppressed = false;
  var pushTimer  = null;
  var lastJson   = null;

  /* Write merged data to localStorage without triggering another push */
  function applyLocal(data) {
    var changed = false;
    suppressed = true;
    try {
      var keys = Object.keys(data);
      for (var i = 0; i < keys.length; i++) {
        var v = JSON.stringify(data[keys[i]]);
        if (localStorage.getItem(keys[i]) !== v) { _origSet(keys[i], v); changed = true; }
      }
    } finally { suppressed = false; }
    return changed;
  }

  /* Body we send to Supabase: local data + deletion tombstones */
  function pushBody() {
    var data = readLocal();
    var tomb = loadTomb();
    if (tomb && Object.keys(tomb).length) data._deletes = tomb;
    return data;
  }

  /* The upsert replaces the whole row, tombstones included. So a device that has
     never pulled would overwrite the cloud's `_deletes` with its own (empty) set
     — erasing deletions made elsewhere. Learn the cloud's tombstones first: until
     a pull has landed, a push routes through syncNow (pull → merge → push).
     Exception: the pagehide push, which has no time to round-trip — stranding a
     just-logged workout is worse than a tombstone another device will re-push. */
  var pulled = false;

  /* Push current local state to Supabase (keepalive=true for pagehide).
     Resolves TRUE only when the cloud confirmed the write — the caller uses that
     to decide whether lastJson may advance. Never advance it on a promise. */
  function push(keepalive, body) {
    if (!pulled && !keepalive) { syncNow(); return Promise.resolve(false); }
    // A keepalive push has no time to round-trip, so it uses whatever token is
    // already cached. Every other push waits for one: the 400ms debounce used to
    // fire before the first ensureToken() had resolved, sending the anon key,
    // which RLS rejects.
    var ready = keepalive ? Promise.resolve() : ensureToken();
    return ready.then(function () {
      return fetch(REST + '?on_conflict=' + conflictCols(), {
        method: 'POST',
        headers: Object.assign({}, hdrs(), { 'Prefer': 'resolution=merge-duplicates' }),
        body: JSON.stringify(rowFor(body || pushBody())),
        keepalive: !!keepalive
      });
    }).then(function(r) {
      if (r && r.ok) { ss('ok'); return true; }
      // Read the body: a 400 here means the REQUEST is wrong (wrong conflict
      // target, bad column), which no amount of retrying can fix. Four days of
      // weigh-ins were lost to a failure nobody could name.
      var st = (r && r.status) || 0;
      if (r && r.text) { r.text().then(function (t) {
        console.warn('[pocoach-sync] push rejected: http ' + st + ' — ' + String(t || '').slice(0, 300));
      }).catch(function () {}); }
      else console.warn('[pocoach-sync] push rejected: http ' + st);
      ss('fail', 'HTTP ' + st); return false;
    }).catch(function(e) {
      console.warn('[pocoach-sync] push failed — will retry:', (e && e.message) || e);
      ss('fail', 'network'); return false;
    });
  }

  /* Pull from Supabase → merge → push merged → rerender if changed.
     ensureToken() first: without the caller's JWT the pull returns nothing under
     RLS, and a fresh device would render an empty history. */
  function syncNow() {
    ensureToken().then(function () {
    fetch(REST + '?key=eq.' + APP_KEY + scopeQ() + '&select=data', { headers: hdrs() })
      .then(function(r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function(rows) {
        try { window.POCOACH_LAST_SYNC = Date.now(); } catch (e) {} // a pull completed → cloud is reachable
        pulled = true;                                             // we now hold the cloud's tombstones
        var remote  = (Array.isArray(rows) && rows[0] && rows[0].data) ? rows[0].data : null;
        var local   = readLocal();
        var merged  = mergeData(local, remote);
        var changed = applyLocal(merged);
        var body    = pushBody();
        var bJson   = JSON.stringify(body);
        if (changed) fireRerender();
        /* tombDropped → the cloud still holds something we deleted; rewrite the row
           even when our own payload has not changed, or it would live there for ever */
        if (bJson !== lastJson || tombDropped) {
          /* A pull reaching the cloud does NOT mean OUR data got there. Only the
             push can say that. This used to fire ss('ok') here regardless and
             advance lastJson on an unresolved promise — so a failing push could
             read "Saved" while local edits sat unsent, and the 15s reconciler
             then compared against a lastJson that was never true and stopped
             retrying. Wait for the push; advance only on confirmation. */
          return push(false, body).then(function (pushed) {
            if (pushed) lastJson = bJson;
            return pushed;
          });
        }
        ss('ok');            // nothing of ours to send AND the pull confirmed → truly in sync
        return true;
      })
      .catch(function(e) {
        console.warn('[pocoach-sync] pull failed — will retry:', (e && e.message) || e);
        ss('fail', 'read failed'); return false;
      });
    });
  }

  /* Apply an incoming Realtime payload — same merge logic */
  function applyRealtime(remote) {
    if (!remote || typeof remote !== 'object') return;
    pulled = true;                    // we have seen the cloud row (tombstones included)
    var remJson = JSON.stringify(remote);
    if (remJson === lastJson) return; // our own echo
    var local   = readLocal();
    var merged  = mergeData(local, remote);
    var changed = applyLocal(merged);
    var body    = pushBody();
    var bJson   = JSON.stringify(body);
    if (changed) fireRerender();
    if (bJson !== remJson || tombDropped) {
      /* local had extra data/tombs, or the row still holds a delete — push the
         union. lastJson may only advance if that push is confirmed; otherwise
         the 15s reconciler must still see the drift and try again. */
      push(false, body).then(function (pushed) { if (pushed) lastJson = bJson; });
    } else {
      lastJson = remJson;   // the cloud already holds exactly this — nothing to send
    }
  }

  /* Capture the real localStorage.setItem BEFORE any other override */
  var _origSet = localStorage.setItem.bind(localStorage);
  localStorage.setItem = function(k, v) {
    var prev;
    if (!suppressed && (ID_UNION[k] || k === 'po_coach_weights')) { try { prev = localStorage.getItem(k); } catch (e) {} }
    _origSet(k, v);
    if (!suppressed && isGymKey(k)) {
      if (ID_UNION[k] || k === 'po_coach_weights') {
        try {
          var t = loadTomb();
          t[k] = diffTombG(pj(prev), pj(v), t[k], Date.now(), k === 'po_coach_weights');
          if (t[k] && !Object.keys(t[k]).length) delete t[k];
          saveTomb(t);
        } catch (e) {}
      }
      ss('queued');                                    // a gym/weigh-in change is waiting to save
      clearTimeout(pushTimer);
      pushTimer = setTimeout(function() {
        // Advance lastJson here too when it lands, or the 15s reconciler would
        // see stale drift and push the identical payload a second time.
        var b = pushBody(), bj = JSON.stringify(b);
        push(false, b).then(function (pushed) { if (pushed) lastJson = bj; });
      }, 400);
    }
  };

  /* Has the user deleted this id? Seeders ask before re-adding a canonical
     exercise/template, so a delete isn't undone on every page load. */
  window.POCOACH_TOMBED = function(key, id) {
    try { var t = loadTomb()[key]; return !!(t && typeof t['id:' + id] === 'number'); }
    catch (e) { return false; }
  };

  /* The tombstones for one key, e.g. {'id:abc': 1783…}. Pages filter their reads
     through this so a deleted item can never be RENDERED — whatever put it back
     in localStorage. Belt and braces: the merge already drops it. */
  window.POCOACH_TOMBS = function(key) {
    try { return loadTomb()[key] || {}; } catch (e) { return {}; }
  };

  /* Delete, definitively. Records the tombstone explicitly (rather than inferring
     it from a before/after diff) and then rewrites the cloud row itself: reads it,
     strips the ids, merges the tombstones back in, waits for the write to land.
     Resolves once the deletion is real ON THE SERVER, so nothing can pull the item
     back afterwards. */
  window.POCOACH_DELETE = function(key, ids) {
    ids = (ids || []).filter(function(x) { return x != null; });
    if (!ids.length) return Promise.resolve(false);

    var t = loadTomb(), now = Date.now();
    t[key] = t[key] || {};
    ids.forEach(function(id) { t[key]['id:' + id] = now; });
    saveTomb(t);

    var gone = {};
    ids.forEach(function(id) { gone[String(id)] = 1; });

    // local: drop them now, without re-triggering the diff hook
    try {
      var cur = pj(localStorage.getItem(key));
      if (Array.isArray(cur)) {
        suppressed = true;
        try { _origSet(key, JSON.stringify(cur.filter(function(e) { return !(e && gone[String(e.id)]); }))); }
        finally { suppressed = false; }
      }
    } catch (e) {}

    // cloud: read → strip → write, and wait for it (token first, or RLS rejects)
    return ensureToken().then(function () {
    return fetch(REST + '?key=eq.' + APP_KEY + scopeQ() + '&select=data', { headers: hdrs() })
      .then(function(r) { return r.json(); })
      .then(function(rows) {
        var data = (Array.isArray(rows) && rows[0] && rows[0].data) ? rows[0].data : {};
        if (Array.isArray(data[key])) data[key] = data[key].filter(function(e) { return !(e && gone[String(e.id)]); });
        data._deletes = unionTombG(data._deletes || {}, loadTomb());
        return fetch(REST + '?on_conflict=' + conflictCols(), {
          method: 'POST',
          headers: Object.assign({}, hdrs(), { 'Prefer': 'resolution=merge-duplicates' }),
          body: JSON.stringify(rowFor(data))
        }).then(function(r) {
          // fetch() resolves on 4xx/5xx too — without this check a rejected write
          // still advanced lastJson and reported success.
          if (!(r && r.ok)) { console.warn('[pocoach-sync] delete push rejected: http ' + (r && r.status)); return false; }
          lastJson = JSON.stringify(data); pulled = true; return true;
        });
      })
      .catch(function() { return false; });   // offline: the local tombstone still holds
    });
  };

  /* Deliberately lift tombstones — for an EXPLICIT user re-add of something they
     had deleted (the Strong importer re-importing a session you removed). Without
     this a deleted workout could never come back: its id stays tombstoned, the
     merge drops it again, and the import would silently do nothing. */
  window.POCOACH_UNTOMB = function(key, ids) {
    try {
      var t = loadTomb();
      if (!t[key] || !ids || !ids.length) return;
      for (var i = 0; i < ids.length; i++) delete t[key]['id:' + ids[i]];
      if (!Object.keys(t[key]).length) delete t[key];
      saveTomb(t);
    } catch (e) {}
  };

  /* Emergency push when page is hidden/closed — keepalive survives tab close.
     Gated on `pulled`: this push has no time to round-trip, so it replaces the
     whole row with RAW LOCAL. From a device that has not merged with the cloud
     yet — a fresh install, or simply a page closed a second after it opened —
     that overwrites everything the other device has. Data waiting on this device
     is recoverable (it is still in localStorage, and flushes the next time the
     app opens); data this device erased from the cloud is not. So when we have
     never pulled, we keep it rather than gamble the row. */
  function emergencyPush() { if (pulled) push(true); }
  window.addEventListener('beforeunload', emergencyPush);
  window.addEventListener('pagehide',     emergencyPush);
  /* Sync in BOTH directions of a visibility change. Coming back to the
     foreground is the obvious one. Going AWAY matters more: on iOS that is the
     moment before the system suspends the tab, and it is the last chance to do a
     real pull → merge → push before the blind keepalive write above is all
     that's left. sync.js has done this for a while; the engine that owns the
     weigh-ins did not, and the weigh-ins are what kept going missing. */
  document.addEventListener('visibilitychange', function() { syncNow(); });

  /* Initial sync + 15s polling */
  syncNow();
  setInterval(syncNow, 15000);

  /* Supabase Realtime — instant updates on the receiving device */
  if (window.supabase) {
    try {
      rtClient = window.supabase.createClient(SB_BASE, SB_KEY);
      // Realtime is RLS-gated too — hand it the user's token before subscribing,
      // or it silently receives no row changes (the 15s poll still covers it).
      ensureToken().then(function (tok) {
        try { if (tok) rtClient.realtime.setAuth(tok); } catch (e) {}
        rtClient.channel('pocoach_realtime')
          .on('postgres_changes', {
            event: '*', schema: 'public', table: 'app_state', filter: 'key=eq.' + APP_KEY
          }, function(payload) {
            if (payload && payload.new && payload.new.data) applyRealtime(payload.new.data);
          })
          .subscribe();
      });
    } catch(e) {}
  }
})();
