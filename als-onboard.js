// ════════════════════════════════════════════════════════════════
// ALSOnboard — the first thing anyone ever sees.
//
// Eight screens, one question each, full-bleed. AURORA's own language:
// Instrument Serif hero words, near-mono emerald, no emoji, no imagery. This
// is an offline-first PWA — "cinematic" here is typography and pacing, not
// megabytes of video.
//
// THE RULE: every question maps to a stored field AND a surface it visibly
// changes. If it can't name the surface it moves, it isn't asked.
//
//   name        → the greeting, everywhere
//   units       → asked BEFORE any measurement, so every field that follows
//                 speaks their language (cm/kg vs ft-in/lb)
//   sport       → where the app opens; the examples it gives
//   sex/year    → BMR (Mifflin–St Jeor), heart-rate zones. Sex is skippable.
//   height/kg   → BMR, protein target. NO WEIGHT → NO ENERGY NUMBER SHOWN.
//                 (An earlier version invented a 70kg person and printed a
//                 calorie baseline from it. Never again: no fabricated numbers.)
//   wake/need   → the sleep score (bridged into sleep:profile)
//   goal        → the north-star line
//
// NOTHING IS SAVED UNTIL THE LAST TAP. Abandon halfway and the app forgets
// you — which is what makes it safe to look around.
//
// Native <dialog> + showModal() (top layer): ancestor transforms on the page
// backgrounds break position:fixed.
// ════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  if (window.ALSOnboard) return;

  var REDUCED = false;
  try { REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  var CSS = [
    '#alsOb{position:fixed;inset:0;width:100vw;max-width:100vw;height:100vh;height:100dvh;max-height:100dvh;margin:0;padding:0;border:0;z-index:99998;background:#050507;color:#F5F2EC;overflow:hidden;}',
    '#alsOb::backdrop{background:#050507;}',
    '.ob-wrap{position:relative;height:100%;display:flex;flex-direction:column;padding:max(26px,env(safe-area-inset-top)) 24px max(24px,env(safe-area-inset-bottom));max-width:520px;margin:0 auto;}',
    '.ob-aura{position:absolute;top:-24%;left:50%;transform:translateX(-50%);width:130vw;height:62vh;pointer-events:none;background:radial-gradient(closest-side,rgba(52,226,176,.14),transparent 72%);}',
    '.ob-rail{position:relative;display:flex;gap:5px;margin-bottom:30px;flex-shrink:0;}',
    '.ob-tick{height:2px;flex:1;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;}',
    // scaleX, never width — animating width thrashes layout every frame
    '.ob-tick i{display:block;height:100%;width:100%;transform:scaleX(0);transform-origin:left;background:#34E2B0;box-shadow:0 0 10px rgba(52,226,176,.65);transition:transform .7s cubic-bezier(.22,1,.36,1);}',
    '.ob-tick.done i{transform:scaleX(1);}',
    // the body scrolls INSIDE itself, so the keyboard can never bury Continue
    '.ob-body{position:relative;flex:1;display:flex;flex-direction:column;justify-content:center;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;}',
    '.ob-eyebrow{font-family:ui-monospace,monospace;font-size:9.5px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:rgba(52,226,176,.72);margin-bottom:15px;}',
    '.ob-q{font-family:"Instrument Serif",Georgia,serif;font-style:italic;font-weight:400;font-size:clamp(29px,7.2vw,43px);line-height:1.08;letter-spacing:-.015em;color:#F5F2EC;margin-bottom:11px;}',
    '.ob-sub{font-size:14px;line-height:1.55;color:rgba(245,242,236,.56);margin-bottom:24px;max-width:34ch;}',
    '.ob-in{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);border-radius:15px;padding:15px 17px;color:#F5F2EC;-webkit-text-fill-color:#F5F2EC;font-size:17px;font-family:inherit;outline:none;transition:border-color .2s,background .2s;}',
    '.ob-in:focus{border-color:rgba(52,226,176,.55);background:rgba(52,226,176,.05);}',
    '.ob-in::placeholder{color:rgba(245,242,236,.28);}',
    '.ob-row{display:flex;gap:10px;}',
    '.ob-row+.ob-row{margin-top:10px;}',
    '.ob-lbl{font-family:ui-monospace,monospace;font-size:9px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(245,242,236,.30);margin:0 0 7px 3px;}',
    '.ob-opts{display:flex;flex-direction:column;gap:9px;}',
    '.ob-opt{display:flex;align-items:center;gap:13px;width:100%;text-align:left;padding:15px 16px;border-radius:15px;border:1px solid rgba(255,255,255,.10);background:rgba(255,255,255,.03);color:#F5F2EC;font-size:15.5px;font-family:inherit;cursor:pointer;transition:transform .12s,border-color .2s,background .2s;-webkit-tap-highlight-color:transparent;}',
    '.ob-opt:active{transform:scale(.985);}',
    '.ob-opt.on{border-color:rgba(52,226,176,.55);background:rgba(52,226,176,.08);}',
    '.ob-opt-ic{width:20px;height:20px;flex-shrink:0;color:#34E2B0;opacity:.9;}',
    '.ob-opt-ic svg{width:100%;height:100%;display:block;}',
    '.ob-opt small{display:block;font-size:12.5px;color:rgba(245,242,236,.5);margin-top:2px;}',
    '.ob-mini{display:flex;gap:8px;}',
    '.ob-mini .ob-opt{justify-content:center;flex:1;padding:13px 8px;font-size:14.5px;}',
    '.ob-skip{background:none;border:none;color:rgba(245,242,236,.32);font-size:12.5px;font-family:inherit;text-decoration:underline;text-underline-offset:3px;cursor:pointer;padding:10px 2px 0;}',
    '.ob-foot{position:relative;display:flex;align-items:center;gap:12px;padding-top:20px;flex-shrink:0;}',
    '.ob-next{flex:1;padding:16px;border-radius:15px;border:none;font-size:15.5px;font-weight:700;font-family:inherit;color:#04130D;background:linear-gradient(120deg,#34E2B0,#18C8C0 60%,#9B8CFF);cursor:pointer;transition:opacity .25s,transform .12s;}',
    '.ob-next:active{transform:scale(.985);}',
    '.ob-next[disabled]{opacity:.3;cursor:default;}',
    '.ob-back{background:none;border:none;color:rgba(245,242,236,.34);font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;padding:10px 4px;}',
    // the entrance: elements breathe in, one after another, unhurried
    '.ob-rise{opacity:0;transform:translateY(14px);}',
    '.ob-rise.in{opacity:1;transform:none;transition:opacity .62s cubic-bezier(.22,1,.36,1),transform .62s cubic-bezier(.22,1,.36,1);}',
    // ── the cold open ──
    '.ob-open{display:flex;flex-direction:column;justify-content:center;height:100%;text-align:left;}',
    '.ob-mark{font-family:ui-monospace,monospace;font-size:11px;font-weight:700;letter-spacing:.42em;text-transform:uppercase;color:#34E2B0;margin-bottom:22px;}',
    '.ob-open-hi{font-family:"Instrument Serif",Georgia,serif;font-style:italic;font-size:clamp(34px,8.6vw,52px);line-height:1.1;letter-spacing:-.02em;color:#F5F2EC;margin-bottom:16px;}',
    '.ob-open-sub{font-size:14.5px;line-height:1.6;color:rgba(245,242,236,.5);max-width:30ch;}',
    // ── the assembly ──
    '.ob-fin{display:flex;flex-direction:column;justify-content:center;height:100%;overflow-y:auto;}',
    '.ob-fin-hi{font-family:"Instrument Serif",Georgia,serif;font-style:italic;font-size:clamp(32px,8vw,50px);line-height:1.05;color:#F5F2EC;margin-bottom:8px;}',
    '.ob-fin-hi b{font-weight:400;color:#34E2B0;}',
    '.ob-fin-sub{font-size:13.5px;line-height:1.6;color:rgba(245,242,236,.5);max-width:32ch;margin-bottom:20px;}',
    '.ob-card{display:flex;align-items:baseline;justify-content:space-between;gap:14px;padding:13px 0;border-bottom:1px solid rgba(255,255,255,.06);}',
    '.ob-card:last-of-type{border-bottom:none;}',
    '.ob-card-k{font-family:ui-monospace,monospace;font-size:9.5px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(245,242,236,.30);}',
    '.ob-card-v{font-family:ui-monospace,monospace;font-size:15.5px;font-weight:700;color:#F5F2EC;text-align:right;}',
    '.ob-card-v em{font-style:normal;color:#34E2B0;}',
    '.ob-vow{margin-top:22px;padding-top:16px;border-top:1px solid rgba(255,255,255,.06);font-size:12.5px;line-height:1.6;color:rgba(245,242,236,.42);}',
    '.ob-vow b{color:rgba(245,242,236,.72);font-weight:400;}'
  ].join('');

  var ICON = {
    lifter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10"/></svg>',
    runner: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="15" cy="4.5" r="1.8"/><path d="M9.5 20l2-5 3-2-1-4-4 2-1.5 3M14.5 13l2.5 2 .8 5"/></svg>',
    metric: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h18v8H3z"/><path d="M7 8v4M11 8v3M15 8v4M19 8v3"/></svg>',
    imperial: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4"/></svg>'
  };

  var draft = {}, step = 0, dlg = null;

  function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function buzz(ms){ try{ if (navigator.vibrate) navigator.vibrate(ms || 10); }catch(e){} }
  var imperial = function(){ return draft.units === 'imperial'; };

  // canonical storage is always metric; the UI just speaks their language
  function cmToFtIn(cm){ var t = Math.round(cm / 2.54); return { ft: Math.floor(t / 12), inch: t % 12 }; }
  function ftInToCm(ft, inch){ return Math.round(((+ft || 0) * 12 + (+inch || 0)) * 2.54); }
  function kgToLb(kg){ return Math.round(kg * 2.20462); }
  function lbToKg(lb){ return Math.round((+lb) / 2.20462 * 10) / 10; }

  function opt(field, val, ic, title, sub){
    return '<button type="button" class="ob-opt' + (draft[field] === val ? ' on' : '') + '" data-set="' + field + '" data-val="' + val + '">' +
      (ic ? '<span class="ob-opt-ic">' + ic + '</span>' : '') +
      '<span><b style="font-weight:700">' + title + '</b>' + (sub ? '<small>' + sub + '</small>' : '') + '</span>' +
    '</button>';
  }
  function mini(field, val, title){
    return '<button type="button" class="ob-opt' + (draft[field] === val ? ' on' : '') + '" data-set="' + field + '" data-val="' + val + '">' + title + '</button>';
  }

  // ── the questions ────────────────────────────────────────────────────────
  var steps = [
    {
      key: 'name', eyebrow: 'To begin',
      q: 'What should we call you?',
      sub: 'This is the name the app greets you with, every morning.',
      html: function(){ return '<input class="ob-in" id="obName" type="text" autocomplete="given-name" enterkeyhint="next" placeholder="Your name" value="' + esc(draft.name || '') + '">'; },
      focus: '#obName',
      read: function(r){ var v = (r.querySelector('#obName').value || '').trim(); return v ? { name: v } : null; },
      valid: function(r){ return !!(r.querySelector('#obName').value || '').trim(); }
    },
    {
      // BEFORE any measurement — so every field below speaks their language.
      key: 'units', eyebrow: 'Measurements',
      q: 'How do you think about numbers?',
      sub: 'Every weight and distance in the app follows this — and so do the next two questions.',
      html: function(){
        return '<div class="ob-opts">' +
          opt('units','metric',   ICON.metric,   'Kilos and kilometres', 'kg · cm · km') +
          opt('units','imperial', ICON.imperial, 'Pounds and miles',     'lb · ft/in · mi') +
        '</div>';
      },
      read: function(){ return draft.units ? { units: draft.units } : null; },
      valid: function(){ return !!draft.units; }
    },
    {
      key: 'sport', eyebrow: 'Your training',
      q: 'What do you train for?',
      sub: 'It decides where the app opens, and what it puts in front of you first.',
      html: function(){
        return '<div class="ob-opts">' +
          opt('sport','runner', ICON.runner, 'Running', 'Miles, pace, the road ahead.') +
          opt('sport','lifter', ICON.lifter, 'Strength', 'Lifting, muscle, the gym.') +
        '</div>';
      },
      read: function(){ return draft.sport ? { sport: draft.sport } : null; },
      valid: function(){ return !!draft.sport; }
    },
    {
      key: 'body', eyebrow: 'The basics',
      q: 'A little about your body.',
      sub: 'Your calorie baseline, protein target and heart-rate zones are calculated from these — not guessed.',
      html: function(){
        var y = new Date().getFullYear();
        var h = '';
        h += '<div class="ob-lbl">You are</div>';
        h += '<div class="ob-mini" style="margin-bottom:14px">' + mini('sex','f','Female') + mini('sex','m','Male') + '</div>';
        h += '<div class="ob-lbl">Born</div>';
        h += '<div class="ob-row" style="margin-bottom:14px"><input class="ob-in" id="obYear" type="number" inputmode="numeric" enterkeyhint="next" placeholder="Birth year" min="1920" max="' + y + '" value="' + esc(draft.birthYear || '') + '"></div>';
        if (imperial()) {
          var fi = draft.heightCm ? cmToFtIn(draft.heightCm) : {};
          h += '<div class="ob-lbl">Height &amp; weight</div>' +
               '<div class="ob-row">' +
                 '<input class="ob-in" id="obFt" type="number" inputmode="numeric" placeholder="ft" min="3" max="7" value="' + esc(fi.ft != null ? fi.ft : '') + '">' +
                 '<input class="ob-in" id="obIn" type="number" inputmode="numeric" placeholder="in" min="0" max="11" value="' + esc(fi.inch != null ? fi.inch : '') + '">' +
                 '<input class="ob-in" id="obWt" type="number" inputmode="decimal" placeholder="lb" min="60" max="500" value="' + esc(draft.weightKg ? kgToLb(draft.weightKg) : '') + '">' +
               '</div>';
        } else {
          h += '<div class="ob-lbl">Height &amp; weight</div>' +
               '<div class="ob-row">' +
                 '<input class="ob-in" id="obHt" type="number" inputmode="numeric" placeholder="Height (cm)" min="100" max="230" value="' + esc(draft.heightCm || '') + '">' +
                 '<input class="ob-in" id="obWt" type="number" inputmode="decimal" placeholder="Weight (kg)" min="30" max="250" value="' + esc(draft.weightKg || '') + '">' +
               '</div>';
        }
        h += '<button type="button" class="ob-skip" data-skip="sex">I’d rather not say my sex</button>';
        return h;
      },
      read: function(r){
        var out = {};
        out.sex = draft.sex || null;                       // may legitimately be null
        var y = parseInt(r.querySelector('#obYear').value, 10);
        if (y >= 1920 && y <= new Date().getFullYear()) out.birthYear = y;
        if (imperial()) {
          var ft = r.querySelector('#obFt').value, inch = r.querySelector('#obIn').value;
          if (ft) out.heightCm = ftInToCm(ft, inch);
          var lb = parseFloat(r.querySelector('#obWt').value);
          if (lb > 0) out.weightKg = lbToKg(lb);
        } else {
          var cm = parseInt(r.querySelector('#obHt').value, 10);
          if (cm >= 100 && cm <= 230) out.heightCm = cm;
          var kg = parseFloat(r.querySelector('#obWt').value);
          if (kg > 0) out.weightKg = Math.round(kg * 10) / 10;
        }
        return out;
      },
      // Weight is genuinely optional — skip it and the energy figure simply
      // isn't shown. We do not invent a body.
      valid: function(r){
        var y = parseInt(r.querySelector('#obYear').value, 10);
        var hasH = imperial() ? !!r.querySelector('#obFt').value : !!r.querySelector('#obHt').value;
        return y >= 1920 && y <= new Date().getFullYear() && hasH;
      }
    },
    {
      key: 'sleep', eyebrow: 'Sleep',
      q: 'When does your day start?',
      sub: 'Your sleep score is measured against this — how much real sleep you got, against how much you actually need.',
      html: function(){
        return '<div class="ob-lbl">Wake by</div>' +
          '<div class="ob-row">' +
            '<input class="ob-in" id="obWake" type="time" value="' + esc(draft.wakeTime || '07:00') + '">' +
            '<select class="ob-in" id="obNeed">' +
              [6.5,7,7.5,8,8.5,9,9.5].map(function(n){
                return '<option value="' + n + '"' + ((+(draft.sleepNeed || 8.5) === n) ? ' selected' : '') + '>' + n + 'h needed</option>';
              }).join('') +
            '</select>' +
          '</div>';
      },
      read: function(r){
        return { wakeTime: r.querySelector('#obWake').value || '07:00',
                 sleepNeed: parseFloat(r.querySelector('#obNeed').value) || 8.5 };
      },
      valid: function(r){ return !!r.querySelector('#obWake').value; }
    },
    {
      key: 'goal', eyebrow: 'The point of all this',
      q: 'What are you actually chasing?',
      sub: 'One line. It sits at the top of your dashboard, and it’s what Nova coaches you toward.',
      html: function(){
        // it listened on screen three
        var ph = draft.sport === 'runner' ? 'e.g. Run Athens under 4 hours' : 'e.g. Bench 100kg, stay lean';
        return '<input class="ob-in" id="obGoal" type="text" enterkeyhint="done" placeholder="' + ph + '" value="' + esc(draft.goal || '') + '">';
      },
      read: function(r){ return { goal: (r.querySelector('#obGoal').value || '').trim() }; },
      valid: function(){ return true; }                    // a goal can come later; the rest can't
    }
  ];

  function rail(){
    return '<div class="ob-rail">' + steps.map(function(_, i){
      return '<span class="ob-tick' + (i <= step ? ' done' : '') + '"><i></i></span>';
    }).join('') + '</div>';
  }
  function breathe(root){
    var els = root.querySelectorAll('.ob-rise');
    Array.prototype.forEach.call(els, function(el, i){
      if (REDUCED) { el.classList.add('in'); return; }
      setTimeout(function(){ el.classList.add('in'); }, 80 + i * 105);
    });
  }

  // ── screen 0: the cold open ──────────────────────────────────────────────
  function intro(){
    dlg.innerHTML =
      '<div class="ob-wrap">' +
        '<div class="ob-aura"></div>' +
        '<div class="ob-open">' +
          '<div class="ob-mark ob-rise">Aurora</div>' +
          '<div class="ob-open-hi ob-rise">This is empty<br>until it knows you.</div>' +
          '<div class="ob-open-sub ob-rise">Six questions. Two minutes. Then every number in here is yours.</div>' +
        '</div>' +
        '<div class="ob-foot ob-rise"><button type="button" class="ob-next" id="obBegin">Begin</button></div>' +
      '</div>';
    breathe(dlg);
    dlg.querySelector('#obBegin').addEventListener('click', function(){ buzz(); step = 0; paint(); });
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
          '<div class="ob-rise">' + s.html() + '</div>' +
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
        var f = b.getAttribute('data-set');
        draft[f] = b.getAttribute('data-val');
        dlg.querySelectorAll('[data-set="' + f + '"]').forEach(function(x){ x.classList.remove('on'); });
        b.classList.add('on');
        buzz();
        sync();
      });
    });
    var skip = dlg.querySelector('[data-skip]');
    if (skip) skip.addEventListener('click', function(){
      draft.sex = null; buzz();
      dlg.querySelectorAll('[data-set="sex"]').forEach(function(x){ x.classList.remove('on'); });
      skip.textContent = 'Not saying — that’s fine';
      skip.style.color = 'rgba(52,226,176,.75)';
      sync();
    });

    var back = dlg.querySelector('#obBack');
    if (back) back.addEventListener('click', function(){ save(); step--; buzz(); paint(); });
    next.addEventListener('click', function(){
      if (!s.valid(dlg)) return;
      save(); buzz();
      if (step < steps.length - 1) { step++; paint(); }
      else finale();
    });

    // Only the name screen opens the keyboard. Doing it on every screen is hostile.
    if (s.focus) setTimeout(function(){ try{ dlg.querySelector(s.focus).focus(); }catch(e){} }, 300);
  }

  function save(){
    var patch = steps[step].read(dlg);
    if (patch) for (var k in patch) draft[k] = patch[k];
  }

  // Mifflin–St Jeor. Returns null without a real weight — we do not invent one.
  function bmr(){
    if (!draft.weightKg || !draft.heightCm || !draft.birthYear) return null;
    var age = new Date().getFullYear() - draft.birthYear;
    var base = 10 * draft.weightKg + 6.25 * draft.heightCm - 5 * age;
    if (draft.sex === 'f') return Math.round(base - 161);
    if (draft.sex === 'm') return Math.round(base + 5);
    return Math.round(base - 78);                 // sex not given → midpoint, honestly
  }

  // Numbers assemble rather than appear.
  function countUp(el, to, suffix){
    if (REDUCED || !(to > 0)) { el.textContent = to + (suffix || ''); return; }
    var t0 = null, dur = 900;
    function frame(t){
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * eased) + (suffix || '');
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // ── the assembly: their dashboard building itself, with their numbers ────
  function finale(){
    var name = (draft.name || '').split(/\s+/)[0];
    var hr = new Date().getHours();
    var part = hr < 5 ? 'Good night' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
    var age = draft.birthYear ? (new Date().getFullYear() - draft.birthYear) : null;
    var b = bmr();
    var maxHR = age ? Math.round(211 - 0.64 * age) : null;
    var protein = draft.weightKg ? Math.round(draft.weightKg * 1.6) : null;

    var rows = '';
    rows += card('Your greeting', part + ', <em>' + esc(name) + '</em>');
    rows += card('Sleep score target', '<em>' + (draft.sleepNeed || 8.5) + 'h</em> asleep, waking ' + esc(draft.wakeTime || '07:00'));
    if (b) rows += card('Energy baseline', '≈ <em><span data-n="' + b + '">0</span></em> kcal at rest');
    if (protein) rows += card('Protein target', '<em><span data-n="' + protein + '">0</span></em> g a day');
    if (maxHR) rows += card('Heart-rate ceiling', '<em><span data-n="' + maxHR + '">0</span></em> bpm');
    rows += card('Measured in', '<em>' + (imperial() ? 'lb · mi' : 'kg · km') + '</em>');
    if (draft.goal) rows += card('Chasing', '<em>' + esc(draft.goal) + '</em>');

    dlg.innerHTML =
      '<div class="ob-wrap">' +
        '<div class="ob-aura"></div>' +
        '<div class="ob-fin">' +
          '<div class="ob-fin-hi ob-rise">' + part + ',<br><b>' + esc(name) + '.</b></div>' +
          '<div class="ob-fin-sub ob-rise">Your dashboard is built around these. Everything you log from here sharpens them.</div>' +
          '<div>' + rows + '</div>' +
          '<div class="ob-vow ob-rise"><b>Your data is yours alone.</b> Nobody else can see it — not even the person who built this.</div>' +
          '<button type="button" class="ob-next ob-rise" id="obGo" style="margin-top:26px">Go in</button>' +
        '</div>' +
      '</div>';
    breathe(dlg);
    setTimeout(function(){
      dlg.querySelectorAll('[data-n]').forEach(function(el){ countUp(el, +el.getAttribute('data-n'), ''); });
    }, REDUCED ? 0 : 620);

    dlg.querySelector('#obGo').addEventListener('click', function(){
      buzz(18);
      draft.onboardedAt = Date.now();
      try { window.ALSProfile.set(draft); } catch(e){}      // the ONLY write in this whole flow
      close();
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
    if (!document.getElementById('alsObCss')) {
      var st = document.createElement('style'); st.id = 'alsObCss'; st.textContent = CSS;
      document.head.appendChild(st);
    }
    dlg = document.createElement('dialog'); dlg.id = 'alsOb';
    dlg.addEventListener('cancel', function(e){ e.preventDefault(); });     // Esc must not skip it
    document.body.appendChild(dlg);
    step = 0; draft = {};
    // Re-running from the account sheet? Start from what they already told us.
    try {
      var cur = window.ALSProfile && ALSProfile.get();
      if (cur) ['name','sex','birthYear','heightCm','weightKg','units','wakeTime','sleepNeed','goal','sport','pages'].forEach(function(k){
        if (cur[k] != null && cur[k] !== '') draft[k] = cur[k];
      });
    } catch(e){}
    intro();
    try { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open',''); } catch(e){ dlg.setAttribute('open',''); }
    document.documentElement.style.overflow = 'hidden';
  }

  window.ALSOnboard = { open: open, close: close };

  // First run: only once the profile has actually hydrated from the cloud, or a
  // returning user on a new device would be asked all over again.
  function maybe(){
    try {
      if (!window.ALSProfile) return;
      ALSProfile.ready(function(p){ if (!p || !(p.name || '').trim()) open(); });
    } catch(e){}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(maybe, 400); });
  else setTimeout(maybe, 400);
})();
