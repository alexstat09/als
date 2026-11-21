<!doctype html>
<html lang="el">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Εισαγωγή · Λατινικά · MÉTRON</title>
<link rel="manifest" href="manifest.json">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=GFS+Didot&amp;family=Instrument+Serif:ital@0;1&amp;family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&amp;display=swap">
<style>
/* ══════════════════════════════════════════════════════════════════
   Η ΕΙΣΑΓΩΓΗ ΤΩΝ ΛΑΤΙΝΙΚΩΝ — ΤΟ ΤΗΛΕΣΚΟΠΙΟ
   ⛔⛔ ΠΑΡΑΓΕΤΑΙ από tools/eisagogi/ (node tools/eisagogi/build.js).
   ΜΗΝ ΤΟ ΓΡΑΨΕΙΣ ΜΕ ΤΟ ΧΕΡΙ — άλλαξε το eisagogi.json ή το eisagogi.tpl.

   ΔΥΟ ΦΩΝΕΣ:
     Ελλάδα = GFS Didot ΠΛΑΓΙΑ, χρώμα --gr (τα ελληνικά πρότυπα)
     Ρώμη   = GFS Didot ΟΡΘΙΑ, χρώμα --ro (ρωμαϊκά ονόματα, γραμμένα ελληνικά)
              Instrument Serif ΜΟΝΟ σε λατινικούς χαρακτήρες και ψηφία.
     ⛔ ΠΟΤΕ --f-lat σε ελληνικά (σταθ. 43 · φρουρός 7b στο test).
   ⛔ Κανένα @media(min-width) (σταθ. 51). ⛔ Τίποτα δεν γεννιέται σβηστό (σταθ. 39).
   ══════════════════════════════════════════════════════════════════ */
:root{
  --bg:#060607; --ivory:#F5F2EC; --text:rgba(245,242,236,.86); --dim:rgba(245,242,236,.62);
  --faint:rgba(245,242,236,.36); --line:rgba(255,255,255,.07); --line2:rgba(255,255,255,.12);
  --gr:132,178,214;  /* Ελλάδα */
  --ro:222,132,104;  /* Ρώμη   */
  --hl:255,224,102;  /* οι ορισμοί σου */
  --f-gr:"GFS Didot","Times New Roman",Times,serif;
  --f-lat:"Instrument Serif","Times New Roman",serif;
  --f-sans:"IBM Plex Sans",system-ui,-apple-system,sans-serif;
  --f-mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
  --col:64ch;
  color-scheme:dark;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--text);font-family:var(--f-sans);
  -webkit-font-smoothing:antialiased;overflow-x:clip}
button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer;text-align:inherit}
:focus-visible{outline:2px solid rgba(var(--ro),.8);outline-offset:3px;border-radius:3px}
.wrap{max-width:1180px;margin-inline:auto;padding-inline:24px}
.lbl{font-family:var(--f-mono);font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--faint)}
.sec{margin-top:72px}
.world[hidden],.nums[hidden],.banner[hidden],.cv-hint[hidden]{display:none}

/* ─── διαδρομή ─── */
.route{display:flex;align-items:center;gap:20px;padding-block:20px 0;flex-wrap:wrap}
.back{font-family:var(--f-mono);font-size:12px;letter-spacing:.06em;color:var(--dim);text-decoration:none;padding:9px 0}
.back:hover{color:var(--ivory)}
.route .crumb{font-family:var(--f-mono);font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--faint)}
.tabs{margin-left:auto;display:flex;gap:22px}
.tabs button{font-size:13px;color:var(--dim);padding:6px 0;border-bottom:1px solid transparent}
.tabs button:hover{color:var(--ivory)}
.tabs button[aria-selected="true"]{color:var(--ivory);border-bottom-color:var(--ivory)}

/* ─── η μπάρα των κεφαλαίων ─── */
.nums{position:sticky;top:0;z-index:40;background:rgba(6,6,7,.93);
  -webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border-bottom:1px solid var(--line);margin-top:14px}
.nums .bar{display:flex;align-items:center;gap:12px}
.nums-in{display:flex;align-items:flex-end;gap:2px;overflow-x:auto;scrollbar-width:none;min-width:0;flex:1}
.nums-in::-webkit-scrollbar{display:none}
.nums-in button{position:relative;flex:none;padding:15px 13px 11px;font-family:var(--f-mono);font-size:13px;
  letter-spacing:.06em;color:var(--dim);border-bottom:1px solid transparent;line-height:1}
.nums-in button:hover{color:var(--ivory)}
.nums-in button[aria-current="true"]{color:var(--ivory);border-bottom-color:var(--ivory)}
.nums-in button i{position:absolute;top:3px;left:50%;transform:translateX(-50%);font-style:normal;
  font-size:9px;letter-spacing:.1em;color:rgba(var(--ro),.9)}
.nums-in button u{position:absolute;bottom:4px;left:50%;transform:translateX(-50%);width:4px;height:4px;
  border-radius:50%;background:rgb(var(--ro));text-decoration:none}
.nums-in .brk{flex:none;align-self:stretch;display:flex;align-items:center;margin:0 6px 0 10px;padding-left:12px;
  border-left:1px solid var(--line2);font-family:var(--f-mono);font-size:9px;letter-spacing:.16em;text-transform:uppercase;
  color:var(--faint);white-space:nowrap;line-height:1}
.cvbtn{flex:none;font-size:13px;color:var(--dim);padding:8px 13px;border:1px solid var(--line2);border-radius:11px}
.cvbtn:hover{color:var(--ivory)}
.cvbtn[aria-pressed="true"]{color:var(--ivory);border-color:rgba(var(--ro),.7)}
.cv-hint{margin:0;padding:0 0 12px;font-size:13.5px;color:var(--dim)}

/* ─── εξώφυλλο ─── */
.cover{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:48px;align-items:end;
  padding-block:60px 44px;border-bottom:1px solid var(--line)}
.cover h1{margin:0;font-family:var(--f-gr);font-style:italic;font-weight:400;font-size:clamp(60px,8.6vw,104px);
  line-height:.95;letter-spacing:-.01em;color:var(--ivory)}
.cover .lead{margin:22px 0 0;max-width:30ch;font-family:var(--f-gr);font-style:italic;font-size:26px;line-height:1.35;color:var(--dim)}
.meet{text-align:right}
.meet .big{font-family:var(--f-lat);font-size:clamp(72px,9vw,112px);line-height:.9;color:var(--ivory);letter-spacing:-.02em}
.meet .big small{font-family:var(--f-gr);font-size:.32em;color:var(--dim);margin-left:.18em;letter-spacing:0}
.meet .cap{margin-top:10px;font-family:var(--f-gr);font-style:italic;font-size:16px;color:var(--dim);max-width:24ch;margin-left:auto}
.meet .dots{display:flex;gap:6px;justify-content:flex-end;margin-top:14px}
.dot{width:6px;height:6px;border-radius:50%;display:inline-block}
.dot.g{background:rgb(var(--gr))} .dot.r{background:rgb(var(--ro))}
.duo{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:28px;margin-top:34px;
  border:1px solid var(--line);border-radius:16px;padding:22px 28px;
  background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.008))}
.duo .g{font-family:var(--f-gr);font-style:italic;font-size:17px;color:var(--dim)}
.duo .l{display:block;margin-top:2px;font-family:var(--f-lat);font-style:italic;font-size:40px;line-height:1.05;color:rgb(var(--ro))}
.duo .ar{width:72px;height:1px;background:linear-gradient(90deg,rgba(var(--ro),.25),rgba(var(--ro),.8))}
.duo .it:last-child{text-align:right}

/* ─── η ταινία των εποχών ─── */
.band-h{display:flex;justify-content:space-between;align-items:baseline;gap:16px;margin-bottom:18px;flex-wrap:wrap}
.chs{position:relative;height:56px}
.chb{position:absolute;height:22px;border-top:1px solid var(--line2);border-left:1px solid var(--line2);border-right:1px solid var(--line2);
  border-radius:4px 4px 0 0;font-family:var(--f-mono);font-size:11.5px;letter-spacing:.06em;color:var(--dim);
  display:flex;justify-content:center;padding-top:4px;white-space:nowrap;overflow:hidden}
.chb.r0{top:4px} .chb.r1{top:32px}
.chb:hover{color:var(--ivory);border-color:rgba(var(--ro),.8)}
.band{display:flex;height:64px;border-radius:12px;overflow:hidden;border:1px solid var(--line)}
.era{position:relative;padding:0;border-right:1px solid var(--line);
  background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.025));min-width:0}
