'use strict';
// ════════════════════════════════════════════════════════════════
// YouTube courier helper.  `_` prefix = NOT a routed function (free),
// called by run-reminders.js on same-origin requests:
//   ?youtube=<playlistId>   → mirror a public/unlisted playlist
//   ?ytdistill  (POST)      → one video → the few things worth remembering
//   ?ytorganize (POST)      → label a batch of videos with concepts
//
// Playlist: full list via the YouTube Data API when YOUTUBE_API_KEY is set;
// otherwise the public RSS feed (recent ~15) with no key at all. Writes
// nothing — the page reconciles the videos into improve:videos itself.
//
// Distill reads the video's OWN description + chapter list (plus the person's
// notes if they wrote any) and returns TOPIC / CORE / KEY / DO as plain text.
// The description is scrubbed of sponsor blocks, socials and bare links first:
// that both raises signal AND cuts tokens, which is the binding constraint on
// the free tier. Auto-scraping a transcript is deliberately NOT attempted —
// YouTube's caption endpoint is locked (re-verified 22/07/26 across the IOS,
// ANDROID and WEB InnerTube clients: 400/400/UNPLAYABLE, zero caption tracks),
// so it would fail silently, which we refuse to ship.
//
// ⚠️ Organize used to send all 42 videos in ONE call. gpt-oss-120b is a
// reasoning model and its token budget includes the reasoning it never shows,
// so a long list burned the whole budget thinking and returned EMPTY content
// → "parse" → the page said "Nova's busy" forever. It is chunked now, at low
// reasoning effort, and a chunk that fails no longer kills the ones that
// worked.
// ════════════════════════════════════════════════════════════════

var UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
var model = require('./_model');

