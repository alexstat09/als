/* xp.js — Jarvis Gamification Engine
   Computes XP, level, milestones and week-vs-week score
   purely from existing localStorage data. No per-page changes needed. */
(function () {
  'use strict';
  window.ALS = window.ALS || {};

  // ── Level table ───────────────────────────────────────
  const LEVELS = [
    { n: 1, min: 0,    title: 'Recruit',    color: '#76746E' },
    { n: 2, min: 150,  title: 'Operative',  color: '#7DD3FC' },
    { n: 3, min: 400,  title: 'Agent',      color: '#7CB87A' },
    { n: 4, min: 800,  title: 'Specialist', color: '#F2C063' },
    { n: 5, min: 1400, title: 'Commander',  color: '#C084FC' },
    { n: 6, min: 2200, title: 'Director',   color: '#FB923C' },
    { n: 7, min: 3200, title: 'Phantom',    color: '#38BDF8' },
    { n: 8, min: 4500, title: 'Legend',     color: '#6EE7B7' },
  ];

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

  // ── XP formula ────────────────────────────────────────
  function computeXP(d) {
    let xp = 0;
    xp += d.totalDone    * 8;   // 8 XP per goal completed
    xp += d.perfectDays  * 20;  // +20 bonus per perfect day
    xp += d.weightLogs   * 4;   // 4 XP per weigh-in
    xp += d.workoutDays  * 15;  // 15 XP per workout day logged
    xp += d.nutritionDays * 10; // 10 XP per nutrition day tracked
    // Streak bonuses (additive tiers)
    if (d.streak >= 100) xp += 500;
    else if (d.streak >= 30) xp += 200;
    else if (d.streak >= 14) xp += 100;
    else if (d.streak >= 7)  xp += 50;
    else if (d.streak >= 3)  xp += 20;
    return Math.round(xp);
  }

  // ── Level info from XP ────────────────────────────────
  function getLevelInfo(xp) {
    let cur = LEVELS[0];
    for (const l of LEVELS) {
      if (xp >= l.min) cur = l; else break;
    }
    const idx  = LEVELS.indexOf(cur);
    const next = LEVELS[idx + 1] || null;
    return {
      level:    cur.n,
      title:    cur.title,
      color:    cur.color,
      xp,
      xpMin:    cur.min,
      xpNext:   next ? next.min : cur.min,
      xpToNext: next ? next.min - xp : 0,
      progress: next ? (xp - cur.min) / (next.min - cur.min) : 1,
      isMax:    !next,
      nextTitle: next ? next.title : null,
    };
  }

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
  window.ALS.XP = {
    compute() {
      const data      = collectData();
      const xp        = computeXP(data);
      const level     = getLevelInfo(xp);
      const milestones = MILESTONES.map(m => ({ ...m, unlocked: m.check(data) }));
      const thisWeek  = getWeekData(0);
      const lastWeek  = getWeekData(-1);
      return { data, level, milestones, thisWeek, lastWeek };
    },
  };
})();
