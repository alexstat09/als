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
    } }
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
  (nut['nut:logs'] || []).forEach(function (l) { if (l && l.ts && tsToDateKey(l.ts, tz) === today) protein += (l.p || 0); });

  var cafToday = 0;
  (caf['caf:logs'] || []).forEach(function (l) { if (l && l.ts && tsToDateKey(l.ts, tz) === today) cafToday += (l.mg || 0); });

  var hbList = idn['habits:list'] || [], hbToday = (idn['habits:log'] || {})[today] || {};
  var habitsDone = hbList.filter(function (h) { return h && hbToday[h.id]; }).length;
  var habitsLeft = Math.max(0, hbList.length - habitsDone);

  var jToday = (idn['journal:entries'] || []).find(function (e) { return e && e.dateKey === today; });
  var journaledToday = !!(jToday && (((jToday.reflection || '').trim()) || ((jToday.gratitude || '').trim())));

  return { weighedToday: weighedToday, daysSinceTraining: daysSinceTraining,
    protein: protein, proteinTarget: proteinTarget, cafToday: cafToday,
    habitsLeft: habitsLeft, journaledToday: journaledToday };
}

module.exports = async function (req, res) {
  try {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) { res.status(200).json({ skipped: 'VAPID not configured' }); return; }
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:nobody@example.com',
      process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY
    );

    var prefs = await supa.readRow('push:prefs');
    if (prefs.enabled === false) { res.status(200).json({ skipped: 'reminders off' }); return; }
    var tz = prefs.tz || 'Europe/Zurich';
    var lp = localParts(tz);

    var subsRow = await supa.readRow('push:subscriptions');
    var subs = (subsRow && subsRow.subs) || {};
    var endpoints = Object.keys(subs);
    if (!endpoints.length) { res.status(200).json({ skipped: 'no subscriptions' }); return; }

    var state = await supa.readRow('push:state');
    var sent = state.sent || {};
    var prefR = prefs.reminders || {};

    // Which reminders are scheduled for this local hour and not yet sent today?
    var due = REMINDERS.filter(function (r) {
      var pr = prefR[r.id] || {};
      if (pr.on === false) return false;
      var hour = (pr.hour != null) ? pr.hour : r.defHour;
      return hour === lp.hour && sent[r.id] !== lp.dateKey;
    });
    if (!due.length) { res.status(200).json({ checked: true, tz: tz, hour: lp.hour, due: 0 }); return; }

    // Only pay for the data read when something might fire.
    var ctx = await buildContext(tz, lp.dateKey);
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
      sent[r.id] = lp.dateKey;
      fired.push(r.id);
    }

    if (fired.length) { state.sent = sent; await supa.writeRow('push:state', state); }
    if (Object.keys(dead).length) {
      endpoints.forEach(function (ep) { if (dead[ep]) delete subs[ep]; });
      await supa.writeRow('push:subscriptions', { subs: subs });
    }

    res.status(200).json({ ok: true, tz: tz, hour: lp.hour, fired: fired, pruned: Object.keys(dead).length });
  } catch (e) {
    res.status(200).json({ error: String((e && e.message) || e) });
  }
};
