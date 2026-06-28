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
  function addedAtG(v){
    if (v && typeof v === 'object') return (+v.ts || +v.startedAt || +v._ts || 0);
    if (typeof v === 'number') return v;
    return 0;
  }
  function tombedG(tnode, key, val){
    if (!tnode) return false;
    var t = tnode[key];
    if (typeof t !== 'number') return false;
    return addedAtG(val) <= t;
  }
  // Record removals (now), clear re-adds. isW → key by dateKey, else by id.
  function diffTombG(prev, next, tnode, now, isW){
    tnode = (tnode && typeof tnode === 'object') ? tnode : {};
    var kf = isW ? function(e){ return (e && e.dateKey != null) ? 'dk:' + e.dateKey : null; }
                 : function(e){ return (e && e.id != null) ? 'id:' + e.id : null; };
    var P = {}, N = {};
    if (Array.isArray(prev)) prev.forEach(function(e){ var k = kf(e); if (k) P[k] = 1; });
    if (Array.isArray(next)) next.forEach(function(e){ var k = kf(e); if (k) N[k] = 1; });
    for (var k in P) { if (!Object.prototype.hasOwnProperty.call(P, k)) continue; if (!N[k]) tnode[k] = now; }
    for (var k2 in N) { if (!Object.prototype.hasOwnProperty.call(N, k2)) continue; if (typeof tnode[k2] === 'number') delete tnode[k2]; }
    return tnode;
  }
  function unionTombG(a, b){
    var out = {};
    [a, b].forEach(function(s){ if (!s) return; for (var k in s){ if (!Object.prototype.hasOwnProperty.call(s, k)) continue; if (!out[k]) out[k] = {}; for (var id in s[k]){ if (!Object.prototype.hasOwnProperty.call(s[k], id)) continue; out[k][id] = Math.max(out[k][id] || 0, s[k][id]); } } });
    return out;
  }

  function mergeById(loc, rem, tnode) {
    var map = {}, r = Array.isArray(rem) ? rem : [], l = Array.isArray(loc) ? loc : [];
    for (var i = 0; i < r.length; i++) if (r[i] && r[i].id != null) map['id:' + r[i].id] = r[i];
    for (var j = 0; j < l.length; j++) if (l[j] && l[j].id != null) map['id:' + l[j].id] = l[j]; // local wins same id
    var out = [];
    for (var k in map) { if (!Object.prototype.hasOwnProperty.call(map, k)) continue; if (tombedG(tnode, k, map[k])) continue; out.push(map[k]); }
    return out;
  }

  function hdrs() {
    return { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' };
  }

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
    for (var dk in map) { if (!Object.prototype.hasOwnProperty.call(map, dk)) continue; if (tombedG(tnode, 'dk:' + dk, map[dk])) continue; out.push(map[dk]); }
    out.sort(function(a, b) { return a.dateKey < b.dateKey ? -1 : a.dateKey > b.dateKey ? 1 : 0; });
    return out;
  }

  /* Merge remote into local — union weights/id-arrays (honoring tombstones),
     local wins for every other key. Also unions + persists tombstones. */
  function mergeData(loc, rem) {
    if (!rem || typeof rem !== 'object') return loc;
    var tomb = unionTombG(loadTomb(), rem._deletes || {});
    saveTomb(tomb);
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

  /* Push current local state to Supabase (keepalive=true for pagehide) */
  function push(keepalive) {
    fetch(REST + '?on_conflict=key', {
      method: 'POST',
      headers: Object.assign({}, hdrs(), { 'Prefer': 'resolution=merge-duplicates' }),
      body: JSON.stringify({ key: APP_KEY, data: pushBody(), updated_at: new Date().toISOString() }),
      keepalive: !!keepalive
    }).catch(function() {});
  }

  /* Pull from Supabase → merge → push merged → rerender if changed */
  function syncNow() {
    fetch(REST + '?key=eq.' + APP_KEY + '&select=data', { headers: hdrs() })
      .then(function(r) { return r.json(); })
      .then(function(rows) {
        var remote  = (Array.isArray(rows) && rows[0] && rows[0].data) ? rows[0].data : null;
        var local   = readLocal();
        var merged  = mergeData(local, remote);
        var changed = applyLocal(merged);
        var bJson   = JSON.stringify(pushBody());
        if (bJson !== lastJson) { lastJson = bJson; push(false); }
        if (changed) fireRerender();
      })
      .catch(function() {});
  }

  /* Apply an incoming Realtime payload — same merge logic */
  function applyRealtime(remote) {
    if (!remote || typeof remote !== 'object') return;
    var remJson = JSON.stringify(remote);
    if (remJson === lastJson) return; // our own echo
    var local   = readLocal();
    var merged  = mergeData(local, remote);
    var changed = applyLocal(merged);
    var bJson   = JSON.stringify(pushBody());
    if (bJson !== remJson) { /* local had extra data/tombs — push the union */ lastJson = bJson; push(false); }
    else                   { lastJson = remJson; }
    if (changed) fireRerender();
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
      clearTimeout(pushTimer);
      pushTimer = setTimeout(function() { push(false); }, 400);
    }
  };

  /* Emergency push when page is hidden/closed — keepalive survives tab close */
  function emergencyPush() { push(true); }
  window.addEventListener('beforeunload', emergencyPush);
  window.addEventListener('pagehide',     emergencyPush);
  /* Also push/pull when app comes back to foreground (iOS PWA) */
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') syncNow();
  });

  /* Initial sync + 15s polling */
  syncNow();
  setInterval(syncNow, 15000);

  /* Supabase Realtime — instant updates on the receiving device */
  if (window.supabase) {
    try {
      var rt = window.supabase.createClient(SB_BASE, SB_KEY);
      rt.channel('pocoach_realtime')
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'app_state', filter: 'key=eq.' + APP_KEY
        }, function(payload) {
          if (payload && payload.new && payload.new.data) applyRealtime(payload.new.data);
        })
        .subscribe();
    } catch(e) {}
  }
})();
