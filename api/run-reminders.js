// ════════════════════════════════════════════════════════════════
// Daily smart reminders — the cron brain.
// Hit once an hour by a QStash schedule. Reads the user's prefs + synced
// data straight from Supabase, works out the LOCAL hour (DST-safe via the
// stored IANA timezone), and fires only the reminders that are (a) scheduled
// for this hour, (b) not already sent today, and (c) actually RELEVANT
// (weigh-in only if not logged, training only if 3+ days off, etc.).
// Pushes go out via web-push to every stored subscription; the rest-timer
// path is untouched. Safe to hit repeatedly — everything is deduped per day.
// ════════════════════════════════════════════════════════════════
'use strict';
var webpush = require('web-push');
var supa = require('./_supa');
var auth = require('./_auth');
var vault = require('./_vault');
var movies = require('./_movies');
var yt = require('./_youtube');
var tt = require('./_tiktok');
var prices = require('./_prices');
var garmin = require('./_garmin');

function pad(n) { return n < 10 ? '0' + n : '' + n; }

// Local YYYY-MM-DD + 0–23 hour in the given timezone (handles DST + midnight).
function localParts(tz) {
  try {
    var parts = {};
    new Intl.DateTimeFormat('en-CA', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hour12: false
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    return { dateKey: parts.year + '-' + parts.month + '-' + parts.day, hour: parseInt(parts.hour, 10) % 24 };
  } catch (e) {
    var d = new Date();
    return { dateKey: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()), hour: d.getHours() };
  }
}

function tsToDateKey(ts, tz) {
  try { return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ts)); }
  catch (e) { var d = new Date(ts); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
}

function daysBetween(aKey, bKey) {
  var a = aKey.split('-').map(Number), b = bKey.split('-').map(Number);
  return Math.round((Date.UTC(a[0], a[1] - 1, a[2]) - Date.UTC(b[0], b[1] - 1, b[2])) / 86400000);
}

// Day-of-week (0=Sun..6=Sat) and the Monday-of-this-week key, from a YYYY-MM-DD.
function dowOf(dk) { var p = dk.split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay(); }
function mondayOf(dk) {
  var p = dk.split('-').map(Number), d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
  var back = (d.getUTCDay() + 6) % 7; // Mon→0, Sun→6
  d.setUTCDate(d.getUTCDate() - back);
  return d.toISOString().slice(0, 10);
}

// Proactive intelligence: is recovery clearly slipping AND now low? Returns
// { n, drop, latest } only when it's worth a heads-up — never on a single dip
// or while recovery is still high. Mirrors the in-app rec-down insight.
function recoveryDipFrom(sleepLogs) {
  var rec = (sleepLogs || []).filter(function (e) { return e && e.dateKey && typeof e.recovery === 'number'; })
    .sort(function (a, b) { return a.dateKey.localeCompare(b.dateKey); }).slice(-7).map(function (e) { return e.recovery; });
  if (rec.length < 4) return null;
  var first = rec[0], latest = rec[rec.length - 1], prev = rec[rec.length - 2];
  if ((first - latest) >= 10 && latest < 62 && latest <= prev) return { n: rec.length, drop: Math.round(first - latest), latest: Math.round(latest) };
  return null;
}

// Names the still-due supplements in a window into one push line.
function suppBody(list) {
  if (!list || !list.length) return '';
  var names = list.length <= 3 ? list.join(', ') : (list.slice(0, 2).join(', ') + ' +' + (list.length - 2) + ' more');
  return names + '. Tap to take ' + (list.length > 1 ? 'them' : 'it') + ' — 10 seconds and it’s logged.';
}

// Each reminder: when it fires by default, whether it's relevant today, and
// the line Nova sends. Mirrors the conditions in nova-coach.js so the push
// matches what the in-app coach would say.
var REMINDERS = [
  { id: 'weighin', defHour: 12, title: 'Weigh-in ⚖️',
    cond: function (c) { return !c.weighedToday; },
    body: function () { return 'Step on the scale — 10 seconds keeps your recomp trend honest.'; } },

  { id: 'training', defHour: 14, title: 'Time to move 💪',
    cond: function (c) { return c.daysSinceTraining != null && c.daysSinceTraining >= 3; },
    body: function (c) { return "It's been " + c.daysSinceTraining + ' days since your last session. Even a short one keeps momentum.'; } },

  { id: 'recovery', defHour: 9, title: 'Recovery check 🪫',
    cond: function (c) { return !!c.recoveryDip; },
    body: function (c) { var d = c.recoveryDip || {}; return 'Your recovery has slipped about ' + d.drop + ' points over your last ' + d.n + ' mornings (now ' + d.latest + '). Today’s a day to go lighter or rest — and protect tonight’s sleep.'; } },

  { id: 'protein', defHour: 19, title: 'Protein check 🍗',
    cond: function (c) { return c.proteinTarget > 0 && c.protein < c.proteinTarget * 0.7; },
    body: function (c) { return Math.round(c.protein) + 'g so far — aim for ~' + c.proteinTarget + 'g. Get a hit in to grow while you lean out.'; } },

  { id: 'caffeine', defHour: 14, title: 'Caffeine cutoff ☕️',
    cond: function (c) { return c.cafToday > 0; },
    body: function (c) { return "You're at " + Math.round(c.cafToday) + "mg today — cut it off now and tonight's sleep (and tomorrow's lifts) will thank you."; } },

  // Supplement windows — fire at Alex's real timing (morning ~10, afternoon ~17,
  // night ~23) and only when that window still has UNTAKEN daily supps. The body
  // names exactly what's left, so the push doubles as the checklist.
  { id: 'supp-morning', defHour: 10, title: 'Morning stack 🌅',
    cond: function (c) { return c.suppMorning && c.suppMorning.length > 0; },
    body: function (c) { return suppBody(c.suppMorning); } },

  { id: 'supp-lunch', defHour: 17, title: 'Afternoon stack 🍽️',
    cond: function (c) { return c.suppLunch && c.suppLunch.length > 0; },
    body: function (c) { return suppBody(c.suppLunch); } },

  { id: 'supp-evening', defHour: 23, title: 'Night stack 🌙',
    cond: function (c) { return c.suppEvening && c.suppEvening.length > 0; },
    body: function (c) { return suppBody(c.suppEvening); } },

  { id: 'journal', defHour: 22, title: 'Close out your day 🧭',
    cond: function (c) { return c.habitsLeft > 0 || !c.journaledToday; },
    body: function (c) {
      if (c.habitsLeft > 0 && !c.journaledToday) return c.habitsLeft + ' habit' + (c.habitsLeft > 1 ? 's' : '') + ' left and no journal yet — finish strong.';
      if (c.habitsLeft > 0) return c.habitsLeft + ' habit' + (c.habitsLeft > 1 ? 's' : '') + ' left to close out today.';
      return 'Two honest lines on today before bed — what you did, what you’re grateful for.';
    } },

  // Opt-in. Fires ~1h before the bedtime derived from the sleep profile.
  { id: 'winddown', defHour: 22, title: 'Wind down 🌙',
    cond: function () { return true; },
    body: function (c) { return c.bedtimeTarget
      ? ('Aim to be in bed by ' + c.bedtimeTarget + ' for ' + c.sleepNeed + 'h — wind down now: screens off, lights low.')
      : 'Start winding down — screens off, lights low. Sleep is your #1 lever.'; } },

  // Weekly — Monday morning. Pushes the #1 cross-domain insight the app
  // computed (stored client-side in the 'insight' row). Deduped per week.
  { id: 'weekly', defHour: 9, weekly: true, dow: 1, title: 'Your week in focus 🧠',
    cond: function (c) { return !!c.topInsight; },
    body: function (c) { var t = c.topInsight; return (t.text || '') + (t.action ? '  → ' + t.action : ''); } }
];

