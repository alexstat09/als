/* THE READING PAGE — the one contract shared by every recap in the app.
 *
 * `_`-prefixed, so Vercel does not route it and the 12-function ceiling is
 * untouched (hard constraint 1).
 *
 * ⭐ WHY THIS FILE EXISTS AT ALL — hard constraint 15.
 * The recap shipped for YouTube first. Porting it to TikTok by copying the
 * prompt and the parser would have produced two recaps that agree today and
 * drift apart on the first edit — "two copies of a taxonomy is two taxonomies
 * with a delay", which is the exact sentence `_youtube.js` already earned by
 * restating the shelves. So the SHAPE of a recap lives here, once, and each
 * world owns only how it gets material in front of the model.
 *
 * ⚠️ IT DEPENDS ON NOTHING, AND THAT IS LOAD-BEARING.
 * `_youtube.js` already requires `_tiktok.js` (for the shelves). If this file
 * required either of them, requiring it back would close a cycle — and Node
 * resolves a cycle by handing out a HALF-BUILT module object rather than
 * throwing, so the failure would be an undefined export at some later call,
 * not an error at load. That is silent-empty in a require graph. Hence
 * `sysFor(shelfRules)` takes the shelf text as an ARGUMENT: the caller already
 * has it, and this file never reaches for it.
 */
'use strict';

function words(s) { return String(s || '').split(/\s+/).filter(Boolean).length; }

/* Alex's brief, in his words: *"i watch a video, i look at the recap, i
   remember, and whenever i feel like i need a refresh, i rewatch the recap and
   it has everything i need to remember from the video, not tiny pieces."*
   So this is deliberately NOT the 3-5 bullets the distiller writes. It is a
   page: an opening that orients, sections that carry the argument in its own
   order, and a block of hard specifics at the end — because names, numbers and
   dates are what fade first and what a bullet list never keeps enough of.

   ⚠️⚠️ THE HONESTY LIMIT, STATED ONCE AND ENFORCED IN THE UI.
   `groundKeys()` is deliberately NOT called on a recap, and its absence is not
   an oversight. Grounding works by checking every name and number in a claim
   against the MATERIAL the claim was built from. Here the material is the video
   itself, which we never receive as text: the model watches it and returns
   prose. There is no haystack on this side of the wire to check a needle
   against.
   The tempting fix — asking for verbatim quotes and treating those as receipts
   — is exactly the failure the receipts system was built to catch. A model that
   will invent a fact will invent the quote supporting it, so quote-receipts
   here would be theatre with a checkmark on it.
   What we do instead is tell the truth about the source (`grade: 'watched'`,
   and its own line in SRC) and never claim a check that did not happen. */
var RECAP_BODY =
  'You have just watched a video. Write the page the person will read INSTEAD of ever watching it again.\n' +
  'They watched it once, today. In six months this page is all they will have, and they will not rewatch the video.\n' +
  'So it must carry everything worth keeping — not highlights, not a teaser, not "key takeaways".\n' +
  '\n' +
  'HOW TO WRITE IT\n' +
  '- Plain, warm, direct language. Short sentences. No jargon, no hype, no filler.\n' +
  '- Never refer to the video as a video. No "in this video", no "the narrator explains", no "we learn that".\n' +
  '  Write the SUBSTANCE directly, the way a good book explains a thing.\n' +
  '- Follow the video\'s own order. Its argument has a shape; keep it.\n' +
  '- Be specific or say nothing. A sentence that would be true of any video on this subject is worthless — cut it.\n' +
  '  Names, numbers, dates, places, causes and consequences are the whole point.\n' +
  '- Never invent. If you did not hear it, it does not go on the page. Do not fill a gap with what is generally true\n' +
  '  of the topic — an approximation you cannot hear in the video is a lie in six months.\n' +
  '- No markdown, no asterisks, no bullets of your own, no emoji, no timestamps.\n' +
  '\n' +
  'LENGTH\n' +
  'Scale to the video. A ten-minute video needs perhaps four sections; an hour needs eight or more.\n' +
  'Never pad to reach a number, and never compress an hour into five lines — completeness is the point of this page.\n' +
  '\n' +
  'OUTPUT — plain text, exactly this shape, nothing before or after:\n' +
  'SHELF: <exactly one of the shelves listed below>\n' +
  'CORE: <one sentence. The single thing that should survive if everything else is forgotten.>\n' +
  'OPEN:\n' +
  '<two to four sentences. What this is about and what it is arguing. Enough that someone who never saw it is oriented.>\n' +
  'SECTION: <a short heading, four words or fewer>\n' +
  '<a full paragraph carrying that part of the argument, with its specifics>\n' +
  'SECTION: <the next heading>\n' +
  '<its paragraph>\n' +
  '<...as many SECTION blocks as the video actually earns, in its own order...>\n' +
  'FACTS:\n' +
  '- <a hard specific worth keeping: a name, a number, a date, a term, a claim>\n' +
  '- <as many as the video genuinely gave, up to twelve. These are what fade first. Never repeat the CORE.>\n\n';

