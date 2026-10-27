<!DOCTYPE html>
<html lang="el">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>@@TITLE@@ · Εισαγωγή Αρχαίων</title>
<!-- ⛔ ΠΑΡΑΓΕΤΑΙ: node tools/eisagogi/arxaia/build.js @@NAME@@ — μην τη γράψεις με το χέρι.
     Το κεφάλαιο ζει στο tools/eisagogi/arxaia/@@NAME@@.json· το καλούπι εδώ (page.tpl). -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Commissioner:wght@300;400;500;600&family=GFS+Didot&family=JetBrains+Mono:wght@400;500&display=swap">
<style>
/* ══ ΤΟ ΚΑΛΟΥΠΙ ΤΗΣ ΕΙΣΑΓΩΓΗΣ ΤΩΝ ΑΡΧΑΙΩΝ ═══════════════════════════════
   Midnight (metron-design §2) · τρεις φωνές: Commissioner για πρόζα,
   GFS Didot για κάθε ελληνικό τίτλο/όρο/αρχαίο, JetBrains Mono για ετικέτες.
   ⛔ Κανένα min-width· το λάπτοπ γράφεται πρώτο και μαζεύει με max-width.
   ⛔ Τίποτα δεν γεννιέται αόρατο περιμένοντας JS (σταθ. 39): η κίνηση
   προστίθεται κάτω από html.anim και έχει πάντα τελική κατάσταση ορατή. */
:root{
  color-scheme:dark;
  --bg:oklch(13.2% .022 258); --surf:oklch(16.4% .022 258); --surf2:oklch(19.5% .022 258); --surf3:oklch(23% .022 258);
  --metal-hi:oklch(44% .013 258); --metal-lo:oklch(25% .014 258);
  --text:#EDE6D8; --soft:#C9C2B5; --muted:#A7A196; --faint:#8A8C94;
  --line:rgba(237,230,216,.07); --line2:rgba(237,230,216,.12); --line3:rgba(237,230,216,.2);
  --amber:#E8B25C; --late:#E8836F; --arx:#E8A07F;
  --gr:"GFS Didot","Literata",serif;
  --sans:"Commissioner",system-ui,-apple-system,"Segoe UI",sans-serif;
  --mono:"JetBrains Mono",ui-monospace,"SF Mono",Menlo,monospace;
  --ease:cubic-bezier(.16,1,.3,1);
}
*{box-sizing:border-box}
[hidden]{display:none!important}
html{-webkit-text-size-adjust:100%;scroll-padding-top:16px}
body{margin:0;background:var(--bg);color:var(--text);font:400 15.5px/1.72 var(--sans);-webkit-font-smoothing:antialiased;
  padding:0 max(16px,env(safe-area-inset-right,0px)) 96px max(16px,env(safe-area-inset-left,0px))}
.shell{max-width:1180px;margin:0 auto}
button{font:inherit;color:inherit}
a{color:inherit}
.lbl{font:500 10px/1.3 var(--mono);letter-spacing:.22em;text-transform:uppercase;color:var(--faint)}
.gr,.t{font-family:var(--gr)}
em.t{font-style:italic;font-size:1.1em;color:var(--arx)}
b{font-weight:500;color:var(--text)}
:focus-visible{outline:2px solid var(--amber);outline-offset:3px;border-radius:6px}

/* ── διαδρομή + καρτέλες ── */
.route{display:flex;align-items:center;gap:18px;padding:20px 0;border-bottom:1px solid var(--line)}
.back{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:0 14px 0 12px;border:1px solid var(--line2);border-radius:10px;
  text-decoration:none;font:500 13px var(--sans);color:var(--soft);background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.008))}
.back:hover{color:var(--text);border-color:var(--line3)}
.crumbs{flex:1;min-width:0}
.tabs{display:flex;gap:4px;background:var(--surf);border:1px solid var(--line);border-radius:11px;padding:3px}
.tabs button{border:0;background:none;cursor:pointer;font:500 13px var(--sans);padding:8px 16px;border-radius:8px;color:var(--muted);min-height:36px}
.tabs button[aria-selected="true"]{background:var(--surf3);color:var(--text)}
.tabs button:active{transform:scale(.97)}
.banner{margin:18px 0 0;border:1px solid rgba(232,131,111,.4);border-radius:12px;padding:12px 16px;color:var(--text);background:rgba(232,131,111,.08);font-size:14px}

/* ── εξώφυλλο ── */
.cover{display:grid;grid-template-columns:auto minmax(0,1fr);gap:48px;align-items:center;padding:64px 0 58px;border-bottom:1px solid var(--line)}
.seal{width:196px;height:196px;border-radius:50%;flex:none;
  background:radial-gradient(circle at 50% 40%,oklch(22% .03 258),var(--surf) 74%);transition:width .4s var(--ease),height .4s var(--ease)}
.seal svg{width:100%;height:100%;display:block;overflow:visible}
.seal .rim{fill:none;stroke:var(--line3);stroke-width:1}
.seal .rim2{fill:none;stroke:var(--line2);stroke-width:1}
.seal .ring{font:400 13.5px var(--gr);letter-spacing:.32em;fill:var(--muted)}
.seal .mark{font:400 italic 92px var(--gr);fill:var(--text)}
.seal{position:relative;overflow:hidden}
.seal img{position:absolute;inset:7%;width:86%;height:86%;border-radius:50%;object-fit:cover;
  filter:invert(1) sepia(.35) saturate(.8) brightness(.93);mix-blend-mode:screen;
  -webkit-mask-image:radial-gradient(circle,#000 58%,transparent 71%);mask-image:radial-gradient(circle,#000 58%,transparent 71%)}
.seal svg{position:relative}
.seal .pip{fill:var(--surf3);stroke:var(--line3);stroke-width:1;transition:fill .4s,stroke .4s}
.seal .pip.lit{fill:var(--amber);stroke:var(--amber);filter:drop-shadow(0 0 4px rgba(232,178,92,.6))}
/* ⭐ από τη 2η επίσκεψη: το εξώφυλλο μαζεύει, ο σταθμός ανεβαίνει στην πρώτη οθόνη */
html.ret .cover{padding:30px 0 26px;gap:30px}
html.ret .seal{width:104px;height:104px}
html.ret .seal .ring{display:none}
html.ret .seal img{inset:4%;width:92%;height:92%}
html.ret .cover h1{font-size:clamp(34px,4.2vw,54px);margin:8px 0 6px}
html.ret .cover .sub{display:none}
html.ret .motto{font-size:21px}
html.ret .motto small{display:none}
html.ret .map{padding:30px 0 30px}
html.ret .map .lead,html.ret .map .h2{display:none}
html.ret .map .mapbox{margin-top:14px}
.cover h1{font:400 italic clamp(46px,6.6vw,92px)/1.02 var(--gr);margin:14px 0 14px;letter-spacing:-.005em;text-wrap:balance}
.cover .sub{color:var(--muted);margin:0 0 22px;max-width:60ch;font-size:15px}
.motto{font:400 clamp(22px,2.5vw,30px)/1.3 var(--gr);color:var(--amber)}
.motto small{display:block;font:300 italic 15px/1.5 var(--sans);color:var(--muted);margin-top:6px}

/* ── ο αστερισμός ── */
.map{padding:56px 0 50px;border-bottom:1px solid var(--line)}
.h2{font:400 italic 34px/1.15 var(--gr);margin:10px 0 8px;text-wrap:balance}
.map .lead{color:var(--muted);margin:0 0 24px;max-width:62ch}
.mapbox{background:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.006));border:1px solid var(--line);border-radius:18px}
.mapbox svg{display:block;width:100%;height:auto}
.edge{stroke:var(--line2);stroke-width:1.2;fill:none}
.edge.lit{stroke:var(--amber);stroke-opacity:.72}
html.anim .mapbox:not(.drawn) .edge.lit{stroke-dashoffset:var(--len)}
.edge.lit{stroke-dasharray:var(--len) var(--len);stroke-dashoffset:0;transition:stroke-dashoffset 1.3s var(--ease)}
.node{cursor:pointer}
.node circle.dot{fill:var(--bg);stroke:var(--line3);stroke-width:1.3;transition:fill .3s,stroke .3s}
.node.lit circle.dot{fill:var(--amber);stroke:var(--amber);filter:drop-shadow(0 0 7px rgba(232,178,92,.55))}
.node circle.ring{fill:none;stroke:var(--amber);stroke-width:1.4;opacity:0}
.node.here circle.ring{opacity:1}
.node circle.hit{fill:transparent;stroke:none}
.node text.nm{font:400 italic 17px var(--gr);fill:var(--soft)}
.node.lit text.nm,.node.here text.nm{fill:var(--text)}
.node text.n{font:500 10px var(--mono);letter-spacing:.2em;fill:var(--faint)}
.node .gapdot{fill:var(--late)}
.node text.gapn{font:500 10px var(--mono);fill:var(--late)}
.node:hover text.nm{fill:var(--text)}
.node:focus-visible{outline:none}
.node:focus-visible circle.ring{opacity:1;stroke:var(--text)}
.core{font:400 24px var(--gr);fill:var(--amber);opacity:.9}
.node.stamp circle.dot{animation:stamp .7s var(--ease)}
@keyframes stamp{0%{transform:scale(.3)}60%{transform:scale(1.18)}100%{transform:scale(1)}}
.node circle.dot{transform-box:fill-box;transform-origin:center}

