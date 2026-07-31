'use strict';
// ════════════════════════════════════════════════════════════════
// YouTube courier helper.  `_` prefix = NOT a routed function (free),
// called by run-reminders.js on same-origin requests:
//   ?youtube=<playlistId>   → mirror a public/unlisted playlist
//   ?ytdistill  (POST)      → one video → the few things worth remembering
//   ?ytorganize (POST)      → label a batch of videos with concepts
//   ?ytrecap    (POST)      → WATCH one video (Gemini) → the page you keep
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
var rc = require('./_recap');

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

/* ── HOW MUCH DO WE ACTUALLY HAVE? ────────────────────────────────
   The TikTok half has had this since the day it shipped; this half did not,
   and that asymmetry was the single most dishonest thing in the Library.

   ⚠️⚠️ WHAT THIS PATH IS READING IS NOT THE VIDEO. YouTube's caption endpoint
   is locked (re-verified 22/07/26, three InnerTube clients, zero tracks), so
   unlike `_tiktok.js` there is NO transcript here, ever. All we have is the
   creator's own DESCRIPTION — which is marketing copy — its chapter list, and
   whatever Alex typed himself. The old prompt was handed that, told to produce
   "3 to 5" key points and to "stay at a level that is safely true" where it
   had to generalise, and its output was rendered on a card that called every
   single YouTube video a LESSON. That is a fabrication engine wearing the
   costume of the feature built to prevent one.

   So the same contract as TikTok now holds on both sides of the page:
   the grade is decided HERE, in code, before a model is allowed near it, and
   only a lesson-eligible grade may produce key points. Everything below may
   only NAME what the thing is. */
function words(s) { return String(s || '').split(/\s+/).filter(Boolean).length; }

function grade(meta, notes, title) {
  var n = String(notes || '').trim();
  var d = String((meta && meta.desc) || '').trim();
  var ch = ((meta && meta.chapters) || []).length;
  if (n.length >= 12) return 'notes';           // his own words outrank anything
  if (ch >= 3) return 'chapters';               // a chapter list IS the outline
  if (words(d) >= 40) return 'description';     // a real write-up
  /* ⚠️ There is deliberately NO 'thin' grade here, unlike the TikTok helper.
     Two reasons. A ten-word YouTube description ("Full match. Subscribe for
     more.") is not thinner material than a title, it is the same nothing with
     more words — and 'thin' already means something specific on the TikTok
     side ("nothing was said and nothing was written on screen"), so reusing
     the key would put TikTok's sentence on a YouTube card. One grade, one
     meaning, one sentence. */
  if (String(title || '').trim() && String(title).trim() !== '(untitled)') return 'title';
  return 'none';
}

/* The shelves are REQUIRED from the TikTok helper rather than restated here.
   Two copies of a taxonomy is two taxonomies with a delay. improve.html holds
   the third copy on purpose (it has no server), and CVER is what re-shelves
   the library when this list changes. */
var ttHelp = require('./_tiktok');
var SHELF_RULES = ttHelp.SHELF_RULES, SHELVES = ttHelp.SHELVES;

var DISTILL_SYS =
  'You turn a video into the few things worth REMEMBERING, in the simplest language possible.\n' +
  'You are given its title, channel, its own description, its chapter list, and the person\'s notes if they wrote any.\n' +
  '⚠️ You have NOT been given what is actually said in the video, and no transcript exists. A description is written to sell the video. ' +
  'Never write a takeaway the description does not actually make.\n' +
  'Write for someone re-reading this in six months who has completely forgotten the video.\n' +
  'Rules:\n' +
  '- Everyday words a tired person understands. No jargon, no hype, no "in this video", no timestamps, no markdown, no emoji.\n' +
  '- Every key point must be a whole thought that stands on its own — something they could say out loud and be right about.\n' +
  '- Say ONLY what the material supports. Never invent a name, a number, a date, a study or a quote.\n' +
  '- If there is no real lesson in what you were given — it is a song, a match, a stream, a trailer, or the description says nothing — ' +
  'do not force one. Answer with KIND: KEEPSAKE and describe what it is instead.\n' +
  'Output PLAIN TEXT, exactly this shape and nothing else:\n' +
  'KIND: LESSON\n' +
  'TOPIC: <exactly one of the shelves listed below>\n' +
  'CORE: <one sentence — the single idea to keep>\n' +
  'KEY:\n' +
  '- <a takeaway worth remembering>\n' +
  '- <ONLY as many as the material actually supports, at most 5, most useful first. Three real points beat five padded ones. Never repeat the CORE as a key point.>\n' +
  'DO: <one small concrete thing to try this week, only if the material genuinely calls for one>\n\n' + SHELF_RULES;