// Pull the user's data rows and reduce to the few facts the reminders need.
async function buildContext(tz, today) {
  var poc = await supa.readRow('po-coach');   // po_workouts, po_coach_weights
  var nut = await supa.readRow('nutrition');  // nut:logs
  var caf = await supa.readRow('caffeine');   // caf:logs
  var idn = await supa.readRow('identity');   // habits:list, habits:log, journal:entries
  var hlt = await supa.readRow('health');     // po_water_v1 (for body weight → protein target)

  var weights = poc['po_coach_weights'] || [];
  var weighedToday = weights.some(function (e) { return e && e.dateKey === today; });

  var lastDate = null;
  (poc['po_workouts'] || []).forEach(function (w) { if (w && w.date && (!lastDate || w.date > lastDate)) lastDate = w.date; });
  var daysSinceTraining = lastDate ? daysBetween(today, lastDate) : null;

  var weightKg = (((hlt['po_water_v1'] || {}).profile) || {}).weightKg || 75;
  var proteinTarget = Math.round(weightKg * 2);
  var protein = 0;
  (nut['nut:logs'] || []).forEach(function (l) { if (l && (l.dateKey ? l.dateKey === today : (l.ts && tsToDateKey(l.ts, tz) === today))) protein += (l.p || 0); });

  var cafToday = 0;
  (caf['caf:logs'] || []).forEach(function (l) { if (l && l.ts && tsToDateKey(l.ts, tz) === today) cafToday += (l.mg || 0); });

  var hbList = idn['habits:list'] || [], hbToday = (idn['habits:log'] || {})[today] || {};
  var habitsDone = hbList.filter(function (h) { return h && hbToday[h.id]; }).length;
  var habitsLeft = Math.max(0, hbList.length - habitsDone);

  var jToday = (idn['journal:entries'] || []).find(function (e) { return e && e.dateKey === today; });
  var journaledToday = !!(jToday && (((jToday.reflection || '').trim()) || ((jToday.gratitude || '').trim())));

  // Supplement stack — items + today's taken map live in the 'health' row
  // (supps.html syncs them under appKey 'health'). The window reminders fire at
  // hours >= 6, where the 6 AM-rollover taken key == the plain local date, so
  // 'stack:taken:'+today is the right bucket. List the still-UNTAKEN daily items
  // per window; "anytime" (creatine) rides along with morning so it surfaces early.
  var stackItems = hlt['stack:items'] || [];
  var stackTaken = hlt['stack:taken:' + today] || {};
  function suppDue(windows) {
    return stackItems.filter(function (i) {
      return i && i.id && i.name && windows.indexOf(i.window || 'anytime') !== -1 && !stackTaken[i.id];
    }).map(function (i) { return i.name + (i.dose ? ' (' + i.dose + ')' : ''); });
  }
  var suppMorning = suppDue(['morning', 'anytime']);
  var suppLunch = suppDue(['lunch']);
  var suppEvening = suppDue(['evening']);

  var recoveryDip = recoveryDipFrom((await supa.readRow('sleep'))['sleep:logs']);

  // Weekly insight (computed in-app, stored in the 'insight' row). Ignore if
  // stale (>14d) so we never push a pattern that no longer reflects the data.
  var insRow = await supa.readRow('insight');
  var topInsight = (insRow && insRow['insight:top']) ? insRow['insight:top'] : null;
  if (topInsight && topInsight.ts && (Date.now() - topInsight.ts > 14 * 86400000)) topInsight = null;
  if (topInsight && !((topInsight.text || '').trim())) topInsight = null;

  return { weighedToday: weighedToday, daysSinceTraining: daysSinceTraining,
    protein: protein, proteinTarget: proteinTarget, cafToday: cafToday,
    habitsLeft: habitsLeft, journaledToday: journaledToday, recoveryDip: recoveryDip,
    topInsight: topInsight,
    suppMorning: suppMorning, suppLunch: suppLunch, suppEvening: suppEvening };
}

