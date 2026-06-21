// =============================================================
// Nova Life — gives the Nova orb reactive states across the app.
//
// Phase 3 of the motion glow-up. Nova already floats + blinks (aurora.css);
// this adds the *reactive* states — thinking, listening, happy — and a tiny
// global API so any page can drive them:
//     Nova.think()   — generating a reply (spinning glow ring)
//     Nova.listen()  — attending to you (ripple ring)
//     Nova.idle()    — back to calm
//     Nova.happy()   — a one-shot celebratory bounce (PRs, wins)
//
// Targets the inline / header Nova orbs only — NOT the floating FAB, whose
// className is rewritten on a timer by nova.js (toggling state classes there
// would just get wiped). The states are pure CSS; this only toggles classes.
// =============================================================
(function () {
  'use strict';
  if (window.Nova) return;

  // header / inline orbs; never the FAB (.nova-fab) — nova.js owns that one.
  function orbs() {
    return Array.prototype.slice.call(document.querySelectorAll('.nova:not(.nova-fab), [data-nova]'))
      .filter(function (el) { return el && !el.classList.contains('nova-fab'); });
  }

  function setState(state) {
    orbs().forEach(function (el) {
      el.classList.remove('is-thinking', 'is-listening');
      if (state === 'thinking') el.classList.add('is-thinking');
      else if (state === 'listening') el.classList.add('is-listening');
    });
  }

  function happy() {
    orbs().forEach(function (el) {
      el.classList.remove('is-happy');
      void el.offsetWidth; // restart the animation if it's mid-flight
      el.classList.add('is-happy');
      setTimeout(function () { el.classList.remove('is-happy'); }, 760);
    });
  }

  window.Nova = {
    think: function () { setState('thinking'); },
    listen: function () { setState('listening'); },
    idle: function () { setState(null); },
    happy: happy,
    // expose for testing / introspection
    _orbCount: function () { return orbs().length; }
  };
})();