var LABEL_SYS =
  'You label a video that somebody put in their queue, so they can FIND it again months later.\n' +
  'You are given its title and channel, and at most a scrap of description. That is ALL that exists — ' +
  'there is no transcript, so you do NOT know what happens in it.\n' +
  'Rules:\n' +
  '- Describe only what the material literally tells you: the subject, the person, the kind of video.\n' +
  '- NEVER invent a lesson, a takeaway, a message or advice. If all you have is the title, then the title IS the answer.\n' +
  '- No hype, no markdown, no emoji. Plain, short, factual.\n' +
  'Output PLAIN TEXT, exactly this shape and nothing else:\n' +
  'KIND: KEEPSAKE\n' +
  'TOPIC: <exactly one of the shelves listed below>\n' +
  'CORE: <one sentence naming what this video is — no more than you were told>\n' +
  'KEY:\n' +
  '- <a fact that would help them find it: who is in it, the channel, the subject>\n' +
  '- <1 to 3 of them, and none you were not given. Each must NAME something. Never a single generic word.>\n\n' + SHELF_RULES;

async function distill(text, title, videoId, key) {
  var meta = await videoMeta(videoId, key);
  var notes = String(text || '').slice(0, 6000);
  var g = grade(meta, notes, title);
  if (g === 'none') return { ok: false, error: 'nothing to read', grade: g, unreadable: true };
  var lesson = (g === 'notes' || g === 'chapters' || g === 'description');

  // ⚠️ `mat` is the MATERIAL and nothing else — it is what the grounding check
  // measures against, so our own instructions must never be inside it. A note
  // telling the model "do not invent a lesson" would otherwise donate the words
  // "lesson", "title" and "description" to the haystack and let a fabricated
  // point cite them.
  var mat = 'Title: ' + (title || '(untitled)') + '\n' +
    (meta.chapters.length ? '\nWhat it covers, in order:\n- ' + meta.chapters.join('\n- ') + '\n' : '') +
    (meta.desc ? '\nDescription:\n' + meta.desc + '\n' : '') +
    (notes ? '\nTheir own notes:\n' + notes + '\n' : '');
  var user = mat +
    (!lesson ? '\n(There is no description and no transcript. Name what this is from the title. Do not invent a lesson.)\n' : '');

  var out = await model.json('text', {
    messages: [{ role: 'system', content: lesson ? DISTILL_SYS : LABEL_SYS }, { role: 'user', content: user }],
    temperature: lesson ? 0.3 : 0.15, max_tokens: 900, reasoning: 'low'
  });
  if (!out || !out.ok) return { ok: false, error: (out && out.kind) || 'model', grade: g };
  var t = String(out.raw || '').trim();
  if (!t) return { ok: false, error: 'empty', grade: g };

  // A label prompt cannot return a LESSON, whatever the model wrote.
  if (!lesson) t = t.replace(/^\s*KIND\s*:.*$/im, 'KIND: KEEPSAKE');
  else if (!/^\s*KIND\s*:/im.test(t)) t = 'KIND: LESSON\n' + t;
  // ⚠️ Read `kind` back OUT of the reply. Being ELIGIBLE to write a lesson is
  // not having written one — the same rule as _tiktok.js, for the same reason:
  // a card must never promise takeaways it does not have.
  var declared = (t.match(/^\s*KIND\s*:\s*(\w+)/im) || [])[1] || '';

  // Then check every specific against the material it was supposed to come
  // from. The title is part of the haystack — it is real material, and most
  // honest paraphrases lean on it.
  var lines = t.split(/\r?\n/), keys = [], keyIdx = [];
  lines.forEach(function (ln, i) {
    var m = ln.match(/^\s*[-•*–—]\s*(.+)$/);
    if (m) { keys.push(m[1].trim()); keyIdx.push(i); }
  });
  var checked = ttHelp._groundKeys(keys, mat), body = t, dropped = [];
  if (checked.dropped.length) {
    dropped = checked.dropped;
    var kill = {};
    checked.dropped.forEach(function (d) { kill[d.text] = 1; });
    body = lines.filter(function (ln, i) {
      var at = keyIdx.indexOf(i);
      return at < 0 || !kill[keys[at]];
    }).join('\n');
  }

  // The shelf must be one we actually own, whatever the model wrote.
  var topic = (body.match(/^\s*TOPIC\s*:\s*(.+)$/im) || [])[1] || '';
  var shelf = '', norm = function (s) { return String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ''); };
  SHELVES.forEach(function (s) { if (!shelf && norm(topic).indexOf(norm(s)) >= 0) shelf = s; });

  return {
    ok: true, text: body, grade: g,
    kind: /lesson/i.test(declared) ? 'lesson' : 'keepsake',
    shelf: shelf,
    dropped: dropped.map(function (d) { return d.token; }),
    suspect: !!checked.suspect,
    sourced: !!(meta.desc || meta.chapters.length)
  };
}

