// ════════════════════════════════════════════════════════════════
// ALSProfile — who is using this app.
//
// The dashboard is multi-user now (Alex + Chrissie, and whoever is invited
// next). Nothing may be hardcoded to one person: not the greeting, not the
// macros, not which pages exist. Everything personal reads from here.
//
//   ALSProfile.get()            → the profile object (cached, sync)
//   ALSProfile.set({name:'…'})  → patch + persist (local + cloud)
//   ALSProfile.greeting()       → "Good morning, Chrissie"
//   ALSProfile.has('arxaia')    → is this page enabled for this account?
//   ALSProfile.ready(fn)        → fn(profile) once the cloud copy has landed
//   ALSProfile.needsOnboarding()→ true until they've told us their name
//
// WHY NOT sync.js: every page already calls initCloudSync() with its own
// appKey, and calling it twice per page would fight over the setItem
// interceptor and window.ALSSync. The profile is one small object that every
// page needs, so it talks to its own `profile` row directly through the
// session client that topbar.js already created. localStorage is the cache;
// the cloud row is the truth.
//
// OWNERSHIP: rows are keyed (user_id, key) and RLS enforces auth.uid() =
// user_id. No session → we never write. A row without an owner is exactly how
// the old data leak happened.
// ════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  if (window.ALSProfile) return;

  var KEY = 'als:profile';
  var ROW = 'profile';                     // app_state row key
  var SUPABASE_URL = 'https://oiyvadqfldwbjroiknjc.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_fGKn40f1Ek1Y4j0VComsFA_l4aXkKM-';

  // Every page in the app. A profile's `pages` list is a subset of these.
  // (Not security — RLS protects the data. This is about not showing someone
  // a page that means nothing to them.)
  var ALL_PAGES = [
    'index', 'gym', 'nutrition', 'sleep', 'health', 'body', 'run',
    'money', 'bills', 'life', 'mind', 'movies', 'ideas', 'goals',
    'coach', 'insights', 'arc', 'weekly', 'morning', 'nova-chat',
    'planner', 'measure', 'supps', 'improve', 'backup', 'studio',
    'arxaia', 'istoria'
  ];

  var DEFAULTS = {
    name: '',
    sex: null,               // 'm' | 'f' | null  → BMR
    birthYear: null,         // → age → HR zones, BMR
    heightCm: null,          // → BMR, BMI
    units: 'metric',         // 'metric' | 'imperial'
    wakeTime: '07:00',       // → the sleep score (mirrors sleep:profile)
    sleepNeed: 8.5,          // → the sleep score
    goal: '',                // → the north-star line
    sport: 'lifter',         // 'lifter' | 'runner' → default landing page
    pages: null,             // null = everything; else an allow-list
    onboardedAt: null
  };

  var cache = null, client = null, uid = null, readyFns = [], isReady = false;

  function lsGet() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; } }
  function lsSet(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }

  function merged(p) {
    var out = {};
    for (var k in DEFAULTS) out[k] = DEFAULTS[k];
    if (p) for (var j in p) if (p[j] !== undefined) out[j] = p[j];
    return out;
  }

  cache = merged(lsGet());

  function getClient() {
    if (client) return client;
    try {
      if (!window.supabase || !window.supabase.createClient) return null;
      client = window.__alsAuthClient ||
               (window.__alsAuthClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY));
      return client;
    } catch (e) { return null; }
  }

  // Pull the cloud copy once, so a fresh device/browser gets the profile that
  // was set on another one. Local edits win on conflict (they are newer by
  // definition — set() always writes both).
  async function hydrate() {
    var c = getClient();
    if (!c) return finish();
    try {
      var s = await c.auth.getSession();
      var sess = s && s.data && s.data.session;
      uid = sess && sess.user && sess.user.id;
      if (!uid) return finish();                       // signed out → local only, never write
      var r = await c.from('app_state').select('data').eq('user_id', uid).eq('key', ROW).maybeSingle();
      if (!r.error && r.data && r.data.data && r.data.data[KEY]) {
        var remote = r.data.data[KEY];
        var localTs = (cache && cache._ts) || 0, remoteTs = remote._ts || 0;
        if (remoteTs >= localTs) { cache = merged(remote); lsSet(cache); }
      }
    } catch (e) {}
    finish();
  }
  function finish() {
    isReady = true;
    readyFns.splice(0).forEach(function (fn) { try { fn(cache); } catch (e) {} });
    try { document.dispatchEvent(new CustomEvent('als:profile', { detail: cache })); } catch (e) {}
  }

  async function push() {
    var c = getClient();
    if (!c || !uid) return;                            // no session → no cloud, full stop
    try {
      var body = {}; body[KEY] = cache;
      await c.from('app_state').upsert(
        { user_id: uid, key: ROW, data: body, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,key' }
      );
    } catch (e) {}
  }

  // The caller's Supabase access token. Any endpoint that returns PERSONAL data
  // (Nova) must be told who is asking — the server verifies this token and reads
  // that user's rows. Without it Nova can only 401, and that is deliberate: the
  // alternative (falling back to the owner) would show one account another's life.
  window.ALSAuthHeader = async function () {
    try {
      var c = getClient(); if (!c) return {};
      var s = await c.auth.getSession();
      var tok = s && s.data && s.data.session && s.data.session.access_token;
      return tok ? { Authorization: 'Bearer ' + tok } : {};
    } catch (e) { return {}; }
  };

  window.ALSProfile = {
    ALL_PAGES: ALL_PAGES,

    get: function () { return cache; },

    set: function (patch) {
      if (!patch) return cache;
      for (var k in patch) cache[k] = patch[k];
      cache._ts = Date.now();
      lsSet(cache);
      push();
      // Sleep's own profile is the source for the sleep score — keep it in step
      // rather than inventing a second, disagreeing copy of the same numbers.
      if (patch.wakeTime != null || patch.sleepNeed != null) {
        try {
          var sp = JSON.parse(localStorage.getItem('sleep:profile')) || {};
          if (patch.wakeTime != null) sp.wakeTime = patch.wakeTime;
          if (patch.sleepNeed != null) sp.need = patch.sleepNeed;
          localStorage.setItem('sleep:profile', JSON.stringify(sp));
        } catch (e) {}
      }
      try { document.dispatchEvent(new CustomEvent('als:profile', { detail: cache })); } catch (e) {}
      return cache;
    },

    // "Good morning, Chrissie" — never "Good morning, Alex" for someone else.
    greeting: function (hour) {
      var h = (typeof hour === 'number') ? hour : new Date().getHours();
      var part = h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
      var n = (cache.name || '').trim();
      return n ? (part + ', ' + n) : part;
    },

    firstName: function () { return (cache.name || '').trim().split(/\s+/)[0] || ''; },

    age: function () {
      if (!cache.birthYear) return null;
      return new Date().getFullYear() - cache.birthYear;
    },

    // Is this page enabled for this account? Unknown pages default to visible,
    // so adding a page never silently hides it from everyone.
    has: function (page) {
      if (!cache.pages || !cache.pages.length) return true;   // null = full app
      return cache.pages.indexOf(page) >= 0;
    },

    needsOnboarding: function () { return !(cache.name || '').trim(); },

    ready: function (fn) {
      if (typeof fn !== 'function') return;
      if (isReady) { try { fn(cache); } catch (e) {} } else readyFns.push(fn);
    },

    // Called by the sign-out purge — the profile is a cached copy like anything
    // else, and must not survive into the next person's session.
    _forget: function () { cache = merged(null); try { localStorage.removeItem(KEY); } catch (e) {} }
  };

  hydrate();
})();