// ── Garmin → intervals.icu courier ─────────────────────────────────
// Chrissie links Garmin→intervals.icu once (OAuth). This dumb courier polls
// intervals for new RUN activities, downloads each ORIGINAL watch file as a FIT,
// and drops the raw bytes (base64) into an app_state 'run:inbox' row. The APP
// drains that inbox through its own tested FIT pipeline (parse + dupe-safe heal),
// so the server never parses or touches her actual run data — no clobber risk.
// Idempotent: 'doneIds' stops re-downloads; the client acks consumed ids in
// 'run:inbox-ack' so the server prunes delivered items. No 13th function: folded
// into the hourly reminder cron, and the app can trigger an instant check (?icu=1).
function icuLooksLikeActivity(b) {
  if (!b || b.length < 12) return false;
  if (b[0] === 0x1f && b[1] === 0x8b) return true;                                   // gzip (.gz)
  if (b[0] === 0x50 && b[1] === 0x4b) return true;                                   // zip (PK)
  if (b[8] === 0x2e && b[9] === 0x46 && b[10] === 0x49 && b[11] === 0x54) return true; // ".FIT"
  var head = Buffer.from(b.slice(0, 96)).toString('utf8');
  return /<\?xml|<TrainingCenterDatabase|<gpx/i.test(head);                          // tcx / gpx
}
// ── WELLNESS courier — intervals.icu leg (the FALLBACK) ────────────────────
// Chrissie wanted everything her watch measures to arrive on its own, like her
// runs do. This leg comes down the same wire as her runs: intervals keeps one
// wellness record per day that Garmin fills. Verified against her real account
// 2026-07-16 — what it actually carries is:
//     sleepSecs (6h16m) · sleepScore (66) · restingHR (51) · hrv rMSSD (44) · steps
// and, importantly, NOT bed/wake times, NOT stages, NOT continuity. intervals is
// a training platform: it distils Garmin's night into a duration, so there is no
// timeline to import. Confirmed twice over — intervals' own forum says sleep
// onset/offset must be typed in by hand, because Garmin's partner API never
// sends it.
//
// That gap is why _garmin.js exists and goes to the source. This leg STAYS as
// the fallback: it needs no credentials and cannot be broken by Garmin retiring
// OAuth1 on 2026-12-31, so on the day the rich leg dies her nights keep landing.
//
// TWO RULES, and they bind both legs:
//  1. MEASUREMENTS only. Garmin's own sleepScore is a VERDICT from a black box.
//     It is carried as `garminScore` for comparison and must NEVER feed her
//     score, or there are two scores disagreeing and the circularity that got
//     sleep.html rebuilt on 2026-07-14 is back.
//  2. Delivered to the RUNNER's account, never the owner's. Alex has no watch;
//     nothing here can reach his rows or change his dashboard.
//
// Returns items; it does NOT write. publishSleepInbox() below is the single
// writer, so the two legs can never race each other over one row.
async function icuWellnessItems() {
  var ATH = (process.env.ICU_ATHLETE_ID || '').trim(), KEY = (process.env.ICU_API_KEY || '').trim();
  if (!ATH || !KEY) return [];
  var authHeader = 'Basic ' + Buffer.from('API_KEY:' + KEY).toString('base64');
  function ymd(d) { return d.toISOString().slice(0, 10); }
  var now = Date.now();
  // 21 days: enough to backfill her sleep-debt window after a break, cheap enough
  // to re-pull hourly.
  var url = 'https://intervals.icu/api/v1/athlete/' + encodeURIComponent(ATH) +
    '/wellness?oldest=' + ymd(new Date(now - 21 * 86400000)) + '&newest=' + ymd(new Date(now + 86400000));
  var r;
  try { r = await fetch(url, { headers: { Authorization: authHeader } }); }
  catch (e) { throw new Error('wellness fetch failed'); }
  if (!r.ok) throw new Error('wellness ' + r.status);
  var rows; try { rows = await r.json(); } catch (e) { throw new Error('wellness not json'); }
  if (!Array.isArray(rows)) throw new Error('wellness not array');

  var items = [];
  rows.forEach(function (w) {
    if (!w || !w.id) return;
    var it = { dateKey: String(w.id).slice(0, 10) }, any = false;
    if (w.sleepSecs > 0)  { it.asleepMeasured = Math.round((w.sleepSecs / 3600) * 100) / 100; any = true; }
    if (w.restingHR > 0)  { it.restingHR = w.restingHR; any = true; }
    if (w.hrv > 0)        { it.hrv = w.hrv; any = true; }
    if (w.sleepScore > 0) { it.garminScore = w.sleepScore; any = true; }   // comparison ONLY
    if (any) items.push(it);
  });
  return items;
}

// ── THE SINGLE WRITER of sleep:inbox ───────────────────────────────────────
// Two legs feed her sleep and exactly one function writes it, because two
// writers on one row is a clobber waiting to happen.
//
// PRECEDENCE, field by field: Garmin > intervals > what was already delivered.
// Never wholesale — a null from the rich leg (her watch reports no SpO2) must
// not erase a real value the poor leg had. Only non-null wins.
//
// CARRY-FORWARD: the Garmin leg fetches only TODAY plus any gap, so previously
// delivered nights would vanish from a rolling snapshot if we rebuilt it from
// scratch each tick. Past Garmin nights are carried over from the previous row;
// past intervals nights are not, because that leg re-pulls its whole 21 days
// anyway and stale copies would only fight the fresh ones.
//
// Idempotent by date: a rolling snapshot keyed by dateKey, NOT a queue. Nothing
// to ack, nothing to prune, re-running is free — unlike the activity courier,
// which must track doneIds because FIT downloads are expensive and one-shot.
var INBOX_DAYS = 30;

function mergeInto(map, items, tag) {
  (items || []).forEach(function (it) {
    if (!it || !it.dateKey) return;
    var cur = map[it.dateKey] || (map[it.dateKey] = { dateKey: it.dateKey });
    Object.keys(it).forEach(function (k) {
      if (it[k] === null || it[k] === undefined) return;   // never let a gap erase a reading
      cur[k] = it[k];
    });
    if (tag) cur.measuredBy = tag;
  });
}