/* ── σταθμός ── */
.st{display:grid;grid-template-columns:minmax(0,1fr) 330px;gap:60px;padding:66px 0 40px}
.st-main{min-width:0}
.num{font:400 italic 124px/.8 var(--gr);color:var(--surf3);margin:0 0 -22px;user-select:none}
.st h2{font:400 italic 36px/1.14 var(--gr);margin:10px 0 0;text-wrap:balance}
.mine{margin:12px 0 0;color:var(--muted);font-size:13.5px}
.mine .lbl{margin-right:8px}
.prose{max-width:660px;margin-top:26px}
.prose p{margin:0 0 18px;color:var(--soft)}
.quote{margin:30px 0;max-width:700px;padding:4px 0 4px 26px;position:relative}
.quote::before{content:"";position:absolute;left:0;top:6px;bottom:6px;width:1px;background:var(--line3)}
.quote .lbl{display:block;margin-bottom:10px}
.quote blockquote{margin:0;font:400 italic 19px/1.62 var(--gr);color:var(--text)}
.quote cite{display:block;margin-top:12px;font:500 10px/1.4 var(--mono);letter-spacing:.2em;text-transform:uppercase;color:var(--faint);font-style:normal}
.quote cite .gr{font:400 italic 14px var(--gr);letter-spacing:0;text-transform:none}
.keys{display:grid;gap:16px;margin:30px 0 0;padding:0;list-style:none;max-width:680px}
.keys li{display:grid;grid-template-columns:20px minmax(0,1fr);gap:10px;color:var(--soft)}
.keys li::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--arx);margin-top:11px;justify-self:center}
.done{margin-top:36px;display:flex;align-items:center;gap:16px;flex-wrap:wrap}
.btn{font:500 14px var(--sans);border-radius:10px;padding:0 20px;min-height:46px;cursor:pointer;border:1px solid var(--line2);
  background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(255,255,255,.01));color:var(--text);transition:transform .12s,background .2s,border-color .2s}
.btn:hover{border-color:var(--line3)}
.btn:active{transform:scale(.97)}
.btn.pri{background:var(--amber);border-color:var(--amber);color:#1a1408}
.btn.ghost{background:none}
.btn.small{min-height:40px;padding:0 14px;font-size:13px}
.done .ok{color:var(--muted);font-size:13.5px}
.done a.next{font:500 14px var(--sans);color:var(--amber);text-decoration:none;min-height:44px;display:inline-flex;align-items:center}
.done a.next:hover{text-decoration:underline}

/* ── το σχέδιο: ένα πλαίσιο, ό,τι κι αν είναι μέσα ── */
.dg{margin:32px 0;background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.008));border:1px solid var(--line);border-radius:16px;padding:26px 26px 24px;position:relative;overflow:hidden}
.dg .cap{font:500 10px/1.3 var(--mono);letter-spacing:.22em;text-transform:uppercase;color:var(--faint)}
.dg .big{font:400 italic 21px/1.25 var(--gr);color:var(--text)}
.dg .sm{font-size:13.5px;line-height:1.5;color:var(--muted)}
.dg .amb{color:var(--amber)}
html.anim .dg .grow{transform:scaleX(0);transform-origin:left;animation:grow .9s var(--ease) forwards}
html.anim .dg .growy{transform:scaleY(0);transform-origin:top;animation:growy .9s var(--ease) forwards}
html.anim .dg .fade{opacity:0;animation:fade .7s var(--ease) forwards}
@keyframes grow{to{transform:scaleX(1)}}
@keyframes growy{to{transform:scaleY(1)}}
@keyframes fade{to{opacity:1}}

/* flow: Α → Β → Γ */
.flow{display:grid;grid-template-columns:minmax(0,1fr) 54px minmax(0,1fr) 54px minmax(0,1fr);align-items:start}
.flow .nd{text-align:center;padding:0 6px}
.flow .nd i{display:block;width:12px;height:12px;border-radius:50%;margin:4px auto 14px;border:1.3px solid var(--line3);background:var(--bg)}
.flow .nd:last-child i{background:var(--amber);border-color:var(--amber);box-shadow:0 0 12px rgba(232,178,92,.5)}
.flow .cn{height:1px;background:var(--amber);opacity:.65;margin-top:10px;position:relative}
.flow .cn::after{content:"";position:absolute;right:-1px;top:-3px;border:3.5px solid transparent;border-left:6px solid var(--amber);border-right:0}
.flow .sm{margin-top:6px}

/* repeat: ίδιο εύρημα σε κάθε στάση */
.rep .top{text-align:center;max-width:560px;margin:0 auto}
.rep .stops{display:grid;gap:18px;margin:24px 0 0}
.rep .stop{border-top:1px solid var(--line2);padding-top:14px;display:grid;grid-template-columns:110px minmax(0,1fr) minmax(0,1fr);gap:18px;align-items:baseline}
.rep .stop .who{color:var(--soft)}
.rep .stop .find{color:var(--amber);font:400 italic 18px/1.3 var(--gr)}
.rep .res{margin-top:22px;border-top:1px solid var(--line3);padding-top:16px;display:grid;grid-template-columns:110px minmax(0,1fr);gap:18px;align-items:baseline}
.rep .cost{margin-top:10px;color:var(--muted);font-size:13.5px;padding-left:128px}

/* split: δύο πλευρές, ένα αποτέλεσμα */
.split .cols{display:grid;grid-template-columns:minmax(0,1fr) 1px minmax(0,1fr);gap:26px}
.split .bar{background:var(--line2)}
.split h4{margin:6px 0 12px;font:400 italic 22px/1.2 var(--gr)}
.split .L h4{color:var(--amber)}
.split ul{margin:0;padding:0;list-style:none;display:grid;gap:9px}
.split li{display:grid;grid-template-columns:14px minmax(0,1fr);gap:8px;color:var(--soft);font-size:14.5px;line-height:1.45}
.split li::before{content:"";width:5px;height:5px;border-radius:50%;background:var(--faint);margin-top:8px}
.split .L li::before{background:var(--amber)}
.split .R li::before{background:var(--late)}
.split .res{margin-top:22px;padding-top:16px;border-top:1px solid var(--line3);text-align:center}

/* fork: μία ρίζα, δύο δρόμοι */
.fork .root{text-align:center;max-width:520px;margin:0 auto}
.fork svg{display:block;width:100%;height:46px;margin:10px 0 4px}
.fork svg path{stroke:var(--line3);stroke-width:1.2;fill:none;vector-effect:non-scaling-stroke}
.fork svg path.r{stroke:var(--amber);stroke-opacity:.8}
.fork .heads,.fork .row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:26px}
.fork .heads{margin-bottom:6px}
.fork .heads .big{font-size:22px}
.fork .heads div:last-child .big{color:var(--amber)}
.fork .row{border-top:1px solid var(--line);padding:11px 0;font-size:14.5px;line-height:1.5}
.fork .row div:first-child{color:var(--muted)}
.fork .row div:last-child{color:var(--text)}

/* dialogue: δύο φωνές */
.dlg .lanes{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px 30px}
.dlg .lanes .cap{padding-bottom:6px;border-bottom:1px solid var(--line2)}
.dlg .ph{grid-column:1/-1;display:flex;align-items:center;gap:12px;margin:10px 0 0}
.dlg .ph::before,.dlg .ph::after{content:"";flex:1;height:1px;background:var(--line2)}
.dlg .bub{border:1px solid var(--line2);border-radius:14px;padding:11px 14px;font-size:14.5px;line-height:1.5;color:var(--soft);background:var(--surf)}
.dlg .bub.S{grid-column:2;border-color:rgba(232,160,127,.3)}
.dlg .bub.C{grid-column:1}
.dlg .res{grid-column:1/-1;text-align:center;margin-top:16px;padding:16px 10px 4px;border-top:1px solid var(--line3)}
.dlg .res .big{color:var(--amber)}

/* descent: από τα άστρα στη γη */
.desc{text-align:center}
.desc .sky{position:relative;padding:8px 0 4px}
.desc .sky svg{display:block;width:100%;height:40px;margin-bottom:6px}
.desc .sky circle{fill:var(--soft)}
.desc .arrow{width:1px;height:58px;margin:14px auto;background:linear-gradient(var(--line3),var(--amber));position:relative}
.desc .arrow::after{content:"";position:absolute;left:-4px;bottom:-1px;border:4px solid transparent;border-top:7px solid var(--amber);border-bottom:0}
.desc .earth{border-top:1px solid var(--amber);padding-top:14px;max-width:520px;margin:0 auto}
.desc .gk{display:block;font:400 italic 17px/1.4 var(--gr);color:var(--arx);margin-top:4px}

