/* ════════════════════════════════════════════════════════════════
   gcal.js — Google Calendar (read-only) for AURORA.
   Client-side only: Google Identity Services token flow → fetch events
   straight from the Calendar API (CORS-enabled). No backend, no new
   serverless function, no client secret. The Client ID is public.

   window.GCal:
     connect(cb)   — interactive consent (call from a click), then fetch
     refresh(cb)   — silent token + fetch (call on load)
     cached()      — last fetched {ts, events:[...]} from localStorage
     isConnected() — has the user granted access on this device?
     eventsForDay(events, dayOffset) — filter helper (0=today,1=tomorrow)
   Each event: { id, title, start, end, allDay, location }
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var CLIENT_ID = '399520052080-5gqhin3597cjs8i0tul7i43hqs2vt9k7.apps.googleusercontent.com';
  var SCOPE     = 'https://www.googleapis.com/auth/calendar.readonly';
  var CACHE_KEY = 'gcal:events';     // { ts, events:[...] }
  var CONN_KEY  = 'gcal:connected';  // '1' once access has been granted here

  var _tokenClient = null, _token = null, _tokenExp = 0, _readyCbs = [];

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

  function mapEvent(it) {
    var allDay = !!(it.start && it.start.date && !it.start.dateTime);
    return {
      id: it.id,
      title: it.summary || '(no title)',
      start: (it.start && (it.start.dateTime || it.start.date)) || '',
      end:   (it.end   && (it.end.dateTime   || it.end.date))   || '',
      allDay: allDay,
      location: it.location || ''
    };
  }

  function fetchEvents(interactive, cb) {
    cb = cb || function () {};
    getToken(interactive, function (tok, err) {
      if (!tok) { cb(null, err || 'not_connected'); return; }
      var now = new Date();
      var start = new Date(now.getFullYear(), now.getMonth(), now.getDate());        // midnight today (local)
      var end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 2); // through end of tomorrow
      var url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'
        + '?timeMin=' + encodeURIComponent(start.toISOString())
        + '&timeMax=' + encodeURIComponent(end.toISOString())
        + '&singleEvents=true&orderBy=startTime&maxResults=50';
      fetch(url, { headers: { Authorization: 'Bearer ' + tok } }).then(function (r) {
        if (r.status === 401) { _token = null; _tokenExp = 0; return { _err: 'expired' }; }
        if (!r.ok) return { _err: 'http_' + r.status };
        return r.json();
      }).then(function (data) {
        if (!data || data._err) { cb(null, (data && data._err) || 'no_data'); return; }
        var evs = (data.items || []).map(mapEvent).filter(function (e) { return e.start; });
        var payload = { ts: Date.now(), events: evs };
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(payload)); } catch (e) {}
        cb(evs);
      }).catch(function (e) { cb(null, (e && e.message) || 'fetch_failed'); });
    });
  }

  function cached() { try { var p = JSON.parse(localStorage.getItem(CACHE_KEY)); return (p && p.events) ? p : null; } catch (e) { return null; } }
  function isConnected() { try { return localStorage.getItem(CONN_KEY) === '1'; } catch (e) { return false; } }

  /* events that fall on a given local day (0 = today, 1 = tomorrow), sorted by start */
  function eventsForDay(events, dayOffset) {
    var base = new Date(); base.setHours(0, 0, 0, 0); base.setDate(base.getDate() + (dayOffset || 0));
    var next = new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1);
    return (events || []).filter(function (e) {
      var s = new Date(e.start);
      if (isNaN(s)) return false;
      if (e.allDay) { var d = new Date(e.start + 'T00:00:00'); return d >= base && d < next; }
      return s >= base && s < next;
    }).sort(function (a, b) { return new Date(a.start) - new Date(b.start); });
  }

  window.GCal = {
    connect: function (cb) { fetchEvents(true, cb); },
    refresh: function (cb) { fetchEvents(false, cb); },
    cached: cached,
    isConnected: isConnected,
    eventsForDay: eventsForDay,
    CLIENT_ID: CLIENT_ID
  };
})();