/* ════════════════════════════════════════════════════════════════
   THE RECAP — the one path on this page that has actually SEEN the video.
   ════════════════════════════════════════════════════════════════
   Everything above works from the creator's description, because YouTube's
   caption endpoint is locked and no transcript exists. Alex's verdict on the
   result was right and worth keeping verbatim: *"i dont like the key points it
   provides, too vague, not that much good tbh."* It was not a prompt problem.
   A model handed marketing copy and asked what should stick can only produce
   something that is safely true of any video on the subject.

   `recap()` hands the YouTube URL to Gemini, which ingests the real audio and
   frames. So this function is the ONE place in the Library where "what the
   video says" is real rather than inferred, and everything about it — its
   grade, its source line, its badge — has to keep that distinction visible.

   The SHAPE of that page — the prompt, the parser, the word count — lives in
   `_recap.js`, NOT here. It is shared verbatim with the TikTok world, which
   watches its videos too (as bytes, since Gemini only takes a URL for
   YouTube). Hard constraint 15: a guarantee that holds on one code path must
   hold on its twin, and two copies of a prompt are two prompts with a delay.
   ⚠️ `_recap.js` requires nothing, so this file requiring it cannot close a
   cycle with `_tiktok.js` (which this file already requires for the shelves). */

var RECAP_SYS = rc.sysFor(SHELF_RULES);
var RECAP_EMPTY = rc.EMPTY;
var parseRecap = rc.parseRecap;
var recapWords = rc.recapWords;

/* A public watch URL, rebuilt from the id rather than trusted from the client.
   Gemini only accepts PUBLIC videos, and the id is the only part we need. */
function watchUrl(videoId) { return 'https://www.youtube.com/watch?v=' + encodeURIComponent(videoId); }

/* How long is it? One cheap Data API field, and it earns its place twice:
   the page can say "watching 24 minutes of video" instead of a blank spinner,
   and a timeout can NAME ITS CAUSE instead of being a mystery. Length is the
   single thing that decides whether this call fits inside the platform's
   60-second ceiling, so it is the one number worth knowing up front.
   Absent key or a failed lookup returns 0 — never a guess, and never a
   blocker. */
function iso8601Secs(s) {
  var m = String(s || '').match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  return (+m[1] || 0) * 86400 + (+m[2] || 0) * 3600 + (+m[3] || 0) * 60 + (+m[4] || 0);
}
async function videoSecs(videoId, key) {
  if (!videoId || !key) return 0;
  try {
    var r = await fetch('https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=' +
      encodeURIComponent(videoId) + '&key=' + encodeURIComponent(key));
    if (!r.ok) return 0;
    var j = await r.json();
    var it = (j.items || [])[0];
    return iso8601Secs(it && it.contentDetails && it.contentDetails.duration);
  } catch (e) { return 0; }
}
function humanMins(secs) {
  if (!secs) return '';
  var m = Math.round(secs / 60);
  if (m < 1) return 'under a minute';
  if (m < 60) return m + ' minute' + (m === 1 ? '' : 's');
  var h = Math.floor(m / 60), rem = m % 60;
  return h + 'h' + (rem ? ' ' + rem + 'm' : '');
}

