<!DOCTYPE html>
<html lang="el">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0a0908">
<title>{{TITLE}}</title>
<!-- ⛔⛔ ΠΑΡΑΓΕΤΑΙ — ΜΗΝ ΤΟ ΓΡΑΨΕΙΣ ΜΕ ΤΟ ΧΕΡΙ. Πηγή: tools/gnosto/gk.tpl +
     tools/gnosto/{{ID}}.json + arxaia-gnosto-data.js → `node tools/gnosto/build.js {{ID}}`.
     Το test συγκρίνει αυτό το αρχείο με την έξοδο του build.
     ⛔ Η Instrument Serif έχει ΜΗΔΕΝ ελληνικά γλυφά (σταθ. 43, als-v504): μπαίνει
     ΜΟΝΟ σε αριθμούς. Κάθε ελληνικό — αρχαίο και νέο — είναι GFS Didot. -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&amp;family=GFS+Didot&amp;display=swap">
<style>
:root{
  --bg:#0a0908;
  --ink:#f5f2ec;
  --dim:rgba(245,242,236,.66);
  --faint:rgba(245,242,236,.36);
  --line:rgba(255,255,255,.07);
  --line2:rgba(255,255,255,.12);
  --gn:124,128,247;          /* Αρχαία · γνωστό · βιολετί — η ταυτότητα του μαθήματος */
  --hit:246,193,119;         /* η λέξη που διάλεξες */
  --warn:255,107,139;        /* ✗ — το ΜΟΝΟ κανάλι για «ξανά» */
  --ok:121,192,168;          /* ✓ */
  --mine:186,190,255;        /* «δικό μου» — ετικέτα, ποτέ κείμενο βιβλίου */
  --serif:"Instrument Serif",Georgia,serif;
  --gr:"GFS Didot","Times New Roman",Times,serif;
  --mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
  --sans:-apple-system,BlinkMacSystemFont,"Inter","Segoe UI",Roboto,sans-serif;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--ink);font-family:var(--sans);-webkit-font-smoothing:antialiased;line-height:1.55;min-height:100vh}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
button:focus-visible,.w:focus-visible,a:focus-visible,textarea:focus-visible{outline:2px solid rgba(var(--gn),.75);outline-offset:2px;border-radius:4px}
.shell{max-width:1180px;margin:0 auto;padding:22px 32px 120px}
.lbl{font-family:var(--mono);font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--faint)}
.tag-book{color:rgba(var(--gn),.95)}
.tag-mine{color:rgb(var(--mine))}

/* ── διαδρομή ─────────────────────────────────────────────── */
.top{display:flex;align-items:center;gap:14px;font-family:var(--mono);font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--faint);min-height:40px}
.top a{color:var(--dim);text-decoration:none;letter-spacing:.12em}
.top a:hover{color:var(--ink)}
.top .sl{color:rgba(245,242,236,.18)}
.top .wh{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* ── εξώφυλλο ─────────────────────────────────────────────── */
.cover{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:40px;align-items:end;padding:46px 0 34px;border-bottom:1px solid var(--line)}
.eyebrow{font-family:var(--mono);font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:var(--faint);margin-bottom:18px}
.eyebrow b{font-weight:400;color:rgba(var(--gn),.95)}
h1{font-family:var(--gr);font-style:italic;font-weight:400;font-size:82px;line-height:1;letter-spacing:-.005em}
.lead{margin-top:22px;max-width:640px;font-size:15px;line-height:1.72;color:var(--dim)}
.lead b{color:var(--ink);font-weight:500}
.face{text-align:right}
.face .n{font-family:var(--serif);font-size:128px;line-height:.82;color:rgb(var(--gn))}
.face .l{margin-top:12px;font-family:var(--mono);font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--faint);line-height:1.7}

/* ── ταινία μετρήσεων ─────────────────────────────────────── */
.band{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));margin-top:28px;border:1px solid var(--line);border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.008))}
.band>div{padding:20px 24px;min-width:0}
.band>div+div{border-left:1px solid var(--line)}
.band .bn{margin-top:8px;font-family:var(--serif);font-size:46px;line-height:1;font-variant-numeric:tabular-nums}
.band .bn small{font-size:22px;color:var(--faint)}
.band .bs{margin-top:6px;font-size:12.5px;color:var(--dim)}
.dash{display:flex;gap:4px;margin-top:12px}
.dash i{flex:1;height:4px;border-radius:2px;background:rgba(255,255,255,.08)}
.dash i.on{background:rgb(var(--ok))}
.dash i.x{background:rgb(var(--warn))}
.dash i.r{background:rgb(var(--hit))}

/* ── αποτυχία αποθήκευσης (σταθ. 10/17): λέγεται, δεν σωπαίνει ── */
.saveerr{display:none;margin-top:18px;padding:12px 16px;border:1px solid rgba(var(--warn),.45);border-radius:12px;font-size:13.5px;color:var(--ink);background:rgba(var(--warn),.06)}
.saveerr.on{display:block}

/* ── καρτέλες ─────────────────────────────────────────────── */
.tabs{display:flex;gap:30px;margin-top:44px;border-bottom:1px solid var(--line);overflow-x:auto;scrollbar-width:none}
.tabs::-webkit-scrollbar{display:none}
.tab{position:relative;padding:12px 0 14px;font-size:13.5px;color:var(--dim);white-space:nowrap}
.tab:hover{color:var(--ink)}
.tab[aria-selected="true"]{color:var(--ink)}
.tab[aria-selected="true"]::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:1px;background:var(--ink)}
.tab .c{font-family:var(--mono);font-size:10px;color:var(--faint);margin-left:6px}
.panel{display:none;padding-top:34px}
.panel.on{display:block}

/* ── εργαλεία ─────────────────────────────────────────────── */
.tools{display:flex;flex-wrap:wrap;align-items:center;gap:10px 22px}
.seg{display:inline-flex;flex-wrap:wrap;border:1px solid var(--line2);border-radius:11px;padding:3px}
.seg button{padding:7px 15px;border-radius:8px;font-size:13px;color:var(--dim)}
.seg button:hover{color:var(--ink)}
.seg button[aria-pressed="true"]{background:rgba(255,255,255,.07);color:var(--ink)}
.tools .sp{flex:1}
.chk{display:inline-flex;align-items:center;gap:8px;font-size:12.5px;color:var(--dim)}
.chk[hidden]{display:none}
.chk input{accent-color:rgb(var(--warn))}
.modehint{margin-top:14px;font-size:13.5px;color:var(--dim);max-width:700px;line-height:1.6}
.lenses{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:18px;padding-bottom:22px;border-bottom:1px solid var(--line)}
.lenses[hidden]{display:none}
.lenses .lbl{margin-right:6px}
.lens{display:inline-flex;align-items:center;gap:7px;padding:6px 12px;border:1px solid var(--line2);border-radius:999px;font-size:12.5px;color:var(--dim)}
.lens:hover{color:var(--ink);border-color:rgba(255,255,255,.22)}
.lens i{font-style:normal;font-family:var(--mono);font-size:10.5px;color:var(--faint)}
.lens[aria-pressed="true"]{color:var(--bg);background:rgb(var(--gn));border-color:rgb(var(--gn))}
.lens[aria-pressed="true"] i{color:rgba(10,9,8,.6)}
.tbtn{padding:7px 13px;border:1px solid var(--line2);border-radius:9px;font-size:12.5px;color:var(--dim)}
.tbtn:hover{color:var(--ink)}
.tbtn[aria-pressed="true"]{color:var(--bg);background:rgb(var(--gn));border-color:rgb(var(--gn))}