.era:last-child{border-right:0}
.era.off{background:linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,.008))}
.era.fade{-webkit-mask-image:linear-gradient(90deg,#000 62%,transparent);mask-image:linear-gradient(90deg,#000 62%,transparent)}
.era .nm{padding:12px 12px 0;font-family:var(--f-gr);font-style:italic;font-size:17px;line-height:1.15;color:var(--ivory);white-space:nowrap;overflow:hidden}
.era.off .nm{color:var(--dim)}
.ticks{position:relative;height:30px}
.tick{position:absolute;top:8px;transform:translateX(-50%);font-family:var(--f-mono);font-size:11px;color:var(--dim);white-space:nowrap}
.tick::before{content:"";position:absolute;left:50%;top:-9px;height:6px;width:1px;background:var(--line2)}
.tick.first{transform:none} .tick.first::before{left:0}
.legend{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:22px;margin-top:22px}
.legend .k{display:flex;gap:9px;align-items:baseline}
.legend .k b{font-family:var(--f-gr);font-style:italic;font-weight:400;font-size:17px;color:var(--ivory)}
.legend .k.off b{color:var(--dim)}
.legend p{margin:6px 0 0;font-size:13.5px;line-height:1.55;color:var(--dim)}
.sw{width:10px;height:10px;border-radius:3px;flex:none;background:rgba(255,255,255,.22)}
.legend .off .sw{background:rgba(255,255,255,.07)}

/* ─── το κεφάλαιο ─── */
.chap{margin-top:84px;scroll-margin-top:58px}
.part{display:flex;align-items:center;gap:18px;margin:96px 0 0}
.part b{font-family:var(--f-mono);font-size:10.5px;font-weight:400;letter-spacing:.22em;text-transform:uppercase;color:var(--dim);white-space:nowrap}
.part i{flex:1;height:1px;background:var(--line2)}
.ch-h{display:flex;align-items:flex-end;gap:24px;padding-bottom:22px;border-bottom:1px solid var(--line)}
.ch-h h2{margin:8px 0 0;font-family:var(--f-gr);font-style:italic;font-weight:400;font-size:clamp(30px,3.4vw,40px);line-height:1.1;color:var(--ivory);text-wrap:balance}
.ch-h h2 sup{font-family:var(--f-lat);font-style:normal;font-size:.42em;color:rgb(var(--ro));margin-left:3px}
.ch-h .per{margin-top:9px;font-family:var(--f-mono);font-size:12px;letter-spacing:.06em;color:var(--dim)}
.ch-h .num{font-family:var(--f-mono);font-size:10px;letter-spacing:.22em;color:var(--faint)}
.rd{margin-left:auto;flex:none;font-size:13px;color:var(--dim);padding:8px 13px;border:1px solid var(--line2);border-radius:11px}
.rd:hover{color:var(--ivory)}
.rd.on{color:var(--ivory);border-color:rgba(var(--ro),.7)}

.stage{display:grid;grid-template-columns:150px minmax(0,1fr);gap:40px;margin-top:34px}
.ruler{position:sticky;top:66px;align-self:start;padding-top:4px}
.ruler .now{font-family:var(--f-gr);font-size:17px;line-height:1.1;color:var(--dim);min-height:2.4em}
.ruler .now .nb{font-family:var(--f-lat);font-size:44px;letter-spacing:-.02em;color:var(--ivory)}
.ruler .now.pre .nb{color:var(--dim)}
.axis{position:relative;height:250px;margin-top:30px;margin-left:13px;border-left:1px solid var(--line2)}
.axis .pt{position:absolute;left:-4px;width:7px;height:7px;border-radius:50%;background:var(--bg);border:1px solid var(--dim);
  transform:translateY(-50%);transition:background .25s,border-color .25s}
.axis .rg{position:absolute;left:-11px;width:2px;border-radius:2px;background:rgba(245,242,236,.3);transition:background .25s}
.axis .pt.on{background:rgb(var(--ro));border-color:rgb(var(--ro))}
.axis .rg.on{background:rgb(var(--ro))}
.axis .al{position:absolute;left:12px;transform:translateY(-50%);font-family:var(--f-mono);font-size:10px;color:var(--faint);white-space:nowrap}
.axis .al.on{color:var(--ivory)}

.rows{min-width:0}
.row{display:grid;grid-template-columns:minmax(0,var(--col)) minmax(0,1fr);gap:36px;margin-bottom:1.25em}
.row p{margin:0;font-size:18px;line-height:1.85;text-wrap:pretty}
.row.more{padding-left:22px}
.row.more p{font-size:17px;color:var(--dim)}
.row.lead{padding-left:20px}
.row.lead p::before{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:rgba(var(--ro),.75);
  margin:0 12px 0 -20px;vertical-align:.18em}
.row.ni{padding-left:46px}
.row.ni p{position:relative}
.row.ni p::before{content:attr(data-n);position:absolute;left:-46px;top:-.05em;font-family:var(--f-lat);font-size:34px;line-height:1;color:rgba(var(--ro),.7)}
.row.sos p{position:relative}
.row.sos p::after{content:"SOS";position:absolute;left:-52px;top:.55em;font-family:var(--f-mono);font-size:9.5px;letter-spacing:.14em;color:#F58B7B}
.marg{padding-top:.4em;display:grid;gap:12px;align-content:start;min-width:0}
.inl{display:none}
.sub{margin:44px 0 22px;display:flex;align-items:center;gap:16px}
.sub h3{margin:0;font-family:var(--f-gr);font-style:italic;font-weight:400;font-size:26px;color:var(--ivory);white-space:nowrap}
.sub i{flex:1;height:1px;background:var(--line)}
.gen{margin:40px 0 0;padding-top:22px;border-top:1px solid var(--line)}
.gen h4{margin:0 0 18px;display:flex;align-items:baseline;gap:14px;font-family:var(--f-gr);font-style:italic;font-weight:400;font-size:24px;color:var(--ivory)}
.gen h4 .sostag{font-family:var(--f-mono);font-style:normal;font-size:9.5px;letter-spacing:.14em;color:#F58B7B}
.who{display:flex;flex-wrap:wrap;gap:8px 18px;margin:4px 0 8px}
.who button{font-family:var(--f-gr);font-size:17px;color:rgb(var(--ro));border-bottom:1px solid rgba(var(--ro),.35);padding-bottom:1px}
.who button:hover{border-bottom-color:rgb(var(--ro))}
.who .lbl{align-self:center}
.fig{margin:6px 0 26px;padding:12px 0 12px 16px;border-left:1px solid var(--line2);font-size:13.5px;line-height:1.55;color:var(--dim);max-width:var(--col)}
.fig .lbl{display:block;margin-bottom:4px}
.fn{margin:30px 0 0;padding-top:16px;border-top:1px solid var(--line);font-size:14px;line-height:1.75;color:var(--dim);max-width:var(--col)}
.fn sup,.row sup{font-family:var(--f-lat);color:rgb(var(--ro));font-size:.7em;margin:0 3px 0 1px}
.plates{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:4px 0 26px;max-width:var(--col)}
.plate{border:1px solid var(--line);border-radius:14px;padding:16px 20px;background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.008))}
.plate .g{font-family:var(--f-gr);font-style:italic;font-size:16px;color:var(--dim)}
.plate .l{display:block;margin-top:2px;font-family:var(--f-lat);font-style:italic;font-size:32px;line-height:1.1;color:rgb(var(--ro))}
.tlr p{font-size:16.5px;line-height:1.7;color:var(--dim)}
.tlr{margin-bottom:22px}
.notes{margin-top:30px;padding-top:18px;border-top:1px solid var(--line);max-width:var(--col)}
.nlist{list-style:none;margin:10px 0 0;padding:0;display:grid;gap:2px}
.nlist li{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:start;border-radius:10px;padding:7px 8px}
.nlist li:hover{background:rgba(255,255,255,.03)}
.nlist .go{display:grid;gap:2px}
.nlist .g1{font-size:14.5px;font-weight:500;line-height:1.35;color:var(--ivory)}
.nlist .g2{font-size:13.5px;line-height:1.45;color:var(--dim)}
/* ⛔ ΤΟ × ΔΕΝ ΚΡΥΒΕΤΑΙ ΠΙΣΩ ΑΠΟ HOVER (σταθ. 56) */
.nlist .x{color:var(--dim);width:30px;height:30px;border-radius:8px;font-size:17px;line-height:1;text-align:center}
.nlist .x:hover{color:#F58B7B;background:rgba(245,139,123,.12)}
.sw2{width:9px;height:9px;border-radius:3px;display:inline-block;margin-right:8px;vertical-align:0}
.sw-h{background:rgb(var(--ro))} .sw-d{background:rgb(var(--hl))}

/* οι πλαγιότιτλοί σου, στο περιθώριο */
.mnote{display:grid;gap:3px;text-align:left;padding-left:12px;border-left:1px solid rgba(var(--ro),.7)}
.mnote .mn{font-family:var(--f-mono);font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--faint)}
.mnote .mt{font-size:14.5px;font-weight:500;line-height:1.35;color:var(--ivory)}
.mnote:hover .mt{text-decoration:underline;text-underline-offset:3px}

/* κλωστές */
.th{display:flex;flex-wrap:wrap;align-items:center;gap:2px 10px;line-height:1.3}
.th .tg{font-family:var(--f-gr);font-style:italic;font-size:16px;color:rgb(var(--gr))}
.th .tl{flex:none;width:28px;height:1px;background:linear-gradient(90deg,rgb(var(--gr)),rgb(var(--ro)))}
.th .tr{font-family:var(--f-gr);font-size:17px;color:rgb(var(--ro))}
.th .tg,.th .tr{min-width:0;overflow-wrap:anywhere}
.th .src{flex-basis:100%;margin-top:1px;font-family:var(--f-mono);font-size:9.5px;letter-spacing:.18em;color:var(--faint)}
.th-h{font-family:var(--f-mono);font-size:9.5px;letter-spacing:.22em;color:var(--faint);text-transform:uppercase}

/* ─── σημάδια μέσα στο κείμενο ─── */
.m-gr{font-family:var(--f-gr);font-style:italic;font-size:1.06em;color:rgb(var(--gr))}
.m-ro{font-family:var(--f-gr);font-size:1.06em;color:rgb(var(--ro))}
button.m-ro{border-bottom:1px dotted rgba(var(--ro),.55);line-height:inherit}
button.m-ro:hover{border-bottom-style:solid}
.m-la{font-family:var(--f-lat);font-style:italic;font-size:1.12em;color:rgb(var(--ro))}
.m-wk{font-family:var(--f-gr);font-style:italic;font-size:1.06em;color:var(--ivory)}
.m-era{display:block;font-family:var(--f-gr);font-style:italic;font-size:1.45em;line-height:1.3;color:var(--ivory)}
.m-date{color:var(--ivory);font-variant-numeric:tabular-nums;border-bottom:1px dotted rgba(245,242,236,.4)}
.m-st,.m-ax{color:var(--ivory);font-weight:600}
.df{background:linear-gradient(transparent 12%,rgba(var(--hl),.2) 12%,rgba(var(--hl),.2) 90%,transparent 90%);
  border-radius:2px;box-decoration-break:clone;-webkit-box-decoration-break:clone;cursor:help}
.hdr{text-decoration:underline;text-decoration-color:rgba(var(--ro),.55);text-underline-offset:5px}
.lit,.hot{background:rgba(var(--ro),.18);border-radius:3px;box-decoration-break:clone;-webkit-box-decoration-break:clone}

/* «Σκέπασε»: κενά ΜΕΣΑ στο κείμενο — το κείμενο κρατάει τη θέση του */
.cov .cvable:not(.rv){color:transparent!important;background:rgba(245,242,236,.09);border-radius:4px;
  border-bottom-color:transparent;cursor:pointer;box-decoration-break:clone;-webkit-box-decoration-break:clone}
.cov .cvable:not(.rv):hover{background:rgba(245,242,236,.15)}
.cov .ruler .now,.cov .ruler .now .nb,.cov .axis .al,.cov .ch-h .per{color:transparent}
.cov .ruler .now{background:rgba(245,242,236,.06);border-radius:6px}
.cov .axis .al{background:rgba(245,242,236,.06)}

/* ─── πορτρέτο ─── */
.port{margin:56px 0 0;padding-top:26px;border-top:1px solid var(--line)}
.port-h{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:end;gap:28px}
.port-h .nm{font-family:var(--f-gr);font-size:clamp(48px,5.6vw,72px);line-height:1;color:rgb(var(--ro))}
.port-h .cnt{text-align:right}
.port-h .cnt b{display:block;font-family:var(--f-lat);font-weight:400;font-size:46px;line-height:.95;color:var(--ivory)}
.port-h .cnt span{display:block;margin-top:5px;font-size:13.5px;color:var(--dim)}
.facts{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid var(--line);border-radius:16px;margin:22px 0 26px;
  background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.008))}
.facts > div{padding:16px 20px;min-width:0}
.facts > div + div{border-left:1px solid var(--line)}
.facts .v{margin-top:8px;font-family:var(--f-gr);font-size:19px;line-height:1.3;color:var(--ivory)}
.facts .v.it{font-style:italic}
.facts .w{display:block;margin-top:6px;line-height:1.25}
.facts .w .m-wk{font-size:18px}
.facts .w .m-la{display:block;font-size:20px}
.facts .no{margin-top:8px;font-size:13.5px;line-height:1.5;color:var(--dim)}
.facts .no .nb{font-family:var(--f-lat);font-size:1.15em}
.facts ul{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:6px}
.facts li{font-size:14px;line-height:1.45;color:var(--text)}
.facts .threads{display:grid;gap:8px;margin-top:8px}
.meetl{margin:8px 0 0}
.meetl summary{cursor:pointer;font-family:var(--f-mono);font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:var(--dim);padding:8px 0;list-style:none}
.meetl summary::-webkit-details-marker{display:none}
.meetl summary::before{content:"+";display:inline-block;width:16px;color:rgb(var(--ro))}
.meetl[open] summary::before{content:"−"}
.ml{display:grid;grid-template-columns:52px minmax(0,1fr);gap:16px;padding:12px 0;border-top:1px solid var(--line);max-width:calc(var(--col) + 68px)}
.ml .c{font-family:var(--f-mono);font-size:12px;letter-spacing:.06em;color:var(--dim);padding-top:3px}
.ml p{margin:0;font-size:15px;line-height:1.7}