/* ladder: τα σκαλιά της επαγωγής */
.lad .steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-items:end;gap:0;margin-top:14px}
.lad .stp{border-top:1px solid var(--line3);border-left:1px solid var(--line3);padding:12px 14px 0 14px;position:relative}
.lad .stp::before{content:"";position:absolute;left:-1px;right:0;top:-1px;height:1.5px;background:var(--amber)}
html.anim .lad .stp::before{transform:scaleX(0);transform-origin:left;animation:grow .7s var(--ease) forwards}
.lad .stp:nth-child(1){height:96px}.lad .stp:nth-child(2){height:156px}.lad .stp:nth-child(3){height:216px}
html.anim .lad .stp:nth-child(2)::before{animation-delay:.45s}html.anim .lad .stp:nth-child(3)::before{animation-delay:.9s}
.lad .stp:last-child .big{color:var(--amber)}
.lad .caps{display:flex;justify-content:space-between;gap:12px;margin-top:12px;border-top:1px solid var(--line2);padding-top:10px}
.lad .rise{float:right;font:400 italic 18px var(--gr);color:var(--arx)}

/* scales: έξι ζυγαριές */
.scl .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px 18px}
.scl .pair{text-align:center}
.scl svg{display:block;width:100%;max-width:180px;height:auto;margin:0 auto}
.scl svg path,.scl svg line{stroke:var(--metal-hi);stroke-width:1.2;fill:none}
.scl svg .beam{stroke:var(--soft)}
.scl svg .pv{fill:var(--amber);stroke:none}
.scl .w{display:grid;grid-template-columns:1fr 1fr;gap:8px;font:400 italic 16.5px/1.25 var(--gr);color:var(--text);margin-top:4px}
.scl .no{font:500 10px var(--mono);letter-spacing:.2em;color:var(--faint)}
.scl .thread{margin-top:24px;padding-top:16px;border-top:1px solid var(--line3);display:flex;align-items:center;justify-content:center;gap:12px;text-align:center}
.scl .thread i{width:9px;height:9px;border-radius:50%;background:var(--amber);box-shadow:0 0 12px rgba(232,178,92,.55);flex:none}

/* ── η πλαϊνή κάρτα ── */
aside{min-width:0}
aside .card{position:sticky;top:22px;background:var(--surf);border:1px solid var(--line);border-radius:16px;padding:22px}
aside h3{font:400 italic 22px var(--gr);margin:8px 0 12px}
.gloss{display:grid;gap:14px}
.gloss div{border-top:1px solid var(--line);padding-top:12px}
.gloss .gk{font:400 19px/1.3 var(--gr);color:var(--arx)}
.gloss .gl{color:var(--soft);font-size:13.5px;line-height:1.5}
.gloss .yours{display:block;margin-top:4px}
.mnem{margin-top:18px;border-top:1px solid var(--line);padding-top:14px}
.mnem .k{font:500 13px/1.4 var(--mono);letter-spacing:.1em;color:var(--amber);margin:6px 0}
.mnem p{margin:0;color:var(--soft);font-size:13.5px;line-height:1.55}
.pager{display:flex;justify-content:space-between;gap:10px;margin-top:18px;padding-top:12px;border-top:1px solid var(--line)}
.pager a{font:500 13px var(--sans);color:var(--soft);text-decoration:none;min-height:44px;display:inline-flex;align-items:center}
.pager a:hover{color:var(--text)}
.pager a.r{text-align:right;margin-left:auto}

/* ── τέλος κεφαλαίου ── */
.fin{padding:70px 0 40px;text-align:center}
.fin p.line{font:400 italic clamp(40px,5.4vw,68px)/1.05 var(--gr);margin:18px 0 22px;color:var(--text);max-width:none}
.fin p{color:var(--muted);max-width:52ch;margin:0 auto 26px}
.fin .mapbox{max-width:900px;margin:0 auto 34px}

/* ── ο έλεγχος ── */
.ck-head{padding:56px 0 34px;border-bottom:1px solid var(--line);display:grid;grid-template-columns:minmax(0,1fr);gap:28px}
.ck-head .say{font:400 italic 34px/1.2 var(--gr);margin:10px 0 0;text-wrap:balance}
.ck-head .say + p{color:var(--muted);margin:10px 0 0}
.mapbox.strip .node text.nm{font-size:15px}
.subnav{display:flex;gap:26px;flex-wrap:wrap;border-bottom:1px solid var(--line);margin:0}
.subnav button{background:none;border:0;cursor:pointer;padding:16px 0 13px;font:500 13px var(--sans);color:var(--muted);border-bottom:1px solid transparent;margin-bottom:-1px;min-height:44px}
.subnav button[aria-selected="true"]{color:var(--text);border-bottom-color:var(--text)}
.subnav button span{font:500 10px var(--mono);color:var(--faint);margin-left:6px;letter-spacing:.08em}
.pane{padding:38px 0 20px}
.pane .intro{color:var(--muted);max-width:64ch;margin:0 0 24px}

.rc{max-width:720px;background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.008));border:1px solid var(--line);border-radius:18px;padding:30px 30px 26px}
.rc .q{font:400 italic 26px/1.3 var(--gr);margin:12px 0 20px;text-wrap:balance}
.rc .think{color:var(--muted);font-size:14px;margin:0 0 18px}
.rc .ans{border-top:1px solid var(--line2);padding-top:18px;color:var(--text);font-size:15.5px}
.rc .row{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}
.rc .go{font:500 13px var(--sans);color:var(--soft);text-decoration:none;display:inline-flex;align-items:center;min-height:44px;margin-left:auto}
.rc .go:hover{color:var(--text)}
.ticks{display:flex;gap:2px;max-width:720px;margin:0 0 18px}
.ticks i{flex:1;height:4px;border-radius:2px;background:var(--line2);display:block;transition:background .3s}
.ticks i.k{background:var(--amber)}
.ticks i.n{background:var(--late)}
.ticks i.here{background:var(--text);transform:scaleY(1.75)}
.bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 16px;max-width:720px}
.bar .pos{font:500 12px var(--mono);color:var(--faint);margin-left:auto}

.qs{display:grid;gap:14px;max-width:760px}
.qi{border:1px solid var(--line);border-radius:14px;padding:18px 20px;background:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.006))}
.qi .qt{color:var(--text);margin:6px 0 12px}
.qi .opts{display:grid;gap:8px}
.qi .opt{text-align:left;width:100%;min-height:44px;padding:10px 14px;border-radius:10px;border:1px solid var(--line2);background:var(--surf);color:var(--soft);cursor:pointer;font:400 14.5px/1.45 var(--sans)}
.qi .opt:hover:not(:disabled){border-color:var(--line3);color:var(--text)}
.qi .opt:disabled{cursor:default}
.qi .opt.ok{border-color:rgba(232,178,92,.7);color:var(--text);background:rgba(232,178,92,.09)}
.qi .opt.no{border-color:rgba(232,131,111,.6);color:var(--text);background:rgba(232,131,111,.08)}
.qi .tfrow{display:flex;gap:8px}
.qi .tfrow .opt{width:auto;min-width:96px;text-align:center}
.qi .ex{margin-top:12px;color:var(--soft);font-size:14px;border-top:1px solid var(--line);padding-top:10px}
.qi .ex .v{font:500 10px var(--mono);letter-spacing:.2em;text-transform:uppercase;margin-right:8px}
.qi .ex .v.ok{color:var(--amber)}.qi .ex .v.no{color:var(--late)}
.qi .ex a{color:var(--muted)}
.score{max-width:760px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin:0 0 18px}
.score .n{font:500 30px var(--mono);color:var(--text)}
.score .n small{font-size:14px;color:var(--faint)}

.gaps{display:grid;gap:22px;max-width:820px}
.gapst{border-top:1px solid var(--line2);padding-top:14px}
.gapst .hd{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap}
.gapst .hd .big{font:400 italic 22px var(--gr)}
.gapst .hd a{margin-left:auto;font:500 13px var(--sans);color:var(--amber);text-decoration:none;min-height:44px;display:inline-flex;align-items:center}
.gapst ul{list-style:none;margin:6px 0 0;padding:0;display:grid;gap:4px}
.gapst li{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center;padding:8px 0;border-top:1px solid var(--line)}
.gapst li .kind{font:500 10px var(--mono);letter-spacing:.18em;text-transform:uppercase;color:var(--late);display:block}
.gapst li .tx{color:var(--soft);font-size:14.5px}
.empty{max-width:640px;border:1px dashed var(--line3);border-radius:14px;padding:18px 20px;color:var(--soft)}