/* ── ΜΕΤΑΦΡΑΣΗ: κείμενο + κάρτα λέξης ─────────────────────── */
.read{display:grid;grid-template-columns:minmax(0,720px) minmax(0,1fr);gap:56px;align-items:start}
.text{margin-top:22px}
.sent{display:grid;grid-template-columns:28px minmax(0,1fr) auto;gap:16px;padding:22px 0;border-top:1px solid var(--line)}
.sent.turn{border-top-color:var(--line2);padding-top:40px}
.sent.gone{display:none}
.num{font-family:var(--mono);font-size:11px;color:var(--faint);padding-top:10px;text-align:right}
.an{font-family:var(--gr);font-size:25px;line-height:1.5;color:var(--ink)}
.md{margin-top:8px;font-family:var(--gr);font-size:18.5px;line-height:1.6;color:var(--dim)}
.w{cursor:pointer;border-radius:5px;padding:0 1px;transition:background .14s,color .14s}
.an .w{border-bottom:1px dotted rgba(var(--gn),.32)}
.w:hover{background:rgba(255,255,255,.05)}
.w.hit{background:rgba(var(--hit),.16);color:rgb(var(--hit))}
.text[data-lens]:not([data-lens=""]) .an .w{opacity:.45}
.text[data-lens="verb"] .an .w[data-tags~="verb"],
.text[data-lens="part"] .an .w[data-tags~="part"],
.text[data-lens="inf"] .an .w[data-tags~="inf"],
.text[data-lens="vadj"] .an .w[data-tags~="vadj"],
.text[data-lens="pron"] .an .w[data-tags~="pron"],
.text[data-lens="sch"] .an .w[data-tags~="sch"]{opacity:1;background:rgba(var(--gn),.16);color:rgb(var(--gn));border-bottom:2px solid rgb(var(--gn))}
.text[data-lens]:not([data-lens=""]) .an .w.hit{opacity:1}

/* Μετάφρασε */
.veil{display:none;margin-top:10px;width:100%;text-align:left;padding:12px 16px;border:1px dashed var(--line2);border-radius:11px;font-size:13.5px;color:var(--dim)}
.veil:hover{color:var(--ink);border-color:rgba(255,255,255,.24)}
.m-tr .sent:not(.shown) .md{display:none}
.m-tr .sent:not(.shown) .veil{display:block}
.side{display:flex;flex-direction:column;gap:6px;align-items:flex-end;padding-top:6px}
.grade{display:none;gap:6px}
.m-tr .sent.shown .grade{display:flex}
.g3{width:38px;height:34px;border:1px solid var(--line2);border-radius:9px;font-size:15px;color:var(--dim)}
.g3:hover{color:var(--ink)}
.g3.x[aria-pressed="true"]{background:rgba(var(--warn),.16);border-color:rgba(var(--warn),.5);color:rgb(var(--warn))}
.g3.r[aria-pressed="true"]{background:rgba(var(--hit),.14);border-color:rgba(var(--hit),.5);color:rgb(var(--hit))}
.g3.k[aria-pressed="true"]{background:rgba(var(--ok),.14);border-color:rgba(var(--ok),.5);color:rgb(var(--ok))}
.mk{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint)}
.mk.x{color:rgb(var(--warn))} .mk.r{color:rgb(var(--hit))} .mk.k{color:rgb(var(--ok))}

/* Δομή: οι αγκύλες, όπως στο χαρτί */
.m-st .md{display:none}
.br{font-family:var(--mono);font-size:20px;font-weight:300;color:var(--faint);padding:0 1px}
.br.d{color:rgb(var(--gn))}
.br sup{font-size:10px;margin-left:1px;vertical-align:top}
.cl.on .w{background:rgba(var(--gn),.14)}
.clauses{display:none;margin-top:14px;list-style:none;border-left:1px solid var(--line2)}
.m-st .clauses{display:block}
.clauses li{padding:7px 0 7px 14px;font-size:14px;color:var(--dim);cursor:pointer;line-height:1.6}
.clauses li:hover,.clauses li.on{color:var(--ink)}
.clauses li b{font-family:var(--mono);font-weight:400;font-size:11px;color:rgb(var(--gn));margin-right:6px}
.clauses li .k{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint);margin-right:6px}
.clauses li .k.d{color:rgb(var(--gn))}
.clauses li em{font-family:var(--gr);font-style:normal;font-size:16px;color:var(--ink)}

/* Απλά λόγια / Ολόκληρο */
.simple{max-width:700px;margin-top:22px}
.simple p{font-size:16px;line-height:1.78;color:var(--ink);margin-top:16px}
.simple p:first-child{margin-top:0}
.whole{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:34px;margin-top:22px}
.whole.two{grid-template-columns:repeat(2,minmax(0,1fr))}
.whole h3{font-family:var(--mono);font-weight:400;font-size:9.5px;letter-spacing:.22em;text-transform:uppercase;color:var(--faint);padding-bottom:10px;border-bottom:1px solid var(--line)}
.whole p{font-family:var(--gr);font-size:17.5px;line-height:1.68;margin-top:14px}
.whole .anc p{font-size:19px}
.whole .mod p{color:var(--dim)}
.whole .gry[hidden]{display:none}

/* η καρτέλα της λέξης */
.aside{position:sticky;top:20px;margin-top:22px}
.wc{border:1px solid var(--line);border-radius:18px;padding:26px 26px 22px;background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.008))}
.wc.empty{color:var(--dim);font-size:14px;line-height:1.7}
.wc.empty .big{font-family:var(--gr);font-style:italic;font-size:28px;color:var(--ink);line-height:1.2;margin-bottom:12px}
.wc-an{font-family:var(--gr);font-size:36px;line-height:1.15;color:rgb(var(--hit))}
.wc-md{margin-top:8px;font-family:var(--gr);font-size:19px;color:var(--dim)}
.wc-sec{margin-top:18px;padding-top:14px;border-top:1px solid var(--line)}
.wc-sec p{margin-top:8px;font-size:14px;line-height:1.66;color:var(--ink)}
.wc dl{display:grid;grid-template-columns:auto 1fr;gap:8px 14px;margin-top:10px;font-size:14px}
.wc dt{font-family:var(--mono);font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--faint);padding-top:4px}
.wc dd{color:var(--ink);line-height:1.55}
.wc dd.lem{font-family:var(--gr);font-size:18px;color:rgb(var(--gn))}
.chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}
.chip{padding:6px 12px;border:1px solid var(--line2);border-radius:999px;font-size:12.5px;color:var(--dim);text-align:left}
.chip:hover{color:var(--ink);border-color:rgba(255,255,255,.24)}
.chip .g{font-family:var(--gr);font-size:15px;color:var(--ink)}
.info{display:none;margin-top:14px}
.info.show{display:block}
.info .wc{padding:20px}
.info .wc-an{font-size:28px}

/* ── ενότητες (σχόλια · ερμηνευτικά · λεξιλογικά) ───────── */
.sec{margin-top:58px}
.sec:first-child{margin-top:0}
.sh{display:flex;align-items:baseline;gap:16px;flex-wrap:wrap;padding-bottom:14px;border-bottom:1px solid var(--line)}
.sh h2{font-family:var(--gr);font-style:italic;font-weight:400;font-size:34px;line-height:1.1}
.sh .sp{flex:1}
.sh .sub{flex-basis:100%;width:100%;font-size:13.5px;color:var(--dim);max-width:720px;line-height:1.6}
.intro{max-width:720px;margin-top:18px;font-family:var(--gr);font-size:18px;line-height:1.7;color:var(--ink)}

