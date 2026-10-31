{{HEAD}}
/* ══ ΑΡΧΙΚΟΙ ΧΡΟΝΟΙ — ό,τι ΔΕΝ έχει το καλούπι των κειμένων (πάνω από εδώ: αυτούσιο το lectio.tpl) ══ */
.dg{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:16px;overflow:hidden}
.dg.d6{grid-template-columns:repeat(6,minmax(0,1fr))}
.dg .dk{border-left:0;background:var(--bg)}
.dg .dk:hover{background:#121110}
.dg .dk[aria-pressed="true"]{background:#0d1918}
.dg .dk .t.la{font-family:var(--serif);font-style:normal;font-size:24px}
.dlbl{margin:34px 0 10px;font-family:var(--mono);font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--faint)}
.dlbl:first-child{margin-top:0}
.tbl td.f a{color:var(--ink);text-decoration:none;border-bottom:1px dotted rgba(var(--lat),.4)}
.tbl td.f a:hover{color:rgb(var(--hit))}
.tbl td.f small{display:block;font-family:var(--mono);font-size:10px;letter-spacing:.14em;color:var(--faint)}
.tbl td.wh{color:var(--dim);font-size:13.5px}
.tbl td.wh b{font-family:var(--serif);font-weight:400;font-size:17px;color:var(--ink)}
.tbl td.wh i{font-style:normal;font-family:var(--mono);font-size:10px;letter-spacing:.12em;color:var(--faint);margin-left:4px}
.tbl td.st{width:28px;font-family:var(--mono);font-size:12px;text-align:center}
.st .ok{color:rgb(var(--ok))} .st .no{color:rgb(var(--warn))}
.jump{display:flex;flex-wrap:wrap;gap:6px 18px;margin:-18px 0 34px;font-family:var(--mono);font-size:10.5px;letter-spacing:.16em}
.jump a{color:var(--dim);text-decoration:none}
.jump a:hover{color:var(--ink)}
.card .form.lg{font-size:50px}
.card .also{margin-top:10px;text-align:center;font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint)}
a.tbtn{text-decoration:none;color:inherit}
@media (max-width:1040px){
  .dg.d6{grid-template-columns:repeat(4,minmax(0,1fr))}
}
@media (max-width:560px){
  .dg,.dg.d6{grid-template-columns:repeat(2,minmax(0,1fr))}
  .card .form.lg{font-size:36px}
}
@media (prefers-reduced-motion:reduce){ html{scroll-behavior:auto} }
</style>
</head>
<body>
<div class="shell">
  <div class="top">
    <a href="latinika.html">&#8592; Λατινικά</a>
    <span class="sl">/</span>
    <span class="wh"><span class="wm">MÉTRON · </span>Λατινικά · Αρχικοί χρόνοι</span>
  </div>

  <header class="cover">
    <div>
      <div class="eyebrow"><b>Lectio XVI–XXVII</b> · {{N_TEXTS}} κείμενα · {{N_FORMS}} τύποι</div>
      <h1>Αρχικοί χρόνοι</h1>
      <p class="lead">Κάθε ρήμα των κειμένων, όπως εμφανίζεται μέσα τους, με τους αρχικούς του χρόνους. Δες τα ανά κείμενο ή ανά κατηγορία, και κάνε κάρτες μέχρι να τα πεις όλα απέξω.</p>
    </div>
    <div class="face">
      <div class="n">{{N_LEM}}</div>
      <div class="l">ρήματα<br>όλα μαζί</div>
    </div>
  </header>

  <section class="band" aria-label="Μετρήσεις">
    <div>
      <div class="bl">Ρήματα κλειδωμένα</div>
      <div class="bn"><span id="bLock">0</span><small>/{{N_LEM}}</small></div>
      <div class="bs">✓ ξανά και ξανά, ως επανάληψη σε 7+ μέρες</div>
    </div>
    <div>
      <div class="bl">Κάρτες για σήμερα</div>
      <div class="bn" id="bDue">—</div>
      <div class="bs" id="bDueS">όλα τα ρήματα</div>
    </div>
    <div>
      <div class="bl">Για ξανά</div>
      <div class="bn" id="bRed">0</div>
      <div class="bs">ρήματα που η τελευταία κάρτα τους ήταν ✗</div>
    </div>
  </section>

  <nav class="tabs" role="tablist" aria-label="Ενότητες σελίδας">
    <button class="tab" role="tab" data-tab="pinakes" aria-selected="true">Πίνακες<span class="c">{{N_FORMS}}</span></button>
    <button class="tab" role="tab" data-tab="kartes" aria-selected="false">Κάρτες<span class="c" id="tcK"></span></button>
  </nav>

  <!-- ══ ΠΙΝΑΚΕΣ ══════════════════════════════════════════════ -->
  <section class="panel on" id="p-pinakes" role="tabpanel">
    <div class="gtools">
      <span class="lbl">Ομαδοποίηση</span>
      <div class="seg" role="group" aria-label="Ομαδοποίηση">
        <button type="button" data-grp="txt">Ανά κείμενο</button><button type="button" data-grp="cat">Κατά κατηγορία</button>
      </div>
      <span class="sp"></span>
      <button class="tbtn" id="hideV" type="button" aria-pressed="false">Κρύψε τους αρχικούς χρόνους</button>
    </div>
    <div id="tabs"></div>
  </section>

  <!-- ══ ΚΑΡΤΕΣ ═══════════════════════════════════════════════ -->
  <section class="panel" id="p-kartes" role="tabpanel">
    <div class="dlbl">Ανά κατηγορία</div>
    <div class="dg" id="deckC" role="group" aria-label="Κατηγορία"></div>
    <div class="dlbl">Ανά κείμενο</div>
    <div class="dg d6" id="deckT" role="group" aria-label="Κείμενο"></div>
    <div class="stage" id="stage"></div>
  </section>

  <footer class="foot">
    <b>Από πού είναι.</b> XXI–XXVII: ο πίνακας «Αρχικοί χρόνοι» της σελίδας κάθε κειμένου, αυτούσιος (ίδιοι τύποι, ίδια σειρά). XVI–XX: study4exams, «Ερμηνεία και γραμματική αναγνώριση των λέξεων» κάθε μαθήματος· η γραφή του τύπου είναι του βιβλίου. Ένα ρήμα που υπάρχει σε πολλά κείμενα γράφεται παντού με την ίδια μορφή. Στα αποθετικά κρατιέται η μορφή του βιβλίου (χωρίς σουπίνο)· όπου το study4exams δίνει σουπίνο, γράφεται στη σημείωση της κάρτας. Στο XIX το βιβλίο τυπώνει «coniuārvit» — εδώ γράφεται coniurāvit. Οι κάρτες μένουν σε αυτή τη συσκευή.
  </footer>
