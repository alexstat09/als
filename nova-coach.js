/* ════════════════════════════════════════════════════════════════
   Nova Coach — Nova reads ALL your data (training, body, nutrition,
   supplements) and gives a prioritised, personal briefing. Tap any Nova
   avatar (#nova / #novaFab / [data-nova]) to open it. Read-only; never
   writes or changes your data. Self-contained: injects its own styles +
   panel and works on every page that includes this script.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.NovaCoach) return;

  function ls(k,d){ try{ var v=JSON.parse(localStorage.getItem(k)); return v==null?d:v; }catch(e){ return d; } }
  function pad(n){ return String(n).padStart(2,'0'); }
  function dk(d){ d=d||new Date(); return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function e1rm(w,r){ return (+w||0)*(1+(+r||0)/30); }
  function dawn(){ var d=new Date(); d.setHours(0,0,0,0); return d; }
  function suppDayKey(){ var n=new Date(); if(n.getHours()<6) n.setDate(n.getDate()-1); return dk(n); }
  function weekStartKey(){ var t=new Date(); t.setHours(0,0,0,0); var dow=(t.getDay()+6)%7; var s=new Date(t); s.setDate(t.getDate()-dow); return dk(s); }

  var MT={Chest:14,Back:16,Shoulders:12,Arms:12,Legs:18,Core:9};

  /* Recovery score — mirrors sleep.html so Nova reads the same number */
  function clampN(v,a,b){ return Math.max(a, Math.min(b, v)); }
  var RECOMP=[
    {key:'hours',w:0.30,s:function(v){return clampN(100-Math.abs(v-8.5)*13,0,100);}},
    {key:'quality',w:0.20,s:function(v){return (v-1)/4*100;}},
    {key:'soreness',w:0.18,s:function(v){return (5-v)/4*100;}},
    {key:'energy',w:0.14,s:function(v){return (v-1)/4*100;}},
    {key:'stress',w:0.10,s:function(v){return (5-v)/4*100;}},
    {key:'mood',w:0.08,s:function(v){return (v-1)/4*100;}}
  ];
  function recoveryScore(e){
    if(!e) return null; var sum=0,wsum=0;
    RECOMP.forEach(function(c){ var v=e[c.key]; if(v==null||(c.key==='hours'&&!(v>0))) return; sum+=clampN(c.s(v),0,100)*c.w; wsum+=c.w; });
    return wsum ? Math.round(sum/wsum) : null;
  }

  function stalledLift(workouts, exMap){
    var byEx={};
    workouts.slice().sort(function(a,b){return (a.startedAt||'')<(b.startedAt||'')?-1:1;}).forEach(function(w){
      (w.entries||[]).forEach(function(en){
        var best=0; (en.sets||[]).forEach(function(s){ var v=e1rm(s.kg,s.reps); if(v>best)best=v; });
        if(best>0){ (byEx[en.exId]=byEx[en.exId]||[]).push(best); }
      });
    });
    var cand=null;
    Object.keys(byEx).forEach(function(id){
      var a=byEx[id]; if(a.length>=4){
        var recent=Math.max(a[a.length-1],a[a.length-2],a[a.length-3]);
        var before=Math.max.apply(null,a.slice(0,a.length-3));
        if(recent<=before+0.01){ if(!cand||a.length>cand.n) cand={id:id,n:a.length}; }
      }
    });
    return cand ? ((exMap[cand.id]||{}).name||cand.id) : null;
  }

  /* ════════ CROSS-DOMAIN CORRELATIONS — the magic ════════
     Aligns every domain by day, then surfaces ONLY patterns with
     enough data and a real effect. Never invents a trend. */
  function pearson(xs, ys){
    var n=xs.length; if(n<3) return 0;
    var sx=0,sy=0,sxx=0,syy=0,sxy=0;
    for(var i=0;i<n;i++){ sx+=xs[i]; sy+=ys[i]; sxx+=xs[i]*xs[i]; syy+=ys[i]*ys[i]; sxy+=xs[i]*ys[i]; }
    var cov=sxy-sx*sy/n, vx=sxx-sx*sx/n, vy=syy-sy*sy/n;
    if(vx<=0||vy<=0) return 0;
    return cov/Math.sqrt(vx*vy);
  }
  function avg(a){ return a.length ? a.reduce(function(s,v){return s+v;},0)/a.length : 0; }
  /* Compare two groups; return means only if the effect is large enough
     (Cohen's d) and both groups are big enough — so random noise on small
     samples never reads as a real pattern. */
  function groupSig(A, B, minN, minD){
    if(A.length<minN || B.length<minN) return null;
    var a=avg(A), b=avg(B);
    function vv(arr,m){ if(arr.length<2) return 0; var s=0; for(var i=0;i<arr.length;i++){ var x=arr[i]-m; s+=x*x; } return s/(arr.length-1); }
    var sp=Math.sqrt(((A.length-1)*vv(A,a)+(B.length-1)*vv(B,b))/Math.max(1,A.length+B.length-2));
    var d = sp>0 ? (a-b)/sp : (a===b?0:(a>b?9:-9));
    if(Math.abs(d)<minD) return null;
    return { a:a, b:b, d:d };
  }
  function addDays(key, n){ var p=key.split('-').map(Number); var d=new Date(p[0],p[1]-1,p[2]); d.setDate(d.getDate()+n); return dk(d); }
  function isoWeek(key){
    var p=key.split('-').map(Number); var d=new Date(Date.UTC(p[0],p[1]-1,p[2]));
    var day=(d.getUTCDay()+6)%7; d.setUTCDate(d.getUTCDate()-day+3);
    var firstThu=new Date(Date.UTC(d.getUTCFullYear(),0,4));
    var wk=1+Math.round(((d-firstThu)/86400000 - 3 + ((firstThu.getUTCDay()+6)%7))/7);
    return d.getUTCFullYear()+'-W'+pad(wk);
  }

  function proteinTarget(){ return Math.round((((ls('po_water_v1',{})||{}).profile||{}).weightKg||75)*2); }

  /* One record per day, every domain aligned by date key. */
  function dayRecords(){
    var byDay={};
    function rec(k){ return byDay[k]||(byDay[k]={key:k}); }
    (ls('sleep:logs',[])||[]).forEach(function(e){ if(!e||!e.dateKey) return; var r=rec(e.dateKey);
      if(e.hours>0) r.sleepHours=e.hours; if(e.quality!=null) r.sleepQuality=e.quality; if(e.energy!=null) r.energy=e.energy;
      var rv=(e.recovery!=null)?e.recovery:recoveryScore(e); if(rv!=null) r.recovery=rv; });
    (ls('po_coach_weights',[])||[]).forEach(function(e){ if(e&&e.dateKey&&typeof e.weight==='number') rec(e.dateKey).weight=e.weight; });
    (ls('po_workouts',[])||[]).forEach(function(w){ if(!w||!w.date) return; var r=rec(w.date); r.trained=true; r.volume=(r.volume||0)+(w.volume||0); if(w.prs&&w.prs.length) r.pr=true; });
    (ls('nut:logs',[])||[]).forEach(function(l){ if(!l||(!l.ts&&!l.dateKey)) return; var r=rec(l.dateKey || dk(new Date(l.ts))); r.protein=(r.protein||0)+(l.p||0); r.kcal=(r.kcal||0)+(l.kcal||0); });
    (ls('caf:logs',[])||[]).forEach(function(l){ if(!l||!l.ts) return; var d=new Date(l.ts); var r=rec(dk(d)); r.caf=(r.caf||0)+(l.mg||0); if(d.getHours()>=16) r.cafLate=(r.cafLate||0)+(l.mg||0); });
    return byDay;
  }

  function correlations(){
    var byDay=dayRecords();
    var keys=Object.keys(byDay).sort();
    var out=[];

    // 1) Late caffeine (after 4pm) → next morning's sleep quality
    (function(){
      var withLate=[], without=[];
      keys.forEach(function(k){ var next=byDay[addDays(k,1)]; if(!next || next.sleepQuality==null) return;
        ((byDay[k].cafLate||0)>=80 ? withLate : without).push(next.sleepQuality); });
      var g1=groupSig(withLate, without, 4, 0.7);
      if(g1 && (g1.b-g1.a)>=0.5) out.push({strength:Math.min(0.92,0.74+(g1.b-g1.a)*0.06), tone:'warn',
          title:'Late caffeine is costing you sleep',
          detail:'After caffeine past 4pm your sleep quality averages '+g1.a.toFixed(1)+'/5, versus '+g1.b.toFixed(1)+'/5 on clean nights. Keep coffee to the morning and you sleep — and lift — better.',
          line:'I spotted it: caffeine after 4pm drops your sleep to '+g1.a.toFixed(1)+'/5 (vs '+g1.b.toFixed(1)+'). Keep the coffee to mornings.', href:'sleep.html'});
    })();

    // 2) Recovery → training volume (same-day)
    (function(){
      var xs=[], ys=[];
      keys.forEach(function(k){ var r=byDay[k]; if(r.trained && r.recovery!=null && r.volume>0){ xs.push(r.recovery); ys.push(r.volume); } });
      if(xs.length>=16){ var rr=pearson(xs,ys);
        if(rr>=0.7) out.push({strength:0.55+rr*0.25, tone:'good',
          title:'You train harder when you’re recovered',
          detail:'Across '+xs.length+' sessions your training volume climbs with your recovery score. Protect your sleep and the hard work follows on its own.',
          line:'Your biggest sessions follow your best-recovered mornings — sleep is quietly driving your gains.', href:'sleep.html'}); }
    })();

    // 3) PR days vs ordinary sessions — recovery gap
    (function(){
      var prRec=[], otherRec=[];
      keys.forEach(function(k){ var r=byDay[k]; if(!r.trained||r.recovery==null) return; (r.pr?prRec:otherRec).push(r.recovery); });
      var g3=groupSig(prRec, otherRec, 6, 1.2);
      if(g3 && (g3.a-g3.b)>=14 && otherRec.length>=10) out.push({strength:0.8, tone:'good',
          title:'Your PRs land on well-rested days',
          detail:'On days you set a PR, recovery averaged '+Math.round(g3.a)+'/100 — versus '+Math.round(g3.b)+' on your other sessions. Wake up recovered? That’s the day to chase a record.',
          line:'Your PRs come on your well-rested days (recovery '+Math.round(g3.a)+' vs '+Math.round(g3.b)+'). Big lift coming? Sleep first.', href:'sleep.html'});
    })();

    // 4) Protein → weekly weight change (recomp signal). Uses each week's
    //    AVERAGE weight (smooths daily scale noise) and the change vs the
    //    previous qualified week, so a real trend — not jitter — is needed.
    (function(){
      var wk={}, target=proteinTarget();
      keys.forEach(function(k){ var w=isoWeek(k); var o=wk[w]||(wk[w]={prot:[], wts:[]});
        if(byDay[k].protein>0) o.prot.push(byDay[k].protein); if(byDay[k].weight!=null) o.wts.push(byDay[k].weight); });
      var summary=[];
      Object.keys(wk).sort().forEach(function(w){ var o=wk[w]; if(o.prot.length>=3 && o.wts.length>=3) summary.push({prot:avg(o.prot), wt:avg(o.wts)}); });
      var hit=[], miss=[];
      for(var i=1;i<summary.length;i++){ var change=summary[i].wt - summary[i-1].wt;
        (summary[i].prot>=target*0.9 ? hit : miss).push(change); }
      var g4=groupSig(hit, miss, 5, 1.2);
      if(g4 && (g4.b-g4.a)>=0.3) out.push({strength:0.62, tone:'good',
          title:'Protein weeks are leaner weeks',
          detail:'In weeks you average ~'+target+'g protein your weight moves '+g4.a.toFixed(1)+'kg week-on-week; in weeks you don’t, '+(g4.b>0?'+':'')+g4.b.toFixed(1)+'kg. Protein is doing the recomp.',
          line:'When you hit your protein, your weight trends down ('+g4.a.toFixed(1)+'kg/wk vs '+(g4.b>0?'+':'')+g4.b.toFixed(1)+'). Keep loading it.', href:'nutrition.html'});
    })();

    // 5) Sleep hours → morning energy
    (function(){
      var xs=[], ys=[];
      keys.forEach(function(k){ var r=byDay[k]; if(r.sleepHours>0 && r.energy!=null){ xs.push(r.sleepHours); ys.push(r.energy); } });
      if(xs.length>=16){ var rr=pearson(xs,ys);
        if(rr>=0.7) out.push({strength:0.5+rr*0.2, tone:'info',
          title:'More sleep, more energy',
          detail:'Your morning energy tracks your sleep across '+xs.length+' mornings. The nights you get a real 8h, the next day feels it.',
          line:'The pattern’s clear — more sleep, more energy the next day. Protect that bedtime.', href:'sleep.html'}); }
    })();

    out.sort(function(a,b){ return b.strength-a.strength; });
    return out;
  }

  /* ════════ WEEKLY LETTER FROM NOVA — memory & reflection ════════ */
  function weeklyLetter(){
    var byDay=dayRecords();
    var today=new Date(), keys=[];
    for(var i=6;i>=0;i--){ var d=new Date(today); d.setDate(d.getDate()-i); keys.push(dk(d)); }
    var workoutsN=0, vol=0, prs=0, recVals=[], sleepVals=[], protVals=[], days=0;
    keys.forEach(function(k){ var r=byDay[k]; if(!r) return; days++;
      if(r.trained){ workoutsN++; vol+=r.volume||0; } if(r.pr) prs++;
      if(r.recovery!=null) recVals.push(r.recovery); if(r.sleepHours>0) sleepVals.push(r.sleepHours); if(r.protein>0) protVals.push(r.protein); });
    var _hasIdentity = ((ls('habits:list',[])||[]).length>0) || !!((ls('identity:northstar',{})||{}).statement);
    if(workoutsN===0 && !recVals.length && !sleepVals.length && !_hasIdentity) return null; // nothing to reflect on yet

    // weight change across the window (first vs last logged inside it)
    var inWin=keys.map(function(k){ return byDay[k]&&byDay[k].weight!=null ? {k:k,w:byDay[k].weight} : null; }).filter(Boolean);
    var wDelta=(inWin.length>=2) ? (inWin[inWin.length-1].w - inWin[0].w) : null;

    var u=(ls('po_coach_v1',{})||{}).units||'kg';
    var lines=[];
    if(workoutsN) lines.push('You trained '+workoutsN+' time'+(workoutsN>1?'s':'')+' and moved '+Math.round(vol).toLocaleString()+' '+u+' of total volume'+(prs?' — with '+prs+' new PR'+(prs>1?'s':''):'')+'. '+(prs?'That’s real, measurable progress.':'Consistency like that is what compounds.'));
    else lines.push('No sessions logged this week. No guilt — just get one in. Momentum is easier to keep than to rebuild.');
    if(sleepVals.length) lines.push('You averaged '+avg(sleepVals).toFixed(1)+'h of sleep'+(recVals.length?' and a recovery score of '+Math.round(avg(recVals))+'/100':'')+'. '+(avg(sleepVals)>=8?'That’s the foundation everything else is built on — keep it.':'A little more sleep is the cheapest gain available to you.'));
    if(wDelta!=null && Math.abs(wDelta)>=0.1) lines.push('Your weight '+(wDelta<0?'came down ':'ticked up ')+Math.abs(wDelta).toFixed(1)+' '+u+' this week'+(protVals.length?', on ~'+Math.round(avg(protVals))+'g protein a day':'')+'. '+(wDelta<0?'Recomp is working — lean out, hold the muscle.':'Fine if you meant to; worth a glance if not.'));
    // Habits consistency this week
    var hbList=ls('habits:list',[])||[], hbLog=ls('habits:log',{})||{};
    if(hbList.length){ var hbDays=0, comp=0; keys.forEach(function(k){ if(hbLog[k] && Object.keys(hbLog[k]).length){ hbDays++; comp+=Object.keys(hbLog[k]).length; } });
      lines.push('On your habits, you showed up '+hbDays+' of 7 days ('+comp+' done). '+(hbDays>=5?'That consistency is the whole game.':'Aim to close them daily — that is where identity is built.')); }
    // North Star reminder
    var ns=ls('identity:northstar',{})||{};
    if(ns && ns.statement) lines.push('And remember who you’re becoming: '+ns.statement+'. Everything above was a vote for that.');
    // Something you told me to remember — proof I'm actually listening across time.
    var mem=ls('nova:memory',[]); if(Array.isArray(mem)){ var facts=mem.filter(function(m){return m&&m.fact;}); if(facts.length){ var f=facts[facts.length-1].fact; lines.push('I haven’t forgotten what you told me: '+f+'. I’m keeping it in mind for you.'); } }
    lines.push('You’re 17 and building the body — and the discipline — most people never do. I’m watching it happen. Let’s make next week even better.');
    return { title:'Your week, from Nova', body:lines, line:'I wrote you a letter about your week — tap to read it.' };
  }

  function todaysGoals(){
    var g=ls('goals:'+dk(),[])||[]; if(!Array.isArray(g)||!g.length) return null;
    var done=g.filter(function(x){return x&&x.done;}).length;
    return { total:g.length, done:done };
  }

  function gather(){
    var now=new Date(), h=now.getHours(), today=dk();
    var workouts=ls('po_workouts',[])||[];
    var exMap={}; (ls('po_exercises',[])||[]).forEach(function(e){ exMap[e.id]=e; });
    var weights=(ls('po_coach_weights',[])||[]).filter(function(e){return e&&e.dateKey;}).sort(function(a,b){return a.dateKey<b.dateKey?-1:1;});
    var water=ls('po_water_v1',{})||{};
    var caf=(ls('caf:logs',[])||[]).filter(function(l){return new Date(l.ts)>=dawn();}).reduce(function(s,l){return s+(l.mg||0);},0);
    var nut=(ls('nut:logs',[])||[]).filter(function(l){return l && (l.dateKey ? l.dateKey===dk() : new Date(l.ts)>=dawn());});
    var kcal=nut.reduce(function(s,l){return s+(l.kcal||0);},0);
    var prot=nut.reduce(function(s,l){return s+(l.p||0);},0);
    var supps=ls('stack:items',[])||[]; var takenMap=ls('stack:taken:'+suppDayKey(),{})||{};
    var dailySupps=supps.filter(function(i){return (i.window||'')!=='occasional';});
    var suppTaken=dailySupps.filter(function(i){return !!takenMap[i.id];}).length;

    var ws=weekStartKey(); var vol={};
    workouts.forEach(function(w){ if(w.date>=ws && w.date<=today){ (w.entries||[]).forEach(function(en){ var m=(exMap[en.exId]||{}).muscle||en.muscle||'Other'; vol[m]=(vol[m]||0)+((en.sets&&en.sets.length)||0); }); } });

    var lastW=workouts.slice().sort(function(a,b){return (b.startedAt||'')<(a.startedAt||'')?-1:1;})[0];
    var daysSince=lastW ? Math.floor((now-new Date(lastW.startedAt))/86400000) : null;

    var wToday=weights.some(function(e){return e.dateKey===today;});
    var wTrend=null;
    if(weights.length>=2){ var last=weights[weights.length-1]; var cutoff=dk(new Date(Date.now()-7*86400000)); var base=null; weights.forEach(function(e){ if(e.dateKey<=cutoff) base=e; }); if(!base)base=weights[0]; wTrend={delta:+(last.weight-base.weight).toFixed(1)}; }

    var wlogs=(water.logs&&typeof water.logs==='object')?water.logs:{}; var wCount=wlogs[today]||0;
    var p=(water.profile||{}); var wKg=p.weightKg||75; var unit=water.unit||'glass';
    var unitMl= unit==='glass'?(water.glassMl||250):unit==='oz'?30:(water.bottleMl||500);
    var wTarget=Math.max(1,Math.ceil((wKg*35+((p.activityHrsPerWeek||0)/7*500))/unitMl));
    var protTarget=Math.round(wKg*2);

    var lastPR=(lastW && lastW.date===today && lastW.prs && lastW.prs.length) ? lastW.prs.map(function(id){return (exMap[id]||{}).name||id;}) : [];
    var stalled=stalledLift(workouts, exMap);

    /* ── Sleep & recovery ── */
    var sleepLogs=(ls('sleep:logs',[])||[]).filter(function(e){return e&&e.dateKey;}).sort(function(a,b){return a.dateKey<b.dateKey?-1:1;});
    var sleepToday=null; for(var si=0;si<sleepLogs.length;si++){ if(sleepLogs[si].dateKey===today){ sleepToday=sleepLogs[si]; break; } }
    var recToday=recoveryScore(sleepToday);
    var lastNight = sleepLogs.filter(function(e){return e.hours>0;}).slice(-1)[0] || null;
    var avgRec=null; var rcut=dk(new Date(Date.now()-7*86400000));
    var recVals=sleepLogs.filter(function(e){ return e.dateKey>rcut; }).map(function(e){ return e.recovery!=null?e.recovery:recoveryScore(e); }).filter(function(v){ return v!=null; });
    if(recVals.length) avgRec=Math.round(recVals.reduce(function(a,b){return a+b;},0)/recVals.length);

    /* ── Identity: habits, journal, north star ── */
    var hbList=ls('habits:list',[])||[]; var hbLog=ls('habits:log',{})||{};
    var hbToday=(hbLog[today]&&typeof hbLog[today]==='object')?hbLog[today]:{};
    var habitsTotal=hbList.length; var habitsDone=hbList.filter(function(hh){return hbToday[hh.id];}).length;
    var topStreak=0, topStreakName='';
    hbList.forEach(function(hh){ var s=0,c=new Date(); if(!(hbLog[dk(c)]&&hbLog[dk(c)][hh.id])) c.setDate(c.getDate()-1); while(hbLog[dk(c)]&&hbLog[dk(c)][hh.id]){ s++; c.setDate(c.getDate()-1); } if(s>topStreak){ topStreak=s; topStreakName=hh.name; } });
    var jToday=(ls('journal:entries',[])||[]).find(function(e){ return e&&e.dateKey===today; });
    var journaledToday=!!(jToday && (((jToday.reflection||'').trim())||((jToday.gratitude||'').trim())));
    var northStar=ls('identity:northstar',{})||{};

    return {now:now,h:h,today:today,workouts:workouts,vol:vol,daysSince:daysSince,wToday:wToday,wTrend:wTrend,
      wCount:wCount,wTarget:wTarget,caf:caf,kcal:kcal,prot:prot,protTarget:protTarget,nutCount:nut.length,
      suppTaken:suppTaken,suppTotal:dailySupps.length,lastPR:lastPR,stalled:stalled,hasWorkouts:workouts.length>0,
      habitsTotal:habitsTotal,habitsDone:habitsDone,topStreak:topStreak,topStreakName:topStreakName,journaledToday:journaledToday,northStar:northStar,
      recToday:recToday,sleepToday:sleepToday,lastNight:lastNight,avgRec:avgRec,hasSleep:sleepLogs.length>0};
  }

  function build(){
    var d=gather(); var cards=[];
    var weekDaysElapsed=((d.now.getDay()+6)%7)+1; var weekProgress=weekDaysElapsed/7;

    if(d.lastPR.length) cards.push({p:96,tone:'good',title:'New PR today',
      detail:'You beat your best on '+d.lastPR.slice(0,2).join(', ')+'. That is exactly how you grow.',
      line:'You hit a PR today on '+d.lastPR[0]+' — that is real progress. Proud of you.'});

    /* ── Recovery: the keystone that gates how hard to train ── */
    if(d.recToday!=null){
      if(d.recToday<45) cards.push({p:92,tone:'warn',title:'Recovery is low ('+d.recToday+'/100)',
        detail:'You are depleted today — short sleep, soreness or stress. Go light, do mobility, or rest. Growth happens when you recover.',
        line:'Recovery is only '+d.recToday+' today — go light or rest. You grow when you recover, not when you grind.',href:'sleep.html'});
      else if(d.recToday<65) cards.push({p:74,tone:'info',title:'Recovery is moderate ('+d.recToday+'/100)',
        detail:'A little run-down. Train, but keep it sensible — hit your main lifts and skip the junk volume.',
        line:'Recovery is '+d.recToday+' today — train, but keep it moderate and hit the lifts that matter.',href:'sleep.html'});
      else cards.push({p:64,tone:'good',title:'Recovery is strong ('+d.recToday+'/100)',
        detail:'You are well recovered'+(d.lastNight?' on '+ (Math.round(d.lastNight.hours*10)/10) +'h sleep':'')+'. This is the day to push hard and chase a PR.',
        line:'Recovery is '+d.recToday+' today — you are primed. Push hard and chase a PR.',href:'gym.html'});
    } else if(!d.sleepToday && d.h>=6 && d.h<14){
      cards.push({p:62,tone:'info',title:'How did you sleep?',
        detail:'Log last night and a 10-second morning check-in — I will turn it into a recovery score that tells you how hard to train today.',
        line:'Tell me how you slept — I will turn it into a recovery score and tell you how hard to train.',href:'sleep.html'});
    }

    if(d.hasWorkouts){
      var behind=[];
      Object.keys(MT).forEach(function(m){ var have=d.vol[m]||0; if(have < MT[m]*weekProgress*0.7) behind.push({m:m,have:have,tgt:MT[m]}); });
      behind.sort(function(a,b){ return (a.have/a.tgt)-(b.have/b.tgt); });
      if(behind.length){ var b=behind[0];
        cards.push({p:82,tone:'push',title:b.m+' is lagging this week',
          detail:'Only '+b.have+' of '+b.tgt+' sets so far'+(behind.length>1?' ('+behind.length+' muscles behind pace)':'')+'. Slot in a '+b.m.toLowerCase()+'-focused session to stay balanced.',
          line:'Your '+b.m.toLowerCase()+' is behind this week — '+b.have+'/'+b.tgt+' sets. Give it a session and you stay balanced.',href:'gym.html'});
      }
    }

    if(d.daysSince!=null && d.daysSince>=3)
      cards.push({p:80,tone:'push',title:d.daysSince+' days since you trained',
        detail:'Momentum fades fast. Even a short session keeps you moving forward.',
        line:'It has been '+d.daysSince+' days since your last workout — let us get one in today.',href:'gym.html'});

    if(d.stalled)
      cards.push({p:70,tone:'push',title:d.stalled+' has stalled',
        detail:'Your best has not moved in 3 sessions. Change the rep range, slow the tempo, or take a light week then push hard.',
        line:d.stalled+' has been stuck for 3 sessions — time to switch rep range or deload, then attack it.',href:'gym.html'});

    if(d.caf>=400)
      cards.push({p:66,tone:'warn',title:'High caffeine today',
        detail:d.caf+'mg — over the 400mg line. Ease off now so it does not wreck tonight’s sleep, and drink water.',
        line:'That is '+d.caf+'mg of caffeine today — ease off so it does not hurt your sleep.',href:'body.html'});

    if(!d.wToday && d.h>=7)
      cards.push({p:60,tone:'info',title:'No weigh-in yet',
        detail:'A quick morning weight keeps your recomp trend honest.',
        line:'You have not weighed in today — 10 seconds keeps your trend accurate.',href:'body.html'});

    if(d.h>=13 && d.nutCount===0)
      cards.push({p:58,tone:'info',title:'No food logged yet',
        detail:'Track your meals so the trend stays real — and so you actually hit your protein.',
        line:'Nothing logged for food yet — fuel up, especially protein for recomp.',href:'body.html'});
    else if(d.prot>0 && d.prot < d.protTarget*0.6 && d.h>=15)
      cards.push({p:52,tone:'info',title:'Protein low so far',
        detail:Math.round(d.prot)+'g today — aim for ~'+d.protTarget+'g. Protein is what builds muscle while you lean out.',
        line:'Protein is a bit low ('+Math.round(d.prot)+'g) — load up to grow while you cut.'});

    if(d.wTrend){
      if(d.wTrend.delta<=-0.2) cards.push({p:50,tone:'good',title:'Weight trending down',
        detail:d.wTrend.delta+'kg over the last week. Recomp is working — keep protein high and lifts heavy.',
        line:'Weight is down '+Math.abs(d.wTrend.delta)+'kg this week — recomp is working. Keep protein up.'});
      else if(d.wTrend.delta>=0.5) cards.push({p:46,tone:'info',title:'Weight ticked up',
        detail:'+'+d.wTrend.delta+'kg this week. Fine if you are bulking; ease intake a touch if you are cutting.',
        line:'Weight is up '+d.wTrend.delta+'kg this week — worth a glance at your intake.'});
    }

    if(d.wCount < d.wTarget && d.h>=12){ var left=d.wTarget-d.wCount;
      cards.push({p:42,tone:'info',title:'Hydration behind',detail:left+' more to hit today’s target ('+d.wCount+'/'+d.wTarget+').',
        line:'You are '+left+' short on water today — keep sipping.',href:'body.html'}); }

    if(d.suppTotal>0 && d.suppTaken<d.suppTotal && d.h>=11)
      cards.push({p:38,tone:'info',title:'Supplements pending',detail:d.suppTaken+' of '+d.suppTotal+' taken today.',
        line:'A few supplements still to take today ('+d.suppTaken+'/'+d.suppTotal+').',href:'body.html'});

    // Cross-domain patterns Nova has spotted across your whole life — the magic.
    var cors=correlations();
    cors.slice(0,2).forEach(function(c){
      cards.push({ p:76+Math.round((c.strength||0)*7), tone:c.tone, insight:true,
        title:c.title, detail:c.detail, line:c.line, href:c.href });
    });

    // Identity: habits, streaks, journal — Nova holding you to who you said you'd be.
    if(d.topStreak>=7)
      cards.push({p:50,tone:'good',title:d.topStreakName+' — '+d.topStreak+'-day streak',
        detail:'You’ve kept it '+d.topStreak+' days straight. That’s identity, not motivation. Don’t break the chain.',
        line:d.topStreakName+' is on a '+d.topStreak+'-day streak — that is who you are now. Keep the chain alive.',href:'identity.html'});
    if(d.habitsTotal>0 && d.habitsDone<d.habitsTotal && d.h>=17)
      cards.push({p:54,tone:'push',title:'Habits: '+d.habitsDone+'/'+d.habitsTotal+' today',
        detail:(d.habitsTotal-d.habitsDone)+' left. These daily reps build the person on your North Star — close them out before bed.',
        line:'You’ve got '+(d.habitsTotal-d.habitsDone)+' habit'+((d.habitsTotal-d.habitsDone)>1?'s':'')+' left today — finish them, that is the discipline compounding.',href:'identity.html'});
    if(!d.journaledToday && d.h>=20)
      cards.push({p:36,tone:'info',title:'No journal entry yet',
        detail:'Two honest lines on today — what you did, what you’re grateful for — keeps you in touch with who you’re becoming.',
        line:'You have not journaled today — a couple of honest lines before bed.',href:'identity.html'});

    // Memory: the goals he set himself today.
    var gl=todaysGoals();
    if(gl && gl.done<gl.total && d.h>=11)
      cards.push({p:44,tone:'info',title:'Your goals for today',
        detail:gl.done+' of '+gl.total+' done. Close the loop on what you set out to do — future you is counting on it.',
        line:gl.done+'/'+gl.total+' goals done today — let’s finish what you started.',href:'main.html'});

    if(!cards.length) cards.push({p:10,tone:'good',title:'You are on top of it',
      detail:'Nothing urgent — everything is tracking well. Consistency like this is exactly what builds the best version of you.',
      line:'Everything is on track today. Consistency is your superpower — keep going.'});

    cards.sort(function(a,b){ return b.p-a.p; });
    var g=d.h<5?'Still up':d.h<12?'Good morning':d.h<18?'Good afternoon':'Good evening';
    var mood = d.lastPR.length?'hot':(d.recToday!=null&&d.recToday<45)?'alert':(d.recToday!=null&&d.recToday>=82)?'hot':d.caf>=400?'alert':(d.daysSince!=null&&d.daysSince>=3)?'low':'calm';
    return { greeting:g, headline:cards[0].line, cards:cards, mood:mood };
  }

  function novaSVG(){ return '<div class="nova" aria-hidden="true"><svg viewBox="0 0 100 100"><defs><linearGradient id="ncNv" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#34E2B0"/><stop offset="100%" stop-color="#9B8CFF"/></linearGradient></defs><g class="nova-glow"><rect x="22" y="22" width="56" height="56" rx="16" transform="rotate(45 50 50)" fill="url(#ncNv)" opacity="0.95"/><circle class="nova-eye" cx="42" cy="50" r="5.5" fill="#04130D"/><circle class="nova-eye" cx="58" cy="50" r="5.5" fill="#04130D"/><circle cx="43.4" cy="48.5" r="1.6" fill="#fff"/><circle cx="59.4" cy="48.5" r="1.6" fill="#fff"/></g></svg></div>'; }

  var CSS =
  /* Native <dialog> in the top layer — centered by the browser, immune to any
     ancestor transform/filter (which break position:fixed). Bulletproof on
     iPhone + laptop. */
  'dialog.nc-sheet{position:fixed;inset:0;margin:auto;z-index:81;width:min(540px,calc(100% - 28px));max-width:min(540px,calc(100% - 28px));max-height:88vh;max-height:88dvh;padding:0;border:1px solid rgba(var(--au-glow-rgb),.34);border-radius:22px;background:linear-gradient(180deg,#0b0e13,#080a0e);color:inherit;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.66),0 0 90px rgba(var(--au-glow-rgb),.14);opacity:0;transform:translateY(14px) scale(.96);transition:opacity .22s ease, transform .42s cubic-bezier(.34,1.55,.45,1);}'+
  'dialog.nc-sheet[open]{display:block;}'+
  'dialog.nc-sheet.on{opacity:1;transform:translateY(0) scale(1);animation:nc-breathe 3.8s ease-in-out infinite .45s;}'+
  'dialog.nc-sheet::backdrop{background:rgba(3,4,6,.62);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);}'+
  '@keyframes nc-breathe{0%,100%{box-shadow:0 30px 80px rgba(0,0,0,.66),0 0 90px rgba(var(--au-glow-rgb),.12);}50%{box-shadow:0 30px 80px rgba(0,0,0,.66),0 0 130px rgba(var(--au-glow-rgb),.24);}}'+
  '.nc-scroll{position:relative;z-index:1;max-height:86vh;max-height:86dvh;overflow-y:auto;padding:20px 18px 22px;-webkit-overflow-scrolling:touch;}'+
  '.nc-sheet::before{content:"";position:absolute;inset:0;z-index:0;background-image:linear-gradient(rgba(var(--au-glow-rgb),.06) 1px,transparent 1px),linear-gradient(90deg,rgba(var(--au-glow-rgb),.06) 1px,transparent 1px);background-size:34px 34px;pointer-events:none;-webkit-mask-image:radial-gradient(125% 80% at 50% 0,#000,transparent 72%);mask-image:radial-gradient(125% 80% at 50% 0,#000,transparent 72%);}'+
  '.nc-corner{position:absolute;z-index:3;width:17px;height:17px;border:2px solid rgb(var(--au-glow-rgb));opacity:0;transition:opacity .45s .25s;pointer-events:none;filter:drop-shadow(0 0 4px rgba(var(--au-glow-rgb),.7));}'+
  '.nc-sheet.on .nc-corner{opacity:.85;}'+
  '.nc-corner.tl{top:10px;left:10px;border-right:none;border-bottom:none;border-top-left-radius:5px;}'+
  '.nc-corner.tr{top:10px;right:10px;border-left:none;border-bottom:none;border-top-right-radius:5px;}'+
  '.nc-corner.bl{bottom:10px;left:10px;border-right:none;border-top:none;border-bottom-left-radius:5px;}'+
  '.nc-corner.br{bottom:10px;right:10px;border-left:none;border-top:none;border-bottom-right-radius:5px;}'+
  '.nc-scan{position:absolute;left:0;right:0;top:0;z-index:2;height:150px;pointer-events:none;opacity:0;background:linear-gradient(180deg,transparent,rgba(var(--au-glow-rgb),.14) 55%,rgba(var(--au-glow-rgb),.5));}'+
  '.nc-sheet.on .nc-scan{animation:nc-sweep 1.15s ease-out .1s 1;}'+
  '@keyframes nc-sweep{0%{transform:translateY(-170px);opacity:0;}22%{opacity:.85;}100%{transform:translateY(92vh);opacity:0;}}'+
  '.nc-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:rgb(var(--au-glow-rgb));box-shadow:0 0 7px rgb(var(--au-glow-rgb));margin-right:6px;vertical-align:middle;animation:nc-blink 1.4s ease-in-out infinite;}'+
  '@keyframes nc-blink{0%,100%{opacity:1;}50%{opacity:.2;}}'+
  '.nc-headline{position:relative;}'+
  '.nc-headline::after{content:"";position:absolute;left:2px;bottom:5px;height:2px;width:0;background:linear-gradient(90deg,rgb(var(--au-glow-rgb)),transparent);border-radius:2px;transition:width .6s ease .3s;}'+
  '.nc-sheet.on .nc-headline::after{width:54px;}'+
  '.nc-talk{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin:0 0 16px;padding:14px;border-radius:14px;text-decoration:none;font-family:var(--au-sans,-apple-system);font-size:14.5px;font-weight:700;letter-spacing:.01em;color:#04130D;background:linear-gradient(120deg,#34E2B0,#18C8C0 55%,#9B8CFF);box-shadow:0 6px 22px rgba(var(--au-glow-rgb),.28);transition:transform .14s;-webkit-tap-highlight-color:transparent;}'+
  '.nc-talk:active{transform:translateY(1px);}'+
  '.nc-grip{display:none;}'+
  '.nc-head{display:flex;align-items:center;gap:13px;margin-bottom:12px;}'+
  '.nc-head .nova{width:54px;height:54px;flex-shrink:0;}'+
  '.nc-eyebrow{font-family:var(--au-mono);font-size:9px;font-weight:700;letter-spacing:.22em;color:rgba(var(--au-glow-rgb),.75);}'+
  '.nc-greet{font-family:var(--au-serif);font-style:italic;font-size:22px;color:var(--au-ivory);line-height:1.1;margin-top:2px;}'+
  '.nc-x{margin-left:auto;background:rgba(255,255,255,.06);border:none;color:var(--au-dim);width:34px;height:34px;border-radius:50%;font-size:18px;cursor:pointer;flex-shrink:0;}'+
  '.nc-headline{font-family:var(--au-serif);font-style:italic;font-size:clamp(20px,5.2vw,26px);line-height:1.3;color:var(--au-ivory);margin:6px 2px 20px;}'+
  '.nc-card{position:relative;background:var(--au-glass);border:1px solid var(--au-line);border-left:3px solid var(--au-line);border-radius:14px;padding:13px 15px;margin-bottom:10px;transition:transform .15s;-webkit-tap-highlight-color:transparent;}'+
  '.nc-card:active{transform:scale(.99);}'+
  '.nc-card-t{font-weight:700;font-size:14px;color:var(--au-ivory);margin-bottom:3px;}'+
  '.nc-card-d{font-size:12.5px;color:var(--au-dim);line-height:1.42;}'+
  '.nc-card-go{font-family:var(--au-mono);font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgb(var(--au-glow-rgb));margin-top:7px;}'+
  '.nc-good{border-left-color:#34E2B0;} .nc-push{border-left-color:#F2C063;} .nc-warn{border-left-color:#FF6B8B;} .nc-info{border-left-color:#9B8CFF;}'+
  '.nc-card-eyebrow{font-family:var(--au-mono);font-size:8.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:rgb(var(--au-glow-rgb));margin-bottom:5px;}'+
  '.nc-insight{border-left-color:#9B8CFF;background:linear-gradient(180deg,rgba(155,140,255,.07),var(--au-glass));}'+
  '.nc-letter{position:relative;border:1px solid rgba(var(--au-glow-rgb),.32);border-radius:16px;padding:16px 17px;margin-bottom:14px;background:linear-gradient(180deg,rgba(var(--au-glow-rgb),.08),rgba(255,255,255,.02));}'+
  '.nc-letter-eyebrow{font-family:var(--au-mono);font-size:9px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:rgb(var(--au-glow-rgb));margin-bottom:6px;}'+
  '.nc-letter-title{font-family:var(--au-serif);font-style:italic;font-size:22px;color:var(--au-ivory);margin-bottom:11px;line-height:1.1;}'+
  '.nc-letter-p{font-family:var(--au-serif);font-style:italic;font-size:15px;line-height:1.5;color:var(--au-dim);margin-bottom:9px;}'+
  '.nc-letter-p:last-child{margin-bottom:0;color:var(--au-ivory);}'+
  '.nc-foot{font-family:var(--au-mono);font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:var(--au-faint);text-align:center;margin-top:14px;line-height:1.5;}';

  var ncOpenedAt=0;
  function ensureDOM(){
    if(document.getElementById('ncSheet')) return;
    var st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
    var dlg=document.createElement('dialog'); dlg.id='ncSheet'; dlg.className='nc-sheet';
    /* click on the ::backdrop (target is the dialog itself) closes; ignore iOS ghost-click on open */
    dlg.addEventListener('click', function(e){ if(e.target===dlg && Date.now()-ncOpenedAt>=450) close(); });
    dlg.addEventListener('cancel', function(e){ e.preventDefault(); close(); }); /* Esc key */
    document.body.appendChild(dlg);
  }
  function cardHTML(c){
    var go = c.href ? '<div class="nc-card-go">Tap to open &rarr;</div>' : '';
    var attr = c.href ? ' data-nc-go="'+c.href+'"' : '';
    var eyebrow = c.insight ? '<div class="nc-card-eyebrow">✦ Pattern Nova spotted</div>' : '';
    return '<div class="nc-card nc-'+c.tone+(c.insight?' nc-insight':'')+'"'+attr+'>'+eyebrow+'<div class="nc-card-t">'+esc(c.title)+'</div><div class="nc-card-d">'+esc(c.detail)+'</div>'+go+'</div>';
  }
  /* Weekly letter — shown once per ISO week (first open of a new week). */
  function letterHTMLIfDue(){
    try{
      var nowWk=isoWeek(dk());
      if(localStorage.getItem('nova_letter_week')===nowWk) return '';
      var L=weeklyLetter(); if(!L) return '';
      localStorage.setItem('nova_letter_week', nowWk);
      return '<div class="nc-letter"><div class="nc-letter-eyebrow">A letter from Nova</div><div class="nc-letter-title">'+esc(L.title)+'</div>'+
        L.body.map(function(p){ return '<div class="nc-letter-p">'+esc(p)+'</div>'; }).join('')+'</div>';
    }catch(e){ return ''; }
  }
  function open(){
    ensureDOM();
    var b=build();
    var sh=document.getElementById('ncSheet');
    sh.className='nc-sheet au-mood-'+b.mood;
    sh.innerHTML='<span class="nc-corner tl"></span><span class="nc-corner tr"></span><span class="nc-corner bl"></span><span class="nc-corner br"></span><div class="nc-scan"></div>'+
      '<div class="nc-scroll">'+
      '<div class="nc-head">'+novaSVG()+'<div><div class="nc-eyebrow"><span class="nc-dot"></span>NOVA &middot; COACH ONLINE</div><div class="nc-greet">'+esc(b.greeting)+', Alex.</div></div><button type="button" class="nc-x" id="ncX">✕</button></div>'+
      '<a class="nc-talk" href="nova-chat.html">&#10022; Talk to me</a>'+
      '<div class="nc-headline">'+esc(b.headline)+'</div>'+
      letterHTMLIfDue()+
      b.cards.map(cardHTML).join('')+
      '<div class="nc-foot">Nova reads your training, body &amp; nutrition every time<br>to give you this. Tap a card to act on it.</div>'+
      '</div>';
    try { if(sh.showModal){ if(!sh.open) sh.showModal(); } else { sh.setAttribute('open',''); } } catch(e){ sh.setAttribute('open',''); }
    ncOpenedAt=Date.now();
    requestAnimationFrame(function(){ sh.classList.add('on'); });
    var scr=sh.querySelector('.nc-scroll'); if(scr) scr.scrollTop=0;
    var x=document.getElementById('ncX'); if(x) x.addEventListener('click', close);
  }
  function close(){
    var s=document.getElementById('ncSheet'); if(!s) return;
    s.classList.remove('on');
    setTimeout(function(){ try { if(s.open && s.close) s.close(); else s.removeAttribute('open'); } catch(e){ s.removeAttribute('open'); } }, 200);
  }

  // ── The single brain, one door. Every Nova surface (orb, deck, chat
  //    grounding, briefing) reads from here so they never disagree. ──
  function novaMemory(){ var a=ls('nova:memory',[]); return Array.isArray(a)?a.filter(function(m){return m&&m.fact;}).map(function(m){return m.fact;}):[]; }
  window.NovaCoach={
    open:open, close:close, brief:build, correlations:correlations, letter:weeklyLetter,
    state:gather,                              // canonical "today" facts
    line:function(){ try{ return build().headline; }catch(e){ return ''; } },
    mood:function(){ try{ return build().mood; }catch(e){ return 'calm'; } },
    moves:function(){ try{ return build().cards||[]; }catch(e){ return []; } },
    memory:novaMemory
  };

  /* tap any Nova avatar anywhere → open the coach; tap a card with a target → go */
  document.addEventListener('click', function(ev){
    var t = ev.target && ev.target.closest ? ev.target.closest('#nova,[data-nova],[data-nc-go]') : null;
    if(!t) return;
    var go = t.getAttribute('data-nc-go');
    if(go){ location.href=go; return; }
    open();
  });
})();