/* Σχόλια */
.sx{list-style:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-top:22px}
.sxc{border:1px solid var(--line);border-radius:18px;padding:22px 24px 20px;background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.008));min-width:0;display:flex;flex-direction:column;transition:border-color .5s,background .5s}
.sxc.flash{border-color:rgba(var(--hit),.7);background:rgba(var(--hit),.07)}
.sxc h4{margin-top:8px;font-family:var(--gr);font-weight:400;font-size:24px;line-height:1.25}
.sxc .body{margin-top:10px;font-family:var(--gr);font-size:17px;line-height:1.66;color:var(--ink)}
.sxc .cover-b{display:none;margin-top:12px;width:100%;text-align:left;padding:14px 16px;border:1px dashed var(--line2);border-radius:11px;font-size:13.5px;color:var(--dim)}
.sxc .cover-b:hover{color:var(--ink)}
.m-hide .sxc:not(.shown) .body{display:none}
.m-hide .sxc:not(.shown) .cover-b{display:block}
.sxc .foot2{margin-top:auto;padding-top:16px;display:flex;flex-wrap:wrap;align-items:center;gap:8px}
.sxc .sp{flex:1}
.sxg{display:none;gap:6px}
.m-hide .sxc.shown .sxg{display:flex}

/* Ερμηνευτικά */
.grp{margin-top:46px}
.grp:first-child{margin-top:26px}
.grp h3{font-family:var(--gr);font-style:italic;font-weight:400;font-size:26px;padding-bottom:12px;border-bottom:1px solid var(--line)}
.qa{padding:26px 0;border-bottom:1px solid var(--line);display:grid;grid-template-columns:52px minmax(0,1fr);gap:18px}
.qa .qn{font-family:var(--gr);font-size:28px;line-height:1;color:rgb(var(--gn));white-space:nowrap}
.qa .q{font-family:var(--gr);font-size:19px;line-height:1.6;color:var(--ink);max-width:760px}
.qa .q .lbl{display:block;margin-bottom:6px}
.qa textarea{display:block;width:100%;max-width:720px;min-height:120px;margin-top:16px;padding:14px 16px;background:rgba(255,255,255,.025);border:1px solid var(--line2);border-radius:12px;color:var(--ink);font:15px/1.65 var(--sans);resize:vertical}
.qa textarea::placeholder{color:rgba(245,242,236,.42)}
.qa .row{display:flex;flex-wrap:wrap;align-items:center;gap:12px;margin-top:12px}
.qa .saved{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--faint)}
.model{display:none;margin-top:18px;max-width:780px;border:1px solid rgba(var(--mine),.22);border-radius:16px;padding:20px 22px;background:rgba(var(--mine),.035)}
.qa.open .model{display:block}
.model .mh{display:flex;align-items:baseline;gap:10px;margin-bottom:6px}
.model p{margin-top:10px;font-size:15px;line-height:1.72;color:var(--ink)}
.model .th{font-size:15.5px}
.model .th b{font-weight:500}
.model h5{margin-top:18px;font-family:var(--mono);font-weight:400;font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;color:rgb(var(--mine))}
.model .qt{margin-top:12px;padding-left:14px;border-left:1px solid var(--line2)}
.model .qt .g{display:block;font-family:var(--gr);font-size:18.5px;line-height:1.5;color:var(--ink)}
.model .qt .g.mod{font-size:17px;color:var(--dim)}
.model .qt .who{display:block;margin-top:2px}
.model .qt .x{display:block;margin-top:4px;font-size:14.5px;line-height:1.65;color:var(--dim)}
.model .so{margin-top:16px;padding-top:14px;border-top:1px solid rgba(var(--mine),.18)}
.model .so .lbl{color:rgb(var(--mine))}
.par{margin-top:52px}
.par .ph{font-family:var(--gr);font-style:italic;font-size:24px;line-height:1.3}
.par .pi{margin-top:10px;max-width:720px;font-size:14px;line-height:1.7;color:var(--dim)}
.par .pt{margin-top:16px;max-width:760px;font-family:var(--gr);font-size:17.5px;line-height:1.72;color:var(--ink)}
.par .pc{margin-top:8px}

/* Λεξιλογικά */
.lx{width:100%;border-collapse:collapse;margin-top:16px;font-size:14.5px}
.lx th{text-align:left;font-family:var(--mono);font-weight:400;font-size:9.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--faint);padding:14px 12px 10px;border-bottom:1px solid var(--line)}
.lx td{padding:14px 12px;border-bottom:1px solid var(--line);vertical-align:top;line-height:1.5}
.lx td.w0 button{font-family:var(--gr);font-size:22px;color:var(--ink);border-bottom:1px dotted rgba(var(--gn),.45)}
.lx td.w0 button:hover{color:rgb(var(--hit))}
.lx td.rt{font-family:var(--gr);font-size:17px;color:rgb(var(--gn));white-space:nowrap}
.lx td.rel{font-family:var(--gr);font-size:17px;color:var(--ink)}
.lx td.rel span+span::before{content:" · ";color:var(--faint)}
.lx.hidecol td.rel{cursor:pointer}
.lx.hidecol td.rel .in{filter:blur(7px);opacity:.5;transition:filter .2s,opacity .2s}
.lx.hidecol td.rel.rv .in{filter:none;opacity:1}

.foot{margin-top:80px;padding-top:22px;border-top:1px solid var(--line);font-size:13.5px;line-height:1.85;color:var(--dim);max-width:860px}
.foot b{color:var(--ink);font-weight:500}

