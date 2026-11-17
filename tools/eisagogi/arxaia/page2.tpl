<!DOCTYPE html>
<html lang="el">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#1A2030">
<title>@@TITLE@@ · Εισαγωγή Αρχαίων</title>
<!-- ⛔ ΠΑΡΑΓΕΤΑΙ: node tools/eisagogi/arxaia/build.js @@NAME@@ --v2 — μην τη γράψεις με το χέρι.
     Το κεφάλαιο ζει στο tools/eisagogi/arxaia/@@NAME@@.json· το καλούπι εδώ (page2.tpl). -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Commissioner:wght@400;500;600;700&family=GFS+Didot&family=Geologica:wght@500;600&display=swap">
<style>
/* ══ ΕΙΣΑΓΩΓΗ ΑΡΧΑΙΩΝ v2 — «το μπλε του Β» (μακέτες skini-dromos + pinakes, 16/11/26) ══
   Μία συνεχής σελίδα-ιστορία: πρώτα το σχέδιο, μετά το κείμενο με τα ίδια νούμερα.
   Δική του εντολή (16/11): ΚΑΝΕΝΑ «Το διάβασα», ΚΑΜΙΑ υπενθύμιση — μόνο διάβασμα.
   ⛔ Κανένα min-width: το λάπτοπ γράφεται πρώτο, μαζεύει με max-width (900 · 640).
   ⛔ Κανένα «πηγή», κανένας βαθμός· ο έλεγχος αλήθειας ζει στα scripts. */
:root{color-scheme:dark;
  --bg:#1A2030;--surf:#232B3D;--line:#313A4F;--line2:#445068;
  --ink:#EDE7DA;--dim:#CBC4B5;--faint:#8E95A6;
  --acc:#F2B35B;--hl:rgba(255,222,89,.30);--red:#F28B78;--grn:#6FD1AE;
  --t1:#F2C063;--t2:#F28B78;--t3:#6FD1AE;--tb:.13;
  --title:"Geologica","Commissioner",sans-serif;--ui:"Commissioner",system-ui,-apple-system,sans-serif;--gr:"GFS Didot",serif}
[hidden]{display:none!important}
*{box-sizing:border-box;margin:0;padding:0}
html{background:var(--bg);scroll-padding-top:76px}
body{background:var(--bg);color:var(--ink);font-family:var(--ui);line-height:1.5;-webkit-font-smoothing:antialiased}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
a{color:inherit}
:focus-visible{outline:2px solid var(--acc);outline-offset:3px;border-radius:6px}
h1,h2,h3{font-family:var(--title);font-weight:600;letter-spacing:-.01em}
.gr{font-family:var(--gr)}
.lbl{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}

/* ── η μπάρα: πίσω + τρεις καρτέλες ── */
.top{position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--bg) 94%,transparent);border-bottom:1px solid var(--line);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)}
.top .in{max-width:1120px;margin:0 auto;padding:0 32px;display:flex;align-items:center;gap:18px;min-height:60px}
.back{display:inline-flex;align-items:center;min-height:44px;font-size:14px;font-weight:600;color:var(--dim);text-decoration:none;white-space:nowrap}
.tabs{display:flex;gap:4px;margin-left:auto}
.tabs button{min-height:44px;padding:0 16px;border-radius:999px;font-size:14.5px;font-weight:600;color:var(--dim);border:1px solid transparent}
.tabs button[aria-selected="true"]{color:var(--ink);border-color:var(--line2);background:var(--surf)}
.banner{max-width:1056px;margin:14px auto 0;padding:12px 16px;border:1px solid color-mix(in srgb,var(--red) 55%,transparent);border-radius:12px;font-size:15px;color:var(--ink)}

.shell{max-width:1120px;margin:0 auto;padding:0 32px 120px}

