/* tests/sleep-inbox.test.js — her watch's night, from Garmin's JSON to the row
   sleep.html reads.

   Guards the three things that would quietly corrupt her sleep history:
     1. The LOCAL-timestamp trap. Garmin's *Local fields are epoch-ms already
        shifted into her timezone. Read them with local getters on a UTC server
        and a 00:39 bedtime silently becomes 03:39 — wrong, plausible, and
        invisible until someone compares against the watch.
     2. Stage mislabelling. activityLevel 0/1/2/3 → deep/light/rem/awake is
        asserted against the DTO's own totals, so a Garmin remap can't silently
        relabel her deep sleep as light.
     3. Merge precedence. Two legs feed sleep:inbox (Garmin + intervals.icu).
        A null from the rich leg must NEVER erase a real value from the poor
        one, and nights already delivered must survive a tick that doesn't
        re-fetch them.

   The fixture is her real 2026-07-22 night, reduced to the fields under test —
   the raw file stays out of git because it is her health data.

   node tests/sleep-inbox.test.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const garmin = require('../api/_garmin.js');

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; console.log('  ✓ ' + name); }
  else { fail++; console.log('  ✗ ' + name + (extra ? '  → ' + extra : '')); }
}
function eq(name, got, want) {
  ok(name, JSON.stringify(got) === JSON.stringify(want),
    'got ' + JSON.stringify(got) + ', want ' + JSON.stringify(want));
}

/* ── fixture: her real night, 22 July 2026 (Athens, UTC+3) ───────── */
function night() {
  return {
    dailySleepDTO: {
      calendarDate: '2026-07-22',
      sleepTimeSeconds: 24420,
      sleepStartTimestampGMT: 1784669990000,
      sleepEndTimestampGMT: 1784694410000,
      sleepStartTimestampLocal: 1784680790000,
      sleepEndTimestampLocal: 1784705210000,
      deepSleepSeconds: 2940, lightSleepSeconds: 17040, remSleepSeconds: 4440, awakeSleepSeconds: 0,
      averageRespirationValue: 16, lowestRespirationValue: 9,
      awakeCount: 0, avgSleepStress: 14, avgHeartRate: 51,
      sleepScores: { overall: { value: 80, qualifierKey: 'GOOD' } }
    },
    sleepLevels: [
      { startGMT: '2026-07-21T21:39:50.0', endGMT: '2026-07-21T21:49:50.0', activityLevel: 1 },
      { startGMT: '2026-07-21T21:49:50.0', endGMT: '2026-07-21T22:06:50.0', activityLevel: 0 },
      { startGMT: '2026-07-21T22:06:50.0', endGMT: '2026-07-21T22:31:50.0', activityLevel: 1 },
      { startGMT: '2026-07-22T04:56:50.0', endGMT: '2026-07-22T05:18:50.0', activityLevel: 2 }
    ],
    restlessMomentsCount: 35, avgOvernightHrv: 54, hrvStatus: 'BALANCED',
    restingHeartRate: 45, bodyBatteryChange: 63
  };
}

/* ── 1. the shape, against what the Garmin app itself displayed ──── */
{
  const it = garmin._shape(night());
  eq('dateKey', it.dateKey, '2026-07-22');
  eq('asleep hours', it.asleepMeasured, 6.78);
  eq('bedtime is her LOCAL 00:39, not the server\'s idea of it', it.bedMeasured, '00:39');
  eq('wake is her LOCAL 07:26', it.wakeMeasured, '07:26');
  eq('stages in minutes', it.stages, { deep: 49, light: 284, rem: 74, awake: 0 });
  eq('restless moments', it.restless, 35);
  eq('avg overnight HR', it.overnightHR, 51);
  eq('resting HR', it.restingHR, 45);
  eq('HRV', it.hrv, 54);
  eq('respiration', [it.resp, it.respLow], [16, 9]);
  eq('body battery change', it.bodyBattery, 63);
  eq('Garmin score is carried for comparison only', it.garminScore, 80);
  eq('provenance', it.measuredBy, 'garmin');
  ok('SpO2 absent on her watch stays null, not 0', it.spo2 === null, String(it.spo2));

  // The hypnogram is [offsetFromSleepStart, durationMin, stage].
  eq('hypnogram segments', it.hypno.length, 4);
  eq('first segment starts at offset 0', it.hypno[0], [0, 10, 'light']);
  eq('activityLevel 0 is DEEP, not light', it.hypno[1][2], 'deep');
  eq('activityLevel 2 is REM', it.hypno[3][2], 'rem');
  eq('a late-night REM block keeps its real offset', it.hypno[3][0], 437);
}