/* ── πλάτη (ΜΟΝΟ max-width — σταθ. 51) ───────────────────── */
@media (max-width:1040px){
  .read{grid-template-columns:minmax(0,1fr)}
  .aside{display:none}
  .sx{grid-template-columns:minmax(0,1fr)}
  .whole{grid-template-columns:minmax(0,1fr)}
  .whole.two{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:760px){
  .shell{padding:16px 16px 90px}
  .cover{grid-template-columns:minmax(0,1fr);gap:22px;padding-top:30px}
  .face{text-align:left;display:flex;align-items:flex-end;gap:16px}
  .face .n{font-size:84px}
  h1{font-size:52px}
  .band{grid-template-columns:minmax(0,1fr)}
  .band>div+div{border-left:0;border-top:1px solid var(--line)}
  .qa{grid-template-columns:minmax(0,1fr);gap:8px}
  .lx .hm{display:none}
}
@media (max-width:560px){
  .top .wm{display:none}
  .tabs{gap:22px}
  .tab .c{display:none}
  h1{font-size:42px}
  .an{font-size:21.5px}
  .md{font-size:17px}
  .sent{grid-template-columns:18px minmax(0,1fr);gap:10px}
  .side{grid-column:2;flex-direction:row;align-items:center;justify-content:flex-start;padding-top:2px}
  .sh h2{font-size:28px}
  .lx td.rt{white-space:normal}
}
@media (prefers-reduced-motion:reduce){ html{scroll-behavior:auto} .w,.sxc{transition:none} }
</style>
</head>
<body>
<div class="shell">
  <div class="top">
    <a href="arxaia.html#gn">&#8592; Αρχαία · γνωστό</a>
    <span class="sl">/</span>
    <span class="wh"><span class="wm">MÉTRON · </span>{{CRUMB}}</span>
  </div>

  <header class="cover">
    <div>
      <div class="eyebrow"><b>{{SECTION}}</b> · {{KICKER}}</div>
      <h1>{{H1}}</h1>
      <p class="lead">{{LEAD}}</p>
    </div>
    <div class="face">
      <div class="n">{{FACE}}</div>
      <div class="l">{{FACE_LABEL}}</div>
    </div>
  </header>

  <section class="band" aria-label="Μετρήσεις">
    <div>
      <div class="lbl">Περίοδοι που μεταφράζεις μόνος</div>
      <div class="bn"><span id="bTr">0</span><small>/<span id="bTrAll">0</span></small></div>
      <div class="dash" id="bTrDash"></div>
    </div>
    <div>
      <div class="lbl">Σχόλια που ξέρεις</div>
      <div class="bn"><span id="bSx">0</span><small>/<span id="bSxAll">0</span></small></div>
      <div class="dash" id="bSxDash"></div>
    </div>
    <div>
      <div class="lbl">Ερμηνευτικά που έγραψες</div>
      <div class="bn"><span id="bAns">0</span><small>/<span id="bAnsAll">0</span></small></div>
      <div class="bs">δική σου απάντηση πριν από το υπόδειγμα</div>
    </div>
  </section>
  <div class="saveerr" id="saveErr" role="alert"></div>

  <nav class="tabs" role="tablist" aria-label="Τα μέρη της ενότητας">
    <button class="tab" role="tab" data-tab="metafrasi" aria-selected="true">Μετάφραση<span class="c" id="tcM"></span></button>
    <button class="tab" role="tab" data-tab="sxolia" aria-selected="false">Σχόλια<span class="c" id="tcS"></span></button>
    <button class="tab" role="tab" data-tab="ermineia" aria-selected="false">Ερμηνευτικά<span class="c" id="tcE"></span></button>
    <button class="tab" role="tab" data-tab="lexika" aria-selected="false">Λεξιλογικά<span class="c" id="tcL"></span></button>
  </nav>

  <!-- ══ ΜΕΤΑΦΡΑΣΗ ═══════════════════════════════════════════ -->
  <section class="panel on" id="p-metafrasi" role="tabpanel">
    <div class="tools">
      <div class="seg" role="group" aria-label="Τρόπος">
        <button type="button" data-mode="si" aria-pressed="false">Απλά λόγια</button>
        <button type="button" data-mode="rd" aria-pressed="true">Διάβασε</button>
        <button type="button" data-mode="tr" aria-pressed="false">Μετάφρασε</button>
        <button type="button" data-mode="st" aria-pressed="false">Δομή</button>
        <button type="button" data-mode="wh" aria-pressed="false">Ολόκληρο</button>
      </div>
      <span class="sp"></span>
      <label class="chk" id="onlyRed" hidden><input type="checkbox" id="onlyRedI"> Μόνο τα κόκκινα (✗ και ↻)</label>
      <label class="chk" id="grypT" hidden><input type="checkbox" id="grypI"> Και η μετάφραση Ι. Γρυπάρη</label>
      <button class="tbtn" type="button" id="bReset" title="Μηδενίζει τα ✗ / ↻ / ✓ της μετάφρασης">μηδένισε</button>
    </div>
    <p class="modehint" id="modeHint"></p>
    <div class="lenses" id="lenses"><span class="lbl">Φακοί</span></div>
    <div class="read" id="readGrid">
      <div class="text" id="content" data-lens=""></div>
      <aside class="aside" id="aside" aria-live="polite"></aside>
    </div>
    <div class="simple" id="simple" hidden></div>
    <div id="wholeBox" hidden></div>
  </section>

  <!-- ══ ΣΧΟΛΙΑ ══════════════════════════════════════════════ -->
  <section class="panel" id="p-sxolia" role="tabpanel">
    <div class="sec">
      <div class="sh"><h2>Η εισαγωγή του βιβλίου</h2><span class="sp"></span><span class="lbl tag-book">Φάκελος Υλικού · αυτολεξεί</span></div>
      <p class="intro" id="introTxt"></p>
    </div>
    <div class="sec">
      <div class="sh">
        <h2>Τα σχόλια</h2><span class="sp"></span>
        <div class="seg" role="group" aria-label="Τρόπος σχολίων">
          <button type="button" data-sxm="read" aria-pressed="true">Διάβασε</button>
          <button type="button" data-sxm="hide" aria-pressed="false">Σκέπασε</button>
        </div>
        <p class="sub" id="sxHint"></p>
      </div>
      <ul class="sx" id="sxList"></ul>
    </div>
  </section>

  <!-- ══ ΕΡΜΗΝΕΥΤΙΚΑ ═════════════════════════════════════════ -->
  <section class="panel" id="p-ermineia" role="tabpanel">
    <div class="sh">
      <h2>Οι ερωτήσεις του βιβλίου</h2>
      <p class="sub">Οι ερωτήσεις είναι οι «Ενδεικτικές Δραστηριότητες» του Φακέλου, αυτολεξεί. Γράψε πρώτα τη δική σου απάντηση: θέση → παράθεμα από το κείμενο → «και γι’ αυτό…». Μετά άνοιξε το υπόδειγμα. Κάθε παράθεμα του υποδείγματος υπάρχει αυτολεξεί στο αρχαίο — το ελέγχει το test.</p>
    </div>
    <div id="actBox"></div>
    <div class="sec">
      <div class="sh"><h2>Παράλληλα κείμενα</h2><span class="sp"></span><span class="lbl tag-book">Φάκελος Υλικού · αυτολεξεί</span></div>
      <div id="parBox"></div>
    </div>
  </section>

  <!-- ══ ΛΕΞΙΛΟΓΙΚΑ ══════════════════════════════════════════ -->
  <section class="panel" id="p-lexika" role="tabpanel">
    <div class="sh">
      <h2>Λέξεις και ομόρριζα</h2><span class="sp"></span>
      <button class="tbtn" type="button" id="lxHide" aria-pressed="false">Κρύψε τα ομόρριζα</button>
      <p class="sub">Λέξεις του κειμένου με νεοελληνικές λέξεις της ίδιας ρίζας. <span class="tag-mine">Τα ομόρριζα είναι δικά μου, όχι του βιβλίου</span> — με «Κρύψε» τα λες πρώτα εσύ και πατάς για να ελέγξεις. Πάτα τη λέξη για να τη δεις μέσα στο κείμενο.</p>
    </div>
    <table class="lx" id="lxTbl">
      <thead><tr><th>Λέξη</th><th class="hm">Από</th><th>Ομόρριζα στα νέα ελληνικά</th></tr></thead>
      <tbody id="lxBody"></tbody>
    </table>
  </section>

  <div class="foot">
    Οι ✗/↻/✓, τα σχόλια που ξέρεις και οι απαντήσεις σου αποθηκεύονται <b>σε αυτή τη συσκευή</b>.<br>
    {{FOOT}}
  </div>
</div>

<script>
/* ══════════════════════════════════════════════════════════════════════
   ΤΟ ΟΡΓΑΝΟ ΤΗΣ ΕΝΟΤΗΤΑΣ — ΤΑ ΔΕΔΟΜΕΝΑ (παραγόμενα, βλ. κεφαλίδα).
   segs/pairs/simple/anc/skout = ΑΥΤΟΥΣΙΑ από το arxaia-gnosto-data.js.
   intro/gryp/scholia/acts/pars = ΑΥΤΟΛΕΞΕΙ από τον Φάκελο Υλικού.
   l/f/s, clauses, model, lexika = ΔΙΚΑ ΜΟΥ, με ετικέτα στην οθόνη.
   ══════════════════════════════════════════════════════════════════════ */
const D = {{DATA}};

/* ══ Η ΜΗΧΑΝΗ ═══════════════════════════════════════════════════════════ */
const ID = D.id;
const TR_KEY = ID + '_tr_v1';    /* ✗ / ↻ / ✓ ανά περίοδο */
const SX_KEY = ID + '_sx_v1';    /* σχόλια: k (ξέρω) / x (ξανά) */
const ANS_KEY = ID + '_ans_v1';  /* οι απαντήσεις του στα ερμηνευτικά */
const UI_KEY = ID + '_ui_v1';    /* καρτέλα + τρόπος: μόνο ευκολία */

/* ⚠️ σταθ. 10/17: ένα save που δεν κρατήθηκε ΤΟ ΛΕΕΙ, και το λέει όσο ισχύει. */
const errBox = document.getElementById('saveErr');
function lsGet(k, d){ try{ const v = localStorage.getItem(k); return v == null ? d : (JSON.parse(v) || d); }catch(e){ return d; } }
function lsSet(k, v){
  try{ localStorage.setItem(k, JSON.stringify(v)); errBox.classList.remove('on'); return true; }
  catch(e){ errBox.textContent = 'Δεν αποθηκεύτηκε: η συσκευή αρνήθηκε την εγγραφή (' + (e && e.name || 'σφάλμα') + '). Ό,τι έκανες από τώρα θα χαθεί στο κλείσιμο.'; errBox.classList.add('on'); return false; }
}
function obj(v){ return (v && typeof v === 'object' && !Array.isArray(v)) ? v : {}; }
function esc(s){ return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
const PUNCT = /^[\s,.;:·’'—–()«»!?]+$/;

let trm = obj(lsGet(TR_KEY, {}));
let sxm = obj(lsGet(SX_KEY, {}));
let ans = obj(lsGet(ANS_KEY, {}));
const ui = Object.assign({tab:'metafrasi', mode:'rd', gryp:false, sx:'read'}, obj(lsGet(UI_KEY, {})));

/* κλειδί → περίοδος (για άλματα από σχόλια/λεξιλογικά) */
const KEY_SEG = {};
D.segs.forEach(s => s.a.forEach(c => { if (c[1] && !(c[1] in KEY_SEG)) KEY_SEG[c[1]] = s.n; }));

/* ── καρτέλες ── */
const TABS = ['metafrasi','sxolia','ermineia','lexika'];
function setTab(t){
  if (TABS.indexOf(t) < 0) t = 'metafrasi';
  ui.tab = t; lsSet(UI_KEY, ui);
  document.querySelectorAll('.tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === t)));
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('on', p.id === 'p-' + t));
}
document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => { setTab(b.dataset.tab); history.replaceState(null, '', '#' + b.dataset.tab); }));

/* ══ ΜΕΤΑΦΡΑΣΗ ══════════════════════════════════════════════════════════ */
const box = document.getElementById('content');
const aside = document.getElementById('aside');
let sel = null;   /* {n, k} */

function chunkSpan(side, n, c, i, noTail){
  const t = c[0], k = c[1];
  const core = t.replace(/\s+$/, ''), tail = noTail ? '' : t.slice(core.length);
  if (!k || PUNCT.test(core)) return esc(noTail ? core : t);
  const p = D.pairs[k] || {};
  const tags = side === 'an' ? ' data-tags="' + (p.t || []).join(' ') + '"' : '';
  return '<span class="w" tabindex="0" role="button" data-side="' + side + '" data-n="' + n + '" data-k="' + k + '" data-i="' + i + '"' + tags + '>' + esc(core) + '</span>' + esc(tail);
}
function clauseOf(s, i){ let c = null; s.runs.forEach(r => { if (r[0] <= i) c = r[1]; }); return c; }
function anHTML(s, mode){
  if (mode !== 'st') return s.a.map((c, i) => chunkSpan('an', s.n, c, i)).join('');
  /* Δομή: κάθε συνεχόμενο κομμάτι μιας πρότασης παίρνει τις αγκύλες του·
     η στίξη στο όριο μένει ΕΞΩ από τις αγκύλες. */
  let out = '', open = null, pend = '';
  for (let i = 0; i < s.a.length; i++){
    const c = s.a[i], q = clauseOf(s, i);
    const isP = PUNCT.test(c[0].replace(/\s+$/, '') || ' ');
    if (isP){
      let nx = null;
      for (let j = i + 1; j < s.a.length; j++){ if (!PUNCT.test(s.a[j][0].replace(/\s+$/, '') || ' ')){ nx = clauseOf(s, j); break; } }
      if (open !== null && nx !== open){ out += closeBr(open) + '</span>'; open = null; }
      out += pend + esc(c[0]); pend = '';
      continue;
    }
    if (q !== open){
      if (open !== null) out += closeBr(open) + '</span>';
      out += pend; pend = '';
      open = q;
      out += '<span class="cl" data-q="' + q + '">' + openBr(q);
    }
    out += pend + chunkSpan('an', s.n, c, i, true);
    pend = esc(c[0].slice(c[0].replace(/\s+$/, '').length));
  }
  if (open !== null) out += closeBr(open) + '</span>';
  return out + pend;
}
function openBr(q){ const c = D.clauses[q]; return '<span class="br' + (c.d ? ' d' : '') + '">' + (c.d ? '(' : '[') + '<sup>' + q + '</sup></span>'; }
function closeBr(q){ const c = D.clauses[q]; return '<span class="br' + (c.d ? ' d' : '') + '">' + (c.d ? ')' : ']') + '</span>'; }
function mdHTML(s){ return s.m.map((c, i) => chunkSpan('md', s.n, c, i)).join(''); }
function clausesHTML(s){
  const ids = [];
  s.runs.forEach(r => { if (ids.indexOf(r[1]) < 0) ids.push(r[1]); });
  return ids.map(q => {
    const c = D.clauses[q];
    const words = s.a.filter((x, i) => clauseOf(s, i) === q).map(x => x[0]).join('').trim();
    return '<li data-q="' + q + '"><b>' + q + '</b><span class="k' + (c.d ? ' d' : '') + '">' + (c.d ? '( ' : '[ ') + esc(c.k) + (c.d ? ' )' : ' ]') + '</span><em>' + esc(words) + '</em><br>' + esc(c.s) + '</li>';
  }).join('');
}
function markHTML(n){ const t = trm[n]; return t ? '<span class="mk ' + t + '">' + ({x:'✗ ξανά', r:'↻ με δυσκολία', k:'✓ μόνος'})[t] + '</span>' : ''; }

function build(){
  let h = '', lastP = -1;
  D.segs.forEach(s => {
    const turn = lastP >= 0 && s.p !== lastP;
    lastP = s.p;
    h += '<div class="sent' + (turn ? ' turn' : '') + '" data-n="' + s.n + '">' +
      '<div class="num">' + s.n + '</div>' +
      '<div class="body"><p class="an">' + anHTML(s, ui.mode) + '</p>' +
      '<button class="veil" type="button">Πες τη μετάφραση δυνατά και πάτα για να την ελέγξεις</button>' +
      '<p class="md">' + mdHTML(s) + '</p>' +
      '<ul class="clauses">' + clausesHTML(s) + '</ul>' +
      '<div class="info"></div></div>' +
      '<div class="side"><span class="mkw">' + markHTML(s.n) + '</span>' +
        '<div class="grade" role="group" aria-label="Πώς πήγε">' +
          '<button class="g3 x" type="button" data-v="x" title="Λάθος" aria-pressed="' + (trm[s.n] === 'x') + '">✗</button>' +
          '<button class="g3 r" type="button" data-v="r" title="Με δυσκολία" aria-pressed="' + (trm[s.n] === 'r') + '">↻</button>' +
          '<button class="g3 k" type="button" data-v="k" title="Μόνος μου" aria-pressed="' + (trm[s.n] === 'k') + '">✓</button>' +
        '</div></div></div>';
  });
  box.innerHTML = h;
  applyFilter();
}
function rows(){ return Array.from(box.querySelectorAll('.sent')); }
function segOf(n){ return D.segs.find(s => s.n === +n); }

/* ── η καρτέλα της λέξης ── */
function wordCard(k){
  const p = D.pairs[k];
  let h = '<div class="wc"><div class="wc-an">' + esc(p.a) + '</div><div class="wc-md">' + esc(p.m) + '</div>';
  h += '<div class="wc-sec"><span class="lbl tag-mine">Γραμματική · δικά μου</span><dl>' +
    '<dt>Λήμμα</dt><dd class="lem">' + esc(p.l) + '</dd>' +
    '<dt>Τύπος</dt><dd>' + esc(p.f) + '</dd>' +
    '<dt>Συντακτικό</dt><dd>' + esc(p.s) + '</dd></dl></div>';
  if (p.w) h += '<div class="wc-sec"><span class="lbl tag-mine">Γιατί · δικά μου</span><p>' + esc(plainW(p.w)) + '</p></div>';
  if (p.sch && p.sch.length){
    h += '<div class="wc-sec"><span class="lbl tag-book">Σχόλιο του βιβλίου</span><div class="chips">' +
      p.sch.map(i => '<button class="chip" type="button" data-sch="' + i + '"><span class="g">' + esc(D.scholia[i].lemma) + '</span> ↗</button>').join('') + '</div></div>';
  }
  return h + '</div>';
}
/* Τα «⭐»/«⚠️» της ύλης του Γνωστού είναι σημάδια σημασίας στον πίνακα· εδώ
   η γλώσσα δεν έχει emoji (§⑧). Το ⚠️ γίνεται λέξη, για να μη χαθεί. */
function plainW(t){ return String(t).replace(/⭐+\s*/g, '').replace(/⚠️\s*/g, 'Προσοχή: ').replace(/\s{2,}/g, ' ').trim(); }
function emptyCard(){
  return '<div class="wc empty"><div class="big">Πάτα μια λέξη.</div>Ανάβει το ζευγάρι της στη μετάφραση, και εδώ βλέπεις λήμμα, τύπο, συντακτικό, το «γιατί» της απόδοσης και αν έχει σχόλιο στο βιβλίο.<br><br>Οι <b>Φακοί</b> ανάβουν μια κατηγορία μέσα στο κείμενο — π.χ. όλες τις μετοχές.</div>';
}
const narrow = window.matchMedia('(max-width:1040px)');
function clearSel(){
  box.querySelectorAll('.w.hit').forEach(x => x.classList.remove('hit'));
  box.querySelectorAll('.info.show').forEach(x => { x.classList.remove('show'); x.innerHTML = ''; });
  box.querySelectorAll('.cl.on, .clauses li.on').forEach(x => x.classList.remove('on'));
  sel = null;
  aside.innerHTML = emptyCard();
}
function select(n, k, keep){
  const was = sel && sel.n === +n && sel.k === k;
  clearSel();
  if (was && !keep) return;
  if (!D.pairs[k]) return;
  sel = {n:+n, k};
  const row = box.querySelector('.sent[data-n="' + n + '"]');
  if (!row) return;
  row.querySelectorAll('.w[data-k="' + k + '"]').forEach(x => x.classList.add('hit'));
  const html = wordCard(k);
  if (narrow.matches){ const info = row.querySelector('.info'); info.innerHTML = html; info.classList.add('show'); }
  else aside.innerHTML = html;
}

box.addEventListener('click', e => {
  const chip = e.target.closest('[data-sch]');
  if (chip){ goScholio(+chip.dataset.sch); return; }
  const row = e.target.closest('.sent'); if (!row) return;
  const n = +row.dataset.n;
  if (e.target.closest('.veil')){ row.classList.add('shown'); return; }
  const g3 = e.target.closest('.g3');
  if (g3){
    const v = g3.dataset.v;
    if (trm[n] === v) delete trm[n]; else trm[n] = v;
    lsSet(TR_KEY, trm);
    row.querySelectorAll('.g3').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === trm[n])));
    row.querySelector('.mkw').innerHTML = markHTML(n);
    tally(); applyFilter(); return;
  }
  const li = e.target.closest('.clauses li');
  if (li){
    const q = li.dataset.q, on = li.classList.contains('on');
    clearSel();
    if (!on){ li.classList.add('on'); row.querySelectorAll('.cl[data-q="' + q + '"]').forEach(x => x.classList.add('on')); }
    return;
  }
  const w = e.target.closest('.w'); if (!w) return;
  select(n, w.dataset.k);
});
box.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('w')){ e.preventDefault(); e.target.click(); }
});
aside.addEventListener('click', e => { const c = e.target.closest('[data-sch]'); if (c) goScholio(+c.dataset.sch); });