async function publishSleepInbox() {
  var runner = supa.RUNNER_ID || undefined;
  var prev = await supa.readRow('sleep:inbox', runner);
  var prevItems = (prev && Array.isArray(prev.items)) ? prev.items : [];

  // Which nights has the rich leg already delivered? Those need no re-fetch.
  var have = {}, carried = [];
  prevItems.forEach(function (it) {
    if (it && it.dateKey && it.measuredBy === 'garmin') { have[it.dateKey] = 1; carried.push(it); }
  });

  // Each leg in its OWN try. They are independent deliveries: a Garmin outage
  // must not cost her the intervals duration, and vice versa.
  var icuItems = [], icuErr = null;
  try { icuItems = await icuWellnessItems(); }
  catch (e) { icuErr = String((e && e.message) || e); }

  var gItems = [], gErr = null, gConf = garmin.configured();
  if (gConf) {
    try {
      var got = await garmin.recentNights({ have: have });
      gItems = got.items;
      if (got.errors && got.errors.length) gErr = got.errors.join(' | ');
    } catch (e) { gErr = String((e && e.message) || e); }
  }

  var map = {};
  mergeInto(map, icuItems, null);        // fallback leg first…
  mergeInto(map, carried, 'garmin');     // …then what the watch already told us…
  mergeInto(map, gItems, 'garmin');      // …then tonight's fresh reading, which wins.

  var cutoff = new Date(Date.now() - INBOX_DAYS * 86400000).toISOString().slice(0, 10);
  var items = Object.keys(map).filter(function (k) { return k >= cutoff; })
    .sort().map(function (k) { return map[k]; });

  // A read that failed must NEVER be published as an empty snapshot — that is
  // how this project once "lost" a device's worth of data. If both legs came
  // back with nothing and we previously had something, keep what we had.
  if (!items.length) {
    return { wellness: 0, garmin: gConf ? (gErr || 'no nights') : 'not configured', icu: icuErr || 'no rows',
      kept: prevItems.length, skippedWrite: true };
  }

  var sig = JSON.stringify(items);
  var rich = items.filter(function (it) { return it.measuredBy === 'garmin'; }).length;
  if (prev && prev.sig === sig) {
    return { wellness: items.length, rich: rich, unchanged: true, garminError: gErr, icuError: icuErr };
  }
  await supa.writeRow('sleep:inbox', { items: items, sig: sig, at: new Date().toISOString() }, runner);
  return { wellness: items.length, rich: rich, wrote: true, garminError: gErr, icuError: icuErr };
}

async function icuCheck() {
  var ATH = (process.env.ICU_ATHLETE_ID || '').trim(), KEY = (process.env.ICU_API_KEY || '').trim();
  if (!ATH || !KEY) return { skipped: 'icu env not set' };
  var authHeader = 'Basic ' + Buffer.from('API_KEY:' + KEY).toString('base64');
  var now = Date.now();
  function ymd(d) { return d.toISOString().slice(0, 10); }
  var listUrl = 'https://intervals.icu/api/v1/athlete/' + encodeURIComponent(ATH) +
    '/activities?oldest=' + ymd(new Date(now - 30 * 86400000)) + '&newest=' + ymd(new Date(now + 86400000));
  var lr;
  try { lr = await fetch(listUrl, { headers: { Authorization: authHeader } }); }
  catch (e) { return { error: 'list fetch failed' }; }
  if (!lr.ok) return { error: 'list ' + lr.status };
  var acts; try { acts = await lr.json(); } catch (e) { return { error: 'list not json' }; }
  if (!Array.isArray(acts)) return { error: 'list not array' };

  // The courier delivers to the RUNNER's account (Chrissie), not the owner's —
  // run.html is her app and her rows are hers. Falls back to the owner while
  // she has no account yet, which is the single-account status quo.
  var runner = supa.RUNNER_ID || undefined;
  var inbox = await supa.readRow('run:inbox', runner);
  var ack = await supa.readRow('run:inbox-ack', runner);
  var doneIds = Array.isArray(inbox.doneIds) ? inbox.doneIds.slice() : [];
  var items = Array.isArray(inbox.items) ? inbox.items.slice() : [];
  var seenIds = Array.isArray(ack.seenIds) ? ack.seenIds : [];
  var doneSet = {}; doneIds.forEach(function (id) { doneSet[id] = 1; });
  var seenSet = {}; seenIds.forEach(function (id) { seenSet[id] = 1; });
  items = items.filter(function (it) { return it && it.id && !seenSet[it.id]; }); // drop what the app already drained

  /* ── Her cloud row is the only proof of delivery. ──────────────────────────
     `doneIds` is what this courier downloaded and `seenIds` is what an app said
     it took — and "said it took" used to mean a localStorage write that sync.js
     might never have pushed. When that push failed, the run existed on exactly
     one phone while the inbox had already thrown away the only other copy: her
     25 Jul 16.3 km long run was acked, pruned, and invisible from every other
     device, with nothing left to recover it from.
     So read what her account ACTUALLY holds and re-offer anything the courier
     delivered that is not in there. Once per activity, ever (`redelivered`), so
     a run she deletes on purpose comes back at most once rather than hourly. */
  var runRow = await supa.readRow('run', runner);
  var herLogs = Array.isArray(runRow['run:logs']) ? runRow['run:logs'] : null;
  var redone = Array.isArray(inbox.redelivered) ? inbox.redelivered.slice() : [];
  var redoneSet = {}; redone.forEach(function (id) { redoneSet[id] = 1; });
  var itemSet = {}; items.forEach(function (it) { itemSet[it.id] = 1; });
  // ⚠️ A failed read and an empty history are the same value here. Treat a
  // null/empty row as "I cannot tell" and re-deliver NOTHING — reading it as
  // "she has no runs" would re-download her entire month.
  function missingFromHerApp(a) {
    if (!herLogs || !herLogs.length) return false;
    var d = String(a.start_date_local || '').slice(0, 10);
    if (!d) return false;
    var km = a.distance > 0 ? a.distance / 1000 : 0;
    for (var i = 0; i < herLogs.length; i++) {                       // mirrors the client's own findMatch()
      var l = herLogs[i];
      if (!l || l.date !== d) continue;
      if (km > 0 && Math.abs((+l.distanceKm || 0) - km) >= 0.25) continue;
      return false;
    }
    return true;
  }
  var redos = 0;

  // Strava-sourced activities are blocked by intervals' API ("not available") — skip them.
  // Setup requires GARMIN connected DIRECTLY to intervals so runs arrive as source=GARMIN.
  var strava = 0, cands = [];
  acts.forEach(function (a) { if (!a || !a.id) return; if (a.source === 'STRAVA') { strava++; return; } cands.push(a); });
  cands.sort(function (a, b) { return (a.start_date_local || '') < (b.start_date_local || '') ? -1 : 1; });

  var added = 0, errs = 0, nonRun = 0;
  for (var i = 0; i < cands.length; i++) {
    var a = cands[i];
    var redeliver = false;
    if (doneSet[a.id] || seenSet[a.id]) {
      // Already handled, UNLESS her account does not actually have it.
      if (itemSet[a.id] || redoneSet[a.id] || redos >= 3 || !missingFromHerApp(a)) {
        if (seenSet[a.id] && !doneSet[a.id]) { doneSet[a.id] = 1; doneIds.push(a.id); }
        continue;
      }
      redeliver = true;                                              // delivered once, never landed
    }
    if (added + nonRun + errs >= 12) break;                          // bound one invocation under maxDuration
    var mark = true;
    try {
      // the list omits type; the FULL activity object carries it (available for non-Strava sources)
      var fr = await fetch('https://intervals.icu/api/v1/activity/' + encodeURIComponent(a.id), { headers: { Authorization: authHeader } });
      if (!fr.ok) { errs++; }
      else {
        var fj = await fr.json();
        if (!/run/i.test(fj.type || '')) { nonRun++; }               // ride / swim / strength → skip (still mark done)
        else {
          var ff = await fetch('https://intervals.icu/api/v1/activity/' + encodeURIComponent(a.id) + '/fit-file', { headers: { Authorization: authHeader } });
          if (!ff.ok) { errs++; }
          else {
            var buf = Buffer.from(await ff.arrayBuffer());
            if (buf.length && buf.length <= 4 * 1024 * 1024 && icuLooksLikeActivity(buf)) {
              items.push({ id: a.id, name: (fj.name || 'Run'), date: (a.start_date_local || fj.start_date_local || ''), fit: buf.toString('base64') });
              added++;
              // Spend the one re-delivery only when the bytes are really in hand.
              if (redeliver) {
                redone.push(a.id); redoneSet[a.id] = 1; redos++;
                // And "un-see" it, or the next tick's seen-filter would prune
                // the re-delivered item before her phone ever opened the app.
                delete seenSet[a.id];
                seenIds = seenIds.filter(function (x) { return x !== a.id; });
              }
            } else { errs++; }
          }
        }
      }
    } catch (e) { mark = false; errs++; }                            // network blip → retry next time
    if (mark) { doneSet[a.id] = 1; doneIds.push(a.id); }
  }

  if (items.length > 20) items = items.slice(items.length - 20);     // generous buffer; ack-pruning keeps it near-empty
  if (doneIds.length > 500) doneIds = doneIds.slice(doneIds.length - 500);
  if (redone.length > 200) redone = redone.slice(redone.length - 200);
  await supa.writeRow('run:inbox', { doneIds: doneIds, items: items, redelivered: redone }, runner);
  if (redos) await supa.writeRow('run:inbox-ack', { seenIds: seenIds }, runner);

  var newest = acts.map(function (a) { return a && a.start_date_local; }).filter(Boolean).sort().slice(-1)[0] || null;
  return { total: acts.length, strava: strava, garmin: cands.length, added: added, nonRun: nonRun, errs: errs, pending: items.length, redelivered: redos, newest: newest };
}

