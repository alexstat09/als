# MÉTRON patterns: proven code (live in `ergasies.html`, als-v660/661)

Adapt names, keep the mechanics. Every snippet assumes the page tokens from SKILL.md §2.

## 1 · The strike that draws itself and stays
```html
<div class="tt"><span class="ttx">${esc(title)}</span></div>
```
```css
.task.done .tt{color:var(--faint)}
.ttx{background:linear-gradient(color-mix(in srgb,var(--c) 85%,transparent),color-mix(in srgb,var(--c) 85%,transparent)) no-repeat 0 60%/0 2px;
     -webkit-box-decoration-break:clone;box-decoration-break:clone}
.task.done .ttx{background-size:100% 2px}                       /* resting state = also the reduced-motion state */
.task.pop .ttx{animation:strike .55s cubic-bezier(.65,0,.35,1) .12s both}
.task.pop .tt{animation:ink .7s ease .1s both}
.task.unpop .ttx{animation:unstrike .38s cubic-bezier(.4,0,.2,1) both}
@keyframes strike{from{background-size:0 2px}to{background-size:100% 2px}}
@keyframes unstrike{from{background-size:100% 2px}to{background-size:0 2px}}
@keyframes ink{from{color:var(--text)}to{color:var(--faint)}}
.task.pop::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  background:linear-gradient(90deg,transparent,color-mix(in srgb,var(--c) 16%,transparent) 50%,transparent) no-repeat;
  background-size:45% 100%;animation:sweep .75s cubic-bezier(.4,0,.2,1) .05s both}
@keyframes sweep{from{background-position:-60% 0;opacity:1}to{background-position:160% 0;opacity:0}}
```
```js
var justDone=null;                       // var, not let: renderers read it on the first render
function toggleDone(id){
  const t=setTask(id,x=>{x.done=!x.done;x.doneAt=x.done?T():null});
  justDone=t&&t.done?id:null; renderAll(); justDone=null;
  const row=document.querySelector(`.task[data-id="${id}"]`);
  if(!t.done){ if(row) row.classList.add('unpop'); return; }
  if(row){ row.classList.add('pop'); burst(row.querySelector('.tick'), color); }
  tone([659,988]);                       // + day-complete glow/toast if the day just closed
}
```
The row (`.task`) needs `position:relative`.

## 2 · Week by day (7 columns, a cell per item)
```css
.paint{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;margin-top:18px;align-items:end}
.wcol{display:flex;flex-direction:column-reverse;gap:3px;min-height:66px;padding:4px;border-radius:6px;background:rgba(237,230,216,.025)}
.wcol.now{background:var(--amber-soft);box-shadow:inset 0 0 0 1px rgba(232,178,92,.28)}
.wcell{display:block;width:100%;height:10px;border-radius:3px;box-sizing:border-box;border:1.4px solid color-mix(in srgb,var(--c) 70%,transparent);background:transparent;padding:0;transition:background .4s,transform .15s}
.wcell.ok{background:var(--c);border-color:var(--c)}
.wcell:hover{transform:scaleY(1.3)}
.wcell.fresh{animation:stamp .65s cubic-bezier(.3,1.5,.5,1) .3s both}
@keyframes stamp{0%{transform:scale(.3);background:transparent}55%{transform:scale(1.18);box-shadow:0 0 14px 1px color-mix(in srgb,var(--c) 70%,transparent)}100%{transform:none;box-shadow:none}}
.wlab{grid-row:2;text-align:center;font-family:var(--mono);font-size:10.5px;letter-spacing:.04em;color:var(--faint)}
.wlab.now{color:var(--amber);font-weight:600}
.wk .big b{display:inline-block} .wk .big b.bump{animation:bump .55s cubic-bezier(.3,1.5,.5,1) .3s}
@keyframes bump{40%{transform:translateY(-4px);color:var(--amber)}}
```
```js
// days = the 7 ISO dates Mon→Sun (week is Mon–Sun: (d.getDay()+6)%7); wk sorted done-first
const DS2=['Δε','Τρ','Τε','Πε','Πα','Σα','Κυ'];
paint.innerHTML = days.map(d=>`<div class="wcol${d===t0?' now':''}">${
  wk.filter(t=>t.date===d).map(t=>`<button class="wcell${t.done?' ok':''}${t.done&&t.id===justDone?' fresh':''}"
     style="--c:${S[t.subj].c}" data-open="${t.id}" aria-label="${esc(S[t.subj].name+': '+t.title+(t.done?', έγινε':', ανοιχτή'))}"></button>`).join('')
}</div>`).join('') + days.map((d,i)=>`<span class="wlab${d===t0?' now':''}">${DS2[i]}</span>`).join('');
```

