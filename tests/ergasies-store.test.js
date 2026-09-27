/* ══════════════════════════════════════════════════════════════════════
   tests/ergasies-store.test.js — Η ΑΤΖΕΝΤΑ ΓΡΑΦΕΙ ΣΤΟ `hw:v1` ΚΑΙ ΔΕΝ
   ΚΑΤΑΣΤΡΕΦΕΙ ΤΙΠΟΤΑ ΑΠΟ ΟΣΑ ΒΡΗΚΕ

   ⚠️ ΕΙΝΑΙ Ο ΜΟΝΟΣ ΕΛΕΓΧΟΣ ΤΟΥ REPO ΠΟΥ ΑΝΟΙΓΕΙ ΑΛΗΘΙΝΟ CHROME, και αυτό
   είναι σκόπιμο: η `ergasies.html` είναι ΜΙΑ σελίδα-εφαρμογή που στήνει όλη
   της τη διεπαφή σε JS, και ένα στουμπωμένο DOM θα συμφωνούσε με κάθε bug
   τέλεια. Δύο από τα σοβαρά ευρήματα αυτής της έκδοσης (το `cats:null` που
   έσκαγε ΟΛΗ την καρτέλα «Μαθήματα», και το `t.src` που ΔΕΝ είναι η πηγή)
   ήταν ΑΟΡΑΤΑ σε κάθε στατικό έλεγχο.

   Σηκώνει δικό του στατικό server και δικό του headless Chrome. Αν λείπει
   το Chrome, ΤΟ ΛΕΕΙ ΔΥΝΑΤΑ και αποτυγχάνει — ποτέ σιωπηλό πέρασμα.

   ⛔ ΚΑΝΕΝΑ SYNC ΣΕ HARNESS: το `initCloudSync` είναι στουμπωμένο και το
   `ALS_LOCAL_ONLY` ανοιχτό. Αυτό το repo έχει χάσει δεδομένα ακριβώς έτσι.

   Τι αποδεικνύει, με τη σειρά που θα έσπαγε:
     Α · το τικ γράφει ΣΤΙΓΜΗ, κρατάει τη ΦΩΤΟΓΡΑΦΙΑ, σφραγίζει με `_ts`
     Β · το βήμα μένει τσεκαρισμένο
     Γ · το διαγώνισμα ζει στο `exams` και το `yli` μένει συγχρονισμένο
     Δ · ο βαθμός σέβεται την ΚΛΙΜΑΚΑ και το ελληνικό κόμμα
     Ε · το σβήσιμο αφήνει ΤΑΦΟΠΛΑΚΑ στο φωλιασμένο μονοπάτι (σταθ. 32)
     ΣΤ · μια ρύθμιση δεν ακουμπάει το πρόγραμμα που δεν την αφορά
     Ζ · ΟΙ ΑΛΛΕΣ ΔΥΟ ΚΑΡΤΕΛΕΣ ΑΝΟΙΓΟΥΝ ΜΕ ΤΟ ΑΓΝΩΣΤΟ ΜΑΘΗΜΑ ΜΕΣΑ
     Η · μηδέν exceptions σε ΟΛΗ τη διαδρομή
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const http=require('http'),fsx=require('fs'),pathx=require('path');
const ROOT=pathx.resolve(__dirname,'..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const u=decodeURIComponent(req.url.split('?')[0]);
  const f=pathx.join(ROOT,u);
  if(f.indexOf(ROOT)!==0||!fsx.existsSync(f)||fsx.statSync(f).isDirectory()){res.writeHead(404);res.end('no');return}
  res.writeHead(200,{'Content-Type':MIME[pathx.extname(f)]||'application/octet-stream'});
  res.end(fsx.readFileSync(f));
});
let HTTP=0;
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if(!fsx.existsSync(CHROME)){console.error('  ✗ FAIL δεν βρέθηκε το Google Chrome — ΔΕΝ έτρεξε κανένας έλεγχος, δεν πέρασε τίποτα.');process.exit(1)}
const PORT=9336;
const D=(n)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+n);return d};
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const ms=n=>D(n).getTime()+12*3600e3;
const HW={v:1,samples:{},lessons:{},
 tasks:{
  a1:{id:'a1',ts:ms(-9),subject:'arxaia_agn',title:'σελ 162, σελ 75 ΑΓΝΩΣΤΟ και κλιση αορ β αγω γιγνομαι θνησκω λανθανω ορω πυνθανομαι',due:null,kind:'askisi',link:null,est:null,done:0,src:null,note:'',elapsed:0},
  a2:{id:'a2',ts:ms(-6),subject:'ekthesi',title:'σελ 388 Α1 β1 β2 Γ Δ θεμα',due:null,kind:'grapto',link:null,est:null,done:0,src:null,note:'',elapsed:0},
  a3:{id:'a3',ts:ms(-2),subject:'arxaia_gn',title:'γνωστο ενοτητα 6 μτφρ σχολια και σελ 61 Β1 Β5 Β4 Α1',due:iso(D(0)),kind:'askisi',link:null,est:null,done:0,src:null,note:'',elapsed:0,steps:[{t:'Μετάφραση',d:true},{t:'Σχόλια',d:false},{t:'Σελ. 61 Β1 Β5 Β4 Α1',d:false}]},
  a4:{id:'a4',ts:ms(-1),subject:'istoria',title:'ΑΓΓΛΙΚΟ ΚΟΜΜΑ',due:iso(D(0)),kind:'askisi',link:null,est:null,done:0,src:null,note:'',elapsed:0,cat:'Ενότητα 4'},
  a5:{id:'a5',ts:ms(-1),subject:'latinika',title:'σελ 269 volo και κλιση παθητ υποτ arbitror imitor pareo deleo negleco repono stabilio servio',due:iso(D(1)),kind:'apexo',link:null,est:null,done:0,src:{type:'photo',id:'p1'},note:'Το φυλλάδιο, όχι το βιβλίο.',elapsed:0,important:true},
  a6:{id:'a6',ts:ms(-1),subject:'ekthesi',title:'Περίληψη 120 λέξεων',due:iso(D(2)),kind:'askisi',link:null,est:null,done:0,src:null,note:'',elapsed:0,cat:'Έκθεση',from:'fro'},
  a7:{id:'a7',ts:ms(-3),subject:'istoria',title:'σελ 51+52 5 , 6',due:iso(D(-1)),kind:'askisi',link:null,est:null,done:ms(0),src:null,note:'',elapsed:0},
  a8:{id:'a8',ts:ms(-8),subject:'unknown',title:'Λατνικασ',due:'2026-10-04',kind:'diagonisma',link:null,est:null,done:0,src:null,note:'',elapsed:0}
 },
 exams:{
  e1:{subject:'latinika',title:'Εισαγωγή κλειστού τύπου',yli:'Σ-Λ\nΑντιστοίχιση\nΣυμπλήρωση κενών',date:iso(D(3)),ts:ms(-4),done:0,grade:null,scale:20,note:''},
  e2:{subject:'istoria',title:'Ενότητες 1–4',yli:'Το αγροτικό ζήτημα\nΤα πρώτα βήματα του εργατικού κινήματος',date:iso(D(-12)),ts:ms(-20),done:ms(-12),grade:16.5,scale:20,note:'',lathi:['Χρονολογίες','Πηγή Β']},
  e3:{subject:'ekthesi',title:'Άρθρο',yli:'',date:iso(D(-25)),ts:ms(-30),done:ms(-25),grade:18,scale:20,note:''}
 },
 timetable:{
  mon:{slots:[{at:'15:15',subject:'arxaia_agn'},{at:'16:15',subject:'latinika'},{at:'17:15',subject:'ekthesi'}],_ts:ms(-40)},
  tue:{slots:[{at:'15:15',subject:'istoria'},{at:'16:15',subject:'arxaia_gn'},{at:'17:15',subject:'latinika'}],_ts:ms(-40)},
  wed:{slots:[{at:'15:15',subject:'istoria'},{at:'16:15',subject:'arxaia_agn'},{at:'17:15',subject:'ekthesi'}],_ts:ms(-40)},
  thu:{slots:[{at:'15:15',subject:'istoria'},{at:'16:15',subject:'arxaia_agn'},{at:'17:15',subject:'ekthesi'}],_ts:ms(-40)},
  fri:{slots:[{at:'15:15',subject:'istoria'},{at:'16:15',subject:'arxaia_gn'},{at:'17:15',subject:'latinika'}],_ts:ms(-40)},
  sat:{slots:[],_ts:ms(-40)},sun:{slots:[],_ts:ms(-40)}
 },
 agenda:{}
};
const SEED=`
  try{localStorage.setItem('hw:v1',${JSON.stringify(JSON.stringify(HW))});}catch(e){}
  window.ALS_LOCAL_ONLY=true;
  window.initCloudSync=function(){};        /* ⛔ ΚΑΝΕΝΑ SYNC ΣΕ HARNESS */
  window.supabase=null;