/* ════════════════════════════════════════════════════════════════
   LONG VIDEOS — why this is segmented, and who does the orchestrating
   ────────────────────────────────────────────────────────────────
   Alex: *"i want to be able to summarize at least 50 minute videos"*, after a
   39-minute one came back "this took too long to watch".

   The wall is not Gemini and not the video: **every invocation of
   `run-reminders.js` is capped at 60 seconds** (vercel.json), and a 50-minute
   video cannot be ingested inside one of those. Raising `maxDuration` to 300
   would need Vercel Pro, so it is not a fix we can rely on.

   So a long video stops being ONE impossible request and becomes SEVERAL
   ordinary ones. `videoMetadata` clips the video, each slice is watched in its
   own 60-second window, and the page walks them in order before asking for the
   parts to be composed into one page.

   ⚠️ **The PAGE orchestrates, not the server.** A server-side loop would put
   every slice back inside a single invocation and rebuild the exact wall we
   are climbing over. That is also why nothing here is stateful: each request
   is one slice, and the page holds the parts it has collected — so closing the
   tab costs nothing already earned, and a retry resumes rather than restarts.

   Short videos still go through in ONE pass. Two calls where one will do is
   worse for coherence and worse for his quota. */
var SEG_SECS = 900;        // 15 minutes per slice
var ONE_PASS_MAX = 1500;   // ≤25 min goes through whole, in a single call
var MAX_SEGS = 16;         // ~4 hours, then we say so instead of failing slowly

function planSegments(secs) {
  secs = Math.max(0, Math.floor(secs || 0));
  if (!secs) return [];
  var n = Math.ceil(secs / SEG_SECS);
  if (n > MAX_SEGS) return null;                 // too long — caller must say so
  // Even slices read better than a full one plus a 40-second orphan.
  var span = Math.ceil(secs / n), out = [];
  for (var i = 0; i < n; i++) {
    var start = i * span;
    var end = Math.min(secs, start + span);
    if (end > start) out.push({ i: i, start: start, end: end });
  }
  return out;
}

/* One slice → dense faithful notes, NOT a mini-recap. The merge writes the
   page; this only has to make sure nothing worth keeping is lost, in order. */
var RECAP_SEG_SYS =
  'You are watching ONE SECTION of a longer video and taking notes for someone who will write the summary afterwards.\n' +
  'They will never see the video, only your notes, so anything you leave out is gone.\n' +
  '\n' +
  'RULES\n' +
  '- Write down what is actually SAID and shown, in the order it happens.\n' +
  '- Keep every specific: names, numbers, dates, places, terms, causes and consequences. These are the whole point.\n' +
  '- Plain sentences. No headings, no bullets, no markdown, no timestamps, no "in this section".\n' +
  '- Never invent and never generalise to fill a gap. If this section is mostly an advert, an intro or filler, say so in one line.\n' +
  '- Do not write a conclusion or an overview — you have only seen part of it. Just the substance, densely.\n' +
  '\n' +
  'Write 150-350 words of continuous prose. Nothing else.';

/* The merge. It never sees the video — only the ordered notes — so its whole
   job is composition, and it must be told plainly that it may not add. */
var RECAP_MERGE_SYS =
  'You are given ordered notes taken while watching one video from start to finish, section by section.\n' +
  'Write the page the person will read INSTEAD of ever watching it again.\n' +
  'They watched it once. In six months this page is all they will have, and they will not rewatch the video.\n' +
  '\n' +
  'HOW TO WRITE IT\n' +
  '- Use ONLY what is in the notes. You did not see the video. Never add a fact, a name, a number or a claim that is not there.\n' +
  '- Merge across the sections — the same thread often runs through several. Follow the video\'s order, not the note boundaries.\n' +
  '- Never mention sections, notes, parts or the video itself. Write the SUBSTANCE directly, the way a good book explains a thing.\n' +
  '- Plain, warm, direct language. Short sentences. No jargon, no hype, no filler.\n' +
  '- Be specific or say nothing. A sentence that would be true of any video on this subject is worthless — cut it.\n' +
  '- Drop adverts, intros and filler entirely.\n' +
  '- No markdown, no asterisks, no bullets of your own, no emoji, no timestamps.\n' +
  '\n' +
  'LENGTH\n' +
  'This was a long video, so the page earns real length — six to ten sections. Never pad, and never compress an hour into five lines.\n' +
  '\n' +
  'OUTPUT — plain text, exactly this shape, nothing before or after:\n' +
  'SHELF: <exactly one of the shelves listed below>\n' +
  'CORE: <one sentence. The single thing that should survive if everything else is forgotten.>\n' +
  'OPEN:\n' +
  '<two to four sentences. What this is about and what it is arguing.>\n' +
  'SECTION: <a short heading, four words or fewer>\n' +
  '<a full paragraph carrying that part of the argument, with its specifics>\n' +
  '<...as many SECTION blocks as the material earns, in the video\'s own order...>\n' +
  'FACTS:\n' +
  '- <a hard specific worth keeping: a name, a number, a date, a term, a claim>\n' +
  '- <as many as the notes genuinely gave, up to fourteen. Never repeat the CORE.>\n\n' + SHELF_RULES;

