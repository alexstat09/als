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

  function gather(){
    var now=new Date(), h=now.getHours(), today=dk();
    var workouts=ls('po_workouts',[])||[];
    var exMap={}; (ls('po_exercises',[])||[]).forEach(function(e){ exMap[e.id]=e; });
    var weights=(ls('po_coach_weights',[])||[]).filter(function(e){return e&&e.dateKey;}).sort(function(a,b){return a.dateKey<b.dateKey?-1:1;});
    var water=ls('po_water_v1',{})||{};
    var caf=(ls('caf:logs',[])||[]).filter(function(l){return new Date(l.ts)>=dawn();}).reduce(function(s,l){return s+(l.mg||0);},0);
    var nut=(ls('nut:logs',[])||[]).filter(function(l){return new Date(l.ts)>=dawn();});
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

    return {now:now,h:h,today:today,workouts:workouts,vol:vol,daysSince:daysSince,wToday:wToday,wTrend:wTrend,
      wCount:wCount,wTarget:wTarget,caf:caf,kcal:kcal,prot:prot,protTarget:protTarget,nutCount:nut.length,
      suppTaken:suppTaken,suppTotal:dailySupps.length,lastPR:lastPR,stalled:stalled,hasWorkouts:workouts.length>0};
  }

  function build(){
    var d=gather(); var cards=[];
    var weekDaysElapsed=((d.now.getDay()+6)%7)+1; var weekProgress=weekDaysElapsed/7;

    if(d.lastPR.length) cards.push({p:96,tone:'good',title:'New PR today',
      detail:'You beat your best on '+d.lastPR.slice(0,2).join(', ')+'. That is exactly how you grow.',
      line:'You hit a PR today on '+d.lastPR[0]+' — that is real progress. Proud of you.'});

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

    if(!cards.length) cards.push({p:10,tone:'good',title:'You are on top of it',
      detail:'Nothing urgent — everything is tracking well. Consistency like this is exactly what builds the best version of you.',
      line:'Everything is on track today. Consistency is your superpower — keep going.'});

    cards.sort(function(a,b){ return b.p-a.p; });
    var g=d.h<5?'Still up':d.h<12?'Good morning':d.h<18?'Good afternoon':'Good evening';
    var mood = d.lastPR.length?'hot':d.caf>=400?'alert':(d.daysSince!=null&&d.daysSince>=3)?'low':'calm';
    return { greeting:g, headline:cards[0].line, cards:cards, mood:mood };
  }

  function novaSVG(){ return '<div class="nova" aria-hidden="true"><svg viewBox="0 0 100 100"><defs><linearGradient id="ncNv" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#34E2B0"/><stop offset="100%" stop-color="#9B8CFF"/></linearGradient></defs><g class="nova-glow"><rect x="22" y="22" width="56" height="56" rx="16" transform="rotate(45 50 50)" fill="url(#ncNv)" opacity="0.95"/><circle class="nova-eye" cx="42" cy="50" r="5.5" fill="#04130D"/><circle class="nova-eye" cx="58" cy="50" r="5.5" fill="#04130D"/><circle cx="43.4" cy="48.5" r="1.6" fill="#fff"/><circle cx="59.4" cy="48.5" r="1.6" fill="#fff"/></g></svg></div>'; }

  var CSS =
  '.nc-bg{position:fixed;inset:0;z-index:80;background:rgba(3,4,6,.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .25s;}'+
  '.nc-bg.on{opacity:1;pointer-events:auto;}'+
  '.nc-sheet{position:fixed;left:50%;top:50%;z-index:81;width:min(540px,92vw);max-height:88vh;overflow-y:auto;background:linear-gradient(180deg,#0b0e13,#080a0e);border:1px solid rgba(var(--au-glow-rgb),.3);border-radius:24px;padding:20px 18px 22px;opacity:0;pointer-events:none;transform:translate(-50%,-50%) scale(.9);transition:opacity .2s ease, transform .34s cubic-bezier(.34,1.55,.45,1);box-shadow:0 30px 80px rgba(0,0,0,.65),0 0 80px rgba(var(--au-glow-rgb),.12);-webkit-overflow-scrolling:touch;}'+
  '.nc-sheet.on{opacity:1;pointer-events:auto;transform:translate(-50%,-50%) scale(1);}'+
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
  '.nc-foot{font-family:var(--au-mono);font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:var(--au-faint);text-align:center;margin-top:14px;line-height:1.5;}';

  var ncOpenedAt=0;
  function ensureDOM(){
    if(document.getElementById('ncSheet')) return;
    var st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
    var bg=document.createElement('div'); bg.id='ncBg'; bg.className='nc-bg';
    bg.addEventListener('click', function(){ if(Date.now()-ncOpenedAt>=450) close(); }); /* ignore iOS ghost-click on open */
    var sh=document.createElement('div'); sh.id='ncSheet'; sh.className='nc-sheet';
    document.body.appendChild(bg); document.body.appendChild(sh);
  }
  function cardHTML(c){
    var go = c.href ? '<div class="nc-card-go">Tap to open &rarr;</div>' : '';
    var attr = c.href ? ' data-nc-go="'+c.href+'"' : '';
    return '<div class="nc-card nc-'+c.tone+'"'+attr+'><div class="nc-card-t">'+esc(c.title)+'</div><div class="nc-card-d">'+esc(c.detail)+'</div>'+go+'</div>';
  }
  function open(){
    ensureDOM();
    var b=build();
    var sh=document.getElementById('ncSheet');
    sh.className='nc-sheet au-mood-'+b.mood;
    sh.innerHTML='<div class="nc-grip"></div>'+
      '<div class="nc-head">'+novaSVG()+'<div><div class="nc-eyebrow">NOVA &middot; YOUR COACH</div><div class="nc-greet">'+esc(b.greeting)+', Alex.</div></div><button type="button" class="nc-x" id="ncX">✕</button></div>'+
      '<div class="nc-headline">'+esc(b.headline)+'</div>'+
      b.cards.map(cardHTML).join('')+
      '<div class="nc-foot">Nova reads your training, body &amp; nutrition every time<br>to give you this. Tap a card to act on it.</div>';
    document.getElementById('ncBg').classList.add('on'); sh.classList.add('on'); sh.scrollTop=0; ncOpenedAt=Date.now();
    var x=document.getElementById('ncX'); if(x) x.addEventListener('click', close);
  }
  function close(){ var b=document.getElementById('ncBg'),s=document.getElementById('ncSheet'); if(b)b.classList.remove('on'); if(s)s.classList.remove('on'); }

  window.NovaCoach={ open:open, close:close, brief:build };

  /* tap any Nova avatar anywhere → open the coach; tap a card with a target → go */
  document.addEventListener('click', function(ev){
    var t = ev.target && ev.target.closest ? ev.target.closest('#nova,[data-nova],[data-nc-go]') : null;
    if(!t) return;
    var go = t.getAttribute('data-nc-go');
    if(go){ location.href=go; return; }
    open();
  });
})();
