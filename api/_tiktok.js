'use strict';
// ════════════════════════════════════════════════════════════════
// TikTok courier helper.  `_` prefix = NOT a routed function (free),
// called by run-reminders.js on same-origin requests:
//   ?tiktok=<url>   → one saved video → everything we can honestly know
//   ?ttread (POST)  → that video → what is actually worth taking from it
//
// Writes nothing. The Improve page reconciles into improve:tiktoks itself.
//
// ── WHAT TIKTOK ACTUALLY GIVES US (measured 27/07/26 on five of Alex's own
//    favourites, not assumed) ────────────────────────────────────────────
// The watch page carries a <script id="__UNIVERSAL_DATA_FOR_REHYDRATION__">
// JSON blob with the whole item. From it, free and with no key:
//   • desc + challenges[]  — the caption and its hashtags
//   • author.uniqueId / nickname, video.duration, video.cover
//   • music.title + authorName
//   • stickersOnItem[].stickerText  ⭐ THE ON-SCREEN TEXT. A cover's stickers
//     held "Stranger - Jhene Aiko"; a sermon's held the verse itself.
//   • video.subtitleInfos[]  ⭐⭐ TikTok's own ASR captions, as a WEBVTT URL
//     that IS fetchable server-side. This is the real transcript that YouTube
//     has refused us twice (see _youtube.js) — when it exists, "exactly what
//     to take from this video" stops being a guess.
//
// ⚠️ Both the caption and the cover URL lie about their durability:
//   • The subtitle URL carries UrlExpire and dies within the hour, so the
//     transcript is fetched HERE, at save time, and the TEXT is stored. Never
//     store the URL and hope.
//   • video.cover is signed and expires too. It is returned so a card can
//     paint immediately, and `?tiktok=` doubles as the refresh call.
//
// ⚠️ AND THE PART THAT DECIDES THE DESIGN: on three of those five favourites
// the caption was hashtags and NOTHING else, with no captions track — they
// were edits and a cover, videos whose whole value is the vibe. Asking a model
// for "key takeaways" there produces confident fiction, which is this project's
// worst failure mode. So `grade()` below decides, deterministically and before
// any model runs, whether real material exists. Without it the reader may only
// say what the video IS. It may never invent a lesson.
// ════════════════════════════════════════════════════════════════

var UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
var model = require('./_model');

function timeout(ms) { var c = new AbortController(); setTimeout(function () { c.abort(); }, ms); return c.signal; }

/* ── the URL ───────────────────────────────────────────────────────
   Only tiktok.com, only the shapes TikTok itself produces. Anything else is
   refused by NAME rather than fetched, which also closes the SSRF door: this
   helper is reachable from the browser and must never become a proxy.
   Short links (vm./vt.) are one redirect away from the real one. */
var LONG = /^https?:\/\/(?:www\.|m\.)?tiktok\.com\/@([A-Za-z0-9_.-]{1,40})\/(?:video|photo)\/(\d{6,25})/i;
var SHORT = /^https?:\/\/(?:vm|vt)\.tiktok\.com\/([A-Za-z0-9]{4,20})/i;
var BARE = /^https?:\/\/(?:www\.)?tiktok\.com\/t\/([A-Za-z0-9]{4,20})/i;

async function resolveShort(url) {
  var r = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA }, signal: timeout(9000) });
  return (r && r.url) || '';
}

async function canonical(raw) {
  var u = String(raw || '').trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  u = u.split('?')[0].split('#')[0];
  var m = u.match(LONG);
  if (m) return { url: 'https://www.tiktok.com/@' + m[1] + '/video/' + m[2], id: m[2], handle: m[1] };
  if (SHORT.test(u) || BARE.test(u)) {
    var full = '';
    try { full = await resolveShort(u); } catch (e) { full = ''; }
    var m2 = String(full || '').split('?')[0].match(LONG);
    if (m2) return { url: 'https://www.tiktok.com/@' + m2[1] + '/video/' + m2[2], id: m2[2], handle: m2[1] };
    return null;
  }
  return null;
}