/* ─── ο συγκριτικός πίνακας ─── */
.cmpw{margin:64px 0 8px}
.cmpw h3{margin:6px 0 20px;font-family:var(--f-gr);font-style:italic;font-weight:400;font-size:28px;color:var(--ivory)}
.cmp{display:grid;grid-template-columns:130px minmax(0,1fr) minmax(0,1fr);border-top:1px solid var(--line)}
.cmp > div{padding:22px 24px 24px;border-bottom:1px solid var(--line);border-left:1px solid var(--line);min-width:0}
.cmp > .rl,.cmp > .h0{border-left:0;padding-left:0}
.cmp .hd .lbl{display:block;margin-bottom:8px}
.cmp .hd b{display:block;font-family:var(--f-gr);font-style:italic;font-weight:400;font-size:26px;line-height:1.15;color:var(--ivory)}
.cmp .hd span{display:block;margin-top:8px;font-size:13.5px;line-height:1.5;color:var(--dim)}
.cmp .rl{font-family:var(--f-mono);font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--dim);padding-top:26px}
.cmp p{margin:0 0 .9em;font-size:15.5px;line-height:1.72}
.cmp p:last-child{margin-bottom:0}
.cmp .k{display:none}

/* ─── η σύνοψη ─── */
.sum h2{margin:8px 0 22px;font-family:var(--f-gr);font-style:italic;font-weight:400;font-size:40px;color:var(--ivory)}
.sgrid{display:grid;border-top:1px solid var(--line)}
.sgrid > div{padding:16px 16px 18px;border-bottom:1px solid var(--line);border-left:1px solid var(--line);min-width:0}
.sgrid > .ln{border-left:0;padding-left:0;font-family:var(--f-gr);font-style:italic;font-size:20px;color:var(--ivory)}
.sgrid .hd{padding-top:14px}
.sgrid .hd b{display:block;font-family:var(--f-mono);font-size:11px;font-weight:400;letter-spacing:.12em;color:var(--ivory)}
.sgrid .hd span{display:block;margin-top:4px;font-size:12.5px;line-height:1.4;color:var(--dim)}
.sgrid .h0{border-left:0}
.sgrid .cl{display:none;font-family:var(--f-mono);font-size:10px;letter-spacing:.18em;color:var(--faint);margin-bottom:8px}
.au{display:block;margin-bottom:12px}
.au:last-child{margin-bottom:0}
.au button{font-family:var(--f-gr);font-size:18px;color:rgb(var(--ro));border-bottom:1px dotted rgba(var(--ro),.5)}
.au .md{display:flex;flex-wrap:wrap;align-items:center;gap:2px 8px;margin-top:3px;font-family:var(--f-gr);font-style:italic;font-size:14.5px;color:rgb(var(--gr))}
.au .md i{flex:none;width:18px;height:1px;background:linear-gradient(90deg,rgb(var(--ro)),rgb(var(--gr)))}

/* ─── οι πίνακες (δεύτερος κόσμος) ─── */
.tb-h{margin:56px 0 18px}
.tb-h h2{margin:6px 0 0;font-family:var(--f-gr);font-style:italic;font-weight:400;font-size:36px;color:var(--ivory)}
.tb-h p{margin:10px 0 0;max-width:66ch;font-size:15px;line-height:1.7;color:var(--dim)}
.tbwrap{overflow-x:auto}
table{width:100%;border-collapse:collapse}
th{text-align:left;font-family:var(--f-mono);font-size:10px;font-weight:400;letter-spacing:.2em;text-transform:uppercase;color:var(--faint);
  border-bottom:1px solid var(--line2);padding:0 18px 11px 0}
td{border-bottom:1px solid var(--line);padding:16px 18px 16px 0;vertical-align:top;line-height:1.6}
td.c{font-family:var(--f-mono);font-size:12px;color:var(--dim);white-space:nowrap}
td.ph{font-size:14.5px;color:var(--text);min-width:20ch}
td.ar{color:var(--faint);padding-right:12px}
td button.m-ro{border-bottom:1px dotted rgba(var(--ro),.55)}
.rule{margin-top:26px;max-width:74ch;font-size:14.5px;line-height:1.75;color:var(--dim)}
.rule b{color:var(--ivory);font-weight:500}

