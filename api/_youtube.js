'use strict';
// ════════════════════════════════════════════════════════════════
// YouTube courier helper.  `_` prefix = NOT a routed function (free),
// called by run-reminders.js on same-origin requests:
//   ?youtube=<playlistId>   → mirror a public/unlisted playlist
//   ?ytdistill  (POST)      → distill notes/transcript into key points
//
// Playlist: full list via the YouTube Data API when YOUTUBE_API_KEY is set;
// otherwise the public RSS feed (recent ~15) with no key at all. Writes
// nothing — the page reconciles the videos into improve:videos itself.
//
// Distill runs the user's OWN notes (or a transcript they paste) through the
// free model. It never fabricates: no input, no output. (Auto-scraping a
// video's transcript server-side is deliberately NOT attempted — YouTube
// locked the caption endpoint, so it fails silently, which we refuse to ship.)
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

// One video's description (context for Distill). Data API only; '' without a key.
async function videoDescription(videoId, key) {
  if (!videoId || !key) return '';
  try {
    var r = await fetch('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=' + encodeURIComponent(videoId) + '&key=' + encodeURIComponent(key));
    if (!r.ok) return '';
    var j = await r.json();
    var it = (j.items || [])[0];
    return (it && it.snippet && it.snippet.description) || '';
  } catch (e) { return ''; }
}

// Distill the user's notes (+ the video's own description as context) into durable
// key points. The description means even a couple of notes get real substance —
// no transcript needed. Never invents: thin input → NOT_ENOUGH.
async function distill(text, title, videoId, key) {
  var desc = String(await videoDescription(videoId, key) || '').slice(0, 3000);
  var clean = String(text || '').slice(0, 14000);
  var sys = 'You help someone remember what truly matters from a video, months later. Using their notes and the video\'s description (context — ignore promo, links, sponsors), extract the durable essence for their future self. Output PLAIN TEXT in EXACTLY this shape and nothing else:\n' +
    'CORE: <one sentence — the single most important idea>\n' +
    'KEY:\n- <a concise point worth remembering>\n- <3 to 6 points total, concrete, no fluff, no timestamps, never say "in this video">\n' +
    'DO: <one specific thing to apply>\n' +
    'Be sharp, plain, and memorable. Never invent anything the notes and description do not support. If there is genuinely not enough substance, reply with exactly: NOT_ENOUGH';
  var user = 'Video: ' + (title || '(untitled)') + '\n\n' +
    (desc ? ('Description (context):\n' + desc + '\n\n') : '') +
    'Their notes' + (clean ? ':\n' + clean : ' (none — work only from the title and description, and if that is too thin, say NOT_ENOUGH).');
  var out = await model.json('text', { messages: [{ role: 'system', content: sys }, { role: 'user', content: user }], temperature: 0.4, max_tokens: 700 });
  if (!out || !out.ok) return { ok: false, error: (out && out.kind) || 'model' };
  var t = (out.raw || '').trim();
  if (!t) return { ok: false, error: 'empty' };
  if (/^NOT_ENOUGH/.test(t)) return { ok: false, error: 'thin' };
  return { ok: true, text: t };
}

// Sort a watchlist into a few meaningful concepts. Returns { videoId: label }.
async function organize(items) {
  var list = (items || []).slice(0, 90).map(function (v) {
    return v.videoId + ' | ' + String(v.title || '').slice(0, 120) + ' | ' + String(v.channel || '').slice(0, 60);
  }).join('\n');
  if (!list) return { ok: false, error: 'empty' };
  var sys = 'You organize a video watchlist into a few meaningful CONCEPTS. Each line is "videoId | title | channel". Assign EVERY video to ONE short concept label (2-4 words, Title Case). Choose a small, consistent set of 3-6 concepts total that best captures the themes (for example: Mindset & Focus, History, Conversations, Craft & Skills, Health, Culture). Return ONLY a JSON object mapping each videoId to its concept string — no commentary, no code fence.';
  var out = await model.json('text', { messages: [{ role: 'system', content: sys }, { role: 'user', content: list }], temperature: 0.2, max_tokens: 1400 });
  if (!out || !out.ok) return { ok: false, error: (out && out.kind) || 'model' };
  var map = extractJson(out.obj) || extractJson(out.raw);
  if (!map || typeof map !== 'object' || Array.isArray(map)) return { ok: false, error: 'parse' };
  return { ok: true, concepts: map };
}

module.exports = { playlist: playlist, distill: distill, organize: organize };