/* ── τρόποι ── */
const HINT = {
  si:'Τι λέει η ενότητα, πριν από κάθε λέξη. Δεν αποστηθίζεις ό,τι δεν κατάλαβες. (Δικά μου λόγια — όχι του βιβλίου.)',
  rd:'Πάτα μια λέξη του αρχαίου ή της μετάφρασης: ανάβει το ζευγάρι της και βλέπεις λήμμα, τύπο, συντακτικό. Η μετάφραση είναι του Ν. Μ. Σκουτερόπουλου — αυτή μαθαίνεις.',
  tr:'Η μετάφραση κρύβεται ανά περίοδο. Πες τη δυνατά, άνοιξέ τη και κρίνε: ✗ λάθος · ↻ με δυσκολία · ✓ μόνος μου. Με το «Μόνο τα κόκκινα» μένουν μόνο οι ✗ και ↻.',
  st:'Οι αγκύλες, όπως στο χαρτί: [ ] κύρια, ( ) δευτερεύουσα, με τον αριθμό της πρότασης. Κάτω από κάθε περίοδο: τι πρόταση είναι και πώς εκφέρεται. Πάτα μια γραμμή για να την ανάψεις. (Η ανάλυση είναι δική μου.)',
  wh:'Ολόκληρο, χωρίς κοψίματα: το αρχαίο δίπλα στη μετάφραση που μαθαίνεις. Άναψε και τον Γρυπάρη — τη δεύτερη μετάφραση του Φακέλου, που τη ζητάει η δραστηριότητα Γ.1.'
};
const simpleBox = document.getElementById('simple');
const wholeBox = document.getElementById('wholeBox');
const readGrid = document.getElementById('readGrid');
const lensBox = document.getElementById('lenses');
function setMode(m){
  if (!HINT[m]) m = 'rd';
  ui.mode = m; lsSet(UI_KEY, ui);
  document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
  const inText = m === 'rd' || m === 'tr' || m === 'st';
  readGrid.hidden = !inText;
  lensBox.hidden = !inText;
  simpleBox.hidden = m !== 'si';
  wholeBox.hidden = m !== 'wh';
  box.classList.toggle('m-tr', m === 'tr');
  box.classList.toggle('m-st', m === 'st');
  document.getElementById('onlyRed').hidden = m !== 'tr';
  document.getElementById('grypT').hidden = m !== 'wh';
  document.getElementById('bReset').hidden = m !== 'tr';
  document.getElementById('modeHint').textContent = HINT[m];
  rows().forEach(r => { r.querySelector('.an').innerHTML = anHTML(segOf(r.dataset.n), m); r.classList.remove('shown'); });
  clearSel(); applyFilter();
}
document.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
const onlyRedI = document.getElementById('onlyRedI');
onlyRedI.addEventListener('change', applyFilter);
function applyFilter(){
  const on = ui.mode === 'tr' && onlyRedI.checked;
  rows().forEach(r => { const t = trm[r.dataset.n]; r.classList.toggle('gone', on && !(t === 'x' || t === 'r')); });
}
/* Δύο πατήματα, χωρίς διάλογο: το πρώτο ρωτάει πάνω στο ίδιο το κουμπί. */
const bReset = document.getElementById('bReset');
let resetArm = 0;
bReset.addEventListener('click', () => {
  if (Date.now() - resetArm > 3000){ resetArm = Date.now(); bReset.textContent = 'σίγουρα; πάτα ξανά'; setTimeout(() => { bReset.textContent = 'μηδένισε'; }, 3000); return; }
  resetArm = 0; bReset.textContent = 'μηδένισε';
  trm = {}; lsSet(TR_KEY, trm); build(); setMode(ui.mode); tally();
});

