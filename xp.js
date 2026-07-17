/* xp.js — standing: streak, week-vs-week and milestones, computed from the
   data that is already there. No per-page changes needed.

   It was the "Jarvis Gamification Engine": an XP score and a Recruit→Legend
   ladder. Both are gone. Everything MÉTRON shows is a measurement of a real
   life; XP was the one number that measured nothing. The name stays only
   because filename == URL in this repo and 30-odd pages reference it. */
(function () {
  'use strict';
  window.ALS = window.ALS || {};

  // ── Milestone definitions ────────────────────────────
  const MILESTONES = [
    { id: 'goal_1',      icon: '◈', label: 'First Step',    desc: 'Complete your first goal',    check: d => d.totalDone >= 1 },
    { id: 'goal_25',     icon: '◈', label: 'Momentum',      desc: '25 goals completed',          check: d => d.totalDone >= 25 },
    { id: 'goal_100',    icon: '◈', label: 'Centurion',     desc: '100 goals completed',         check: d => d.totalDone >= 100 },
    { id: 'goal_250',    icon: '◈', label: 'Machine',       desc: '250 goals completed',         check: d => d.totalDone >= 250 },
    { id: 'goal_500',    icon: '◈', label: 'Unstoppable',   desc: '500 goals completed',         check: d => d.totalDone >= 500 },
    { id: 'perfect_1',   icon: '⬡', label: 'Perfect Day',   desc: 'All goals done in a day',     check: d => d.perfectDays >= 1 },
    { id: 'perfect_7',   icon: '⬡', label: 'Clean Sweep',   desc: '7 perfect days',              check: d => d.perfectDays >= 7 },
    { id: 'perfect_30',  icon: '⬡', label: 'Flawless',      desc: '30 perfect days',             check: d => d.perfectDays >= 30 },
    { id: 'streak_3',    icon: '⚡', label: 'Hat Trick',     desc: '3-day streak',                check: d => d.streak >= 3 },
    { id: 'streak_7',    icon: '⚡', label: 'Week Run',      desc: '7-day streak',                check: d => d.streak >= 7 },
    { id: 'streak_14',   icon: '⚡', label: 'Fortnight',     desc: '14-day streak',               check: d => d.streak >= 14 },
    { id: 'streak_30',   icon: '⚡', label: 'Month Warrior', desc: '30-day streak',               check: d => d.streak >= 30 },
    { id: 'streak_100',  icon: '⚡', label: 'Operator',      desc: '100-day streak',              check: d => d.streak >= 100 },
    { id: 'weight_1',    icon: '▣', label: 'On the Scale',  desc: 'First weight logged',         check: d => d.weightLogs >= 1 },
    { id: 'weight_30',   icon: '▣', label: 'Scale Master',  desc: '30 weigh-ins',                check: d => d.weightLogs >= 30 },
    { id: 'workout_1',   icon: '◉', label: 'First Rep',     desc: 'First workout logged',        check: d => d.workoutDays >= 1 },
    { id: 'workout_20',  icon: '◉', label: 'Consistent',    desc: '20 workout days',             check: d => d.workoutDays >= 20 },
    { id: 'workout_50',  icon: '◉', label: 'Athlete',       desc: '50 workout days',             check: d => d.workoutDays >= 50 },
    { id: 'nut_1',       icon: '◧', label: 'Tracked',       desc: 'First nutrition day logged',  check: d => d.nutritionDays >= 1 },
    { id: 'nut_14',      icon: '◧', label: 'Week Tracked',  desc: '14 nutrition days logged',    check: d => d.nutritionDays >= 14 },
  ];

  // ── Date helpers ─────────────────────────────────────
  function p2(n) { return String(n).padStart(2, '0'); }
  function dateKey(d) { return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }

  // ── Collect raw stats from localStorage ──────────────
  function collectData() {
    let totalDone = 0, perfectDays = 0, weightLogs = 0, workoutDays = 0, nutritionDays = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;

      if (k.startsWith('goals:')) {
        try {
          const goals = JSON.parse(localStorage.getItem(k) || '[]');
          if (!Array.isArray(goals) || goals.length === 0) continue;
          const done = goals.filter(g => g.done).length;
          totalDone += done;
          if (done > 0 && done === goals.length) perfectDays++;
        } catch (e) { /* skip */ }
        continue;
      }

      if (k === 'po_coach_weights') {
        try {
          const w = JSON.parse(localStorage.getItem(k) || '[]');
          weightLogs = Array.isArray(w) ? w.length : 0;
        } catch (e) { /* skip */ }
        continue;
      }

      if (k.startsWith('po_coach_logs:')) {
        try {
          const logs = JSON.parse(localStorage.getItem(k) || '[]');
          if (Array.isArray(logs) && logs.length > 0) workoutDays++;
        } catch (e) { /* skip */ }
        continue;
      }

      if (k === 'nut:history') {
        try {
          const hist = JSON.parse(localStorage.getItem(k) || '[]');
          nutritionDays = Array.isArray(hist) ? hist.filter(h => h && h.kcal > 0).length : 0;
        } catch (e) { /* skip */ }
        continue;
      }
    }

    let streak = 0;
    try {
      const s = JSON.parse(localStorage.getItem('goal_streak_v1') || '{}');
      streak = typeof s.count === 'number' ? s.count : 0;
    } catch (e) { /* skip */ }

    return { totalDone, perfectDays, weightLogs, workoutDays, nutritionDays, streak };
  }

  /* The XP formula and the level table used to live here — 8 XP per goal, a
     Recruit→Legend ladder, "The Operator", LVL 14.
     They're gone on purpose. XP was the only number on this dashboard that was
     not a measurement: 69.7kg is a fact, 7h12m is a fact, "8,420 XP" was an
     abstraction invented to make logging feel like a game, and the ranks were
     cosplay left over from before the design direction was settled. Everything
     underneath was real and is kept — streak, week-vs-week, milestones. The
     score on top was the only fiction, so the score on top is what went. */

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
  // No `level` any more: see the note above. Callers get measurements only.
  window.ALS.XP = {
    compute() {
      const data       = collectData();
      const milestones = MILESTONES.map(m => ({ ...m, unlocked: m.check(data) }));
      const thisWeek   = getWeekData(0);
      const lastWeek   = getWeekData(-1);
      return { data, milestones, thisWeek, lastWeek };
    },
  };
})();