.nums{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;border:1px solid var(--line);border-radius:16px;overflow:hidden;max-width:1000px}
.nums div{padding:20px 22px;border-right:1px solid var(--line);border-bottom:1px solid var(--line)}
.nums div:nth-child(3n){border-right:0}
.nums .v{font:500 30px/1.1 var(--mono);color:var(--amber)}
.nums .l{color:var(--soft);font-size:13.5px;margin-top:6px}
.glance h3{font:400 italic 26px var(--gr);margin:44px 0 14px}
.glance .note{color:var(--muted);font-size:13.5px;margin:12px 0 0}
.pits{list-style:none;margin:0;padding:0;display:grid;gap:12px;max-width:820px}
.pits li{display:grid;grid-template-columns:20px minmax(0,1fr) auto;gap:10px;color:var(--soft);align-items:start}
.pits li::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--late);margin-top:10px;justify-self:center}
.pits a,.mlist a{font:500 12px var(--mono);color:var(--faint);text-decoration:none;white-space:nowrap;min-height:32px;display:inline-flex;align-items:center}
.pits a:hover,.mlist a:hover{color:var(--text)}
.idea{max-width:760px;font:400 italic 20px/1.6 var(--gr);color:var(--text);margin:0}
.mlist{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;max-width:1000px}
.mlist div{border:1px solid var(--line);border-radius:14px;padding:16px 18px}
.mlist .k{font:500 13px var(--mono);letter-spacing:.1em;color:var(--amber)}
.mlist p{margin:6px 0 0;color:var(--soft);font-size:14px}

/* ── κίνηση εισόδου (μόνο κάτω από html.anim, πάντα με ορατή κατάληξη) ── */
html.anim .enter > *{animation:rise .55s var(--ease) both}
html.anim .enter > *:nth-child(2){animation-delay:.04s}html.anim .enter > *:nth-child(3){animation-delay:.08s}
html.anim .enter > *:nth-child(4){animation-delay:.12s}html.anim .enter > *:nth-child(n+5){animation-delay:.16s}
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation:none!important;transition:none!important}
  html.anim .mapbox:not(.drawn) .edge.lit{stroke-dashoffset:0}
}

/* ── μόνο max-width ── */
@media (max-width:1040px){
  .st{grid-template-columns:minmax(0,1fr);gap:30px}
  aside .card{position:static}
}
@media (max-width:760px){
  .flow{grid-template-columns:minmax(0,1fr)}
  .flow .cn{width:1px;height:28px;margin:10px auto}
  .flow .cn::after{right:-3px;top:auto;bottom:-1px;border:3.5px solid transparent;border-top:6px solid var(--amber);border-bottom:0}
  .rep .stop{grid-template-columns:minmax(0,1fr);gap:4px}
  .rep .res{grid-template-columns:minmax(0,1fr);gap:4px}
  .rep .cost{padding-left:0}
  .split .cols{grid-template-columns:minmax(0,1fr);gap:18px}
  .split .bar{height:1px}
  .scl .grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .nums{grid-template-columns:repeat(2,minmax(0,1fr))}
  .nums div:nth-child(3n){border-right:1px solid var(--line)}
  .nums div:nth-child(2n){border-right:0}
  .mlist{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:640px){
  body{font-size:15px}
  .lbl,.dg .cap,.quote cite,.node text.n,.subnav button span,.scl .no{font-size:11px}
  .route{flex-wrap:wrap;gap:10px 12px;padding:14px 0}
  .crumbs{order:3;flex-basis:100%}
  .tabs{margin-left:auto}
  .tabs button{min-height:44px;padding:0 14px}
  .back{min-height:44px}
  .cover{grid-template-columns:minmax(0,1fr);gap:22px;padding:36px 0 40px}
  .seal{width:132px;height:132px}
  html.ret .seal{width:84px;height:84px}
  .map{padding:40px 0 36px}
  .h2,.st h2,.ck-head .say{font-size:28px}
  .num{font-size:84px;margin-bottom:-14px}
  .st{padding:44px 0 30px}
  .dg{padding:20px 16px 18px}
  .fork .heads,.fork .row{gap:14px}
  .dlg .lanes{gap:8px 12px}
  .lad .stp{padding:10px 8px 0}
  .lad .stp:nth-child(1){height:110px}.lad .stp:nth-child(2){height:170px}.lad .stp:nth-child(3){height:230px}
  .lad .big{font-size:17px}
  .rc{padding:22px 18px 20px}
  .rc .q{font-size:22px}
  .subnav{gap:18px}
  .gapst li{grid-template-columns:minmax(0,1fr)}
  .pits li{grid-template-columns:20px minmax(0,1fr)}
  .pits li a{grid-column:2}
  .scl .grid{grid-template-columns:minmax(0,1fr);gap:18px}
  .scl svg{max-width:170px}
  .scl .w{font-size:15.5px;max-width:300px;margin:4px auto 0}
  .scl .w span{white-space:nowrap}
}
</style>
</head>
<body>
<div class="shell">
  <header class="route">
    @@BACK@@
    <span class="lbl crumbs" id="crumbs"></span>
    <div class="tabs" role="tablist" aria-label="Χώροι">
      <button type="button" role="tab" id="tabRead" aria-controls="vRead" aria-selected="true">Διάβασμα</button>
      <button type="button" role="tab" id="tabCheck" aria-controls="vCheck" aria-selected="false">Έλεγχος</button>
    </div>
  </header>
  <div class="banner" id="banner" role="status" hidden></div>
  <noscript><p class="banner">Η σελίδα χρειάζεται JavaScript για να ζωγραφίσει το κεφάλαιο.</p></noscript>

  <main id="vRead" role="tabpanel" aria-labelledby="tabRead">
    <section class="cover" id="cover"></section>
    <section class="map" aria-labelledby="mapH">
      <span class="lbl">Ο χάρτης του κεφαλαίου</span>
      <h2 class="h2" id="mapH">Από τον χρησμό ως το συμπέρασμα</h2>
      <p class="lead">Κάθε αστέρι είναι ένας σταθμός. Όσα διάβασες ανάβουν. Πάτα ένα για να πας εκεί.</p>
      <div class="mapbox" id="map"></div>
    </section>
    <div id="stage"></div>
  </main>

  <main id="vCheck" role="tabpanel" aria-labelledby="tabCheck" hidden>
    <section class="ck-head">
      <div><span class="lbl">Έλεγχος · ό,τι μπορεί να ρωτηθεί</span><p class="say" id="say"></p><p id="say2"></p></div>
      <div class="mapbox strip" id="map2"></div>
    </section>
    <nav class="subnav" role="tablist" aria-label="Τρόποι ελέγχου" id="subnav"></nav>
    <section class="pane" id="pane"></section>
  </main>
</div>

<script>
/* ══ Η ΜΗΧΑΝΗ ΤΟΥ ΚΑΛΟΥΠΙΟΥ ════════════════════════════════════════════
   Τα δεδομένα του κεφαλαίου μπαίνουν από το build (ένα json). Κανένα
   κείμενο του κεφαλαίου δεν ζει μέσα σε αυτόν τον κώδικα.
   Πρόοδος: ΕΝΑ κλειδί, ΜΟΝΟ σε αυτή τη συσκευή, εκτός sync (δική του
   απόφαση, 27/10/26). Γράφεται από ΕΝΑ σημείο, ξαναδιαβάζεται μετά από
   κάθε εγγραφή, και αν δεν διαβάζεται σωστά ΔΕΝ ξαναγράφεται ποτέ από πάνω. */
(function () {
'use strict';
var D = /*@@DATA@@*/null;
const KEY="@@KEY@@";
var ROM = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
var ST = D.stations, N = ST.length;
var $ = function (id) { return document.getElementById(id); };
var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
var justRead = 0;
document.documentElement.classList.add('anim');

/* ── αποθήκη ─────────────────────────────────────────────────────────── */
var store = { readable: true, why: '', fail: '' };
function blank() { return { v: 1, at: 1, read: {}, rc: {}, tf: {}, mc: {} }; }
function load() {
  var raw;
  try { raw = localStorage.getItem(KEY); }
  catch (e) { store.readable = false; store.why = 'blocked'; return blank(); }
  if (raw === null) return blank();
  try {
    var o = JSON.parse(raw);
    if (!o || typeof o !== 'object' || Array.isArray(o)) throw new Error('σχήμα');
    var b = blank(), k;
    for (k in o) b[k] = o[k];                        /* σταθ. 35: τίποτα δεν χάνεται */
    ['read', 'rc', 'tf', 'mc'].forEach(function (x) { if (!b[x] || typeof b[x] !== 'object') throw new Error(x); });
    return b;
  } catch (e) { store.readable = false; store.why = 'corrupt'; return blank(); }
}
var S = load();
var RET = (function () { var k; for (k in S.read) if (S.read[k]) return true; return S.at > 1; })();
if (RET) document.documentElement.classList.add('ret');
function save() {
  if (!store.readable) { banner(); return false; }
  var txt = JSON.stringify(S), back = null;
  try { localStorage.setItem(KEY, txt); back = localStorage.getItem(KEY); }
  catch (e) { store.fail = 'full'; banner(); return false; }
  if (back !== txt) { store.fail = 'readback'; banner(); return false; }
  store.fail = ''; banner(); return true;
}
function banner() {
  var b = $('banner'), msg = '';
  if (!store.readable && store.why === 'corrupt') msg = 'Η αποθηκευμένη πρόοδος αυτής της συσκευής δεν διαβάζεται σωστά. Για να μη χαθεί, η σελίδα δεν γράφει τίποτα από πάνω της· ό,τι κάνεις τώρα κρατιέται μόνο όσο είναι ανοιχτή.';
  else if (!store.readable) msg = 'Αυτός ο browser δεν επιτρέπει αποθήκευση. Η πρόοδος κρατιέται μόνο όσο είναι ανοιχτή η σελίδα.';
  else if (store.fail) msg = 'Η τελευταία αλλαγή δεν αποθηκεύτηκε (ο χώρος της συσκευής μπορεί να είναι γεμάτος). Φαίνεται εδώ, αλλά θα χαθεί στο κλείσιμο.';
  b.textContent = msg; b.hidden = !msg;
}

/* ── κείμενο: *όρος*, **έμφαση**, και κάθε πολυτονική λέξη σε GFS Didot ── */
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
var POLY = /[ἀ-῿̓̔͂]/;
function md(s) {
  var h = esc(s).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*]+)\*/g, '<em class="t">$1</em>');
  return h.split(/(<em class="t">[\s\S]*?<\/em>|<[^>]+>)/).map(function (part) {
    if (!part || part.charAt(0) === '<') return part;
    return part.replace(/[^\s<>]+/g, function (w) { return POLY.test(w) ? '<span class="gr">' + w + '</span>' : w; });
  }).join('');
}
function plain(s) { return String(s || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1'); }
function stName(n) { return 'Σταθμός ' + ROM[n]; }

/* ── ο αστερισμός ───────────────────────────────────────────────────── */
function gapsBy() {
  var g = {}; ST.forEach(function (s) { g[s.n] = 0; });
  gapList().forEach(function (x) { g[x.s]++; });
  return g;
}
function mapSVG(box, opt) {
  opt = opt || {};
  var w = box.clientWidth || 1000, narrow = w < 620, P = [], W, H;
  if (opt.strip) {
    narrow = false; W = w < 620 ? 520 : 1100; H = w < 620 ? 74 : 128;
    var mx = w < 620 ? 30 : 92;
    ST.forEach(function (s, i) { P.push([mx + i * (W - 2 * mx) / (N - 1), 44]); });
  } else if (!narrow) {
    W = 1100; H = 380;
    ST.forEach(function (s) { P.push([s.xy[0], s.xy[1]]); });
  } else {
    W = 360; H = 78 * N + 70;
    ST.forEach(function (s, i) { P.push([i % 2 ? 250 : 110, 52 + i * 78]); });
  }
  var here = opt.here, gaps = opt.gaps ? gapsBy() : null, h = '';
  h += '<svg viewBox="0 0 ' + W + ' ' + H + '" role="group" aria-label="Ο αστερισμός των ' + N + ' σταθμών">';
  for (var i = 0; i < N - 1; i++) {
    var a = P[i], b = P[i + 1], lit = opt.all || (S.read[ST[i].n] && S.read[ST[i + 1].n]);
    var d = narrow ? 'M' + a[0] + ' ' + a[1] + ' C ' + a[0] + ' ' + (a[1] + 40) + ', ' + b[0] + ' ' + (b[1] - 40) + ', ' + b[0] + ' ' + b[1]
                   : 'M' + a[0] + ' ' + a[1] + ' C ' + (a[0] + 60) + ' ' + a[1] + ', ' + (b[0] - 60) + ' ' + b[1] + ', ' + b[0] + ' ' + b[1];
    h += '<path class="edge' + (lit ? ' lit' : '') + '" d="' + d + '"/>';
  }
  if (!narrow && !opt.strip) h += '<text class="core" x="' + (W / 2) + '" y="' + (H - 16) + '" text-anchor="middle">' + esc(D.core) + '</text>';
  ST.forEach(function (s, i) {
    var p = P[i], up = narrow || opt.strip ? false : p[1] < 170, lit = opt.all || !!S.read[s.n];
    var cls = 'node' + (lit ? ' lit' : '') + (here === s.n ? ' here' : '') + (justRead === s.n && !opt.all ? ' stamp' : '');
    var tx = narrow ? (p[0] < 180 ? p[0] + 22 : p[0] - 22) : p[0], anchor = narrow ? (p[0] < 180 ? 'start' : 'end') : 'middle';
    var y1 = narrow ? p[1] - 4 : opt.strip ? p[1] - 20 : (up ? p[1] - 46 : p[1] + 34), y2 = narrow ? p[1] + 16 : opt.strip ? p[1] + (i % 2 ? 62 : 36) : (up ? p[1] - 24 : p[1] + 56);
    h += '<a class="' + cls + '" href="#s' + s.n + '" aria-label="' + esc(stName(s.n) + ': ' + s.short + (lit ? ', διαβασμένος' : '')) + '">';
    h += '<circle class="hit" cx="' + p[0] + '" cy="' + p[1] + '" r="26"/>';
    h += '<circle class="ring" cx="' + p[0] + '" cy="' + p[1] + '" r="13"/>';
    h += '<circle class="dot" cx="' + p[0] + '" cy="' + p[1] + '" r="7"/>';
    h += '<text class="n" x="' + tx + '" y="' + y1 + '" text-anchor="' + anchor + '">' + ROM[s.n] + (here === s.n ? ' · ΕΔΩ' : '') + '</text>';
    if (!(opt.strip && w < 620)) h += '<text class="nm" x="' + tx + '" y="' + y2 + '" text-anchor="' + anchor + '">' + esc(s.short) + '</text>';
    if (gaps && gaps[s.n]) {
      h += '<circle class="gapdot" cx="' + (p[0] + 12) + '" cy="' + (p[1] - 12) + '" r="4"/>';
      h += '<text class="gapn" x="' + (p[0] + 19) + '" y="' + (p[1] - 16) + '">' + gaps[s.n] + '</text>';
    }
    h += '</a>';
  });
  h += '</svg>';
  box.innerHTML = h;
  box.classList.remove('drawn');
  [].forEach.call(box.querySelectorAll('.edge'), function (e) {
    var L = 400; try { L = Math.ceil(e.getTotalLength()) + 2; } catch (x) {}
    e.style.setProperty('--len', L);
  });
  requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add('drawn'); }); });
  setTimeout(function () { box.classList.add('drawn'); }, 900);   /* δίχτυ (σταθ. 39) */
}