/* ── φακοί ── */
D.lenses.forEach(L => {
  const k = L[0], n = Object.keys(D.pairs).filter(x => (D.pairs[x].t || []).indexOf(k) >= 0).length;
  if (!n) return;
  const b = document.createElement('button');
  b.className = 'lens'; b.type = 'button'; b.dataset.lens = k; b.setAttribute('aria-pressed', 'false');
  b.innerHTML = esc(L[1]) + ' <i>' + n + '</i>';
  b.addEventListener('click', () => {
    const on = box.dataset.lens === k;
    box.dataset.lens = on ? '' : k;
    lensBox.querySelectorAll('.lens').forEach(x => x.setAttribute('aria-pressed', String(!on && x.dataset.lens === k)));
  });
  lensBox.appendChild(b);
});

/* ── απλά λόγια · ολόκληρο ── */
simpleBox.innerHTML = D.simple.map(p => '<p>' + esc(p) + '</p>').join('');
function buildWhole(){
  const g = !!ui.gryp;
  wholeBox.innerHTML = '<div class="whole' + (g ? '' : ' two') + '">' +
    '<div class="anc"><h3>Το αρχαίο · ' + esc(D.cite) + '</h3>' + D.anc.map(p => '<p>' + esc(p) + '</p>').join('') + '</div>' +
    '<div class="mod"><h3>Μαθαίνεις · ' + esc(D.translator) + '</h3>' + D.skout.map(p => '<p>' + esc(p) + '</p>').join('') + '</div>' +
    '<div class="mod gry"' + (g ? '' : ' hidden') + '><h3>Δεύτερη · Ι. Γρυπάρης</h3>' + D.gryp.map(p => '<p>' + esc(p) + '</p>').join('') + '</div>' +
  '</div>';
}
const grypI = document.getElementById('grypI');
grypI.checked = !!ui.gryp;
grypI.addEventListener('change', () => { ui.gryp = grypI.checked; lsSet(UI_KEY, ui); buildWhole(); });

