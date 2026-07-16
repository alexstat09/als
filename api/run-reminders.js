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
    topInsight: topInsight };
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

  // Strava-sourced activities are blocked by intervals' API ("not available") — skip them.
  // Setup requires GARMIN connected DIRECTLY to intervals so runs arrive as source=GARMIN.
  var strava = 0, cands = [];
  acts.forEach(function (a) { if (!a || !a.id) return; if (a.source === 'STRAVA') { strava++; return; } cands.push(a); });
  cands.sort(function (a, b) { return (a.start_date_local || '') < (b.start_date_local || '') ? -1 : 1; });

  var added = 0, errs = 0, nonRun = 0;
  for (var i = 0; i < cands.length; i++) {
    var a = cands[i];
    if (doneSet[a.id]) continue;
    if (seenSet[a.id]) { doneSet[a.id] = 1; doneIds.push(a.id); continue; }
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
            } else { errs++; }
          }
        }
      }
    } catch (e) { mark = false; errs++; }                            // network blip → retry next time
    if (mark) { doneSet[a.id] = 1; doneIds.push(a.id); }
  }

  if (items.length > 20) items = items.slice(items.length - 20);     // generous buffer; ack-pruning keeps it near-empty
  if (doneIds.length > 500) doneIds = doneIds.slice(doneIds.length - 500);
  await supa.writeRow('run:inbox', { doneIds: doneIds, items: items }, runner);

  var newest = acts.map(function (a) { return a && a.start_date_local; }).filter(Boolean).sort().slice(-1)[0] || null;
  return { total: acts.length, strava: strava, garmin: cands.length, added: added, nonRun: nonRun, errs: errs, pending: items.length, newest: newest };
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

    // ?peek=wellness — a READ-ONLY probe of what Garmin actually puts into her
    // intervals.icu wellness record. Chrissie wants sleep (and the rest her watch
    // measures) to arrive automatically like her runs do; the courier below can
    // carry it on the same key. But her sleep score is MEASURED-only by design
    // (bed/wake/latency/wakes), so before mapping anything we need to know which
    // fields her account really has — especially whether it carries sleep TIMING
    // or only a duration. Guessing that is how a day was lost on 2026-07-16.
    // Reports field names and sizes, never bulk data. Owner-gated. Temporary.
    if (req.query.peek === 'wellness') {
      var wATH = (process.env.ICU_ATHLETE_ID || '').trim();
      var wKEY = (process.env.ICU_API_KEY || '').trim();
      if (!wATH || !wKEY) { res.status(200).json({ error: 'ICU not configured', athlete: !!wATH, key: !!wKEY }); return; }
      var wTo = new Date(), wFrom = new Date(Date.now() - 8 * 864e5);
      var ymd = function (d) { return d.toISOString().slice(0, 10); };
      var wUrl = 'https://intervals.icu/api/v1/athlete/' + encodeURIComponent(wATH) +
                 '/wellness?oldest=' + ymd(wFrom) + '&newest=' + ymd(wTo);
      var wr, wj;
      try {
        wr = await fetch(wUrl, { headers: { Authorization: 'Basic ' + Buffer.from('API_KEY:' + wKEY).toString('base64') } });
        if (!wr.ok) { res.status(200).json({ error: 'icu ' + wr.status, body: (await wr.text()).slice(0, 200) }); return; }
        wj = await wr.json();
      } catch (e) { res.status(200).json({ error: 'fetch failed: ' + String(e && e.message).slice(0, 120) }); return; }
      var rows = Array.isArray(wj) ? wj : [];
      // Which fields are actually POPULATED (not just present-and-null)?
      var populated = {};
      rows.forEach(function (r) {
        Object.keys(r || {}).forEach(function (k) {
          var v = r[k];
          if (v === null || v === undefined || v === '' ) return;
          populated[k] = (populated[k] || 0) + 1;
        });
      });
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).json({
        days: rows.length,
        // every field Garmin actually filled, with how many of the last 8 days have it
        populated: populated,
        // the most recent day in full, so the exact shape/units are visible
        latest: rows.length ? rows[rows.length - 1] : null
      });
      return;
    }

    if (req.query.peek !== 'run') { res.status(400).json({ error: 'unknown peek target' }); return; }
    var runRow = await supa.readRow('run', supa.RUNNER_ID);
    res.setHeader('Cache-Control', 'no-store');
    // `keys` survives the 2026-07-16 debugging as the one number worth keeping:
    // readRow() returns {} for a missing row, a wrong RUNNER_ID and an error
    // alike, so without it "she has no runs" and "this is broken" look identical
    // from the client. That ambiguity cost a day. Owner-gated; leaks nothing.
    res.status(200).json({
      appKey: 'run',
      data: runRow || {},
      keys: Object.keys(runRow || {}).filter(function (k) { return k.indexOf('run:') === 0; }).length
    });
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

  // Garmin→intervals courier runs on every hourly cron AND on demand (?icu=1 from the app).
  var icuOnly = !!(req.query && (req.query.icu === '1' || req.query.icu === 'check'));
  var icuResult = null;
  try { icuResult = await icuCheck(); } catch (e) { icuResult = { error: String((e && e.message) || e) }; }
  if (icuOnly) { res.status(200).json({ icu: icuResult }); return; }

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