/* ── εξώφυλλο ───────────────────────────────────────────────────────── */
/* ⭐ Η ΣΦΡΑΓΙΔΑ: μονόγραμμα + επιγραφή σε κύκλο (σαν νόμισμα) + μία κουκκίδα ανά σταθμό,
   που ανάβει όταν τον διαβάσεις. Από το json (cover.seal) — κάθε κεφάλαιο τη δική του. */
function sealSVG() {
  /* ⭐ με `img` (προτομή-χαρακτικό, κοινό κτήμα) η εικόνα γεμίζει τον κύκλο και οι κουκκίδες κάθονται στο χείλος·
     χωρίς `img` μένει το μονόγραμμα + η επιγραφή (`mark`/`ring`). */
  var sl = D.cover.seal, R = sl.img ? 91 : 70, h = (sl.img ? '<img src="' + esc(sl.img) + '" alt="" decoding="async">' : '') +
    '<svg viewBox="0 0 200 200" aria-hidden="true">' +
    '<circle class="rim" cx="100" cy="100" r="97"/>' + (sl.img ? '' : '<circle class="rim2" cx="100" cy="100" r="70"/>' +
    '<path id="sealPath" fill="none" d="M100 18a82 82 0 1 1 -0.01 0"/>' +
    '<text class="ring"><textPath href="#sealPath" textLength="505" lengthAdjust="spacing">' + esc(sl.ring) + '</textPath></text>' +
    '<text class="mark" x="100" y="131" text-anchor="middle">' + esc(sl.mark) + '</text>');
  ST.forEach(function (st, i) {
    var t = -Math.PI / 2 + i * 2 * Math.PI / N, x = 100 + R * Math.cos(t), y = 100 + R * Math.sin(t);
    h += '<circle class="pip' + (S.read[st.n] ? ' lit' : '') + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.6"/>';
  });
  return h + '</svg>';
}
function renderCover() {
  $('crumbs').textContent = 'MÉTRON · Αρχαία · Εισαγωγή · ' + D.route;
  var c = D.cover;
  $('cover').innerHTML = '<div class="seal" id="seal" role="img" aria-label="' + esc(D.cover.seal.label) + '">' + sealSVG() + '</div>' +
    '<div><span class="lbl">' + esc(c.kicker) + '</span><h1>' + esc(D.title) + '</h1>' +
    '<p class="sub">' + md(c.sub.t) + '</p>' +
    '<div class="motto" lang="grc">' + esc(c.motto.gr) + '<small lang="el">' + esc(c.motto.tr) + '</small></div></div>';
}