function decode(s) {
  return s == null ? s : String(s)
    .replace(/&#0?39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}
function thumbOf(vid) { return 'https://i.ytimg.com/vi/' + vid + '/hqdefault.jpg'; }

async function playlist(playlistId, key) {
  if (key) {
    // Full playlist via the Data API (paginated, capped so a giant list can't run away).
    var out = [], page = '', guard = 0;
    do {
      var u = 'https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=' +
        encodeURIComponent(playlistId) + '&key=' + encodeURIComponent(key) + (page ? '&pageToken=' + page : '');
      var r = await fetch(u);
      if (!r.ok) { if (out.length) break; throw new Error('youtube ' + r.status); }
      var j = await r.json();
      (j.items || []).forEach(function (it) {
        var s = it.snippet || {}; var vid = (s.resourceId || {}).videoId; if (!vid) return;
        if (s.title === 'Private video' || s.title === 'Deleted video') return;  // skip dead rows
        var th = s.thumbnails || {}; var thumb = (th.medium || th.high || th.default || {}).url || thumbOf(vid);
        out.push({ videoId: vid, title: s.title || '', channel: s.videoOwnerChannelTitle || s.channelTitle || '', thumb: thumb, published: s.publishedAt || '' });
      });
      page = j.nextPageToken || ''; guard++;
    } while (page && guard < 10);
    return out;
  }
  // No key → RSS feed (recent ~15).
  var rr = await fetch('https://www.youtube.com/feeds/videos.xml?playlist_id=' + encodeURIComponent(playlistId), { headers: { 'User-Agent': UA } });
  if (!rr.ok) throw new Error('youtube rss ' + rr.status);
  var xml = await rr.text();
  var items = xml.split('<entry>').slice(1), res = [];
  items.forEach(function (b) {
    var vid = (b.match(/<yt:videoId>([^<]+)</) || [])[1]; if (!vid) return;
    var title = (b.match(/<title>([^<]*)</) || [])[1] || '';
    var ch = (b.match(/<name>([^<]*)</) || [])[1] || '';
    var pub = (b.match(/<published>([^<]+)</) || [])[1] || '';
    res.push({ videoId: vid, title: decode(title), channel: decode(ch), thumb: thumbOf(vid), published: pub });
  });
  return res;
}

// Best-effort JSON object out of a model reply (handles code fences / stray prose).
function extractJson(raw) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw;
  var m = String(raw).match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch (e) { return null; }
}

/* ── description scrubbing ────────────────────────────────────────
   A YouTube description is maybe 20% substance and 80% merch, sponsors,
   socials and link walls. Chapter lines, though, are a real outline of the
   video — the single best free signal we have — so they're pulled out and
   kept separately. Everything obviously promotional is dropped. */
var PROMO = /\b(patreon|merch|sponsor|sponsored|promo code|use code|discount|coupon|affiliate|subscribe|follow me|follow us|instagram|twitter|tiktok|facebook|linkedin|threads|newsletter|tour dates|store|shop now|copyright disclaimer|all rights reserved|business inquir|book me|my course|sign up|free trial|download the app|link in bio)\b/i;

// A credits / attribution header — everything after it is sourcing, not substance.
var CREDITS = /^(attributions?|credits?|sources?|references?|music|images?|footage|licen[cs]es?|disclaimers?|legal)$/i;

function cleanDesc(raw) {
  var lines = String(raw || '').split(/\r?\n/);
  var chapters = [], body = [], stop = false;
  lines.forEach(function (ln) {
    if (stop) return;
    var s = ln.trim();
    if (!s) return;
    // "00:00 - Introduction" / "(2:12) Why we're addicted" → a chapter title
    var ch = s.match(/^\(?\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\)?\s*[-–—:|»▸]*\s*(.{2,90})$/);
    if (ch && !/^https?:/i.test(ch[2])) {
      var ct = ch[2].replace(/^[-–—:|\s]+/, '').replace(/[-–—:|\s]+$/, '').trim();
      if (ct.length > 1) chapters.push(ct);
      return;
    }
    if (/^https?:\/\//i.test(s)) return;                        // a bare link line
    var hadUrl = /https?:\/\/\S+/i.test(s);
    var t = s.replace(/https?:\/\/\S+/gi, '').trim();           // strip inline links
    // What's left of a line that WAS a link is its label ("Read my letters here:"),
    // never something worth remembering.
    if (hadUrl && (/[:\-–—|)]$/.test(t) || t.length < 60)) return;
    if (t.length < 3) return;
    if (/^[\s\-–—=_*~•.·▼▲◆●○►◄←→|─-╿]+$/.test(t)) return;   // divider art
    if (/^[-–—*=~_]{2,}[^A-Za-z0-9]*[\w\s&'/]{0,30}[^A-Za-z0-9]*[-–—*=~_]{2,}$/.test(t)) return;  // ––– Section –––
    if (/^#[\w#\s]+$/.test(t)) return;                          // a hashtag line
    var bare = t.replace(/^[^A-Za-z0-9]+/, '').replace(/[^A-Za-z0-9?!]+$/, '');
    if (CREDITS.test(bare)) { stop = true; return; }
    if (PROMO.test(t)) return;
    if (/^(socials?|links?|chapters?|timestamps?|resources?|disclaimer)\b/i.test(bare) && bare.length < 40) return;
    body.push(t);
  });
  var text = body.join('\n');
  // Never scrub our way to nothing — fall back to the raw description, delinked.
  // Unless we pulled chapters out: a chapter list already IS the outline, and
  // restoring the raw text would just hand the model back the promo wall.
  if (!chapters.length && text.replace(/\s/g, '').length < 40) {
    text = String(raw || '').replace(/https?:\/\/\S+/gi, '').replace(/\n{3,}/g, '\n\n').trim();
  }
  return { text: text.slice(0, 2200), chapters: chapters.slice(0, 25) };
}

/* One video's description + chapters. Data API when a key exists, otherwise
   the watch page's own `shortDescription` — which works with no key at all,
   so Distill still has real material if YOUTUBE_API_KEY is ever missing. */
async function videoMeta(videoId, key) {
  if (!videoId) return { desc: '', chapters: [], had: false };
  var raw = '';
  if (key) {
    try {
      var r = await fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + encodeURIComponent(videoId) + '&key=' + encodeURIComponent(key));
      if (r.ok) {
        var j = await r.json();
        var it = (j.items || [])[0];
        raw = (it && it.snippet && it.snippet.description) || '';
      }
    } catch (e) {}
  }
  if (!raw) {
    try {
      var w = await fetch('https://www.youtube.com/watch?v=' + encodeURIComponent(videoId), { headers: { 'User-Agent': UA, 'Accept-Language': 'en' } });
      if (w.ok) {
        var h = await w.text();
        var m = h.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/);
        if (m) { try { raw = JSON.parse('"' + m[1] + '"'); } catch (e) {} }
      }
    } catch (e) {}
  }
  var c = cleanDesc(raw);
  return { desc: c.text, chapters: c.chapters, had: !!raw };
}

var DISTILL_SYS =
  'You turn a video into the few things worth REMEMBERING, in the simplest language possible.\n' +
  'You are given its title, channel, its own description, its chapter list, and the person\'s notes if they wrote any.\n' +
  'Write for someone re-reading this in six months who has completely forgotten the video.\n' +
  'Rules:\n' +
  '- Everyday words a tired person understands. No jargon, no hype, no "in this video", no timestamps, no markdown.\n' +
  '- Every key point must be a whole thought that stands on its own — something they could say out loud and be right about.\n' +
  '- Lean on what the description, chapters and notes actually support. Where you must generalise, stay at a level that is safely true. Never invent names, numbers, dates or quotes.\n' +
  'Output PLAIN TEXT, exactly this shape and nothing else:\n' +
  'TOPIC: <2-4 word Title Case theme, e.g. Mindset & Focus, History, Faith, Health, Craft & Skill, Conversations, Money>\n' +
  'CORE: <one sentence — the single idea to keep>\n' +
  'KEY:\n' +
  '- <a takeaway worth remembering>\n' +
  '- <3 to 5 of them, most useful first>\n' +
  'DO: <one small concrete thing to try this week>';

async function distill(text, title, videoId, key) {
  var meta = await videoMeta(videoId, key);
  var notes = String(text || '').slice(0, 6000);
  var user = 'Title: ' + (title || '(untitled)') + '\n' +
    (meta.chapters.length ? '\nWhat it covers, in order:\n- ' + meta.chapters.join('\n- ') + '\n' : '') +
    (meta.desc ? '\nDescription:\n' + meta.desc + '\n' : '') +
    (notes ? '\nTheir own notes:\n' + notes + '\n' : '') +
    (!meta.desc && !meta.chapters.length && !notes
      ? '\n(No description available — work only from the title, and stay general enough to be certainly true.)'
      : '');
  var out = await model.json('text', {
    messages: [{ role: 'system', content: DISTILL_SYS }, { role: 'user', content: user }],
    temperature: 0.35, max_tokens: 900, reasoning: 'low'
  });
  if (!out || !out.ok) return { ok: false, error: (out && out.kind) || 'model' };
  var t = (out.raw || '').trim();
  if (!t) return { ok: false, error: 'empty' };
  return { ok: true, text: t, sourced: !!(meta.desc || meta.chapters.length) };
}

/* ── organize ─────────────────────────────────────────────────────
   Label videos with a small consistent set of concepts. Chunked, because one
   long list blows a reasoning model's token budget before it writes a word.
   Each chunk sees the labels the earlier chunks settled on, so the set stays
   coherent instead of drifting into 20 near-duplicates. A failed chunk costs
   only its own videos. */
function esc_re(s) { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/* Decide the SHELVES before sorting anything onto them. Chunking alone made
   every batch invent its own vocabulary — 42 videos came back under 10 labels,
   some of them just channel names ("Bryce Crawford Podcast"). So: one cheap
   pass over the titles alone names 4-6 concepts for the whole library, and the
   sorting chunks may only use those. Titles-only keeps this small enough that
   the whole library fits in one call even when the sort cannot. */
async function proposeLabels(items) {
  var list = items.map(function (v) {
    return String(v.title || '').slice(0, 90) + (v.topic ? '  [' + String(v.topic).slice(0, 30) + ']' : '');
  }).join('\n');
  var sys = 'These are the titles of everything in one person\'s video library, one per line (a rough guess at a theme may follow in brackets). ' +
    'Name the 4 to 6 CONCEPTS that best cover the WHOLE library. Broad, human, Title Case, 2-4 words each — shelves a person would actually sort by, ' +
    'like Mindset & Focus, Faith, History, Health, Craft & Skill, Conversations, Money. ' +
    'Never use a channel name, a person\'s name or a single video\'s subject as a label. Every video must fit one of them. ' +
    'Output ONLY the labels, one per line, nothing else.';
  var out = await model.json('text', {
    messages: [{ role: 'system', content: sys }, { role: 'user', content: list }],
    temperature: 0.3, max_tokens: 400, reasoning: 'low'
  });
  if (!out || !out.ok) return [];
  return String(out.raw || '').split(/\r?\n/).map(function (l) {
    return l.replace(/^[\s\-–—•*>]+/, '').replace(/^\d+[.)]\s*/, '').replace(/["'`*_]+/g, '').replace(/[.\s]+$/, '').trim().slice(0, 40);
  }).filter(function (l) {
    return l.length > 2 && l.length <= 40 && !/[:|=]/.test(l) && /[A-Za-z]/.test(l);
  }).slice(0, 6);
}

async function organizeChunk(chunk, labels) {
  var list = chunk.map(function (v) {
    return v.videoId + ' | ' + String(v.title || '').slice(0, 110) +
      (v.channel ? ' | ' + String(v.channel).slice(0, 50) : '') +
      (v.core ? ' | about: ' + String(v.core).slice(0, 120) : '');
  }).join('\n');
  var sys = 'You sort videos onto shelves. Each input line is "videoId | title | channel | about". ' +
    (labels.length
      ? 'Use ONLY these shelves: ' + labels.join(', ') + '. Every video gets exactly one of them — pick the closest fit and never invent a new label.'
      : 'Give EVERY video exactly one short concept label (2-4 words, Title Case), and keep the whole set to a handful of broad concepts — merge rather than split.') +
    '\nOutput ONE line per video, exactly this and nothing else:\nvideoId => Concept Label';
  var out = await model.json('text', {
    messages: [{ role: 'system', content: sys }, { role: 'user', content: list }],
    temperature: 0.2, max_tokens: 700, reasoning: 'low'
  });
  if (!out || !out.ok) return null;
  var raw = String(out.raw || '');
  if (!raw.trim()) return null;
  var map = {};
  // A JSON object, if the model returned one anyway.
  var j = extractJson(raw);
  if (j && typeof j === 'object' && !Array.isArray(j)) {
    Object.keys(j).forEach(function (k) { if (typeof j[k] === 'string' && j[k].trim()) map[k] = j[k].trim().slice(0, 40); });
  }
  // Then look up each id we ASKED about — survives fences, prose, numbering,
  // a truncated tail, anything, where a strict parse would shatter.
  chunk.forEach(function (v) {
    if (map[v.videoId]) return;
    var m = raw.match(new RegExp(esc_re(v.videoId) + '["\']?\\s*(?:=>|->|=|:|\\||\\)|,)\\s*["\']?\\s*([^\\n\\r",}]+)'));
    if (m) {
      var label = m[1].replace(/^[-–—\s]+/, '').replace(/["'.\s]+$/, '').trim().slice(0, 40);
      if (label) map[v.videoId] = label;
    }
  });
  return Object.keys(map).length ? map : null;
}

async function organize(items, known) {
  items = (items || []).slice(0, 120);
  if (!items.length) return { ok: false, error: 'empty' };
  var labels = [];
  (known || []).forEach(function (l) { l = String(l || '').trim().slice(0, 40); if (l && labels.indexOf(l) < 0) labels.push(l); });
  labels = labels.slice(0, 8);
  // A library with shelves already keeps them, so new videos join the set he
  // knows instead of spawning near-duplicates. An empty one gets shelves named.
  if (labels.length < 3) {
    var prop = [];
    try { prop = await proposeLabels(items); } catch (e) { prop = []; }
    prop.forEach(function (l) { if (labels.indexOf(l) < 0 && labels.length < 8) labels.push(l); });
  }

  var map = {}, failed = 0;
  for (var i = 0; i < items.length; i += 10) {
    var chunk = items.slice(i, i + 10);
    var got = null;
    try { got = await organizeChunk(chunk, labels); } catch (e) { got = null; }
    if (!got) { failed++; continue; }
    Object.keys(got).forEach(function (id) {
      map[id] = got[id];
      if (labels.indexOf(got[id]) < 0 && labels.length < 8) labels.push(got[id]);
    });
  }
  if (!Object.keys(map).length) return { ok: false, error: failed ? 'model' : 'parse' };
  return { ok: true, concepts: map, partial: failed > 0 };
}

module.exports = { playlist: playlist, distill: distill, organize: organize, _cleanDesc: cleanDesc };
