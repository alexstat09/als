/* ════════════════════════════════════════════════════════════════
   gcal.js — Google Calendar (read-only) for Métron.
   Client-side only: Google Identity Services token flow → fetch events
   straight from the Calendar API (CORS-enabled). No backend, no new
   serverless function, no client secret. The Client ID is public.

   WHY THIS IS MORE THAN A LIST
   ────────────────────────────
   His calendar is ~95% five-minute recurring habit reminders (teeth,
   skincare, supplements, a nightly "sleep" marker). One real event a week
   — Gym Cybex, Saturdays. A flat agenda gave brushing his teeth the same
   weight as his only training session, which is why the panel read as a
   wall of noise. So this module does not just fetch: it CLASSIFIES.
   Routines fold away, real events get the room, exams outrank everything.

   window.GCal:
     connect(cb)   — interactive consent (call from a click), then fetch
     refresh(cb)   — silent token + fetch (call on load)
     cached()      — last fetched {ts, events:[...]} from localStorage
     isConnected() — has the user granted access on this device?
     eventsForDay(events, dayOffset) — filter helper (0=today,1=tomorrow)
     day(offset)   — {date, events, routines, sleep, bedtime, anchor, gaps}
     week()        — [day(0) … day(6)]
     nextExam()    — {ev, days} | null   (soonest exam in the window)
     classify(ev)  — 'exam'|'school'|'gym'|'sleep'|'routine'|'event'
     durMin(ev)    — duration in minutes (DST-safe)
     calendars()   — [{id, name, selected}]
     setCalendars(ids) — null/[] = all; persists device-local

   Each event: { id, title, start, end, allDay, location, rec, cal, calName }
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var CLIENT_ID = '399520052080-5gqhin3597cjs8i0tul7i43hqs2vt9k7.apps.googleusercontent.com';
  var SCOPE     = 'https://www.googleapis.com/auth/calendar.readonly';
  var CACHE_KEY = 'gcal:events';     // { ts, events:[...], cals:[...] }
  var CONN_KEY  = 'gcal:connected';  // '1' once access has been granted here
  var CALS_KEY  = 'gcal:cals';       // array of calendarIds to include; absent = all

  var DAYS        = 7;    // horizon. Was 2 — a week is what makes an exam visible.
  var ROUTINE_MAX = 10;   // minutes. A recurring blip this short is a nudge, not a plan.
  var WAKE_HOUR   = 10;   // his morning routine fires at 10:00
  var BED_HOUR    = 23;   // fallback when no "sleep" marker exists that day
  var MIN_GAP     = 30;   // minutes — below this it isn't free time, it's a hallway

  var _tokenClient = null, _token = null, _tokenExp = 0, _readyCbs = [];
  var _calList = [];      // [{id, name}] from the last successful calendarList read

  /* ── auth ─────────────────────────────────────────────────── */

  function loadGIS(cb) {
    if (window.google && google.accounts && google.accounts.oauth2) { cb(); return; }
    _readyCbs.push(cb);
    if (document.getElementById('gis-sdk')) return;
    var s = document.createElement('script');
    s.id = 'gis-sdk'; s.src = 'https://accounts.google.com/gsi/client'; s.async = true; s.defer = true;
    s.onload = function () { var q = _readyCbs.slice(); _readyCbs = []; q.forEach(function (f) { try { f(); } catch (e) {} }); };
    s.onerror = function () { var q = _readyCbs.slice(); _readyCbs = []; q.forEach(function (f) { try { f('gis_load_failed'); } catch (e) {} }); };
    document.head.appendChild(s);
  }

  function ensureClient() {
    if (_tokenClient) return _tokenClient;
    _tokenClient = google.accounts.oauth2.initTokenClient({ client_id: CLIENT_ID, scope: SCOPE, callback: function () {} });
    return _tokenClient;
  }

  /* interactive = true → show consent/account UI (must come from a user click).
     interactive = false → silent (prompt:'none'); fails quietly if not yet granted. */
  function getToken(interactive, cb) {
    if (_token && Date.now() < _tokenExp - 60000) { cb(_token); return; }
    loadGIS(function (loadErr) {
      if (loadErr) { cb(null, loadErr); return; }
      var tc;
      try { tc = ensureClient(); } catch (e) { cb(null, 'init_failed'); return; }
      tc.callback = function (resp) {
        if (resp && resp.access_token) {
          _token = resp.access_token;
          _tokenExp = Date.now() + ((resp.expires_in ? resp.expires_in : 3600) * 1000);
          try { localStorage.setItem(CONN_KEY, '1'); } catch (e) {}
          cb(_token);
        } else {
          cb(null, (resp && resp.error) || 'no_token');
        }
      };
      try { tc.requestAccessToken(interactive ? {} : { prompt: 'none' }); }
      catch (e) { cb(null, (e && e.message) || 'request_failed'); }
    });
  }

  /* ── classification ───────────────────────────────────────── */

  /* Accents are written inconsistently (ΔΙΑΓΩΝΙΣΜΑ / διαγώνισμα), so strip
     combining marks before matching. Punctuation and emoji go too — every one
     of his routine titles leads with an emoji. Greek LETTERS are preserved. */
  function norm(s) {
    var t = String(s == null ? '' : s).toLowerCase();
    try { t = t.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) {}
    return t.replace(/[^a-z0-9Ͱ-Ͽἀ-῿\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /* Greek written in Greek letters. Checked first: a title like "test ιστορίας"
     should read as an exam whichever alphabet it happens to be in. */
  var GREEK = [
    ['exam',   /(διαγωνισμ|εξετασ|τεστ|προαγωγικ|πανελλην)/],
    ['school', /(σχολει|φροντιστηρι|μαθημα|διδασκαλ)/],
    ['gym',    /(γυμναστηρι|προπονησ|βαρη)/],
    ['sleep',  /(υπνος|κοιμ)/]
  ];
  var LATIN = [
    ['exam',   /\b(diagonisma|test|tests|exam|exams|exetaseis|quiz|midterm|final)\b/],
    ['school', /\b(school|sxoleio|scholeio|frontistirio|lesson|class|lecture|tutor)\b/],
    ['gym',    /\b(gym|cybex|workout|training|lift|lifting|squat|deadlift)\b/],
    ['sleep',  /\b(sleep|bedtime|ypnos)\b/]
  ];

  function durMin(e) {
    if (!e) return 0;
    if (e.allDay) return 24 * 60;
    var a = new Date(e.start), b = new Date(e.end || e.start);
    if (isNaN(a) || isNaN(b)) return 0;
    return Math.max(0, Math.round((b - a) / 60000));   // Date math → DST-safe
  }

  function classify(e) {
    if (!e) return 'event';
    var t = norm(e.title), i;
    for (i = 0; i < GREEK.length; i++) if (GREEK[i][1].test(t)) return GREEK[i][0];
    for (i = 0; i < LATIN.length; i++) if (LATIN[i][1].test(t)) return LATIN[i][0];
    /* No keyword. A short RECURRING blip is a habit nudge, not an appointment —
       that is the whole reason this file exists. Anything else is a real event. */
    if (!e.allDay && e.rec && durMin(e) <= ROUTINE_MAX) return 'routine';
    return 'event';
  }

  function isRoutine(e) { var c = classify(e); return c === 'routine' || c === 'sleep'; }

  /* ── fetching ─────────────────────────────────────────────── */

  function mapEvent(it, calId, calName) {
    var allDay = !!(it.start && it.start.date && !it.start.dateTime);
    return {
      id: it.id,
      title: it.summary || '(no title)',
      start: (it.start && (it.start.dateTime || it.start.date)) || '',
      end:   (it.end   && (it.end.dateTime   || it.end.date))   || '',
      allDay: allDay,
      location: it.location || '',
      rec: !!it.recurringEventId,
      cal: calId || 'primary',
      calName: calName || ''
    };
  }

  function selectedCals() {
    try { var v = JSON.parse(localStorage.getItem(CALS_KEY)); return (v && v.length) ? v : null; }
    catch (e) { return null; }
  }

  function fetchCalendarList(tok) {
    return fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=reader&maxResults=50',
      { headers: { Authorization: 'Bearer ' + tok } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        var items = (d && d.items) || [];
        if (!items.length) return [{ id: 'primary', name: '' }];
        return items.filter(function (c) { return !c.deleted; })
                    .map(function (c) { return { id: c.id, name: c.summaryOverride || c.summary || '' }; });
      })
      /* One dead calendarList must not cost him his whole agenda. */
      .catch(function () { return [{ id: 'primary', name: '' }]; });
  }

  function fetchOne(tok, cal, timeMin, timeMax) {
    var url = 'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(cal.id) + '/events'
      + '?timeMin=' + encodeURIComponent(timeMin.toISOString())
      + '&timeMax=' + encodeURIComponent(timeMax.toISOString())
      + '&singleEvents=true&orderBy=startTime&maxResults=250';
    return fetch(url, { headers: { Authorization: 'Bearer ' + tok } })
      .then(function (r) {
        if (r.status === 401) { _token = null; _tokenExp = 0; return null; }
        return r.ok ? r.json() : null;
      })
      .then(function (d) {
        if (!d) return [];
        return (d.items || [])
          .filter(function (it) { return it.status !== 'cancelled'; })
          .map(function (it) { return mapEvent(it, cal.id, cal.name); })
          .filter(function (e) { return e.start; });
      })
      .catch(function () { return []; });
  }

  function fetchEvents(interactive, cb) {
    cb = cb || function () {};
    getToken(interactive, function (tok, err) {
      if (!tok) { cb(null, err || 'not_connected'); return; }
      var now = new Date();
      var start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      var end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + DAYS);
      fetchCalendarList(tok).then(function (cals) {
        _calList = cals;
        var pick = selectedCals();
        var use = pick ? cals.filter(function (c) { return pick.indexOf(c.id) >= 0; }) : cals;
        if (!use.length) use = cals;
        return Promise.all(use.map(function (c) { return fetchOne(tok, c, start, end); }));
      }).then(function (lists) {
        var seen = {}, evs = [];
        lists.forEach(function (l) {
          l.forEach(function (e) {
            var k = e.cal + '|' + e.id;
            if (seen[k]) return;
            seen[k] = 1; evs.push(e);
          });
        });
        evs.sort(function (a, b) { return new Date(a.start) - new Date(b.start); });
        var payload = { ts: Date.now(), events: evs, cals: _calList };
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(payload)); } catch (e) {}
        cb(evs);
      }).catch(function (e) { cb(null, (e && e.message) || 'fetch_failed'); });
    });
  }

  /* ── reading ──────────────────────────────────────────────── */

  function cached() {
    try {
      var p = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (p && p.cals && p.cals.length && !_calList.length) _calList = p.cals;
      return (p && p.events) ? p : null;
    } catch (e) { return null; }
  }
  function isConnected() { try { return localStorage.getItem(CONN_KEY) === '1'; } catch (e) { return false; } }
  function allEvents() { var c = cached(); return (c && c.events) || []; }

  function midnight(offset) {
    var d = new Date(); d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + (offset || 0));
    return d;
  }
  function startOf(e) {
    /* An all-day "2026-07-25" parses as UTC midnight, which lands on the previous
       day for anyone east of Greenwich — Athens included. Force local. */
    if (e.allDay) return new Date(String(e.start) + 'T00:00:00');
    return new Date(e.start);
  }
  function endOf(e) {
    if (e.allDay) return new Date(String(e.end || e.start) + 'T00:00:00');
    return new Date(e.end || e.start);
  }

  /* events that fall on a given local day (0 = today, 1 = tomorrow), sorted by start */
  function eventsForDay(events, dayOffset) {
    var base = midnight(dayOffset);
    var next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1);
    return (events || []).filter(function (e) {
      var s = startOf(e);
      if (isNaN(s)) return false;
      return s >= base && s < next;
    }).sort(function (a, b) { return startOf(a) - startOf(b); });
  }

  function gapsFor(base, timed, bed) {
    var open = new Date(base.getFullYear(), base.getMonth(), base.getDate(), WAKE_HOUR, 0, 0, 0);
    var shut = bed || new Date(base.getFullYear(), base.getMonth(), base.getDate(), BED_HOUR, 0, 0, 0);
    var now = new Date();
    /* Today, free time that has already elapsed is not free time. */
    if (now.toDateString() === base.toDateString() && now > open) open = now;
    if (shut <= open) return [];
    var out = [], cursor = open;
    timed.slice().sort(function (a, b) { return startOf(a) - startOf(b); }).forEach(function (e) {
      var s = startOf(e), en = endOf(e);
      if (isNaN(s) || isNaN(en)) return;
      if (s > cursor) {
        var stop = new Date(Math.min(s.getTime(), shut.getTime()));
        var m = Math.round((stop - cursor) / 60000);
        if (m >= MIN_GAP) out.push({ start: new Date(cursor), end: stop, mins: m });
      }
      if (en > cursor) cursor = en;
    });
    if (shut > cursor) {
      var m2 = Math.round((shut - cursor) / 60000);
      if (m2 >= MIN_GAP) out.push({ start: new Date(cursor), end: new Date(shut), mins: m2 });
    }
    return out;
  }

  function day(offset) {
    var base = midnight(offset);
    var all = eventsForDay(allEvents(), offset);
    var events = [], routines = [], sleep = null;
    all.forEach(function (e) {
      var c = classify(e);
      e._class = c;
      if (c === 'sleep') { if (!sleep) sleep = e; routines.push(e); }
      else if (c === 'routine') routines.push(e);
      else events.push(e);
    });
    var timed = events.filter(function (e) { return !e.allDay; });
    /* The anchor is the day's centre of gravity: an exam if there is one,
       otherwise the longest real block. */
    var anchor = null;
    timed.forEach(function (e) {
      if (!anchor) { anchor = e; return; }
      if (e._class === 'exam' && anchor._class !== 'exam') { anchor = e; return; }
      if (anchor._class === 'exam' && e._class !== 'exam') return;
      if (durMin(e) > durMin(anchor)) anchor = e;
    });
    var bed = sleep ? startOf(sleep) : null;
    return {
      date: base, events: events, routines: routines, sleep: sleep,
      bedtime: bed, anchor: anchor, all: all, gaps: gapsFor(base, timed, bed)
    };
  }

  function week() { var o = [], i; for (i = 0; i < DAYS; i++) o.push(day(i)); return o; }

  function nextExam() {
    var i, j, d;
    for (i = 0; i < DAYS; i++) {
      d = day(i);
      for (j = 0; j < d.events.length; j++) {
        if (classify(d.events[j]) === 'exam') return { ev: d.events[j], days: i };
      }
    }
    return null;
  }

  function calendars() {
    var c = cached(); var list = (c && c.cals && c.cals.length) ? c.cals : _calList;
    var pick = selectedCals();
    return (list || []).map(function (x) { return { id: x.id, name: x.name, selected: !pick || pick.indexOf(x.id) >= 0 }; });
  }
  function setCalendars(ids) {
    try {
      if (!ids || !ids.length) localStorage.removeItem(CALS_KEY);
      else localStorage.setItem(CALS_KEY, JSON.stringify(ids));
    } catch (e) {}
  }

  window.GCal = {
    connect: function (cb) { fetchEvents(true, cb); },
    refresh: function (cb) { fetchEvents(false, cb); },
    cached: cached,
    isConnected: isConnected,
    eventsForDay: eventsForDay,
    classify: classify,
    isRoutine: isRoutine,
    durMin: durMin,
    startOf: startOf,
    endOf: endOf,
    day: day,
    week: week,
    nextExam: nextExam,
    calendars: calendars,
    setCalendars: setCalendars,
    DAYS: DAYS,
    CLIENT_ID: CLIENT_ID
  };
})();
