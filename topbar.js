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
    function done(session){ settle(); window.ALSAuth={user:(session&&session.user)||null,client:client,signOut:function(){try{client.auth.signOut().then(function(){location.reload();});}catch(e){location.reload();}}}; closeOv(); }
    function showLogin(){
      settle();
      ov.innerHTML=wrapHTML('<div style="width:100%;max-width:340px">'+
        '<div style="text-align:center;margin-bottom:22px"><div style="font-family:Georgia,serif;font-style:italic;font-size:30px;color:#F4F1EA">AURORA</div><div style="font-family:ui-monospace,monospace;font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:rgba(52,226,176,.7);margin-top:6px">Your private dashboard</div></div>'+
        '<input id="alsEm" type="email" inputmode="email" autocomplete="username" placeholder="Email" style="width:100%;padding:13px 15px;margin-bottom:10px;border-radius:13px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#F4F1EA;font-size:15px;outline:none">'+
        '<input id="alsPw" type="password" autocomplete="current-password" placeholder="Password" style="width:100%;padding:13px 15px;margin-bottom:6px;border-radius:13px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:#F4F1EA;font-size:15px;outline:none">'+
        '<div id="alsErr" style="min-height:16px;font-size:12px;color:#FF8FA3;margin:4px 2px 10px;line-height:1.4"></div>'+
        '<button id="alsGo" type="button" style="width:100%;padding:14px;margin-bottom:9px;border-radius:13px;border:none;font-size:15px;font-weight:700;color:#04130D;background:linear-gradient(120deg,#34E2B0,#18C8C0 55%,#9B8CFF);cursor:pointer">Log in</button>'+
        '<button id="alsNew" type="button" style="width:100%;padding:13px;border-radius:13px;border:1px solid rgba(52,226,176,.4);background:rgba(255,255,255,.04);font-size:14px;font-weight:700;color:#F4F1EA;cursor:pointer">Create account</button>'+
        '<div style="text-align:center;margin-top:14px;font-size:11.5px;color:rgba(244,241,234,.4);line-height:1.5">First time? Enter an email + password and tap <b style="color:rgba(244,241,234,.6)">Create account</b>.</div>'+
      '</div>');
      var em=ov.querySelector('#alsEm'), pw=ov.querySelector('#alsPw'), go=ov.querySelector('#alsGo'), nw=ov.querySelector('#alsNew'), err=ov.querySelector('#alsErr');
      function submit(mode){
        var e=(em.value||'').trim(), p=pw.value||'';
        if(!e||!p){ err.style.color='#FF8FA3'; err.textContent='Enter your email and password first.'; return; }
        if(mode==='signup' && p.length<6){ err.style.color='#FF8FA3'; err.textContent='Password must be at least 6 characters.'; return; }
        var btn = mode==='signup'?nw:go, orig = btn.textContent;
        go.disabled=true; nw.disabled=true; btn.textContent='…'; err.textContent='';
        function reset(){ go.disabled=false; nw.disabled=false; btn.textContent=orig; }
        var pr; try{ pr = mode==='signup'? client.auth.signUp({email:e,password:p,options:{emailRedirectTo:location.origin}}) : client.auth.signInWithPassword({email:e,password:p}); }
        catch(ex){ err.style.color='#FF8FA3'; err.textContent='Auth unavailable — try again.'; reset(); return; }
        Promise.resolve(pr).then(function(res){
          if(res&&res.error){ err.style.color='#FF8FA3'; err.textContent=res.error.message||'Something went wrong.'; reset(); return; }
          if(mode==='signup' && (!res||!res.data||!res.data.session)){ err.style.color='#34E2B0'; err.textContent='Account created — check your email to confirm, then tap Log in.'; reset(); return; }
          location.reload();
        }).catch(function(){ err.style.color='#FF8FA3'; err.textContent='Network error — try again.'; reset(); });
      }
      go.addEventListener('click',function(){ submit('login'); });
      nw.addEventListener('click',function(){ submit('signup'); });
      pw.addEventListener('keydown',function(ev){ if(ev.key==='Enter') submit('login'); });
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
  background: rgba(10,10,11,0.96);
  border-bottom: 1px solid rgba(125,211,252,0.10);
  font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
}
.topbar-water-wrap { display: flex; align-items: stretch; }
.topbar-water-pill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 14px;
  background: rgba(125, 211, 252, 0.08);
  border: 1px solid rgba(125, 211, 252, 0.16);
  border-right: none;
  border-radius: 12px 0 0 12px;
  text-decoration: none; color: #FAFAFA;
  -webkit-tap-highlight-color: transparent;
}
.topbar-water-pill .topbar-pill-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #7DD3FC; flex-shrink: 0;
}
.topbar-water-pill.warn .topbar-pill-dot { background: #fbbf24; }
.topbar-water-pill.miss .topbar-pill-dot {
  background: #ff8a8a;
  animation: topbar-miss-pulse 1.6s ease-in-out infinite;
}
@keyframes topbar-miss-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
  50%      { box-shadow: 0 0 0 5px rgba(239, 68, 68, 0); }
}
.topbar-pill-count {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 13px; font-weight: 700; color: #FAFAFA;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.topbar-water-add {
  width: 44px;
  border: 1px solid rgba(125, 211, 252, 0.16);
  background: linear-gradient(180deg, rgba(125, 211, 252, 0.28), rgba(110, 231, 183, 0.28));
  color: #FFFFFF; font-family: inherit;
  font-size: 20px; font-weight: 700; line-height: 1;
  cursor: pointer; border-radius: 0 12px 12px 0;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s, transform 0.10s;
}
.topbar-water-add:active { transform: scale(0.94); }
.topbar-water-add.flash {
  background: linear-gradient(180deg, rgba(125, 211, 252, 0.7), rgba(110, 231, 183, 0.7));
}
.topbar-finance-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 42px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px; text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s;
}
.topbar-finance-btn:hover { background: rgba(255, 255, 255, 0.08); }
.topbar-back {
  display: inline-flex; align-items: center;
  padding: 8px 12px; border-radius: 10px; border: none;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.10);
  color: rgba(255,255,255,0.65); font-family: inherit;
  font-size: 12px; font-weight: 700; letter-spacing: 0.03em;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
  transition: background 0.15s, color 0.15s; white-space: nowrap;
}
.topbar-back:active { background: rgba(255,255,255,0.12); color: #fff; }
.topbar-finance-icon {
  font-size: 20px; line-height: 1;
  filter: grayscale(100%) brightness(1.4); opacity: 0.85;
}
.bottombar {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 40;
  display: flex; justify-content: space-around; align-items: stretch;
  padding: 6px 0 calc(6px + env(safe-area-inset-bottom));
  background: rgba(5,5,6,0.94);
  border-top: 1px solid rgba(125,211,252,0.10);
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
  font-size: 22px; line-height: 1;
  filter: grayscale(100%) brightness(0.85); opacity: 0.38;
  transition: opacity 0.2s, filter 0.2s, transform 0.12s;
}
.bottombar-tab.active { color: rgba(125,211,252,0.90); }
.bottombar-tab.active .bottombar-tab-icon {
  filter: grayscale(0%) brightness(1.05); opacity: 1;
}
.bottombar-tab.active::before {
  content: ''; position: absolute; top: 0; left: 50%;
  transform: translateX(-50%);
  width: 24px; height: 2px; border-radius: 0 0 3px 3px;
  background: rgba(125,211,252,0.85);
  box-shadow: 0 0 10px rgba(125,211,252,0.7), 0 0 20px rgba(125,211,252,0.28);
}
.bottombar-tab:active .bottombar-tab-icon { transform: scale(0.90); }
body.has-bottombar {
  padding-bottom: calc(72px + env(safe-area-inset-bottom)) !important;
}
@media (max-width: 480px) {
  .topbar { padding-left: max(10px, env(safe-area-inset-left)); padding-right: max(10px, env(safe-area-inset-right)); gap: 6px; }
  .topbar-water-pill { padding: 8px 11px; gap: 6px; }
  .topbar-pill-count { font-size: 12px; }
  .topbar-water-add { width: 40px; font-size: 18px; }
  .topbar-finance-btn { width: 40px; height: 38px; }
  .topbar-finance-icon { font-size: 18px; }
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
body { animation: _tbIn 0.32s cubic-bezier(0.16,1,0.3,1) both; }
@keyframes _tbIn  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
@keyframes _tbOut { from { opacity:1; transform:none; } to { opacity:0; transform:translateY(-7px); } }
body.tb-out { animation: _tbOut 0.17s ease-in forwards !important; pointer-events:none; }
/* scan line */
.tb-scan {
  position: fixed; left:0; right:0; height:1px; z-index:9999; pointer-events:none;
  background: linear-gradient(90deg, transparent, rgba(125,211,252,0.4), transparent);
  animation: _tbScan 0.75s cubic-bezier(0.4,0,0.2,1) forwards;
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
  <button class="topbar-back" id="topbarBack" aria-label="Go back" type="button" style="display:none">← Back</button>
  <div style="flex:1"></div>
  <div class="topbar-water-wrap">
    <a href="health.html#water" class="topbar-water-pill" id="topbarWater" aria-label="Water progress">
      <span class="topbar-pill-dot"></span>
      <span class="topbar-pill-count" id="topbarWaterCount">0/0</span>
    </a>
    <button class="topbar-water-add" id="topbarWaterAdd" aria-label="Log one drink" type="button">+</button>
  </div>
  <a href="finance.html" class="topbar-finance-btn" id="topbarFinance" aria-label="Finance">
    <span class="topbar-finance-icon">📊</span>
  </a>
</header>`;

  const bottombarHtml = `
<nav class="bottombar" id="bottombar" role="navigation" aria-label="Main tabs">
  <a href="index.html"     class="bottombar-tab" data-page="hub">
    <span class="bottombar-tab-icon">🏠</span><span>Hub</span>
  </a>
  <a href="main.html"      class="bottombar-tab" data-page="goals">
    <span class="bottombar-tab-icon">🎯</span><span>Goals</span>
  </a>
  <a href="gym.html"       class="bottombar-tab" data-page="fitness">
    <span class="bottombar-tab-icon">💪</span><span>Fitness</span>
  </a>
  <a href="body.html" class="bottombar-tab" data-page="body">
    <span class="bottombar-tab-icon">🫀</span><span>Body</span>
  </a>
  <a href="ideas.html"     class="bottombar-tab" data-page="ideas">
    <span class="bottombar-tab-icon">💡</span><span>Ideas</span>
  </a>
</nav>`;

  function isEmbedded() {
    try { return window.self !== window.top; } catch (e) { return true; }
  }
  function shouldShowChrome() { return !isEmbedded(); }
  function currentPageKey() {
    const p = (window.location.pathname || '').toLowerCase();
    if (p.endsWith('index.html') || p === '/' || p.endsWith('/')) return 'hub';
    if (p.endsWith('main.html'))      return 'goals';
    if (p.endsWith('gym.html'))       return 'fitness';
    if (p.endsWith('nutrition.html')) return 'nutrition';
    if (p.endsWith('ideas.html'))     return 'ideas';
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
    // Show back button on every page except the hub
    const backBtn = document.getElementById('topbarBack');
    if (backBtn) {
      const isHub = currentPageKey() === 'hub';
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
  function getWaterProgress() {
    let state = null;
    try { state = JSON.parse(localStorage.getItem('po_water_v1')); } catch (e) {}
    if (!state) return { done: 0, total: 0 };
    const todayKey = calendarDateKey();
    const done = (state.logs || {})[todayKey] || 0;
    const p = state.profile || { weightKg: 75 };
    const wKg = state.weightUnit === 'lb' ? (p.weightKg || 0) / 2.20462 : (p.weightKg || 0);
    const base = wKg * 35;
    const exercise = (p.activityHrsPerWeek || 0) / 7 * 500;
    const caffeine = Math.max(0, (state.caffeineMgPerDay || 0) - 200) * 1.5;
    const subs = (state.substances || []).reduce((s, x) => {
      const dose = (x && x.dose != null ? x.dose : (x && x.defaultDose)) || 0;
      return s + Math.max(0, dose * ((x && x.mlPerUnit) || 0));
    }, 0);
    let adjust = 0;
    if (p.sex === 'm') adjust += 200;
    if ((p.age || 0) >= 50) adjust += 100;
    const totalMl = base + exercise + caffeine + subs + adjust;
    let unitVol;
    if (state.unit === 'glass') unitVol = state.glassMl || 250;
    else if (state.unit === 'oz') unitVol = 30;
    else if (state.unit === 'ml') unitVol = 1;
    else unitVol = state.bottleMl || 500;
    const total = Math.max(1, Math.ceil(totalMl / unitVol));
    return { done, total };
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

  function boot() {
    registerServiceWorker();
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