</div>

<script>
/* ══ ΤΑ ΔΕΔΟΜΕΝΑ — παράγονται από tools/latinika/archikoi.js. ⛔ Όχι με το χέρι. ══ */
{{DATA}}

/* ══ Η ΜΗΧΑΝΗ ═══════════════════════════════════════════════════════════ */
const CARD_KEY = 'latarx_cards_v1';   /* η επανάληψη: ένα ρήμα = μία κάρτα */
const UI_KEY = 'latarx_ui_v1';        /* καρτέλα + ομαδοποίηση + τράπουλα: μόνο ευκολία */
function lsGet(k, d){ try{ const v = localStorage.getItem(k); return v == null ? d : (JSON.parse(v) || d); }catch(e){ return d; } }
function lsSet(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); return true; }catch(e){ showSaveErr(); return false; } }
function showSaveErr(){ const b = document.getElementById('bDueS'); if (b) b.textContent = '⚠ Δεν σώθηκε: η αποθήκη της συσκευής είναι γεμάτη.'; }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
const ui = Object.assign({tab:'pinakes', grp:'txt', deck:'all'}, lsGet(UI_KEY, {}));
let cst = lsGet(CARD_KEY, {}); if (typeof cst !== 'object' || Array.isArray(cst)) cst = {};

/* ══ ΚΑΤΗΓΟΡΙΑ — ΜΟΝΟ από το `k` του λήμματος (το ίδιο που γράφει η στήλη «Συζυγία») ══
   Τα αποθετικά/ημιαποθετικά είναι δική τους ομάδα (εκεί χάνονται μονάδες)·
   βοηθητικά · ανώμαλα · ελλειπτικά μαζί, γιατί δεν ακολουθούν συζυγία. */