/* ── τα σχέδια ──────────────────────────────────────────────────────── */
var DG = {
  flow: function (g) {
    return '<div class="flow">' + g.nodes.map(function (n, i) {
      return (i ? '<span class="cn grow" style="animation-delay:' + (i * .35) + 's"></span>' : '') +
        '<div class="nd fade" style="animation-delay:' + (i * .35) + 's"><i></i><div class="big">' + md(n.t) + '</div>' + (n.sub ? '<div class="sm">' + md(n.sub.t) + '</div>' : '') + '</div>';
    }).join('') + '</div>';
  },
  repeat: function (g) {
    return '<div class="rep"><div class="top"><span class="cap">Το ερώτημα</span><div class="big">' + md(g.top.t) + '</div></div>' +
      '<div class="stops">' + g.stops.map(function (s, i) {
        return '<div class="stop fade" style="animation-delay:' + (.2 + i * .35) + 's"><span class="cap">Στάση ' + (i + 1) + '</span><div class="who">' + md(s.t) + '</div><div class="find">' + md(s.find.t) + '</div></div>';
      }).join('') + '</div>' +
      '<div class="res fade" style="animation-delay:' + (.3 + g.stops.length * .35) + 's"><span class="cap">Το εύρημα</span><div class="big">' + md(g.result.t) + '</div></div>' +
      (g.cost ? '<div class="cost">' + md(g.cost.t) + '</div>' : '') + '</div>';
  },
  split: function (g) {
    var col = function (cls, head, list) {
      return '<div class="' + cls + '"><h4>' + md(head.t) + '</h4><ul>' + list.map(function (x) { return '<li><span>' + md(x.t) + '</span></li>'; }).join('') + '</ul></div>';
    };
    return '<div class="split"><div class="cols">' + col('L', g.lh, g.left) + '<span class="bar growy"></span>' + col('R', g.rh, g.right) + '</div>' +
      '<div class="res fade" style="animation-delay:.6s"><span class="cap">Με αποτέλεσμα</span><div class="big">' + md(g.result.t) + '</div></div></div>';
  },
  fork: function (g) {
    return '<div class="fork"><div class="root"><span class="cap">Κοινό σημείο</span><div class="big">' + md(g.root.t) + '</div></div>' +
      '<svg viewBox="0 0 400 46" preserveAspectRatio="none" aria-hidden="true"><path d="M200 0V16H100V46"/><path class="r" d="M200 16H300V46"/></svg>' +
      '<div class="heads"><div><div class="big">' + md(g.lh.t) + '</div></div><div><div class="big">' + md(g.rh.t) + '</div></div></div>' +
      g.rows.map(function (r, i) { return '<div class="row fade" style="animation-delay:' + (.15 + i * .12) + 's"><div>' + md(r.l.t) + '</div><div>' + md(r.r.t) + '</div></div>'; }).join('') + '</div>';
  },
  dialogue: function (g) {
    var h = '<div class="dlg"><div class="lanes"><span class="cap">Ο συνομιλητής</span><span class="cap">Ο Σωκράτης</span>';
    g.steps.forEach(function (s, i) {
      (g.phases || []).forEach(function (p) { if (p.from === i) h += '<div class="ph cap">' + esc(plain(p.t)) + '</div>'; });
      h += '<div class="bub ' + (/Σωκράτης/.test(s.w) ? 'S' : 'C') + ' fade" style="animation-delay:' + (i * .22) + 's">' + md(s.t) + '</div>';
    });
    return h + '<div class="res fade" style="animation-delay:' + (g.steps.length * .22) + 's"><span class="cap">Εκεί καταλήγει</span><div class="big">' + md(g.result.t) + '</div></div></div></div>';
  },
  descent: function (g) {
    var stars = '';
    [[30, 14], [80, 30], [140, 10], [205, 24], [260, 8], [318, 28], [372, 14]].forEach(function (p, i) { stars += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i % 3 ? 1.3 : 2) + '"/>'; });
    return '<div class="desc"><div class="sky"><svg viewBox="0 0 400 40" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + stars + '</svg>' +
      '<span class="cap">Πριν</span><div class="big">' + md(g.top.t) + '</div><div class="sm">' + md(g.topNote.t) + '</div><span class="gk">' + md(g.topGr.t) + '</span></div>' +
      '<div class="arrow growy" aria-hidden="true"></div>' +
      '<div class="earth fade" style="animation-delay:.5s"><span class="cap">Με τον Σωκράτη</span><div class="big amb">' + md(g.bottom.t) + '</div><span class="gk">' + md(g.bottomGr.t) + '</span></div></div>';
  },
  ladder: function (g) {
    return '<div class="lad"><span class="rise">' + md(g.rise.t) + '</span><span class="cap">Ένα σκαλί τη φορά</span>' +
      '<div class="steps">' + g.steps.map(function (s) { return '<div class="stp"><div class="big">' + md(s.t) + '</div><div class="sm">' + md(s.sub.t) + '</div></div>'; }).join('') + '</div>' +
      '<div class="caps"><span class="cap">' + esc(plain(g.lo.t)) + '</span><span class="cap">' + esc(plain(g.hi.t)) + '</span></div></div>';
  },
  scales: function (g) {
    var sv = '<svg viewBox="0 0 120 54" aria-hidden="true"><line class="beam" x1="14" y1="16" x2="106" y2="16"/><path d="M60 16L52 50H68Z"/><path d="M14 16L6 34H22ZM106 16L98 34H114Z"/><circle class="pv" cx="60" cy="16" r="2.6"/></svg>';
    return '<div class="scl"><div class="grid">' + g.pairs.map(function (p, i) {
      return '<div class="pair fade" style="animation-delay:' + (i * .1) + 's"><span class="no">' + (i + 1) + '</span>' + sv + '<div class="w"><span>' + esc(p.l) + '</span><span>' + esc(p.r) + '</span></div></div>';
    }).join('') + '</div><div class="thread fade" style="animation-delay:.7s"><i></i><div class="big">' + md(g.thread.t) + '</div></div></div>';
  }
};
function diagram(g) {
  var f = DG[g.type];
  if (!f) return '<div class="dg"><p class="sm">Λείπει ο σχεδιαστής «' + esc(g.type) + '» από το καλούπι.</p></div>';
  return '<figure class="dg dg-' + g.type + '" aria-label="Σχέδιο του σταθμού">' + f(g) + '</figure>';
}

/* ── σταθμός ────────────────────────────────────────────────────────── */
function stationHTML(s) {
  var i = s.n - 1, prev = ST[i - 1], next = ST[i + 1], read = !!S.read[s.n];
  var h = '<section class="st" id="st' + s.n + '" aria-labelledby="sth' + s.n + '"><div class="st-main enter">';
  h += '<div class="num" aria-hidden="true">' + ROM[s.n] + '</div>';
  h += '<span class="lbl">' + esc(stName(s.n) + ' · ' + s.label) + '</span>';
  h += '<h2 id="sth' + s.n + '">' + md(s.title) + '</h2>';
  if (s.mine) h += '<p class="mine"><span class="lbl">Στο χαρτί σου</span>«' + esc(s.mine) + '»</p>';
  h += '<div class="prose">' + (s.prose || []).map(function (p) { return '<p>' + md(p.t) + '</p>'; }).join('') + '</div>';
  if (s.quote) {
    var q = s.quote.t + (s.quote.close ? '»' : '');
    h += '<figure class="quote">' + (s.quote.lead ? '<span class="lbl">' + esc(s.quote.lead) + '</span>' : '') +
      '<blockquote>' + (s.quote.close ? '«' : '') + md(q) + '</blockquote><cite>' + md(s.quote.cite) + '</cite></figure>';
  }
  h += diagram(s.diagram);
  h += '<ul class="keys">' + (s.points || []).map(function (p) { return '<li><span>' + md(p.t) + '</span></li>'; }).join('') + '</ul>';
  h += '<div class="done">';
  if (read) h += '<span class="ok">Διαβάστηκε. Ο σταθμός φωτίζει στον χάρτη.</span><button type="button" class="btn ghost small" data-unread="' + s.n + '">Δεν το διάβασα ακόμα</button>';
  else h += '<button type="button" class="btn pri" data-read="' + s.n + '">Το διάβασα</button>';
  if (read) h += next ? '<a class="next" href="#s' + next.n + '">' + esc(ROM[next.n] + ' · ' + next.short) + ' →</a>' : '<a class="next" href="#fin">Το τέλος του κεφαλαίου →</a>';
  h += '</div></div>';
  h += '<aside><div class="card"><span class="lbl">Οι όροι του σταθμού</span><h3>Λεξιλόγιο</h3><div class="gloss">';
  h += (s.gloss || []).map(function (g) {
    return '<div><div class="gk">' + md(g.k) + '</div><div class="gl">' + md(g.d) + (g.mine ? '<span class="lbl yours">δική σου σημείωση</span>' : '') + '</div></div>';
  }).join('') + '</div>';
  if (s.mnem) h += '<div class="mnem"><span class="lbl">Για να το θυμάσαι</span><div class="k">' + esc(s.mnem.k) + '</div><p>' + md(s.mnem.t) + '</p></div>';
  h += '<nav class="pager" aria-label="Σταθμοί">' + (prev ? '<a href="#s' + prev.n + '">← ' + esc(ROM[prev.n] + ' ' + prev.short) + '</a>' : '<span></span>') +
    (next ? '<a class="r" href="#s' + next.n + '">' + esc(ROM[next.n] + ' ' + next.short) + ' →</a>' : '<a class="r" href="#fin">Τέλος →</a>') + '</nav>';
  h += '</div></aside></section>';
  return h;
}
function finHTML() {
  return '<section class="fin" id="stfin"><span class="lbl">Τέλος του κεφαλαίου</span><p class="line">' + esc(D.fin.line) + '</p>' +
    '<div class="mapbox" id="mapFin"></div><p>' + esc(D.fin.next) + '</p>' +
    '<button type="button" class="btn pri" data-go="check">Πήγαινε στον Έλεγχο</button></section>';
}

