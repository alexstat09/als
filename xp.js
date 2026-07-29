/* xp.js — one job: this week vs last, computed from the data that is already
   there. No per-page changes needed.

   It was the "Jarvis Gamification Engine": an XP score and a Recruit→Legend
   ladder. Then it was those minus the score. As of als-v435 the last of the
   game layer is gone too, and the file is a week-comparison engine wearing an
   old name — the name stays only because filename == URL in this repo, and
   `index.html` and the service worker both reference it by that path.

   What left, and why (Alex's call, and the data agreed):
   - 20 MILESTONE badges — "Hat Trick", "Fortnight", "Month Warrior",
     "Flawless", "Operator". Achievements bolted onto things that are not
     achievements. Everything MÉTRON shows is a measurement of a real life;
     a badge measures nothing except that a threshold was crossed once.
   - collectData(), which existed only to feed them. It swept the WHOLE of
     localStorage on every home load — ~200 JSON.parse calls across his
     `goals:` and `po_coach_logs:` keys — to decide whether four icons should
     glow. It had exactly one other consumer, the streak chip, and that chip
     read `goal_streak_v1`, which has been {count: 0} since the day it was
     written. So the sweep's entire remaining output was a zero.

   What stays is what was always real: a Mon–Sun week scored against the one
   before it. */
(function () {
  'use strict';
  window.ALS = window.ALS || {};

  // ── Date helpers ─────────────────────────────────────
  function p2(n) { return String(n).padStart(2, '0'); }
  function dateKey(d) { return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }

  // ── Week stats ────────────────────────────────────────
  // weekOffset: 0 = this week (Mon–Sun), -1 = last week
  function getWeekData(weekOffset) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dow = (today.getDay() + 6) % 7; // Mon=0 … Sun=6
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dow + weekOffset * 7);

    let goalRate = 0, goalDays = 0, workouts = 0, weighIns = 0, nutDays = 0;

    let weights = [];
    try { weights = JSON.parse(localStorage.getItem('po_coach_weights') || '[]'); } catch (e) { /* skip */ }

    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      if (d > today) break; // don't count future days
      const k = dateKey(d);

      try {
        const goals = JSON.parse(localStorage.getItem('goals:' + k) || '[]');
        if (goals.length > 0) {
          goalDays++;
          goalRate += goals.filter(g => g.done).length / goals.length;
        }
      } catch (e) { /* skip */ }

      try {
        const wl = JSON.parse(localStorage.getItem('po_coach_logs:' + k) || '[]');
        if (Array.isArray(wl) && wl.length > 0) workouts++;
      } catch (e) { /* skip */ }

      if (weights.some(w => w.dateKey === k)) weighIns++;

      try {
        const hist = JSON.parse(localStorage.getItem('nut:history') || '[]');
        if (Array.isArray(hist) && hist.some(h => h.date === k && h.kcal > 0)) nutDays++;
      } catch (e) { /* skip */ }
    }

    const goalPct = goalDays > 0 ? Math.round((goalRate / goalDays) * 100) : 0;
    const score   = Math.round(
      goalPct * 0.45 +
      (Math.min(workouts, 5) / 5) * 100 * 0.30 +
      (Math.min(weighIns, 7) / 7) * 100 * 0.15 +
      (Math.min(nutDays,  7) / 7) * 100 * 0.10
    );

    return { score, goalPct, workouts, weighIns, nutDays };
  }

  // ── Public API ────────────────────────────────────────
  // No `level`, no `data`, no `milestones`: see the note above. Callers get
  // two weeks of measurements and nothing else. `home-live.js` is the only
  // caller in the app.
  window.ALS.XP = {
    compute() {
      return { thisWeek: getWeekData(0), lastWeek: getWeekData(-1) };
    },
  };
})();
