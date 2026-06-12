/* ════════════════════════════════════════════════════════════════
   Nova — floating cross-page companion.
   Self-injects a fixed, mood-reactive Nova into any page that includes it
   (the inner pages; the hub & Body have their own inline Nova in the hero).
   Its glow shifts with the day's logged data, exactly like the hero Nova.
   Reads localStorage only — never writes, never touches page logic.
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.__novaFab) return;
  window.__novaFab = true;

  function ls(k){ try { return JSON.parse(localStorage.getItem(k)); } catch(e){ return null; } }
  function tk(){ var d=new Date(); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }

  function mood(){
    var h = new Date().getHours();
    var wts = ls('po_coach_weights') || [];
    var wToday = Array.isArray(wts) && wts.some(function(e){ return e && e.dateKey === tk(); });
    var pw = ls('po_water_v1') || {};
    var wc = ((pw.logs||{})[tk()]) || 0;
    var dawn = new Date(); dawn.setHours(0,0,0,0);
    var caf = (ls('caf:logs')||[]).filter(function(l){ return new Date(l.ts) >= dawn; }).reduce(function(s,l){ return s + (l.mg||0); }, 0);
    var kcal = (ls('nut:logs')||[]).filter(function(l){ return new Date(l.ts) >= dawn; }).reduce(function(s,l){ return s + (l.kcal||0); }, 0);
    var logged = (wToday?1:0) + (wc>0?1:0) + (caf>0?1:0) + (kcal>0?1:0);
    if (h < 12 && logged === 0) return 'low';
    if (caf >= 400)             return 'alert';
    if (logged >= 3)            return 'hot';
    if (wToday)                 return 'hot';
    return 'calm';
  }

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

  function setMood(){ fab.className = 'nova-fab nova au-mood-' + mood(); }
  setMood();

  fab.addEventListener('click', function(){
    fab.classList.add('nova-poke');
    setTimeout(function(){ fab.classList.remove('nova-poke'); }, 600);
  });

  function mount(){ if (document.body && !document.getElementById('novaFab')) document.body.appendChild(fab); }
  if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);

  document.addEventListener('visibilitychange', function(){ if (!document.hidden) setMood(); });
  window.addEventListener('focus', setMood);
  setInterval(setMood, 30000);
})();
