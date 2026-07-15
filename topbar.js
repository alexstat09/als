// =============================================================
// Persistent dashboard top bar + bottom tab bar.
// Drop this on any page with:
//     <script src="topbar.js" defer></script>
// It self-injects HTML + CSS, reads progress from localStorage,
// and renders the water +1 button in the top bar plus the
// Main/Health/Fitness bottom tabs. Skips chrome on finance.html
// and inside iframes (so the water tracker can embed cleanly).
// =============================================================
(function () {
  'use strict';

  // ── Aurora motion engine: load the shared animation engine on every page.
  // One injection here → every page that includes topbar.js gets motion.
  // The engine is self-sufficient (no GSAP needed for its core primitives).
  (function loadAuroraMotion(){ try {
    if (window.AuroraMotion || document.querySelector('script[data-aurora-motion]')) return;
    var s = document.createElement('script'); s.src = 'aurora-motion.js'; s.defer = true;
    s.setAttribute('data-aurora-motion', '');
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {} })();

  // ── Living Aurora: the data-reactive ambient background, on every page.
  (function loadAuroraBg(){ try {
    if (window.AuroraBG || document.querySelector('script[data-aurora-bg]')) return;
    var s = document.createElement('script'); s.src = 'aurora-bg.js'; s.defer = true;
    s.setAttribute('data-aurora-bg', '');
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {} })();

  // ── Nova Life: reactive orb states (think / listen / happy) API.
  (function loadNovaLife(){ try {
    if (window.Nova || document.querySelector('script[data-nova-life]')) return;
    var s = document.createElement('script'); s.src = 'nova-life.js'; s.defer = true;
    s.setAttribute('data-nova-life', '');
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {} })();

  // ── Insight Engine: available app-wide so Nova can cite cross-domain patterns.
  (function loadInsights(){ try {
    if (window.ALSInsights || document.querySelector('script[src*="insights-engine"]')) return;
    var s = document.createElement('script'); s.src = 'insights-engine.js'; s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {} })();

  // ── Forecast Engine: trajectory/projection, app-wide for Nova.
  (function loadForecast(){ try {
    if (window.ALSForecast || document.querySelector('script[src*="forecast-engine"]')) return;
    var s = document.createElement('script'); s.src = 'forecast-engine.js'; s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {} })();

  // ── Global error toast: surface silent runtime errors, app-wide.
  (function loadErrorToast(){ try {
    if (window.ALSToast || document.querySelector('script[src*="error-toast"]')) return;
    var s = document.createElement('script'); s.src = 'error-toast.js'; s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {} })();

  // ── On-brand dialogs (ALSConfirm/ALSAlert/ALSPrompt), app-wide.
  (function loadDialog(){ try {
    if (window.ALSDialog || document.querySelector('script[src*="als-dialog"]')) return;
    var s = document.createElement('script'); s.src = 'als-dialog.js'; s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {} })();

  // ── Who is using this app (ALSProfile) — the greeting, the units, the pages.
  // Loaded everywhere, like the dialogs, so no page has to remember to ask.
  (function loadProfile(){ try {
    if (window.ALSProfile || document.querySelector('script[src*="als-profile"]')) return;
    var s = document.createElement('script'); s.src = 'als-profile.js'; s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {} })();

  // ── First run: ask who they are before showing them a stranger's-looking app.
  // Self-arms only when the profile has no name (and only after it has hydrated
  // from the cloud, so a returning user on a new device isn't asked twice).
  (function loadOnboard(){ try {
    if (window.ALSOnboard || document.querySelector('script[src*="als-onboard"]')) return;
    var s = document.createElement('script'); s.src = 'als-onboard.js'; s.defer = true;
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {} })();

  // -------- Supabase config (replace with your own project URL + publishable key) --------
  const TOPBAR_SUPABASE_URL = 'https://oiyvadqfldwbjroiknjc.supabase.co';
  const TOPBAR_SUPABASE_KEY = 'sb_publishable_fGKn40f1Ek1Y4j0VComsFA_l4aXkKM-';

  // ── Privacy gate: require a login so Supabase RLS can protect the data.
  // Built so it can NEVER leave a stuck black screen: within ~3s it always shows
  // either the app (if signed in) or a working login form. Fail-open on errors. ──
  (function authGate(){
    if(window.__alsAuthGate) return; window.__alsAuthGate=1;
    var client;
    try{
      if(!window.supabase || !window.supabase.createClient) return; // lib missing → app runs normally
      client=window.__alsAuthClient||(window.__alsAuthClient=window.supabase.createClient(TOPBAR_SUPABASE_URL,TOPBAR_SUPABASE_KEY));
      if(!client || !client.auth) return;
    }catch(e){ return; } // client init failed → fail open, no overlay

    // Native <dialog> in the TOP LAYER — immune to ancestor transform/filter that
    // breaks position:fixed (the page backgrounds use transforms). Fills the
    // viewport and scrolls internally so the form is never clipped off-frame.
    var ov=document.createElement('dialog'); ov.id='alsAuth';
    ov.style.cssText='position:fixed;inset:0;width:100vw;max-width:100vw;height:100vh;height:100dvh;max-height:100dvh;margin:0;padding:0;border:0;z-index:99999;background:#050507;color:#F4F1EA;overflow-y:auto;-webkit-overflow-scrolling:touch;font-family:-apple-system,system-ui,sans-serif;';
    ov.addEventListener('cancel',function(e){ e.preventDefault(); }); // Esc must not dismiss the gate
    function wrapHTML(inner){ return '<div style="min-height:100%;box-sizing:border-box;display:flex;align-items:center;justify-content:center;padding:max(32px,env(safe-area-inset-top)) 22px max(32px,env(safe-area-inset-bottom));">'+inner+'</div>'; }
    function closeOv(){ try{ if(ov.open&&ov.close) ov.close(); }catch(e){} try{ ov.remove(); }catch(e){} try{ document.documentElement.style.overflow=''; }catch(e){} }
    ov.innerHTML=wrapHTML('<div style="font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:rgba(244,241,234,.4)">Securing…</div>');
    (document.body||document.documentElement).appendChild(ov);
    try{ if(ov.showModal) ov.showModal(); else { ov.setAttribute('open',''); ov.style.display='block'; } }catch(e){ try{ ov.setAttribute('open',''); ov.style.display='block'; }catch(e2){} }
    document.documentElement.style.overflow='hidden';

    var settled=false;
    function settle(){ settled=true; try{ clearTimeout(killTimer); }catch(e){} }
    function killOverlay(){ settle(); closeOv(); }
    // ── Sign-out MUST wipe this device's local data. ────────────────────────
    // localStorage is the source of truth and sync.js is merge-first (pull →
    // merge → push union). If Alex signs out and Chrissie signs in on the same
    // browser, HIS leftover local keys would be merged and pushed into HER
    // rows. So: clear everything local, THEN end the session. Nothing is lost —
    // every synced key already lives in that account's cloud row.
    function purgeLocal(){
      try{ if(window.ALSProfile && ALSProfile._forget) ALSProfile._forget(); }catch(e){}
      try{ localStorage.clear(); }catch(e){}
      try{ sessionStorage.clear(); }catch(e){}
      // Drop the service-worker caches too, so no page renders the last
      // person's numbers from cache before the new session hydrates.
      try{ if(window.caches && caches.keys) caches.keys().then(function(ks){ ks.forEach(function(k){ caches.delete(k); }); }); }catch(e){}
    }
    // `confirmed` = the caller already asked (the account button does).
    async function doSignOut(confirmed){
      try{
        var ok = true;
        if (!confirmed && typeof window.ALSConfirm === 'function') {
          ok = await window.ALSConfirm({
            title: 'Sign out?',
            message: 'This device will be cleared. Your data stays safe in the cloud and comes back when you sign in.',
            confirmText: 'Sign out'
          });
        }
        if (!ok) return;
      }catch(e){}
      purgeLocal();
      try{ await client.auth.signOut(); }catch(e){}
      location.replace('/');
    }
    // The other half of the same trap: a DIFFERENT account signing in on a
    // browser that still holds the previous person's local data (session
    // swapped without a sign-out). Detect the switch and purge before any page
    // gets the chance to sync stale keys up into the new account.
    var UIDKEY = 'als:uid';
    function guardAccountSwitch(session){
      var id = session && session.user && session.user.id; if (!id) return false;
      var seen = null; try{ seen = localStorage.getItem(UIDKEY); }catch(e){}
      if (seen && seen !== id){
        purgeLocal();
        try{ localStorage.setItem(UIDKEY, id); }catch(e){}
        location.reload();
        return true;                       // stop here — the reload takes over
      }
      if (!seen){ try{ localStorage.setItem(UIDKEY, id); }catch(e){} }
      return false;
    }
    function done(session){
      settle();
      if (guardAccountSwitch(session)) return;
      window.ALSAuth={ user:(session&&session.user)||null, client:client, signOut:doSignOut, purgeLocal:purgeLocal };
      closeOv();
      // The session has landed. Anything that must not run for a signed-out
      // browser (the onboarding, above all) waits for this instead of guessing
      // from a timer.
      try{ document.dispatchEvent(new CustomEvent('als:auth',{ detail:{ user:window.ALSAuth.user } })); }catch(e){}
    }
    function showLogin(){
      settle();
      ov.innerHTML=wrapHTML('<div style="width:100%;max-width:340px">'+
        '<div style="text-align:center;margin-bottom:22px"><div style="font-family:Georgia,serif;font-style:italic;font-size:30px;color:#F4F1EA">AURORA</div><div style="font-family:ui-monospace,monospace;font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:rgba(52,226,176,.7);margin-top:6px">Your private dashboard</div></div>'+
        '<input id="alsEm" type="email" inputmode="email" autocomplete="username" placeholder="Email" style="width:100%;padding:13px 15px;margin-bottom:10px;border-radius:13px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#F4F1EA;font-size:15px;outline:none">'+
        '<input id="alsPw" type="password" autocomplete="current-password" placeholder="Password" style="width:100%;padding:13px 15px;margin-bottom:6px;border-radius:13px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#F4F1EA;font-size:15px;outline:none">'+
        '<div id="alsErr" style="min-height:16px;font-size:12px;color:#FF8FA3;margin:4px 2px 10px;line-height:1.4"></div>'+
        '<button id="alsGo" type="button" style="width:100%;padding:14px;margin-bottom:9px;border-radius:13px;border:none;font-size:15px;font-weight:700;color:#04130D;background:linear-gradient(120deg,#34E2B0,#18C8C0 55%,#9B8CFF);cursor:pointer">Log in</button>'+
        // Signups are closed (accounts are invited from the Supabase dashboard),
        // so the old "Create account" button was a dead end. A magic link is the
        // forgiving path instead: no password to remember, and it works for
        // anyone who has been invited.
        '<button id="alsLink" type="button" style="width:100%;padding:13px;border-radius:13px;border:1px solid rgba(52,226,176,.4);background:rgba(255,255,255,.04);font-size:14px;font-weight:700;color:#F4F1EA;cursor:pointer">Email me a sign-in link</button>'+
        '<div style="text-align:center;margin-top:14px;font-size:11.5px;color:rgba(244,241,234,.4);line-height:1.5">Forgot your password? Use the link — we\'ll email you a one-tap sign-in.</div>'+
      '</div>');
      var em=ov.querySelector('#alsEm'), pw=ov.querySelector('#alsPw'), go=ov.querySelector('#alsGo'), lk=ov.querySelector('#alsLink'), err=ov.querySelector('#alsErr');
      function submit(){
        var e=(em.value||'').trim(), p=pw.value||'';
        if(!e||!p){ err.style.color='#FF8FA3'; err.textContent='Enter your email and password first.'; return; }
        var orig = go.textContent;
        go.disabled=true; lk.disabled=true; go.textContent='…'; err.textContent='';
        function reset(){ go.disabled=false; lk.disabled=false; go.textContent=orig; }
        var pr; try{ pr = client.auth.signInWithPassword({email:e,password:p}); }
        catch(ex){ err.style.color='#FF8FA3'; err.textContent='Auth unavailable — try again.'; reset(); return; }
        Promise.resolve(pr).then(function(res){
          if(res&&res.error){ err.style.color='#FF8FA3'; err.textContent=res.error.message||'Something went wrong.'; reset(); return; }
          location.reload();
        }).catch(function(){ err.style.color='#FF8FA3'; err.textContent='Network error — try again.'; reset(); });
      }
      // Magic link — for the person who never remembers a password (and for a
      // phone where typing one is a chore). Only works for an invited account.
      function magic(){
        var e=(em.value||'').trim();
        if(!e){ err.style.color='#FF8FA3'; err.textContent='Enter your email first, then tap this.'; return; }
        var orig=lk.textContent; go.disabled=true; lk.disabled=true; lk.textContent='…'; err.textContent='';
        function reset(){ go.disabled=false; lk.disabled=false; lk.textContent=orig; }
        var pr; try{ pr = client.auth.signInWithOtp({ email:e, options:{ emailRedirectTo: location.origin, shouldCreateUser:false } }); }
        catch(ex){ err.style.color='#FF8FA3'; err.textContent='Auth unavailable — try again.'; reset(); return; }
        Promise.resolve(pr).then(function(res){
          if(res&&res.error){ err.style.color='#FF8FA3'; err.textContent=res.error.message||'Could not send the link.'; reset(); return; }
          err.style.color='#34E2B0'; err.textContent='Check your email — tap the link and you\'re in.'; reset();
        }).catch(function(){ err.style.color='#FF8FA3'; err.textContent='Network error — try again.'; reset(); });
      }
      go.addEventListener('click',submit);
      lk.addEventListener('click',magic);
      pw.addEventListener('keydown',function(ev){ if(ev.key==='Enter') submit(); });
      setTimeout(function(){ try{ em.focus(); }catch(e){} }, 60);
    }

    // Hard safety: if the session check stalls, fall through to the login form
    // (never a stuck "Securing…"/black screen).
    var killTimer=setTimeout(function(){ if(!settled) showLogin('login'); }, 3000);

    var gp; try{ gp=client.auth.getSession(); }catch(e){ showLogin('login'); return; }
    Promise.resolve(gp).then(function(r){ var s=r&&r.data&&r.data.session; if(s) done(s); else showLogin('login'); })
      .catch(function(){ showLogin('login'); });
  })();

  // -------- CSS --------
  const css = `
.topbar {
  position: sticky; top: 0; z-index: 40;
  display: flex; justify-content: flex-end; align-items: center;
  gap: 8px;
  padding: max(12px, env(safe-area-inset-top)) max(14px, env(safe-area-inset-right)) 8px max(14px, env(safe-area-inset-left));
  background: rgba(7,7,9,0.98);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
}
.topbar-acct {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; flex-shrink: 0; margin-left: 8px;
  border-radius: 11px; cursor: pointer;
  border: 1px solid rgba(63, 224, 176, 0.18);
  background: rgba(63, 224, 176, 0.06);
  color: #3FE0B0;
  font-family: ui-monospace, monospace; font-size: 11.5px; font-weight: 700; letter-spacing: .04em;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s, border-color 0.15s, transform 0.12s;
}
.topbar-acct:active { transform: scale(0.94); }
.topbar-water-wrap { display: flex; align-items: stretch; }
.topbar-water-pill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 8px 14px;
  background: rgba(63, 224, 176, 0.06);
  border: 1px solid rgba(63, 224, 176, 0.16);
  border-right: none;
  border-radius: 12px 0 0 12px;
  text-decoration: none; color: #3FE0B0;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s, border-color 0.15s;
}
.topbar-water-pill .topbar-water-drop {
  width: 14px; height: 14px; flex-shrink: 0; display: block;
}
.topbar-water-pill .topbar-water-drop svg { width: 100%; height: 100%; display: block; }
.topbar-water-pill.warn { color: #F2C063; border-color: rgba(242,192,99,0.18); background: rgba(242,192,99,0.06); }
.topbar-water-pill.miss { color: #FF8A6B; border-color: rgba(255,138,107,0.20); background: rgba(255,138,107,0.06); }
.topbar-water-pill.miss .topbar-water-drop {
  animation: topbar-miss-pulse 1.7s ease-in-out infinite;
}
@keyframes topbar-miss-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.35; }
}
.topbar-pill-count {
  font-family: var(--au-serif, "Instrument Serif", Georgia, serif);
  font-style: italic; font-size: 18px; font-weight: 400;
  color: #F5F2EC; line-height: 1; white-space: nowrap;
  letter-spacing: 0.01em;
}
.topbar-water-add {
  width: 42px;
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid rgba(63, 224, 176, 0.16);
  background: rgba(63, 224, 176, 0.18);
  color: #EAF7F1; font-family: inherit;
  cursor: pointer; border-radius: 0 12px 12px 0;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s, transform 0.10s;
}
.topbar-water-add svg { width: 17px; height: 17px; display: block; }
.topbar-water-add:active { transform: scale(0.94); }
.topbar-water-add.flash {
  background: rgba(63, 224, 176, 0.5);
}
.topbar-finance-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 42px; height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px; text-decoration: none;
  color: rgba(245, 242, 236, 0.5);
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.topbar-finance-btn:hover, .topbar-finance-btn:active {
  background: rgba(255, 255, 255, 0.07); color: #F5F2EC;
  border-color: rgba(255,255,255,0.14);
}
.topbar-finance-btn svg { width: 19px; height: 19px; display: block; }
.topbar-back {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 13px 8px 10px; border-radius: 11px;
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
  color: rgba(245,242,236,0.55);
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
  transition: background 0.15s, color 0.15s, border-color 0.15s; white-space: nowrap;
}
.topbar-back svg { width: 15px; height: 15px; display: block; }
.topbar-back:active { background: rgba(255,255,255,0.08); color: #F5F2EC; border-color: rgba(255,255,255,0.14); }
.bottombar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
  display: flex; justify-content: space-around; align-items: stretch;
  padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
  background: rgba(5,5,6,0.94);
  border-top: 1px solid rgba(255,255,255,0.06);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
}
.bottombar-tab {
  flex: 1; position: relative;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 3px; padding: 6px 0 4px; text-decoration: none;
  color: rgba(255, 255, 255, 0.32);
  font-size: 9px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  -webkit-tap-highlight-color: transparent; transition: color 0.2s;
}
.bottombar-tab-icon {
  line-height: 1; display: flex; align-items: center; justify-content: center;
  opacity: 0.45;
  transition: opacity 0.2s, transform 0.12s;
}
.bottombar-tab-icon svg { width: 21px; height: 21px; display: block; }
.bottombar-tab.active { color: rgba(245,242,236,0.92); }
.bottombar-tab.active .bottombar-tab-icon { opacity: 1; color: #3FE0B0; }
.bottombar-tab.active::before {
  content: ''; position: absolute; top: 0; left: 50%;
  transform: translateX(-50%);
  width: 22px; height: 2px; border-radius: 0 0 3px 3px;
  background: rgba(63,224,176,0.75);
}
.bottombar-tab:active .bottombar-tab-icon { transform: scale(0.90); }
body.has-bottombar {
  padding-bottom: calc(72px + env(safe-area-inset-bottom)) !important;
}
@media (max-width: 480px) {
  .topbar { padding-left: max(10px, env(safe-area-inset-left)); padding-right: max(10px, env(safe-area-inset-right)); gap: 6px; }
  .topbar-water-pill { padding: 7px 11px; gap: 7px; }
  .topbar-pill-count { font-size: 16px; }
  .topbar-water-add { width: 38px; }
  .topbar-back { padding: 7px 11px 7px 9px; }
  .topbar-finance-btn { width: 38px; height: 38px; }
  .bottombar-tab-icon { font-size: 22px; }
  .bottombar-tab { font-size: 10px; }
}
html, body { -webkit-text-size-adjust: 100%; }
@media (max-width: 768px) {
  html { touch-action: pan-y; }
  ::-webkit-scrollbar { width: 0; height: 0; display: none; }
  html, body { scrollbar-width: none; -ms-overflow-style: none; }
}
.modal-bg, .modal, .po-modal-bg, .po-modal, .wt-overlay, .wt-viewer {
  overscroll-behavior: contain;
}
body.topbar-modal-open { overflow: hidden; }
/* ── PAGE TRANSITIONS ─────────────────────────────────── */
body { animation: _tbIn 0.38s cubic-bezier(0.16,1,0.3,1) both; }
@keyframes _tbIn  { from { opacity:0; transform:translateY(11px) scale(.993); } to { opacity:1; transform:none; } }
@keyframes _tbOut { from { opacity:1; transform:scale(1); } to { opacity:0; transform:scale(1.018); } }
body.tb-out { animation: _tbOut 0.18s cubic-bezier(.4,0,1,1) forwards !important; pointer-events:none; }
/* a leaving hub tile "opens" — zooms up + brightens as the page dissolves into the aurora */
.tb-tile-open { animation: _tbTileOpen 0.2s cubic-bezier(.2,.8,.2,1) forwards !important; position: relative; z-index: 6; }
@keyframes _tbTileOpen { to { transform: scale(1.07); filter: brightness(1.18); } }
@media (prefers-reduced-motion: reduce) {
  body, body.tb-out, .tb-tile-open { animation: none !important; }
  body.tb-out { opacity: 0; }
}
/* scan line */
.tb-scan {
  position: fixed; left:0; right:0; height:2px; z-index:9999; pointer-events:none;
  background: linear-gradient(90deg, transparent, var(--au-glow-c, rgba(63,224,176,0.7)) 50%, transparent);
  box-shadow: none;
  animation: _tbScan 0.8s cubic-bezier(0.4,0,0.2,1) forwards;
}
@keyframes _tbScan {
  0%   { top:0;    opacity:0; }
  6%   { opacity:1; }
  90%  { opacity:0.25; }
  100% { top:100vh; opacity:0; }
}
@media (max-width: 480px) {
  .modal-bg, .po-modal-bg {
    padding: 0 !important;
    align-items: stretch !important;
    justify-content: stretch !important;
  }
  .modal, .po-modal {
    width: 100% !important; max-width: 100% !important;
    max-height: 100vh !important; height: 100vh !important;
    border-radius: 0 !important;
    padding-top: max(20px, env(safe-area-inset-top)) !important;
    padding-bottom: max(28px, env(safe-area-inset-bottom)) !important;
    overflow-y: auto !important; overscroll-behavior: contain;
  }
}
`;

  const topbarHtml = `
<header class="topbar" id="topbar" role="navigation" aria-label="Quick actions">
  <button class="topbar-back" id="topbarBack" aria-label="Go back" type="button" style="display:none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg><span>Back</span></button>
  <div style="flex:1"></div>
  <div class="topbar-water-wrap">
    <a href="health.html#water" class="topbar-water-pill" id="topbarWater" aria-label="Water progress">
      <span class="topbar-water-drop"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5c3.2 3.8 5.5 6.6 5.5 9.7A5.5 5.5 0 0 1 6.5 13.2c0-3.1 2.3-5.9 5.5-9.7z"/></svg></span>
      <span class="topbar-pill-count" id="topbarWaterCount">0/0</span>
    </a>
    <button class="topbar-water-add" id="topbarWaterAdd" aria-label="Log one drink" type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg></button>
  </div>
  <a href="finance.html" class="topbar-finance-btn" id="topbarFinance" aria-label="Finance">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19h16"/><path d="M7.5 19v-5M12 19V8.5M16.5 19v-8"/></svg>
  </a>
  <button class="topbar-acct" id="topbarAcct" type="button" aria-label="Your account"><span id="topbarAcctIni">·</span></button>
</header>`;

  const tbIco = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const bottombarHtml = `
<nav class="bottombar" id="bottombar" role="navigation" aria-label="Main tabs">
  <a href="index.html"     class="bottombar-tab" data-page="home">
    <span class="bottombar-tab-icon">${tbIco('<path d="M4 11.5 12 4l8 7.5M6 10v9.5h12V10"/>')}</span><span>Home</span>
  </a>
  <a href="body.html"      class="bottombar-tab" data-page="body">
    <span class="bottombar-tab-icon">${tbIco('<path d="M12 20.5s-7.5-4.6-7.5-10A4.4 4.4 0 0 1 12 7.2a4.4 4.4 0 0 1 7.5 3.3c0 5.4-7.5 10-7.5 10z"/>')}</span><span>Body</span>
  </a>
  <a href="main.html"      class="bottombar-tab" data-page="mind">
    <span class="bottombar-tab-icon">${tbIco('<path d="M9.5 4.5A3.5 3.5 0 0 0 6 8a3.3 3.3 0 0 0-2 3.2 3.4 3.4 0 0 0 1.6 3A3.5 3.5 0 0 0 9 19.5c1.4 0 2.6-.8 3-2V6.7a3.4 3.4 0 0 0-2.5-2.2zM14.5 4.5A3.5 3.5 0 0 1 18 8a3.3 3.3 0 0 1 2 3.2 3.4 3.4 0 0 1-1.6 3A3.5 3.5 0 0 1 15 19.5c-1.4 0-2.6-.8-3-2"/>')}</span><span>Mind</span>
  </a>
  <a href="finance.html"   class="bottombar-tab" data-page="money">
    <span class="bottombar-tab-icon">${tbIco('<path d="M12 3v18M17 6.5H9.6a3.1 3.1 0 0 0 0 6.2h4.8a3.1 3.1 0 0 1 0 6.2H6.5"/>')}</span><span>Money</span>
  </a>
  <a href="nova-chat.html" class="bottombar-tab" data-page="nova">
    <span class="bottombar-tab-icon">${tbIco('<path d="M21 11.6a8.4 8.4 0 0 1-8.5 8.3 9 9 0 0 1-3.2-.6L4 20.5l1.3-4.1a8 8 0 0 1-1.3-4.8A8.4 8.4 0 0 1 12.5 3.3 8.4 8.4 0 0 1 21 11.6z"/>')}</span><span>Nova</span>
  </a>
</nav>`;

  function isEmbedded() {
    try { return window.self !== window.top; } catch (e) { return true; }
  }
  // run.html is Chrissie's standalone running app — no cross-app nav (keeps her
  // out of the rest of the private dashboard). Auth + ambient scripts still load.
  function isRunSolo() {
    return (window.location.pathname || '').toLowerCase().endsWith('run.html');
  }
  function shouldShowChrome() { return !isEmbedded() && !isRunSolo(); }
  // Maps the current page to one of the five bottom-nav "spaces" so the right
  // tab highlights. Pages outside the bar (Life/Reflect) return '' (no tab lit).
  function currentPageKey() {
    const p = (window.location.pathname || '').toLowerCase();
    const f = p.split('/').pop() || '';
    if (f === '' || f === 'index.html' || p === '/' || p.endsWith('/')) return 'home';
    if (f === 'nova-chat.html') return 'nova';
    const BODY = ['body.html','gym.html','pr.html','sleep.html','weight.html','po-water.html','caffeine.html','nutrition.html','measure.html','health.html','supps.html','planner.html','import.html','import-strong.html'];
    const MIND = ['main.html','identity.html','ideas.html','improve.html'];
    const MONEY = ['finance.html','bills.html'];
    if (BODY.indexOf(f) > -1)  return 'body';
    if (MIND.indexOf(f) > -1)  return 'mind';
    if (MONEY.indexOf(f) > -1) return 'money';
    return '';
  }

  function isGymPage() {
    const p = (window.location.pathname || '').toLowerCase();
    return p.endsWith('gym.html');
  }

  function injectStyleAndHTML() {
    if (document.getElementById('topbar') || document.getElementById('bottombar')) return;
    if (!shouldShowChrome()) return;
    const style = document.createElement('style');
    style.id = 'topbar-style';
    style.textContent = css;
    document.head.appendChild(style);
    const topWrap = document.createElement('div');
    topWrap.innerHTML = topbarHtml.trim();
    document.body.insertBefore(topWrap.firstChild, document.body.firstChild);
    if (!isGymPage()) {
      const bottomWrap = document.createElement('div');
      bottomWrap.innerHTML = bottombarHtml.trim();
      document.body.appendChild(bottomWrap.firstChild);
      const active = currentPageKey();
      document.querySelectorAll('.bottombar-tab').forEach((t) => {
        t.classList.toggle('active', t.getAttribute('data-page') === active);
      });
      document.body.classList.add('has-bottombar');
    }
    // ── Account button: their initials, and the only way to sign out.
    // (Signing out is also the ONLY safe way to hand this device to another
    // account — it purges the local data first. See doSignOut/purgeLocal.)
    const acctBtn = document.getElementById('topbarAcct');
    if (acctBtn) {
      const paintAcct = () => {
        const ini = document.getElementById('topbarAcctIni');
        if (!ini) return;
        let name = '';
        try { name = (window.ALSProfile && ALSProfile.get().name) || ''; } catch (e) {}
        if (name) {
          ini.textContent = name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
        } else {
          let em = '';
          try { em = (window.ALSAuth && ALSAuth.user && ALSAuth.user.email) || ''; } catch (e) {}
          ini.textContent = em ? em[0].toUpperCase() : '·';
        }
      };
      paintAcct();
      document.addEventListener('als:profile', paintAcct);
      setTimeout(paintAcct, 800);        // ALSProfile hydrates from the cloud async
      // The account sheet: who you are, edit your details (re-runs onboarding —
      // otherwise that flow is unreachable the moment it's finished), sign out.
      acctBtn.addEventListener('click', () => {
        if (document.getElementById('alsAcctSheet')) return;
        let name = '', email = '';
        try { name = (window.ALSProfile && ALSProfile.get().name) || ''; } catch (e) {}
        try { email = (window.ALSAuth && ALSAuth.user && ALSAuth.user.email) || ''; } catch (e) {}

        const d = document.createElement('dialog');
        d.id = 'alsAcctSheet';
        d.style.cssText = 'position:fixed;inset:0;width:100vw;max-width:100vw;height:100vh;height:100dvh;max-height:100dvh;margin:0;padding:0;border:0;z-index:99997;background:rgba(5,5,7,.72);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);color:#F5F2EC;font-family:-apple-system,system-ui,sans-serif;';
        d.innerHTML =
          '<div style="min-height:100%;display:flex;align-items:flex-end;justify-content:center;padding:20px 16px max(20px,env(safe-area-inset-bottom));">' +
            '<div style="width:100%;max-width:420px;background:#0B0B0F;border:1px solid rgba(255,255,255,.08);border-radius:22px;padding:22px 20px;">' +
              '<div style="font-family:Georgia,serif;font-style:italic;font-size:24px;color:#F5F2EC;line-height:1.2">' + (name ? name : 'Your account') + '</div>' +
              (email ? '<div style="font-family:ui-monospace,monospace;font-size:11.5px;color:rgba(245,242,236,.38);margin-top:6px">' + email + '</div>' : '') +
              '<button type="button" id="acSettings" style="width:100%;margin-top:20px;padding:14px;border-radius:14px;border:1px solid rgba(52,226,176,.32);background:rgba(52,226,176,.07);color:#F5F2EC;font-size:14.5px;font-weight:700;font-family:inherit;cursor:pointer">Settings</button>' +
              '<button type="button" id="acOut" style="width:100%;margin-top:9px;padding:14px;border-radius:14px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.03);color:#F5F2EC;font-size:14.5px;font-weight:700;font-family:inherit;cursor:pointer">Sign out</button>' +
              '<div style="font-size:11.5px;line-height:1.5;color:rgba(245,242,236,.34);margin-top:11px;text-align:center">Signing out clears this device. Your data stays in the cloud.</div>' +
              '<button type="button" id="acClose" style="width:100%;margin-top:14px;padding:10px;background:none;border:none;color:rgba(245,242,236,.34);font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer">Close</button>' +
            '</div>' +
          '</div>';
        document.body.appendChild(d);
        try { d.showModal(); } catch (e) { d.setAttribute('open', ''); }

        const shut = () => { try { d.close(); } catch (e) {} try { d.remove(); } catch (e) {} };
        d.querySelector('#acClose').addEventListener('click', shut);
        d.addEventListener('click', (ev) => { if (ev.target === d) shut(); });
        d.querySelector('#acSettings').addEventListener('click', () => {
          shut();
          // Settings owns editing your details now (and more) — a calm page, not
          // a re-run of the onboarding wizard.
          if (location.pathname.replace(/^\//, '') !== 'settings.html') location.href = 'settings.html';
        });
        d.querySelector('#acOut').addEventListener('click', async () => {
          shut();
          let ok = true;
          if (typeof window.ALSConfirm === 'function') {
            ok = await window.ALSConfirm({
              title: 'Sign out?',
              message: 'This device will be cleared. Your data stays safe in the cloud and comes back when you sign in.',
              confirmText: 'Sign out'
            });
          }
          if (ok && window.ALSAuth && ALSAuth.signOut) ALSAuth.signOut(true);
        });
      });
    }

    // Show back button on every page except the hub
    const backBtn = document.getElementById('topbarBack');
    if (backBtn) {
      const isHub = currentPageKey() === 'home';
      if (!isHub) {
        backBtn.style.display = 'inline-flex';
        backBtn.addEventListener('click', () => {
          const prev = sessionStorage.getItem('_tbPrev');
          if (prev) {
            sessionStorage.removeItem('_tbPrev');
            window.location.href = prev;
          } else {
            window.location.href = 'index.html';
          }
        });
      }
    }
  }

  function calendarDateKey() {
    const d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }
  /* target maths lives in water.js (ALSWater) — the single source of truth for
     every water surface. Don't inline a copy here again. */
  function getWaterProgress() {
    if (!window.ALSWater) return { done: 0, total: 0 };
    let state = null;
    try { state = JSON.parse(localStorage.getItem('po_water_v1')); } catch (e) {}
    if (!state) return { done: 0, total: 0 };
    return { done: ALSWater.count(state, calendarDateKey()), total: ALSWater.target(state).units };
  }
  function classifyStatus(done, total) {
    if (total === 0) return 'idle';
    if (done >= total) return 'good';
    if (done >= total * 0.5) return 'warn';
    const h = new Date().getHours();
    if (h >= 18 && done < total * 0.5) return 'miss';
    return 'warn';
  }
  function setPillStatus(pillEl, status) {
    pillEl.classList.remove('good', 'warn', 'miss');
    if (status === 'warn' || status === 'miss') pillEl.classList.add(status);
  }
  function render() {
    const waterEl = document.getElementById('topbarWater');
    if (!waterEl) return;
    const w = getWaterProgress();
    const countEl = document.getElementById('topbarWaterCount');
    if (countEl) countEl.textContent = w.total ? w.done + '/' + w.total : '0/0';
    setPillStatus(waterEl, classifyStatus(w.done, w.total));
  }

  function defaultWaterState() {
    return {
      unit: 'bottle', bottleMl: 500, glassMl: 250, weightUnit: 'kg',
      profile: { weightKg: 75, age: 25, sex: 'm', activityHrsPerWeek: 5 },
      caffeineMgPerDay: 200, substances: [], logs: {}
    };
  }
  async function pushWaterMergedToSupabase(localWater) {
    if (window.location.pathname.endsWith('/health.html') ||
        window.location.pathname.endsWith('health.html')) return;
    if (!window.supabase || !TOPBAR_SUPABASE_URL || !TOPBAR_SUPABASE_KEY) return;
    if (TOPBAR_SUPABASE_URL.indexOf('PASTE-') === 0) return;
    try {
      const supa = window.supabase.createClient(TOPBAR_SUPABASE_URL, TOPBAR_SUPABASE_KEY);
      const { data } = await supa
        .from('app_state').select('data').eq('key', 'health').maybeSingle();
      const current = (data && data.data) || {};
      const merged = Object.assign({}, current, { po_water_v1: localWater });
      await supa.from('app_state').upsert(
        { key: 'health', data: merged, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    } catch (e) {}
  }
  function addWater() {
    let state = null;
    try { state = JSON.parse(localStorage.getItem('po_water_v1')); } catch (e) {}
    if (!state || typeof state !== 'object') state = defaultWaterState();
    state.logs = state.logs || {};
    const k = calendarDateKey();
    state.logs[k] = (state.logs[k] || 0) + 1;
    state._ts = Date.now(); // last-write-wins so the water count stays editable across devices
    try { localStorage.setItem('po_water_v1', JSON.stringify(state)); } catch (e) {}
    render();
    const btn = document.getElementById('topbarWaterAdd');
    if (btn) { btn.classList.add('flash'); setTimeout(() => btn.classList.remove('flash'), 220); }
    pushWaterMergedToSupabase(state);
  }

  function blockGesture(e) { e.preventDefault(); }
  function lockGestures() {
    document.addEventListener('gesturestart', blockGesture, { passive: false });
    document.addEventListener('gesturechange', blockGesture, { passive: false });
    document.addEventListener('gestureend', blockGesture, { passive: false });
    let lastTouch = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouch <= 300) e.preventDefault();
      lastTouch = now;
    }, { passive: false });
  }
  function startModalLock() {
    const MODAL_SELECTORS = ['.modal-bg', '.po-modal-bg', '.wt-overlay', '.wt-viewer', '.wt-cam'];
    function anyOpen() {
      for (const sel of MODAL_SELECTORS) {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          if (el.classList.contains('show') || el.classList.contains('is-open')) return true;
        }
      }
      return false;
    }
    function sync() { document.body.classList.toggle('topbar-modal-open', anyOpen()); }
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });
    sync();
  }

  function initTransitions() {
    // Scan line on every page enter
    const scan = document.createElement('div');
    scan.className = 'tb-scan';
    document.body.appendChild(scan);
    setTimeout(() => scan.remove(), 800);

    // Intercept internal links — fade out then navigate
    document.addEventListener('click', function (e) {
      const a = e.target.closest('a[href]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') ||
          href.startsWith('//') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (a.target === '_blank') return;
      e.preventDefault();
      sessionStorage.setItem('_tbPrev', window.location.href);
      // morph cue: a tapped hub tile zooms/brightens as the page dissolves
      if (a.classList && a.classList.contains('tile')) a.classList.add('tb-tile-open');
      document.body.classList.add('tb-out');
      setTimeout(() => { window.location.href = href; }, 170);
    });
  }

  function registerServiceWorker() {
    // Offline support + rest-timer notifications (Pillar 5). Top window only.
    try {
      if ('serviceWorker' in navigator && window.self === window.top) {
        window.addEventListener('load', function () {
          navigator.serviceWorker.register('sw.js').catch(function () {});
        });
      }
    } catch (e) {}
  }

  // THE VAULT — second trigger. The daily Vercel cron (vercel.json → crons,
  // /api/run-reminders?backup=auto) is the primary one, but a backup system that
  // can fail silently is worse than none, because you trust it. So the app also
  // nudges the vault once a day when it's opened: if the cron ever dies, backups
  // keep happening simply because Alex uses the app.
  // Idempotent server-side (?backup=auto is a no-op once today is done), and
  // gated locally so opening 10 pages costs at most one call.
  function nudgeVault() {
    try {
      if (window.self !== window.top) return;                 // not from iframes
      if (!navigator.onLine) return;
      var today = new Date().toISOString().slice(0, 10);
      if (localStorage.getItem('vault:pinged') === today) return;
      if (window.__vaultNudged) return;                       // once per page load
      window.__vaultNudged = true;
      setTimeout(function () {
        fetch('/api/run-reminders?backup=auto', { method: 'GET', keepalive: true })
          .then(function (r) { return r.json(); })
          .then(function (j) {
            var b = (j && j.backup) || {};
            // Mark today done ONLY when the server confirms it. Setting the flag up
            // front (the old behaviour) meant a failed or interrupted nudge silently
            // burned the whole day with no backup. On failure we leave it unset so
            // the next app-open retries — the request is idempotent server-side.
            if (b.ok || b.skipped) {
              localStorage.setItem('vault:pinged', today);
              localStorage.setItem('vault:lastOk', new Date().toISOString());
            } else { window.__vaultNudged = false; }
          })
          .catch(function () { window.__vaultNudged = false; });
      }, 4000);                                               // let the page settle first
    } catch (e) {}
  }

  function boot() {
    registerServiceWorker();
    nudgeVault();
    injectStyleAndHTML();
    const btn = document.getElementById('topbarWaterAdd');
    if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); addWater(); });
    render();
    lockGestures();
    startModalLock();
    initTransitions();
    window.addEventListener('storage', render);
    window.addEventListener('focus', render);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
    setInterval(render, 30 * 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
