'use strict';
// ════════════════════════════════════════════════════════════════
// LETTERBOXD → TMDB courier helper.  `_` prefix = NOT a routed function
// (vercel.json lists its 12 paths; this one is free), called by
// run-reminders.js on a same-origin `?movies=<username>` request.
//
// Why server-side: a browser cannot fetch letterboxd.com's RSS (no CORS
// headers) and must never see the TMDB key. So this runs on the server,
// which can do both. It WRITES NOTHING — it returns the enriched films and
// the client reconciles them into movies:seen through the normal sync. That
// keeps the write path (and the "never duplicate his films" rule) on the
// client where it is previewable, and keeps this endpoint stateless.
//
// The feed already carries a tmdb:movieId on every entry, so enrichment is an
// exact id lookup — no fuzzy title matching. If TMDB is unreachable or the key
// is missing, films still come back with everything the RSS gave (poster,
// rating, like, rewatch) and empty genres, never an error. Graceful, never
// silent-empty: a failed Letterboxd fetch THROWS so the caller can say so.
// ════════════════════════════════════════════════════════════════

// Letterboxd 403s the default UA; a real browser UA gets 200 (verified 2026-07-20).
var UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

function decode(s) {
  return s == null ? s : String(s)
    .replace(/&#0?39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}
function tag(block, name) {
  var m = block.match(new RegExp('<' + name + '>([\\s\\S]*?)<\\/' + name + '>'));
  return m ? decode(m[1].trim()) : null;
}

async function fetchLetterboxd(username) {
  var u = 'https://letterboxd.com/' + encodeURIComponent(username) + '/rss/';
  var r = await fetch(u, { headers: { 'User-Agent': UA, 'Accept': 'application/rss+xml, text/xml, */*' } });
  if (!r.ok) throw new Error('letterboxd ' + r.status);
  var xml = await r.text();
  var items = xml.split('<item>').slice(1);
  var out = [];
  items.forEach(function (b) {
    var title = tag(b, 'letterboxd:filmTitle');
    if (!title) return;                         // list/review items with no film → skip
    var rating = parseFloat(tag(b, 'letterboxd:memberRating'));
    var posterM = b.match(/img src="([^"]+)"/);
    out.push({
      title: title,
      year: parseInt(tag(b, 'letterboxd:filmYear') || '0', 10) || null,
      rating5: isNaN(rating) ? null : rating,
      like: tag(b, 'letterboxd:memberLike') === 'Yes',
      rewatch: tag(b, 'letterboxd:rewatch') === 'Yes',
      tmdb: tag(b, 'tmdb:movieId'),
      watched: tag(b, 'letterboxd:watchedDate') || null,
      poster: posterM ? posterM[1] : null
    });
  });
  return out;
}

// The RSS is one row PER DIARY ENTRY, so a rewatch appears more than once.
// Collapse to one film per tmdb id (falling back to title|year when an entry
// somehow lacks an id). Newest entry wins for the current rating/poster since
// the feed is newest-first; `plays` counts how many times it was logged.
function dedupe(films) {
  var by = {}, order = [];
  films.forEach(function (f) {
    var id = f.tmdb || (f.title + '|' + f.year);
    if (by[id]) {
      by[id].plays += 1;
      by[id].rewatch = true;
      by[id].like = by[id].like || f.like;
      if (f.watched && (!by[id].watched || f.watched > by[id].watched)) by[id].watched = f.watched;
      return;                                   // keep first-seen (newest) rating & poster
    }
    var c = {}; for (var k in f) c[k] = f[k];
    c.plays = 1;
    by[id] = c; order.push(id);
  });
  return order.map(function (id) { return by[id]; });
}

// Exact id lookup on TMDB. Small concurrency so 25-odd films finish fast without
// tripping rate limits. Any single failure just leaves that film unenriched.
async function enrichTMDB(films, key) {
  if (!key) return films;
  var meta = {};
  var ids = films.map(function (f) { return f.tmdb; }).filter(Boolean);
  for (var i = 0; i < ids.length; i += 6) {
    var batch = ids.slice(i, i + 6);
    await Promise.all(batch.map(async function (id) {
      try {
        var r = await fetch('https://api.themoviedb.org/3/movie/' + id +
          '?api_key=' + encodeURIComponent(key) + '&append_to_response=credits');
        if (!r.ok) return;
        var j = await r.json();
        var crew = (j.credits && j.credits.crew) || [];
        var dir = crew.filter(function (c) { return c.job === 'Director'; }).map(function (c) { return c.name; });
        meta[id] = {
          genres: (j.genres || []).map(function (g) { return g.name === 'Science Fiction' ? 'Sci-Fi' : g.name; }),
          director: dir[0] || null,
          runtime: j.runtime || null,
          backdrop: j.backdrop_path ? ('https://image.tmdb.org/t/p/w780' + j.backdrop_path) : null,
          crowd: (j.vote_average > 0) ? Math.round(j.vote_average * 10) : null   // TMDB community score on his 0–100 scale
        };
      } catch (e) { /* leave this film unenriched */ }
    }));
  }
  return films.map(function (f) {
    var m = f.tmdb && meta[f.tmdb];
    if (!m) return f;
    var o = {}; for (var k in f) o[k] = f[k];
    o.genres = m.genres; o.director = m.director; o.runtime = m.runtime; o.backdrop = m.backdrop; o.crowd = m.crowd;
    return o;
  });
}

// TMDB genre ids → the app's genre names (878 = Sci-Fi to match his catalogue).
var GENRE_MAP = { 28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',
  18:'Drama',10751:'Family',14:'Fantasy',36:'History',27:'Horror',10402:'Music',9648:'Mystery',
  10749:'Romance',878:'Sci-Fi',10770:'TV Movie',53:'Thriller',10752:'War',37:'Western' };

// Real recommendations, from HIS films: for the films he rated highest, pull
// TMDB's own "recommendations", drop anything he's already logged, and rank by
// how many of his favourites point at the same film. Each carries the film that
// earned it ("because you loved X"). Any failure returns [] — the page then
// falls back to its local catalogue, so recs never break the sync.
async function buildRecs(enriched, key) {
  if (!key) return [];
  var seenIds = {};
  enriched.forEach(function (f) { if (f.tmdb) seenIds[String(f.tmdb)] = 1; });
  // sources: his highest-rated films that have a tmdb id, top 8
  var sources = enriched.filter(function (f) { return f.tmdb && f.rating != null; })
    .sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); }).slice(0, 8);
  if (!sources.length) return [];
  var pool = {};
  for (var i = 0; i < sources.length; i += 4) {
    var batch = sources.slice(i, i + 4);
    await Promise.all(batch.map(async function (src) {
      try {
        var r = await fetch('https://api.themoviedb.org/3/movie/' + src.tmdb +
          '/recommendations?api_key=' + encodeURIComponent(key) + '&page=1');
        if (!r.ok) return;
        var j = await r.json();
        (j.results || []).slice(0, 12).forEach(function (m) {
          var mid = String(m.id);
          if (!m.id || seenIds[mid] || !m.poster_path) return;      // skip seen + posterless
          if (!pool[mid]) pool[mid] = { tmdb: mid, title: m.title || m.name, count: 0, vote: m.vote_average || 0,
            year: (m.release_date || '').slice(0, 4) ? parseInt(m.release_date.slice(0, 4), 10) : null,
            poster: 'https://image.tmdb.org/t/p/w342' + m.poster_path,
            genres: (m.genre_ids || []).map(function (g) { return GENRE_MAP[g]; }).filter(Boolean),
            because: src.title, becauseRating: src.rating || 0 };
          pool[mid].count += 1;
          if ((src.rating || 0) > pool[mid].becauseRating) { pool[mid].because = src.title; pool[mid].becauseRating = src.rating || 0; }
        });
      } catch (e) { /* one source failing is fine */ }
    }));
  }
  return Object.keys(pool).map(function (k) { return pool[k]; })
    .sort(function (a, b) { return (b.count - a.count) || (b.vote - a.vote); })
    .slice(0, 14)
    .map(function (m) { return { tmdb: m.tmdb, title: m.title, year: m.year, poster: m.poster,
      genres: m.genres, crowd: m.vote > 0 ? Math.round(m.vote * 10) : null, because: m.because }; });
}

async function sync(username, tmdbKey) {
  var raw = await fetchLetterboxd(username);
  var uniq = dedupe(raw);
  var enriched = await enrichTMDB(uniq, tmdbKey);
  // 0–100 rating alongside the raw stars. Done here, not in the TMDB step, so
  // it survives the no-key / TMDB-down path — that path was dropping it.
  enriched.forEach(function (f) { f.rating = (f.rating5 != null) ? Math.round(f.rating5 * 20) : null; });
  var recs = [];
  try { recs = await buildRecs(enriched, tmdbKey); } catch (e) { recs = []; }   // recs never break the sync
  return { films: enriched, recs: recs };
}

module.exports = { sync: sync, fetchLetterboxd: fetchLetterboxd, dedupe: dedupe, buildRecs: buildRecs };
