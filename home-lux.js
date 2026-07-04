/* ══════════════════════════════════════════════════════════════
   AURORA — luxury HOME decorator. Additive only: injects line icons,
   a live readiness ring, scroll-reveal, peek + haptics. Reads real
   data; never writes app state or touches existing element IDs.
   ══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE='cubic-bezier(0.16,1,0.3,1)';
  function ls(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){ return null; } }
  function todayKey(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  function haptic(ms){ try{ if(navigator.vibrate){ navigator.vibrate(ms||6); } }catch(e){} }

  /* ── line icons by destination ── */
  var I={
    'gym.html':'<rect x="1.5" y="9" width="3" height="6" rx="1"/><rect x="19.5" y="9" width="3" height="6" rx="1"/><rect x="4.5" y="10" width="2" height="4" rx=".5"/><rect x="17.5" y="10" width="2" height="4" rx=".5"/><line x1="6.5" y1="12" x2="17.5" y2="12"/>',
    'pr.html':'<path d="M7 4h10v4a5 5 0 0 1-10 0Z"/><path d="M7 6H4.2v.8A3 3 0 0 0 7 10"/><path d="M17 6h2.8v.8A3 3 0 0 1 17 10"/><line x1="12" y1="13" x2="12" y2="16.5"/><path d="M8.5 20h7"/><path d="M9.5 20a2.5 2.5 0 0 1 5 0"/>',
    'body.html':'<path d="M3 12h4l2-5 4 10 2-5h6"/>',
    'sleep.html':'<path d="M21 12.8A8 8 0 1 1 11.2 3 6 6 0 0 0 21 12.8Z"/>',
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

  /* inject a line icon into each tile (emoji hidden via CSS) */
  document.querySelectorAll('.tile').forEach(function(t){
    var h=href(t), p=I[h]; if(!p) return;
    var top=t.querySelector('.tile-top')||t;
    var ic=document.createElement('span'); ic.className='lx-ic'; ic.innerHTML=svg(p);
    top.appendChild(ic);
  });

  /* ── Readiness ring — real recovery, hidden when unknown ── */
  (function(){
    var rec=null;
    try{
      var logs=ls('sleep:logs')||[]; if(Array.isArray(logs)){
        var t=todayKey();
        var today=logs.find(function(e){return e&&e.dateKey===t;});
        if(today && today.recovery!=null) rec=today.recovery;
        else { var withRec=logs.filter(function(e){return e&&e.recovery!=null;}).sort(function(a,b){return a.dateKey<b.dateKey?-1:1;}); if(withRec.length) rec=withRec[withRec.length-1].recovery; }
      }
    }catch(e){}
    if(rec==null) return; /* honest: no ring without real data */
    rec=Math.max(0,Math.min(100,Math.round(rec)));
    var C=289, off=C*(1-rec/100);
    var line = rec>=67?'Recovery is high. A good day to spend energy.' : rec>=45?'Recovery is moderate. Train smart, keep it steady.' : 'Recovery is low. Protect sleep and go easy today.';
    var wrap=document.createElement('div'); wrap.className='lx-ready lx-rise';
    wrap.innerHTML='<div class="ring"><svg viewBox="0 0 100 100"><defs><linearGradient id="lxrg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#3FE0B0"/><stop offset="100%" stop-color="#18C8C0"/></linearGradient></defs><circle class="rt" cx="50" cy="50" r="46"/><circle class="rf" cx="50" cy="50" r="46" stroke-dasharray="'+C+'" stroke-dashoffset="'+C+'"/></svg><div class="rc"><div class="rn">0</div><div class="rl">Readiness</div></div></div>'
      +'<div class="rtext"><div class="re">Today · readiness</div><div class="rd">'+line+'</div></div>';
    var anchor=document.querySelector('.hub-briefing-wrap')||document.querySelector('.hub-header');
    if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(wrap, anchor.nextSibling);
    /* animate when revealed */
    wrap._reveal=function(){
      var rf=wrap.querySelector('.rf'), rn=wrap.querySelector('.rn');
      if(reduce){ rf.style.strokeDashoffset=off; rn.textContent=rec; return; }
      requestAnimationFrame(function(){ rf.style.strokeDashoffset=off; });
      var st=performance.now(), dur=900;
      (function tick(now){ var p=Math.min(1,(now-st)/dur); p=1-Math.pow(1-p,3); rn.textContent=Math.round(rec*p); if(p<1) requestAnimationFrame(tick); else rn.textContent=rec; })(st);
    };
  })();

  /* ── Scroll-reveal with stagger ── */
  var groups=[];
  ['.hub-header','.hub-briefing-wrap','.view-switch','.lx-ready','.status-strip','.bento-section','.xp-wrap','.intel-wrap','.vault-wrap'].forEach(function(sel){
    document.querySelectorAll(sel).forEach(function(el){ el.classList.add('lx-rise'); groups.push(el); });
  });
  function revealEl(el){
    el.classList.add('in');
    if(el._reveal) try{ el._reveal(); }catch(e){}
    var tiles=el.querySelectorAll?el.querySelectorAll('.tile'):[];
    Array.prototype.forEach.call(tiles,function(t,i){ t.classList.add('lx-rise'); t.style.transitionDelay=(reduce?0:i*55)+'ms'; requestAnimationFrame(function(){ t.classList.add('in'); }); });
  }
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(ents){ ents.forEach(function(e){ if(e.isIntersecting){ io.unobserve(e.target); revealEl(e.target); } }); },{threshold:0.1, rootMargin:'0px 0px -6% 0px'});
    groups.forEach(function(el){ io.observe(el); });
    /* safety: reveal anything still hidden after 3s */
    setTimeout(function(){ groups.forEach(function(el){ if(!el.classList.contains('in')) revealEl(el); }); }, 3000);
  } else { groups.forEach(revealEl); }

  /* ── Peek (progressive disclosure) via native <dialog> ── */
  var DIR={
    'gym.html':'Your training hub. Recovery today decides how hard to push.',
    'pr.html':'Every all-time best in one place. Beat one this week.',
    'body.html':'Weight, water, caffeine and nutrition at a glance.',
    'sleep.html':'Recovery is downstream of sleep. Protect tonight’s window.',
    'nutrition.html':'Fuel drives everything else. Hit protein first.',
    'main.html':'Today’s plan and targets. Small wins compound.',
    'identity.html':'Who you’re becoming: north star, habits, journal.',
    'ideas.html':'Capture it before it’s gone.',
    'improve.html':'One thing worth learning, queued.',
    'finance.html':'Net worth and spending, tracked over time.',
    'bills.html':'What’s due and when. Keep the no-spend streak.',
    'movies.html':'Rate what you watch, build the next pick.',
    'arc.html':'Your whole story, drawn from the data.',
    'trends.html':'The long view. Direction beats any single day.',
    'insights.html':'Cross-domain patterns Nova found in your data.',
    'arxaia.html':'Άγνωστο, ένα βήμα την ημέρα.',
    'istoria.html':'Όροι και νόημα, ενότητα-ενότητα.'
  };
  var dlg=document.createElement('dialog'); dlg.className='lx-peekdlg'; document.body.appendChild(dlg);
  dlg.addEventListener('click',function(e){ if(e.target===dlg) dlg.close(); });
  function openPeek(t){
    var h=href(t);
    var name=(t.querySelector('.tile-title')||{}).textContent||'';
    var val=(t.querySelector('.tile-live')||{}).textContent||'';
    var sub=(t.querySelector('.tile-sub')||{}).textContent||'';
    var dir=DIR[h]||('Open '+name+' to see the full view.');
    dlg.innerHTML='<div class="lx-peekbody"><button class="lx-peek-x" aria-label="Close">×</button>'
      +'<div class="lx-peek-ey">'+sub+'</div>'
      +(val?'<div class="lx-peek-val">'+val+'</div>':'')
      +'<div class="lx-peek-name">'+name+'</div>'
      +'<div class="lx-peek-dir">'+dir+'</div>'
      +'<a class="lx-peek-open" href="'+h+'">Open '+name+' →</a></div>';
    dlg.querySelector('.lx-peek-x').addEventListener('click',function(){ dlg.close(); });
    if(typeof dlg.showModal==='function') dlg.showModal(); else location.href=h;
  }
  document.querySelectorAll('.tile').forEach(function(t){
    if(!I[href(t)]) return;
    t.style.position=t.style.position||'relative';
    var b=document.createElement('span'); b.className='lx-peek'; b.setAttribute('role','button'); b.tabIndex=0; b.setAttribute('aria-label','Peek');
    b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14v6h6"/><path d="M20 10V4h-6"/><path d="M14 10l6-6"/><path d="M10 14l-6 6"/></svg>';
    function fire(e){ e.preventDefault(); e.stopPropagation(); haptic(6); openPeek(t); }
    b.addEventListener('click',fire);
    b.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' ') fire(e); });
    t.appendChild(b);
  });

  /* ── Subtle haptics on press ── */
  document.querySelectorAll('.tile, .hub-briefing-btn, .vault-wrap').forEach(function(el){
    el.addEventListener('pointerdown',function(){ haptic(6); },{passive:true});
  });
})();