/* ── ο έλεγχος ──────────────────────────────────────────────────────── */
var C = D.check, mode = 'rc', rcOrder = C.recall.map(function (_, i) { return i; }), rcAt = 0, rcShown = false;
function gapList() {
  var out = [];
  C.recall.forEach(function (c) { if (S.rc[c.id] === 0) out.push({ id: c.id, k: 'rc', s: c.s, tx: c.q, kind: 'Ανάκληση · όχι ακόμα' }); });
  C.tf.forEach(function (c) { if (typeof S.tf[c.id] === 'boolean' && S.tf[c.id] !== c.ok) out.push({ id: c.id, k: 'tf', s: c.s, tx: c.t, kind: 'Σωστό ή λάθος · λάθος απάντηση' }); });
  C.mc.forEach(function (c) { if (typeof S.mc[c.id] === 'number' && S.mc[c.id] !== c.ok) out.push({ id: c.id, k: 'mc', s: c.s, tx: c.q, kind: 'Πολλαπλή επιλογή · λάθος απάντηση' }); });
  return out;
}
function answered() {
  var n = 0, k;
  for (k in S.rc) n++; for (k in S.tf) n++; for (k in S.mc) n++;
  return n;
}
function headCheck() {
  var r = 0, k; for (k in S.read) if (S.read[k]) r++;
  var g = gapList().length, a = answered();
  $('say').textContent = (r === N ? 'Διάβασες και τους ' + N + ' σταθμούς.' : 'Διάβασες ' + r + ' από τους ' + N + ' σταθμούς.') + ' ' +
    (a === 0 ? 'Δεν έχεις ελέγξει τίποτα ακόμα.' : g === 0 ? 'Κανένα κενό σε όσα έλεγξες.' : (g === 1 ? 'Ένα κενό.' : g + ' κενά.'));
  $('say2').textContent = a === 0 ? 'Ξεκίνα από την Ανάκληση: σκέψου την απάντηση, μετά δες την.' :
    'Έλεγξες ' + a + ' από ' + (C.recall.length + C.tf.length + C.mc.length) + '. Οι κόκκινες τελείες στον χάρτη είναι τα κενά κάθε σταθμού.';
  mapSVG($('map2'), { gaps: true, strip: true });
}
var MODES = [['rc', 'Ανάκληση'], ['tf', 'Σωστό ή λάθος'], ['mc', 'Πολλαπλή επιλογή'], ['gaps', 'Τα κενά μου'], ['glance', 'Με μια ματιά']];
function renderSubnav() {
  /* σταθ. 33: πριν από την πρώτη απάντηση τα κενά ΔΕΝ είναι «0» — δεν έχουν μετρηθεί */
  var cnt = { rc: C.recall.length, tf: C.tf.length, mc: C.mc.length, gaps: answered() ? gapList().length : '', glance: '' };
  $('subnav').innerHTML = MODES.map(function (m) {
    return '<button type="button" role="tab" data-mode="' + m[0] + '" aria-selected="' + (mode === m[0]) + '">' + m[1] + (cnt[m[0]] !== '' ? '<span>' + cnt[m[0]] + '</span>' : '') + '</button>';
  }).join('');
}
function stLink(n) { return '<a href="#s' + n + '">' + esc(ROM[n] + ' · ' + ST[n - 1].short) + ' →</a>'; }
function paneRC() {
  var c = C.recall[rcOrder[rcAt]], v = S.rc[c.id];
  var ticks = '<div class="ticks" aria-hidden="true">' + rcOrder.map(function (ix, j) {
    var x = C.recall[ix], st = S.rc[x.id]; return '<i class="' + (st === 1 ? 'k' : st === 0 ? 'n' : '') + (j === rcAt ? ' here' : '') + '"></i>';
  }).join('') + '</div>';
  var h = '<p class="intro">Μία ερώτηση τη φορά. Σκέψου την απάντηση πριν τη δεις, και πες τίμια αν την ήξερες. Ό,τι δεν ήξερες πάει στα «κενά μου».</p>' + ticks +
    '<div class="bar"><button type="button" class="btn small" data-rc="prev">← Προηγούμενη</button><button type="button" class="btn small" data-rc="next">Επόμενη →</button>' +
    '<button type="button" class="btn small ghost" data-rc="shuf">Ανακάτεψε</button><span class="pos">' + (rcAt + 1) + ' / ' + C.recall.length + '</span></div>';
  h += '<div class="rc"><span class="lbl">' + esc(stName(c.s) + ' · ' + ST[c.s - 1].short) + '</span><p class="q">' + md(c.q) + '</p>';
  if (!rcShown) h += '<p class="think">Σκέψου την απάντηση.</p><div class="row"><button type="button" class="btn pri" data-rc="show">Δείξε την απάντηση</button></div>';
  else {
    h += '<div class="ans">' + md(c.r) + '</div><div class="row">' +
      '<button type="button" class="btn' + (v === 1 ? ' pri' : '') + '" data-rc="yes" aria-pressed="' + (v === 1) + '">Το ήξερα</button>' +
      '<button type="button" class="btn' + (v === 0 ? ' pri' : '') + '" data-rc="no" aria-pressed="' + (v === 0) + '">Όχι ακόμα</button>' +
      '<a class="go" href="#s' + c.s + '">Ξαναδιάβασε τον σταθμό →</a></div>';
  }
  return h + '</div>';
}
function scoreOf(list, ans) {
  var a = 0, ok = 0; list.forEach(function (c) { var v = ans[c.id]; if (v !== undefined) { a++; if (v === c.ok) ok++; } });
  return { a: a, ok: ok };
}
function scoreHTML(sc, total, k) {
  return '<div class="score">' + (sc.a ? '<span class="n">' + sc.ok + '<small> σωστές από ' + sc.a + '</small></span>' : '<span class="intro" style="margin:0">Καμία απάντηση ακόμα · ' + total + ' ερωτήσεις.</span>') +
    (sc.a ? '<button type="button" class="btn small ghost" data-reset="' + k + '">Ξανά από την αρχή</button>' : '') + '</div>';
}
function exHTML(okv, why, s) {
  return '<div class="ex"><span class="v ' + (okv ? 'ok' : 'no') + '">' + (okv ? 'Σωστά' : 'Όχι') + '</span>' + md(why) + ' <a href="#s' + s + '">' + esc(ROM[s]) + ' →</a></div>';
}
function paneTF() {
  var h = '<p class="intro">Όπως στις Πανελλήνιες: γράψε Σ ή Λ για κάθε πρόταση. Οι προτάσεις έχουν τις παγίδες του κεφαλαίου.</p>' + scoreHTML(scoreOf(C.tf, S.tf), C.tf.length, 'tf') + '<div class="qs">';
  C.tf.forEach(function (c, i) {
    var v = S.tf[c.id], done = typeof v === 'boolean';
    h += '<div class="qi"><span class="lbl">' + (i + 1) + ' · ' + esc(ROM[c.s]) + '</span><p class="qt">' + md(c.t) + '</p><div class="tfrow">' +
      [true, false].map(function (b) {
        var cls = done ? (b === c.ok ? ' ok' : (b === v ? ' no' : '')) : '';
        return '<button type="button" class="opt' + cls + '" data-tf="' + c.id + '" data-v="' + b + '"' + (done ? ' disabled' : '') + '>' + (b ? 'Σωστό' : 'Λάθος') + '</button>';
      }).join('') + '</div>' + (done ? exHTML(v === c.ok, c.why, c.s) : '') + '</div>';
  });
  return h + '</div>';
}
function paneMC() {
  var h = '<p class="intro">Μία σωστή σε κάθε ερώτηση. Μετά την απάντηση βλέπεις γιατί, και πού το λέει.</p>' + scoreHTML(scoreOf(C.mc, S.mc), C.mc.length, 'mc') + '<div class="qs">';
  C.mc.forEach(function (c, i) {
    var v = S.mc[c.id], done = typeof v === 'number';
    h += '<div class="qi"><span class="lbl">' + (i + 1) + ' · ' + esc(ROM[c.s]) + '</span><p class="qt">' + md(c.q) + '</p><div class="opts">' +
      c.o.map(function (o, j) {
        var cls = done ? (j === c.ok ? ' ok' : (j === v ? ' no' : '')) : '';
        return '<button type="button" class="opt' + cls + '" data-mc="' + c.id + '" data-v="' + j + '"' + (done ? ' disabled' : '') + '>' + md(o) + '</button>';
      }).join('') + '</div>' + (done ? exHTML(v === c.ok, c.why, c.s) : '') + '</div>';
  });
  return h + '</div>';
}
function paneGaps() {
  var g = gapList();
  if (!answered()) return '<div class="empty">Δεν υπάρχουν κενά ακόμα, γιατί δεν έχεις ελέγξει τίποτα. Ξεκίνα από την <b>Ανάκληση</b>: ό,τι πεις «όχι ακόμα» έρχεται εδώ, με τον σταθμό του.</div>';
  if (!g.length) return '<div class="empty">Κανένα κενό. Ό,τι έλεγξες το ήξερες. Συνέχισε με όσα δεν έχεις ελέγξει ακόμα.</div>';
  var by = {}; g.forEach(function (x) { (by[x.s] = by[x.s] || []).push(x); });
  return '<p class="intro">Μόνο ό,τι δεν ήξερες, ομαδοποιημένο ανά σταθμό. Ένα πάτημα και είσαι εκεί· όταν το μάθεις, πάτα «Το ξέρω πια».</p><div class="gaps">' +
    Object.keys(by).sort(function (a, b) { return a - b; }).map(function (n) {
      return '<div class="gapst"><div class="hd"><span class="lbl">' + esc(stName(+n)) + '</span><span class="big">' + esc(ST[n - 1].short) + '</span>' +
        '<a href="#s' + n + '">Ξαναδιάβασέ τον →</a></div><ul>' + by[n].map(function (x) {
          return '<li><div><span class="kind">' + esc(x.kind) + '</span><span class="tx">' + md(x.tx) + '</span></div>' +
            '<button type="button" class="btn small" data-clear="' + x.k + ':' + x.id + '">Το ξέρω πια</button></li>';
        }).join('') + '</ul></div>';
    }).join('') + '</div>';
}
function paneGlance() {
  var h = '<div class="glance"><p class="intro">Ό,τι αξίζει να ξέρεις απ’ έξω χωρίς να το ψάξεις: οι αριθμοί, οι παγίδες, τα μνημονικά, και η μεγάλη ιδέα αν σου ζητήσουν ανάπτυξη.</p>';
  h += '<div class="nums">' + C.numbers.map(function (x) { return '<div><div class="v">' + esc(x.v) + '</div><div class="l">' + md(x.l) + '</div></div>'; }).join('') + '</div>';
  if (C.numbersNote) h += '<p class="note">' + md(C.numbersNote) + '</p>';
  h += '<h3>Οι παγίδες του κεφαλαίου</h3><ul class="pits">' + C.pitfalls.map(function (p) { return '<li><span>' + md(p.t) + '</span>' + stLink(p.s) + '</li>'; }).join('') + '</ul>';
  h += '<h3>Τα μνημονικά</h3><div class="mlist">' + ST.filter(function (s) { return s.mnem; }).map(function (s) {
    return '<div><div class="k">' + esc(s.mnem.k) + '</div><p>' + md(s.mnem.t) + '</p>' + stLink(s.n) + '</div>';
  }).join('') + '</div>';
  h += '<h3>Η μεγάλη ιδέα</h3><p class="idea">' + md(C.idea.t) + '</p></div>';
  return h;
}
function renderPane() {
  renderSubnav();
  $('pane').innerHTML = mode === 'rc' ? paneRC() : mode === 'tf' ? paneTF() : mode === 'mc' ? paneMC() : mode === 'gaps' ? paneGaps() : paneGlance();
}
function renderCheck() {
  headCheck(); renderPane();
}