/* ── 2. the timezone trap, made explicit ─────────────────────────── */
{
  // Same instant, a watch in UTC+0. If the code were applying the offset itself
  // instead of trusting Garmin's pre-shifted field, these two would come out
  // identical — and one of them would be wrong.
  const n = night();
  n.dailySleepDTO.sleepStartTimestampLocal = n.dailySleepDTO.sleepStartTimestampGMT;
  n.dailySleepDTO.sleepEndTimestampLocal = n.dailySleepDTO.sleepEndTimestampGMT;
  const it = garmin._shape(n);
  eq('UTC+0 watch reads 21:39', it.bedMeasured, '21:39');
  ok('and differs from the UTC+3 reading', it.bedMeasured !== '00:39');
}

/* ── 3. a night with no measured sleep is not published ──────────── */
{
  const n = night();
  n.dailySleepDTO.sleepTimeSeconds = 0;
  ok('zero-sleep night is dropped rather than overwriting a real reading',
    garmin._shape(n) === null);
  ok('a malformed payload is dropped, not thrown', garmin._shape({}) === null);
}

/* ── 4. merge precedence, lifted out of the courier ──────────────── */
{
  const SRC = fs.readFileSync(path.join(__dirname, '..', 'api', 'run-reminders.js'), 'utf8');
  const m = SRC.match(/function mergeInto\(map, items, tag\)[\s\S]*?\n\}/);
  if (!m) { fail++; console.log('  ✗ could not find mergeInto in run-reminders.js'); }
  else {
    const sandbox = {};
    vm.createContext(sandbox);
    vm.runInContext(m[0] + '; this.mergeInto = mergeInto;', sandbox);
    const mergeInto = sandbox.mergeInto;

    const icu = [{ dateKey: '2026-07-22', asleepMeasured: 6.5, restingHR: 45, hrv: 54, garminScore: 80 }];
    const rich = [{ dateKey: '2026-07-22', asleepMeasured: 6.78, bedMeasured: '00:39', wakeMeasured: '07:26', spo2: null }];

    const map = {};
    mergeInto(map, icu, null);
    mergeInto(map, rich, 'garmin');
    const out = map['2026-07-22'];

    eq('the watch\'s precise duration beats the intervals estimate', out.asleepMeasured, 6.78);
    eq('intervals values with no rich equivalent survive', out.hrv, 54);
    ok('a null from the rich leg does not erase anything', !('spo2' in out) || out.spo2 !== null);
    eq('bedtime arrives', out.bedMeasured, '00:39');
    eq('provenance is stamped', out.measuredBy, 'garmin');

    // Carry-forward: a night the rich leg no longer re-fetches must persist.
    const map2 = {};
    mergeInto(map2, [{ dateKey: '2026-07-20', asleepMeasured: 7.1, bedMeasured: '23:50' }], 'garmin');
    mergeInto(map2, [{ dateKey: '2026-07-20', asleepMeasured: 7.0 }], null);
    ok('an already-delivered Garmin night is not downgraded by intervals later in the tick',
      map2['2026-07-20'].bedMeasured === '23:50');
  }
}

console.log('\n' + pass + ' passed, ' + fail + ' failed\n');
process.exit(fail ? 1 : 0);