/* ⭐ A SHORT VIDEO EARNS A SHORT PAGE, AND SAYING SO IS NOT A DIFFERENT RECAP.
   The LENGTH rule above is calibrated on ten minutes to an hour. A 30-second
   TikTok held to it comes back padded — and padding is the exact failure the
   whole Library was built to stop, because a sentence that would be true of any
   video on the subject is what "vague" MEANS. This is an extra sentence for the
   same contract, never a second contract. */
var RECAP_SHORT =
  '\n\nThis video is SHORT — under three minutes. Scale down honestly: one or two SECTION blocks, sometimes only one, ' +
  'and only the FACTS it genuinely gave. A short video that made one point well deserves one section that makes it ' +
  'well. Padding a short video into a long page is the worst thing you can do here.';

/* Same three-state discipline the rest of the page runs on. A video with
   nothing being SAID in it — a song, a match, an edit — must not come back
   wearing a recap, and the model is the wrong thing to ask, because a model
   with nothing to go on would still rather write something than admit it. */
var EMPTY =
  '\n\nIf nothing is actually explained, taught or argued in this video — it is a song, a performance, a match, ' +
  'a trailer, gameplay, or an edit set to music — then do NOT write a recap and do NOT invent one. ' +
  'Reply with exactly this instead, and nothing else:\n' +
  'SHELF: <the best-fitting shelf>\n' +
  'NOTHING: <one sentence naming what this video actually is>';

/* The shelf rules are passed IN — see the header. `short` appends the
   scale-down clause for a clip measured in seconds rather than minutes. */
function sysFor(shelfRules, short) {
  return RECAP_BODY + String(shelfRules || '') + (short ? RECAP_SHORT : '');
}

function parseRecap(t) {
  var out = { shelf: '', core: '', open: '', sections: [], facts: [], nothing: '' };
  var lines = String(t || '').split(/\r?\n/);
  var mode = '', cur = null, buf = [];
  function flushOpen() { if (mode === 'open') out.open = buf.join('\n').trim(); }
  function flushSec() { if (cur) { cur.body = buf.join('\n').trim(); if (cur.h || cur.body) out.sections.push(cur); cur = null; } }
  lines.forEach(function (ln) {
    var s = ln.trim();
    var m;
    if ((m = s.match(/^SHELF\s*:\s*(.+)$/i))) { out.shelf = m[1].trim(); return; }
    if ((m = s.match(/^NOTHING\s*:\s*(.+)$/i))) { out.nothing = m[1].trim(); return; }
    if ((m = s.match(/^CORE\s*:\s*(.+)$/i))) { out.core = m[1].trim(); return; }
    if (/^OPEN\s*:\s*$/i.test(s)) { flushSec(); mode = 'open'; buf = []; return; }
    if ((m = s.match(/^OPEN\s*:\s*(.+)$/i))) { flushSec(); mode = 'open'; buf = [m[1].trim()]; return; }
    if ((m = s.match(/^SECTION\s*:\s*(.*)$/i))) { flushOpen(); flushSec(); mode = 'sec'; cur = { h: m[1].trim(), body: '' }; buf = []; return; }
    if (/^FACTS\s*:\s*$/i.test(s)) { flushOpen(); flushSec(); mode = 'facts'; buf = []; return; }
    if (mode === 'facts') {
      var f = s.match(/^[-•*–—]\s*(.+)$/);
      if (f) out.facts.push(f[1].trim());
      return;
    }
    if (!s) { buf.push(''); return; }
    buf.push(s);
  });
  flushOpen(); flushSec();
  out.open = String(out.open || '').replace(/\n{3,}/g, '\n\n').trim();
  out.sections = out.sections.map(function (x) {
    x.body = String(x.body || '').replace(/\n{3,}/g, '\n\n').trim(); return x;
  }).filter(function (x) { return x.body || x.h; });
  return out;
}

function recapWords(p) {
  var t = [p.core, p.open].concat(p.sections.map(function (s) { return s.h + ' ' + s.body; })).concat(p.facts).join(' ');
  return words(t);
}

/* Models like to fence plain text anyway. Strip it before parsing, or the first
   line of the recap is ```. Shared because both worlds hit it. */
function unfence(t) {
  return String(t || '').replace(/^```[a-z]*\s*/i, '').replace(/\s*```$/, '').trim();
}

module.exports = {
  sysFor: sysFor, EMPTY: EMPTY, RECAP_BODY: RECAP_BODY, RECAP_SHORT: RECAP_SHORT,
  parseRecap: parseRecap, recapWords: recapWords, unfence: unfence, words: words
};