/* ══ ΣΧΟΛΙΑ ═════════════════════════════════════════════════════════════ */
document.getElementById('introTxt').textContent = D.intro;
const sxList = document.getElementById('sxList');
function sxMark(i){ const t = sxm[i]; return t ? '<span class="mk ' + t + '">' + (t === 'k' ? '✓ το ξέρω' : '✗ ξανά') + '</span>' : ''; }
function buildScholia(){
  sxList.innerHTML = D.scholia.map((s, i) =>
    '<li class="sxc" data-i="' + i + '">' +
      '<span class="lbl tag-book">Σχόλιο ' + (i + 1) + ' · του βιβλίου</span>' +
      '<h4>' + esc(s.lemma) + '</h4>' +
      '<button class="cover-b" type="button">Γράψε ή πες τι λέει το σχόλιο — μετά πάτα για να ελέγξεις</button>' +
      '<p class="body">' + esc(s.body) + '</p>' +
      '<div class="foot2"><div class="chips">' + s.keys.map(k => '<button class="chip" type="button" data-go="' + k + '"><span class="g">' + esc(D.pairs[k].a) + '</span> · περίοδος ' + KEY_SEG[k] + ' ↗</button>').join('') + '</div>' +
        '<span class="sp"></span><span class="sxmk">' + sxMark(i) + '</span>' +
        '<div class="sxg" role="group" aria-label="Το ήξερες;">' +
          '<button class="g3 x" type="button" data-v="x" aria-pressed="' + (sxm[i] === 'x') + '" title="Ξανά">✗</button>' +
          '<button class="g3 k" type="button" data-v="k" aria-pressed="' + (sxm[i] === 'k') + '" title="Το ήξερα">✓</button>' +
        '</div></div>' +
    '</li>').join('');
}
const SXHINT = {
  read:'Τα σχόλια του Φακέλου Υλικού για την ενότητα, αυτολεξεί. Στο διαγώνισμα λέγονται απέξω. Πάτα τη λέξη κάτω από κάθε σχόλιο για να τη δεις μέσα στο κείμενο.',
  hide:'Η μέθοδός σου: διαβάζεις → σκεπάζεις → γράφεις → ελέγχεις. Το σχόλιο κρύβεται· πες το, άνοιξέ το και κρίνε: ✓ το ήξερα · ✗ ξανά.'
};
function setSx(m){
  if (!SXHINT[m]) m = 'read';
  ui.sx = m; lsSet(UI_KEY, ui);
  document.querySelectorAll('[data-sxm]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sxm === m)));
  sxList.classList.toggle('m-hide', m === 'hide');
  sxList.querySelectorAll('.sxc').forEach(c => c.classList.remove('shown'));
  document.getElementById('sxHint').textContent = SXHINT[m];
}
document.querySelectorAll('[data-sxm]').forEach(b => b.addEventListener('click', () => setSx(b.dataset.sxm)));
sxList.addEventListener('click', e => {
  const go = e.target.closest('[data-go]');
  if (go){ goWord(go.dataset.go); return; }
  const c = e.target.closest('.sxc'); if (!c) return;
  const i = +c.dataset.i;
  if (e.target.closest('.cover-b')){ c.classList.add('shown'); return; }
  const g = e.target.closest('.g3');
  if (g){
    if (sxm[i] === g.dataset.v) delete sxm[i]; else sxm[i] = g.dataset.v;
    lsSet(SX_KEY, sxm);
    c.querySelectorAll('.g3').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === sxm[i])));
    c.querySelector('.sxmk').innerHTML = sxMark(i);
    tally();
  }
});