/* ── δρομολόγηση: #s3 · #fin · #elegxos ─────────────────────────────── */
var view = 'read', cur = 1;
function route(fromHash) {
  var hsh = (location.hash || '').slice(1), m = /^s(\d+)$/.exec(hsh);
  if (hsh === 'elegxos') view = 'check';
  else if (m && +m[1] >= 1 && +m[1] <= N) { view = 'read'; cur = +m[1]; }
  else if (hsh === 'fin') { view = 'read'; cur = 'fin'; }
  else { view = 'read'; cur = (S.at >= 1 && S.at <= N) ? S.at : 1; }
  paint(fromHash);
}
function paint(scroll) {
  var rd = view === 'read';
  if ($('seal')) [].forEach.call($('seal').querySelectorAll('.pip'), function (c, i) { c.classList.toggle('lit', !!S.read[ST[i].n]); });
  $('vRead').hidden = !rd; $('vCheck').hidden = rd;
  $('tabRead').setAttribute('aria-selected', rd); $('tabCheck').setAttribute('aria-selected', !rd);
  if (rd) {
    if (typeof cur === 'number' && S.at !== cur) { S.at = cur; save(); }
    mapSVG($('map'), { here: cur, strip: RET });
    $('stage').innerHTML = cur === 'fin' ? finHTML() : stationHTML(ST[cur - 1]);
    if (cur === 'fin') mapSVG($('mapFin'), { all: true });
    if (scroll) { var t = $(cur === 'fin' ? 'stfin' : 'st' + cur); if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
  } else { renderCheck(); if (scroll) window.scrollTo(0, 0); }
  justRead = 0;
}
function go(h) { if (location.hash === '#' + h) route(true); else location.hash = h; }

document.addEventListener('click', function (e) {
  var t = e.target.closest('button,[data-mode]'); if (!t) return;
  var ds = t.dataset;
  if (t.id === 'tabRead') return go(typeof cur === 'number' ? 's' + cur : cur === 'fin' ? 'fin' : 's1');
  if (t.id === 'tabCheck' || ds.go === 'check') return go('elegxos');
  if (ds.read) { S.read[ds.read] = Date.now(); save(); justRead = +ds.read; paint(false); var b = document.querySelector('.done .next'); if (b) b.focus({ preventScroll: true }); return; }
  if (ds.unread) { delete S.read[ds.unread]; save(); paint(false); return; }
  if (ds.mode) { mode = ds.mode; rcShown = false; renderPane(); return; }
  if (ds.rc) {
    var c = C.recall[rcOrder[rcAt]];
    if (ds.rc === 'show') rcShown = true;
    else if (ds.rc === 'yes' || ds.rc === 'no') { S.rc[c.id] = ds.rc === 'yes' ? 1 : 0; save(); rcAt = (rcAt + 1) % rcOrder.length; rcShown = false; headCheck(); }
    else if (ds.rc === 'next') { rcAt = (rcAt + 1) % rcOrder.length; rcShown = false; }
    else if (ds.rc === 'prev') { rcAt = (rcAt - 1 + rcOrder.length) % rcOrder.length; rcShown = false; }
    else if (ds.rc === 'shuf') { for (var i = rcOrder.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = rcOrder[i]; rcOrder[i] = rcOrder[j]; rcOrder[j] = x; } rcAt = 0; rcShown = false; }
    renderPane(); return;
  }
  if (ds.tf) { S.tf[ds.tf] = ds.v === 'true'; save(); headCheck(); renderPane(); return; }
  if (ds.mc) { S.mc[ds.mc] = +ds.v; save(); headCheck(); renderPane(); return; }
  if (ds.reset) { S[ds.reset] = {}; save(); headCheck(); renderPane(); return; }
  if (ds.clear) {
    var p = ds.clear.split(':');
    if (p[0] === 'rc') S.rc[p[1]] = 1; else delete S[p[0]][p[1]];
    save(); headCheck(); renderPane(); return;
  }
});
document.addEventListener('keydown', function (e) {
  if (view !== 'read' || e.altKey || e.metaKey || e.ctrlKey) return;
  if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target || {}).tagName || '')) return;
  var n = cur === 'fin' ? N + 1 : cur;
  if (e.key === 'ArrowRight' && n <= N) go(n === N ? 'fin' : 's' + (n + 1));
  if (e.key === 'ArrowLeft' && n > 1) go('s' + (n - 1));
});
window.addEventListener('hashchange', function () { route(true); });
/* Ο χάρτης αλλάζει σχήμα κάτω από 620px — ξαναζωγραφίζεται ΜΟΝΟ όταν αλλάξει
   το ΠΛΑΤΟΣ. Στο iPhone η μπάρα διευθύνσεων αλλάζει το ύψος σε κάθε κύλιση. */
var rw = 0, lastW = window.innerWidth;
window.addEventListener('resize', function () {
  if (window.innerWidth === lastW) return;
  lastW = window.innerWidth; clearTimeout(rw);
  rw = setTimeout(function () { mapSVG($('map'), { here: cur, strip: RET }); if ($('mapFin')) mapSVG($('mapFin'), { all: true }); if (view === 'check') mapSVG($('map2'), { gaps: true, strip: true }); }, 180);
});

renderCover();
banner();
route(false);
})();
</script>
</body>
</html>
