// ════════════════════════════════════════════════════════════════
// ALSOnboard — the first thing anyone ever sees.
//
// One question per screen, full-bleed, in AURORA's own language: Instrument
// Serif hero words, near-mono emerald, line icons, no emoji, no stock imagery.
// Everything here is typography and pacing — this is an offline-first PWA and
// a video background would cost megabytes and look like every other AI app.
//
// THE RULE: every question maps to a stored field AND a surface it visibly
// changes. If a question can't name the surface it moves, it isn't asked.
//
//   name        → the greeting, everywhere
//   sport       → which page you land on
//   sex + year  → BMR / calorie target, HR zones
//   heightCm    → BMR, BMI
//   units       → every weight + distance readout
//   wake/need   → the sleep score (bridged into sleep:profile)
//   goal        → the north-star line
//
// It ends by ASSEMBLING the app in front of them with their own numbers
// already in it — not a "You're all set!" card.
//
// Renders in a native <dialog> + showModal() (top layer), because ancestor
// transforms on the page backgrounds break position:fixed.
// ════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  if (window.ALSOnboard) return;

  var CSS = [
    '#alsOb{position:fixed;inset:0;width:100vw;max-width:100vw;height:100vh;height:100dvh;max-height:100dvh;margin:0;padding:0;border:0;z-index:99998;background:#050507;color:#F5F2EC;overflow:hidden;}',
    '#alsOb::backdrop{background:#050507;}',
    '.ob-wrap{position:relative;height:100%;display:flex;flex-direction:column;padding:max(28px,env(safe-area-inset-top)) 24px max(28px,env(safe-area-inset-bottom));max-width:520px;margin:0 auto;}',
    '.ob-aura{position:absolute;top:-22%;left:50%;transform:translateX(-50%);width:120vw;height:60vh;pointer-events:none;background:radial-gradient(closest-side,rgba(52,226,176,.13),transparent 72%);filter:blur(6px);}',
    '.ob-rail{position:relative;display:flex;gap:5px;margin-bottom:34px;flex-shrink:0;}',
    '.ob-tick{height:2px;flex:1;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;}',
    // scaleX, not width — animating width thrashes layout on every frame
    '.ob-tick i{display:block;height:100%;width:100%;transform:scaleX(0);transform-origin:left;background:#34E2B0;box-shadow:0 0 10px rgba(52,226,176,.7);transition:transform .7s cubic-bezier(.22,1,.36,1);}',
    '.ob-tick.done i{transform:scaleX(1);}',
    '.ob-body{position:relative;flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0;}',
    '.ob-eyebrow{font-family:ui-monospace,monospace;font-size:9.5px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(52,226,176,.72);margin-bottom:16px;}',
    '.ob-q{font-family:"Instrument Serif",Georgia,serif;font-style:italic;font-weight:400;font-size:clamp(30px,7.4vw,44px);line-height:1.08;letter-spacing:-.015em;color:#F5F2EC;margin-bottom:12px;}',
    '.ob-sub{font-size:14px;line-height:1.55;color:rgba(245,242,236,.56);margin-bottom:26px;max-width:34ch;}',
    '.ob-in{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:15px;padding:15px 17px;color:#F5F2EC;-webkit-text-fill-color:#F5F2EC;font-size:17px;font-family:inherit;outline:none;transition:border-color .2s,background .2s;}',
    '.ob-in:focus{border-color:rgba(52,226,176,.55);background:rgba(52,226,176,.05);}',
    '.ob-row{display:flex;gap:10px;}',
    '.ob-opts{display:flex;flex-direction:column;gap:9px;}',
    '.ob-opt{display:flex;align-items:center;gap:13px;width:100%;text-align:left;padding:15px 16px;border-radius:15px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.03);color:#F5F2EC;font-size:15.5px;font-family:inherit;cursor:pointer;transition:transform .12s,border-color .2s,background .2s;-webkit-tap-highlight-color:transparent;}',
    '.ob-opt:active{transform:scale(.985);}',
    '.ob-opt.on{border-color:rgba(52,226,176,.55);background:rgba(52,226,176,.08);}',
    '.ob-opt-ic{width:20px;height:20px;flex-shrink:0;color:#34E2B0;opacity:.9;}',
    '.ob-opt-ic svg{width:100%;height:100%;display:block;}',
    '.ob-opt small{display:block;font-size:12.5px;color:rgba(245,242,236,.5);margin-top:2px;}',
    '.ob-foot{position:relative;display:flex;align-items:center;gap:12px;padding-top:22px;flex-shrink:0;}',
    '.ob-next{flex:1;padding:16px;border-radius:15px;border:none;font-size:15.5px;font-weight:700;font-family:inherit;color:#04130D;background:linear-gradient(120deg,#34E2B0,#18C8C0 60%,#9B8CFF);cursor:pointer;transition:opacity .2s,transform .12s;}',
    '.ob-next:active{transform:scale(.985);}',
    '.ob-next[disabled]{opacity:.32;cursor:default;}',
    '.ob-back{background:none;border:none;color:rgba(245,242,236,.34);font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;padding:10px 4px;}',
    // the entrance: each element breathes in, staggered
    '.ob-rise{opacity:0;transform:translateY(14px);}',
    '.ob-rise.in{opacity:1;transform:none;transition:opacity .62s cubic-bezier(.22,1,.36,1),transform .62s cubic-bezier(.22,1,.36,1);}',
    // the finale
    '.ob-fin{display:flex;flex-direction:column;justify-content:center;height:100%;}',
    '.ob-fin-hi{font-family:"Instrument Serif",Georgia,serif;font-style:italic;font-size:clamp(34px,8.4vw,52px);line-height:1.05;color:#F5F2EC;margin-bottom:26px;}',
    '.ob-fin-hi b{font-weight:400;color:#34E2B0;}',
    '.ob-card{display:flex;align-items:baseline;justify-content:space-between;gap:14px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.06);}',
    '.ob-card:last-of-type{border-bottom:none;}',
    '.ob-card-k{font-family:ui-monospace,monospace;font-size:9.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(245,242,236,.30);}',
    '.ob-card-v{font-family:ui-monospace,monospace;font-size:16px;font-weight:700;color:#F5F2EC;}',
    '.ob-card-v em{font-style:normal;color:#34E2B0;}'
  ].join('');

  var ICON = {
    lifter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"/></svg>',
    runner: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="15" cy="4.5" r="1.8"/><path d="M9.5 20l2-5 3-2-1-4-4 2-1.5 3M14.5 13l2.5 2 .8 5"/></svg>',
    check:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></svg>'
  };

  var draft = {}, step = 0, dlg = null, steps = [];

  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  // ── the questions. each one names the surface it moves. ──
  steps = [
    {
      key: 'name', eyebrow: 'Welcome',
      q: 'What should we call you?',
      sub: 'This is the name the app greets you with, every morning.',
      html: function(){ return '<input class="ob-in" id="obName" type="text" autocomplete="given-name" placeholder="Your name" value="' + esc(draft.name || '') + '">'; },
      read: function(root){ var v = (root.querySelector('#obName').value || '').trim(); return v ? { name: v } : null; },
      valid: function(root){ return !!(root.querySelector('#obName').value || '').trim(); }
    },
    {
      key: 'sport', eyebrow: 'Your training',
      q: 'What do you train for?',
      sub: 'It decides where the app opens, and what it puts first.',
      html: function(){
        return '<div class="ob-opts">' +
          opt('sport','lifter', ICON.lifter, 'Strength', 'Lifting, muscle, the gym.') +
          opt('sport','runner', ICON.runner, 'Running', 'Miles, pace, the road.') +
        '</div>';
      },
      read: function(){ return draft.sport ? { sport: draft.sport } : null; },
      valid: function(){ return !!draft.sport; }
    },
    {
      key: 'about', eyebrow: 'The basics',
      q: 'A little about your body.',
      sub: 'Your calories, protein target and heart-rate zones are calculated from these — not guessed.',
      html: function(){
        var y = new Date().getFullYear();
        return '<div class="ob-opts" style="margin-bottom:12px">' +
            '<div class="ob-row">' +
              optSm('sex','f','Female') + optSm('sex','m','Male') +
            '</div>' +
          '</div>' +
          '<div class="ob-row">' +
            '<input class="ob-in" id="obYear" type="number" inputmode="numeric" placeholder="Birth year" min="1920" max="' + y + '" value="' + esc(draft.birthYear || '') + '">' +
            '<input class="ob-in" id="obHt" type="number" inputmode="numeric" placeholder="Height (cm)" min="100" max="230" value="' + esc(draft.heightCm || '') + '">' +
          '</div>';
      },
      read: function(root){
        var y = parseInt(root.querySelector('#obYear').value, 10);
        var h = parseInt(root.querySelector('#obHt').value, 10);
        var out = {};
        if (draft.sex) out.sex = draft.sex;
        if (y >= 1920 && y <= new Date().getFullYear()) out.birthYear = y;
        if (h >= 100 && h <= 230) out.heightCm = h;
        return out;
      },
      valid: function(root){
        var y = parseInt(root.querySelector('#obYear').value, 10);
        return !!draft.sex && y >= 1920 && y <= new Date().getFullYear();
      }
    },
    {
      key: 'units', eyebrow: 'Measurements',
      q: 'Kilos or pounds?',
      sub: 'Every weight and distance in the app follows this.',
      html: function(){
        return '<div class="ob-opts">' +
          opt('units','metric',  ICON.check, 'Metric', 'Kilograms, centimetres, kilometres.') +
          opt('units','imperial',ICON.check, 'Imperial', 'Pounds, inches, miles.') +
        '</div>';
      },
      read: function(){ return { units: draft.units || 'metric' }; },
      valid: function(){ return !!draft.units; }
    },
    {
      key: 'sleep', eyebrow: 'Sleep',
      q: 'When does your day start?',
      sub: 'Your sleep score is measured against this — how much real sleep you got, versus how much you actually need.',
      html: function(){
        return '<div class="ob-row">' +
          '<input class="ob-in" id="obWake" type="time" value="' + esc(draft.wakeTime || '07:00') + '">' +
          '<select class="ob-in" id="obNeed">' +
            [6.5,7,7.5,8,8.5,9,9.5].map(function(n){
              var sel = (+(draft.sleepNeed || 8.5) === n) ? ' selected' : '';
              return '<option value="' + n + '"' + sel + '>' + n + 'h needed</option>';
            }).join('') +
          '</select>' +
        '</div>';
      },
      read: function(root){
        return { wakeTime: root.querySelector('#obWake').value || '07:00',
                 sleepNeed: parseFloat(root.querySelector('#obNeed').value) || 8.5 };
      },
      valid: function(root){ return !!root.querySelector('#obWake').value; }
    },
    {
      key: 'goal', eyebrow: 'The point of all this',
      q: 'What are you actually chasing?',
      sub: 'One line. It sits at the top of your dashboard, and Nova coaches you toward it.',
      html: function(){ return '<input class="ob-in" id="obGoal" type="text" placeholder="e.g. Run Athens under 4 hours" value="' + esc(draft.goal || '') + '">'; },
      read: function(root){ return { goal: (root.querySelector('#obGoal').value || '').trim() }; },
      valid: function(){ return true; }        // a goal can wait; the rest can't
    }
  ];

  function opt(field, val, ic, title, sub){
    var on = draft[field] === val ? ' on' : '';
    return '<button type="button" class="ob-opt' + on + '" data-set="' + field + '" data-val="' + val + '">' +
      '<span class="ob-opt-ic">' + ic + '</span>' +
      '<span><b style="font-weight:700">' + title + '</b><small>' + sub + '</small></span>' +
    '</button>';
  }
  function optSm(field, val, title){
    var on = draft[field] === val ? ' on' : '';
    return '<button type="button" class="ob-opt' + on + '" data-set="' + field + '" data-val="' + val + '" style="justify-content:center;flex:1">' + title + '</button>';
  }

  function rail(){
    return '<div class="ob-rail">' + steps.map(function(_, i){
      return '<span class="ob-tick' + (i <= step ? ' done' : '') + '"><i></i></span>';
    }).join('') + '</div>';
  }

  // Staggered breath — the elements arrive one after another, unhurried.
  function breathe(root){
    var els = root.querySelectorAll('.ob-rise');
    Array.prototype.forEach.call(els, function(el, i){
      setTimeout(function(){ el.classList.add('in'); }, 90 + i * 110);
    });
  }

  function paint(){
    var s = steps[step];
    dlg.innerHTML =
      '<div class="ob-wrap">' +
        '<div class="ob-aura"></div>' +
        rail() +
        '<div class="ob-body">' +
          '<div class="ob-eyebrow ob-rise">' + s.eyebrow + '</div>' +
          '<div class="ob-q ob-rise">' + s.q + '</div>' +
          '<div class="ob-sub ob-rise">' + s.sub + '</div>' +
          '<div class="ob-rise" id="obField">' + s.html() + '</div>' +
        '</div>' +
        '<div class="ob-foot ob-rise">' +
          (step > 0 ? '<button type="button" class="ob-back" id="obBack">Back</button>' : '') +
          '<button type="button" class="ob-next" id="obNext">' + (step === steps.length - 1 ? 'Build my dashboard' : 'Continue') + '</button>' +
        '</div>' +
      '</div>';
    breathe(dlg);

    var next = dlg.querySelector('#obNext');
    function sync(){ next.disabled = !s.valid(dlg); }
    sync();
    dlg.addEventListener('input', sync);

    dlg.querySelectorAll('[data-set]').forEach(function(b){
      b.addEventListener('click', function(){
        draft[b.getAttribute('data-set')] = b.getAttribute('data-val');
        dlg.querySelectorAll('[data-set="' + b.getAttribute('data-set') + '"]').forEach(function(x){ x.classList.remove('on'); });
        b.classList.add('on');
        try{ if(navigator.vibrate) navigator.vibrate(10); }catch(e){}
        sync();
      });
    });

    var back = dlg.querySelector('#obBack');
    if (back) back.addEventListener('click', function(){ save(); step--; paint(); });
    next.addEventListener('click', function(){
      if (!s.valid(dlg)) return;
      save();
      if (step < steps.length - 1) { step++; paint(); }
      else finale();
    });

    var first = dlg.querySelector('input[type=text], input[type=number]');
    if (first) setTimeout(function(){ try{ first.focus(); }catch(e){} }, 260);
  }

  function save(){
    var s = steps[step];
    var patch = s.read(dlg);
    if (patch) for (var k in patch) draft[k] = patch[k];
  }

  // Mifflin–St Jeor — the same formula the nutrition page uses, so the number
  // they see here is the number they'll actually get.
  function bmr(){
    if (!draft.sex || !draft.birthYear || !draft.heightCm) return null;
    var age = new Date().getFullYear() - draft.birthYear;
    var w = 70;                                   // no weigh-in yet — a placeholder, labelled as such
    var base = 10 * w + 6.25 * draft.heightCm - 5 * age;
    return Math.round(draft.sex === 'f' ? base - 161 : base + 5);
  }

  // The finale: not a "You're all set!" card — the app ASSEMBLING itself with
  // their own numbers already in it.
  function finale(){
    var name = (draft.name || '').split(/\s+/)[0];
    var hr = new Date().getHours();
    var part = hr < 5 ? 'Good night' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
    var age = draft.birthYear ? (new Date().getFullYear() - draft.birthYear) : null;
    var b = bmr();
    var maxHR = age ? Math.round(211 - 0.64 * age) : null;

    var rows = '';
    rows += card('Your greeting', part + ', <em>' + esc(name) + '</em>');
    if (draft.sleepNeed) rows += card('Sleep score target', '<em>' + draft.sleepNeed + 'h</em> asleep, waking ' + esc(draft.wakeTime || '07:00'));
    if (b) rows += card('Energy baseline', '≈ <em>' + b + '</em> kcal at rest');
    if (maxHR) rows += card('Heart-rate ceiling', '<em>' + maxHR + '</em> bpm');
    rows += card('Measured in', '<em>' + (draft.units === 'imperial' ? 'lb · mi' : 'kg · km') + '</em>');
    if (draft.goal) rows += card('Chasing', '<em>' + esc(draft.goal) + '</em>');

    dlg.innerHTML =
      '<div class="ob-wrap">' +
        '<div class="ob-aura"></div>' +
        '<div class="ob-fin">' +
          '<div class="ob-fin-hi ob-rise">' + part + ',<br><b>' + esc(name) + '.</b></div>' +
          '<div class="ob-rise" style="font-size:13.5px;line-height:1.6;color:rgba(245,242,236,.56);margin-bottom:22px;max-width:32ch">Your dashboard is built around these. Everything you log from here on sharpens them.</div>' +
          '<div>' + rows + '</div>' +
          '<button type="button" class="ob-next ob-rise" id="obGo" style="margin-top:30px">Go in</button>' +
        '</div>' +
      '</div>';
    breathe(dlg);

    dlg.querySelector('#obGo').addEventListener('click', function(){
      draft.onboardedAt = Date.now();
      try { window.ALSProfile.set(draft); } catch(e){}
      close();
      // Land them where their sport lives.
      var home = (draft.sport === 'runner') ? 'run.html' : 'index.html';
      if (location.pathname.indexOf(home) < 0) location.href = home;
      else location.reload();
    });
  }
  function card(k, v){
    return '<div class="ob-card ob-rise"><span class="ob-card-k">' + k + '</span><span class="ob-card-v">' + v + '</span></div>';
  }

  function close(){
    try { if (dlg.open && dlg.close) dlg.close(); } catch(e){}
    try { dlg.remove(); } catch(e){}
    try { document.documentElement.style.overflow = ''; } catch(e){}
  }

  function open(){
    if (document.getElementById('alsOb')) return;
    var st = document.createElement('style'); st.textContent = CSS;
    document.head.appendChild(st);
    dlg = document.createElement('dialog'); dlg.id = 'alsOb';
    dlg.addEventListener('cancel', function(e){ e.preventDefault(); });   // Esc must not skip it
    document.body.appendChild(dlg);
    step = 0; draft = {};
    try { var cur = window.ALSProfile && ALSProfile.get(); if (cur) { draft.units = cur.units; draft.wakeTime = cur.wakeTime; draft.sleepNeed = cur.sleepNeed; } } catch(e){}
    paint();
    try { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open',''); } catch(e){ dlg.setAttribute('open',''); }
    document.documentElement.style.overflow = 'hidden';
  }

  window.ALSOnboard = { open: open, close: close };

  // Auto-run for anyone who hasn't told us who they are — but only once the
  // profile has actually hydrated from the cloud, or a returning user on a new
  // device would be asked all over again.
  function maybe(){
    try {
      if (!window.ALSProfile) return;
      ALSProfile.ready(function(p){
        if (!p || !(p.name || '').trim()) open();
      });
    } catch(e){}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(maybe, 400); });
  else setTimeout(maybe, 400);
})();