// ── ?icu=diag — WHY is a run not arriving? ─────────────────────────────────
// icuCheck() reports counts; counts cannot tell "she has not run" from "every
// run she does is being silently dropped". This lists what intervals actually
// holds (id, date, name, source, type) and PROBES the two endpoints the
// courier depends on, so the reason is readable instead of inferred.
// READ-ONLY: it never writes a row and never marks anything done.
async function icuDiag() {
  var ATH = (process.env.ICU_ATHLETE_ID || '').trim(), KEY = (process.env.ICU_API_KEY || '').trim();
  if (!ATH || !KEY) return { skipped: 'icu env not set', athlete: !!ATH, key: !!KEY };
  var authHeader = 'Basic ' + Buffer.from('API_KEY:' + KEY).toString('base64');
  var now = Date.now();
  function ymd(d) { return d.toISOString().slice(0, 10); }
  var listUrl = 'https://intervals.icu/api/v1/athlete/' + encodeURIComponent(ATH) +
    '/activities?oldest=' + ymd(new Date(now - 30 * 86400000)) + '&newest=' + ymd(new Date(now + 86400000));
  var lr; try { lr = await fetch(listUrl, { headers: { Authorization: authHeader } }); }
  catch (e) { return { error: 'list fetch failed: ' + String((e && e.message) || e) }; }
  if (!lr.ok) return { error: 'list ' + lr.status, body: (await lr.text()).slice(0, 300) };
  var acts; try { acts = await lr.json(); } catch (e) { return { error: 'list not json' }; }
  if (!Array.isArray(acts)) return { error: 'list not array' };

  acts.sort(function (a, b) { return (a.start_date_local || '') < (b.start_date_local || '') ? 1 : -1; });
  var list = acts.slice(0, 25).map(function (a) {
    return { id: a.id, date: a.start_date_local || null, name: (a.name || '').slice(0, 40),
      source: a.source || null, type: a.type || null,
      km: a.distance ? Math.round(a.distance / 10) / 100 : null, sec: a.moving_time || a.elapsed_time || null };
  });

  // Probe the newest of each source: can we read the full object? the FIT?
  var probes = {};
  var seenSrc = {};
  for (var i = 0; i < acts.length && Object.keys(seenSrc).length < 3; i++) {
    var a = acts[i], src = a.source || 'NONE';
    if (seenSrc[src]) continue;
    seenSrc[src] = 1;
    var p = { id: a.id, date: a.start_date_local || null };
    try {
      var fr = await fetch('https://intervals.icu/api/v1/activity/' + encodeURIComponent(a.id), { headers: { Authorization: authHeader } });
      p.full = fr.status;
      if (fr.ok) { var fj = await fr.json(); p.fullType = fj.type || null; p.fullKm = fj.distance ? Math.round(fj.distance / 10) / 100 : null; p.fullSec = fj.moving_time || null; }
      else p.fullBody = (await fr.text()).slice(0, 160);
    } catch (e) { p.full = 'throw: ' + String((e && e.message) || e); }
    try {
      var ff = await fetch('https://intervals.icu/api/v1/activity/' + encodeURIComponent(a.id) + '/fit-file', { headers: { Authorization: authHeader } });
      p.fit = ff.status;
      if (ff.ok) { var buf = Buffer.from(await ff.arrayBuffer()); p.fitBytes = buf.length; p.fitLooksReal = icuLooksLikeActivity(buf); }
      else p.fitBody = (await ff.text()).slice(0, 160);
    } catch (e) { p.fit = 'throw: ' + String((e && e.message) || e); }
    probes[src] = p;
  }

  var runner = supa.RUNNER_ID || undefined;
  var inbox = await supa.readRow('run:inbox', runner);
  var ack = await supa.readRow('run:inbox-ack', runner);
  // The question the counts above could never answer: of the runs intervals
  // holds, which ones are actually IN her account? A run marked delivered but
  // absent from `run:logs` is the whole failure mode this pipeline had — it is
  // what the courier now reconciles, and it should be readable here first.
  var dRow = await supa.readRow('run', runner);
  var dLogs = Array.isArray(dRow['run:logs']) ? dRow['run:logs'] : null;
  var absent = !dLogs ? null : acts.filter(function (a) {
    if (a.source === 'STRAVA') return false;                          // unimportable by design
    var d = String(a.start_date_local || '').slice(0, 10); if (!d) return false;
    var km = a.distance > 0 ? a.distance / 1000 : 0;
    return !dLogs.some(function (l) {
      return l && l.date === d && (!(km > 0) || Math.abs((+l.distanceKm || 0) - km) < 0.25);
    });
  }).map(function (a) { return { id: a.id, date: a.start_date_local, km: a.distance ? Math.round(a.distance / 10) / 100 : null }; });
  return {
    athleteId: ATH, total: acts.length, activities: list, probes: probes,
    herApp: {
      runs: dLogs ? dLogs.length : null,          // null = row unreadable, NOT "she has none"
      newest: dLogs && dLogs.length ? dLogs.map(function (l) { return l && l.date; }).filter(Boolean).sort().slice(-1)[0] : null,
      missingFromApp: absent                      // intervals has it, her account does not
    },
    inbox: {
      pending: (inbox.items || []).map(function (it) { return { id: it.id, date: it.date, name: it.name, fitKb: it.fit ? Math.round(it.fit.length / 1365) : 0 }; }),
      doneIds: (inbox.doneIds || []).length,
      acked: (ack.seenIds || []).length,
      redelivered: (inbox.redelivered || []).length,
      runnerRow: !!supa.RUNNER_ID
    }
  };
}