/* Watch ONE slice. Returns prose notes, never a recap — see RECAP_SEG_SYS. */
async function recapSegment(videoId, title, seg, total) {
  var id = String(videoId || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 20);
  if (!id) return { ok: false, error: 'no video id' };
  if (!seg || !(seg.end > seg.start)) return { ok: false, error: 'bad segment' };

  var out = await model.watch({
    url: watchUrl(id),
    clip: { start: seg.start, end: seg.end },
    system: RECAP_SEG_SYS,
    prompt: 'The video is called: ' + (String(title || '').trim() || '(untitled)') + '\n' +
      'This is section ' + ((seg.i | 0) + 1) + ' of ' + (total || '?') + '. Take your notes.',
    temperature: 0.3,
    maxTokens: 2048
  });
  if (!out || !out.ok) {
    return { ok: false, error: out && out.kind, status: out && out.status, message: (out && out.message) || '' };
  }
  var note = String(out.text || '').replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/, '').trim();
  if (!note) return { ok: false, error: 'empty' };
  return { ok: true, note: note, i: seg.i, model: out.model };
}

/* Compose the collected notes into the page. No video, no clip — a text call
   through the same role, so the voice stays identical to the one-pass path. */
async function recapMerge(title, notes) {
  var list = (notes || []).filter(function (n) { return n && String(n).trim(); });
  if (!list.length) return { ok: false, error: 'no notes' };

  var out = await model.watch({
    system: RECAP_MERGE_SYS,
    prompt: 'The video is called: ' + (String(title || '').trim() || '(untitled)') + '\n\n' +
      list.map(function (n, i) { return 'NOTES, SECTION ' + (i + 1) + ' OF ' + list.length + ':\n' + n; }).join('\n\n'),
    temperature: 0.35,
    maxTokens: 8192
  });
  if (!out || !out.ok) {
    return { ok: false, error: out && out.kind, status: out && out.status, message: (out && out.message) || '' };
  }
  var text = String(out.text || '').replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/, '').trim();
  var p = parseRecap(text);
  if (!p.sections.length && !p.open) {
    return { ok: false, error: 'parse', message: 'The parts could not be composed into a recap.' };
  }
  return {
    ok: true, text: text, parsed: p,
    shelf: matchShelf(p.shelf),
    words: recapWords(p), sections: p.sections.length,
    model: out.model, truncated: out.finish === 'MAX_TOKENS'
  };
}

