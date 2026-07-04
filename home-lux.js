/* ══════════════════════════════════════════════════════════════
   AURORA — luxury HOME decorator (complete). Additive only.
   Renders real DATA as big serif hero numbers + count-up + sparklines,
   injects the Body cockpit, line icons, readiness ring, peek, haptics.
   Reads the SAME localStorage keys the app uses; never writes app state.
   ══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  document.documentElement.classList.add('js');
  try{ var _r=document.getElementById('root'); if(_r) _r.classList.remove('au-bg'); }catch(e){}
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE='cubic-bezier(0.16,1,0.3,1)';
  function ls(k,d){ try{ var v=JSON.parse(localStorage.getItem(k)); return v==null?d:v; }catch(e){ return d; } }
  function tk(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function activeDate(){ var d=new Date(); if(d.getHours()<6) d.setDate(d.getDate()-1); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function dawn(){ var d=new Date(); d.setHours(0,0,0,0); return d; }
  function haptic(ms){ try{ if(navigator.vibrate) navigator.vibrate(ms||6); }catch(e){} }
  function relDay(key){ var d=new Date(key+'T00:00:00'); var diff=Math.round((new Date()-d)/86400000); return diff===0?'today':diff===1?'yesterday':diff+'d ago'; }

  /* ── line icons ── */
  var I={
    'gym.html':'<rect x="1.5" y="9" width="3" height="6" rx="1"/><rect x="19.5" y="9" width="3" height="6" rx="1"/><rect x="4.5" y="10" width="2" height="4" rx=".5"/><rect x="17.5" y="10" width="2" height="4" rx=".5"/><line x1="6.5" y1="12" x2="17.5" y2="12"/>',
    'pr.html':'<path d="M7 4h10v4a5 5 0 0 1-10 0Z"/><path d="M7 6H4.2v.8A3 3 0 0 0 7 10"/><path d="M17 6h2.8v.8A3 3 0 0 1 17 10"/><line x1="12" y1="13" x2="12" y2="16.5"/><path d="M8.5 20h7"/><path d="M9.5 20a2.5 2.5 0 0 1 5 0"/>',
    'body.html':'<path d="M3 12h4l2-5 4 10 2-5h6"/>',
    'sleep.html':'<path d="M21 12.8A8 8 0 1 1 11.2 3 6 6 0 0 0 21 12.8Z"/>',
    'nutrition.html':'<path d="M12 7c-2-3.2-6.2-2-6.2 2.2 0 4.3 3.2 8.3 6.2 8.3s6.2-4 6.2-8.3C18.2 5 14 3.8 12 7Z"/><path d="M12 7V3.8"/>',
    'weight.html':'<rect x="3.5" y="3" width="17" height="18" rx="2.5"/><path d="M8 3c0 2 1.6 3.4 4 3.4S16 5 16 3"/><path d="M12 13l2.6-3.2"/>',
    'caffeine.html':'<path d="M4 8h12v4.5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z"/><path d="M16 9h2.2a2.2 2.2 0 0 1 0 4.4H16"/><path d="M7 2.5v2M10.5 2.5v2"/>',
    'po-water.html':'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
    'health.html':'<rect x="2.5" y="8.5" width="19" height="7" rx="3.5" transform="rotate(-45 12 12)"/><line x1="8" y1="8" x2="16" y2="16"/>',
    'measure.html':'<rect x="3" y="7" width="18" height="10" rx="1.5"/><path d="M7 7v3M10.5 7v4M14 7v3M17.5 7v4"/>',
    'main.html':'<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="0.6" fill="currentColor" stroke="none"/>',
    'identity.html':'<circle cx="12" cy="12" r="8.2"/><polygon points="12,7 14,14 8,10.5 16,10.5 10,14" fill="currentColor" stroke="none"/>',
    'ideas.html':'<path d="M9.5 18h5"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.8 10.6c.8.7 1.3 1.4 1.3 2.4h5c0-1 .5-1.7 1.3-2.4A6 6 0 0 0 12 3Z"/>',
    'improve.html':'<path d="M3 17l6-6 4 4 8-8"/><path d="M17 7h4v4"/>',
    'finance.html':'<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><circle cx="17" cy="14.5" r="1.1"/>',
    'bills.html':'<rect x="3" y="5" width="18" height="16" rx="2.5"/><line x1="3" y1="9.5" x2="21" y2="9.5"/><line x1="8" y1="3" x2="8" y2="6.5"/><line x1="16" y1="3" x2="16" y2="6.5"/>',
    'movies.html':'<rect x="3" y="4" width="18" height="16" rx="2.5"/><line x1="8" y1="4" x2="8" y2="20"/><line x1="16" y1="4" x2="16" y2="20"/>',
    'arc.html':'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z"/>',
    'trends.html':'<path d="M4 4v16h16"/><path d="M7 14l3-4 3 2 5-7"/>',
    'insights.html':'<circle cx="7" cy="8" r="2.3"/><circle cx="16.5" cy="7" r="2.3"/><circle cx="12" cy="16.5" r="2.3"/><line x1="8.8" y1="9.3" x2="10.5" y2="14.6"/><line x1="14.7" y1="8.8" x2="13" y2="14.6"/>',
    'arxaia.html':'<path d="M7 4h9a1.8 1.8 0 0 1 1.8 1.8v10.4A1.8 1.8 0 0 0 19.6 18H8.2A1.8 1.8 0 0 1 6.4 16.2V5.8"/><path d="M6.4 4A2 2 0 0 0 4.4 6v2h2"/><line x1="9.5" y1="9" x2="15" y2="9"/><line x1="9.5" y1="12" x2="15" y2="12"/>',
    'istoria.html':'<line x1="3" y1="21" x2="21" y2="21"/><path d="M4.5 21V10.5M9.5 21V10.5M14.5 21V10.5M19.5 21V10.5"/><path d="M3.5 10.5 12 4l8.5 6.5Z"/>'
  };
  function svg(p){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'; }
  function href(t){ var h=t.getAttribute('href')||''; return h.split('#')[0].split('?')[0]; }
  function fmtN(n){ return Number(n).toLocaleString('en-US'); }

  /* ── REAL DATA per destination → {hero, unit, note, spark} ── */
  function metric(h){
    var t=tk();
    try{ switch(h){
      case 'pr.html': {
        var ws=ls('po_workouts',[]), best=0, name='';
        (Array.isArray(ws)?ws:[]).forEach(function(w){ (w&&w.entries||[]).forEach(function(en){ if(!en||en.kind==='time')return; (en.sets||[]).forEach(function(s){ if(!s||s.done===false)return; var kg=+s.kg||0,r=+s.reps||0; if(kg<=0||r<=0)return; var e=kg*(1+r/30); if(e>best){best=e;name=en.name||'';} }); }); });
        return best>0?{hero:Math.round(best),unit:'kg',note:name||'best lift'}:{hero:'—',note:'no lifts yet'};
      }
      case 'sleep.html': {
        var logs=ls('sleep:logs',[]); var arr=Array.isArray(logs)?logs:[];
        var today=arr.find(function(e){return e&&e.dateKey===t;});
        if(today&&today.recovery!=null) return {hero:today.recovery,note:'recovery',spark:recSpark(arr)};
        var slept=arr.filter(function(e){return e&&e.hours>0;}).sort(function(a,b){return a.dateKey<b.dateKey?-1:1;});
        if(slept.length){ var hh=slept[slept.length-1].hours; return {hero:Math.floor(hh),unit:'h',note:'last night',spark:recSpark(arr)}; }
        return {hero:'—',note:'log your sleep'};
      }
      case 'nutrition.html': {
        var all=ls('nut:logs',[]); all=Array.isArray(all)?all:[];
        var nl=all.filter(function(l){return l&&(l.dateKey?l.dateKey===t:new Date(l.ts)>=dawn());});
        var kc=Math.round(nl.reduce(function(s,l){return s+(l.kcal||0);},0));
        var byDay={}; all.forEach(function(l){ if(!l)return; var k=l.dateKey||(l.ts?new Date(l.ts).toISOString().slice(0,10):null); if(k) byDay[k]=(byDay[k]||0)+(l.kcal||0); });
        var days=Object.keys(byDay).sort().slice(-10).map(function(k){return Math.round(byDay[k]);});
        return kc>0?{hero:kc,unit:'kcal',note:'today',spark:days.length>=3?days:null}:{hero:'—',note:'log food'};
      }
      case 'health.html': {
        var it=ls('stack:items',[]); it=(Array.isArray(it)?it:[]).filter(function(i){return i&&i.id&&i.name;});
        var tkn=ls('stack:taken:'+activeDate(),{})||{}; var tc=it.filter(function(i){return tkn[i.id];}).length;
        return it.length?{hero:tc,unit:'/ '+it.length,note:'stack today'}:{hero:'—',note:'your stack'};
      }
      case 'measure.html': {
        var lg=ls('bm:logs',[]); lg=Array.isArray(lg)?lg:[];
        var latest=function(k){ var s=lg.filter(function(r){return r&&r[k]!=null;}).sort(function(a,b){return a.dateKey<b.dateKey?-1:1;}); return s.length?s[s.length-1][k]:null; };
        var wa=latest('waist'); return wa!=null?{hero:wa,unit:'cm',note:'waist'}:{hero:'—',note:'measure up'};
      }
      case 'weight.html': case 'body.html': {
        var W=ls('po_coach_weights',[]); W=Array.isArray(W)?W:[];
        var last=W[W.length-1];
        return last?{hero:last.weight,unit:'kg',note:'latest',spark:wSpark(W)}:{hero:'—',note:'log weight'};
      }
      case 'caffeine.html': {
        var mg=ls('caf:logs',[]).filter(function(l){return new Date(l.ts)>=dawn();}).reduce(function(s,l){return s+(l.mg||0);},0);
        return {hero:mg||0,unit:'mg',note:'today'};
      }
      case 'po-water.html': {
        var pw=ls('po_water_v1',{}); var done=((pw.logs||{})[t])||0;
        var wKg=(pw.profile&&pw.profile.weightKg)||75; var total=Math.max(1,Math.ceil(wKg*35/(pw.bottleMl||500)));
        return {hero:done,unit:'/ '+total,note:'water'};
      }
      case 'main.html': {
        var g=ls('goals:'+t,[]); if(Array.isArray(g)&&g.length) return {hero:g.filter(function(x){return x.done;}).length,unit:'/ '+g.length,note:'today'};
        return {hero:'—',note:'set goals'};
      }
      case 'identity.html': {
        var hl=ls('habits:list',[]), lg=ls('habits:log',{});
        if(Array.isArray(hl)&&hl.length){ var d=(hl.filter(function(x){return lg[t]&&lg[t][x.id];})).length; return {hero:d,unit:'/ '+hl.length,note:'habits'}; }
        return {hero:'—',note:'north star'};
      }
      case 'ideas.html': { var a=ls('ideas:items',[]); a=Array.isArray(a)?a:[]; return a.length?{hero:a.filter(function(i){return !i.done;}).length,note:'active ideas'}:{hero:'—',note:'capture'}; }
      case 'improve.html': { var v=ls('improve:videos',[]); v=Array.isArray(v)?v:[]; var w=v.filter(function(x){return x&&!x.watched;}).length; return v.length?{hero:w,note:'to learn'}:{hero:'—',note:'queue'}; }
      case 'finance.html': { var nw=0; ['bank','stocks','crypto','other'].forEach(function(c){ (ls('nw:'+c,[])||[]).forEach(function(it){ nw+=Number(it.amount)||0; }); }); var cur=ls('nw_currency','CHF'); return nw>0?{hero:Math.round(nw),note:cur+' net worth'}:{hero:'—',note:'net worth'}; }
      case 'bills.html': { var b=ls('bills:items',[]); b=(Array.isArray(b)?b:[]).filter(function(x){return x&&x.id;}); return b.length?{hero:b.length,note:'bills tracked'}:{hero:'—',note:'add bills'}; }
      case 'movies.html': { var s=(ls('movies:seen',[])||[]).filter(function(x){return x&&x.id;}); var w=(ls('movies:watch',[])||[]).filter(function(x){return x&&x.id;}); if(s.length) return {hero:s.length,note:'rated'}; if(w.length) return {hero:w.length,note:'to watch'}; return {hero:'—',note:'rate a film'}; }
      case 'arc.html': {
        var Wt=ls('po_coach_weights',[]),Wo=ls('po_workouts',[]),Sl=ls('sleep:logs',[]),ds=[];
        (Array.isArray(Wt)?Wt:[]).forEach(function(e){if(e&&e.dateKey)ds.push(e.dateKey);});
        (Array.isArray(Wo)?Wo:[]).forEach(function(e){if(e&&e.date)ds.push(e.date);});
        (Array.isArray(Sl)?Sl:[]).forEach(function(e){if(e&&e.dateKey)ds.push(e.dateKey);});
        ds.sort(); if(ds.length){ var days=Math.round((new Date(t+'T00:00:00')-new Date(ds[0]+'T00:00:00'))/86400000)+1; return {hero:days,note:'days tracked'}; }
        return {hero:'—',note:'your story'};
      }
      case 'trends.html': { var W2=ls('po_coach_weights',[]); return (Array.isArray(W2)&&W2.length)?{hero:W2.length,note:'weigh-ins'}:{hero:'—',note:'track'}; }
      case 'gym.html': { var done=ls('po_coach_workout_done',{}); var days=Object.keys(done).filter(function(k){return done[k];}).sort(); var ld=days[days.length-1]; return ld?{hero:relDay(ld),txt:true,note:'last workout'}:{hero:'—',note:'no workout yet'}; }
      case 'insights.html': { var n=0; try{ if(window.ALSInsights) n=(window.ALSInsights.compute()||[]).length; }catch(e){} return n?{hero:n,note:'patterns found'}:{hero:'—',note:'connecting'}; }
      case 'arxaia.html': { var st=ls('arxaia:v1',{}); var days=st.days||{}; var d=0; for(var n1=1;n1<=31;n1++){ if(days[n1]&&days[n1].done) d++; } return d?{hero:'day '+Math.min(d+1,31),txt:true,note:'/ 31 plan'}:{hero:'—',note:'start plan'}; }
      case 'istoria.html': { var st2=ls('istoria:v1',{}); var seen=st2.seen||{}, miss=st2.miss||{}, terms=0; for(var k in seen){ if(/^t/.test(k)&&seen[k].c>=2&&!(miss[k]>0)) terms++; } return terms?{hero:terms,note:'όρους έμαθες'}:{hero:'—',note:'Προσφυγικό'}; }
    }}catch(e){}
    return null;
  }
  function wSpark(W){ var a=(Array.isArray(W)?W:[]).slice(-12).map(function(e){return +e.weight||0;}).filter(function(x){return x>0;}); return a.length>=3?a:null; }
  function recSpark(L){ var a=(Array.isArray(L)?L:[]).filter(function(e){return e&&e.recovery!=null;}).slice(-12).map(function(e){return +e.recovery;}); return a.length>=3?a:null; }
  function sparkSVG(arr){
    var min=Math.min.apply(null,arr), max=Math.max.apply(null,arr), rng=(max-min)||1;
    var pts=arr.map(function(v,i){ var x=(i/(arr.length-1))*120; var y=22-((v-min)/rng)*18-2; return x.toFixed(1)+','+y.toFixed(1); }).join(' ');
    var last=pts.split(' ').pop().split(',');
    return '<div class="lx-spark"><svg viewBox="0 0 120 24" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polyline points="'+pts+'"/><circle class="pt" cx="'+last[0]+'" cy="'+last[1]+'" r="2" fill="currentColor" stroke="none"/></svg></div>';
  }

  /* ── render a tile's value block (real data) ── */
  function paint(tile){
    var h=href(tile); var m=metric(h); if(!m) return;
    var host=tile.querySelector('.lx-value'); if(!host){ host=document.createElement('div'); host.className='lx-value';
      var live=tile.querySelector('.tile-live'); if(live){ live.style.display='none'; live.parentNode.insertBefore(host, live.nextSibling); } else { tile.appendChild(host); } }
    var heroHtml = m.txt ? '<span class="lx-hero lx-hero-txt">'+m.hero+'</span>'
                         : '<span class="lx-hero" data-to="'+(typeof m.hero==='number'?m.hero:'')+'">'+(m.hero==='—'?'—':(typeof m.hero==='number'?'0':m.hero))+'</span>'+(m.unit?'<em>'+m.unit+'</em>':'');
    host.innerHTML = heroHtml + (m.spark?sparkSVG(m.spark):'');
    // count-up numbers
    var hn=host.querySelector('.lx-hero[data-to]');
    if(hn && hn.getAttribute('data-to')!=='' && !hn.dataset.done){ hn.dataset.done='1'; countUp(hn, m.unit); }
    // draw spark
    var pl=host.querySelector('.lx-spark polyline');
    if(pl && !reduce){ var L=pl.getTotalLength?pl.getTotalLength():200; pl.style.strokeDasharray=L; pl.style.strokeDashoffset=L; pl.getBoundingClientRect(); pl.style.transition='stroke-dashoffset 1.1s '+EASE; pl.style.strokeDashoffset='0'; }
  }
  function countUp(node,unit){
    var to=parseFloat(node.getAttribute('data-to')); if(isNaN(to)){ return; }
    var dec=(String(to).indexOf('.')>-1)?1:0, comma=to>=1000;
    if(reduce){ node.textContent=comma?fmtN(to):(dec?to.toFixed(1):to); return; }
    var st=performance.now(), dur=750;
    (function f(t){ var p=Math.min(1,(t-st)/dur); p=1-Math.pow(1-p,3); var v=to*p; node.textContent = comma?fmtN(Math.round(v)):(dec?v.toFixed(1):Math.round(v)); if(p<1) requestAnimationFrame(f); else node.textContent=comma?fmtN(to):(dec?to.toFixed(1):to); })(st);
  }

  /* ── inject icons + paint all existing tiles ── */
  document.querySelectorAll('.tile').forEach(function(t){
    var h=href(t), p=I[h]; if(p){ var top=t.querySelector('.tile-top')||t; var ic=document.createElement('span'); ic.className='lx-ic'; ic.innerHTML=svg(p); top.appendChild(ic); }
    paint(t);
  });

  /* ── Body cockpit: hide aggregate Body tile, inject Nutrition/Weight/Caffeine/Water ── */
  (function(){
    var bodyTile=document.querySelector('.tile[href="body.html"]'); if(!bodyTile) return;
    var grid=bodyTile.parentNode; if(!grid) return;
    bodyTile.style.display='none';
    var add=[['nutrition.html','Nutrition','fuel','wide'],['weight.html','Weight','vitals','wide'],['caffeine.html','Caffeine','intake',''],['po-water.html','Water','hydration',''],['health.html','Supplements','stack',''],['measure.html','Measure','body','']];
    add.forEach(function(c){
      if(grid.querySelector('.tile[href="'+c[0]+'"]')) return;
      var a=document.createElement('a'); a.className='tile lx-injected'+(c[3]?' '+c[3]:''); a.setAttribute('href',c[0]);
      a.innerHTML='<div class="tile-top"><span class="lx-ic">'+svg(I[c[0]]||'')+'</span></div><div class="lx-value"></div><div class="tile-title">'+c[1]+'</div><div class="tile-footer"><span class="tile-sub">'+c[2]+'</span></div>';
      grid.appendChild(a); paint(a);
    });
  })();

  /* ── re-paint on interval so data stays live (like the app does) ── */
  setInterval(function(){ document.querySelectorAll('.tile').forEach(function(t){ var host=t.querySelector('.lx-value'); if(host){ host.querySelectorAll('.lx-hero[data-to]').forEach(function(n){ delete n.dataset.done; }); } paint(t); }); }, 30000);

  /* ── Readiness ring (real recovery, hidden if none) ── */
  (function(){
    var rec=null;
    try{ var logs=ls('sleep:logs',[]); if(Array.isArray(logs)){ var today=logs.find(function(e){return e&&e.dateKey===tk();}); if(today&&today.recovery!=null) rec=today.recovery; else { var wr=logs.filter(function(e){return e&&e.recovery!=null;}).sort(function(a,b){return a.dateKey<b.dateKey?-1:1;}); if(wr.length) rec=wr[wr.length-1].recovery; } } }catch(e){}
    if(rec==null) return; rec=Math.max(0,Math.min(100,Math.round(rec)));
    var C=289, off=C*(1-rec/100);
    var line=rec>=67?'Recovery is high. A good day to spend energy.':rec>=45?'Recovery is moderate. Train smart, keep it steady.':'Recovery is low. Protect sleep and go easy today.';
    var wrap=document.createElement('div'); wrap.className='lx-ready lx-rise';
    wrap.innerHTML='<div class="ring"><svg viewBox="0 0 100 100"><defs><linearGradient id="lxrg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#3FE0B0"/><stop offset="100%" stop-color="#18C8C0"/></linearGradient></defs><circle class="rt" cx="50" cy="50" r="46"/><circle class="rf" cx="50" cy="50" r="46" stroke-dasharray="'+C+'" stroke-dashoffset="'+C+'"/></svg><div class="rc"><div class="rn">0</div><div class="rl">Readiness</div></div></div><div class="rtext"><div class="re">Today · readiness</div><div class="rd">'+line+'</div></div>';
    var anchor=document.querySelector('.hub-briefing-wrap')||document.querySelector('.hub-header');
    if(anchor&&anchor.parentNode){ anchor.parentNode.insertBefore(wrap, anchor.nextSibling);
      wrap._reveal=function(){ var rf=wrap.querySelector('.rf'), rn=wrap.querySelector('.rn'); if(reduce){ rf.style.strokeDashoffset=off; rn.textContent=rec; return; } requestAnimationFrame(function(){ rf.style.strokeDashoffset=off; }); var st=performance.now(); (function tick(now){ var p=Math.min(1,(now-st)/900); p=1-Math.pow(1-p,3); rn.textContent=Math.round(rec*p); if(p<1) requestAnimationFrame(tick); else rn.textContent=rec; })(st); };
    }
  })();

  /* ── Scroll-reveal + stagger ── */
  var groups=[];
  ['.hub-header','.hub-briefing-wrap','.view-switch','.lx-ready','.status-strip','.bento-section','.xp-wrap','.intel-wrap','.vault-wrap'].forEach(function(sel){ document.querySelectorAll(sel).forEach(function(el){ el.classList.add('lx-rise'); groups.push(el); }); });
  function revealEl(el){ el.classList.add('in'); if(el._reveal) try{el._reveal();}catch(e){} var tiles=el.querySelectorAll?el.querySelectorAll('.tile'):[]; Array.prototype.forEach.call(tiles,function(t,i){ t.classList.add('lx-rise'); t.style.transitionDelay=(reduce?0:i*55)+'ms'; requestAnimationFrame(function(){ t.classList.add('in'); }); }); }
  if('IntersectionObserver' in window){ var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ io.unobserve(e.target); revealEl(e.target); } }); },{threshold:0.1, rootMargin:'0px 0px -6% 0px'}); groups.forEach(function(el){ io.observe(el); }); setTimeout(function(){ groups.forEach(function(el){ if(!el.classList.contains('in')) revealEl(el); }); },3000); } else groups.forEach(revealEl);

  /* ── Peek ── */
  var DIR={'gym.html':'Your training hub. Recovery today decides how hard to push.','pr.html':'Every all-time best in one place. Beat one this week.','nutrition.html':'Fuel drives everything else. Hit protein first.','sleep.html':'Recovery is downstream of sleep. Protect tonight’s window.','weight.html':'The long trend matters more than any single day.','caffeine.html':'Keep it before 2pm so it doesn’t cost you sleep.','po-water.html':'Small sips, all day. Hit your target.','main.html':'Today’s plan and targets. Small wins compound.','identity.html':'Who you’re becoming: north star, habits, journal.','ideas.html':'Capture it before it’s gone.','improve.html':'One thing worth learning, queued.','finance.html':'Net worth and spending, tracked over time.','bills.html':'What’s due and when. Keep the no-spend streak.','movies.html':'Rate what you watch, build the next pick.','arc.html':'Your whole story, drawn from the data.','trends.html':'The long view. Direction beats any single day.','insights.html':'Cross-domain patterns Nova found in your data.','arxaia.html':'Άγνωστο, ένα βήμα την ημέρα.','istoria.html':'Όροι και νόημα, ενότητα-ενότητα.'};
  var dlg=document.createElement('dialog'); dlg.className='lx-peekdlg'; document.body.appendChild(dlg);
  dlg.addEventListener('click',function(e){ if(e.target===dlg) dlg.close(); });
  function openPeek(t){ var h=href(t); var name=(t.querySelector('.tile-title')||{}).textContent||''; var host=t.querySelector('.lx-value'); var val=host?host.textContent:''; var sub=(t.querySelector('.tile-sub')||{}).textContent||''; var dir=DIR[h]||('Open '+name+' to see the full view.');
    dlg.innerHTML='<div class="lx-peekbody"><button class="lx-peek-x" aria-label="Close">×</button><div class="lx-peek-ey">'+sub+'</div>'+(val?'<div class="lx-peek-val">'+val+'</div>':'')+'<div class="lx-peek-name">'+name+'</div><div class="lx-peek-dir">'+dir+'</div><a class="lx-peek-open" href="'+h+'">Open '+name+' →</a></div>';
    dlg.querySelector('.lx-peek-x').addEventListener('click',function(){ dlg.close(); }); if(typeof dlg.showModal==='function') dlg.showModal(); else location.href=h; }
  function addPeek(t){ if(!I[href(t)]) return; var b=document.createElement('span'); b.className='lx-peek'; b.setAttribute('role','button'); b.tabIndex=0; b.setAttribute('aria-label','Peek');
    b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14v6h6"/><path d="M20 10V4h-6"/><path d="M14 10l6-6"/><path d="M10 14l-6 6"/></svg>';
    function fire(e){ e.preventDefault(); e.stopPropagation(); haptic(6); openPeek(t); } b.addEventListener('click',fire); b.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' ') fire(e); }); t.appendChild(b);
    t.addEventListener('pointerdown',function(){ haptic(6); },{passive:true});
    t.addEventListener('pointermove',function(e){ var r=t.getBoundingClientRect(); t.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%'); t.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%'); },{passive:true}); }
  document.querySelectorAll('.tile').forEach(addPeek);

  /* #14 · bottom nav (matches the demo) */
  (function(){ if(document.querySelector('.lx-nav')) return; var nav=document.createElement('nav'); nav.className='lx-nav'; nav.innerHTML='<a class="on" href="index.html">Home</a><a href="body.html">Body</a><a href="identity.html">Mind</a><a href="finance.html">Money</a><a href="nova-chat.html">Nova</a>'; document.body.appendChild(nav); })();

  /* #30 · skeleton shimmer on the intelligence feed until the engine fills it */
  (function(){ var g=document.getElementById('intelGrid'); if(g && (!g.children.length || g.querySelector('.intel-empty'))){ var row='<div class="lx-skelrow"><span class="lx-skel lx-skic"></span><span class="lx-skel lx-skl1"></span></div>'; g.innerHTML=row+row+row; } })();
})();