module.exports = async function (req, res) {
  if (!auth.guardCron(req, res)) return; // QStash hourly cron (cron secret) or same-origin manual run

  // ── OWNER READ-THROUGH ("view as her") ───────────────────────────
  // Let the OWNER (Alex) view the runner's (Chrissie's) running app read-only,
  // so he can develop it without her phone. Deliberately the ONLY cross-account
  // read in the app, and it is tightly gated: verified server-side that the
  // caller's token IS the owner, returns ONLY the 'run' bundle, read-only. Any
  // other caller gets 403 — this must never become a general data leak.
  if (req.query && req.query.peek) {
    var caller = await supa.uidFromRequest(req);
    if (!caller || !supa.OWNER_ID || caller !== supa.OWNER_ID) { res.status(403).json({ error: 'owner only' }); return; }
    if (!supa.RUNNER_ID) { res.status(400).json({ error: 'no runner configured' }); return; }

    if (req.query.peek !== 'run') { res.status(400).json({ error: 'unknown peek target' }); return; }
    var runRow = await supa.readRow('run', supa.RUNNER_ID);
    // What the courier has parked but her phone has not taken yet. Without this,
    // "she has not run since Tuesday" and "her run is sitting in the inbox
    // waiting for her to open the app" look identical from here — and that
    // ambiguity is exactly what read as "the running page lost a run". Auto-
    // import is pull-on-open, so a wait is normal; not being able to SEE the
    // wait is not.
    var pInbox = await supa.readRow('run:inbox', supa.RUNNER_ID);
    var pAck = await supa.readRow('run:inbox-ack', supa.RUNNER_ID);
    var pSeen = {};
    (Array.isArray(pAck.seenIds) ? pAck.seenIds : []).forEach(function (id) { pSeen[id] = 1; });
    var waiting = (Array.isArray(pInbox.items) ? pInbox.items : [])
      .filter(function (it) { return it && it.id && !pSeen[it.id]; })
      .map(function (it) { return { id: it.id, name: it.name || 'Run', date: it.date || '' }; });
    res.setHeader('Cache-Control', 'no-store');
    // `keys` survives the 2026-07-16 debugging as the one number worth keeping:
    // readRow() returns {} for a missing row, a wrong RUNNER_ID and an error
    // alike, so without it "she has no runs" and "this is broken" look identical
    // from the client. That ambiguity cost a day. Owner-gated; leaks nothing.
    res.status(200).json({
      appKey: 'run',
      data: runRow || {},
      keys: Object.keys(runRow || {}).filter(function (k) { return k.indexOf('run:') === 0; }).length,
      waiting: waiting
    });
    return;
  }

  // ── MOVIES: Letterboxd → TMDB sync (same-origin, stateless) ──────
  // The app calls ?movies=<letterboxd-username> when the films page opens.
  // Fetches that public diary + enriches via TMDB server-side, returns the
  // films; writes NOTHING (the page reconciles into movies:seen itself). Its
  // own early return keeps it fully clear of the backup/cron logic below.
  // Username is stripped to [A-Za-z0-9_] — Letterboxd's own charset — which
  // also closes the door on any URL/SSRF injection through the path.
  if (req.query && req.query.movies) {
    var uname = String(req.query.movies).replace(/[^A-Za-z0-9_]/g, '').slice(0, 40);
    if (!uname) { res.status(400).json({ error: 'no username' }); return; }
    res.setHeader('Cache-Control', 'no-store');
    try {
      var out = await movies.sync(uname, (process.env.TMDB_API_KEY || '').trim());
      var films = (out && out.films) || [];
      res.status(200).json({ films: films, recs: (out && out.recs) || [], count: films.length, tmdb: !!(process.env.TMDB_API_KEY || '').trim() });
    } catch (e) {
      res.status(502).json({ error: String((e && e.message) || e) });
    }
    return;
  }

  // The Improve page calls ?youtube=<playlistId> to mirror a playlist, and
  // POST ?ytdistill to turn notes/transcript into durable key points. Both are
  // stateless and early-return before the backup/cron logic below.
  if (req.query && req.query.ytdistill !== undefined) {
    res.setHeader('Cache-Control', 'no-store');
    try {
      var db = req.body; if (typeof db === 'string') { try { db = JSON.parse(db || '{}'); } catch (e) { db = {}; } }
      var dtext = (db && db.text) || '', dtitle = (db && db.title) || '', dvid = (db && db.videoId) || '';
      var dout = await yt.distill(dtext, dtitle, dvid, (process.env.YOUTUBE_API_KEY || '').trim());
      if (!dout.ok) { res.status(502).json({ error: dout.error || 'distill failed' }); return; }
      res.status(200).json({ text: dout.text });
    } catch (e) {
      res.status(502).json({ error: String((e && e.message) || e) });
    }
    return;
  }
  if (req.query && req.query.ytorganize !== undefined) {
    res.setHeader('Cache-Control', 'no-store');
    try {
      var ob = req.body; if (typeof ob === 'string') { try { ob = JSON.parse(ob || '{}'); } catch (e) { ob = {}; } }
      var oitems = (ob && ob.items) || [];
      if (!oitems.length) { res.status(400).json({ error: 'no items' }); return; }
      var oout = await yt.organize(oitems, (ob && ob.known) || []);
      if (!oout.ok) { res.status(502).json({ error: oout.error || 'organize failed' }); return; }
      res.status(200).json({ concepts: oout.concepts, partial: !!oout.partial });
    } catch (e) {
      res.status(502).json({ error: String((e && e.message) || e) });
    }
    return;
  }
  // ── TikTok, the Improve page's other world ───────────────────────
  // ?tiktok=<url>  → one saved video: caption, hashtags, on-screen text, the
  //                  sound, and TikTok's own auto-captions fetched to TEXT
  //                  (their URL expires within the hour, so it cannot wait).
  //                  Doubles as the refresh call, because the cover URL is
  //                  signed and expires too.
  // ?ttread (POST) → that video → what is worth taking from it, IF anything
  //                  is. _tiktok.grade() decides that in code first.
  // Both stateless, both early-return before the backup/cron logic below.
  if (req.query && req.query.tiktok) {
    res.setHeader('Cache-Control', 'no-store');
    try {
      var tout = await tt.meta(String(req.query.tiktok).slice(0, 300));
      if (!tout.ok) { res.status(tout.gone ? 404 : 502).json(tout); return; }
      res.status(200).json(tout);
    } catch (e) {
      res.status(502).json({ ok: false, error: String((e && e.message) || e) });
    }
    return;
  }
  if (req.query && req.query.ttread !== undefined) {
    res.setHeader('Cache-Control', 'no-store');
    try {
      var tb = req.body; if (typeof tb === 'string') { try { tb = JSON.parse(tb || '{}'); } catch (e) { tb = {}; } }
      if (!tb || typeof tb !== 'object') { res.status(400).json({ error: 'no video' }); return; }
      var tread = await tt.read(tb);
      if (!tread.ok) { res.status(tread.unreadable ? 422 : 502).json(tread); return; }
      res.status(200).json(tread);
    } catch (e) {
      res.status(502).json({ ok: false, error: String((e && e.message) || e) });
    }
    return;
  }

  // The Money page's practice portfolio asks for live EUR prices. Stateless,
  // key-less, and cached briefly at the edge — a fake portfolio does not need
  // second-by-second quotes, and CoinGecko's free tier is rate-limited.
  if (req.query && req.query.prices !== undefined) {
    try {
      var pout = await prices.prices();
      res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');
      res.status(200).json(pout);
    } catch (e) {
      res.setHeader('Cache-Control', 'no-store');
      res.status(502).json({ error: String((e && e.message) || e) });
    }
    return;
  }
  if (req.query && req.query.youtube) {
    var pid = String(req.query.youtube).replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);
    if (!pid) { res.status(400).json({ error: 'no playlist' }); return; }
    res.setHeader('Cache-Control', 'no-store');
    try {
      var vids = await yt.playlist(pid, (process.env.YOUTUBE_API_KEY || '').trim());
      res.status(200).json({ videos: vids, count: vids.length, full: !!(process.env.YOUTUBE_API_KEY || '').trim() });
    } catch (e) {
      res.status(502).json({ error: String((e && e.message) || e) });
    }
    return;
  }

  // ── THE VAULT — daily backup. Runs FIRST, on purpose. ────────────
  // It must come before the reminder block's early returns ("VAPID not
  // configured", "reminders off", "no subscriptions") — behind those, it would
  // silently never run, which is the worst possible failure for a backup. It is
  // also cheap on the 23 hourly ticks where today is already done (one read),
  // and running it before the courier's FIT downloads means a slow courier can
  // never eat the time budget the backup needs.
  // ?backup=auto  → the app's once-a-day ping on open. Idempotent: a no-op if
  //                 today is already done, so opening the app 10× costs 10 reads.
  // ?backup=1     → "Back up now" in the app. Forces a fresh snapshot.
  var bq = (req.query && req.query.backup) || '';
  var backupOnly = bq === '1' || bq === 'force' || bq === 'auto';
  var backupResult = null;
  try { backupResult = await vault.runBackup({ force: bq === '1' || bq === 'force' }); }
  catch (e) { backupResult = { error: String((e && e.message) || e) }; }
  if (backupOnly) { res.status(200).json({ backup: backupResult }); return; }

  // ?garmin=diag — is the token wrong, or is the IP unwelcome? Returns
  // fingerprints, never the secret itself.
  if (req.query && req.query.garmin === 'diag') {
    var dg; try { dg = await garmin.diag(); } catch (e) { dg = { error: String((e && e.message) || e) }; }
    res.status(200).json({ garmin: dg }); return;
  }

  // ?icu=diag — read-only. Must return BEFORE icuCheck(), which writes.
  if (req.query && req.query.icu === 'diag') {
    var idg; try { idg = await icuDiag(); } catch (e) { idg = { error: String((e && e.message) || e) }; }
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({ icu: idg }); return;
  }

  // Garmin→intervals courier runs on every hourly cron AND on demand (?icu=1 from the app).
  var icuOnly = !!(req.query && (req.query.icu === '1' || req.query.icu === 'check'));
  var icuResult = null;
  try { icuResult = await icuCheck(); } catch (e) { icuResult = { error: String((e && e.message) || e) }; }
  // Wellness rides the same tick. Kept in its OWN try so a wellness failure can
  // never take her runs down with it — they are independent deliveries and the
  // runs are the ones she'd notice.
  var wellResult = null;
  try { wellResult = await publishSleepInbox(); } catch (e) { wellResult = { error: String((e && e.message) || e) }; }
  if (icuOnly) { res.status(200).json({ icu: icuResult, wellness: wellResult }); return; }

  try {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) { res.status(200).json({ skipped: 'VAPID not configured', backup: backupResult }); return; }
    webpush.setVapidDetails(
      (process.env.VAPID_SUBJECT || 'mailto:nobody@example.com').trim(),
      (process.env.VAPID_PUBLIC_KEY || '').trim(), (process.env.VAPID_PRIVATE_KEY || '').trim()
    );

    var prefs = await supa.readRow('push:prefs');
    if (prefs.enabled === false) { res.status(200).json({ skipped: 'reminders off', backup: backupResult }); return; }
    var tz = prefs.tz || 'Europe/Athens';
    var lp = localParts(tz);

    var subsRow = await supa.readRow('push:subscriptions');
    var subs = (subsRow && subsRow.subs) || {};
    var endpoints = Object.keys(subs);
    if (!endpoints.length) { res.status(200).json({ skipped: 'no subscriptions', backup: backupResult }); return; }

    var state = await supa.readRow('push:state');
    var sent = state.sent || {};
    var prefR = prefs.reminders || {};

    // Wind-down: derive its hour (and the body's bedtime) from the sleep profile.
    var sleepProf = (await supa.readRow('sleep'))['sleep:profile'] || {};
    var bedtimeTarget = null, sleepNeed = sleepProf.need;
    if (sleepProf.wakeTime && typeof sleepProf.need === 'number') {
      var wp = sleepProf.wakeTime.split(':'); var wm = (+wp[0]) * 60 + (+wp[1]);
      var bm = (((wm - Math.round(sleepProf.need * 60)) % 1440) + 1440) % 1440;
      bedtimeTarget = pad(Math.floor(bm / 60)) + ':' + pad(bm % 60);
    }
    function reminderHour(r) {
      var pr = prefR[r.id] || {};
      if (pr.hour != null) return pr.hour;
      if (r.id === 'winddown' && bedtimeTarget != null) { var bh = parseInt(bedtimeTarget.split(':')[0], 10); return ((bh - 1) % 24 + 24) % 24; }
      return r.defHour;
    }

    var weekKey = mondayOf(lp.dateKey);
    var dow = dowOf(lp.dateKey);
    function dedupeKey(r) { return r.weekly ? weekKey : lp.dateKey; }

    // Which reminders are scheduled for this local hour and not yet sent in
    // their window (today for daily, this week for weekly)?
    var due = REMINDERS.filter(function (r) {
      var pr = prefR[r.id] || {};
      if (r.id === 'winddown') { if (pr.on !== true) return false; }   // opt-in
      else if (pr.on === false) return false;
      if (reminderHour(r) !== lp.hour) return false;
      if (r.weekly && dow !== (r.dow != null ? r.dow : 1)) return false; // weekly fires on its weekday only
      return sent[r.id] !== dedupeKey(r);
    });
    if (!due.length) { res.status(200).json({ checked: true, tz: tz, hour: lp.hour, due: 0, backup: backupResult }); return; }

    // Only pay for the data read when something might fire.
    var ctx = await buildContext(tz, lp.dateKey);
    ctx.bedtimeTarget = bedtimeTarget; ctx.sleepNeed = sleepNeed;
    var toSend = due.filter(function (r) { try { return r.cond(ctx); } catch (e) { return false; } });

    var fired = [], dead = {};
    for (var i = 0; i < toSend.length; i++) {
      var r = toSend[i];
      var payload = JSON.stringify({ title: r.title, body: r.body(ctx), tag: 'als-' + r.id });
      for (var j = 0; j < endpoints.length; j++) {
        var ep = endpoints[j];
        try { await webpush.sendNotification(subs[ep], payload); }
        catch (err) { var sc = err && err.statusCode; if (sc === 404 || sc === 410) dead[ep] = 1; }
      }
      sent[r.id] = dedupeKey(r);
      fired.push(r.id);
    }

    if (fired.length) { state.sent = sent; await supa.writeRow('push:state', state); }
    if (Object.keys(dead).length) {
      endpoints.forEach(function (ep) { if (dead[ep]) delete subs[ep]; });
      await supa.writeRow('push:subscriptions', { subs: subs });
    }

    res.status(200).json({ ok: true, tz: tz, hour: lp.hour, fired: fired, pruned: Object.keys(dead).length, backup: backupResult });
  } catch (e) {
    res.status(200).json({ error: String((e && e.message) || e) });
  }
};