const CATS = [
  {id:'a', t:'α΄ συζυγία'}, {id:'b', t:'β΄ συζυγία'}, {id:'g', t:'γ΄ συζυγία'}, {id:'gio', t:'γ΄ σε -io'},
  {id:'d', t:'δ΄ συζυγία'}, {id:'dep', t:'Αποθετικά'}, {id:'irr', t:'Ανώμαλα κ.ά.'}
];
function catOf(L){
  const k = String(L.k || '');
  if (/αποθετικό/.test(k)) return 'dep';
  if (/^(βοηθητικό|ανώμαλο|ελλειπτικό)/.test(k)) return 'irr';
  if (/^γ΄ συζυγία \(σε -io\)/.test(k)) return 'gio';
  const m = /^([αβγδ])΄ συζυγία/.exec(k);
  return m ? {α:'a', β:'b', γ:'g', δ:'d'}[m[1]] : 'irr';
}
/* ΤΕΛΟΣ ΚΑΤΗΓΟΡΙΑΣ */

/* Ένα ρήμα, όλες οι εμφανίσεις του (με τη σειρά των κειμένων). */
const VERBS = {};
TEXTS.forEach(T => T.rows.forEach(r => {
  const v = VERBS[r.m] || (VERBS[r.m] = {m:r.m, L:LEX[r.m], cat:catOf(LEX[r.m]), occ:[]});
  v.occ.push(Object.assign({n:T.n, r:T.r}, r));
}));
const ORDER = Object.keys(VERBS);   /* σειρά πρώτης εμφάνισης */
function href(n){ return 'latinika-lectio' + n + '.html' + (n >= 21 ? '#grammatiki' : ''); }

