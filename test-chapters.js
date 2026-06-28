// jsc self-test for chapters-engine.js  (run: jsc test-chapters.js)
var window = {}; var localStorage = { getItem: function () { return null; } };
load('chapters-engine.js');
var CH = window.ALSChapters;

function pad(n){ return String(n).padStart(2,'0'); }
function mkDate(base, n){ var d=new Date(base+'T00:00:00'); d.setDate(d.getDate()+n); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
function todayKey(){ var d=new Date(); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
// anchor everything so the latest point is ~today (Now/recent logic sees it)
function startNDaysAgo(n){ return mkDate(todayKey(), -n); }

var fails=0, tests=0;
function ok(name, cond){ tests++; if(!cond){ fails++; print('  ✗ FAIL: '+name); } else { print('  ✓ '+name); } }
function keys(res){ return res.chapters.map(function(c){return c.key;}); }
function has(res,k){ return keys(res).indexOf(k)>-1; }
function count(res,k){ return keys(res).filter(function(x){return x===k;}).length; }

// ── 1. NOISE: flat weight + sparse no-PR workouts → no cut/build ──
(function(){
  print('\n[1] noise → no phantom phases');
  var base=startNDaysAgo(70); var weights=[], workouts=[], rec=[];
  var seed=42; function rnd(){ seed=(seed*1103515245+12345)&0x7fffffff; return (seed/0x7fffffff); }
  for(var i=0;i<70;i+=3){ weights.push({dateKey:mkDate(base,i), weight:75 + (rnd()-0.5)*0.5}); }
  // a couple sparse workouts, far apart, no PRs (avoid streak/return noise)
  workouts.push({date:mkDate(base,5), volume:3000, prs:[]});
  workouts.push({date:mkDate(base,9), volume:3100, prs:[]});
  var res=CH.compute({weights:weights, workouts:workouts, recovery:rec, goalStreak:0, northStar:null});
  ok('hasEnough', res.hasEnough===true);
  ok('no cut', !has(res,'cut'));
  ok('no build', !has(res,'build'));
  ok('no surge', !has(res,'surge'));
  ok('genesis first', res.chapters[0].key==='genesis');
  ok('now last', res.chapters[res.chapters.length-1].key==='now');
})();

// ── 2. REAL CUT: 80→74 over 12 weeks, weekly weigh-ins ───────────
(function(){
  print('\n[2] real cut → cut chapter');
  var base=startNDaysAgo(84); var weights=[];
  for(var w=0;w<=12;w++){ weights.push({dateKey:mkDate(base, w*7), weight: 80 - w*0.5}); }
  var res=CH.compute({weights:weights, workouts:[], recovery:[], goalStreak:0, northStar:null});
  ok('has cut', has(res,'cut'));
  ok('no build', !has(res,'build'));
  var cut=res.chapters.filter(function(c){return c.key==='cut';})[0];
  ok('cut net negative', cut && /\-/.test(cut.stat.value));
  ok('cut has spark', cut && cut.spark && cut.spark.kind==='curve');
})();

// ── 3. CUT then BUILD → both, chronological ──────────────────────
(function(){
  print('\n[3] cut then build → ordered');
  var base=startNDaysAgo(140); var weights=[];
  for(var w=0;w<=12;w++) weights.push({dateKey:mkDate(base, w*7), weight: 80 - w*0.5});   // cut to 74
  for(var b=1;b<=8;b++)  weights.push({dateKey:mkDate(base, (12+b)*7), weight: 74 + b*0.5}); // build to 78
  var res=CH.compute({weights:weights, workouts:[], recovery:[], goalStreak:0, northStar:null});
  ok('has cut', has(res,'cut'));
  ok('has build', has(res,'build'));
  var ks=keys(res); ok('cut before build', ks.indexOf('cut') < ks.indexOf('build'));
  ok('genesis..now bookends', ks[0]==='genesis' && ks[ks.length-1]==='now');
})();

// ── 4. PR CLUSTER → surge ────────────────────────────────────────
(function(){
  print('\n[4] PR cluster → surge');
  var base=startNDaysAgo(40); var workouts=[];
  // spread weekly workouts; 4 PRs inside a 3-week window
  for(var i=0;i<6;i++) workouts.push({date:mkDate(base, i*7), volume:5000, prs: (i>=1&&i<=4)?['pr']:[]});
  var res=CH.compute({weights:[], workouts:workouts, recovery:[], goalStreak:0, northStar:null});
  ok('has surge', has(res,'surge'));
  var sg=res.chapters.filter(function(c){return c.key==='surge';})[0];
  ok('surge counts PRs', sg && sg.stat.value===4);
})();

// ── 5. COMEBACK gap → return ─────────────────────────────────────
(function(){
  print('\n[5] gap then resume → return');
  var base=startNDaysAgo(33); var workouts=[];
  workouts.push({date:mkDate(base,0), volume:4000, prs:[]});
  workouts.push({date:mkDate(base,3), volume:4000, prs:[]});
  workouts.push({date:mkDate(base,6), volume:4000, prs:[]});
  // 21-day gap (day 6 → day 27)
  workouts.push({date:mkDate(base,27), volume:4000, prs:[]});
  workouts.push({date:mkDate(base,30), volume:4000, prs:[]});
  workouts.push({date:mkDate(base,33), volume:4000, prs:[]});
  var res=CH.compute({weights:[], workouts:workouts, recovery:[], goalStreak:0, northStar:null});
  ok('has return', has(res,'return'));
  var rt=res.chapters.filter(function(c){return c.key==='return';})[0];
  ok('return gap >=14', rt && rt.stat.value>=14);
})();

// ── 6. INSUFFICIENT → hasEnough false ────────────────────────────
(function(){
  print('\n[6] too little data → hasEnough false');
  var base=startNDaysAgo(4);
  var res=CH.compute({weights:[{dateKey:mkDate(base,0),weight:75},{dateKey:mkDate(base,2),weight:75}], workouts:[], recovery:[], goalStreak:0, northStar:null});
  ok('hasEnough false', res.hasEnough===false);
  ok('no chapters', res.chapters.length===0);
})();

// ── 7. NORTH STAR passthrough + numbering + cap ──────────────────
(function(){
  print('\n[7] northStar + numbering + cap');
  var base=startNDaysAgo(220); var weights=[], workouts=[];
  for(var w=0;w<=12;w++) weights.push({dateKey:mkDate(base, w*7), weight: 80 - w*0.5});
  for(var b=1;b<=10;b++)  weights.push({dateKey:mkDate(base, (12+b)*7), weight: 74 + b*0.6});
  for(var i=0;i<26;i++) workouts.push({date:mkDate(base, i*7), volume:5000, prs:(i>=2&&i<=6)?['pr']:[]});
  var res=CH.compute({weights:weights, workouts:workouts, recovery:[], goalStreak:5, northStar:{statement:'a person who keeps promises to himself'}});
  ok('northStar passed', res.northStar && /promises/.test(res.northStar.statement));
  ok('cap <=6', res.chapters.length<=6);
  var nums=res.chapters.map(function(c){return c.n;});
  var seq=true; for(var k=0;k<nums.length;k++){ if(nums[k]!==k+1) seq=false; }
  ok('numbered 1..N', seq);
  ok('genesis first & now last', res.chapters[0].key==='genesis' && res.chapters[res.chapters.length-1].key==='now');
})();

print('\n──────────────────────────────');
print(fails===0 ? ('ALL CHAPTERS TESTS PASS ('+tests+')') : (fails+' / '+tests+' FAILED'));
quit(fails===0?0:1);
