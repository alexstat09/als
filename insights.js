/* insights.js — cross-module intelligence engine
   Reads all localStorage modules and generates ranked insight objects.
   Exposes window.ALS.generateInsights() → sorted array of insight objects.
*/
(function () {
  'use strict';

  /* ── Helpers ──────────────────────────────────────────── */
  function todayKey() {
    const d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function keyDaysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function dawn() {
    const d = new Date();
    if (d.getHours() < 6) d.setDate(d.getDate() - 1);
    d.setHours(6, 0, 0, 0);
    return d;
  }

  function ls(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }

  function fmtNum(n, decimals = 1) {
    return Math.abs(n).toFixed(decimals);
  }

  function push(arr, module, type, icon, title, detail, score) {
    arr.push({ module, type, icon, title, detail, score });
  }

  /* ── Main generator ───────────────────────────────────── */
  function generateInsights() {
    const insights = [];
    const today = todayKey();
    const dawnTs = dawn();

    /* ════════════════════════════════════════════
       GOALS
    ════════════════════════════════════════════ */
    try {
      const goals = ls(`goals:${today}`) || [];
      const streak = ls('goal_streak_v1') || { count: 0 };
      if (goals.length > 0) {
        const done = goals.filter(g => g.done).length;
        const pct = Math.round((done / goals.length) * 100);
        if (pct === 100) {
          push(insights, 'goals', 'positive', '✓',
            'All goals complete today',
            `${done} of ${goals.length} done`, 82);
        } else if (pct >= 50) {
          push(insights, 'goals', 'info', '◎',
            `${pct}% of today's goals done`,
            `${done} of ${goals.length} complete`, 55);
        } else if (done === 0 && goals.length > 0 && new Date().getHours() >= 10) {
          push(insights, 'goals', 'warning', '○',
            'No goals checked off yet',
            `${goals.length} waiting — get started`, 72);
        } else {
          push(insights, 'goals', 'warning', '○',
            `${done}/${goals.length} goals done`,
            'Finish strong today', 60);
        }
      }
      if (streak.count >= 14) {
        push(insights, 'goals', 'positive', '🔥',
          `${streak.count}-day goal streak`,
          'Elite consistency — keep it locked', 88);
      } else if (streak.count >= 7) {
        push(insights, 'goals', 'positive', '🔥',
          `${streak.count}-day goal streak`,
          "You're building real momentum", 70);
      } else if (streak.count >= 3) {
        push(insights, 'goals', 'positive', '↑',
          `${streak.count}-day goal streak`,
          'Streak is growing', 52);
      }
    } catch (e) { /* skip module */ }

    /* ════════════════════════════════════════════
       FITNESS — WEIGHT
    ════════════════════════════════════════════ */
    try {
      const weights = ls('po_coach_weights') || [];
      if (weights.length >= 2) {
        const recent = weights.slice(-10);
        const last   = recent[recent.length - 1];
        const prev   = recent[0];
        const delta  = parseFloat((last.weight - prev.weight).toFixed(1));
        const unit   = last.unit || 'kg';
        const n      = recent.length - 1;
        const sign   = delta > 0 ? '+' : '';
        if (Math.abs(delta) >= 0.3) {
          push(insights, 'fitness', delta < 0 ? 'positive' : 'neutral',
            delta < 0 ? '↓' : '↑',
            `Weight ${delta < 0 ? 'down' : 'up'} ${sign}${fmtNum(delta)}${unit}`,
            `Across last ${n} weigh-ins`, 62);
        } else {
          push(insights, 'fitness', 'positive', '→',
            'Weight stable',
            `±${fmtNum(Math.abs(delta))}${unit} over ${n} entries`, 44);
        }

        // Trend direction using last 5 entries
        if (weights.length >= 5) {
          const t5 = weights.slice(-5);
          let up = 0, down = 0;
          for (let i = 1; i < t5.length; i++) {
            if (t5[i].weight > t5[i - 1].weight) up++;
            else if (t5[i].weight < t5[i - 1].weight) down++;
          }
          if (down >= 3) {
            push(insights, 'fitness', 'positive', '↓',
              'Consistent downward trend',
              `${down} of last 4 weigh-ins lower`, 58);
          } else if (up >= 3) {
            push(insights, 'fitness', 'neutral', '↑',
              'Consistent upward trend',
              `${up} of last 4 weigh-ins higher`, 48);
          }
        }
      } else if (weights.length === 0) {
        push(insights, 'fitness', 'info', '○',
          'No weight logged yet',
          'Start tracking in the Fitness tab', 30);
      }
    } catch (e) { /* skip */ }

    /* ════════════════════════════════════════════
       FITNESS — WORKOUT FREQUENCY
    ════════════════════════════════════════════ */
    try {
      let sessionsThisWeek = 0;
      let totalSetsThisWeek = 0;
      for (let i = 0; i < 7; i++) {
        const log = ls(`po_coach_logs:${keyDaysAgo(i)}`);
        if (log && log.length > 0) {
          sessionsThisWeek++;
          log.forEach(ex => { totalSetsThisWeek += (ex.sets || []).length; });
        }
      }
      if (sessionsThisWeek >= 5) {
        push(insights, 'fitness', 'positive', '◈',
          `${sessionsThisWeek} workouts this week`,
          `${totalSetsThisWeek} total sets — high volume`, 78);
      } else if (sessionsThisWeek >= 3) {
        push(insights, 'fitness', 'positive', '◎',
          `${sessionsThisWeek} workouts this week`,
          `${totalSetsThisWeek} sets logged`, 62);
      } else if (sessionsThisWeek === 0) {
        push(insights, 'fitness', 'warning', '○',
          'No workouts logged this week',
          'Time to move', 68);
      } else {
        push(insights, 'fitness', 'neutral', '◎',
          `${sessionsThisWeek} workout${sessionsThisWeek > 1 ? 's' : ''} this week`,
          'Hit 4+ for best progress', 46);
      }
    } catch (e) { /* skip */ }

    /* ════════════════════════════════════════════
       CAFFEINE
    ════════════════════════════════════════════ */
    try {
      const cafLogs = ls('caf:logs') || [];
      const cafToday = cafLogs.filter(l => {
        try { return new Date(l.ts) >= dawnTs; } catch { return false; }
      });
      const totalMg = cafToday.reduce((s, l) => s + (l.mg || 0), 0);
      const lateCaf = cafToday.some(l => {
        try { return new Date(l.ts).getHours() >= 14; } catch { return false; }
      });

      if (totalMg > 500) {
        push(insights, 'caffeine', 'warning', '⚡',
          `${totalMg}mg caffeine today`,
          'Very high — sleep quality at risk', 82);
      } else if (totalMg > 400) {
        push(insights, 'caffeine', 'warning', '⚡',
          `${totalMg}mg caffeine today`,
          'Over 400mg — consider cutting off', 72);
      } else if (lateCaf && new Date().getHours() >= 14) {
        push(insights, 'caffeine', 'warning', '⚡',
          'Caffeine logged after 2pm',
          `${totalMg}mg total — may affect sleep`, 66);
      } else if (totalMg > 0) {
        push(insights, 'caffeine', 'positive', '◎',
          `${totalMg}mg caffeine — on track`,
          'Within healthy range', 36);
      } else if (new Date().getHours() >= 9) {
        push(insights, 'caffeine', 'info', '◎',
          'No caffeine logged today',
          'Log in the Caffeine tab', 25);
      }
    } catch (e) { /* skip */ }

    /* ════════════════════════════════════════════
       NUTRITION
    ════════════════════════════════════════════ */
    try {
      const nutLogs    = ls('nut:logs') || [];
      const nutToday   = nutLogs.filter(l => {
        try { return new Date(l.ts) >= dawnTs; } catch { return false; }
      });
      const nutProfile = ls('nut:profile') || {};
      const nutHistory = ls('nut:history') || [];

      const kcalToday   = Math.round(nutToday.reduce((s, l) => s + (l.kcal || 0), 0));
      const proteinToday = Math.round(nutToday.reduce((s, l) => s + (l.p || 0), 0));

      if (nutProfile.weightKg) {
        const protTarget = Math.round(nutProfile.weightKg * 2);
        if (proteinToday >= protTarget * 0.9) {
          push(insights, 'nutrition', 'positive', '↑',
            `${proteinToday}g protein today`,
            `On track — target ~${protTarget}g`, 58);
        } else if (proteinToday >= protTarget * 0.5) {
          push(insights, 'nutrition', 'neutral', '◎',
            `${proteinToday}g protein so far`,
            `${protTarget - proteinToday}g still to go`, 48);
        } else if (kcalToday > 200) {
          push(insights, 'nutrition', 'warning', '↓',
            `Low protein today (${proteinToday}g)`,
            `Target ~${protTarget}g — prioritise protein`, 62);
        }
      }

      if (nutHistory.length >= 7) {
        const last7  = nutHistory.slice(-7);
        const avgCal = Math.round(last7.reduce((s, d) => s + (d.kcal || 0), 0) / last7.length);
        const avgProt = Math.round(last7.reduce((s, d) => s + (d.p || 0), 0) / last7.length);
        if (avgCal > 0) {
          push(insights, 'nutrition', 'info', '◈',
            `7-day avg: ${avgCal} kcal / ${avgProt}g protein`,
            'Rolling nutrition average', 42);
        }
      }
    } catch (e) { /* skip */ }

    /* ════════════════════════════════════════════
       HEALTH — SUPPLEMENTS
    ════════════════════════════════════════════ */
    try {
      const stack      = ls('stack:items') || [];
      const stackTaken = ls(`stack:taken:${today}`) || {};
      if (stack.length > 0) {
        const takenCount = Object.keys(stackTaken).length;
        const pct = Math.round((takenCount / stack.length) * 100);
        if (pct === 100) {
          push(insights, 'health', 'positive', '✓',
            'Full supplement stack taken',
            `All ${stack.length} items logged`, 54);
        } else if (takenCount > 0) {
          push(insights, 'health', 'neutral', '◎',
            `${takenCount}/${stack.length} supplements taken`,
            `${pct}% of stack complete`, 44);
        } else if (new Date().getHours() >= 9) {
          push(insights, 'health', 'warning', '○',
            'Supplements not yet logged',
            'Check your morning stack', 60);
        }
      }
    } catch (e) { /* skip */ }

    /* ════════════════════════════════════════════
       HEALTH — WATER
    ════════════════════════════════════════════ */
    try {
      const waterState = ls('po_water_v1') || {};
      if (waterState.logs) {
        const bottles   = waterState.logs[today] || 0;
        const bottleMl  = waterState.bottleMl || 500;
        const totalMl   = bottles * bottleMl;
        const targetMl  = 2500;
        const pct       = Math.round((totalMl / targetMl) * 100);
        if (totalMl >= targetMl) {
          push(insights, 'health', 'positive', '○',
            'Hydration goal hit',
            `${(totalMl / 1000).toFixed(1)}L today`, 50);
        } else if (bottles > 0) {
          const remaining = Math.ceil((targetMl - totalMl) / bottleMl);
          push(insights, 'health', 'info', '○',
            `${(totalMl / 1000).toFixed(1)}L hydration today`,
            `${remaining} more bottle${remaining !== 1 ? 's' : ''} to goal`, 38);
        }
      }
    } catch (e) { /* skip */ }

    /* ════════════════════════════════════════════
       IDEAS
    ════════════════════════════════════════════ */
    try {
      const ideas  = ls('ideas:items') || [];
      const active = ideas.filter(i => !i.done);
      const loggedToday = ideas.some(i => {
        try { return i.createdAt && new Date(i.createdAt) >= dawnTs; } catch { return false; }
      });
      if (loggedToday) {
        push(insights, 'ideas', 'positive', '◈',
          'Idea captured today',
          `${active.length} active idea${active.length !== 1 ? 's' : ''} in pipeline`, 46);
      } else if (active.length > 5) {
        push(insights, 'ideas', 'info', '◈',
          `${active.length} ideas waiting`,
          'Pipeline is stacked', 34);
      }
    } catch (e) { /* skip */ }

    /* ════════════════════════════════════════════
       FINANCE
    ════════════════════════════════════════════ */
    try {
      const sum = cat => (ls(`nw:${cat}`) || []).reduce((s, x) => s + (x.amount || 0), 0);
      const nwTotal = sum('bank') + sum('stocks') + sum('crypto') + sum('other');
      const currency = ls('nw_currency') || 'CHF';
      const activity = ls('nw:activity') || [];

      const week = 7 * 24 * 60 * 60 * 1000;
      const weekDelta = activity
        .filter(a => a.ts && Date.now() - a.ts < week)
        .reduce((s, a) => s + (a.delta || 0), 0);

      if (Math.abs(weekDelta) > 50) {
        const sign = weekDelta > 0 ? '+' : '';
        push(insights, 'finance', weekDelta > 0 ? 'positive' : 'warning',
          weekDelta > 0 ? '↑' : '↓',
          `Net worth ${weekDelta > 0 ? 'up' : 'down'} ${sign}${Math.round(weekDelta).toLocaleString()} ${currency}`,
          'Change this week', 68);
      } else if (nwTotal > 0) {
        push(insights, 'finance', 'info', '◈',
          `${currency} ${Math.round(nwTotal).toLocaleString()} net worth`,
          'Finance up to date', 32);
      }
    } catch (e) { /* skip */ }

    /* ════════════════════════════════════════════
       CROSS-MODULE CORRELATIONS
    ════════════════════════════════════════════ */
    try {
      const goals       = ls(`goals:${today}`) || [];
      const goalsDone   = goals.length > 0 && goals.every(g => g.done);
      const streak      = (ls('goal_streak_v1') || {}).count || 0;
      const weights     = ls('po_coach_weights') || [];

      // Count sessions
      let sessions = 0;
      for (let i = 0; i < 7; i++) {
        const log = ls(`po_coach_logs:${keyDaysAgo(i)}`);
        if (log && log.length > 0) sessions++;
      }

      // Locked-in week: goals done + 4+ workouts + streak
      if (goalsDone && sessions >= 4 && streak >= 3) {
        push(insights, 'cross', 'positive', '◈',
          'Locked-in week',
          `Goals ✓ · ${sessions} workouts · ${streak}-day streak`, 96);
      }

      // Cafeine + weight cross-signal
      const cafLogs   = ls('caf:logs') || [];
      const cafToday  = cafLogs.filter(l => {
        try { return new Date(l.ts) >= dawnTs; } catch { return false; }
      });
      const totalCafMg = cafToday.reduce((s, l) => s + (l.mg || 0), 0);

      if (sessions >= 4 && totalCafMg <= 200 && weights.length >= 3) {
        push(insights, 'cross', 'positive', '◈',
          'Low caffeine + high training week',
          'Good signal for sleep & recovery', 74);
      }

      // High volume week
      let totalSets = 0;
      for (let i = 0; i < 7; i++) {
        const log = ls(`po_coach_logs:${keyDaysAgo(i)}`);
        if (log) log.forEach(ex => { totalSets += (ex.sets || []).length; });
      }
      if (totalSets >= 60) {
        push(insights, 'cross', 'positive', '↑',
          `High volume week — ${totalSets} sets`,
          'Top-end training load', 72);
      }
    } catch (e) { /* skip */ }

    /* ── Sort by score, return top results ───────────────── */
    insights.sort((a, b) => b.score - a.score);
    return insights;
  }

  window.ALS = window.ALS || {};
  window.ALS.generateInsights = generateInsights;
})();
