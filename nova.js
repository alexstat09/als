/* ════════════════════════════════════════════════════════════════
   Nova — floating cross-page companion (level 2).
   Self-injects a fixed, mood-reactive Nova into any page that includes it.
   - Glow + aura shift with the day's logged data (low/calm/hot/alert).
   - Idle "life": occasional look-around.
   - Tap-to-talk: Nova speaks a real, data-driven line in its serif voice.
   Reads localStorage only — never writes, never touches page logic.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__novaFab) return;
  window.__novaFab = true;

  function ls(k){ try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } }
  function tk(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }

  /* Pull today's signals once, reused for mood + message */
  function signals(){
    var h = new Date().getHours();
    var wts = ls('po_coach_weights') || [];
    var wToday = Array.isArray(wts) && wts.some(function(e){ return e && e.dateKey === tk(); });
    var pw = ls('po_water_v1') || {};
    var wc = ((pw.logs||{})[tk()]) || 0;
    var dawn = new Date(); dawn.setHours(0,0,0,0);
    var caf = (ls('caf:logs')||[]).filter(function(l){ return new Date(l.ts) >= dawn; }).reduce(function(s,l){ return s + (l.mg||0); }, 0);
    var nut = (ls('nut:logs')||[]).filter(function(l){ return new Date(l.ts) >= dawn; });
    var kcal = nut.reduce(function(s,l){ return s + (l.kcal||0); }, 0);
    var logged = (wToday?1:0) + (wc>0?1:0) + (caf>0?1:0) + (kcal>0?1:0);
    return { h:h, wToday:wToday, wc:wc, caf:caf, kcal:kcal, mealCount:nut.length, logged:logged };
  }

  function mood(s){
    if (s.h < 12 && s.logged === 0) return 'low';
    if (s.caf >= 400)               return 'alert';
    if (s.logged >= 3)              return 'hot';
    if (s.wToday)                   return 'hot';
    return 'calm';
  }

  /* A real, contextual line — Nova's voice (no emoji, on-brand) */
  function message(s){
    if (s.caf >= 400) return 'That’s ' + s.caf + 'mg of caffeine today — ease off and drink some water.';
    if (s.h < 12 && s.logged === 0) return 'Morning. Let’s start the day — a weigh-in, or your first water?';
    if (!s.wToday && s.h >= 9) return 'No weigh-in yet today. Want to log it?';
    if (s.wc > 0 && s.wc < 4) return 'You’re at ' + s.wc + ' so far on water — keep it flowing.';
    if (s.logged >= 3) return 'You’re on top of it today. I’m proud of you.';
    if (s.mealCount === 0 && s.h >= 13) return 'Nothing logged for food yet — don’t forget to eat.';
    if (s.wToday && s.logged < 3) return 'Weight’s in. A few more things to log when you’re ready.';
    return 'Everything’s looking steady. I’m right here if you need me.';
  }

  /* ── Build Nova ── */
  var fab = document.createElement('div');
  fab.id = 'novaFab';
  fab.setAttribute('aria-label', 'Nova');
  fab.innerHTML =
    '<svg viewBox="0 0 100 100">' +
      '<defs><linearGradient id="novaFabGrad" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#34E2B0"/><stop offset="100%" stop-color="#9B8CFF"/>' +
      '</linearGradient></defs>' +
      '<g class="nova-glow">' +
        '<rect x="22" y="22" width="56" height="56" rx="16" transform="rotate(45 50 50)" fill="url(#novaFabGrad)" opacity="0.95"/>' +
        '<circle class="nova-eye" cx="42" cy="50" r="5.5" fill="#04130D"/>' +
        '<circle class="nova-eye" cx="58" cy="50" r="5.5" fill="#04130D"/>' +
        '<circle cx="43.4" cy="48.5" r="1.6" fill="#fff"/>' +
        '<circle cx="59.4" cy="48.5" r="1.6" fill="#fff"/>' +
      '</g>' +
    '</svg>';

  // Alert badge — pulses when Nova has something worth your attention.
  var badge = document.createElement('span');
  badge.id = 'novaBadge';
  badge.className = 'nova-badge';
  fab.appendChild(badge);

  var bubble = document.createElement('div');
  bubble.className = 'nova-bubble';
  bubble.setAttribute('aria-live', 'polite');

  var hideTimer = null;
  function setMoodClass(){ fab.className = 'nova-fab nova au-mood-' + mood(signals()); }

  function speak(){
    var s = signals();
    bubble.className = 'nova-bubble au-mood-' + mood(s);
    bubble.textContent = message(s);
    // force reflow then show (so transition runs even if re-tapped)
    void bubble.offsetWidth;
    bubble.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 5200);
  }
  function bubbleSpeak(text){
    var s = signals();
    bubble.className = 'nova-bubble au-mood-' + mood(s);
    bubble.textContent = text;
    void bubble.offsetWidth;
    bubble.classList.add('show');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 6800);
  }
  function hide(){ bubble.classList.remove('show'); }

  /* ── Proactive intelligence (no tap required) ───────────────── */
  function briefLine(fallback){
    try { if (window.NovaCoach && window.NovaCoach.brief) { var b = window.NovaCoach.brief(); if (b && b.headline) return b.headline; } } catch(e){}
    return fallback;
  }
  function sleptToday(){ return (ls('sleep:logs')||[]).some(function(e){ return e && e.dateKey===tk() && (e.hours>0 || e.quality!=null); }); }
  function trainedToday(){ return (ls('po_workouts')||[]).some(function(w){ return w && w.date===tk(); }); }
  function isoWk(){ var d=new Date(); var day=(d.getDay()+6)%7; var x=new Date(d); x.setDate(d.getDate()-day+3); var f=new Date(x.getFullYear(),0,4); var w=1+Math.round(((x-f)/86400000 - 3 + ((f.getDay()+6)%7))/7); return x.getFullYear()+'-W'+String(w).padStart(2,'0'); }
  function letterDue(){ try { return !!(window.NovaCoach && window.NovaCoach.letter && window.NovaCoach.letter() && localStorage.getItem('nova_letter_week')!==isoWk()); } catch(e){ return false; } }

  function urgent(){
    var h = new Date().getHours();
    if (h>=6 && h<12 && !sleptToday()) return true;       // morning: sleep not logged
    if (letterDue()) return true;                          // unread weekly letter
    try { if (window.NovaCoach && window.NovaCoach.brief) { var b = window.NovaCoach.brief(); if (b && b.cards && b.cards[0] && b.cards[0].p>=80) return true; } } catch(e){}
    return false;
  }
  function updateBadge(){ if (badge) badge.style.display = urgent() ? 'block' : 'none'; }

  function eveningLine(){
    if (trainedToday()) return 'Good work today — you trained and showed up. Now get real sleep and let it pay you back.';
    var s = signals();
    if (s.logged>=3) return 'Solid day of staying on top of things. Wind down, hydrate, aim for an early night.';
    return 'Winding down. Log what’s left when you can, then rest — tomorrow is built on tonight’s sleep.';
  }
  function proactive(){
    var h = new Date().getHours(), t = tk();
    if (h>=5 && h<12 && !ls('nova_morning:'+t)) {
      try { localStorage.setItem('nova_morning:'+t, '1'); } catch(e){}
      setTimeout(function(){ bubbleSpeak(sleptToday() ? briefLine(message(signals())) : 'Morning, Alex. How did you sleep? Tap me to log it.'); }, 1500);
      return true;
    }
    if (h>=20 && !ls('nova_evening:'+t)) {
      try { localStorage.setItem('nova_evening:'+t, '1'); } catch(e){}
      setTimeout(function(){ bubbleSpeak(eveningLine()); }, 1500);
      return true;
    }
    return false;
  }

  fab.addEventListener('click', function(){
    fab.classList.add('nova-poke');
    setTimeout(function(){ fab.classList.remove('nova-poke'); }, 600);
    if (window.NovaCoach) { hide(); window.NovaCoach.open(); setTimeout(updateBadge, 100); }
    else if (bubble.classList.contains('show')) hide(); else speak();
  });

  function lookAround(){
    fab.classList.add('nova-look');
    setTimeout(function(){ fab.classList.remove('nova-look'); }, 1500);
  }

  function mount(){
    if (!document.body || document.getElementById('novaFab')) return;
    document.body.appendChild(fab);
    document.body.appendChild(bubble);
    setMoodClass();
    updateBadge();
    // Proactive: morning check-in / evening reflection (once per day each).
    var fired = false;
    try { fired = proactive(); } catch(e){}
    // Otherwise, a gentle once-per-session intro.
    if (!fired) {
      try {
        if (!sessionStorage.getItem('nova_greeted')) {
          sessionStorage.setItem('nova_greeted', '1');
          setTimeout(speak, 1600);
        }
      } catch(e) { setTimeout(speak, 1600); }
    }
    // idle life
    setInterval(function(){ if (!document.hidden && Math.random() < 0.5) lookAround(); }, 14000);
  }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);

  function tick(){ setMoodClass(); updateBadge(); }
  document.addEventListener('visibilitychange', function(){ if (!document.hidden) tick(); });
  window.addEventListener('focus', tick);
  setInterval(tick, 30000);
})();