## 3 · Pending per subject
```html
<button data-goto="ist"><i style="background:#8FC2AC"></i><span>Ιστορία</span><em>3</em><span class="tr"><u style="width:100%;background:#8FC2AC"></u></span></button>
```
```css
.subl button{display:grid;grid-template-columns:8px minmax(0,1fr) auto;gap:7px 12px;align-items:center;padding:9px 6px;border-radius:8px}
.subl .tr{grid-column:1/-1;height:5px;border-radius:4px;background:rgba(237,230,216,.07);display:flex;overflow:hidden}
.subl em{font-family:var(--mono);font-size:13px;color:var(--text);font-style:normal} .subl em.z{color:var(--faint2)}
```

## 4 · The item panel (E)
Centred, two columns, labels above, rows sized to content:
```css
.drawer{position:fixed;top:50%;left:50%;width:min(720px,calc(100% - 32px));max-height:calc(100dvh - 48px);border-radius:18px;
  transform:translate(-50%,-47%) scale(.985);opacity:0;visibility:hidden;pointer-events:none;display:flex;flex-direction:column;overflow:hidden;
  transition:opacity .22s cubic-bezier(.2,.8,.2,1),transform .26s cubic-bezier(.2,.8,.2,1),visibility 0s .26s}
.drawer.on{opacity:1;visibility:visible;pointer-events:auto;transform:translate(-50%,-50%);transition:opacity .22s,transform .26s,visibility 0s}
.dw-b{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:24px;align-content:start;
  grid-auto-rows:max-content;   /* ⛔ without this, rows SHRINK inside the height-limited panel */
  overflow:auto;flex:1 1 auto;min-height:0}
@media(max-width:600px){.dw-b{grid-template-columns:minmax(0,1fr)}}
```
Inline-editable step (don't rebuild the list while an input inside it has focus):
```js
`<div class="dstep"><button class="stp${x.d?' ok':''}" data-dstep="${j}"><span class="b">${TICK}</span></button>
  <input class="dsin${x.d?' ok':''}" data-dsedit="${j}" value="${esc(x.t)}"><button class="x" data-drm="${j}">×</button></div>`
// Enter → blur; focusout → save if changed and non-empty, else restore
```
Full-width segmented control from existing pill buttons:
```css
#dwSrc,#dwType{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(0,1fr);gap:4px;background:var(--bg2);border:1px solid var(--line2);border-radius:11px;padding:3px}
#dwSrc .pill[aria-pressed="true"]{background:var(--surf3);border-color:var(--line2);color:var(--text)}
```
Toggle as a card with its meaning; footer with Κλείσιμο pushed right and a light primary:
```css
.dw-b>.toggle.toggle{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center;padding:14px 16px;border:1px solid var(--line2);border-radius:12px}
.dw-f #dwClose{margin-left:auto}
.dw-f .btn.primary{background:var(--text);border-color:var(--text);color:var(--ink)}
.dw-f .del{border:1px solid rgba(232,131,111,.38);border-radius:10px;padding:9px 14px}   /* two-step: «Σίγουρα; Πάτα ξανά» */
```

## 5 · Settings as day cards
```css
.sched{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
.srow{display:flex;flex-direction:column;align-items:stretch;gap:10px;padding:12px;border:1px solid var(--line);border-radius:12px;background:rgba(237,230,216,.02)}
.slots{display:flex;flex-direction:column;gap:6px} .slots .slot .x{margin-left:auto} .slots .addslot{width:100%}
@media(max-width:600px){.sched{grid-template-columns:repeat(2,minmax(0,1fr))}}
```

## 6 · Frozen-data render harness (for screenshots without touching his data)
Copy the page, strip `supabase.min.js`, `sync.js`, `als-sync-status.js`, inline local CSS/JS, and inject at the top
of `<head>`: a fixed `Date` (today) + `localStorage.setItem(<page key>, <frozen JSON>)` + stub
`window.initCloudSync=function(){window.ALSSync={}}`. Then drive it with Playwright from
`video-kit/node_modules` (select rows by visible text, e.g. `.task:has-text("Κείμενο 26")`; ids are store-internal).
⛔ Never load real sync scripts in a harness (the weigh-in incident).