/* ══ ΠΙΝΑΚΕΣ ══════════════════════════════════════════════════════════════ */
function mark(m){
  const s = cst['v:' + m];
  if (!s) return '';
  return s.i >= 7 ? '<span class="ok" title="κλειδωμένο">✓</span>' : s.i === 0 ? '<span class="no" title="τελευταία φορά ✗">✗</span>' : '';
}
function tablesByText(){
  let h = '<div class="jump">' + TEXTS.map(T => '<a href="#t' + T.n + '">' + T.r + '</a>').join('') + '</div>';
  TEXTS.forEach(T => {
    const lem = new Set(T.rows.map(r => r.m)).size;
    h += '<div class="sec" id="t' + T.n + '"><div class="sh"><h2>' + esc(T.t) + '</h2><span class="sp"></span>' +
         '<a class="tbtn" href="' + href(T.n) + '">Lectio ' + T.r + ' ↗</a>' +
         '<p class="sub">Lectio ' + T.r + ' · ' + T.rows.length + ' ρηματικοί τύποι από ' + lem + ' ρήματα, με τη σειρά του κειμένου.</p></div>' +
         '<div class="tw"><table class="tbl vt"><tr><th>#</th><th>Στο κείμενο</th><th>Αρχικοί χρόνοι</th><th class="hm">Συζυγία</th><th>Τύπος</th></tr>' +
         T.rows.map((r, k) => '<tr><td class="n">' + (k + 1) + '</td><td class="f">' + esc(r.w) + '</td><td class="lem"><span>' + esc(LEX[r.m].l) + '</span></td><td class="t hm">' + esc(LEX[r.m].k) + '</td><td class="t">' + esc(r.f) + '</td></tr>').join('') +
         '</table></div></div>';
  });
  return h;
}
function tablesByCat(){
  let h = '';
  CATS.forEach(c => {
    const vs = ORDER.filter(m => VERBS[m].cat === c.id);
    if (!vs.length) return;
    h += '<div class="sec"><div class="sh"><h2>' + esc(c.t) + '</h2>' +
         '<p class="sub">' + vs.length + ' ρήματα. Δίπλα, κάθε τύπος με τον οποίο εμφανίζεται και σε ποιο κείμενο.</p></div>' +
         '<div class="tw"><table class="tbl vt"><tr><th>#</th><th>Αρχικοί χρόνοι</th><th class="hm">Συζυγία</th><th>Στα κείμενα</th><th></th></tr>' +
         vs.map((m, k) => { const v = VERBS[m];
           return '<tr><td class="n">' + (k + 1) + '</td><td class="lem"><span>' + esc(v.L.l) + '</span></td><td class="t hm">' + esc(v.L.k) + '</td>' +
             '<td class="wh">' + v.occ.map(o => '<b>' + esc(o.w) + '</b><i>' + o.r + '</i>').join(' · ') + '</td><td class="st">' + mark(m) + '</td></tr>'; }).join('') +
         '</table></div></div>';
  });
  return h;
}
function fillTables(){
  if (ui.grp !== 'cat') ui.grp = 'txt';
  document.querySelectorAll('[data-grp]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.grp === ui.grp)));
  const box = document.getElementById('tabs');
  box.innerHTML = ui.grp === 'cat' ? tablesByCat() : tablesByText();
  const on = document.getElementById('hideV').getAttribute('aria-pressed') === 'true';
  box.querySelectorAll('table.vt').forEach(t => t.classList.toggle('hidecol', on));
}
document.querySelector('.gtools').addEventListener('click', e => {
  const gb = e.target.closest('[data-grp]');
  if (gb && ui.grp !== gb.dataset.grp){ ui.grp = gb.dataset.grp; lsSet(UI_KEY, ui); fillTables(); }
});
const hideV = document.getElementById('hideV');
hideV.addEventListener('click', () => {
  const on = hideV.getAttribute('aria-pressed') !== 'true';
  hideV.setAttribute('aria-pressed', String(on));
  hideV.textContent = on ? 'Δείξε τους αρχικούς χρόνους' : 'Κρύψε τους αρχικούς χρόνους';
  document.querySelectorAll('#tabs table.vt').forEach(t => t.classList.toggle('hidecol', on));
  document.querySelectorAll('#tabs td.lem.rv').forEach(td => td.classList.remove('rv'));
});
document.getElementById('tabs').addEventListener('click', e => {
  const lem = e.target.closest('table.hidecol td.lem'); if (lem) lem.classList.toggle('rv');
});

/* ══ ΚΑΡΤΕΣ — ίδια επανάληψη με τα κείμενα (✗ ↻ ✓), ένα ρήμα = μία κάρτα ══
   Μπροστά: ο τύπος όπως είναι στο κείμενο + η πρότασή του. Πίσω: οι αρχικοί
   χρόνοι, η συζυγία, τι τύπος είναι, η σημασία. */
const CARDS = ORDER.map(m => ({id:'v:' + m, m, v:VERBS[m]}));
const DECKS = [{k:'all', t:'Όλα', la:false}].concat(CATS.map(c => ({k:'c:' + c.id, t:c.t, la:false})));
const TDECKS = TEXTS.map(T => ({k:'t:' + T.n, t:T.r, la:true}));
function inDeck(c, k){
  if (k === 'all') return true;
  if (k.startsWith('c:')) return c.v.cat === k.slice(2);
  if (k.startsWith('t:')) return c.v.occ.some(o => String(o.n) === k.slice(2));
  return false;
}
function today(){ const d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset()*60000) / 864e5); }
function isDue(c){ const s = cst[c.id]; return s && s.d <= today(); }
function isNew(c){ return !cst[c.id]; }
function ivlText(days){ return days <= 0 ? 'σήμερα ξανά' : days === 1 ? 'αύριο' : 'σε ' + days + ' μέρες'; }
function plan(c, v){
  const s = cst[c.id] || {i:0, e:2.5, n:0, l:0};
  if (v === 'x') return {i:0, e:Math.max(1.3, s.e - .2), n:0, l:s.l + 1};
  if (v === 'r') return {i:s.n === 0 ? 1 : Math.max(1, Math.round(s.i * 1.2)), e:Math.max(1.3, s.e - .15), n:s.n + 1, l:s.l};
  return {i:s.n === 0 ? 1 : s.n === 1 ? 3 : Math.max(s.i + 1, Math.round(s.i * s.e)), e:s.e, n:s.n + 1, l:s.l};
}
let queue = [], cur = null, flipped = false, doneN = 0;
function deckStats(k){
  const cs = CARDS.filter(c => inDeck(c, k));
  return {all:cs.length, due:cs.filter(isDue).length, nw:cs.filter(isNew).length, lock:cs.filter(c => cst[c.id] && cst[c.id].i >= 7).length};
}
function deckBtn(d){
  const s = deckStats(d.k);
  return '<button class="dk" type="button" data-k="'+d.k+'" aria-pressed="'+(d.k === ui.deck)+'"><div class="t'+(d.la ? ' la' : '')+'">'+esc(d.t)+'</div><div class="s"><b>'+(s.due + s.nw)+'</b> για τώρα · '+s.all+' ρήματα<br>'+s.lock+' κλειδωμένα</div></button>';
}
function renderDeck(){
  document.getElementById('deckC').innerHTML = DECKS.map(deckBtn).join('');
  document.getElementById('deckT').innerHTML = TDECKS.map(deckBtn).join('');
  const all = deckStats('all');
  document.getElementById('bDue').textContent = all.due + all.nw;
  document.getElementById('bDueS').textContent = all.due + ' επανάληψη · ' + all.nw + ' νέες';
  document.getElementById('tcK').textContent = all.due + all.nw;
  document.getElementById('bLock').textContent = all.lock;
  document.getElementById('bRed').textContent = CARDS.filter(c => cst[c.id] && cst[c.id].i === 0).length;
}
function startDeck(k){
  if (![...DECKS, ...TDECKS].some(d => d.k === k)) k = 'all';
  ui.deck = k; lsSet(UI_KEY, ui); doneN = 0;
  let cs = CARDS.filter(c => inDeck(c, k));
  /* τράπουλα κειμένου: με τη σειρά ΑΥΤΟΥ του κειμένου, όχι της πρώτης εμφάνισης */
  if (k.startsWith('t:')){ const T = TEXTS.find(t => 't:' + t.n === k), pos = m => T.rows.findIndex(r => r.m === m); cs = cs.sort((x, y) => pos(x.m) - pos(y.m)); }
  queue = cs.filter(isDue).sort((a, b) => cst[a.id].d - cst[b.id].d).concat(cs.filter(isNew));
  renderDeck(); next();
}
function deckName(k){ const d = [...DECKS, ...TDECKS].find(x => x.k === k); return d ? (d.la ? 'Lectio ' + d.t : d.t) : ''; }
function next(){
  cur = queue.shift() || null; flipped = false;
  const st = document.getElementById('stage');
  if (!cur){
    const s = deckStats(ui.deck);
    const fut = CARDS.filter(c => inDeck(c, ui.deck) && cst[c.id]).map(c => cst[c.id].d).sort((a, b) => a - b)[0];
    st.innerHTML = '<div class="done"><div class="big">Τέλος για τώρα.</div><p>'+(doneN ? doneN + ' κάρτες σε αυτόν τον γύρο. ' : '')+s.lock+' από '+s.all+' ρήματα κλειδωμένα (επόμενη επανάληψη σε 7+ μέρες).'+(fut != null ? ' Η επόμενη κάρτα ' + ivlText(fut - today()) + '.' : '')+'</p><button class="tbtn" type="button" id="again">Ξανά όλες οι κάρτες: '+esc(deckName(ui.deck))+'</button></div>';
    document.getElementById('again').onclick = () => { queue = CARDS.filter(c => inDeck(c, ui.deck)); next(); };
    return;
  }
  st.innerHTML = cardHTML(cur) + rateHTML(cur) + '<div class="keys">Space: γύρνα · 1 ✗ · 2 ↻ · 3 ✓</div>' +
    '<div class="cfoot"><button type="button" id="cReset">μηδένισε τις κάρτες: '+esc(deckName(ui.deck))+'</button></div>';
  document.getElementById('cReset').onclick = () => {
    CARDS.filter(c => inDeck(c, ui.deck)).forEach(c => delete cst[c.id]);
    lsSet(CARD_KEY, cst); startDeck(ui.deck); fillTables();
  };
}
function cardHTML(c){
  /* σε τράπουλα κειμένου, ο τύπος ΑΥΤΟΥ του κειμένου */
  const occ = (ui.deck.startsWith('t:') && c.v.occ.find(o => String(o.n) === ui.deck.slice(2))) || c.v.occ[0];
  const L = c.v.L, more = c.v.occ.filter(o => o !== occ);
  let back = '<div class="lem">'+esc(L.l)+'</div><div class="facts"><span><b>Συζυγία</b>'+esc(L.k)+'</span><span><b>Εδώ</b>'+esc(occ.f)+'</span></div>';
  if (L.tr) back += '<div class="tr">'+esc(L.tr)+'</div>';
  if (occ.d) back += '<div class="gd">'+esc(occ.d)+'</div>';
  if (more.length) back += '<div class="also" style="display:block;margin-top:16px">επίσης: '+more.map(o => esc(o.w)+' ('+o.r+')').join(' · ')+'</div>';
  return '<div class="cmeta"><span>'+esc(deckName(ui.deck))+(ui.deck.startsWith('t:') ? '' : ' · Lectio '+occ.r)+'</span><span>'+(queue.length + 1)+' ακόμα</span></div>' +
    '<div class="card" id="card" tabindex="0" role="button" aria-label="Γύρνα την κάρτα"><div class="ask">Αρχικοί χρόνοι και συζυγία;</div>' +
    '<div class="form'+(occ.w.length > 11 ? ' lg' : '')+'">'+esc(occ.w)+'</div><div class="ctx">'+occ.ctx+'</div>' +
    '<div class="tap">πάτα ή Space για να τη γυρίσεις</div><div class="back">'+back+'</div></div>';
}
function rateHTML(c){
  const p = v => ivlText(plan(c, v).i);
  return '<div class="rate" id="rate"><button class="x" type="button" data-v="x"><span class="k">✗</span><span class="l">Λάθος</span><span class="i">'+p('x')+'</span></button>' +
    '<button class="r" type="button" data-v="r"><span class="k">↻</span><span class="l">Με δυσκολία</span><span class="i">'+p('r')+'</span></button>' +
    '<button class="k3" type="button" data-v="k"><span class="k">✓</span><span class="l">Το ήξερα</span><span class="i">'+p('k')+'</span></button></div>';
}
function flip(){
  if (!cur || flipped) return;
  flipped = true;
  document.getElementById('card').classList.add('flip');
  document.getElementById('rate').classList.add('on');
}
function rate(v){
  if (!cur || !flipped) return;
  const wasNew = isNew(cur) || cst[cur.id].n === 0;
  const p = plan(cur, v);
  cst[cur.id] = {i:p.i, e:Math.round(p.e * 100) / 100, n:p.n, l:p.l, d:today() + p.i};
  lsSet(CARD_KEY, cst);
  doneN++;
  if (v === 'x') queue.splice(Math.min(3, queue.length), 0, cur);
  else if (v === 'r' && wasNew) queue.splice(Math.min(6, queue.length), 0, cur);
  renderDeck(); next();
}
['deckC', 'deckT'].forEach(id => document.getElementById(id).addEventListener('click', e => { const b = e.target.closest('.dk'); if (b) startDeck(b.dataset.k); }));
document.getElementById('stage').addEventListener('click', e => {
  if (e.target.closest('#card')) { flip(); return; }
  const r = e.target.closest('#rate button'); if (r) rate(r.dataset.v);
});
document.addEventListener('keydown', e => {
  if (ui.tab !== 'kartes' || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target.closest && e.target.closest('input,textarea,a')) return;
  if (e.key === ' ' || e.key === 'Enter'){ if (!flipped){ e.preventDefault(); flip(); } }
  else if (e.key === '1') rate('x'); else if (e.key === '2') rate('r'); else if (e.key === '3') rate('k');
});

/* ══ ΚΑΡΤΕΛΕΣ ══════════════════════════════════════════════════════════ */
function setTab(t, noScroll){
  ui.tab = t; lsSet(UI_KEY, ui);
  document.querySelectorAll('.tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('on', p.id === 'p-' + t));
  if (history.replaceState) history.replaceState(null, '', '#' + t);
  if (t === 'kartes' && !document.getElementById('card') && !document.querySelector('#stage .done')) startDeck(ui.deck);
  if (t === 'pinakes') fillTables();
  if (!noScroll){ const tabs = document.querySelector('.tabs'); if (tabs.getBoundingClientRect().top < 0) tabs.scrollIntoView({block:'start'}); }
}
document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));

/* ══ ΕΚΚΙΝΗΣΗ ═════════════════════════════════════════════════════════ */
fillTables();
renderDeck();
const h0 = (location.hash || '').slice(1);
setTab(['pinakes','kartes'].includes(h0) ? h0 : (ui.tab === 'kartes' ? 'kartes' : 'pinakes'), true);
</script>
</body>
</html>
