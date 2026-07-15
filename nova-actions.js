// ════════════════════════════════════════════════════════════════
// Nova's hands — confirm-first agency.
//
// When Nova proposes an action in chat ([[ACTION:{json}]]), the chat renders
// a tap-to-confirm chip; on confirm it calls NovaActions.run(verb, args).
//
// Each verb mirrors the EXACT write shape of the matching api/mcp.js tool
// (the authoritative, tested logic), so in-app actions and Claude-via-MCP
// produce identical data. Writes are read-modify-write on the cloud bundle
// (like mcp's mutateBundle) AND reflected into localStorage — so the change
// is durable immediately and the local UI is correct. If the cloud write
// stamps an older value over a newer unsynced local one, the normal merge
// engine heals it on the next page sync (localStorage stays the source).
//
// Nothing runs without an explicit user tap. Reversible/low-stakes verbs only.
// ════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  if (window.NovaActions) return;

  var SUPA = 'https://oiyvadqfldwbjroiknjc.supabase.co';
  var KEY  = 'sb_publishable_fGKn40f1Ek1Y4j0VComsFA_l4aXkKM-';

  // RLS returns/accepts a user's rows only with THEIR access token; the anon key
  // alone now reads nothing and its writes are rejected. apikey stays the
  // publishable key; Authorization carries the signed-in user's JWT (SESSION_TOKEN).
  var SESSION_TOKEN = null, _authListen = false;
  function authClient() { try { return (window.ALSAuth && window.ALSAuth.client) || window.__alsAuthClient || null; } catch (e) { return null; } }
  function ensureToken() {
    return new Promise(function (resolve) {
      var n = 0;
      (function tick() {
        var c = authClient();
        if (!c || !c.auth) { if (n++ < 25) { setTimeout(tick, 120); return; } resolve(null); return; }
        if (!_authListen && c.auth.onAuthStateChange) { _authListen = true; c.auth.onAuthStateChange(function (_e, s) { SESSION_TOKEN = (s && s.access_token) || SESSION_TOKEN; }); }
        c.auth.getSession().then(function (s) { SESSION_TOKEN = (s && s.data && s.data.session && s.data.session.access_token) || null; resolve(SESSION_TOKEN); }).catch(function () { resolve(null); });
      })();
    });
  }
  function hdr(extra) { var h = { 'apikey': KEY, 'Authorization': 'Bearer ' + (SESSION_TOKEN || KEY) }; if (extra) for (var k in extra) h[k] = extra[k]; return h; }
  function r0(n) { n = parseFloat(n); return isFinite(n) ? Math.round(n) : 0; }
  function num(n) { n = parseFloat(n); return isFinite(n) ? n : null; }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function dkOf(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function today() { return dkOf(new Date()); }
  function suppDay() { var n = new Date(); if (n.getHours() < 6) n.setDate(n.getDate() - 1); return dkOf(n); }
  function arr(x) { return Array.isArray(x) ? x : []; }
  function setLocal(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function s(x) { return (x == null ? '' : String(x)).trim(); }

  // ── verb table: each entry mirrors the matching api/mcp.js write ──
  var VERBS = {
    log_water: {
      appKey: 'health',
      describe: function (a) { var n = Math.max(1, r0(a.n != null ? a.n : (a.glasses != null ? a.glasses : 1))); return 'Log ' + n + ' water'; },
      apply: function (b, a) {
        var n = Math.max(1, r0(a.n != null ? a.n : (a.glasses != null ? a.glasses : 1)));
        var w = b['po_water_v1'] || {}; if (!w.logs) w.logs = {};
        w.logs[today()] = (+w.logs[today()] || 0) + n; w._ts = Date.now();
        b['po_water_v1'] = w; setLocal('po_water_v1', w);
        return 'Logged ' + n + ' water — ' + w.logs[today()] + ' today.';
      }
    },
    log_caffeine: {
      appKey: 'caffeine',
      valid: function (a) { return num(a.mg) != null && num(a.mg) > 0; },
      describe: function (a) { return 'Log ' + r0(a.mg) + 'mg caffeine' + (s(a.name) ? ' (' + s(a.name) + ')' : ''); },
      apply: function (b, a) {
        var logs = arr(b['caf:logs']);
        logs.push({ id: Date.now() + Math.floor(Math.random() * 1000), name: s(a.name) || 'Caffeine', mg: r0(a.mg), emoji: '☕', ts: new Date().toISOString() });
        b['caf:logs'] = logs; setLocal('caf:logs', logs);
        return 'Logged ' + r0(a.mg) + 'mg caffeine.';
      }
    },
    log_weight: {
      appKey: 'po-coach',
      valid: function (a) { return num(a.kg) != null && num(a.kg) > 0; },
      describe: function (a) { return 'Log your weight as ' + num(a.kg) + ' kg'; },
      apply: function (b, a) {
        var w = arr(b['po_coach_weights']); var d = today();
        var i = w.findIndex(function (e) { return e && e.dateKey === d; });
        var rec = { dateKey: d, weight: num(a.kg), ts: Date.now() };
        if (i >= 0) w[i] = rec; else w.push(rec);
        b['po_coach_weights'] = w; setLocal('po_coach_weights', w);
        return 'Logged bodyweight ' + num(a.kg) + 'kg for today.';
      }
    },
    complete_habit: {
      appKey: 'identity',
      valid: function (a) { return !!s(a.habit); },
      describe: function (a) { return 'Mark habit “' + s(a.habit) + '” done'; },
      apply: function (b, a) {
        var list = arr(b['habits:list']); var q = s(a.habit).toLowerCase();
        var h = list.find(function (x) { return x && String(x.name || '').toLowerCase().indexOf(q) >= 0; });
        if (!h) return { error: 'I couldn’t find a habit matching “' + s(a.habit) + '”.' };
        var log = b['habits:log'] || {}; if (!log[today()]) log[today()] = {}; log[today()][h.id] = Date.now();
        b['habits:log'] = log; setLocal('habits:log', log);
        return 'Marked “' + h.name + '” done for today.';
      }
    },
    take_supplement: {
      appKey: 'health',
      valid: function (a) { return !!s(a.name); },
      describe: function (a) { return 'Mark “' + s(a.name) + '” taken'; },
      apply: function (b, a) {
        var items = arr(b['stack:items']);
        if (!items.length) return { error: 'I don’t see your supplement stack synced yet — open Supplements once on this device, then ask me again.' };
        var q = s(a.name).toLowerCase();
        var it = items.find(function (x) { return x && String(x.name || '').toLowerCase().indexOf(q) >= 0; });
        if (!it) return { error: 'No supplement matching “' + s(a.name) + '”.' };
        var tkey = 'stack:taken:' + suppDay(); var taken = b[tkey] || {}; taken[it.id] = Date.now();
        b[tkey] = taken; setLocal(tkey, taken);
        return 'Marked “' + it.name + '” taken.';
      }
    },
    journal_entry: {
      appKey: 'identity',
      valid: function (a) { return !!(s(a.reflection) || s(a.gratitude)); },
      describe: function () { return 'Save a journal entry for today'; },
      apply: function (b, a) {
        var en = arr(b['journal:entries']); var d = today();
        var i = en.findIndex(function (e) { return e && e.dateKey === d; });
        var e = i >= 0 ? en[i] : { id: 'j-' + d, dateKey: d, reflection: '', gratitude: '', ts: Date.now() };
        if (s(a.reflection)) e.reflection = s(a.reflection);
        if (s(a.gratitude)) e.gratitude = s(a.gratitude);
        e.ts = Date.now();
        if (i >= 0) en[i] = e; else en.push(e);
        b['journal:entries'] = en; setLocal('journal:entries', en);
        return 'Saved your journal entry for today.';
      }
    },
    add_idea: {
      appKey: 'ideas',
      valid: function (a) { return !!s(a.text); },
      describe: function (a) { return 'Capture idea: “' + s(a.text) + '”'; },
      apply: function (b, a) {
        var list = arr(b['ideas:items']);
        list.unshift({ id: Date.now(), text: s(a.text), note: s(a.note), category: s(a.category), done: false, pinned: false, createdAt: new Date().toISOString(), doneAt: null });
        b['ideas:items'] = list; setLocal('ideas:items', list);
        return 'Captured: “' + s(a.text) + '”.';
      }
    },
    mark_workout_done: {
      appKey: 'po-coach',
      describe: function () { return 'Mark today’s workout done'; },
      apply: function (b) {
        var done = b['po_coach_workout_done'] || {}; done[today()] = new Date().toISOString();
        b['po_coach_workout_done'] = done; setLocal('po_coach_workout_done', done);
        return 'Marked today’s workout done.';
      }
    },
    set_calorie_target: {
      appKey: 'nutrition',
      valid: function (a) { return num(a.kcal) != null && num(a.kcal) > 0; },
      describe: function (a) { return 'Set your daily calorie target to ' + r0(a.kcal); },
      apply: function (b, a) {
        var p = b['nut:profile'] || {}; p.calTarget = r0(a.kcal); p._ts = Date.now();
        b['nut:profile'] = p; setLocal('nut:profile', p);
        return 'Set your daily calorie target to ' + r0(a.kcal) + '.';
      }
    },
    log_sleep: {
      appKey: 'sleep',
      valid: function (a) { return [a.hours, a.quality, a.recovery, a.energy].some(function (v) { return num(v) != null; }); },
      describe: function (a) { return 'Log sleep' + (num(a.hours) != null ? ' (' + num(a.hours) + 'h)' : '') + ' for last night'; },
      apply: function (b, a) {
        var logs = arr(b['sleep:logs']); var d = today();
        var i = logs.findIndex(function (e) { return e && e.dateKey === d; });
        var e = i >= 0 ? logs[i] : { id: 'sl-' + d, dateKey: d };
        if (num(a.hours) != null) e.hours = num(a.hours);
        if (num(a.recovery) != null) e.recovery = r0(a.recovery);
        if (num(a.quality) != null) e.quality = r0(a.quality);
        if (num(a.energy) != null) e.energy = r0(a.energy);
        e.ts = Date.now();
        if (i >= 0) logs[i] = e; else logs.push(e);
        b['sleep:logs'] = logs; setLocal('sleep:logs', logs);
        return 'Logged sleep for last night.';
      }
    }
  };

  function getVerb(v) { return VERBS[v] || null; }

  // A human description for the confirm chip, or null if the action is invalid.
  function describe(verb, args) {
    var v = getVerb(verb); if (!v) return null;
    args = args || {};
    if (v.valid && !v.valid(args)) return null;
    try { return v.describe(args); } catch (e) { return null; }
  }

  async function getBundle(appKey) {
    var r = await fetch(SUPA + '/rest/v1/app_state?key=eq.' + encodeURIComponent(appKey) + '&select=data', { headers: hdr() });
    if (!r.ok) throw new Error('read ' + r.status);
    var rows = await r.json();
    return (rows && rows[0] && rows[0].data) || {};
  }
  async function putBundle(appKey, data) {
    var r = await fetch(SUPA + '/rest/v1/app_state?on_conflict=key', {
      method: 'POST', headers: hdr({ 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates' }),
      body: JSON.stringify({ key: appKey, data: data, updated_at: new Date().toISOString() })
    });
    if (!r.ok) throw new Error('write ' + r.status);
  }

  // Execute a confirmed action. Returns { ok, message }.
  async function run(verb, args) {
    var v = getVerb(verb); if (!v) return { ok: false, message: 'I don’t know how to do that yet.' };
    args = args || {};
    if (v.valid && !v.valid(args)) return { ok: false, message: 'I’m missing something to do that — tell me the details.' };
    try {
      await ensureToken();                 // RLS needs the caller's JWT or the read/write no-ops
      var b = await getBundle(v.appKey);
      var res = v.apply(b, args);
      if (res && res.error) return { ok: false, message: res.error };  // app-level (e.g. no matching habit) — nothing written
      await putBundle(v.appKey, b);
      try { if (window.ALSSync && window.ALSSync.flush) window.ALSSync.flush(); } catch (e) {}
      return { ok: true, message: res };
    } catch (e) {
      return { ok: false, message: 'Couldn’t save that — check your connection and try again.' };
    }
  }

  window.NovaActions = { run: run, describe: describe, has: function (v) { return !!getVerb(v); }, verbs: function () { return Object.keys(VERBS); } };
})();