`;

const {spawn}=require('child_process');
let id=0,ws,pend=new Map();
const send=(m,p,s)=>new Promise((res,rej)=>{const i=++id;pend.set(i,{res,rej});ws.send(JSON.stringify({id:i,method:m,params:p,sessionId:s}))});
const sleep=n=>new Promise(r=>setTimeout(r,n));
let P=0,F=0;
const ok=(n,c,extra)=>{c?P++:F++;console.log((c?'  ✓ ':'  ✗ FAIL ')+n+(c?'':'   '+JSON.stringify(extra)))};
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r)); HTTP=server.address().port;
 const chrome=spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',['--headless=new','--remote-debugging-port='+PORT,'--no-first-run','--user-data-dir=/tmp/cdp-w','--hide-scrollbars','about:blank'],{stdio:'ignore'});
 let info=null;for(let i=0;i<60;i++){try{info=await(await fetch('http://127.0.0.1:'+PORT+'/json/version')).json();break}catch(e){await sleep(300)}}
 ws=new WebSocket(info.webSocketDebuggerUrl);const exc=[];
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){const p=pend.get(m.id);pend.delete(m.id);m.error?p.rej(new Error(JSON.stringify(m.error))):p.res(m.result)}
  else if(m.method==='Runtime.exceptionThrown')exc.push(m.params.exceptionDetails.exception&&m.params.exceptionDetails.exception.description||m.params.exceptionDetails.text)};
 await new Promise(r=>ws.onopen=r);
 const t=await send('Target.createTarget',{url:'about:blank'});
 const {sessionId}=await send('Target.attachToTarget',{targetId:t.targetId,flatten:true});
 const S=(m,p)=>send(m,p,sessionId);
 await S('Page.enable');await S('Runtime.enable');
 await S('Page.addScriptToEvaluateOnNewDocument',{source:SEED});
 await S('Emulation.setDeviceMetricsOverride',{width:1440,height:2350,deviceScaleFactor:1,mobile:false});
 await S('Page.navigate',{url:'http://127.0.0.1:'+HTTP+'/ergasies.html'});
 await sleep(2600);
 const q=async e=>JSON.parse((await S('Runtime.evaluate',{expression:e,returnByValue:true})).result.value);
 const hw=()=>q(`JSON.stringify(JSON.parse(localStorage.getItem('hw:v1')))`);
 const before=await hw();

 console.log('\nΑ · ΤΟ ΤΙΚ ΓΡΑΦΕΙ ΣΤΙΓΜΗ, ΟΧΙ ΣΗΜΑΙΑ');
 await S('Runtime.evaluate',{expression:`document.querySelector('.task[data-id="t:a5"] .tick').click()`});
 await sleep(400);
 let h=await hw();
 ok('το done είναι timestamp', typeof h.tasks.a5.done==='number'&&h.tasks.a5.done>1e12, h.tasks.a5.done);
 ok('⛔ η ΦΩΤΟΓΡΑΦΙΑ επέζησε (t.src δεν είναι η πηγή)', JSON.stringify(h.tasks.a5.src)===JSON.stringify({type:'photo',id:'p1'}), h.tasks.a5.src);
 ok('η ΠΗΓΗ γράφτηκε στο δικό της πεδίο', h.tasks.a5.from==='fro', h.tasks.a5.from);
 ok('σφραγίστηκε με _ts', typeof h.tasks.a5._ts==='number', h.tasks.a5._ts);
 ok('το kind ΔΕΝ χάλασε', h.tasks.a5.kind==='apexo', h.tasks.a5.kind);
 ok('το important επέζησε', h.tasks.a5.important===true);
 // ⭐ Η ΜΟΝΗ ΕΠΙΤΡΕΠΤΗ ΔΙΑΦΟΡΑ ΕΙΝΑΙ Η ΣΠΟΡΑ ΤΗΣ ΣΦΡΑΓΙΔΑΣ, ΚΑΙ ΠΑΙΡΝΕΙ ΤΟΝ
 // ΠΑΛΙΟ ΧΡΟΝΟ ΤΗΣ ΕΓΓΡΑΦΗΣ — ποτέ το «τώρα» (αλλιώς όποια συσκευή άνοιξε
 // τελευταία τη σελίδα θα κέρδιζε αληθινή αλλαγή άλλης συσκευής).
 const a1=Object.assign({},h.tasks.a1);const seeded=a1._ts;delete a1._ts;
 ok('καμία ΑΛΛΗ εργασία δεν άλλαξε στο περιεχόμενο', JSON.stringify(a1)===JSON.stringify(before.tasks.a1), [a1,before.tasks.a1]);
 ok('και η σπορά της σφραγίδας πήρε τον ΠΑΛΙΟ χρόνο, όχι το τώρα', seeded===before.tasks.a1.ts, [seeded,before.tasks.a1.ts]);
 ok('και κανένα άλλο κλειδί του hw:v1', JSON.stringify(h.lessons)===JSON.stringify(before.lessons)&&JSON.stringify(h.samples)===JSON.stringify(before.samples));

 console.log('\nΒ · ΤΟ ΒΗΜΑ ΤΣΕΚΑΡΕΤΑΙ ΚΑΙ ΜΕΝΕΙ');
 await S('Runtime.evaluate',{expression:`document.querySelector('.task[data-id="t:a3"] .stp:not(.ok)').click()`});
 await sleep(400);h=await hw();
 ok('το βήμα έγινε d:true', h.tasks.a3.steps[1].d===true, h.tasks.a3.steps);

 console.log('\nΓ · ΤΟ ΔΙΑΓΩΝΙΣΜΑ ΕΙΝΑΙ ΕΓΓΡΑΦΗ ΤΟΥ `exams`');
 await S('Runtime.evaluate',{expression:`document.querySelector('.task[data-id="x:e1"] .stp').click()`});
 await sleep(400);h=await hw();
 ok('η ύλη κρατάει το τικ στα steps', h.exams.e1.steps[0].d===true, h.exams.e1.steps);
 ok('και το yli μένει ΣΥΓΧΡΟΝΙΣΜΕΝΟ για την παλιά σελίδα', h.exams.e1.yli==='Σ-Λ\nΑντιστοίχιση\nΣυμπλήρωση κενών', h.exams.e1.yli);
 ok('scale 20 ακέραιο', h.exams.e1.scale===20);

 console.log('\nΔ · Ο ΒΑΘΜΟΣ ΜΠΑΙΝΕΙ ΣΤΗ ΣΩΣΤΗ ΚΛΙΜΑΚΑ');
 await S('Runtime.evaluate',{expression:`(function(){
   var t=[...document.querySelectorAll('.task')].find(x=>x.dataset.id==='x:e1');
   openDrawerTest=1; t.click();})()`});
 await sleep(500);
 await S('Runtime.evaluate',{expression:`(function(){var i=document.getElementById('dwGradeIn');i.value='17,5';i.dispatchEvent(new Event('change'))})()`});
 await sleep(500);h=await hw();
 ok('ο βαθμός γράφτηκε με ΚΟΜΜΑ από τον χρήστη → 17.5', h.exams.e1.grade===17.5, h.exams.e1.grade);
 ok('και το «το έγραψα» ήρθε μαζί', typeof h.exams.e1.done==='number'&&h.exams.e1.done>1e12);

 console.log('\nΕ · ΤΟ ΣΒΗΣΙΜΟ ΑΦΗΝΕΙ ΤΑΦΟΠΛΑΚΑ (σταθ. 32)');
 await S('Runtime.evaluate',{expression:`document.getElementById('dwX').click()`});
 await sleep(300);
 await S('Runtime.evaluate',{expression:`removeTaskTest=1;(function(){var b=[...document.querySelectorAll('[data-act="forget"]')][0];b.click()})()`});
 await sleep(500);h=await hw();
 const tomb=await q(`JSON.stringify(JSON.parse(localStorage.getItem('__synctomb__homework')||'{}'))`);
 const gone=Object.keys(before.tasks).filter(k=>!h.tasks[k]);
 ok('η εργασία έφυγε από τον δίσκο', gone.length===1, gone);
 ok('και η ταφόπλακα γράφτηκε στο ΦΩΛΙΑΣΜΕΝΟ μονοπάτι', !!(tomb['hw:v1']&&tomb['hw:v1'].tasks&&tomb['hw:v1'].tasks[gone[0]]), tomb);
 ok('με χρόνο ΜΕΓΑΛΥΤΕΡΟ από τη σφραγίδα της', tomb['hw:v1'].tasks[gone[0]] > (before.tasks[gone[0]]._ts||0));

 console.log('\nΣΤ · ΟΙ ΡΥΘΜΙΣΕΙΣ ΓΡΑΦΟΥΝ ΣΤΟ ΑΛΗΘΙΝΟ ΠΡΟΓΡΑΜΜΑ');
 await S('Runtime.evaluate',{expression:`document.getElementById('openSet').click()`});
 await sleep(400);
 await S('Runtime.evaluate',{expression:`(function(){var b=[...document.querySelectorAll('#defFrom .pill,[data-deffrom]')].find(x=>x.dataset.deffrom==='sch');b.click()})()`});
 await sleep(400);h=await hw();
 ok('η προεπιλεγμένη πηγή ζει στο agenda.prefs', h.agenda.prefs.defaultSrc==='sch', h.agenda&&h.agenda.prefs);
 ok('με σφραγίδα', typeof h.agenda.prefs._ts==='number');
 ok('⛔ το timetable ΔΕΝ πειράχτηκε από μια αλλαγή που δεν το αφορά',
    JSON.stringify(h.timetable)===JSON.stringify(before.timetable), h.timetable.mon);

 /* ⛔⛔ ΑΥΤΗ Η ΕΝΟΤΗΤΑ ΥΠΑΡΧΕΙ ΕΠΕΙΔΗ ΕΝΑ ΑΛΗΘΙΝΟ BUG ΕΖΗΣΕ ΑΚΡΙΒΩΣ ΕΔΩ ΚΑΙ
    ΚΑΝΕΝΑ ΚΛΙΚ ΔΕΝ ΤΟ ΠΕΡΝΟΥΣΕ: το `unknown` του `hw:v1` (η «Λατνικασ» του a8,
    που είναι ΗΔΗ μέσα στη σπορά) γίνεται πέμπτο τετράδιο με `cats:null`, και
    ένα `s.cats.map` πάνω του ΕΣΚΑΓΕ ΟΛΟΚΛΗΡΗ την καρτέλα «Μαθήματα» —
    TypeError, λευκή οθόνη, ενώ η «Τι έχω» φαινόταν τέλεια. Ο έλεγχος άνοιγε
    ΜΟΝΟ την πρώτη καρτέλα, άρα ΟΛΟ το «μηδέν exceptions» από κάτω περνούσε
    πάνω από δύο οθόνες που δεν είχε δει ποτέ κανείς.
    ⚠️ ΟΙ ΙΣΧΥΡΙΣΜΟΙ ΕΙΝΑΙ ΧΩΡΙΣ ΚΑΡΦΩΜΕΝΟ ΝΟΥΜΕΡΟ ΚΑΙ ΧΩΡΙΣ ΗΜΕΡΟΜΗΝΙΑ: το
    πέμπτο τετράδιο ζητιέται ΟΝΟΜΑΣΤΙΚΑ, και το διαγώνισμα ζητιέται μέσα σε
    ΟΛΗ την καρτέλα — αλλιώς ο φρουρός θα έσκαγε μόνος του μόλις περάσει η
    04/10/2026 και η κάρτα μετακομίσει από τα επόμενα στο ιστορικό. */
 console.log('\nΖ · ΟΙ ΑΛΛΕΣ ΔΥΟ ΚΑΡΤΕΛΕΣ ΑΝΟΙΓΟΥΝ ΜΕ ΤΟ ΑΓΝΩΣΤΟ ΜΑΘΗΜΑ ΜΕΣΑ');
 await S('Runtime.evaluate',{expression:`document.getElementById('setX').click()`});
 await sleep(300);
 await S('Runtime.evaluate',{expression:`document.querySelector('.tabs button[data-tab="subj"]').click()`});
 await sleep(600);
 const books=await q(`JSON.stringify([...document.querySelectorAll('.book .bh h2')].map(x=>x.textContent))`);
 ok('όλα τα μαθήματά του έχουν τετράδιο', ['Αρχαία','Ιστορία','Λατινικά','ΝΕ Γλώσσα'].every(n=>books.indexOf(n)>=0), books);
 ok('και το ΑΓΝΩΣΤΟ μάθημα φαίνεται, δεν πετιέται και δεν σκάει', books.indexOf('Χωρίς μάθημα')>=0, books);
 await S('Runtime.evaluate',{expression:`document.querySelector('.tabs button[data-tab="tests"]').click()`});
 await sleep(600);
 const tv=await q(`JSON.stringify({n:document.querySelectorAll('.tcard,.hrow:not(.hd)').length,tx:document.getElementById('view').textContent})`);
 ok('η καρτέλα «Διαγωνίσματα» ζωγράφισε διαγωνίσματα', tv.n>0, tv.n);
 ok('και το διαγώνισμα χωρίς μάθημα είναι ΜΕΣΑ της', tv.tx.indexOf('Λατνικασ')>=0, tv.n);
 await S('Runtime.evaluate',{expression:`document.querySelector('.tabs button[data-tab="day"]').click()`});
 await sleep(400);

 console.log('\nΗ · ΚΑΜΙΑ ΕΞΑΙΡΕΣΗ ΣΕ ΟΛΗ ΤΗ ΔΙΑΔΡΟΜΗ');
 ok('μηδέν exceptions', exc.length===0, exc);
 console.log('\n'+P+' passed, '+F+' failed');
 ws.close();chrome.kill();server.close();process.exit(F?1:0);
})().catch(e=>{console.error('ERR',e.message,e.stack);process.exit(1)});
