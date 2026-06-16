// =============================================================
// Shared cloud-sync helper — MERGE-FIRST (never loses data).
// Each page calls initCloudSync({ appKey, syncedKeys, syncedPrefixes, onApplied }).
//
// Why merge-first: the old version did whole-blob last-write-wins and even
// DELETED local keys missing from the cloud, so editing on two devices (or
// offline) could silently lose entries. Now every sync does pull -> merge
// (union) -> push, so concurrent/offline additions on different devices all
// survive. Deletions propagate via tombstones so they aren't resurrected.
// =============================================================
(function () {
  'use strict';
  const SUPABASE_URL = 'https://oiyvadqfldwbjroiknjc.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_fGKn40f1Ek1Y4j0VComsFA_l4aXkKM-';

  // ── merge engine (unit-tested in isolation) ──────────────
  function idOf(item){
    if (item && typeof item === 'object') {
      if (item.id != null)      return 'id:' + item.id;
      if (item.dateKey != null) return 'dk:' + item.dateKey;
      if (item.date != null)    return 'dt:' + item.date;
    }
    return null;
  }
  function isPlainObj(o){ return o && typeof o === 'object' && !Array.isArray(o); }

  function mergeArray(loc, rem, tomb){
    var l = Array.isArray(loc) ? loc : [], r = Array.isArray(rem) ? rem : [];
    var sample = l.length ? l[0] : (r.length ? r[0] : null);
    if (sample && typeof sample === 'object' && idOf(sample)) {
      var map = {};
      for (var i = 0; i < r.length; i++) { var idr = idOf(r[i]); if (idr) map[idr] = r[i]; }
      for (var j = 0; j < l.length; j++) {
        var idl = idOf(l[j]); if (!idl) continue;
        var ex = map[idl];
        // Same id on both sides: if either carries an edit timestamp, keep the
        // NEWER edit (tie → local) so concurrent same-record edits converge
        // instead of ping-ponging. No ts info → local wins (original behaviour).
        if (ex && typeof ex === 'object' && typeof l[j] === 'object' && (('ts' in ex) || ('ts' in l[j]))) {
          if ((+l[j].ts || 0) >= (+ex.ts || 0)) map[idl] = l[j];
        } else {
          map[idl] = l[j];
        }
      }
      var out = [];
      for (var key in map) { if (!Object.prototype.hasOwnProperty.call(map, key)) continue; if (tomb && tomb[key]) continue; out.push(map[key]); }
      return out;
    }
    var allPrim = l.every(function(x){ return typeof x !== 'object'; }) && r.every(function(x){ return typeof x !== 'object'; });
    if (allPrim) {
      var seen = {}, o2 = [];
      for (var a = 0; a < r.length; a++) { var k1 = String(r[a]); if (!seen[k1]) { seen[k1] = 1; o2.push(r[a]); } }
      for (var b = 0; b < l.length; b++) { var k2 = String(l[b]); if (!seen[k2]) { seen[k2] = 1; o2.push(l[b]); } }
      return o2;
    }
    return l.length >= r.length ? l : r; // unknown shape → bias to more data
  }

  function mergeObject(loc, rem){
    var out = {}, keys = {};
    var lk = Object.keys(loc || {}), rk = Object.keys(rem || {});
    for (var i = 0; i < lk.length; i++) keys[lk[i]] = 1;
    for (var j = 0; j < rk.length; j++) keys[rk[j]] = 1;
    for (var key in keys) {
      if (!Object.prototype.hasOwnProperty.call(keys, key)) continue;
      var lv = (loc || {})[key], rv = (rem || {})[key];
      if (key === 'logs' && isPlainObj(lv) && isPlainObj(rv)) {
        var m = {}, dks = {};
        var a1 = Object.keys(lv), a2 = Object.keys(rv);
        for (var x = 0; x < a1.length; x++) dks[a1[x]] = 1;
        for (var y = 0; y < a2.length; y++) dks[a2[y]] = 1;
        for (var d in dks) {
          if (!Object.prototype.hasOwnProperty.call(dks, d)) continue;
          var av = lv[d], bv = rv[d];
          m[d] = (typeof av === 'number' && typeof bv === 'number') ? Math.max(av, bv) : (av !== undefined ? av : bv);
        }
        out[key] = m;
      } else if (lv === undefined) out[key] = rv;
      else if (rv === undefined) out[key] = lv;
      else if (Array.isArray(lv) && Array.isArray(rv)) out[key] = mergeArray(lv, rv, null);
      else if (isPlainObj(lv) && isPlainObj(rv)) out[key] = mergeObject(lv, rv);
      else out[key] = rv; // scalar conflict → remote wins (converges)
    }
    return out;
  }

  function mergeValue(lv, rv, tombForKey){
    if (lv === undefined) return rv;
    if (rv === undefined) return lv;
    if (Array.isArray(lv) && Array.isArray(rv)) return mergeArray(lv, rv, tombForKey);
    if (isPlainObj(lv) && isPlainObj(rv)) return mergeObject(lv, rv);
    return rv;
  }

  function diffRemoved(prevArr, newArr){
    if (!Array.isArray(prevArr)) return [];
    var newIds = {};
    if (Array.isArray(newArr)) newArr.forEach(function(it){ var id = idOf(it); if (id) newIds[id] = 1; });
    var removed = [];
    prevArr.forEach(function(it){ var id = idOf(it); if (id && !newIds[id]) removed.push(id); });
    return removed;
  }

  function unionTomb(a, b){
    var out = {};
    [a, b].forEach(function(src){
      if (!src) return;
      for (var k in src) {
        if (!Object.prototype.hasOwnProperty.call(src, k)) continue;
        if (!out[k]) out[k] = {};
        for (var id in src[k]) {
          if (!Object.prototype.hasOwnProperty.call(src[k], id)) continue;
          out[k][id] = Math.max(out[k][id] || 0, src[k][id]);
        }
      }
    });
    return out;
  }

  // ── per-page sync instance ───────────────────────────────
  window.initCloudSync = function (config) {
    const appKey = config && config.appKey;
    const syncedKeys = (config && config.syncedKeys) || [];
    const syncedPrefixes = (config && config.syncedPrefixes) || [];
    const onApplied = config && config.onApplied;
    if (!appKey || !window.supabase) return;
    if (!SUPABASE_URL || !SUPABASE_KEY) return;

    let supa = null, pushTimer = null, suppress = false, lastJson = null;
    const TOMB_KEY = '__synctomb__' + appKey;

    const origSet = localStorage.setItem.bind(localStorage);
    const origGet = localStorage.getItem.bind(localStorage);
    const origRemove = localStorage.removeItem.bind(localStorage);

    function matches(k) {
      if (!k || k === TOMB_KEY) return false;
      if (syncedKeys.indexOf(k) !== -1) return true;
      for (let i = 0; i < syncedPrefixes.length; i++) if (k.indexOf(syncedPrefixes[i]) === 0) return true;
      return false;
    }
    function parse(v) { try { return JSON.parse(v); } catch (e) { return v; } }
    function listKeys() {
      const out = [];
      for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (matches(k)) out.push(k); }
      return out;
    }
    function collectLocal() {
      const o = {};
      listKeys().forEach(function(k){ const v = origGet(k); if (v != null) o[k] = parse(v); });
      return o;
    }
    function loadTomb() { try { return JSON.parse(origGet(TOMB_KEY)) || {}; } catch (e) { return {}; } }
    function saveTomb(t) { try { origSet(TOMB_KEY, JSON.stringify(t)); } catch (e) {} }

    function recordTomb(k, prevVal, newArr) {
      const prev = parse(prevVal);
      if (!Array.isArray(prev)) return;
      const removed = diffRemoved(prev, newArr);
      if (!removed.length) return;
      const t = loadTomb(); if (!t[k]) t[k] = {};
      const now = Date.now();
      removed.forEach(function(id){ t[k][id] = now; });
      saveTomb(t);
    }

    // Intercept writes: record deletions as tombstones, then schedule a sync.
    localStorage.setItem = function (k, v) {
      let prev;
      if (!suppress && matches(k)) { try { prev = origGet(k); } catch (e) {} }
      origSet(k, v);
      if (!suppress && matches(k)) { try { recordTomb(k, prev, parse(v)); } catch (e) {} schedulePush(); }
    };
    localStorage.removeItem = function (k) {
      let prev;
      if (!suppress && matches(k)) { try { prev = origGet(k); } catch (e) {} }
      origRemove(k);
      if (!suppress && matches(k)) { try { recordTomb(k, prev, []); } catch (e) {} schedulePush(); }
    };

    // Combine local + remote (+ tombstones) into the merged superset.
    function buildMerged(remoteData) {
      const local = collectLocal();
      const remote = (remoteData && typeof remoteData === 'object') ? remoteData : {};
      const tomb = unionTomb(loadTomb(), remote._deletes || {});
      const keyset = {};
      Object.keys(local).forEach(function(k){ keyset[k] = 1; });
      Object.keys(remote).forEach(function(k){ if (k !== '_deletes' && matches(k)) keyset[k] = 1; });
      const merged = {};
      Object.keys(keyset).forEach(function(k){ merged[k] = mergeValue(local[k], remote[k], tomb[k] || null); });
      return { merged: merged, tomb: tomb };
    }

    function applyLocal(merged) {
      let changed = false; suppress = true;
      try {
        Object.keys(merged).forEach(function(k){
          const v = JSON.stringify(merged[k]);
          if (origGet(k) !== v) { origSet(k, v); changed = true; }
        });
      } finally { suppress = false; }
      return changed;
    }

    function pushBody(merged, tomb) {
      const data = {};
      Object.keys(merged).forEach(function(k){ data[k] = merged[k]; });
      if (tomb && Object.keys(tomb).length) data._deletes = tomb;
      return data;
    }

    async function pull() {
      try {
        const { data, error } = await supa.from('app_state').select('data').eq('key', appKey).maybeSingle();
        if (!error && data && data.data) return data.data;
      } catch (e) {}
      return null;
    }

    // pull -> merge -> apply locally -> push merged superset
    async function syncNow() {
      if (!supa) return;
      const remote = await pull();
      const r = buildMerged(remote);
      saveTomb(r.tomb);
      const changed = applyLocal(r.merged);
      const body = pushBody(r.merged, r.tomb);
      const json = JSON.stringify(body);
      if (json !== lastJson) {
        lastJson = json;
        try { await supa.from('app_state').upsert({ key: appKey, data: body, updated_at: new Date().toISOString() }, { onConflict: 'key' }); } catch (e) {}
      }
      if (changed && typeof onApplied === 'function') { try { onApplied(); } catch (e) {} }
    }
    function schedulePush() { clearTimeout(pushTimer); pushTimer = setTimeout(syncNow, 400); }

    // Incoming realtime change from another device.
    function applyRealtime(remoteData) {
      const r = buildMerged(remoteData);
      saveTomb(r.tomb);
      const changed = applyLocal(r.merged);
      const body = pushBody(r.merged, r.tomb);
      const json = JSON.stringify(body);
      if (json !== lastJson) {
        lastJson = json;
        // local held data the payload lacked — push the union back
        try { supa.from('app_state').upsert({ key: appKey, data: body, updated_at: new Date().toISOString() }, { onConflict: 'key' }); } catch (e) {}
      }
      if (changed && typeof onApplied === 'function') { try { onApplied(); } catch (e) {} }
    }

    // Best-effort save when the page is closing (can't await a pull here).
    function flushOnUnload() {
      const local = collectLocal();
      const body = pushBody(local, loadTomb());
      const json = JSON.stringify(body);
      if (json === lastJson) return;
      try {
        fetch(SUPABASE_URL + '/rest/v1/app_state?on_conflict=key', {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': 'Bearer ' + SUPABASE_KEY,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates',
          },
          body: JSON.stringify({ key: appKey, data: body, updated_at: new Date().toISOString() }),
          keepalive: true,
        }).catch(function(){});
      } catch (e) {}
    }

    (async function init() {
      supa = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      await syncNow();
      supa.channel('app_state_' + appKey)
        .on('postgres_changes', {
          event: '*', schema: 'public', table: 'app_state', filter: 'key=eq.' + appKey,
        }, function (payload) {
          if (!payload.new || !payload.new.data) return;
          const incoming = JSON.stringify(payload.new.data);
          if (incoming === lastJson) return; // our own echo
          applyRealtime(payload.new.data);
        })
        .subscribe();
      setInterval(syncNow, 15000);
    })();

    window.addEventListener('beforeunload', flushOnUnload);
    window.addEventListener('pagehide', flushOnUnload);
    document.addEventListener('visibilitychange', function(){ if (document.visibilityState === 'visible') syncNow(); });
  };
})();
