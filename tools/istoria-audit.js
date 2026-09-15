/* tools/istoria-audit.js — ΟΡΙΖΟΝΤΙΟΣ ΕΛΕΓΧΟΣ ΤΟΥ ΒΟΗΘΗΜΑΤΟΣ
   node tools/istoria-audit.js

   ⭐ ΓΙΑΤΙ ΥΠΑΡΧΕΙ. Ο φρουρός ελέγχει ΚΑΘΕ ενότητα χωριστά και περνούσε
   πράσινος ενώ η Γ.4 είχε ΔΥΟ πηγές χωρίς «δικό μου σχόλιο» και οι άλλες 22
   το είχαν: η διαφορά φαίνεται ΜΟΝΟ στη σύγκριση. Αυτό τυπώνει τον πίνακα
   που την κάνει ορατή με μια ματιά — τα ίδια όρια τα κλειδώνει και το
   tests/istoria-voithima.test.js §3γ, ώστε να μη χρειάζεται να θυμάται
   κανείς να τρέξει αυτό εδώ. */
const fs=require("fs");
const ALS=require("path").resolve(__dirname,"..");
const PAGE=fs.readFileSync(ALS+"/istoria-voithima.html","utf8");
const s=PAGE.indexOf("const CHAPTERS = ["), e=PAGE.indexOf("\n  }\n}];",s);
const CH=eval(PAGE.slice(s+"const CHAPTERS = ".length, e+"\n  }\n}]".length));
let bad=0;
const row=(a,b)=>String(a).padEnd(b);
console.log(row("id",9)+row("παρ",5)+row("πράξ",6)+row("έννοι",7)+row("παγίδ",7)+row("λεξικ",7)+row("facts",7)+row("χρον",6)+row("book",6)+row("sic",5)+row("πηγές",6)+"άγκυρες");
for(const C of CH){
  const full=C.paragraphs.join("\n");
  let anchors=0, orph=[];
  const chk=(k,v)=>{ anchors++; if(typeof v!=="string"||!full.includes(v)) orph.push(k+"→"+v); };
  C.explain.acts.forEach((a,i)=>chk("acts["+i+"].quote",a.quote));
  C.facts.forEach((f,i)=>chk("facts["+i+"].link",f.link));
  C.sources.list.forEach((x,i)=>chk("src["+i+"].link",x.link));
  C.glossary.forEach((g,i)=>chk("gl["+i+"].m",g.m));
  C.sic.forEach((x,i)=>chk("sic["+i+"].m",x.m));
  C.timeline.events.forEach(ev=>{ if(ev.q) chk("tl."+ev.id+".q",ev.q); });
  /* επικαλύψεις σημαδιών ανά παράγραφο */
  const marks=C.glossary.map(g=>[g.m,"g"]);  /* ΙΔΙΟΥ είδους μόνο */
  C.paragraphs.forEach((p,pi)=>{
    const sp=[]; marks.forEach(([m])=>{const i=p.indexOf(m); if(i>=0) sp.push([i,i+m.length,m]);});
    sp.sort((a,b)=>a[0]-b[0]);
    for(let i=1;i<sp.length;i++) if(sp[i][0]<sp[i-1][1]){ console.log("  ⛔ ΕΠΙΚΑΛΥΨΗ ΔΥΟ ΛΗΜΜΑΤΩΝ "+C.id+" παρ."+(pi+1)+": «"+sp[i-1][2]+"» ∩ «"+sp[i][2]+"»"); bad++; }
  });
  /* διορθώσεις sic που ΔΕΝ πρέπει να υπάρχουν */
  C.sic.forEach(x=>{ if(full.includes(x.fix)){ console.log("  ⛔ "+C.id+": η διόρθωση «"+x.fix+"» μπήκε στο κείμενο"); bad++; } });
  /* πεδία που ΠΡΕΠΕΙ να υπάρχουν και να είναι γεμάτα */
  const need=[["lede",C.explain.lede],["glance.who",C.explain.glance.who],["sources.intro",C.sources.intro],["period",C.period]];
  need.forEach(([k,v])=>{ if(!v || /ΣΥΜΠΛΗΡΩΣΕ/.test(v)){ console.log("  ⛔ "+C.id+": κενό/ΣΥΜΠΛΗΡΩΣΕ στο "+k); bad++; } });
  if(JSON.stringify(C).includes("ΣΥΜΠΛΗΡΩΣΕ")){ console.log("  ⛔ "+C.id+": έμεινε ΣΥΜΠΛΗΡΩΣΕ κάπου"); bad++; }
  /* κάθε πράξη θέλει when/think/quote γεμάτα */
  C.explain.acts.forEach((a,i)=>{ if(!a.when||!a.think||!a.body||!a.title||!a.quote){ console.log("  ⛔ "+C.id+" act["+i+"] λείπει πεδίο"); bad++; } });
  C.sources.list.forEach((x,i)=>{ if(!x.ref||!x.gist||!x.mine||!x.link||!(x.keep||[]).length){ console.log("  ⛔ "+C.id+" source["+i+"] λείπει πεδίο"); bad++; } });
  if(C.sources.list.length<3){ console.log("  ⛔ "+C.id+": λιγότερες από 3 πηγές"); bad++; }
  if(C.sources.how.length<3){ console.log("  ⛔ "+C.id+": λιγότερα από 3 «πώς το γράφω»"); bad++; }
  if(orph.length){ console.log("  ⛔ "+C.id+" ΟΡΦΑΝΕΣ: "+orph.join(" | ")); bad+=orph.length; }
  console.log(row(C.id,9)+row(C.paragraphs.length,5)+row(C.explain.acts.length,6)+row(C.explain.concepts.length,7)
    +row(C.explain.pitfalls.length,7)+row(C.glossary.length,7)+row(C.facts.length,7)
    +row(C.timeline.events.length,6)+row(C.timeline.events.filter(x=>x.book).length,6)
    +row(C.sic.length,5)+row(C.sources.list.length,6)+anchors);
}
/* τα διαγράμματα ζουν στο 2ο script */
CH.forEach((C,i)=>{ if(!PAGE.includes("CHAPTERS["+i+"].diagram = `")){ console.log("  ⛔ λείπει CHAPTERS["+i+"].diagram ("+C.id+")"); bad++; } });
console.log("\n"+(bad? "✗ "+bad+" προβλήματα" : "✓ ΚΑΘΑΡΟ — "+CH.length+" ενότητες, μηδέν ορφανές άγκυρες, μηδέν επικαλύψεις, κανένα κενό πεδίο"));
process.exit(bad?1:0);