/* ── the item ──────────────────────────────────────────────────────── */
function universal(html) {
  var m = String(html || '').match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) return null;
  try { return JSON.parse(m[1]); } catch (e) { return null; }
}

/* WEBVTT → plain speech. Cues are dropped, and so are consecutive duplicate
   lines: ASR repeats a line across cue boundaries constantly and a repeated
   sentence reads to a model as emphasis it was never given. */
function vtt(txt) {
  var out = [], last = '';
  String(txt || '').split(/\r?\n/).forEach(function (ln) {
    var s = ln.trim();
    if (!s || /^WEBVTT/i.test(s) || /-->/.test(s) || /^\d+$/.test(s) || /^(NOTE|STYLE|REGION)\b/i.test(s)) return;
    s = s.replace(/<[^>]+>/g, '').trim();
    if (!s || s === last) return;
    last = s; out.push(s);
  });
  return out.join(' ').replace(/\s{2,}/g, ' ').trim();
}

async function transcriptOf(video) {
  var subs = (video && video.subtitleInfos) || [];
  if (!subs.length) return { text: '', lang: '' };
  // Prefer a real ASR/creator track in English or Greek; otherwise take the
  // first one and say which language it was, so the reader can allow for it.
  var pick = null, pref = ['eng-US', 'eng-GB', 'ell-GR', 'gre-GR'];
  for (var i = 0; i < pref.length && !pick; i++) {
    for (var j = 0; j < subs.length; j++) if (subs[j] && subs[j].LanguageCodeName === pref[i] && subs[j].Url) { pick = subs[j]; break; }
  }
  if (!pick) for (var k = 0; k < subs.length; k++) if (subs[k] && subs[k].Url) { pick = subs[k]; break; }
  if (!pick) return { text: '', lang: '' };
  try {
    var r = await fetch(pick.Url, { headers: { 'User-Agent': UA, 'Referer': 'https://www.tiktok.com/' }, signal: timeout(9000) });
    if (!r.ok) return { text: '', lang: pick.LanguageCodeName || '', error: 'vtt ' + r.status };
    return { text: vtt(await r.text()).slice(0, 9000), lang: pick.LanguageCodeName || '' };
  } catch (e) {
    return { text: '', lang: pick.LanguageCodeName || '', error: String((e && e.message) || e) };
  }
}

function stickers(item) {
  var out = [];
  ((item && item.stickersOnItem) || []).forEach(function (s) {
    ((s && s.stickerText) || []).forEach(function (t) {
      t = String(t || '').replace(/\s{2,}/g, ' ').trim();
      if (t && out.indexOf(t) < 0) out.push(t);
    });
  });
  return out.slice(0, 30);
}

