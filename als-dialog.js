// ════════════════════════════════════════════════════════════════
// Shared on-brand dialogs — the aurora replacement for the ugly white
// native alert()/confirm()/prompt() iOS system pop-ups.
//
// Renders in the browser TOP LAYER via a real <dialog> + showModal(), so
// (like gym/nutrition) it is immune to ancestor `transform` that pushes
// position:fixed modals off-screen. Styled to match ALSToast / aurora.
//
// Self-injecting: topbar.js loads it everywhere; nova-chat etc. load it
// directly. All three return a Promise (native versions were synchronous,
// so call sites must `await` / `.then`):
//
//   if (await ALSConfirm('Delete this template?')) { ... }          // → boolean
//   await ALSAlert('Saved.', 'ok');                                  // → undefined
//   var name = await ALSPrompt('Template name', 'Push Day');         // → string | null
//
// Object form for more control:
//   await ALSConfirm({ title:'Delete template?', message:'This can’t be undone.',
//                      confirmText:'Delete', danger:true });
//   await ALSPrompt({ title:'Rename', placeholder:'New name', value:'Old',
//                     type:'text', confirmText:'Save' });
//
// Esc / backdrop / Cancel → resolves false (confirm) or null (prompt).
// Never throws; falls back to native if <dialog> is somehow unavailable.
// ════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  if (window.ALSDialog) return;

  function injectStyle() {
    if (document.getElementById('als-dialog-style')) return;
    var css = '' +
      '#als-dlg{border:none;padding:0;background:transparent;color:#F4F1EA;max-width:none;max-height:none;' +
        'overflow:visible;outline:none;}' +
      '#als-dlg::backdrop{background:rgba(4,4,6,.62);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);}' +
      '.als-dlg-card{width:min(420px,calc(100vw - 32px));box-sizing:border-box;' +
        'font-family:var(--au-sans,-apple-system,system-ui,sans-serif);' +
        'background:rgba(20,20,24,.97);border:1px solid rgba(255,255,255,.10);border-radius:18px;' +
        'box-shadow:0 24px 70px rgba(0,0,0,.6);padding:22px 22px 18px;' +
        'transform:translateY(10px) scale(.98);opacity:0;transition:transform .24s cubic-bezier(.2,.8,.2,1),opacity .24s;}' +
      '#als-dlg[open] .als-dlg-card{transform:translateY(0) scale(1);opacity:1;}' +
      '.als-dlg-title{font-size:16px;font-weight:650;letter-spacing:-.01em;margin:0 0 6px;color:#F4F1EA;}' +
      '.als-dlg-msg{font-size:13.5px;line-height:1.5;color:rgba(244,241,234,.72);margin:0;word-break:break-word;white-space:pre-wrap;}' +
      '.als-dlg-input{width:100%;box-sizing:border-box;margin-top:14px;padding:11px 13px;border-radius:12px;' +
        'background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.14);color:#F4F1EA;' +
        'font-family:inherit;font-size:14px;outline:none;transition:border-color .18s;}' +
      '.als-dlg-input:focus{border-color:rgba(52,226,176,.55);}' +
      '.als-dlg-btns{display:flex;gap:10px;margin-top:20px;justify-content:flex-end;}' +
      '.als-dlg-btn{flex:0 0 auto;min-width:84px;padding:10px 16px;border-radius:12px;border:1px solid transparent;' +
        'font-family:inherit;font-size:13.5px;font-weight:600;cursor:pointer;transition:filter .15s,background .15s;' +
        '-webkit-tap-highlight-color:transparent;}' +
      '.als-dlg-btn.cancel{background:rgba(255,255,255,.07);color:#F4F1EA;border-color:rgba(255,255,255,.12);}' +
      '.als-dlg-btn.cancel:hover{background:rgba(255,255,255,.12);}' +
      '.als-dlg-btn.ok{background:#34E2B0;color:#06241c;}' +
      '.als-dlg-btn.ok:hover{filter:brightness(1.06);}' +
      '.als-dlg-btn.danger{background:#FF6B8B;color:#2a0710;}' +
      '.als-dlg-btn.danger:hover{filter:brightness(1.06);}' +
      '@media(max-width:480px){.als-dlg-btns{flex-direction:column-reverse;}.als-dlg-btn{width:100%;}}';
    var st = document.createElement('style'); st.id = 'als-dialog-style'; st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  }

  function supported() {
    try { return typeof HTMLDialogElement !== 'undefined' && document.createElement('dialog').showModal; }
    catch (e) { return false; }
  }

  // Normalize the (message[, secondArg]) | (optionsObject) call shapes.
  function opts(a, b, kind) {
    var o = (a && typeof a === 'object') ? a : {};
    if (typeof a !== 'object') o.message = (a == null ? '' : String(a));
    if (kind === 'prompt' && typeof a !== 'object' && b != null) o.value = String(b);
    if (kind === 'alert'  && typeof a !== 'object' && b) o.tone = b; // ALSAlert(msg,'ok')
    return o;
  }

  // Core renderer. kind: 'confirm' | 'alert' | 'prompt'.
  function open(o, kind) {
    return new Promise(function (resolve) {
      // Graceful fallback if <dialog> truly unavailable.
      if (!supported()) {
        if (kind === 'prompt') return resolve(window.prompt(o.message || '', o.value || ''));
        if (kind === 'alert') { window.alert(o.message || ''); return resolve(); }
        return resolve(window.confirm(o.message || ''));
      }
      injectStyle();

      var dlg = document.createElement('dialog');
      dlg.id = 'als-dlg';
      var card = document.createElement('div'); card.className = 'als-dlg-card';

      if (o.title) {
        var h = document.createElement('div'); h.className = 'als-dlg-title'; h.textContent = o.title;
        card.appendChild(h);
      }
      if (o.message) {
        var m = document.createElement('div'); m.className = 'als-dlg-msg'; m.textContent = o.message;
        card.appendChild(m);
      }

      var input = null;
      if (kind === 'prompt') {
        input = document.createElement('input'); input.className = 'als-dlg-input';
        input.type = o.type || 'text';
        if (o.placeholder) input.placeholder = o.placeholder;
        if (o.value != null) input.value = o.value;
        if (o.inputmode) input.setAttribute('inputmode', o.inputmode);
        card.appendChild(input);
      }

      var done = false;
      function finish(val) {
        if (done) return; done = true;
        card.style.opacity = '0'; card.style.transform = 'translateY(10px) scale(.98)';
        setTimeout(function () { try { dlg.close(); } catch (e) {} if (dlg.parentNode) dlg.parentNode.removeChild(dlg); }, 180);
        resolve(val);
      }
      var CANCEL = (kind === 'prompt') ? null : (kind === 'alert' ? undefined : false);
      function confirmVal() { return (kind === 'prompt') ? (input ? input.value : '') : (kind === 'alert' ? undefined : true); }

      var btns = document.createElement('div'); btns.className = 'als-dlg-btns';
      if (kind !== 'alert') {
        var cancel = document.createElement('button'); cancel.type = 'button';
        cancel.className = 'als-dlg-btn cancel'; cancel.textContent = o.cancelText || 'Cancel';
        cancel.addEventListener('click', function () { finish(CANCEL); });
        btns.appendChild(cancel);
      }
      var ok = document.createElement('button'); ok.type = 'button';
      ok.className = 'als-dlg-btn ' + (o.danger ? 'danger' : 'ok');
      ok.textContent = o.confirmText || (kind === 'alert' ? 'OK' : (kind === 'prompt' ? 'Save' : 'Confirm'));
      ok.addEventListener('click', function () { finish(confirmVal()); });
      btns.appendChild(ok);
      card.appendChild(btns);

      dlg.appendChild(card);
      (document.body || document.documentElement).appendChild(dlg);

      // Esc (dialog 'cancel') → treat as Cancel. Backdrop click → Cancel.
      dlg.addEventListener('cancel', function (e) { e.preventDefault(); finish(CANCEL); });
      dlg.addEventListener('mousedown', function (e) { if (e.target === dlg) finish(CANCEL); });
      // Enter in a prompt → confirm.
      if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); finish(confirmVal()); } });

      try { dlg.showModal(); } catch (e) { finish(CANCEL); return; }
      requestAnimationFrame(function () { card.style.opacity = '1'; card.style.transform = 'translateY(0) scale(1)';
        if (input) { input.focus(); input.select && input.select(); } else ok.focus(); });
    });
  }

  var API = {
    confirm: function (a, b) { return open(opts(a, b, 'confirm'), 'confirm'); },
    alert:   function (a, b) { return open(opts(a, b, 'alert'), 'alert'); },
    prompt:  function (a, b) { return open(opts(a, b, 'prompt'), 'prompt'); }
  };
  window.ALSDialog  = API;
  window.ALSConfirm = API.confirm;
  window.ALSAlert   = API.alert;
  window.ALSPrompt  = API.prompt;
})();