/* ── εξώφυλλο + ο δρόμος ── */
.cover{padding:52px 0 0}
.cover .eye{font-size:13.5px;color:var(--dim)}
h1{font-size:60px;line-height:1.04;margin:6px 0 8px}
.motto{font-family:var(--gr);font-size:24px;color:var(--acc)}
.road{margin-top:40px;padding:22px 0 30px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.rd{display:block;width:100%;height:auto;overflow:visible;margin-top:6px}
.rd .band{fill:none;stroke:var(--surf);stroke-width:30;stroke-linecap:round}
.rd .dash{fill:none;stroke:var(--faint);stroke-width:1.5;stroke-dasharray:8 10;opacity:.5}
.rd .chev{fill:none;stroke:var(--faint);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.rd text{font-family:var(--ui);text-anchor:middle}
.rd .g{font-size:12px;font-weight:700;letter-spacing:.08em;fill:var(--acc);text-anchor:start}
.rd .g.e,.rd .cap.e{text-anchor:end}
.rd .cap{font-size:10.5px;font-weight:700;letter-spacing:.1em;fill:var(--faint);text-anchor:start}
.rd a{cursor:pointer}
.rd a:focus-visible{outline:none}.rd a:focus-visible circle,.rd a:hover circle{stroke:var(--acc);stroke-width:3}
.rd circle{fill:var(--bg);stroke:var(--faint);stroke-width:2}
.rd .hit{fill:transparent;stroke:none}
.rd .no{font-size:12px;font-weight:700;fill:var(--dim)}
.rd .nm{font-size:14.5px;font-weight:600;fill:var(--ink)}
.acts{display:none;grid-template-columns:minmax(0,1fr);gap:22px;margin-top:16px}
.act small{font-size:12px;font-weight:700;letter-spacing:.08em;color:var(--acc)}
.act h3{font-size:23px;line-height:1.15;margin:4px 0 14px;text-wrap:balance}
.act a{display:grid;grid-template-columns:26px minmax(0,1fr);gap:10px;align-items:baseline;padding:10px;border-top:1px solid var(--line);text-decoration:none;min-height:44px}
.act a i{font-style:normal;font-size:12.5px;font-weight:700;color:var(--faint);font-variant-numeric:tabular-nums}
.act a b{display:block;font-size:15px;font-weight:600;color:var(--ink)}
.act a span{display:block;font-size:13.5px;color:var(--dim);line-height:1.35}

/* ── στάση: πρώτα το σχέδιο, μετά το κείμενο ── */
.sec{padding-top:72px;scroll-margin-top:-24px}
.sec .lbl b{color:var(--acc)}
h2{font-size:40px;line-height:1.1;margin:8px 0 22px;text-wrap:balance}
.fig{background:var(--surf);border:1px solid var(--line);border-radius:18px;padding:20px 22px 16px;margin:0}
.fig figcaption{font-size:13.5px;font-weight:600;color:var(--dim);margin-bottom:12px}
.scene{padding:18px 20px 10px}
.scene svg{display:block;width:100%;height:auto;overflow:visible;cursor:pointer}
.scene .ln{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.scene .thin{stroke-width:1.4;opacity:.6}
.scene .back{fill:none;stroke:var(--red);stroke-width:1.8;stroke-dasharray:4 6;stroke-linecap:round}
.scene use{fill:none;stroke:var(--ink);stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.scene use.hl{stroke:var(--acc)}
.scene .sun{fill:var(--acc);stroke:none}
.scene .shade{fill:var(--faint);opacity:.45;stroke:none}
.scene text{font-family:var(--ui);font-size:14px;fill:var(--dim)}
.scene text.n{font-weight:700;fill:var(--ink);font-size:14.5px}
.scene text.gr{font-family:var(--gr);font-size:19px;fill:var(--acc)}
.scene text.pl{font-size:12px;font-weight:700;letter-spacing:.08em;fill:var(--faint)}
.scene .num{fill:var(--acc)} .scene .numt{fill:#1A1408;font-size:12.5px;font-weight:700;text-anchor:middle}
.legend{display:none;list-style:none;margin-top:10px;border-top:1px solid var(--line)}
.legend li{display:grid;grid-template-columns:28px minmax(0,1fr);gap:8px;padding:9px 0;border-bottom:1px solid var(--line);font-size:15px;color:var(--dim)}
.legend li u,.txt p u{text-decoration:none;display:inline-grid;place-items:center;width:22px;height:22px;border-radius:50%;background:var(--acc);color:#1A1408;font-size:12px;font-weight:700}
.legend li b{color:var(--ink);font-weight:600}
.replay{display:block;margin:6px 0 0 auto;min-height:44px;padding:0 6px;font-size:14px;font-weight:600;color:var(--faint)}
/* κίνηση: η σκηνή ζωγραφίζεται μία φορά όταν φτάσεις, με τη σειρά των νούμερων.
   Ορατή εξ ορισμού (σταθ. 39): κρύβεται μόνο κάτω από html.anim, που το βάζει η JS. */
html.anim .draw .ln,html.anim .draw .back{stroke-dasharray:1;stroke-dashoffset:1}
html.anim .draw .fade{opacity:0}
html.anim .draw.go .ln{animation:d 1.1s cubic-bezier(.16,1,.3,1) forwards;animation-delay:calc(var(--k,0)*.32s)}
html.anim .draw.go .back{stroke-dasharray:.03 .04;animation:d 1.1s cubic-bezier(.16,1,.3,1) forwards;animation-delay:calc(var(--k,0)*.32s)}
html.anim .draw.go .fade{animation:f .5s ease-out forwards;animation-delay:calc(var(--k,0)*.32s + .25s)}
html.anim .draw.done .ln,html.anim .draw.done .back{stroke-dashoffset:0;animation:none}
html.anim .draw.done .back{stroke-dasharray:4 6}
html.anim .draw.done .fade{opacity:1;animation:none}
@keyframes d{to{stroke-dashoffset:0}} @keyframes f{to{opacity:1}}

/* όροφοι (τάξη ↔ τάξη, τάξη → έργο) — ίδιο χρώμα για την ίδια τάξη σε ΟΛΗ τη σελίδα */
.tint1{--t:var(--t1)} .tint2{--t:var(--t2)} .tint3{--t:var(--t3)}
.tint1,.tint2,.tint3{background:color-mix(in srgb,var(--t) calc(var(--tb)*100%),transparent)}
.tiers{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr) 130px;gap:6px 0;max-width:900px}
.tiers.nojoin{grid-template-columns:minmax(0,1fr) auto minmax(0,1.3fr)}
.tiers .h{font-size:12px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--faint);padding:0 16px 6px}
.tiers .c{padding:14px 16px;border-top:2px solid var(--t)}
.tiers .c b{display:block;font-weight:600;font-size:17px;color:var(--ink)}
.tiers .c span{font-size:14.5px;color:var(--dim)}
.tiers .c.d b{font-weight:500;font-size:16px;color:var(--dim)}
.tiers .v{display:flex;align-items:center;justify-content:center;padding:0 14px;font-size:14px;font-weight:600;color:var(--t);border-top:2px solid var(--t);white-space:nowrap}
.tiers .sel{grid-column:4;display:flex;align-items:center;gap:8px;padding:0 0 0 12px;font-size:13.5px;font-weight:600;line-height:1.3;color:var(--acc)}
.tiers .sel i{flex:none;align-self:stretch;width:12px;border:2px solid var(--acc);border-left:0;border-radius:0 8px 8px 0}
.tiers .all{grid-column:1/4;margin-top:8px;font-size:15px;color:var(--dim);padding:12px 16px;border:1px dashed var(--line2);border-radius:10px}
.tiers.nojoin .all{grid-column:1/-1}
.tiers .all b,.tiers .all mark{color:var(--ink)}

/* σκαλιά */
.stairs{display:grid;grid-template-columns:repeat(var(--n,5),minmax(0,1fr));align-items:end;height:350px;margin-top:6px}
.stp{position:relative;height:calc(84px + var(--i)*58px);padding:10px 12px 0;border-top:2px solid var(--ink);border-left:2px solid var(--ink);background:color-mix(in srgb,var(--acc) calc(var(--i)*4.5% + 3%),transparent)}
.stp:first-child{border-left:0}
.stp b{display:block;font-size:15px;font-weight:600;line-height:1.25;color:var(--ink)}
.stp span{display:block;font-size:14px;line-height:1.35;color:var(--dim);margin-top:4px}
.stp.top::before{content:"";position:absolute;left:50%;top:-58px;width:34px;height:34px;margin-left:-17px;border-radius:50%;background:var(--acc);box-shadow:0 0 0 7px color-mix(in srgb,var(--acc) 22%,transparent)}
.rise{margin-top:12px;font-size:14px;font-weight:600;color:var(--acc)}

/* ροή με βέλη: λίγα κουτιά, αιτία → αποτέλεσμα */
.flow{display:flex;align-items:stretch;gap:0}
.flow .nd{flex:1 1 0;min-width:0;padding:14px 16px;border:1px solid var(--line2);border-radius:12px;background:color-mix(in srgb,var(--bg) 40%,transparent)}
.flow .nd b{display:block;font-size:16px;font-weight:600;line-height:1.35;color:var(--ink)}
.flow .nd span{display:block;font-size:14.5px;line-height:1.4;color:var(--dim);margin-top:5px}
.flow .nd.end{border-color:var(--acc)}
.flow .nd.or b + b{margin-top:6px}
.flow .nd.or i{display:block;font-style:normal;font-size:12.5px;font-weight:700;letter-spacing:.08em;color:var(--acc);margin-top:6px}
.flow .ar{flex:none;align-self:center;width:34px;text-align:center;font-size:20px;color:var(--acc)}

/* σύγκριση δύο στηλών */
.cmp{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0 28px}
.cmp .col h3{font-family:var(--ui);font-size:13px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:var(--acc);padding-bottom:8px;border-bottom:2px solid var(--acc)}
.cmp .col.bad h3{color:var(--red);border-color:var(--red)}
.cmp .col p{font-size:16px;line-height:1.45;color:var(--dim);padding:10px 0;border-bottom:1px solid var(--line)}
.cmp .col p b{color:var(--ink);font-weight:600}
.cmp .res{grid-column:1/-1;margin-top:14px;font-size:15.5px;color:var(--ink);padding:12px 16px;border:1px dashed var(--line2);border-radius:10px}

/* κείμενο + στήλη */
.two{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:48px;align-items:start;margin-top:34px}
.two.solo{grid-template-columns:minmax(0,1fr)}
.txt p{font-size:18px;line-height:1.72;color:var(--dim);max-width:64ch;border-radius:8px;transition:background .6s}
.txt p + p{margin-top:14px}
.txt p > b{font-weight:700;color:var(--acc);margin-right:6px}
.txt p u{width:20px;height:20px;margin-right:8px;vertical-align:2px}
.txt p.flash{background:color-mix(in srgb,var(--acc) 14%,transparent)}
.txt i.gr,.side i.gr,.ck i.gr,.ol i.gr{font-style:italic;color:var(--acc)}
mark{color:var(--ink);background:linear-gradient(180deg,transparent 54%,var(--hl) 54%,var(--hl) 95%,transparent 95%);padding:0 2px}
.side > * + *{margin-top:26px}
.trap{padding:16px 18px;border-radius:14px;border:1px solid color-mix(in srgb,var(--red) 55%,transparent)}
.trap + .trap{margin-top:12px}
.trap small{display:block;font-size:12px;font-weight:700;letter-spacing:.08em;color:var(--red);margin-bottom:6px}
.trap s{font-size:16px;color:var(--dim);text-decoration-color:var(--red)}
.trap p{font-size:16px;margin-top:4px;color:var(--ink)}.trap p b{font-size:12.5px;margin-right:6px;color:var(--red)}
.trap a{display:inline-flex;align-items:center;min-height:44px;margin-bottom:-12px;font-size:13.5px;font-weight:600;color:var(--faint);text-decoration:none}
.sym{margin-top:10px;border-top:1px solid var(--line)}
.sym div{display:grid;grid-template-columns:minmax(0,.9fr) auto minmax(0,1.3fr);gap:10px;padding:11px 0;border-bottom:1px solid var(--line);font-size:15px;color:var(--dim)}
.sym div b{color:var(--ink);font-weight:600}.sym div i{font-style:normal;color:var(--acc)}
.gl{margin-top:10px}
.gl div{padding:9px 0;border-bottom:1px solid var(--line);font-size:15px;color:var(--dim)}
.gl div b{display:block;color:var(--ink);font-weight:600}
.mn .k{display:block;font-family:var(--title);font-weight:600;font-size:16px;color:var(--acc);margin-top:6px;letter-spacing:.02em}
.mn p{font-size:15.5px;color:var(--dim);margin-top:4px}
.bridge{font-style:italic;font-size:17.5px;color:var(--faint);margin-top:40px;max-width:60ch}

/* τέλος της σελίδας: πέντε λεπτά πριν το διαγώνισμα */
.rev{padding-top:96px;scroll-margin-top:-24px}
.rev h2{margin-bottom:8px}
.rev .lead{font-size:16px;color:var(--dim);max-width:62ch;margin-bottom:22px}
.rev .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.rev .grid .trap + .trap{margin-top:0}
.rev .tbl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px 48px}
.rev .tbl > div .lbl{display:block}
.fin{margin-top:72px;padding-top:28px;border-top:1px solid var(--line);font-size:16px;color:var(--dim)}
.fin button{min-height:44px;padding:0 20px;margin-top:12px;border-radius:999px;background:var(--acc);color:#1A1408;font-size:15px;font-weight:600}

/* ── σχεδιάγραμμα ── */
.ol{padding-top:52px;max-width:820px}
.ol .hd{display:flex;align-items:end;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:26px}
.ol .hd p{font-size:16px;color:var(--dim);max-width:52ch;margin-top:6px}
.ol .tg{min-height:44px;padding:0 16px;border-radius:999px;border:1px solid var(--line2);font-size:14.5px;font-weight:600;color:var(--dim)}
.ol .tg[aria-pressed="true"]{background:var(--surf);color:var(--ink)}
.ol ol{list-style:none}
.ol .l1 > li{padding:18px 0;border-top:1px solid var(--line)}
.ol .l1 > li > a{display:flex;gap:12px;align-items:baseline;min-height:44px;text-decoration:none;font-family:var(--title);font-weight:600;font-size:22px;color:var(--ink)}
.ol .l1 > li > a i{font-style:normal;color:var(--acc);min-width:24px}
.ol .l2{margin:4px 0 0 36px}
.ol .l2 > li > a{display:flex;gap:10px;align-items:baseline;min-height:44px;padding:6px 0;text-decoration:none;font-size:17px;font-weight:600;color:var(--ink)}
.ol .l2 > li > a i{font-style:normal;color:var(--faint);min-width:20px;font-weight:700}
.ol .l3{margin:0 0 6px 30px}
.ol .l3 li{display:flex;gap:10px;font-size:16px;line-height:1.5;color:var(--dim);padding:3px 0}
.ol .l3 li i{font-style:normal;color:var(--faint);min-width:20px}
.ol.bare .l3{display:none}

/* ── ο έλεγχος ── */
.ck{padding-top:44px}
.ck .say{font-size:19px;color:var(--ink);max-width:62ch}
.ck .say2{font-size:15.5px;color:var(--dim);margin-top:4px;max-width:62ch}
.ck-nav{display:flex;flex-wrap:wrap;gap:6px;margin:24px 0 26px;padding-bottom:14px;border-bottom:1px solid var(--line)}
.ck-nav button{min-height:44px;padding:0 15px;border-radius:999px;border:1px solid var(--line);font-size:14.5px;font-weight:600;color:var(--dim)}
.ck-nav button span{margin-left:7px;font-size:12.5px;color:var(--faint)}
.ck-nav button[aria-selected="true"]{border-color:var(--ink);color:var(--ink);background:var(--surf)}
.ck .intro{font-size:15.5px;color:var(--dim);max-width:64ch;margin-bottom:18px}
.ck-bar{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:16px}
.ck-bar .pos{margin-left:auto;font-size:13.5px;color:var(--faint);font-variant-numeric:tabular-nums}
.ck .btn{min-height:44px;padding:0 18px;border-radius:999px;border:1px solid var(--line2);font-size:14.5px;font-weight:600;color:var(--dim)}
.ck .btn.pri{background:var(--acc);border-color:var(--acc);color:#1A1408}
.ck-card{max-width:760px;padding:22px 24px;border:1px solid var(--line);border-radius:16px;background:var(--surf)}
.ck-card .q{font-family:var(--title);font-size:22px;font-weight:600;line-height:1.3;margin:6px 0 14px;color:var(--ink)}
.ck-card .think{font-size:15px;color:var(--faint);margin-bottom:14px}
.ck-card .ans{font-size:17px;line-height:1.65;color:var(--dim);padding:14px 0;border-top:1px solid var(--line)}
.ck-card .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.ck-go{display:inline-flex;align-items:center;min-height:44px;font-size:14px;font-weight:600;color:var(--acc);text-decoration:none}
.ck-qs{display:grid;gap:12px;max-width:820px}
.ck-qi{padding:16px 18px;border:1px solid var(--line);border-radius:14px}
.ck-qi .qt{font-size:17px;line-height:1.55;color:var(--ink);margin:4px 0 12px}
.ck-opts{display:grid;gap:8px}
.ck-tf{display:flex;gap:8px;flex-wrap:wrap}
.ck-opt{min-height:44px;padding:10px 16px;text-align:left;border-radius:10px;border:1px solid var(--line2);font-size:15.5px;color:var(--dim)}
.ck-opt:not([disabled]):hover{border-color:var(--ink);color:var(--ink)}
.ck-opt[disabled]{cursor:default}
.ck-opt.ok{border-color:var(--grn);color:var(--ink);background:color-mix(in srgb,var(--grn) 14%,transparent)}
.ck-opt.no{border-color:var(--red);color:var(--ink);background:color-mix(in srgb,var(--red) 14%,transparent)}
.ck-ex{margin-top:12px;font-size:15.5px;line-height:1.55;color:var(--dim)}
.ck-ex .v{font-weight:700;margin-right:6px}.ck-ex .v.ok{color:var(--grn)}.ck-ex .v.no{color:var(--red)}
.ck-ex a{display:inline-flex;align-items:center;min-height:44px;margin-left:4px;font-weight:600;color:var(--acc);text-decoration:none}
.ck .again{margin-bottom:14px}
.ck-empty{max-width:62ch;padding:18px 20px;border:1px dashed var(--line2);border-radius:14px;font-size:16px;color:var(--dim)}
/* αντιστοίχιση: πατάς ένα αριστερά και ένα δεξιά */
.mt-sets{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:18px}
.mt-sets button{min-height:44px;padding:0 14px;border-radius:10px;border:1px solid var(--line);font-size:14px;font-weight:600;color:var(--dim);text-align:left}
.mt-sets button[aria-pressed="true"]{border-color:var(--ink);color:var(--ink);background:var(--surf)}
.mt{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:10px 18px;max-width:900px}
.mt .colh{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}
.mt .col{display:grid;gap:8px;align-content:start}
.mt button{min-height:48px;padding:10px 14px;text-align:left;border-radius:10px;border:1px solid var(--line2);font-size:15.5px;line-height:1.35;color:var(--ink)}
.mt button.on{border-color:var(--acc);background:color-mix(in srgb,var(--acc) 16%,transparent)}
.mt button[disabled]{cursor:default}
.mt .pr{padding:10px 14px;border-radius:10px;font-size:15.5px;line-height:1.35;border:1px solid var(--grn);background:color-mix(in srgb,var(--grn) 12%,transparent);color:var(--ink)}
.mt .pr.no{border-color:var(--red);background:color-mix(in srgb,var(--red) 12%,transparent)}
.mt .pr b{font-weight:600}.mt .pr span{display:block;font-size:14.5px;color:var(--dim);margin-top:2px}
.mt .pr em{display:block;font-style:normal;font-size:13px;font-weight:700;color:var(--red);margin-top:4px}
.mt-done{margin-top:16px;font-size:16px;color:var(--ink)}
.gp{display:grid;gap:14px;max-width:860px}
.gp .st{padding:16px 18px;border:1px solid var(--line);border-radius:14px}
.gp .st .hd{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 14px;margin-bottom:8px}
.gp .st .hd b{font-family:var(--title);font-size:19px;font-weight:600}
.gp li{display:flex;gap:12px;align-items:center;justify-content:space-between;padding:10px 0;border-top:1px solid var(--line);list-style:none}
.gp li .kind{display:block;font-size:12px;font-weight:700;letter-spacing:.06em;color:var(--red)}
.gp li .tx{font-size:15.5px;color:var(--dim)}
.gl2 .nums{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;max-width:900px}
.gl2 .nums div{padding:12px 14px;border:1px solid var(--line);border-radius:12px}
.gl2 .nums .v{font-family:var(--title);font-size:22px;font-weight:600;color:var(--acc)}
.gl2 .nums .l{font-size:15px;color:var(--dim)}
.gl2 h3{font-size:22px;margin:32px 0 12px}
.gl2 .note{font-size:15px;color:var(--dim);margin-top:10px;max-width:64ch}
.gl2 ul{list-style:none;max-width:820px}
.gl2 li{padding:10px 0;border-top:1px solid var(--line);font-size:16px;color:var(--dim)}
.gl2 li a{display:inline-flex;align-items:center;min-height:44px;margin-left:8px;font-size:14px;font-weight:600;color:var(--acc);text-decoration:none}
.gl2 .idea{font-size:18px;line-height:1.65;color:var(--ink);max-width:64ch}

@media (max-width:900px){
  .two{grid-template-columns:minmax(0,1fr)}
  .rd{display:none}.acts{display:grid}
  .tiers{grid-template-columns:minmax(0,1fr) auto minmax(0,1fr)}
  .tiers .sel{grid-column:1/-1;padding:4px 0 0}.tiers .sel i{display:none}
  .tiers .all{grid-column:1/-1}
  .rev .grid,.rev .tbl{grid-template-columns:minmax(0,1fr)}
}
@media (max-width:640px){
  .top .in{padding:0 12px;gap:6px}.tabs{gap:2px}.tabs button{padding:0 10px;font-size:13.5px}
  .shell{padding:0 16px 90px}h1{font-size:40px}h2{font-size:29px}.txt p{font-size:17px}
  .fig{padding:14px 12px 10px}
  .scene text{display:none}.scene text.numt{display:inline;font-size:30px}.scene .num{r:22px}
  .legend{display:block}
  .tiers,.tiers.nojoin{grid-template-columns:minmax(0,1fr)}
  .tiers .h{display:none}
  .tiers .v{display:none}
  .tiers .c + .v + .c{border-top:0;padding-top:2px}
  .stairs{display:flex;flex-direction:column-reverse;height:auto}
  .stp{height:auto;padding:10px 12px;margin-left:calc(var(--i)*12px);border-left:2px solid var(--ink)!important}
  .stp.top::before{left:auto;right:10px;top:10px;width:22px;height:22px;margin:0}
  .stp.top{padding-right:44px}
  .flow{flex-direction:column}.flow .ar{width:auto;padding:4px 0}.flow .ar::before{content:"↓"}.flow .ar span{display:none}
  .cmp{grid-template-columns:minmax(0,1fr);gap:18px}
  .sym div{grid-template-columns:minmax(0,1fr)}.sym div i{display:none}
  .mt{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px}
  .mt button,.mt .pr{font-size:14.5px;padding:9px 10px}
  .ol .l2{margin-left:14px}.ol .l3{margin-left:16px}
  .gp li{flex-direction:column;align-items:flex-start}
}
@media (max-width:400px){.back span{display:none}}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}html.anim .draw .ln,html.anim .draw .back{stroke-dashoffset:0;animation:none!important}html.anim .draw .back{stroke-dasharray:4 6}html.anim .draw .fade{opacity:1;animation:none!important}.txt p{transition:none}}
</style>
</head>
<body>
<!-- Η ΒΙΒΛΙΟΘΗΚΗ ΤΩΝ ΦΙΓΟΥΡΩΝ: ίδια ανθρωπάκια σε όλες τις εισαγωγές. Πόδια στο y=0, ύψος ~58.
     Η σκηνή κάθε στάσης τα καλεί από το json: { "use": "walk", "x", "y", "hl", "flip", "s" }. -->
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <g id="f-stand"><circle cx="0" cy="-50" r="8"/><path d="M0 -42 V-18 M0 -18 L-8 0 M0 -18 L8 0 M0 -34 L-10 -22 M0 -34 L10 -22"/></g>
  <g id="f-walk"><circle cx="2" cy="-50" r="8"/><path d="M1 -42 L0 -18 M0 -18 L-10 0 M0 -18 L10 -1 M1 -34 L-9 -25 M1 -34 L11 -27"/></g>
  <g id="f-sit"><circle cx="0" cy="-42" r="8"/><path d="M0 -34 V-12 H15 V0 M0 -26 L13 -19"/></g>
  <g id="f-talk"><circle cx="0" cy="-50" r="8"/><path d="M0 -42 V-18 M0 -18 L-8 0 M0 -18 L8 0 M0 -34 L-10 -22 M0 -34 L15 -45"/></g>
  <g id="f-point"><circle cx="0" cy="-50" r="8"/><path d="M0 -42 V-18 M0 -18 L-8 0 M0 -18 L8 0 M0 -34 L-10 -22 M0 -34 L20 -36"/></g>
  <g id="f-raise"><circle cx="0" cy="-50" r="8"/><path d="M0 -42 V-18 M0 -18 L-8 0 M0 -18 L8 0 M0 -34 L-11 -48 M0 -34 L11 -48"/></g>
  <g id="f-climb"><circle cx="2" cy="-50" r="8"/><path d="M1 -42 L0 -18 M0 -18 L-7 0 M0 -18 L11 -14 L11 -2 M1 -34 L-8 -26 M1 -34 L13 -38"/></g>
  <g id="p-temple"><path d="M-40 0 H40 M-36 -6 H36 M-40 -50 L0 -72 L40 -50 Z M-30 -50 V-6 M-10 -50 V-6 M10 -50 V-6 M30 -50 V-6"/></g>
  <g id="p-waves"><path d="M-40 -6 q10 -8 20 0 t20 0 t20 0 t20 0 M-40 6 q10 -8 20 0 t20 0 t20 0 t20 0"/></g>
  <g id="p-ship"><path d="M-28 -10 H28 L20 0 H-20 Z M0 -10 V-50 M0 -48 L22 -16 H0"/></g>
  <g id="p-altar"><path d="M-12 0 V-18 H12 V0 M-16 -18 H16 M0 -22 C-7 -29 -3 -36 0 -42 C3 -36 7 -29 0 -22"/></g>
  <g id="p-house"><path d="M-60 -58 L0 -88 L60 -58 M-50 -58 V0 M50 -58 V0 M-58 0 H58"/></g>
</defs></svg>

<header class="top"><div class="in">
  @@BACK@@
  <nav class="tabs" role="tablist" aria-label="Η εισαγωγή">
    <button type="button" role="tab" id="t-read" aria-controls="v-read" aria-selected="true">Διάβασμα</button>
    <button type="button" role="tab" id="t-sx" aria-controls="v-sx" aria-selected="false">Σχεδιάγραμμα</button>
    <button type="button" role="tab" id="t-ch" aria-controls="v-ch" aria-selected="false">Έλεγχος</button>
  </nav>
</div></header>
<p class="banner" id="banner" role="status" hidden></p>

<main class="shell">
  <section id="v-read" role="tabpanel" aria-labelledby="t-read">
    <header class="cover">
      <p class="eye" id="eye"></p>
      <h1 id="h1"></h1>
      <p class="motto gr" id="motto" lang="grc"></p>
      <div class="road" id="road"></div>
    </header>
    <div id="stops"></div>
    <div id="review"></div>
  </section>
  <section id="v-sx" role="tabpanel" aria-labelledby="t-sx" hidden><div class="ol" id="ol"></div></section>
  <section id="v-ch" role="tabpanel" aria-labelledby="t-ch" hidden>
    <div class="ck">
      <p class="say" id="say"></p><p class="say2" id="say2"></p>
      <div class="ck-nav" id="cknav" role="tablist" aria-label="Τρόποι ελέγχου"></div>
      <div id="pane"></div>
    </div>
  </section>
</main>

<script>
/* ══ Η ΜΗΧΑΝΗ ΤΟΥ ΚΑΛΟΥΠΙΟΥ v2 ══════════════════════════════════════════
   Τα δεδομένα μπαίνουν από το build (ένα json)· κανένα κείμενο κεφαλαίου εδώ.
   Πρόοδος του ΕΛΕΓΧΟΥ μόνο, σε ΕΝΑ κλειδί, σε αυτή τη συσκευή, εκτός sync. Το διάβασμα δεν καταγράφεται.
   Ίδιο σχήμα με το παλιό καλούπι (rc/tf/mc) + `mt` (Αντιστοίχιση): ό,τι είχε απαντήσει εκεί, το βρίσκει εδώ.
   Κάθε εγγραφή ξαναδιαβάζεται· αποθήκη που δεν διαβάζεται ΔΕΝ γράφεται ποτέ από πάνω. */
(function () {
'use strict';
var D = /*@@DATA@@*/null;
const KEY="@@KEY@@";
var K1 = KEY, K2 = K1.replace(/-v1$/, '') + '-v2';   /* K2: μόνο ΑΝΑΓΝΩΣΗ, μία φορά (η προεπισκόπηση της 16/11 έγραφε εκεί την Αντιστοίχιση) */
var ST = D.stations, N = ST.length, BY = {}, C = D.check;
ST.forEach(function (s) { BY[s.n] = s; });
var $ = function (id) { return document.getElementById(id); };
var reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ── αποθήκη ─────────────────────────────────────────────────────────── */
var store = { readable: true, why: '', fail: '' };
function blank1() { return { v: 1, at: 1, read: {}, rc: {}, tf: {}, mc: {}, mt: {} }; }
function load(key, blank, must) {
  var raw;
  try { raw = localStorage.getItem(key); }
  catch (e) { store.readable = false; store.why = 'blocked'; return blank(); }
  if (raw === null) return blank();
  try {
    var o = JSON.parse(raw);
    if (!o || typeof o !== 'object' || Array.isArray(o)) throw new Error('σχήμα');
    var b = blank(), k;
    for (k in o) b[k] = o[k];                        /* τίποτα δεν χάνεται (σταθ. 35) */
    must.forEach(function (x) { if (!b[x] || typeof b[x] !== 'object') throw new Error(x); });
    return b;
  } catch (e) { store.readable = false; store.why = 'corrupt'; return blank(); }
}
var S = load(K1, blank1, ['read', 'rc', 'tf', 'mc', 'mt']);
/* παλιές απαντήσεις Αντιστοίχισης από το K2: αντιγράφονται χωρίς να πατήσουν τίποτα· το K2 δεν γράφεται ποτέ.
   Αν δεν διαβάζεται, απλώς δεν υπάρχει τίποτα να φέρει — οι απαντήσεις του K1 μένουν ανέγγιχτες. */
(function () {
  if (!store.readable) return;
  try { var o = JSON.parse(localStorage.getItem(K2) || 'null'), k; if (o && o.mt && typeof o.mt === 'object') for (k in o.mt) if (S.mt[k] === undefined) S.mt[k] = o.mt[k]; } catch (e) { /* βλ. πάνω */ }
})();
function put(key, obj) {
  var txt = JSON.stringify(obj), back = null;
  try { localStorage.setItem(key, txt); back = localStorage.getItem(key); }
  catch (e) { store.fail = 'full'; return false; }
  if (back !== txt) { store.fail = 'readback'; return false; }
  return true;
}
function save() {
  if (!store.readable) { banner(); return false; }
  var ok = put(K1, S);
  if (ok) store.fail = '';
  banner(); return ok;
}
function banner() {
  var b = $('banner'), msg = '';
  if (!store.readable && store.why === 'corrupt') msg = 'Οι αποθηκευμένες απαντήσεις του Ελέγχου σε αυτή τη συσκευή δεν διαβάζονται σωστά. Για να μη χαθούν, η σελίδα δεν γράφει τίποτα από πάνω τους· ό,τι απαντάς τώρα κρατιέται μόνο όσο είναι ανοιχτή.';
  else if (!store.readable) msg = 'Αυτός ο browser δεν επιτρέπει αποθήκευση. Οι απαντήσεις του Ελέγχου κρατιούνται μόνο όσο είναι ανοιχτή η σελίδα.';
  else if (store.fail) msg = 'Η τελευταία απάντηση δεν αποθηκεύτηκε (ο χώρος της συσκευής μπορεί να είναι γεμάτος). Φαίνεται εδώ, αλλά θα χαθεί στο κλείσιμο.';
  b.textContent = msg; b.hidden = !msg;
}

/* ── κείμενο: *όρος*, **έμφαση** (μαρκαδόρος), κάθε πολυτονική λέξη σε GFS Didot ── */
function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
var POLY = /[ἀ-῿̓̔͂]/;
function md(s) {
  var h = esc(s).replace(/\*\*([^*]+)\*\*/g, '<mark>$1</mark>').replace(/\*([^*]+)\*/g, '<i class="gr">$1</i>');
  return h.split(/(<i class="gr">[\s\S]*?<\/i>|<[^>]+>)/).map(function (part) {
    if (!part || part.charAt(0) === '<') return part;
    return part.replace(/[^\s<>]+/g, function (w) { return POLY.test(w) ? '<span class="gr">' + w + '</span>' : w; });
  }).join('');
}
function plain(s) { return String(s || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1'); }
/* ελληνικά κεφαλαία ΧΩΡΙΣ τόνους (ΣΤΗΜΕΝΟΣ, όχι ΣΤΗΜΈΝΟΣ)· τα διαλυτικά μένουν */
function caps(s) { return String(s).normalize('NFD').replace(/[́̀͂]/g, '').toUpperCase().normalize('NFC'); }
function up1(s) { return s.replace(/^([«(]?)(\p{Ll})/u, function (m, a, b) { return a + b.toUpperCase(); }); }
function stName(n) { return 'Στάση ' + n + ' · ' + BY[n].short; }

/* ── ο δρόμος: μία σειρά ανά ενότητα του βιβλίου, στρίβει στο τέλος ── */
var ROWY = 120, W = 1056;
function roadSVG() {
  var acts = D.acts, R = acts.length, H = 74 + ROWY * (R - 1) + 60;
  var d = '', chev = '', lab = '', stops = '';
  acts.forEach(function (a, i) {
    var y = 74 + ROWY * i, right = i % 2 === 0, last = i === R - 1;
    var xa = right ? (i ? 110 : 40) : 980, xb = right ? (last ? 1016 : 980) : (last ? 40 : 110);
    if (!i) d += 'M' + xa + ' ' + y;
    d += ' H' + xb;
    if (!last) d += right ? ' A60 60 0 0 1 980 ' + (y + ROWY) : ' A60 60 0 0 0 110 ' + (y + ROWY);
    lab += '<text class="g' + (right ? '' : ' e') + '" x="' + (right ? xa : 1016) + '" y="' + (y - 36) + '">' + esc(String.fromCharCode(0x391 + i) + ' · ' + caps(a.q)) + '</text>';
    var m = a.st.length, xs = a.st.map(function (n, j) { return Math.round(xa + (xb - xa) * (j + 0.5) / m); });
    xs.forEach(function (x, j) {
      if (j < m - 1) { var cx = (x + xs[j + 1]) / 2; chev += '<path class="chev" d="M' + (cx - 3 * (right ? 1 : -1)) + ' ' + (y - 5) + ' l' + (right ? 6 : -6) + ' 5 l' + (right ? -6 : 6) + ' 5"/>'; }
      var n = a.st[j], s = BY[n];
      stops += '<a href="#s' + n + '" aria-label="Στάση ' + n + ': ' + esc(s.short) + '">' +
        '<rect class="hit" x="' + (x - 60) + '" y="' + (y - 22) + '" width="120" height="66"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="11"/><text class="no" x="' + x + '" y="' + (y + 4.5) + '">' + n + '</text>' +
        '<text class="nm" x="' + x + '" y="' + (y + 36) + '">' + esc(s.short) + '</text></a>';
    });
    if (last) lab += '<text class="cap' + (right ? ' e' : '') + '" x="' + (right ? 1016 : 40) + '" y="' + (y + 30) + '">ΤΕΛΟΣ</text>';
  });
  lab += '<text class="cap" x="40" y="104">ΑΡΧΗ</text>';
  return '<svg class="rd" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Ο δρόμος της εισαγωγής: ' + N + ' στάσεις σε ' + R + ' ενότητες">' +
    '<path class="band" d="' + d + '"/><path class="dash" d="' + d + '"/>' + chev + lab + stops + '</svg>';
}
var WHEN = ['ΠΡΩΤΑ', 'ΜΕΤΑ', 'ΥΣΤΕΡΑ', 'ΣΤΟ ΤΕΛΟΣ'];
function actsHTML() {
  var R = D.acts.length;
  return '<div class="acts">' + D.acts.map(function (a, i) {
    var w = i === 0 ? WHEN[0] : i === R - 1 ? WHEN[3] : WHEN[Math.min(i, 2)];
    return '<div class="act"><small>' + w + '</small><h3>' + esc(a.q) + '</h3>' + a.st.map(function (n) {
      var s = BY[n];
      return '<a href="#s' + n + '"><i>' + n + '</i><div><b>' + esc(s.short) + '</b><span>' + md(s.title) + '</span></div></a>';
    }).join('') + '</div>';
  }).join('') + '</div>';
}

/* ── τα σχέδια ───────────────────────────────────────────────────────── */
function badge(n, x, y, k) {
  return '<g class="fade" style="--k:' + k + '"><circle class="num" cx="' + x + '" cy="' + y + '" r="10"/><text class="numt" x="' + x + '" y="' + (y + 4.5) + '">' + n + '</text></g>';
}
function cap(f) { return f.cap ? '<figcaption>' + md(f.cap.t) + '</figcaption>' : ''; }
var FIG = {
  /* σκηνή με ανθρωπάκια: draw = γραμμές/φιγούρες/ονόματα τόπων, steps = τα νούμερα (ίδια με το κείμενο) */
  scene: function (f, s) {
    var vb = f.vb || [1040, 400], h = '';
    (f.draw || []).forEach(function (it) {
      var k = it.k || 0, c = it.c ? ' ' + it.c : '';
      if (it.path) h += '<path class="' + (it.c === 'back' ? 'back' : 'ln' + c) + '" pathLength="1" style="--k:' + k + '" d="' + it.path + '"/>';
      else if (it.use || it.prop) {
        var tr = 'translate(' + it.x + ' ' + it.y + ')' + (it.s ? ' scale(' + it.s + ')' : '') + (it.flip ? ' scale(-1 1)' : '');
        h += '<use class="fade' + (it.hl ? ' hl' : '') + '" style="--k:' + k + '" href="#' + (it.use ? 'f-' + it.use : 'p-' + it.prop) + '" transform="' + tr + '"/>';
      } else if (it.shape) h += '<g class="fade" style="--k:' + k + '">' + (it.shape === 'sun' ? '<circle class="sun" cx="' + it.x + '" cy="' + it.y + '" r="' + (it.r || 30) + '"/>' : '<ellipse class="shade" cx="' + it.x + '" cy="' + it.y + '" rx="' + (it.rx || 12) + '" ry="' + (it.ry || 24) + '"/>') + '</g>';
      else if (it.t != null) h += '<text class="fade' + c + '" style="--k:' + k + '" x="' + it.x + '" y="' + it.y + '"' + (it.mid ? ' text-anchor="middle"' : '') + '>' + esc(plain(it.t)) + '</text>';
    });
    (f.steps || []).forEach(function (p) {
      var k = p.k == null ? p.n : p.k;
      h += badge(p.n, p.x, p.y, k);
      h += '<g class="fade" style="--k:' + k + '"><text class="n" x="' + (p.x + 16) + '" y="' + (p.y + 5) + '">' + esc(plain(p.t)) + '</text>' +
        (p.sub ? '<text x="' + (p.x + 16) + '" y="' + (p.y + 23) + '">' + esc(plain(p.sub.t)) + '</text>' : '') + '</g>';
    });
    var leg = '<ol class="legend">' + (f.steps || []).map(function (p) {
      return '<li><u>' + p.n + '</u><span><b>' + md(p.t) + '</b>' + (p.sub ? ' · ' + md(p.sub.t) : '') + '</span></li>';
    }).join('') + '</ol>';
    return '<figure class="fig scene draw" data-scene>' + cap(f) +
      '<svg viewBox="0 0 ' + vb[0] + ' ' + vb[1] + '" role="img" aria-label="' + esc(f.label || plain(s.title)) + '">' + h + '</svg>' + leg +
      '<button type="button" class="replay" data-replay>Ξαναπαίξε τη σκηνή ↺</button></figure>';
  },
  /* όροφοι: ίδια θέση αριστερά και δεξιά· πάνω η ανώτερη */
  tiers: function (f) {
    var J = f.join, h = '<div class="h">' + md(f.lh.t || f.lh) + '</div><div class="h"></div><div class="h">' + md(f.rh.t || f.rh) + '</div>' + (J ? '<div class="h"></div>' : '');
    f.rows.forEach(function (r, i) {
      var t = ' tint' + (r.tier || i + 1);
      h += '<div class="c' + t + '"><b>' + md(r.l.t) + '</b>' + (r.l.s ? '<span>' + md(r.l.s) + '</span>' : '') + '</div>' +
        '<div class="v' + t + '">' + esc(r.v || '↔') + '</div>' +
        '<div class="c' + t + (f.desc ? ' d' : '') + '"><b>' + md(r.r.t) + '</b>' + (r.r.s ? '<span>' + md(r.r.s) + '</span>' : '') + '</div>';
      if (J && J.rows[0] === i + 1) h += '<div class="sel" style="grid-row:' + (i + 2) + ' / span ' + J.rows.length + '"><i></i><span>↑ ' + md(J.t) + '</span></div>';
      else if (J && J.rows.indexOf(i + 1) < 0) h += '<div></div>';
    });
    if (f.all) h += '<div class="all">' + md(f.all.t) + '</div>';
    return '<figure class="fig">' + cap(f) + '<div class="tiers' + (J ? '' : ' nojoin') + '">' + h + '</div></figure>';
  },
  stairs: function (f) {
    var n = f.steps.length;
    return '<figure class="fig">' + cap(f) + '<div class="stairs" style="--n:' + n + '">' + f.steps.map(function (p, i) {
      return '<div class="stp' + (i === n - 1 && f.top ? ' top' : '') + '" style="--i:' + i + '"><b>' + md(p.t) + '</b>' + (p.sub ? '<span>' + md(p.sub.t) + '</span>' : '') + '</div>';
    }).join('') + '</div>' + (f.rise ? '<p class="rise">' + md(f.rise.t) + '</p>' : '') + '</figure>';
  },
  /* ροή: αιτία → αποτέλεσμα, λίγα κουτιά· ένας κόμβος μπορεί να είναι «Α ή Β» */
  flow: function (f) {
    var L = f.nodes.length;
    return '<figure class="fig">' + cap(f) + '<div class="flow">' + f.nodes.map(function (nd, i) {
      var box = nd.or
        ? '<div class="nd or">' + nd.or.map(function (x, j) { return (j ? '<i>Ή</i>' : '') + '<b>' + md(x.t) + '</b>'; }).join('') + '</div>'
        : '<div class="nd' + (i === L - 1 ? ' end' : '') + '"><b>' + md(nd.t) + '</b>' + (nd.sub ? '<span>' + md(nd.sub.t) + '</span>' : '') + '</div>';
      return (i ? '<div class="ar" aria-hidden="true"><span>→</span></div>' : '') + box;
    }).join('') + '</div></figure>';
  },
  /* σύγκριση δύο στηλών */
  compare: function (f) {
    var col = function (hd, items, bad) {
      return '<div class="col' + (bad ? ' bad' : '') + '"><h3>' + md(hd.t) + '</h3>' + items.map(function (x) { return '<p>' + md(x.t) + '</p>'; }).join('') + '</div>';
    };
    return '<figure class="fig">' + cap(f) + '<div class="cmp">' + col(f.lh, f.left, f.bad === 'l') + col(f.rh, f.right, f.bad === 'r') +
      (f.result ? '<p class="res">' + md(f.result.t) + '</p>' : '') + '</div></figure>';
  },
  none: function () { return ''; }
};

/* η παράγραφος της στάσης όπου το βιβλίο λέει ό,τι ρωτάει μια ερώτηση (κοινές λέξεις των αγκυρών) */
function norm(s) { return plain(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\p{L}\p{N}]+/gu, ' ').trim(); }
function paraFor(q) {
  var s = BY[q.s], best = null, bs = 0, qa = (q.a || []).map(norm);
  var qw = {}; qa.join(' ').split(' ').forEach(function (w) { if (w.length >= 4) qw[w] = 1; });
  var cand = (s.prose || []).map(function (p, i) { return ['p' + (i + 1), p]; }).concat((s.points || []).map(function (p, i) { return ['k' + (i + 1), p]; }));
  cand.forEach(function (c) {
    var pa = (c[1].a || []).map(norm), sc = 0;
    pa.forEach(function (x) { qa.forEach(function (y) { if (x.indexOf(y) >= 0 || y.indexOf(x) >= 0) sc += 100; }); });
    pa.join(' ').split(' ').forEach(function (w) { if (qw[w]) { sc++; qw[w] = 2; } });
    Object.keys(qw).forEach(function (w) { qw[w] = 1; });
    if (sc > bs) { bs = sc; best = c[0]; }
  });
  return bs >= 2 ? 's' + q.s + '-' + best : 's' + q.s;
}

function trapHTML(t, n, withLink) {
  return '<div class="trap"><small>ΠΑΓΙΔΑ ΣΩΣΤΟ / ΛΑΘΟΣ</small><s>«' + md(t.f) + '»</s><p><b>ΛΑΘΟΣ</b>' + md(t.t) + '</p>' +
    (withLink ? '<a href="#s' + n + '">' + esc(stName(n)) + ' →</a>' : '') + '</div>';
}
function matchHTML(m, n, withLink) {
  return '<div><span class="lbl">' + esc(m.cap) + (withLink ? ' · στάση ' + n : '') + '</span><div class="sym">' + m.rows.map(function (r) {
    return '<div><b>' + md(r.k) + '</b><i>→</i><span>' + md(r.d) + '</span></div>';
  }).join('') + '</div></div>';
}

/* ── μία στάση ───────────────────────────────────────────────────────── */
function stopHTML(s) {
  var f = s.fig, nums = {};
  if (f && f.type === 'scene') (f.steps || []).forEach(function (p) { (nums[p.at] = nums[p.at] || []).push(p.n); });
  var u = function (id) { return (nums[id] || []).map(function (n) { return '<u>' + n + '</u>'; }).join(''); };
  var txt = (s.prose || []).map(function (p, i) { return '<p id="s' + s.n + '-p' + (i + 1) + '">' + u('p' + (i + 1)) + md(p.t) + '</p>'; }).join('') +
    (s.points || []).map(function (p, i) {
      var t = p.t, m = /^([^:]{2,40}):\s+/.exec(t), cue = '';
      if (m && m[1].indexOf('*') < 0) { cue = '<b>' + esc(m[1]) + '.</b>'; t = up1(t.slice(m[0].length)); }
      return '<p id="s' + s.n + '-k' + (i + 1) + '">' + u('k' + (i + 1)) + cue + md(t) + '</p>';
    }).join('');
  var side = '';
  (s.sl || []).forEach(function (t) { side += trapHTML(t, s.n, false); });
  if (s.match && !s.match.hide) side += matchHTML(s.match, s.n, false);
  if (s.gloss && s.gloss.length) side += '<div><span class="lbl">Λεξιλόγιο</span><div class="gl">' + s.gloss.map(function (g) {
    return '<div><b>' + md(g.k) + '</b>' + md(g.d) + '</div>'; }).join('') + '</div></div>';
  if (s.mnem) side += '<div class="mn"><span class="lbl">Να το θυμάσαι</span><span class="k">' + md(s.mnem.k) + '</span><p>' + md(s.mnem.t) + '</p></div>';
  return '<section class="sec" id="s' + s.n + '" aria-labelledby="s' + s.n + '-h">' +
    '<p class="lbl"><b>Στάση ' + s.n + '</b> · ' + esc(plain(s.label)) + '</p><h2 id="s' + s.n + '-h">' + md(s.title) + '</h2>' +
    (f && FIG[f.type] ? FIG[f.type](f, s) : '') +
    '<div class="two' + (side ? '' : ' solo') + '"><div class="txt">' + txt + '</div>' + (side ? '<aside class="side" aria-label="Δίπλα στη στάση ' + s.n + '">' + side + '</aside>' : '') + '</div>' +
    (s.bridge ? '<p class="bridge">' + md(s.bridge) + '</p>' : '') + '</section>';
}

/* οι πίνακες αντιστοίχισης όλης της εισαγωγής: οι `match` + οι όροφοι (ίδια αντικείμενα με τις στάσεις) */
function matchSets() {
  var out = [];
  ST.forEach(function (s) {
    if (s.fig && s.fig.type === 'tiers') out.push({ id: 't' + s.n, s: s.n, cap: plain(s.fig.match || ((s.fig.lh.t || s.fig.lh) + ' → ' + (s.fig.rh.t || s.fig.rh))),
      rows: s.fig.rows.map(function (r) { return { k: r.l.t, d: r.r.t + (r.r.s ? ' ' + r.r.s : '') }; }) });
    if (s.match) out.push({ id: 'm' + s.n, s: s.n, cap: plain(s.match.cap), rows: s.match.rows.map(function (r) { return { k: r.k, d: r.d }; }) });
  });
  return out;
}
var SETS = matchSets();
function reviewHTML() {
  var traps = [], h = '';
  ST.forEach(function (s) { (s.sl || []).forEach(function (t) { traps.push(trapHTML(t, s.n, true)); }); });
  if (traps.length) h += '<section class="rev" id="pagides"><p class="lbl">Πέντε λεπτά πριν το διαγώνισμα</p><h2>Όλες οι παγίδες μαζί</h2>' +
    '<p class="lead">Κάθε πρόταση με διαγραφή είναι αυτό που θα σου γράψουν για να σε μπερδέψουν. Από κάτω, το σωστό.</p><div class="grid">' + traps.join('') + '</div></section>';
  if (SETS.length) h += '<section class="rev" id="pinakes"><p class="lbl">Πέντε λεπτά πριν το διαγώνισμα</p><h2>Όλοι οι πίνακες αντιστοίχισης μαζί</h2>' +
    '<p class="lead">Ό,τι μπορεί να σου ζητηθεί ως «αντιστοιχίστε». Στον Έλεγχο τα ξαναβρίσκεις ανακατεμένα.</p><div class="tbl">' +
    SETS.map(function (x) { return matchHTML(x, x.s, true); }).join('') + '</div></section>';
  h += '<div class="fin"><p>' + md(D.fin && D.fin.line || '') + '</p><button type="button" data-goto="ch">Πέρνα στον Έλεγχο →</button></div>';
  return h;
}

/* ── σχεδιάγραμμα όλης της εισαγωγής ── */
var GL = ['α', 'β', 'γ', 'δ', 'ε', 'στ', 'ζ', 'η'];
var olBare = false;
function outlineHTML() {
  var O = D.outline || [];
  return '<div class="hd"><div><p class="lbl">Όλη η εισαγωγή σε μία οθόνη</p><h2>Σχεδιάγραμμα</h2><p>Κρύψε τα υποσημεία, πες τα μόνος σου από τους τίτλους, και ξάνοιξέ τα για να δεις τι ξέχασες.</p></div>' +
    '<button type="button" class="tg" data-bare aria-pressed="' + olBare + '">' + (olBare ? 'Δείξε τα υποσημεία' : 'Κρύψε τα υποσημεία') + '</button></div>' +
    '<ol class="l1">' + O.map(function (a) {
      return '<li><a href="#s' + a.s + '"><i>' + esc(a.k) + '.</i><span>' + md(a.t) + '</span></a><ol class="l2">' + (a.items || []).map(function (b, j) {
        return '<li><a href="#s' + b.s + '"><i>' + (j + 1) + '.</i><span>' + md(b.t) + '</span></a>' + (b.items && b.items.length ? '<ol class="l3">' + b.items.map(function (c, k) {
          return '<li><i>' + GL[k] + '.</i><span>' + md(c.t) + '</span></li>'; }).join('') + '</ol>' : '') + '</li>';
      }).join('') + '</ol></li>';
    }).join('') + '</ol>';
}
function paintOutline() { var o = $('ol'); o.innerHTML = outlineHTML(); o.classList.toggle('bare', olBare); }

/* ── ο έλεγχος ──────────────────────────────────────────────────────── */
var mode = 'rc', rcOrder = C.recall.map(function (_, i) { return i; }), rcAt = 0, rcShown = false;
var mtSet = SETS.length ? SETS[0].id : '', mt = null;
function setBy(id) { for (var i = 0; i < SETS.length; i++) if (SETS[i].id === id) return SETS[i]; return null; }
function gapList() {
  var out = [];
  C.recall.forEach(function (c) { if (S.rc[c.id] === 0) out.push({ id: c.id, k: 'rc', s: c.s, tx: c.q, kind: 'Ανάκληση · όχι ακόμα' }); });
  C.tf.forEach(function (c) { if (typeof S.tf[c.id] === 'boolean' && S.tf[c.id] !== c.ok) out.push({ id: c.id, k: 'tf', s: c.s, tx: c.t, kind: 'Σωστό ή λάθος · λάθος απάντηση' }); });
  C.mc.forEach(function (c) { if (typeof S.mc[c.id] === 'number' && S.mc[c.id] !== c.ok) out.push({ id: c.id, k: 'mc', s: c.s, tx: c.q, kind: 'Πολλαπλή επιλογή · λάθος απάντηση' }); });
  SETS.forEach(function (x) { x.rows.forEach(function (r) { if (S.mt[x.id + '|' + plain(r.k)] === 0) out.push({ id: x.id + '|' + plain(r.k), k: 'mt', s: x.s, tx: r.k + ' → ' + r.d, kind: 'Αντιστοίχιση · λάθος ζευγάρι' }); }); });
  return out;
}
function answered() { var n = 0, k; for (k in S.rc) n++; for (k in S.tf) n++; for (k in S.mc) n++; for (k in S.mt) n++; return n; }
function total() { var t = C.recall.length + C.tf.length + C.mc.length; SETS.forEach(function (x) { t += x.rows.length; }); return t; }
function headCheck() {
  var g = gapList().length, a = answered();
  $('say').textContent = !store.readable ? 'Οι απαντήσεις σου δεν διαβάστηκαν σε αυτή τη συσκευή.' :
    a === 0 ? 'Δεν έχεις ελέγξει τίποτα ακόμα.' : g === 0 ? 'Κανένα κενό σε όσα έλεγξες.' : (g === 1 ? 'Ένα κενό σε όσα έλεγξες.' : g + ' κενά σε όσα έλεγξες.');
  $('say2').textContent = a === 0 ? 'Ξεκίνα από την Ανάκληση: σκέψου την απάντηση, μετά δες την.' :
    'Έλεγξες ' + a + ' από ' + total() + '. Ό,τι δεν ήξερες περιμένει στα «Τα κενά μου», με τη στάση του.';
}
var MODES = [['rc', 'Ανάκληση'], ['tf', 'Σωστό ή λάθος'], ['mc', 'Πολλαπλή επιλογή'], ['mt', 'Αντιστοίχιση'], ['gaps', 'Τα κενά μου'], ['glance', 'Με μια ματιά']];
function renderNav() {
  /* σταθ. 33: πριν από την πρώτη απάντηση τα κενά ΔΕΝ είναι «0» — δεν έχουν μετρηθεί */
  var cnt = { rc: C.recall.length, tf: C.tf.length, mc: C.mc.length, mt: SETS.length ? SETS.length + ' πίνακες' : '', gaps: answered() ? gapList().length : '', glance: '' };
  $('cknav').innerHTML = MODES.filter(function (m) { return m[0] !== 'mt' || SETS.length; }).map(function (m) {
    return '<button type="button" role="tab" data-mode="' + m[0] + '" aria-selected="' + (mode === m[0]) + '">' + m[1] + (cnt[m[0]] !== '' ? '<span>' + cnt[m[0]] + '</span>' : '') + '</button>';
  }).join('');
}
function stLink(n) { return '<a href="#s' + n + '">' + esc(stName(n)) + ' →</a>'; }
function paneRC() {
  var c = C.recall[rcOrder[rcAt]], v = S.rc[c.id];
  var h = '<p class="intro">Μία ερώτηση τη φορά. Σκέψου την απάντηση πριν τη δεις, και πες τίμια αν την ήξερες. Ό,τι δεν ήξερες πάει στα «κενά μου».</p>' +
    '<div class="ck-bar"><button type="button" class="btn" data-rc="prev">← Προηγούμενη</button><button type="button" class="btn" data-rc="next">Επόμενη →</button>' +
    '<button type="button" class="btn" data-rc="shuf">Ανακάτεψε</button><span class="pos">' + (rcAt + 1) + ' / ' + C.recall.length + '</span></div>';
  h += '<div class="ck-card" data-q="' + c.id + '"><span class="lbl">' + esc(stName(c.s)) + '</span><p class="q">' + md(c.q) + '</p>';
  if (!rcShown) h += '<p class="think">Σκέψου την απάντηση.</p><div class="row"><button type="button" class="btn pri" data-rc="show">Δείξε την απάντηση</button></div>';
  else h += '<div class="ans">' + md(c.r) + '</div><div class="row">' +
      '<button type="button" class="btn' + (v === 1 ? ' pri' : '') + '" data-rc="yes" aria-pressed="' + (v === 1) + '">Το ήξερα</button>' +
      '<button type="button" class="btn' + (v === 0 ? ' pri' : '') + '" data-rc="no" aria-pressed="' + (v === 0) + '">Όχι ακόμα</button>' +
      '<a class="ck-go" href="#' + paraFor(c) + '">Ξαναδιάβασέ το στη στάση ' + c.s + ' →</a></div>';
  return h + '</div>';
}
function againBtn(k, list, ans) {
  var any = list.some(function (c) { return ans[c.id] !== undefined; });
  return any ? '<button type="button" class="btn again" data-reset="' + k + '">Σβήσε τις απαντήσεις και ξανά από την αρχή</button>' : '';
}
function paneTF() {
  var h = '<p class="intro">Όπως στις Πανελλήνιες: Σωστό ή Λάθος για κάθε πρόταση. Οι προτάσεις έχουν τις παγίδες του κεφαλαίου. Αν πέσεις σε παγίδα, βλέπεις γιατί και πού το λέει το κείμενο.</p>' + againBtn('tf', C.tf, S.tf) + '<div class="ck-qs">';
  C.tf.forEach(function (c, i) {
    var v = S.tf[c.id], done = typeof v === 'boolean', right = done && v === c.ok;
    h += '<div class="ck-qi" data-q="' + c.id + '"><span class="lbl">' + (i + 1) + ' · στάση ' + c.s + '</span><p class="qt">' + md(c.t) + '</p><div class="ck-tf">' +
      [true, false].map(function (b) {
        var cls = done ? (b === c.ok ? ' ok' : (b === v ? ' no' : '')) : '';
        return '<button type="button" class="ck-opt' + cls + '" data-tf="' + c.id + '" data-v="' + b + '"' + (done ? ' disabled' : '') + '>' + (b ? 'Σωστό' : 'Λάθος') + '</button>';
      }).join('') + '</div>' +
      (done ? '<p class="ck-ex"><span class="v ' + (right ? 'ok' : 'no') + '">' + (right ? 'Σωστά.' : 'Όχι.') + '</span>' + md(String(c.why).replace(/^(Σωστό|Λάθος)\.\s*/, '')) +
        (right ? '' : ' <a href="#' + paraFor(c) + '">Δες πού το λέει, στη στάση ' + c.s + ' →</a>') + '</p>' : '') + '</div>';
  });
  return h + '</div>';
}
function paneMC() {
  var h = '<p class="intro">Μία σωστή σε κάθε ερώτηση. Μετά την απάντηση βλέπεις γιατί, και πού το λέει.</p>' + againBtn('mc', C.mc, S.mc) + '<div class="ck-qs">';
  C.mc.forEach(function (c, i) {
    var v = S.mc[c.id], done = typeof v === 'number', right = done && v === c.ok;
    h += '<div class="ck-qi" data-q="' + c.id + '"><span class="lbl">' + (i + 1) + ' · στάση ' + c.s + '</span><p class="qt">' + md(c.q) + '</p><div class="ck-opts">' +
      c.o.map(function (o, j) {
        var cls = done ? (j === c.ok ? ' ok' : (j === v ? ' no' : '')) : '';
        return '<button type="button" class="ck-opt' + cls + '" data-mc="' + c.id + '" data-v="' + j + '"' + (done ? ' disabled' : '') + '>' + md(o) + '</button>';
      }).join('') + '</div>' +
      (done ? '<p class="ck-ex"><span class="v ' + (right ? 'ok' : 'no') + '">' + (right ? 'Σωστά.' : 'Όχι.') + '</span>' + md(c.why || '') + ' <a href="#' + paraFor(c) + '">Στάση ' + c.s + ' →</a></p>' : '') + '</div>';
  });
  return h + '</div>';
}
/* αντιστοίχιση: πατάς ένα αριστερά και ένα δεξιά (όχι σύρσιμο) */
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
function mtStart(id) {
  var x = setBy(id); if (!x) return;
  var R = shuffle(x.rows.map(function (r) { return r.d; }));
  /* ποτέ στην ίδια σειρά με την αριστερή στήλη, αν γίνεται */
  if (R.length > 1 && R.every(function (d, i) { return d === x.rows[i].d; })) R.push(R.shift());
  mtSet = id; mt = { sel: -1, res: {}, right: R };
}
function paneMT() {
  if (!mt || !setBy(mtSet)) mtStart(mtSet);
  var x = setBy(mtSet);
  var h = '<p class="intro">Πάτα ένα στοιχείο αριστερά και μετά αυτό που του αντιστοιχεί δεξιά. Αν το ζευγάρι είναι λάθος, βλέπεις το σωστό και πάει στα «κενά μου».</p>' +
    '<div class="mt-sets">' + SETS.map(function (y) { return '<button type="button" data-mtset="' + y.id + '" aria-pressed="' + (y.id === mtSet) + '">Στάση ' + y.s + ' · ' + esc(y.cap.replace(/^Αντιστοίχιση:\s*/, '')) + '</button>'; }).join('') + '</div>';
  var used = {}; Object.keys(mt.res).forEach(function (i) { used[x.rows[i].d] = 1; });
  h += '<div class="mt"><span class="colh">Πάτα πρώτα εδώ</span><span class="colh">Ποιο του αντιστοιχεί</span><div class="col">' +
    x.rows.map(function (r, i) {
      var res = mt.res[i];
      if (res) return '<div class="pr' + (res === 'ok' ? '' : ' no') + '"><b>' + md(r.k) + '</b><span>→ ' + md(r.d) + '</span>' + (res === 'ok' ? '' : '<em>Όχι: διάλεξες «' + esc(plain(res.w)) + '»</em>') + '</div>';
      return '<button type="button" class="' + (mt.sel === i ? 'on' : '') + '" data-mtl="' + i + '" aria-pressed="' + (mt.sel === i) + '">' + md(r.k) + '</button>';
    }).join('') + '</div><div class="col">' +
    mt.right.filter(function (d) { return !used[d]; }).map(function (d) {
      return '<button type="button" data-mtr="' + esc(d) + '"' + (mt.sel < 0 ? ' aria-disabled="true"' : '') + '>' + md(d) + '</button>';
    }).join('') + '</div></div>';
  if (Object.keys(mt.res).length === x.rows.length) {
    var bad = Object.keys(mt.res).filter(function (i) { return mt.res[i] !== 'ok'; }).length;
    h += '<p class="mt-done">' + (bad ? (bad === 1 ? 'Ένα ζευγάρι πήγε στα «κενά μου».' : bad + ' ζευγάρια πήγαν στα «κενά μου».') : 'Όλα τα ζευγάρια σωστά.') + '</p>' +
      '<div class="ck-bar"><button type="button" class="btn pri" data-mtagain>Ξανά, ανακατεμένο</button>' + stLink(x.s).replace('<a ', '<a class="ck-go" ') + '</div>';
  }
  return h;
}
function paneGaps() {
  var g = gapList();
  if (!answered()) return '<div class="ck-empty">Δεν υπάρχουν κενά ακόμα, γιατί δεν έχεις ελέγξει τίποτα. Ξεκίνα από την <b>Ανάκληση</b>: ό,τι πεις «όχι ακόμα» έρχεται εδώ, με τη στάση του.</div>';
  if (!g.length) return '<div class="ck-empty">Κανένα κενό. Ό,τι έλεγξες το ήξερες. Συνέχισε με όσα δεν έχεις ελέγξει ακόμα.</div>';
  var by = {}; g.forEach(function (x) { (by[x.s] = by[x.s] || []).push(x); });
  return '<p class="intro">Μόνο ό,τι δεν ήξερες, ανά στάση. Ένα πάτημα και είσαι στη στάση· όταν το μάθεις, πάτα «Το ξέρω πια».</p><div class="gp">' +
    Object.keys(by).sort(function (a, b) { return a - b; }).map(function (n) {
      return '<div class="st"><div class="hd"><span class="lbl">Στάση ' + n + '</span><b>' + esc(BY[n].short) + '</b>' + stLink(+n).replace('<a ', '<a class="ck-go" ') + '</div><ul>' + by[n].map(function (x) {
        return '<li><div><span class="kind">' + esc(x.kind) + '</span><span class="tx">' + md(x.tx) + '</span></div>' +
          '<button type="button" class="btn" data-clear="' + esc(x.k + ':' + x.id) + '">Το ξέρω πια</button></li>';
      }).join('') + '</ul></div>';
    }).join('') + '</div>';
}
function paneGlance() {
  var h = '<div class="gl2"><p class="intro">Ό,τι αξίζει να ξέρεις απ’ έξω χωρίς να το ψάξεις: οι αριθμοί, οι παγίδες, τα μνημονικά, και η μεγάλη ιδέα αν σου ζητήσουν ανάπτυξη.</p>';
  h += '<div class="nums">' + (C.numbers || []).map(function (x) { return '<div><div class="v">' + esc(x.v) + '</div><div class="l">' + md(x.l) + '</div></div>'; }).join('') + '</div>';
  if (C.numbersNote) h += '<p class="note">' + md(C.numbersNote) + '</p>';
  h += '<h3>Οι παγίδες του κεφαλαίου</h3><ul>' + (C.pitfalls || []).map(function (p) { return '<li>' + md(p.t) + stLink(p.s) + '</li>'; }).join('') + '</ul>';
  h += '<h3>Τα μνημονικά</h3><ul>' + ST.filter(function (s) { return s.mnem; }).map(function (s) {
    return '<li><b>' + esc(s.mnem.k) + '</b> · ' + md(s.mnem.t) + stLink(s.n) + '</li>';
  }).join('') + '</ul>';
  if (C.idea) h += '<h3>Η μεγάλη ιδέα</h3><p class="idea">' + md(C.idea.t) + '</p>';
  return h + '</div>';
}
function renderPane() {
  renderNav();
  $('pane').innerHTML = mode === 'rc' ? paneRC() : mode === 'tf' ? paneTF() : mode === 'mc' ? paneMC() : mode === 'mt' ? paneMT() : mode === 'gaps' ? paneGaps() : paneGlance();
}
function renderCheck() { headCheck(); renderPane(); }

/* ── κίνηση των σκηνών: μία φορά στην είσοδο, ξανά με πάτημα ── */
function arm() {
  var sc = [].slice.call(document.querySelectorAll('[data-scene]'));
  if (reduce || !('IntersectionObserver' in window)) return;          /* μένουν ορατές, χωρίς κίνηση */
  document.documentElement.classList.add('anim');
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('go'); io.unobserve(e.target); } });
  }, { threshold: 0.3 });
  sc.forEach(function (x) { io.observe(x); });
  /* δίχτυ (σταθ. 39): αν ο observer δεν χτυπήσει ποτέ, η σκηνή δεν μένει άδεια */
  setTimeout(function () { sc.forEach(function (x) { if (!x.classList.contains('go')) x.classList.add('done'); }); }, 15000);
}
function replay(fig) {
  if (reduce || !document.documentElement.classList.contains('anim')) return;
  fig.classList.remove('go', 'done'); void fig.offsetWidth; fig.classList.add('go');
}

/* ── καρτέλες + διευθύνσεις: #sN · #sN-pK/-kK · #pagides · #pinakes · #sxediagramma · #elegxos ── */
var TABS = { read: ['t-read', 'v-read'], sx: ['t-sx', 'v-sx'], ch: ['t-ch', 'v-ch'] };
var HASH = { sx: '#sxediagramma', ch: '#elegxos' };
function show(v) {
  Object.keys(TABS).forEach(function (k) { $(TABS[k][0]).setAttribute('aria-selected', String(k === v)); $(TABS[k][1]).hidden = k !== v; });
  if (v === 'sx') paintOutline();
  if (v === 'ch') renderCheck();
}
var first = true;
function route() {
  var h = location.hash;
  if (h === HASH.sx) { show('sx'); window.scrollTo(0, 0); first = false; return; }
  if (h === HASH.ch) { show('ch'); window.scrollTo(0, 0); first = false; return; }
  show('read');
  var el = /^#(s\d+(-[pk]\d+)?|pagides|pinakes)$/.test(h) && $(h.slice(1));
  if (el) {
    el.scrollIntoView({ block: el.tagName === 'P' ? 'center' : 'start' });
    if (el.tagName === 'P') { el.classList.add('flash'); setTimeout(function () { el.classList.remove('flash'); }, 1800); }
    /* οι γραμματοσειρές αλλάζουν τα ύψη: ξαναπροσγείωση μία φορά όταν φορτώσουν */
    if (first && document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (location.hash === h) el.scrollIntoView({ block: el.tagName === 'P' ? 'center' : 'start' }); });
  }
  first = false;
}
function goHash(h) { if (location.hash === h) route(); else location.hash = h; }
document.addEventListener('click', function (e) {
  var t = e.target.closest('button, [data-scene]'); if (!t) return;
  if (t.id === 't-read') { history.pushState(null, '', location.pathname + location.search); show('read'); return; }
  if (t.id === 't-sx') return goHash(HASH.sx);
  if (t.id === 't-ch') return goHash(HASH.ch);
  var ds = t.dataset || {};
  if (ds.goto === 'ch') return goHash(HASH.ch);
  if (ds.replay !== undefined) { replay(t.closest('[data-scene]')); return; }
  if (t.hasAttribute('data-scene')) { if (e.target.closest('svg')) replay(t); return; }
  if (ds.bare !== undefined) { olBare = !olBare; paintOutline(); return; }
  if (ds.mode) { mode = ds.mode; rcShown = false; renderPane(); return; }
  if (ds.rc) {
    var c = C.recall[rcOrder[rcAt]];
    if (ds.rc === 'show') rcShown = true;
    else if (ds.rc === 'yes' || ds.rc === 'no') { S.rc[c.id] = ds.rc === 'yes' ? 1 : 0; save(); rcAt = (rcAt + 1) % rcOrder.length; rcShown = false; headCheck(); }
    else if (ds.rc === 'next') { rcAt = (rcAt + 1) % rcOrder.length; rcShown = false; }
    else if (ds.rc === 'prev') { rcAt = (rcAt - 1 + rcOrder.length) % rcOrder.length; rcShown = false; }
    else if (ds.rc === 'shuf') { rcOrder = shuffle(rcOrder); rcAt = 0; rcShown = false; }
    renderPane(); return;
  }
  if (ds.tf) { S.tf[ds.tf] = ds.v === 'true'; save(); headCheck(); renderPane(); return; }
  if (ds.mc) { S.mc[ds.mc] = +ds.v; save(); headCheck(); renderPane(); return; }
  if (ds.reset) { S[ds.reset] = {}; save(); headCheck(); renderPane(); return; }
  if (ds.mtset) { mtStart(ds.mtset); renderPane(); return; }
  if (ds.mtagain !== undefined) { mtStart(mtSet); renderPane(); return; }
  if (ds.mtl) { mt.sel = +ds.mtl; renderPane(); return; }
  if (ds.mtr !== undefined) {
    if (mt.sel < 0) return;
    var x = setBy(mtSet), r = x.rows[mt.sel], okp = ds.mtr === r.d;
    mt.res[mt.sel] = okp ? 'ok' : { w: ds.mtr };
    S.mt[x.id + '|' + plain(r.k)] = okp ? 1 : 0; save();
    mt.sel = -1; headCheck(); renderPane(); return;
  }
  if (ds.clear) {
    var p = ds.clear.split(':'), kind = p.shift(), id = p.join(':');
    if (kind === 'rc') { S.rc[id] = 1; save(); }
    else if (kind === 'mt') { S.mt[id] = 1; save(); }
    else { delete S[kind][id]; save(); }
    headCheck(); renderPane(); return;
  }
});
window.addEventListener('popstate', route);
window.addEventListener('hashchange', route);

/* ── ζωγραφική ── */
$('eye').textContent = D.eye || '';
$('h1').innerHTML = md(D.title);
$('motto').innerHTML = md(D.cover.motto.gr);
$('road').innerHTML = '<p class="lbl">Ο δρόμος της εισαγωγής · ' + N + ' στάσεις, ' + D.acts.length + ' ενότητες</p>' + roadSVG() + actsHTML();
$('stops').innerHTML = ST.map(stopHTML).join('');
$('review').innerHTML = reviewHTML();
banner();
arm();
route();
})();
</script>
</body>
</html>