// The caption minus its hashtag wall — what, if anything, was actually written.
function captionWords(desc) {
  return String(desc || '').replace(/#[\p{L}\p{N}_ぁ-ヿ゚゙]+/gu, ' ').replace(/https?:\/\/\S+/g, ' ')
    .replace(/[^\p{L}\p{N}\s']/gu, ' ').split(/\s+/).filter(function (w) { return w.length > 1; });
}

async function meta(rawUrl) {
  var c = await canonical(rawUrl);
  if (!c) return { ok: false, error: 'not a tiktok video link' };

  var r;
  try {
    r = await fetch(c.url, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' }, signal: timeout(12000) });
  } catch (e) {
    return { ok: false, error: 'tiktok unreachable: ' + String((e && e.message) || e), id: c.id, url: c.url };
  }
  if (!r.ok) return { ok: false, error: 'tiktok ' + r.status, id: c.id, url: c.url };

  var data = universal(await r.text());
  var vd = data && data.__DEFAULT_SCOPE__ && data.__DEFAULT_SCOPE__['webapp.video-detail'];
  // ⚠️ A blocked datacenter IP and a deleted video both arrive as "no item".
  // They are NOT the same thing and must never render the same way, so each
  // says which it is and the page shows the reason on the card.
  if (!vd) return { ok: false, error: 'tiktok returned a page with no video data (the request was probably blocked)', id: c.id, url: c.url, blocked: true };
  if (vd.statusCode) return { ok: false, error: 'tiktok says: ' + (vd.statusMsg || 'status ' + vd.statusCode) + ' (deleted, private or region-locked)', id: c.id, url: c.url, gone: true };

  var it = (vd.itemInfo && vd.itemInfo.itemStruct) || null;
  if (!it) return { ok: false, error: 'no video in the response', id: c.id, url: c.url, blocked: true };

  var au = it.author || {}, vid = it.video || {}, mu = it.music || {}, st = it.stats || {};
  var tr = await transcriptOf(vid);
  var tags = ((it.challenges || []).map(function (h) { return String((h && h.title) || '').trim(); })
    .filter(Boolean)).filter(function (t, i, a) { return a.indexOf(t) === i; }).slice(0, 12);

  return {
    ok: true,
    id: String(it.id || c.id),
    url: c.url,
    handle: au.uniqueId || c.handle || '',
    author: au.nickname || au.uniqueId || '',
    caption: String(it.desc || '').trim().slice(0, 600),
    tags: tags,
    screen: stickers(it),
    transcript: tr.text,
    transcriptLang: tr.lang || '',
    music: (mu.title && mu.title !== 'original sound') ? (mu.title + (mu.authorName ? ' — ' + mu.authorName : '')) : '',
    duration: Number(vid.duration || 0) || 0,
    cover: vid.cover || vid.dynamicCover || vid.originCover || '',
    lang: it.textLanguage || '',
    created: Number(it.createTime || 0) || 0,
    likes: Number(st.diggCount || 0) || 0,
    fetched: Date.now()
  };
}

/* ── how much do we actually have? ─────────────────────────────────
   Decided here, in code, before a model is allowed near it. `lesson` is the
   only grade that may produce key points; everything below it may only
   describe. This one function is what keeps the page from inventing wisdom
   for a football edit. */
function grade(v) {
  var notes = String((v && v.note) || '').trim();
  var t = String((v && v.transcript) || '').trim();
  var scr = ((v && v.screen) || []).join(' ').trim();
  var cap = captionWords(v && v.caption);
  if (notes.length >= 12) return 'notes';
  if (t.split(/\s+/).filter(Boolean).length >= 25) return 'transcript';
  if (scr.length >= 40) return 'screen';
  if (cap.length >= 8) return 'caption';
  if (scr.length >= 8 || cap.length >= 2 || ((v && v.tags) || []).length || (v && v.music)) return 'thin';
  return 'none';
}

var LESSON_SYS =
  'You turn a short video into the few things worth REMEMBERING, in the simplest language possible.\n' +
  'You are given what was actually said in it (its captions), any text shown on screen, its caption and its creator.\n' +
  'Write for someone re-reading this in six months who has completely forgotten the video.\n' +
  'Rules:\n' +
  '- Everyday words. No jargon, no hype, no "in this video", no timestamps, no markdown, no emoji.\n' +
  '- Every key point must be a whole thought that stands on its own — something they could say out loud and be right about.\n' +
  '- Say ONLY what the material supports. Never invent a name, a number, a verse, a study or a quote.\n' +
  '- If it turns out there is no lesson here — it is a song, a performance, an edit, a joke — do not force one. Answer with KIND: KEEPSAKE and describe what it is instead.\n' +
  'Output PLAIN TEXT, exactly this shape and nothing else:\n' +
  'KIND: LESSON\n' +
  'TOPIC: <2-4 word Title Case shelf, e.g. Faith, Mindset & Focus, Football, Music, Money, Health>\n' +
  'CORE: <one sentence — the single idea to keep>\n' +
  'KEY:\n' +
  '- <a takeaway worth remembering>\n' +
  '- <2 to 5 of them, most useful first>\n' +
  'DO: <one small concrete thing to try this week, only if the video genuinely calls for one>';

var KEEPSAKE_SYS =
  'You label a short video that somebody saved, so they can FIND it again months later.\n' +
  'You are given its caption, hashtags, any text shown on screen, its sound and its creator. That is all that exists — ' +
  'nobody said anything the captions could catch, so you do NOT know what happens in it.\n' +
  'Rules:\n' +
  '- Describe only what the material literally tells you: the subject, the artist, the song, the kind of video.\n' +
  '- NEVER invent a lesson, a takeaway, a message, an emotion or advice. If the caption is only hashtags, then the hashtags ARE the answer.\n' +
  '- No hype, no markdown, no emoji. Plain, short, factual.\n' +
  'Output PLAIN TEXT, exactly this shape and nothing else:\n' +
  'KIND: KEEPSAKE\n' +
  'TOPIC: <2-4 word Title Case shelf, e.g. Edits, Football, Music, Faith, Funny>\n' +
  'CORE: <one sentence naming what this video is, e.g. "A Lana Del Rey edit." — no more than you were told>\n' +
  'KEY:\n' +
  '- <a fact that would help them find it: who is in it, the song, the artist, the creator>\n' +
  '- <1 to 3 of them, and none you were not given>';

function material(v, g) {
  var parts = [];
  parts.push('Creator: @' + (v.handle || '?') + (v.author && v.author !== v.handle ? ' (' + v.author + ')' : ''));
  if (v.duration) parts.push('Length: ' + v.duration + 's');
  if (v.caption) parts.push('Caption: ' + v.caption);
  if ((v.tags || []).length) parts.push('Hashtags: ' + v.tags.join(', '));
  if (v.music) parts.push('Sound: ' + v.music);
  if ((v.screen || []).length) parts.push('Text shown on screen:\n' + v.screen.join('\n').slice(0, 2500));
  if (v.note) parts.push('What they said about it:\n' + String(v.note).slice(0, 2000));
  if (g === 'transcript' || (g === 'notes' && v.transcript)) {
    parts.push('What is said in it' + (v.transcriptLang && !/^eng/i.test(v.transcriptLang) ? ' (auto-captions, ' + v.transcriptLang + ')' : ' (auto-captions)') + ':\n' + String(v.transcript).slice(0, 7000));
  }
  return parts.join('\n\n');
}

/* One saved video → what is worth taking from it.
   The grade picks the prompt; the model never gets to promote itself from
   keepsake to lesson, because a model with nothing to go on will always
   rather write a lesson than admit it has nothing. */
async function read(v) {
  v = v || {};
  var g = grade(v);
  if (g === 'none') return { ok: false, error: 'nothing to read', grade: g, unreadable: true };
  var lesson = (g === 'transcript' || g === 'screen' || g === 'notes');
  var out = await model.json('text', {
    messages: [{ role: 'system', content: lesson ? LESSON_SYS : KEEPSAKE_SYS }, { role: 'user', content: material(v, g) }],
    temperature: lesson ? 0.3 : 0.15, max_tokens: 900, reasoning: 'low'
  });
  if (!out || !out.ok) return { ok: false, error: (out && out.kind) || 'model', grade: g };
  var t = String(out.raw || '').trim();
  if (!t) return { ok: false, error: 'empty', grade: g };
  // A keepsake prompt cannot return a LESSON, whatever the model wrote.
  if (!lesson) t = t.replace(/^\s*KIND\s*:.*$/im, 'KIND: KEEPSAKE');
  else if (!/^\s*KIND\s*:/im.test(t)) t = 'KIND: LESSON\n' + t;
  return { ok: true, text: t, grade: g, kind: lesson ? 'lesson' : 'keepsake' };
}

module.exports = {
  meta: meta, read: read, grade: grade,
  _canonical: canonical, _vtt: vtt, _captionWords: captionWords, _stickers: stickers
};
