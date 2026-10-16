/* kentro-exit.js — η έξοδος προς το Κέντρο είναι ΕΠΙΣΤΡΟΦΗ, και κινείται σαν επιστροφή (als-v622).
   Για τις σελίδες ΧΩΡΙΣ topbar.js (arxaia-agnosto · istoria-voithima · ergasies): εκεί κανείς
   δεν ξέρει ότι το «← School Studies» είναι Back, οπότε η μετάβαση θα έπαιζε «μπρος».
   Δεν κάνει preventDefault — ο σύνδεσμος πλοηγεί κανονικά· απλώς δηλώνει την κατεύθυνση:
     · html.vt-back  → η View Transition της ΠΑΛΙΑΣ σελίδας παίζει το «πίσω» (kentro-exit.css)
     · _tbBackIn     → η ΝΕΑ σελίδα (topbar.js) παίζει την αντίστροφη είσοδο */
(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a.kx-exit') : null;
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button > 0) return;
    try { sessionStorage.setItem('_tbBackIn', '1'); } catch (err) {}
    document.documentElement.classList.add('vt-back');
  });
  window.addEventListener('pageshow', function (ev) {
    if (ev.persisted) document.documentElement.classList.remove('vt-back');
  });
})();