/* ─── επιλογή · παράθυρο · σύννεφο · μήνυμα · διάλογος ─── */
.selbar{position:fixed;z-index:70;display:flex;gap:4px;background:var(--ivory);border-radius:12px;padding:5px;transform:translate(-50%,-100%)}
.selbar[hidden],.pop[hidden],.tip[hidden],.toast[hidden]{display:none}
.selbar button{color:#0d111a;font-size:13.5px;font-weight:600;padding:7px 11px;border-radius:8px;display:flex;align-items:center;gap:7px;white-space:nowrap}
.selbar button:hover{background:rgba(13,17,26,.1)}
.pop{position:fixed;z-index:80;width:min(380px,calc(100vw - 32px));background:#16161a;border:1px solid var(--line2);border-radius:16px;padding:17px}
.pop h5{margin:0;font-family:var(--f-mono);font-size:10px;font-weight:400;letter-spacing:.18em;text-transform:uppercase;color:var(--dim)}
.pop .pv{margin:9px 0 13px;padding:9px 11px;border-radius:10px;background:rgba(255,255,255,.04);font-size:14px;line-height:1.55;color:var(--text);max-height:112px;overflow:auto}
.pop input{width:100%;border:1px solid var(--line2);background:var(--bg);border-radius:10px;padding:10px 12px;font-size:15.5px;font-family:inherit;color:var(--ivory)}
.pop input:focus{outline:none;border-color:rgba(var(--ro),.8)}
.pop .acts{display:flex;justify-content:flex-end;gap:8px;margin-top:13px}
.btn{border:1px solid var(--line2);border-radius:10px;padding:9px 15px;font-size:14px;font-weight:500;color:var(--ivory)}
.btn.primary{background:var(--ivory);border-color:var(--ivory);color:#0d111a}
.btn.ghost{border-color:transparent;color:var(--dim)}
.tip{position:fixed;z-index:75;max-width:330px;background:var(--ivory);color:#0d111a;border-radius:12px;padding:11px 14px;font-size:14px;line-height:1.5;pointer-events:none}
.tip b{display:block;font-family:var(--f-gr);font-weight:400;font-size:17px;margin-bottom:2px}
.tip .t2{display:block;margin-top:5px;font-family:var(--f-mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:#40444d}
.toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:90;background:var(--ivory);color:#0d111a;border-radius:12px;
  padding:12px 17px;font-size:14px;font-weight:500;display:flex;gap:14px;align-items:center;max-width:calc(100vw - 32px)}
.toast button{color:#8A3A1E;font-weight:600}
dialog.ptd{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);margin:0;width:min(860px,calc(100vw - 32px));
  max-height:calc(100dvh - 48px);overflow:auto;background:#0b0b0d;color:var(--text);border:1px solid var(--line2);border-radius:18px;padding:28px 30px 30px}
dialog.ptd::backdrop{background:rgba(0,0,0,.7)}
dialog.ptd:focus{outline:none}
dialog.ptd .port{margin:0;padding:0;border:0}
dialog.ptd .x{display:block;margin:-8px -6px 10px auto;font-family:var(--f-mono);font-size:12px;letter-spacing:.06em;color:var(--dim);padding:8px 6px}
dialog.ptd .x:hover{color:var(--ivory)}
dialog.ptd .ptxt p{margin:0 0 1em;font-size:17px;line-height:1.8}
.banner{margin:18px 0 0;padding:13px 16px;border-radius:12px;border:1px solid var(--line2);font-size:14px;line-height:1.6;color:var(--text)}
.banner b{color:var(--ivory)}
.foot{margin:96px 0 72px;padding-top:22px;border-top:1px solid var(--line);font-size:14px;line-height:1.8;color:var(--dim);max-width:74ch}
.foot b{color:var(--ivory);font-weight:500}

/* ══ ΤΟ ΤΗΛΕΦΩΝΟ ΜΑΖΕΥΕΙ — μόνο max-width ══ */
@media (max-width:1040px){
  .legend{grid-template-columns:repeat(2,minmax(0,1fr))}
  .stage{grid-template-columns:120px minmax(0,1fr);gap:28px}
  .row{grid-template-columns:minmax(0,1fr) 210px;gap:26px}
  .ruler .now .nb{font-size:36px}
  .facts{grid-template-columns:repeat(2,minmax(0,1fr))}
  .facts > div:nth-child(3){border-left:0}
  .facts > div:nth-child(n+3){border-top:1px solid var(--line)}
}
@media (max-width:860px){
  .wrap{padding-inline:16px}
  .cover{grid-template-columns:minmax(0,1fr);gap:28px}
  .meet{text-align:left} .meet .cap{margin-left:0} .meet .dots{justify-content:flex-start}
  .duo{grid-template-columns:minmax(0,1fr);gap:14px;padding:18px 20px}
  .duo .ar{width:1px;height:22px;margin-left:12px;background:linear-gradient(180deg,rgba(var(--ro),.25),rgba(var(--ro),.8))}
  .duo .it:last-child{text-align:left}
  .era .nm{display:none}
  .chb{font-size:10px}
  .tick.mid{display:none}
  .ch-h{flex-wrap:wrap}
  .rd{margin-left:0}
  .stage{grid-template-columns:minmax(0,1fr);gap:0}
  .ruler{top:44px;z-index:30;background:rgba(6,6,7,.95);-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);
    padding:8px 0;margin-bottom:18px;border-bottom:1px solid var(--line)}
  .ruler:empty{display:none}
  .ruler .now{min-height:0;font-size:14px}
  .ruler .now .nb{font-size:26px}
  .axis{display:none}
  .row{grid-template-columns:minmax(0,1fr);gap:10px}
  .marg .mnote{display:none}
  .inl{display:grid;margin-bottom:8px}
  .marg{padding-top:0}
  .row.sos p::after{position:static;display:inline-block;margin-left:9px;vertical-align:2px}
  .cmp{grid-template-columns:minmax(0,1fr)}
  .cmp > div{padding:16px 0;border-left:0}
  .cmp .hd,.cmp .h0{display:none}
  .cmp .k{display:block;font-family:var(--f-gr);font-style:italic;font-size:19px;color:var(--ivory);margin-bottom:8px}
  .port-h{grid-template-columns:minmax(0,1fr)} .port-h .cnt{text-align:left}
  .sgrid{grid-template-columns:minmax(0,1fr)!important}
  .sgrid > div{border-left:0;padding-left:0}
  .sgrid .hd,.sgrid .h0{display:none}
  .sgrid .cl{display:block}
  .tabs{margin-left:0}
  dialog.ptd{padding:22px 18px}
}
@media (max-width:560px){
  .row p{font-size:17px;line-height:1.8}
  .cover .lead{font-size:21px}
  .duo .l{font-size:32px}
  .legend{grid-template-columns:minmax(0,1fr)}
  .facts{grid-template-columns:minmax(0,1fr)}
  .facts > div + div{border-left:0;border-top:1px solid var(--line)}
  .plates{grid-template-columns:minmax(0,1fr)}
  .row.ni{padding-left:36px} .row.ni p::before{left:-36px;font-size:28px}
  .nums-in .brk{display:none}
}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}
</style>
</head>
<body>

<div class="wrap route">
  <a class="back" href="latinika.html">&#8592; Λατινικά</a>
  <span class="crumb">MÉTRON · Λατινικά · Εισαγωγή</span>
  <div class="tabs" role="tablist" aria-label="Κόσμοι">
    <button type="button" id="wA" role="tab" aria-selected="true" aria-controls="worldA">Η εισαγωγή</button>
    <button type="button" id="wB" role="tab" aria-selected="false" aria-controls="worldB">Οι πίνακες</button>
  </div>
</div>

<nav class="nums" id="numsBar" aria-label="Κεφάλαια"><div class="wrap bar">
  <div class="nums-in" id="nums"></div>
  <button type="button" class="cvbtn" id="cvbtn" aria-pressed="false">Σκέπασε</button>
</div><div class="wrap"><p class="cv-hint" id="cvhint" hidden>Ονόματα, χρονολογίες, τίτλοι και όροι έγιναν κενά μέσα στο κείμενο. Πάτα ένα κενό για να το δεις.</p></div></nav>

<main class="world wrap" id="worldA" role="tabpanel" aria-labelledby="wA">
  <div class="banner" id="gate" hidden></div>
  <header class="cover" id="cover"></header>
  <div class="duo" id="duo"></div>
  <section class="sec" id="eras" aria-label="Οι εποχές"></section>
  <div id="chapters"></div>
  <section class="sec sum" id="summary" aria-label="Όλη η εισαγωγή"></section>
  <p class="foot">Το κείμενο είναι <b>αυτούσιο</b> από τις σημειώσεις σου — κάθε σημάδι πάνω του δείχνει σε θέση της πηγής.
  Διάλεξε κείμενο με το ποντίκι για να βάλεις <b>πλαγιότιτλο</b> ή <b>ορισμό</b>· πάτα ένα όνομα για τον <b>φάκελό</b> του.
  Τα κόκκινα <b>SOS</b> είναι δικά σου. Οι σημειώσεις σου <b>συγχρονίζονται</b>· η ένδειξη «το διάβασα» ζει σε αυτή τη συσκευή.</p>
</main>

<main class="world wrap" id="worldB" role="tabpanel" aria-labelledby="wB" hidden>
  <div id="tables"></div>
</main>

<div class="selbar" id="selbar" hidden role="toolbar" aria-label="Επιλογή κειμένου">
  <button type="button" id="bHead"><span class="sw2 sw-h"></span>Πλαγιότιτλος</button>
  <button type="button" id="bDef"><span class="sw2 sw-d"></span>Ορισμός</button>
</div>
<div class="pop" id="pop" hidden role="dialog"></div>
<div class="tip" id="tip" hidden></div>
<div class="toast" id="toast" hidden role="status"></div>
<dialog class="ptd" id="ptd" aria-label="Πορτρέτο"></dialog>

<script src="vendor/supabase.min.js"></script>
<script src="sync.js" defer></script>
<script>
/* ΤΟ ΥΛΙΚΟ: η πηγή αυτούσια (src) + τα σημάδια ως δείκτες. Παράγεται από το build. */
var EIS = /*@@EIS@@*/null;
</script>
<script>
(function(){
'use strict';
var D = EIS, SRC = D.src, ERR = [];
var $ = function(s, r){ return (r || document).querySelector(s); };
var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function uid(){ return Math.random().toString(36).slice(2, 9); }
/* ΙΔΙΑ με το lib.js */
function find(line, t, n){
  var at = -1, from = 0;
  for(var k = 0; k <= (n || 0); k++){ at = line.indexOf(t, from); if(at < 0) return -1; from = at + t.length; }
  return at;
}
/* ένας δείκτης → το κείμενό του, ΑΠΟ ΤΗΝ ΠΗΓΗ. Αν δεν βρεθεί, το λέει. */
function P(p){
  var line = SRC[p.l - 1] || '', at = find(line, p.t, p.n);
  if(at < 0){ ERR.push('«' + p.t + '» · γραμμή ' + p.l); return ''; }
  return line.slice(at, at + p.t.length);
}
/* ψηφία στη Instrument Serif, όλα τα υπόλοιπα στην ελληνική — ποτέ ανάποδα */
function numHTML(s){ return esc(s).replace(/\d+/g, function(d){ return '<span class="nb">' + d + '</span>'; }).replace(/-/g, '-<wbr>'); }

var CH = {}; D.chapters.forEach(function(c){ CH[c.id] = c; });
var PPL = {}; D.people.forEach(function(p){ PPL[p.id] = p; });
var FIGS = {}; D.figs.forEach(function(l){ FIGS[l] = 1; }); D.fns.forEach(function(l){ FIGS[l] = 1; });
var SOS = {}; (D.sos || []).forEach(function(l){ SOS[l] = 1; });
function chapterOfLine(l){ var c = null; D.chapters.forEach(function(x){ if(l >= x.lines[0] && l <= x.lines[1]) c = x; }); return c; }
/* ένα σημάδι Ρωμαίου είναι ΠΡΟΣΩΠΟ αν είναι μία από τις μορφές του */
function personOf(t){ var r = null; D.people.forEach(function(p){ if(p.forms.indexOf(t) >= 0) r = p; }); return r; }
var PAIRAT = {};
D.pairs.forEach(function(pr, i){
  [pr.gr, pr.ro].forEach(function(e){ var k = e.l + '|' + e.t + '|' + (e.n || 0); PAIRAT[k] = (PAIRAT[k] || []).concat('p' + i); });
});
function modelsOf(Pn){ return D.pairs.map(function(pr, i){ return { pr:pr, i:i }; }).filter(function(x){ return Pn.forms.indexOf(x.pr.ro.t) >= 0; }); }

/* ══ ΜΟΝΑΔΕΣ ΚΕΦΑΛΑΙΟΥ — ίδια σειρά και ίδιες θέσεις χαρακτήρων με την
   als-v579 (το test το αποδεικνύει με sha ανά κεφάλαιο). ══ */
function unitLines(ch){
  var out = [];
  ch.blocks.forEach(function(B){
    if(B.b === 'p') out.push(B.l);
    else if(B.b === 'num') B.ls.forEach(function(l){ out.push(l); });
    else if(B.b === 'dots') B.items.forEach(function(it){ out.push(it.l); (it.more || []).forEach(function(l){ out.push(l); }); });
    else if(B.b === 'genre') B.ls.forEach(function(l){ out.push(l); });
    else if(B.b === 'per') PPL[B.who].ls.forEach(function(l){ out.push(l); });
  });
  return out;
}
/* γραμμή → καθαρό κείμενο (χωρίς δείκτες υποσημείωσης) + χάρτης θέσεων */
function lineMap(l){
  var line = SRC[l - 1], drop = {}, supAt = {}, plain = '', map = [], i;
  (D.sups || []).forEach(function(s){
    if(s.l !== l) return;
    var at = find(line, s.t, s.n); if(at < 0) return;
    for(var k = at; k < at + s.t.length; k++) drop[k] = 1;
  });
  for(i = 0; i < line.length; i++){
    map.push(plain.length);
    if(drop[i]){ supAt[plain.length] = (supAt[plain.length] || '') + line.charAt(i); continue; }
    plain += line.charAt(i);
  }
  map.push(plain.length);
  return { line:line, plain:plain, map:map, supAt:supAt };
}
D.chapters.forEach(function(ch){
  var off = 0; ch.units = {};
  unitLines(ch).forEach(function(l){ var m = lineMap(l); ch.units[l] = { s:off, plain:m.plain }; off += m.plain.length + 2; });
  ch.full = unitLines(ch).map(function(l){ return ch.units[l].plain; }).join('\n\n');
});

/* ══════════════════════════════════════════════════════════════════
   ΟΙ ΣΗΜΕΙΩΣΕΙΣ — ΣΥΓΧΡΟΝΙΖΟΝΤΑΙ. Μία κλείδα ανά κεφάλαιο, πρόθεμα
   `eis:notes:`, πίνακες από {id,ts}. ⛔ Το `eisagogi:v1` («το διάβασα»)
   ΜΕΝΕΙ device-local — χάρτης από booleans (σταθ. 31).
   ══════════════════════════════════════════════════════════════════ */
var NKEY = 'eis:notes:', TOMB_KEY = '__synctomb__eisagogi';
var NOTE_FIELDS = ['heads','defs'];
var READ_KEY = 'eisagogi:v1';
var NOTES = {}, undoStack = [], cloudOn = false;

function lsGet(k, d){ try{ var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch(e){ return d; } }
function normNotes(o){
  var n = { heads:[], defs:[] };
  if(o && typeof o === 'object'){
    NOTE_FIELDS.forEach(function(f){ if(Array.isArray(o[f])) n[f] = o[f].filter(function(x){
      return x && typeof x === 'object' && typeof x.s === 'number' && typeof x.e === 'number'; }); });
  }
  return n;
}
function loadNotes(ch){ NOTES[ch] = normNotes(lsGet(NKEY + ch, null)); untombNotes(ch); }
function saveNotes(ch){
  try{ localStorage.setItem(NKEY + ch, JSON.stringify(NOTES[ch])); return true; }
  catch(e){ toast('Δεν αποθηκεύτηκε — ο χώρος της συσκευής είναι γεμάτος'); return false; }
}
/* ⛔⛔ Η ΤΑΦΟΠΛΑΚΑ ΓΡΑΦΕΤΑΙ ΑΠΟ ΤΗ ΣΕΛΙΔΑ, ΤΗ ΣΤΙΓΜΗ ΤΟΥ ΣΒΗΣΙΜΑΤΟΣ
   (σταθ. 32 + 61 — ίδιος κανόνας με την als-v579, ποτέ «βελτιωμένος»).
   T = max(now, ts+1) ώστε να κυριαρχεί πάνω στη σφραγίδα του αντικειμένου. */
function tombNote(ch, field, id, ts){
  var k = NKEY + ch, slot = 'id:' + id;
  try{
    var t = JSON.parse(localStorage.getItem(TOMB_KEY) || '{}');
    if(!t || typeof t !== 'object' || Array.isArray(t)) t = {};
    var node = t[k];
    if(!node || typeof node !== 'object' || Array.isArray(node)){ node = {}; t[k] = node; }
    var leaf = node[field];
    if(!leaf || typeof leaf !== 'object' || Array.isArray(leaf)){ leaf = {}; node[field] = leaf; }
    var cur = typeof leaf[slot] === 'number' ? leaf[slot] : 0;
    var T = Math.max(cur, Date.now(), (+ts || 0) + 1);
    leaf[slot] = T;
    localStorage.setItem(TOMB_KEY, JSON.stringify(t));
    /* ⭐ ΣΤΑΘ. 10: «σφράγισα» ΜΟΝΟ αν το ξαναδιάβασα — σε Safari το localStorage ΣΩΠΑΙΝΕΙ */
    var back = JSON.parse(localStorage.getItem(TOMB_KEY) || '{}');
    return !!(back[k] && back[k][field] && back[k][field][slot] >= T);
  } catch(e){ return false; }
}
/* Ό,τι ΞΑΝΑΖΕΙ δεν έχει ταφόπλακα — αλλιώς η αναίρεση αναιρείται μόνη της. */
function untombNotes(ch){
  var k = NKEY + ch, t, node, touched = false;
  try{ t = JSON.parse(localStorage.getItem(TOMB_KEY) || '{}'); } catch(e){ return; }
  if(!t || typeof t !== 'object' || Array.isArray(t)) return;
  node = t[k];
  if(!node || typeof node !== 'object' || Array.isArray(node)) return;
  NOTE_FIELDS.forEach(function(f){
    var leaf = node[f];
    if(!leaf || typeof leaf !== 'object' || Array.isArray(leaf)) return;
    (NOTES[ch][f] || []).forEach(function(it){
      if(leaf['id:' + it.id] !== undefined){ delete leaf['id:' + it.id]; touched = true; }
    });
  });
  if(touched){ try{ localStorage.setItem(TOMB_KEY, JSON.stringify(t)); } catch(e){} }
}
/* ⛔⛔ ΜΙΑ — ΚΑΙ ΜΟΝΟ ΜΙΑ — ΣΥΝΑΡΤΗΣΗ ΣΒΗΝΕΙ ΣΗΜΕΙΩΣΗ (σταθ. 61). */
function removeNote(ch, field, id){
  var notes = NOTES[ch], arr = notes[field] || [], hit = null;
  arr.forEach(function(x){ if(x.id === id) hit = x; });
  if(!hit) return false;
  undoStack.push({ ch:ch, field:field, item:hit });
  notes[field] = arr.filter(function(x){ return x.id !== id; });
  if(!saveNotes(ch)){ notes[field] = arr; undoStack.pop(); return false; }
  tombNote(ch, field, id, hit.ts);
  renderChapter(ch);
  return true;
}
function undo(){
  var u = undoStack.pop(); if(!u) return;
  u.item.ts = Date.now();
  NOTES[u.ch][u.field].push(u.item);
  if(saveNotes(u.ch)){ untombNotes(u.ch); renderChapter(u.ch); }
}
function addNote(ch, field, rec){
  rec.id = uid(); rec.ts = Date.now();
  NOTES[ch][field].push(rec);
  if(!saveNotes(ch)){ NOTES[ch][field].pop(); return false; }
  renderChapter(ch); return true;
}
/* «το διάβασα» — device-local */
function readMap(){ var m = lsGet(READ_KEY, {}); return (m && typeof m === 'object' && !Array.isArray(m)) ? m : {}; }
function toggleRead(id){
  var m = readMap(); m[id] = !m[id];
  try{ localStorage.setItem(READ_KEY, JSON.stringify(m)); }
  catch(e){ toast('Δεν αποθηκεύτηκε σε αυτή τη συσκευή'); return; }
  paintBar(); paintRead();
}

/* ══ ΜΙΑ ΓΡΑΜΜΗ ΤΗΣ ΠΗΓΗΣ → HTML, με όλα τα στρώματα: σημάδια + δικές σου
   σημειώσεις. Με κεφάλαιο, κάθε κομμάτι κουβαλάει data-o (θέση στο κείμενο
   του κεφαλαίου) ώστε η επιλογή να γίνει πλαγιότιτλος. ══ */
var MK = 0;
var COVERABLE = { gr:1, ro:1, la:1, date:1, wk:1 };
function renderLine(l, chId){
  var M = lineMap(l), n = M.plain.length; if(!n) return '';
  var cls = new Array(n), meta = new Array(n), i;
  for(i = 0; i < n; i++){ cls[i] = ''; meta[i] = null; }
  function paint(s, e, c, key, val){
    s = Math.max(0, s); e = Math.min(n, e);
    for(var k = s; k < e; k++){
      if(c && (' ' + cls[k] + ' ').indexOf(' ' + c + ' ') < 0) cls[k] = cls[k] ? cls[k] + ' ' + c : c;
      if(key){ if(!meta[k]) meta[k] = {}; meta[k][key] = val; }
    }
  }
  (D.marks[l] || []).forEach(function(m){
    var at = find(M.line, m.t, m.n);
    if(at < 0){ ERR.push('«' + m.t + '» · γραμμή ' + l); return; }
    var s = M.map[at], e = M.map[at + m.t.length], id = 'k' + (++MK);
    paint(s, e, 'm-' + m.k + (COVERABLE[m.k] ? ' cvable' : ''), 'mk', id);
    var pr = PAIRAT[l + '|' + m.t + '|' + (m.n || 0)];
    if(pr) paint(s, e, null, 'pr', pr.join(' '));
    if(m.k === 'ro'){ var who = personOf(m.t); if(who) paint(s, e, null, 'p', who.id); }
    if(m.k === 'gr') paint(s, e, null, 'g', m.t);
  });
  var base = 0;
  if(chId){
    var u = CH[chId].units[l]; base = u ? u.s : 0;
    if(u){
      NOTES[chId].heads.forEach(function(H){
        paint(H.s - base, H.e - base, 'hdr', 'h', H.id);
        var a = H.s - base; if(a >= 0 && a < n) paint(a, a + 1, 'held');
      });
      NOTES[chId].defs.forEach(function(Df){ paint(Df.s - base, Df.e - base, 'df', 'd', Df.id); });
    }
  }
  var out = '', run = null;
  function flush(){
    if(!run) return;
    var a = chId ? ' data-o="' + (base + run.i) + '"' : '', tag = 'span', m = run.m;
    if(m){
      if(m.h) a += ' data-h="' + m.h + '"';
      if(m.d) a += ' data-d="' + m.d + '"';
      if(m.mk) a += ' data-mk="' + m.mk + '"';
      if(m.pr) a += ' data-pair="' + m.pr + '"';
      if(m.g) a += ' data-g="' + esc(m.g) + '"';
      if(m.p){ a += ' data-p="' + m.p + '" type="button"'; tag = 'button'; }
    }
    out += '<' + tag + ' class="seg ' + run.c + '"' + a + '>' + esc(run.t) + '</' + tag + '>';
    run = null;
  }
  for(i = 0; i < n; i++){
    if(M.supAt[i] !== undefined){ flush(); out += '<sup>' + esc(M.supAt[i]) + '</sup>'; }
    var m = meta[i];
    var sig = cls[i] + '|' + (m ? [m.h, m.d, m.mk, m.pr, m.p, m.g].join('/') : '');
    if(!run || run.sig !== sig){ flush(); run = { sig:sig, c:cls[i], m:m, i:i, t:'' }; }
    run.t += M.plain.charAt(i);
  }
  flush();
  if(M.supAt[n] !== undefined) out += '<sup>' + esc(M.supAt[n]) + '</sup>';
  return out;
}

/* κλωστή: πρότυπο → μιμητής, δύο άκρα της ΙΔΙΑΣ γραμμής της πηγής */
function thread(pr, i, withSrc){
  var c = chapterOfLine(pr.gr.l);
  return '<div class="th" data-pair="p' + i + '"><span class="tg cvable">' + esc(P(pr.gr)) + '</span><span class="tl" aria-hidden="true"></span>'
       + '<span class="tr cvable">' + esc(P(pr.ro)) + '</span>'
       + (withSrc && c ? '<span class="src">ΚΕΦ. ' + c.n + '</span>' : '') + '</div>';
}
function threadsOfLine(l){
  var h = '';
  D.pairs.forEach(function(pr, i){ if(pr.gr.l === l) h += thread(pr, i, false); });
  return h ? '<span class="th-h">Ελλάδα → Ρώμη</span>' + h : '';
}
/* οι πλαγιότιτλοί σου που ξεκινούν σε αυτή τη μονάδα */
function headsOfLine(chId, l){
  var u = CH[chId].units[l]; if(!u) return { marg:'', inl:'' };
  var hs = NOTES[chId].heads.slice().sort(function(a, b){ return a.s - b.s; }), marg = '', inl = '';
  hs.forEach(function(H, k){
    if(H.s >= u.s && H.s < u.s + u.plain.length + 2){
      var b = '<span class="mn">Πλαγιότιτλος ' + (k + 1) + '</span><span class="mt">' + esc(H.title) + '</span></button>';
      marg += '<button class="mnote" type="button" data-jh="' + H.id + '" data-ch="' + chId + '">' + b;
      inl += '<button class="mnote inl" type="button" data-jh="' + H.id + '" data-ch="' + chId + '">' + b;
    }
  });
  return { marg:marg, inl:inl };
}
function row(chId, l, cls, attrs){
  var hd = headsOfLine(chId, l);
  return '<div class="row' + (cls ? ' ' + cls : '') + (SOS[l] ? ' sos' : '') + '" data-l="' + l + '">'
       + '<div class="txt">' + hd.inl + '<p' + (attrs || '') + '>' + renderLine(l, chId) + '</p></div>'
       + '<aside class="marg">' + hd.marg + threadsOfLine(l) + '</aside></div>';
}
function figHTML(l){ return '<div class="fig"><span class="lbl">Εικόνα</span>' + esc(SRC[l - 1]) + '</div>'; }
function fnHTML(l){
  var t = SRC[l - 1], m = t.match(/^(\d+)\s(.*)$/);
  return '<div class="fn">' + (m ? '<sup>' + esc(m[1]) + '</sup>' + esc(m[2]) : esc(t)) + '</div>';
}

/* ══ ΠΟΡΤΡΕΤΟ — όσα λέει η πηγή για ένα πρόσωπο, τίποτα δικό μου ══ */
function mentionsOf(Pn){
  var out = [], forms = Pn.forms.slice().sort(function(a, b){ return b.length - a.length; });
  SRC.forEach(function(line, i){
    if(FIGS[i + 1]) return;
    var taken = {};
    forms.forEach(function(f){
      var from = 0, at;
      while((at = line.indexOf(f, from)) >= 0){
        var free = true;
        for(var z = at; z < at + f.length; z++) if(taken[z]) free = false;
        if(free){ for(var y = at; y < at + f.length; y++) taken[y] = 1; out.push({ l:i + 1, at:at, len:f.length }); }
        from = at + f.length;
      }
    });
  });
  return out.sort(function(a, b){ return a.l - b.l || a.at - b.at; });
}
/* η πρόταση γύρω από μια θέση — κόβει ΜΟΝΟ σε τελεία + κενό + ΚΕΦΑΛΑΙΟ,
   ώστε το «π.χ.» και το «π.Χ.) ανθεί» να μη σπάνε πρόταση */
function sentence(line, a0, b0){
  var a = 0, b = line.length, re = /[.;·](?=\s+[«(]?[A-ZΑ-ΩΆΈΉΊΌΎΏ])/g, m;
  while((m = re.exec(line))){
    /* ένα γράμμα + τελεία («Ν.», το «Χ.» του «π.Χ.») είναι συντομογραφία, όχι τέλος */
    if(line.charAt(m.index) === '.' && /(^|[\s(.])[^\s(.]$/.test(line.slice(Math.max(0, m.index - 2), m.index))) continue;
    if(m.index < a0) a = m.index + 2; else if(m.index >= b0){ b = m.index + 1; break; }
  }
  return { a:a, b:b };
}
function workHTML(w){
  return '<span class="w">' + (w.gr ? '<span class="m-wk cvable">' + esc(P(w.gr)) + '</span>' : '')
       + (w.la ? '<span class="m-la cvable">' + esc(P(w.la)) + '</span>' : '') + '</span>';
}
function portraitHTML(Pn, withText){
  var ch = null; D.chapters.forEach(function(c){ if(c.n === Pn.ch) ch = c; });
  var mm = mentionsOf(Pn), md = modelsOf(Pn);
  var h = '<div class="port"' + (withText ? '' : ' id="pt-' + Pn.id + '"') + '><div class="port-h"><div><span class="lbl">' + esc('Κεφάλαιο ' + Pn.ch + (ch && ch.pre ? ' ' + ch.pre : '') + ' · πορτρέτο') + '</span>'
        + '<div class="nm cvable">' + esc(P(Pn.name)) + '</div></div>'
        + '<div class="cnt"><b>' + mm.length + '</b><span>' + (mm.length === 1 ? 'φορά' : 'φορές') + ' στην εισαγωγή</span></div></div>';
  h += '<div class="facts">'
     + '<div><span class="lbl">Είδος</span><div class="v it">' + esc(Pn.genre) + '</div></div>'
     + '<div><span class="lbl">Εποχή</span><div class="v">' + (ch ? esc(ch.title) : '') + '</div>'
     + (ch && ch.sup ? '<div class="no">' + numHTML(ch.sup) + '</div>' : '') + '</div>'
     + '<div><span class="lbl">' + (Pn.works.length ? 'Έργα' : 'Έγραψε') + '</span>'
     + (Pn.works.length ? Pn.works.map(workHTML).join('')
        : (Pn.wrote ? '<ul>' + Pn.wrote.map(function(w){ return '<li>' + esc(P(w)) + '</li>'; }).join('') + '</ul>' : '')
          + '<div class="no">Η πηγή δεν δίνει τίτλο έργου.</div>')
     + '</div>'
     + '<div><span class="lbl">Ελληνικό πρότυπο</span>'
     + (md.length ? '<div class="threads">' + md.map(function(x){ return thread(x.pr, x.i, true); }).join('') + '</div>'
                  : '<div class="no">Η πηγή δεν ονομάζει πρότυπο.</div>')
     + '</div></div>';
  if(withText) h += '<div class="ptxt">' + Pn.ls.map(function(l){ return '<p>' + renderLine(l, null) + '</p>'; }).join('') + '</div>';
  h += '<details class="meetl"><summary>Πού τον συναντάς · ' + mm.length + '</summary>' + mm.map(function(w){
         var line = SRC[w.l - 1], s = sentence(line, w.at, w.at + w.len), c = chapterOfLine(w.l);
         return '<div class="ml"><span class="c">' + esc(c ? c.n : '') + '</span><p>' + esc(line.slice(s.a, w.at))
              + '<span class="m-ro">' + esc(line.substr(w.at, w.len)) + '</span>' + esc(line.slice(w.at + w.len, s.b)) + '</p></div>';
       }).join('') + '</details>';
  return h + '</div>';
}
function openPortrait(id){
  var Pn = PPL[id]; if(!Pn) return;
  var d = $('#ptd');
  d.innerHTML = '<button type="button" class="x" data-close>Κλείσιμο ×</button>' + portraitHTML(Pn, true);
  if(typeof d.showModal === 'function'){ if(!d.open) d.showModal(); } else d.setAttribute('open', '');
  /* ο διάλογος παίρνει την εστίαση ο ίδιος — όχι δαχτυλίδι πάνω στο «Κλείσιμο» */
  d.tabIndex = -1; d.focus({ preventScroll:true }); d.scrollTop = 0;
}

/* ══ ΤΟ ΚΕΦΑΛΑΙΟ ══ */
function datesOf(ch){
  var out = [];
  for(var l = ch.lines[0]; l <= ch.lines[1]; l++){
    if(FIGS[l]) continue;
    (D.marks[l] || []).filter(function(m){ return m.k === 'date'; })
      .map(function(m){ return { l:l, m:m, at:find(SRC[l - 1], m.t, m.n) }; })
      .sort(function(a, b){ return a.at - b.at; })
      .forEach(function(x){ out.push(x); });
  }
  return out;
}
function rulerHTML(ch){
  var ds = datesOf(ch); ch._dates = ds;
  if(!ds.length) return '<aside class="ruler" aria-hidden="true"></aside>';
  var lo = Infinity, hi = -Infinity;
  ds.forEach(function(x){ [x.m.y, x.m.y2].forEach(function(y){ if(y === undefined) return; lo = Math.min(lo, y); hi = Math.max(hi, y); }); });
  var h = '<aside class="ruler"><div class="now pre" data-now>' + numHTML(ds[0].m.t) + '</div>';
  if(hi > lo){
    var H = 250, yp = function(y){ return (y - lo) / (hi - lo) * H; }, labels = [];
    h += '<div class="axis" aria-hidden="true">';
    ds.forEach(function(x, i){
      var a = yp(x.m.y), b = x.m.y2 !== undefined ? yp(x.m.y2) : null;
      h += b !== null ? '<span class="rg" data-i="' + i + '" style="top:' + a.toFixed(1) + 'px;height:' + Math.max(2, b - a).toFixed(1) + 'px"></span>'
                      : '<span class="pt" data-i="' + i + '" style="top:' + a.toFixed(1) + 'px"></span>';
      labels.push({ i:i, y:b !== null ? (a + b) / 2 : a, t:x.m.t });
    });
    /* οι ετικέτες δεν πατάνε η μία την άλλη· μία φορά η καθεμία */
    labels.sort(function(a, b){ return a.y - b.y; });
    var seen = {}, last = -99;
    labels.forEach(function(Lb){
      if(seen[Lb.t]) return; seen[Lb.t] = 1;
      var y = Math.max(Lb.y, last + 13); last = y;
      h += '<span class="al" data-i="' + Lb.i + '" data-t="' + esc(Lb.t) + '" style="top:' + y.toFixed(1) + 'px">' + esc(Lb.t) + '</span>';
    });
    h += '</div>';
  }
  return h + '</aside>';
}
function blocksHTML(ch){
  var h = '', ni = 0;
  ch.blocks.forEach(function(B){
    if(B.b === 'sub') h += '<div class="sub"><h3>' + esc(B.h) + '</h3><i></i></div>';
    else if(B.b === 'p') h += row(ch.id, B.l, '');
    else if(B.b === 'num') B.ls.forEach(function(l){ h += row(ch.id, l, 'ni', ' data-n="' + (++ni) + '"'); });
    else if(B.b === 'dots') B.items.forEach(function(it){
      h += row(ch.id, it.l, 'lead');
      (it.more || []).forEach(function(l){ h += row(ch.id, l, 'more'); });
    });
    else if(B.b === 'tl') B.ls.forEach(function(l){
      h += '<div class="row tlr" data-l="' + l + '"><div class="txt"><p>' + renderLine(l, null) + '</p></div><aside class="marg"></aside></div>';
    });
    else if(B.b === 'plates') h += '<div class="plates">' + B.items.map(function(x){
      return '<div class="plate"><span class="g">' + esc(P(x.gr)) + '</span><span class="l cvable">' + esc(P(x.la)) + '</span></div>'; }).join('') + '</div>';
    else if(B.b === 'genre'){
      h += '<div class="gen"><h4>' + esc(B.h) + (B.sos ? '<span class="sostag">SOS</span>' : '') + '</h4>';
      B.ls.forEach(function(l){ h += row(ch.id, l, ''); });
      if(B.people && B.people.length) h += '<div class="who"><span class="lbl">Πορτρέτα</span>' + B.people.map(function(id){
        return '<button type="button" class="cvable" data-p="' + id + '">' + esc(P(PPL[id].name)) + '</button>'; }).join('') + '</div>';
      if(B.fig) h += figHTML(B.fig);
      h += '</div>';
    }
    else if(B.b === 'per'){
      var Pp = PPL[B.who];
      h += portraitHTML(Pp, false);
      Pp.ls.forEach(function(l){ h += row(ch.id, l, ''); });
      if(B.fig) h += figHTML(B.fig);
    }
    else if(B.b === 'fig') h += figHTML(B.l);
    else if(B.b === 'fn') h += fnHTML(B.l);
    else if(B.b === 'compare') h += compareHTML();
  });
  return h;
}
function notesListHTML(chId){
  var ch = CH[chId], N = NOTES[chId];
  var hs = N.heads.slice().sort(function(a, b){ return a.s - b.s; }), ds = N.defs.slice().sort(function(a, b){ return a.s - b.s; });
  if(!hs.length && !ds.length) return '';
  return '<div class="notes"><span class="lbl">Οι σημειώσεις σου · κεφάλαιο ' + esc(ch.n) + '</span><ul class="nlist">'
    + hs.map(function(H){
        return '<li><button class="go" type="button" data-jh="' + H.id + '" data-ch="' + chId + '"><span class="g1"><span class="sw2 sw-h"></span>' + esc(H.title) + '</span>'
             + '<span class="g2">' + esc(ch.full.slice(H.s, Math.min(H.e, H.s + 72))) + '…</span></button>'
             + '<button class="x" type="button" data-del="' + chId + ':heads:' + H.id + '" aria-label="σβήσε τον πλαγιότιτλο">×</button></li>'; }).join('')
    + ds.map(function(Df){
        return '<li><button class="go" type="button" data-jd="' + Df.id + '" data-ch="' + chId + '"><span class="g1"><span class="sw2 sw-d"></span>' + esc(Df.term) + '</span>'
             + '<span class="g2">' + esc(ch.full.slice(Df.s, Df.e)) + '</span></button>'
             + '<button class="x" type="button" data-del="' + chId + ':defs:' + Df.id + '" aria-label="σβήσε τον ορισμό">×</button></li>'; }).join('')
    + '</ul></div>';
}
function chapterHTML(ch){
  var read = readMap()[ch.id];
  return '<section class="chap" id="ch-' + ch.id + '" data-ch="' + ch.id + '">'
    + (ch.part ? '<div class="part"><b>' + esc(ch.part) + '</b><i></i></div>' : '')
    + '<div class="ch-h"><div><span class="num">ΚΕΦΑΛΑΙΟ ' + esc(ch.n) + (ch.pre ? ' · ' + esc(ch.pre) : '') + '</span>'
    + '<h2>' + esc(ch.title) + (ch.fnMark ? '<sup>' + esc(ch.fnMark) + '</sup>' : '') + '</h2>'
    + (ch.sup ? '<div class="per">' + esc(ch.sup) + '</div>' : '') + '</div>'
    + '<button type="button" class="rd' + (read ? ' on' : '') + '" data-read="' + ch.id + '">' + (read ? '✓ το διάβασα' : 'το διάβασα') + '</button></div>'
    + '<div class="stage">' + rulerHTML(ch) + '<div class="rows" data-ch="' + ch.id + '">' + blocksHTML(ch) + notesListHTML(ch.id) + '</div></div>'
    + '</section>';
}
function renderChapter(id){
  var old = document.getElementById('ch-' + id); if(!old) return;
  var tmp = document.createElement('div'); tmp.innerHTML = chapterHTML(CH[id]);
  old.parentNode.replaceChild(tmp.firstChild, old);
  lastNow = {}; tick();
}
function render(){
  $('#chapters').innerHTML = D.chapters.map(chapterHTML).join('');
  lastNow = {}; tick();
}
function paintRead(){
  var m = readMap();
  $$('[data-read]').forEach(function(b){ var on = !!m[b.dataset.read]; b.classList.toggle('on', on); b.textContent = on ? '✓ το διάβασα' : 'το διάβασα'; });
}

/* ══ ΜΠΑΡΑ ΚΕΦΑΛΑΙΩΝ — το χώρισμα πριν το V, τα Α./Β., το «το διάβασα» ══ */
function paintBar(){
  var m = readMap(), h = '';
  D.chapters.forEach(function(c){
    if(c.part) h += '<span class="brk" aria-hidden="true">' + esc(c.part) + '</span>';
    h += '<button type="button" data-go="ch-' + c.id + '" data-bar="' + c.id + '" aria-label="Κεφάλαιο ' + esc(c.n) + '">' + (c.pre ? '<i>' + esc(c.pre) + '</i>' : '') + esc(c.n)
       + (m[c.id] ? '<u></u>' : '') + '</button>';
  });
  $('#nums').innerHTML = h; curBar = null; tick();
}

/* ══ ΕΞΩΦΥΛΛΟ ══ */
function paintCover(){
  var C = D.cover, n = P(C.num), m = n.match(/^(\d+)\s*(.*)$/) || [n, n, ''];
  $('#cover').innerHTML = '<div><h1>Εισαγωγή</h1><p class="lead">' + esc(P(C.lead)) + '</p></div>'
    + '<div class="meet"><div class="big">' + esc(m[1]) + '<small>' + esc(m[2]) + '</small></div>'
    + '<div class="cap">' + esc(P(C.cap)) + '</div><div class="dots"><span class="dot g"></span><span class="dot r"></span></div></div>';
  $('#duo').innerHTML = C.duo.map(function(x, i){
    return (i ? '<span class="ar" aria-hidden="true"></span>' : '')
      + '<div class="it"><span class="g">' + esc(P(x.gr)) + '</span><span class="l">' + esc(P(x.la)) + '</span></div>';
  }).join('');
}
/* ══ Η ΤΑΙΝΙΑ: πλάτος = διάρκεια ══ */
function paintBand(){
  var B = D.band, lo = B.ticks[0].at, hi = B.ticks[B.ticks.length - 1].at, span = hi - lo;
  var pc = function(y){ return (y - lo) / span * 100; };
  var covered = function(e){ return D.chapters.some(function(c){ return c.era && c.era[0] <= e.a && c.era[1] >= e.b; }); };
  var h = '<div class="band-h"><span class="lbl">Οι εποχές · πλάτος = διάρκεια</span><span class="lbl">πάνω τους: τα κεφάλαια</span></div>';
  h += '<div class="chs">' + D.chapters.filter(function(c){ return c.era; }).map(function(c){
    return '<button type="button" class="chb ' + (c.pre ? 'r1' : 'r0') + '" data-go="ch-' + c.id + '" aria-label="Κεφάλαιο ' + esc(c.n) + '"'
      + ' style="left:' + pc(c.era[0]).toFixed(3) + '%;width:' + (pc(c.era[1]) - pc(c.era[0])).toFixed(3) + '%">'
      + esc(c.n + (c.pre ? ' ' + c.pre : '')) + '</button>';
  }).join('') + '</div>';
  h += '<div class="band">' + B.eras.map(function(e){
    return '<div class="era' + (covered(e) ? '' : ' off') + (e.fade ? ' fade' : '') + '" style="flex:' + (e.b - e.a) + ' 1 0"><div class="nm">' + esc(P(e.name)) + '</div></div>';
  }).join('') + '</div>';
  h += '<div class="ticks">' + B.ticks.map(function(t, i){
    var cls = i === 0 ? ' first' : (t.cent ? ' mid' : '');
    /* η τελευταία ετικέτα κάθεται πάνω στο σβήσιμο, όχι στο άκρο */
    var left = i === B.ticks.length - 1 ? pc((B.ticks[i - 1].at + t.at) / 2 + 60) : pc(t.at);
    return '<span class="tick' + cls + '" style="left:' + left.toFixed(3) + '%">' + esc(P(t.p)) + '</span>';
  }).join('') + '</div>';
  h += '<div class="legend">' + B.eras.map(function(e){
    return '<div class="k' + (covered(e) ? '' : ' off') + '"><span class="sw"></span><div><b>' + esc(P(e.name)) + '</b><p>(' + esc(P(e.span)) + ')</p></div></div>';
  }).join('') + '</div>';
  $('#eras').innerHTML = h;
  fitBand();
}
/* ένα όνομα που δεν χωράει στο κομμάτι του ΔΕΝ κόβεται — το λέει το υπόμνημα */
function fitBand(){ $$('.era .nm').forEach(function(n){ n.style.visibility = ''; if(n.scrollWidth > n.clientWidth + 1) n.style.visibility = 'hidden'; }); }

/* ══ ΣΥΓΚΡΙΤΙΚΟΣ ΠΙΝΑΚΑΣ — 3 άξονες × 2 εποχές, κάθε κελί αυτούσιο ══ */
function compareHTML(){
  var C = D.compare;
  var h = '<div class="cmpw" id="compare"><span class="lbl">Ίδιοι άξονες, δύο εποχές</span><h3>' + esc(P(C.cols[0].name)) + ' · ' + esc(P(C.cols[1].name)) + '</h3><div class="cmp"><div class="hd h0"></div>'
        + C.cols.map(function(col){ return '<div class="hd"><span class="lbl">Κεφάλαιο ' + esc(col.ch) + '</span><b>' + esc(P(col.name)) + '</b><span>(' + esc(P(col.span)) + ')</span></div>'; }).join('');
  C.rows.forEach(function(r){
    h += '<div class="rl">' + esc(r.label) + '</div>';
    r.cells.forEach(function(cell, j){
      h += '<div><span class="k">' + esc(P(C.cols[j].name)) + '</span>' + cell.map(function(l){ return '<p>' + renderLine(l, null) + '</p>'; }).join('') + '</div>';
    });
  });
  return h + '</div></div>';
}

/* ══ Η ΣΥΝΟΨΗ — παράγεται από τα πρόσωπα: εποχή × είδος, με την κλωστή
   προς το πρότυπο. Καμία πρόταση δική μου. ══ */
function paintSummary(){
  var cols = D.chapters.filter(function(c){ return c.era && D.people.some(function(p){ return p.ch === c.n; }); });
  var lanes = [];
  D.people.forEach(function(p){ if(lanes.indexOf(p.genre) < 0) lanes.push(p.genre); });
  var tpl = '150px ' + cols.map(function(c){ return 'minmax(0,' + (c.era[1] - c.era[0]) + 'fr)'; }).join(' ');
  var h = '<span class="lbl">Όλη η εισαγωγή · πλάτος στήλης = διάρκεια</span><h2>Ποιος, πότε, από ποιον</h2>';
  h += '<div class="sgrid" style="grid-template-columns:' + tpl + '"><div class="hd h0"></div>'
     + cols.map(function(c){ return '<div class="hd"><b>' + esc(c.n + (c.pre ? ' ' + c.pre : '')) + '</b><span>' + esc(c.title) + (c.sup ? ' · ' + esc(c.sup) : '') + '</span></div>'; }).join('');
  lanes.forEach(function(g){
    h += '<div class="ln">' + esc(g) + '</div>';
    cols.forEach(function(c){
      var ps = D.people.filter(function(p){ return p.genre === g && p.ch === c.n; });
      h += '<div>' + (ps.length ? '<span class="cl">' + esc(c.n + (c.pre ? ' ' + c.pre : '')) + '</span>' : '') + ps.map(function(p){
        var md = modelsOf(p), seen = {};
        md = md.filter(function(x){ var k = x.pr.gr.t; if(seen[k]) return false; seen[k] = 1; return true; });
        return '<span class="au"><button type="button" class="cvable" data-p="' + p.id + '">' + esc(P(p.name)) + '</button>'
          + (md.length ? '<span class="md">' + md.map(function(x){ return '<i aria-hidden="true"></i><span class="cvable">' + esc(P(x.pr.gr)) + '</span>'; }).join('') + '</span>' : '')
          + '</span>';
      }).join('') + '</div>';
    });
  });
  $('#summary').innerHTML = h + '</div>';
}

/* ══ ΟΙ ΠΙΝΑΚΕΣ (δεύτερος κόσμος) — και οι δύο ΠΑΡΑΓΟΝΤΑΙ ══ */
function paintTables(){
  var h = '<div class="tb-h"><span class="lbl">Οι πίνακες</span><h2>Ποιος επηρεάζει ποιον</h2>'
        + '<p>Μόνο ζεύγη που ονομάζει το ίδιο το φυλλάδιο — και τα δύο ονόματα στην ίδια πρόταση.</p></div>'
        + '<div class="tbwrap"><table><thead><tr><th>Ελληνικό πρότυπο</th><th></th><th>Ρωμαίος</th><th>Η φράση του κειμένου</th><th>Κεφ.</th></tr></thead><tbody>';
  D.pairs.forEach(function(pr){
    var line = SRC[pr.gr.l - 1], ga = find(line, pr.gr.t, pr.gr.n), ra = find(line, pr.ro.t, pr.ro.n);
    var a0 = Math.min(ga, ra), b0 = Math.max(ga + pr.gr.t.length, ra + pr.ro.t.length), s = sentence(line, a0, b0), c = chapterOfLine(pr.gr.l);
    var seg = line.slice(s.a, s.b), parts = [[ga - s.a, pr.gr.t.length, 'm-gr'], [ra - s.a, pr.ro.t.length, 'm-ro']].sort(function(x, y){ return x[0] - y[0]; });
    var ph = '', pos = 0;
    parts.forEach(function(x){ ph += esc(seg.slice(pos, x[0])) + '<span class="' + x[2] + '">' + esc(seg.substr(x[0], x[1])) + '</span>'; pos = x[0] + x[1]; });
    ph += esc(seg.slice(pos));
    h += '<tr><td><span class="m-gr">' + esc(P(pr.gr)) + '</span></td><td class="ar">→</td><td><span class="m-ro">' + esc(P(pr.ro)) + '</span></td>'
       + '<td class="ph">' + ph + '</td><td class="c">' + esc(c ? c.n : '') + '</td></tr>';
  });
  h += '</tbody></table></div>';
  var withP = D.chapters.filter(function(c){ return D.people.some(function(p){ return p.ch === c.n; }); });
  h += '<div class="tb-h"><span class="lbl">Οι πίνακες</span><h2>Ποιος ανήκει πού</h2>'
     + '<p>Δεν είναι γραμμένο πουθενά ως πίνακας — παράγεται από τη θέση του καθενός μέσα στην ίδια την εισαγωγή.</p></div>'
     + '<div class="tbwrap"><table><thead><tr><th>Κεφάλαιο</th><th>Εποχή</th><th>Χρόνοι</th><th>Πρόσωπα</th></tr></thead><tbody>'
     + withP.map(function(c){
         return '<tr><td class="c">' + esc(c.n + (c.pre ? ' · ' + c.pre : '')) + '</td><td><span class="m-wk">' + esc(c.title) + '</span></td>'
              + '<td class="c">' + esc(c.sup || '—') + '</td><td>' + D.people.filter(function(p){ return p.ch === c.n; }).map(function(p){
                  return '<button type="button" class="m-ro" data-p="' + p.id + '">' + esc(P(p.name)) + '</button>'; }).join(', ') + '</td></tr>';
       }).join('') + '</tbody></table></div>';
  h += '<p class="rule"><b>Τρία κεφάλαια, και είναι πληροφορία.</b> Και τα ' + D.people.length + ' πρόσωπα της εισαγωγής ζουν σε <b>' + withP.length
     + '</b> κεφάλαια. Η χρονογραμμή του κεφ. III δηλώνει τέσσερις εποχές, αλλά η Μετακλασική και η Ύστερη Αρχαιότητα δεν έχουν κεφάλαιο: '
     + '<b>το φυλλάδιο σταματά στο 14 μ.Χ.</b> — το δείχνει και η ταινία των εποχών.</p>'
     + '<p class="rule"><b>Ο κανόνας του πίνακα.</b> Κανένα κελί δεν γεμίζει από δική μου γνώση. Ο Κάτουλλος και ο Λουκρήτιος δεν έχουν '
     + 'γραμμή στον πρώτο πίνακα γιατί το κείμενό σου <b>δεν</b> ονομάζει ελληνικό πρότυπο για αυτούς. Αν λείπει γραμμή, λείπει από το φυλλάδιο.</p>';
  $('#tables').innerHTML = h;
}

/* ══ Ο ΧΑΡΑΚΑΣ ΚΑΙ Η ΜΠΑΡΑ ΑΚΟΛΟΥΘΟΥΝ ΤΗΝ ΑΝΑΓΝΩΣΗ — scroll + rAF,
   χωρίς παρατηρητή (σταθ. 39): τίποτα δεν περιμένει κώδικα για να φανεί ══ */
var lastNow = {}, curBar = null, raf = 0;
function tick(){
  raf = 0;
  if($('#worldA').hidden) return;
  var lim = innerHeight * 0.42;
  $$('.chap').forEach(function(sec){
    var r = sec.getBoundingClientRect(); if(r.bottom < 0 || r.top > innerHeight) return;
    var ch = CH[sec.dataset.ch], ds = ch._dates || []; if(!ds.length) return;
    var lineNow = 0;
    $$('.row[data-l]', sec).forEach(function(rw){ if(rw.getBoundingClientRect().top < lim) lineNow = Math.max(lineNow, +rw.dataset.l); });
    var cur = -1; ds.forEach(function(x, i){ if(x.l <= lineNow) cur = i; });
    if(lastNow[ch.id] === cur) return; lastNow[ch.id] = cur;
    var now = $('[data-now]', sec);
    if(now){ now.innerHTML = numHTML(ds[Math.max(cur, 0)].m.t); now.classList.toggle('pre', cur < 0); }
    $$('.axis [data-i]', sec).forEach(function(e){
      var on = cur >= 0 && (e.classList.contains('al') ? e.dataset.t === ds[cur].m.t : +e.dataset.i === cur);
      e.classList.toggle('on', on);
    });
  });
  var act = null;
  $$('.chap').forEach(function(sec){ if(sec.getBoundingClientRect().top < innerHeight * 0.32) act = sec.dataset.ch; });
  if(act !== curBar){
    curBar = act;
    $$('#nums [data-bar]').forEach(function(b){ b.setAttribute('aria-current', String(b.dataset.bar === act)); });
  }
}
addEventListener('scroll', function(){ if(!raf) raf = requestAnimationFrame(tick); }, { passive:true });
addEventListener('resize', function(){ lastNow = {}; fitBand(); tick(); });

/* ══ ΠΑΤΗΜΑΤΑ — ένας ακροατής για όλη τη σελίδα ══ */
function jump(kind, id, chId){
  var sel = kind === 'h' ? '[data-h="' + id + '"]' : '[data-d="' + id + '"]';
  var el = $('#ch-' + chId + ' ' + sel); if(!el) return;
  el.scrollIntoView({ block:'center' });
  el.classList.add('hot'); setTimeout(function(){ el.classList.remove('hot'); }, 1700);
}
var covered = false;
document.addEventListener('click', function(e){
  var t = e.target, x;
  if(!t.closest) return;
  if(covered && (x = t.closest('.cvable')) && !x.classList.contains('rv')){
    var mk = x.dataset.mk;
    if(mk) $$('[data-mk="' + mk + '"]').forEach(function(s){ s.classList.add('rv'); }); else x.classList.add('rv');
    e.preventDefault(); return;
  }
  if((x = t.closest('[data-close]'))){ var d = $('#ptd'); if(d.close) d.close(); else d.removeAttribute('open'); return; }
  if((x = t.closest('[data-p]'))){ hideTip(); openPortrait(x.dataset.p); return; }
  if((x = t.closest('[data-go]'))){ var g = document.getElementById(x.dataset.go); if(g) g.scrollIntoView({ block:'start' }); return; }
  if((x = t.closest('[data-read]'))){ toggleRead(x.dataset.read); return; }
  if((x = t.closest('[data-jh]'))){ jump('h', x.dataset.jh, x.dataset.ch); return; }
  if((x = t.closest('[data-jd]'))){ jump('d', x.dataset.jd, x.dataset.ch); return; }
  if((x = t.closest('[data-del]'))){
    var s = x.dataset.del.split(':');
    if(removeNote(s[0], s[1], s[2])) toast('Σβήστηκε', 'Αναίρεση', undo);
    return;
  }
});
$('#ptd').addEventListener('click', function(e){ if(e.target === this && this.close) this.close(); });

/* hover: η κλωστή ανάβει και τα δύο άκρα· σύννεφο για ορισμούς/ονόματα/πρότυπα */
var tipT;
document.addEventListener('mouseover', function(e){
  var t = e.target; if(!t.closest) return;
  $$('.lit').forEach(function(x){ x.classList.remove('lit'); });
  var th = t.closest('.th');
  if(th){
    var id = th.dataset.pair;
    $$('[data-pair]').forEach(function(x){ if(x !== th && (' ' + x.dataset.pair + ' ').indexOf(' ' + id + ' ') >= 0) x.classList.add('lit'); });
  }
  if(covered) return;
  var seg = t.closest('#chapters [data-d], #chapters [data-p], #chapters [data-g]');
  if(!seg) return;
  var h = '', host = seg.closest('[data-ch]'), chId = host ? host.dataset.ch : null;
  if(seg.dataset.d && chId){
    var Df = null; NOTES[chId].defs.forEach(function(x){ if(x.id === seg.dataset.d) Df = x; });
    if(!Df) return;
    h = '<b>' + esc(Df.term) + '</b><span class="t2">ο ορισμός σου</span>';
  } else if(seg.dataset.p){
    var Pp = PPL[seg.dataset.p]; if(!Pp) return;
    h = '<b>' + esc(P(Pp.name)) + '</b><span class="t2">' + esc(Pp.genre) + ' · κεφ. ' + esc(Pp.ch) + ' · πάτα για το πορτρέτο</span>';
  } else if(seg.dataset.g){
    var to = (seg.dataset.pair || '').split(' ').filter(Boolean).map(function(p){ return P(D.pairs[+p.slice(1)].ro); });
    h = '<b>' + esc(seg.dataset.g) + '</b><span class="t2">ελληνικό πρότυπο' + (to.length ? ' → ' + esc(to.join(', ')) : '') + '</span>';
  }
  showTip(h, seg);
});
document.addEventListener('mouseout', function(){ clearTimeout(tipT); tipT = setTimeout(hideTip, 90); });
function showTip(html, el){
  clearTimeout(tipT);
  var t = $('#tip'); t.innerHTML = html; t.hidden = false;
  var r = el.getBoundingClientRect();
  t.style.left = Math.round(Math.max(12, Math.min(innerWidth - t.offsetWidth - 12, r.left))) + 'px';
  var top = r.top - t.offsetHeight - 10;
  t.style.top = Math.round(top < 60 ? r.bottom + 10 : top) + 'px';
}
function hideTip(){ $('#tip').hidden = true; }
document.addEventListener('scroll', hideTip, true);

/* ══ «ΣΚΕΠΑΣΕ» ══ */
$('#cvbtn').onclick = function(){
  covered = !covered;
  this.setAttribute('aria-pressed', String(covered)); this.textContent = covered ? 'Ξεσκέπασε' : 'Σκέπασε';
  document.body.classList.toggle('cov', covered); $('#cvhint').hidden = !covered;
  $$('.rv').forEach(function(x){ x.classList.remove('rv'); });
  hideTip(); hideSel();
};

/* ══ ΕΠΙΛΟΓΗ ΚΕΙΜΕΝΟΥ → ΟΙ ΔΥΟ ΠΡΑΞΕΙΣ ══ */
var pend = null;
function offOf(node, off){
  var el = node.nodeType === 3 ? node.parentNode : node;
  if(!el || !el.closest) return null;
  var seg = el.closest('[data-o]'); if(!seg) return null;
  var host = seg.closest('[data-ch]');
  return { o:(+seg.dataset.o) + Math.min(off, seg.textContent.length), ch:host ? host.dataset.ch : null };
}
function hideSel(){ var b = $('#selbar'); if(b) b.hidden = true; pend = null; }
function onSel(){
  if(covered) return hideSel();
  var sel = window.getSelection();
  if(!sel || sel.isCollapsed || !sel.rangeCount) return hideSel();
  var r = sel.getRangeAt(0);
  var a = offOf(r.startContainer, r.startOffset), b = offOf(r.endContainer, r.endOffset);
  if(!a || !b || !a.ch || a.ch !== b.ch || b.o <= a.o) return hideSel();
  pend = { ch:a.ch, s:a.o, e:b.o, txt:CH[a.ch].full.slice(a.o, b.o) };
  var rc = r.getBoundingClientRect(), bar = $('#selbar');
  bar.hidden = false;
  bar.style.left = Math.round(Math.max(120, Math.min(innerWidth - 120, rc.left + rc.width / 2))) + 'px';
  bar.style.top = Math.round(Math.max(56, rc.top - 9)) + 'px';
}
document.addEventListener('mouseup', function(){ setTimeout(onSel, 0); });
document.addEventListener('touchend', function(){ setTimeout(onSel, 40); });
document.addEventListener('keyup', function(e){ if(e.shiftKey) setTimeout(onSel, 0); });
$('#selbar').addEventListener('mousedown', function(e){ e.preventDefault(); });
document.addEventListener('mousedown', function(e){ if(!e.target.closest || !e.target.closest('#selbar,#pop')) hideSel(); });
function closePop(){ $('#pop').hidden = true; }
function ask(label, preview, placeholder, cb){
  var p = $('#pop');
  p.innerHTML = '<h5>' + esc(label) + '</h5><div class="pv">' + esc(preview) + '</div>'
    + '<input type="text" id="popIn" autocomplete="off" placeholder="' + esc(placeholder) + '">'
    + '<div class="acts"><button type="button" class="btn ghost" data-x>Άκυρο</button>'
    + '<button type="button" class="btn primary" data-ok>Πρόσθεσε</button></div>';
  p.hidden = false;
  p.style.left = Math.round(innerWidth / 2 - p.offsetWidth / 2) + 'px';
  p.style.top = Math.round(Math.max(70, innerHeight * 0.24)) + 'px';
  var inp = $('#popIn', p); inp.focus();
  function ok(){ var v = inp.value.trim(); if(!v){ inp.focus(); return; } closePop(); cb(v); }
  $('[data-ok]', p).onclick = ok;
  $('[data-x]', p).onclick = closePop;
  inp.onkeydown = function(e){ if(e.key === 'Enter') ok(); else if(e.key === 'Escape') closePop(); };
}
$('#bHead').onclick = function(){
  if(!pend) return; var Pd = pend;
  ask('Πλαγιότιτλος', Pd.txt, 'π.χ. Τι έγραψε ο Κικέρων', function(v){
    if(addNote(Pd.ch, 'heads', { s:Pd.s, e:Pd.e, title:v })) toast('Ο πλαγιότιτλος μπήκε στο περιθώριο', 'Αναίρεση', undo);
    hideSel(); window.getSelection().removeAllRanges();
  });
};
$('#bDef').onclick = function(){
  if(!pend) return; var Pd = pend;
  ask('Ορισμός', Pd.txt, 'πώς το λες εσύ', function(v){
    if(addNote(Pd.ch, 'defs', { s:Pd.s, e:Pd.e, term:v })) toast('Ο ορισμός μαρκαρίστηκε', 'Αναίρεση', undo);
    hideSel(); window.getSelection().removeAllRanges();
  });
};
document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ closePop(); hideSel(); hideTip(); } });
var toT;
function toast(msg, label, fn){
  var t = $('#toast');
  t.innerHTML = '<span>' + esc(msg) + '</span>' + (label ? '<button type="button">' + esc(label) + '</button>' : '');
  t.hidden = false; clearTimeout(toT);
  if(label) t.querySelector('button').onclick = function(){ fn(); t.hidden = true; };
  toT = setTimeout(function(){ t.hidden = true; }, label ? 5200 : 2800);
}

/* ══ ΟΙ ΔΥΟ ΚΟΣΜΟΙ ══ */
function world(a){
  $('#worldA').hidden = !a; $('#worldB').hidden = a; $('#numsBar').hidden = !a;
  $('#wA').setAttribute('aria-selected', String(a)); $('#wB').setAttribute('aria-selected', String(!a));
  hideSel(); hideTip(); closePop(); window.scrollTo(0, 0); if(a){ lastNow = {}; tick(); }
}
$('#wA').onclick = function(){ world(true); };
$('#wB').onclick = function(){ world(false); };

/* ══ ΣΥΓΧΡΟΝΙΣΜΟΣ — και ένας που δεν ξεκίνησε ΤΟ ΛΕΕΙ (σταθ. 10/32) ══ */
function gate(msg){ var g = $('#gate'); if(!g) return; g.innerHTML = msg; g.hidden = false; }
(function initSync(){
  var tries = 0;
  (function wait(){
    if(typeof initCloudSync !== 'function' || !window.supabase){
      if(tries++ < 40){ setTimeout(wait, 200); return; }
      gate('<b>Ο συγχρονισμός δεν ξεκίνησε σε αυτή τη συσκευή.</b> Ό,τι γράφεις μένει ΕΔΩ '
         + 'και δεν φεύγει στο cloud. Ανανέωσε τη σελίδα.');
      return;
    }
    initCloudSync({ appKey:'eisagogi', syncedPrefixes:[NKEY], onApplied:function(){
      D.chapters.forEach(function(c){ loadNotes(c.id); }); render();
    } });
    cloudOn = true;
  })();
})();

/* ══ εκκίνηση ══ */
D.chapters.forEach(function(c){ loadNotes(c.id); });
paintCover(); paintBand(); render(); paintBar(); paintSummary(); paintTables();
if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ fitBand(); lastNow = {}; tick(); });
if(ERR.length) gate('<b>Σημάδια εκτός πηγής:</b> ' + esc(ERR.join(' · ')));
window.__EIS_OK = !ERR.length;
})();
</script>
</body>
</html>