/* ══ ΕΡΜΗΝΕΥΤΙΚΑ ════════════════════════════════════════════════════════ */
function modelHTML(list){
  return list.map(b => {
    if (b.k === 't') return '<p class="th"><span class="lbl tag-mine">Θέση</span><br>' + esc(b.x) + '</p>';
    if (b.k === 'h') return '<h5>' + esc(b.x) + '</h5>';
    if (b.k === 'p') return '<p>' + esc(b.x) + '</p>';
    if (b.k === 's') return '<div class="so"><span class="lbl">Και γι’ αυτό</span><p>' + esc(b.x) + '</p></div>';
    if (b.k === 'q') return '<div class="qt"><span class="g">«' + esc(b.an) + '»</span><span class="x">' + esc(b.x) + '</span></div>';
    if (b.k === 'tq') return '<div class="qt"><span class="g mod">«' + esc(b.an) + '»</span><span class="who lbl">' + (b.who === 'gryp' ? 'Ι. Γρυπάρης' : esc(D.translator)) + '</span><span class="x">' + esc(b.x) + '</span></div>';
    if (b.k === 'pq') return '<div class="qt"><span class="g mod">«' + esc(b.an) + '»</span><span class="x">' + esc(b.x) + '</span></div>';
    if (b.k === 'iq') return '<div class="qt"><span class="g mod">«' + esc(b.an) + '»</span><span class="who lbl">εισαγωγή του βιβλίου</span><span class="x">' + esc(b.x) + '</span></div>';
    return '';
  }).join('');
}
function qaHTML(it, num){
  const mine = ans[it.id] || '';
  return '<div class="qa" data-id="' + it.id + '">' +
    '<div class="qn">' + esc(num) + '</div>' +
    '<div><p class="q"><span class="lbl tag-book">του βιβλίου</span>' + esc(it.q) + '</p>' +
    '<textarea placeholder="Η δική σου απάντηση — θέση, παράθεμα, «και γι’ αυτό…»" aria-label="Η απάντησή σου">' + esc(mine) + '</textarea>' +
    '<div class="row"><button class="tbtn mshow" type="button" aria-pressed="false">Δες το υπόδειγμα</button><span class="saved"></span></div>' +
    '<div class="model"><div class="mh"><span class="lbl tag-mine">Υπόδειγμα · δικό μου, όχι του βιβλίου</span></div>' + modelHTML(it.model) + '</div>' +
    '</div></div>';
}
function buildActs(){
  document.getElementById('actBox').innerHTML = D.acts.map(g =>
    '<div class="grp"><h3>' + esc(g.title) + '</h3>' + g.items.map((it, i) => qaHTML(it, g.id.replace('C','Γ').replace('A','Α').replace('B','Β') + '.' + (i + 1))).join('') + '</div>').join('');
  document.getElementById('parBox').innerHTML = D.pars.map(p =>
    '<div class="par"><p class="ph">' + esc(p.head) + '</p>' +
    '<p class="pi">' + esc(p.intro) + '</p>' +
    '<p class="pt">' + esc(p.text) + '</p>' +
    '<p class="pc lbl">(' + esc(p.translator) + ')</p>' +
    p.items.map((it, i) => qaHTML(it, String(i + 1))).join('') + '</div>').join('');
}
const ansTimers = {};
document.getElementById('p-ermineia').addEventListener('input', e => {
  const ta = e.target.closest('textarea'); if (!ta) return;
  const qa = ta.closest('.qa'), id = qa.dataset.id;
  clearTimeout(ansTimers[id]);
  ansTimers[id] = setTimeout(() => {
    const v = ta.value;
    if (v.trim()) ans[id] = v; else delete ans[id];
    qa.querySelector('.saved').textContent = lsSet(ANS_KEY, ans) ? 'αποθηκεύτηκε' : 'ΔΕΝ αποθηκεύτηκε';
    tally();
  }, 400);
});
document.getElementById('p-ermineia').addEventListener('click', e => {
  const b = e.target.closest('.mshow'); if (!b) return;
  const qa = b.closest('.qa'), open = !qa.classList.contains('open');
  qa.classList.toggle('open', open);
  b.setAttribute('aria-pressed', String(open));
  b.textContent = open ? 'Κρύψε το υπόδειγμα' : 'Δες το υπόδειγμα';
});

/* ══ ΛΕΞΙΛΟΓΙΚΑ ═════════════════════════════════════════════════════════ */
const lxTbl = document.getElementById('lxTbl');
document.getElementById('lxBody').innerHTML = D.lexika.map(x =>
  '<tr><td class="w0"><button type="button" data-go="' + x.key + '">' + esc(x.w) + '</button></td>' +
  '<td class="rt hm">' + esc(x.root) + '</td>' +
  '<td class="rel"><span class="in">' + x.rel.map(r => '<span>' + esc(r) + '</span>').join('') + '</span></td></tr>').join('');
lxTbl.addEventListener('click', e => {
  const go = e.target.closest('[data-go]');
  if (go){ goWord(go.dataset.go); return; }
  const td = e.target.closest('td.rel');
  if (td && lxTbl.classList.contains('hidecol')) td.classList.toggle('rv');
});
document.getElementById('lxHide').addEventListener('click', e => {
  const on = !lxTbl.classList.contains('hidecol');
  lxTbl.classList.toggle('hidecol', on);
  lxTbl.querySelectorAll('td.rel.rv').forEach(t => t.classList.remove('rv'));
  e.currentTarget.setAttribute('aria-pressed', String(on));
});

/* ══ ΑΛΜΑΤΑ ═════════════════════════════════════════════════════════════ */
function goWord(k){
  const n = KEY_SEG[k]; if (!n) return;
  setTab('metafrasi');
  if (ui.mode !== 'rd' && ui.mode !== 'st') setMode('rd');
  const row = box.querySelector('.sent[data-n="' + n + '"]');
  select(n, k, true);
  if (row) row.scrollIntoView({block:'center'});
}
function goScholio(i){
  setTab('sxolia');
  const c = sxList.querySelector('.sxc[data-i="' + i + '"]'); if (!c) return;
  c.scrollIntoView({block:'center'});
  c.classList.add('flash'); setTimeout(() => c.classList.remove('flash'), 1400);
}

/* ══ ΜΕΤΡΗΣΕΙΣ ══════════════════════════════════════════════════════════ */
function tally(){
  const nS = D.segs.length;
  document.getElementById('bTr').textContent = D.segs.filter(s => trm[s.n] === 'k').length;
  document.getElementById('bTrAll').textContent = nS;
  document.getElementById('bTrDash').innerHTML = D.segs.map(s => '<i class="' + ({k:'on', x:'x', r:'r'}[trm[s.n]] || '') + '"></i>').join('');
  const nX = D.scholia.length;
  document.getElementById('bSx').textContent = D.scholia.filter((s, i) => sxm[i] === 'k').length;
  document.getElementById('bSxAll').textContent = nX;
  document.getElementById('bSxDash').innerHTML = D.scholia.map((s, i) => '<i class="' + ({k:'on', x:'x'}[sxm[i]] || '') + '"></i>').join('');
  const allQ = D.acts.reduce((a, g) => a.concat(g.items), []).concat(D.pars.reduce((a, p) => a.concat(p.items), []));
  document.getElementById('bAns').textContent = allQ.filter(it => (ans[it.id] || '').trim()).length;
  document.getElementById('bAnsAll').textContent = allQ.length;
  document.getElementById('tcM').textContent = nS;
  document.getElementById('tcS').textContent = nX;
  document.getElementById('tcE').textContent = allQ.length;
  document.getElementById('tcL').textContent = D.lexika.length;
}

/* ══ ΕΚΚΙΝΗΣΗ ═══════════════════════════════════════════════════════════ */
build(); buildWhole(); buildScholia(); buildActs(); tally();
setSx(ui.sx);
setMode(ui.mode);
const h0 = (location.hash || '').slice(1);
setTab(TABS.indexOf(h0) >= 0 ? h0 : ui.tab);
</script>
</body>
</html>