async function recap(videoId, title, notes, ytKey) {
  var id = String(videoId || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 20);
  if (!id) return { ok: false, error: 'no video id' };
  var secs = await videoSecs(id, ytKey);

  /* ⭐ TOO LONG FOR ONE 60-SECOND WINDOW → hand back a PLAN rather than an
     apology. This used to be where a 39-minute video died with "shorter videos
     work"; now it is where a long one starts. The page walks the slices.
     ⚠️ Duration UNKNOWN (no YouTube key, or the lookup failed) means we cannot
     plan — so we attempt one pass rather than refuse. A guess about length is
     not worth turning into a refusal, and the deadline still protects us. */
  if (secs > ONE_PASS_MAX) {
    var segs = planSegments(secs);
    if (!segs) {
      return { ok: false, error: 'too-long', secs: secs,
               message: 'This one is ' + humanMins(secs) + ' long — past what the recap can take in, even in parts.' };
    }
    return { ok: true, plan: true, secs: secs, segments: segs };
  }

  var n = String(notes || '').trim().slice(0, 1500);
  var prompt = 'Watch this video and write the page described in your instructions.\n' +
    'Its title is: ' + (String(title || '').trim() || '(untitled)') + '\n' +
    (n ? '\nThe person watching also wrote this down. Where it overlaps what you heard, weight it — it is what they were actually struck by. Never treat it as something the video said.\n' + n + '\n' : '');

  var out = await model.watch({
    url: watchUrl(id),
    system: RECAP_SYS + RECAP_EMPTY,
    prompt: prompt,
    temperature: 0.35,
    maxTokens: 8192
  });
  if (!out || !out.ok) {
    return { ok: false, error: (out && out.kind) || 'model', status: out && out.status,
             message: (out && out.message) || '', secs: secs };
  }

  var text = String(out.text || '').trim();
  // Models like to fence plain text anyway. Strip it before parsing or the
  // first line of the recap is ```.
  text = text.replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/, '').trim();
  var p = parseRecap(text);

  // It watched, and there was nothing being said. That is a real answer and it
  // must survive as one — not as a failed recap, and not as an invented lesson.
  if (p.nothing && !p.sections.length) {
    return { ok: true, empty: true, nothing: p.nothing, shelf: matchShelf(p.shelf), model: out.model, secs: secs };
  }
  // Anything that parsed to nothing at all is a FAILURE to read, never an empty
  // recap. Silent-empty is this project's disease; the caller gets a 502.
  if (!p.sections.length && !p.open) {
    return { ok: false, error: 'parse', message: 'The reply did not contain a recap.', secs: secs };
  }

  return {
    ok: true, text: text, parsed: p,
    shelf: matchShelf(p.shelf),
    words: recapWords(p),
    sections: p.sections.length,
    model: out.model, secs: secs,
    truncated: out.finish === 'MAX_TOKENS'
  };
}

/* The shelf must be one we actually own, whatever the model wrote. Same rule
   as distill() — it may file, never name. */
function matchShelf(topic) {
  var norm = function (s) { return String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ''); };
  var hit = '';
  SHELVES.forEach(function (s) { if (!hit && norm(topic).indexOf(norm(s)) >= 0) hit = s; });
  return hit;
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

/* `strict` = the caller owns the taxonomy and the model may not touch it.
   The Library passes its nine fixed shelves that way (see _tiktok.js SHELVES).
   Without it, every batch of new videos invented its own vocabulary and the
   shelf list drifted — six labels for eight videos. */
async function organize(items, known, strict) {
  items = (items || []).slice(0, 120);
  if (!items.length) return { ok: false, error: 'empty' };
  var labels = [];
  (known || []).forEach(function (l) { l = String(l || '').trim().slice(0, 40); if (l && labels.indexOf(l) < 0) labels.push(l); });
  labels = labels.slice(0, strict ? 12 : 8);
  // A library with shelves already keeps them, so new videos join the set he
  // knows instead of spawning near-duplicates. An empty one gets shelves named.
  if (!strict && labels.length < 3) {
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
      // In strict mode an answer outside the taxonomy is DISCARDED, not adopted:
      // the whole point is that the shelf list cannot grow behind his back.
      if (strict) {
        var hit = '';
        labels.forEach(function (l) { if (!hit && String(got[id]).toLowerCase().indexOf(l.toLowerCase()) >= 0) hit = l; });
        if (!hit) return;
        map[id] = hit; return;
      }
      map[id] = got[id];
      if (labels.indexOf(got[id]) < 0 && labels.length < 8) labels.push(got[id]);
    });
  }
  if (!Object.keys(map).length) return { ok: false, error: failed ? 'model' : 'parse' };
  return { ok: true, concepts: map, partial: failed > 0 };
}

module.exports = {
  playlist: playlist, distill: distill, organize: organize, grade: grade,
  recap: recap, recapSegment: recapSegment, recapMerge: recapMerge,
  _cleanDesc: cleanDesc, _parseRecap: parseRecap, _matchShelf: matchShelf,
  _watchUrl: watchUrl, _iso8601Secs: iso8601Secs, _humanMins: humanMins,
  _planSegments: planSegments, SEG_SECS: SEG_SECS, ONE_PASS_MAX: ONE_PASS_MAX, MAX_SEGS: MAX_SEGS,
  RECAP_SYS: RECAP_SYS, RECAP_SEG_SYS: RECAP_SEG_SYS, RECAP_MERGE_SYS: RECAP_MERGE_SYS
};
