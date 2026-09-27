/* ══════════════════════════════════════════════════════════════════════
   tests/agnosto-page.test.js — ΤΟ ΑΔΙΔΑΚΤΟ ΚΕΙΜΕΝΟ, ΟΔΗΓΗΜΕΝΟ ΣΕ ΑΛΗΘΙΝΟ CHROME

   ⚠️ ΓΙΑΤΙ ΟΔΗΓΕΙ ΚΑΙ ΔΕΝ ΔΙΑΒΑΖΕΙ (σταθ. 57): η `arxaia-agnosto.html` στήνει
   ΟΛΗ της τη διεπαφή σε JS και φορτώνει τα κείμενα με `fetch`. Ένα στουμπωμένο
   DOM θα συμφωνούσε με κάθε bug τέλεια, και ένα `file://` δεν κάνει καν fetch.

   ⛔ ΚΑΝΕΝΑ SYNC ΣΕ HARNESS (σταθ. 8): το `initCloudSync` είναι στουμπωμένο και
   το `ALS_LOCAL_ONLY` ανοιχτό. Αυτό το repo έχει χάσει δεδομένα ακριβώς έτσι.

   Τι αποδεικνύει, με τη σειρά που θα έσπαγε:
     Α · ΤΟ ΕΛΛΗΝΙΚΟ ΠΕΡΙΕΧΟΜΕΝΟ ΤΩΝ JSON ΕΙΝΑΙ ΑΝΕΓΓΙΧΤΟ (sha256)
     Β · η σελίδα φορτώνει τα δεδομένα και ζωγραφίζει τη βιβλιοθήκη
     Γ · Η ΕΞΟΔΟΣ ΥΠΑΡΧΕΙ, ΕΧΕΙ ΛΕΞΗ ΚΑΙ ΔΙΑΒΑΖΕΤΑΙ (σταθ. 64, μετρημένη αντίθεση)
     Δ · ΤΟ ΠΟΛΥΤΟΝΙΚΟ: το σημάδι μπαίνει στο ΤΕΛΕΥΤΑΙΟ ΦΩΝΗΕΝ, με σωστή σειρά
     Ε · το drill: λάθος → επανάληψη, και φεύγει ΜΟΝΟ με 2 σωστές στη σειρά
     ΣΤ · η μετάφραση αποθηκεύεται και η ΥΠΟΒΟΛΗ ΛΕΕΙ ΤΙ ΤΗΣ ΛΕΙΠΕΙ (σταθ. 65)
     Ζ · η διόρθωση: JSON → βαθμός, λάθη πάνω στο κείμενό του, drill
     Η · το συντακτικό δείχνει ΟΛΕΣ τις σωστές επιλογές και μετά το πλήρες answer
     Θ · οι άδειες οθόνες λένε «άδειο», όχι «χάλασε» (σταθ. 10)
     Ι · μηδέν οριζόντια κύλιση σε 1440 ΚΑΙ σε αληθινά 393 (σταθ. 59: μόνο CDP)
     Κ · μηδέν exceptions σε ΟΛΗ τη διαδρομή
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const http=require('http'),fsx=require('fs'),pathx=require('path'),crypto=require('crypto');
const ROOT=pathx.resolve(__dirname,'..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const u=decodeURIComponent(req.url.split('?')[0]);
  const f=pathx.join(ROOT,u);
  if(f.indexOf(ROOT)!==0||!fsx.existsSync(f)||fsx.statSync(f).isDirectory()){res.writeHead(404);res.end('no');return}
  res.writeHead(200,{'Content-Type':MIME[pathx.extname(f)]||'application/octet-stream'});
  res.end(fsx.readFileSync(f));
});
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if(!fsx.existsSync(CHROME)){console.error('  ✗ FAIL δεν βρέθηκε το Google Chrome — ΔΕΝ έτρεξε κανένας έλεγχος, δεν πέρασε τίποτα.');process.exit(1)}
const PORT=9358;
const {spawn}=require('child_process');
let id=0,ws,pend=new Map();
const send=(m,p,s)=>new Promise((res,rej)=>{const i=++id;pend.set(i,{res,rej});ws.send(JSON.stringify({id:i,method:m,params:p,sessionId:s}))});
const sleep=n=>new Promise(r=>setTimeout(r,n));
let P=0,F=0;
const ok=(n,c,extra)=>{c?P++:F++;console.log((c?'  ✓ ':'  ✗ FAIL ')+n+(c?'':'   '+JSON.stringify(extra===undefined?null:extra)))};

/* ⛔ ΤΟ ΠΕΡΙΕΧΟΜΕΝΟ ΤΩΝ JSON ΕΙΝΑΙ ΕΛΕΓΜΕΝΟ ΛΕΞΗ ΠΡΟΣ ΛΕΞΗ ΑΠΟ ΤΟΝ ΑΛΕΞ.
   Δεν υπάρχει μηχανή που να ξαναβγάζει τους τόνους και τα πνεύματα, άρα η
   μόνη εγγύηση που αντέχει στον χρόνο είναι hash (σταθ. 46/50). Αν αλλάξει
   νόμιμα το υλικό, ΑΥΤΟΣ ο αριθμός αλλάζει στο ίδιο commit — ποτέ σιωπηλά. */
const SHA={
  'data/lysias-7-27-29.json':'9024421ed27850c602215970dd97ef94ff80c809870ca92861afe10a5ff28fe6',
  'data/pinakakia.json':'ce1529cd6e2f9dc366668ba979c97f20bb3697575bb49407229966a6875dfa4d',
  'data/arxikoi-xronoi.json':'9a106f5c606efa4e48190b3bee8f067bb58c0733b74228382dff691cbfc854ca'
};

const SEED=`
  window.ALS_LOCAL_ONLY=true;
  window.initCloudSync=function(){};        /* ⛔ ΚΑΝΕΝΑ SYNC ΣΕ HARNESS */
  window.supabase=null;
`;

(async()=>{
 console.log('\nΑ · ΤΟ ΕΛΛΗΝΙΚΟ ΠΕΡΙΕΧΟΜΕΝΟ ΕΙΝΑΙ ΑΝΕΓΓΙΧΤΟ');
 Object.keys(SHA).forEach(function(f){
   const h=crypto.createHash('sha256').update(fsx.readFileSync(pathx.join(ROOT,f))).digest('hex');
   ok(f+' — ίδιο byte προς byte', h===SHA[f], {want:SHA[f].slice(0,12),got:h.slice(0,12)});
 });
 const ix=JSON.parse(fsx.readFileSync(pathx.join(ROOT,'data/index.json'),'utf8'));
 ok('ο κατάλογος ονομάζει κάθε κείμενο που υπάρχει', ix.texts.every(function(t){
   return fsx.existsSync(pathx.join(ROOT,'data',t+'.json')); }), ix.texts);
 ok('κάθε JSON του φακέλου είναι στον κατάλογο ή είναι δομή',
   fsx.readdirSync(pathx.join(ROOT,'data')).filter(function(f){ return /\.json$/.test(f); })
     .every(function(f){ var id=f.replace(/\.json$/,'');
       return id==='index'||id==='pinakakia'||id==='arxikoi-xronoi'||ix.texts.indexOf(id)>=0; }));

 await new Promise(r=>server.listen(0,'127.0.0.1',r)); const HTTP=server.address().port;
 const chrome=spawn(CHROME,['--headless=new','--remote-debugging-port='+PORT,'--no-first-run','--user-data-dir=/tmp/cdp-agn-test','--hide-scrollbars','about:blank'],{stdio:'ignore'});
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
 const size=(w,h)=>S('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:false});
 await size(1440,2000);
 await S('Page.navigate',{url:'http://127.0.0.1:'+HTTP+'/arxaia-agnosto.html'});
 await sleep(2400);
 const ev=async e=>(await S('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true})).result.value;
 const go=async(h)=>{ await ev('location.hash='+JSON.stringify(h)); await sleep(700); };
 const store=async()=>JSON.parse(await ev("localStorage.getItem('agn:v1')||'{}'"));

 console.log('\nΒ · ΤΑ ΔΕΔΟΜΕΝΑ ΦΤΑΝΟΥΝ ΚΑΙ Η ΒΙΒΛΙΟΘΗΚΗ ΖΩΓΡΑΦΙΖΕΤΑΙ');
 ok('ένα κείμενο στη βιβλιοθήκη', await ev("document.querySelectorAll('#scr-home .librow').length")===1);
 ok('ο τίτλος του έργου αυτολεξεί από το JSON',
   (await ev("document.querySelector('#scr-home .librow .what').textContent"))==='Περὶ τοῦ Σηκοῦ Ἀπολογία');
 ok('έξι κάρτες', await ev("document.querySelectorAll('#scr-home .card').length")===6);
 ok('ο μετρητής περιόδων μετράει το JSON, όχι σταθερά',
   (await ev("document.querySelector('#stats .stat .v').textContent")).indexOf('/6')>0);

 console.log('\nΓ · Η ΕΞΟΔΟΣ (σταθ. 64)');
 const exit=await ev(`(function(){var a=document.querySelector('.nav .exit');if(!a)return null;
   var r=a.getBoundingClientRect(),cs=getComputedStyle(a);
   function lum(c){var m=c.match(/[\\d.]+/g).map(Number);var f=m.slice(0,3).map(function(v){v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});
     return .2126*f[0]+.7152*f[1]+.0722*f[2]}
   var bg=getComputedStyle(document.body).backgroundColor;
   var L1=lum(cs.color),L2=lum(bg),cr=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
   return JSON.stringify({tag:a.tagName,href:a.getAttribute('href'),text:a.textContent.trim(),h:r.height,cr:Math.round(cr*100)/100});})()`);
 const E=JSON.parse(exit||'null');
 ok('υπάρχει και είναι ΣΥΝΔΕΣΜΟΣ', !!E && E.tag==='A', E);
 ok('δείχνει στο School Studies', E && E.href==='homework.html', E&&E.href);
 ok('ΕΧΕΙ ΛΕΞΗ, και είναι το όνομα του προορισμού', E && /School Studies/.test(E.text), E&&E.text);
 ok('ΜΕΤΡΗΜΕΝΗ αντίθεση ≥ 4.5:1', E && E.cr>=4.5, E&&E.cr);
 ok('στόχος αφής ≥ 24px', E && E.h>=24, E&&E.h);

 console.log('\nΔ · ΤΟ ΠΟΛΥΤΟΝΙΚΟ ΜΠΑΙΝΕΙ ΣΤΟ ΤΕΛΕΥΤΑΙΟ ΦΩΝΗΕΝ');
 const M={psili:'̓',dasia:'̔',oxeia:'́',varia:'̀',perisp:'͂',ypo:'ͅ',dial:'̈'};
 async function mark(txt, marks){
   return await ev(`(function(){var s=${JSON.stringify(txt)};
     ${JSON.stringify(marks)}.forEach(function(m){ s = window.AGN.applyMark(s, m); });
     return s;})()`);
 }
 ok('α + οξεία = ά', (await mark('α',[M.oxeia]))==='ά');
 /* ⚠️ Η ΣΕΙΡΑ ΕΙΝΑΙ ΦΕΡΟΥΣΑ: πνεύμα και τόνος έχουν ΤΗΝ ΙΔΙΑ combining class,
    άρα το NFC ΔΕΝ τα αναδιατάσσει. «οξεία μετά ψιλή» πρέπει να δώσει το ΙΔΙΟ
    γλυφό με «ψιλή μετά οξεία», αλλιώς δεν συντίθεται ποτέ σε ἄ. */
 ok('ψιλή+οξεία = ἄ', (await mark('α',[M.psili,M.oxeia]))==='ἄ');
 ok('ΚΑΙ ΑΝΑΠΟΔΑ (οξεία πρώτα) = ἄ', (await mark('α',[M.oxeia,M.psili]))==='ἄ');
 ok('δασεία+περισπωμένη+υπογεγραμμένη σε ω = ᾧ',
   (await mark('ω',[M.dasia,M.perisp,M.ypo]))==='ᾧ');
 ok('διαλυτικά+βαρεία σε ι = ῒ', (await mark('ι',[M.dial,M.varia]))==='ῒ');
 ok('η δασεία μπαίνει και σε ρ = ῥ', (await mark('ρ',[M.dasia]))==='ῥ');
 ok('δεύτερο πάτημα το ΣΒΗΝΕΙ', (await mark('α',[M.oxeia,M.oxeia]))==='α');
 ok('το σημάδι πάει στο ΤΕΛΕΥΤΑΙΟ φωνήεν, όχι στο πρώτο',
   (await mark('λογο',[M.oxeia]))==='λογό');
 ok('χωρίς φωνήεν ΔΕΝ μαντεύει — γυρίζει null', (await mark('κ',[M.oxeia]))===null);

 console.log('\nΕ · ΤΟ DRILL: ΛΑΘΟΣ → ΕΠΑΝΑΛΗΨΗ, ΚΑΙ ΦΕΥΓΕΙ ΜΕ 2 ΣΩΣΤΕΣ ΣΤΗ ΣΕΙΡΑ');
 await go('#/grammatiki');
 const q1=await ev("document.querySelector('#scr-grammatiki .dform').textContent");
 ok('η πρώτη ερώτηση είναι τύπος του κειμένου', !!q1 && q1.length>1, q1);
 await ev(`(function(){var i=document.getElementById('gIn');i.value='ΛΑΘΟΣ';
   i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));})()`);
 await sleep(300);
 ok('το λάθος λέει το σωστό', /Σωστό:/.test(await ev("document.getElementById('gOut').textContent")));
 let st=await store();
 const gk=Object.keys(st.gram)[0];
 ok('γράφτηκε λάθος στην αποθήκη', st.gram[gk].wrong===1 && st.gram[gk].streak===0, st.gram[gk]);

 /* ⚠️ ΟΔΗΓΕΙΤΑΙ Η ΣΕΛΙΔΑ, ΟΧΙ Η ΑΠΟΘΗΚΗ: απαντάει ΠΑΝΤΑ σωστά σε ΟΤΙ ΔΕΙΧΝΕΙ
    η οθόνη, και κοιτάζει πότε το λαθεμένο ερώτημα μαζεύει δύο σωστές ΣΤΗ
    ΣΕΙΡΑ. Η σελίδα προχωράει σε άλλη ερώτηση ανάμεσα — αυτό ΕΙΝΑΙ η μηχανή. */
 async function curItem(){
   const r = await ev(`(function(){var d=document.querySelector('#scr-grammatiki .dform');
     if(!d) return null;
     var f=d.textContent.trim(), pr=document.querySelector('#scr-grammatiki .dask').textContent.trim();
     var t=window.AGN.activeText();
     var it=window.AGN.gramItems(t).filter(function(x){return x.form===f && x.prompt===pr;})[0];
     return it? JSON.stringify({id:it.id, a:it.accept[0]}) : null;})()`);
   return r? JSON.parse(r) : null;
 }
 async function answerCorrect(){
   const it=await curItem(); if(!it) return null;
   await ev(`(function(){var i=document.getElementById('gIn');i.value=${JSON.stringify(it.a)};
     i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));})()`);
   await sleep(220);
   await ev("(function(){var b=document.getElementById('gNextB'); if(b) b.click();})()");
   await sleep(320);
   return it.id;
 }
 ok('ο μετρητής «λάθη σε επανάληψη» δείχνει 1 στην επόμενη οθόνη',
   await (async()=>{ await ev("(function(){var b=document.getElementById('gNextB'); if(b) b.click();})()"); await sleep(350);
     return (await ev("document.querySelector('#scr-grammatiki .bignum').textContent")).trim()==='1'; })());
 let first=null, second=null, rounds=0;
 while (rounds++ < 14){
   const id=await answerCorrect(); if(!id) break;
   st=await store();
   const r=st.gram[gk];
   if (id===gk.split('|')[1]){ if(first===null) first=r.streak; else if(second===null) second=r.streak; }
   if (r.streak>=2) break;
 }
 st=await store();
 ok('μία σωστή ΔΕΝ το βγάζει από την επανάληψη', first===1, first);
 ok('δύο σωστές στη σειρά το βγάζουν', st.gram[gk].streak>=2, st.gram[gk]);
 ok('ο μετρητής έπεσε στο 0',
   (await ev("document.querySelector('#scr-grammatiki .bignum').textContent")).trim()==='0');
 ok('κάθε εγγραφή πήρε σφραγίδα _ts (σταθ. 31)', typeof st.gram[gk]._ts==='number' && st.gram[gk]._ts>1e12, st.gram[gk]._ts);

 console.log('\nΣΤ · Η ΜΕΤΑΦΡΑΣΗ, ΚΑΙ Η ΥΠΟΒΟΛΗ ΠΟΥ ΛΕΕΙ ΤΙ ΤΗΣ ΛΕΙΠΕΙ (σταθ. 65)');
 await go('#/keimeno/lysias-7-27-29');
 ok('έξι περίοδοι στην οθόνη', await ev("document.querySelectorAll('#pers .per').length")===6);
 ok('το intro των εξετάσεων είναι πάνω από το κείμενο',
   (await ev("document.querySelector('#scr-keimeno .intro p').textContent")).indexOf('μορίαι')>0);
 ok('οι γλώσσες των εξετάσεων φαίνονται',
   await ev("document.querySelectorAll('#scr-keimeno .gloss div').length")===3);
 ok('η ΠΡΟΤΥΠΗ μετάφραση ΔΕΝ φαίνεται πριν τη διόρθωση',
   await ev("document.querySelectorAll('#pers .model').length")===0);
 await ev(`(function(){var ta=document.querySelector('[data-tr="1"]');
   ta.value='Ποιο από τα δύο ήταν καλύτερο για μένα';
   ta.dispatchEvent(new Event('input',{bubbles:true}));})()`);
 await sleep(700);
 st=await store();
 ok('το πρόχειρο αποθηκεύτηκε', (st.texts['lysias-7-27-29'].drafts['1']||'').indexOf('Ποιο')===0);
 await ev("document.getElementById('subBtn').click()");
 await sleep(300);
 const why=await ev("document.getElementById('subWhy').textContent");
 ok('η υποβολή ΛΕΕΙ ποιες περίοδοι λείπουν', /Λείπει|Λείπ/.test(why) && /2, 3, 4, 5, 6/.test(why), why);
 ok('ΔΕΝ ζωγραφίζεται νεκρό κουμπί', await ev("!document.getElementById('subBtn').disabled"));
 /* η καθοδήγηση */
 ok('πέντε βήματα καθοδήγησης', await ev("document.querySelectorAll('#guide .step').length")===5);
 await ev("document.getElementById('gNext').click()"); await sleep(300);
 ok('το επόμενο βήμα φωτίζει λέξεις μέσα στο κείμενο',
   await ev("document.querySelectorAll('#pers w.hl').length")>0);
 ok('κλικ σε λέξη δείχνει λήμμα και γραμματική, ΟΧΙ συντακτικό ρόλο',
   await ev(`(function(){var w=document.querySelector('#pers w.an'); w.click();
     var p=document.getElementById('pop'); if(!p) return false;
     var txt=p.textContent; var has=/Στις κάρτες/.test(txt);
     var t=window.AGN.DATA.byId['lysias-7-27-29'];
     var role=t.periods[0].words[0].role;
     return has && txt.indexOf(role)<0;})()`));
 await ev("(function(){var x=document.getElementById('popX'); if(x) x.click();})()");

 console.log('\nΖ · Η ΔΙΟΡΘΩΣΗ ΜΕ ΑΝΤΙΓΡΑΦΗ-ΕΠΙΚΟΛΛΗΣΗ');
 await ev(`(function(){var s=window.AGN.S(), t=window.AGN.DATA.byId['lysias-7-27-29'];
   t.periods.forEach(function(p){ s.texts[t.id].drafts[p.n]='Η μετάφρασή μου για την περίοδο '+p.n+'.'; });
   window.AGN.save();})()`);
 await go('#/keimeno/lysias-7-27-29');
 await ev("document.getElementById('subBtn').click()");
 await sleep(400);
 ok('με όλες μεταφρασμένες, ανοίγει το πεδίο επικόλλησης',
   await ev("!!document.getElementById('fixIn')"));
 await ev(`(function(){document.getElementById('fixIn').value='δεν είναι json';})()`);
 await ev("document.getElementById('fixGo').click()"); await sleep(200);
 ok('σκουπίδια → ΛΕΕΙ γιατί, δεν σωπαίνει',
   /JSON/.test(await ev("document.getElementById('fixMsg').textContent")));
 const FIX='{"text_id":"lysias-7-27-29","score":16,"errors":[' +
   '{"period":1,"quote":"περίοδο 1","type":"γραμματικό","explain":"δοκιμή","correct":"ΤΟ ΣΩΣΤΟ"},' +
   '{"period":2,"quote":"ΔΕΝ ΥΠΑΡΧΕΙ ΠΟΥΘΕΝΑ","type":"λεξιλογικό","explain":"δοκιμή 2","correct":"χ"}]}';
 await ev(`(function(){document.getElementById('fixIn').value=${JSON.stringify(FIX)};})()`);
 await ev("document.getElementById('fixGo').click()"); await sleep(900);
 ok('πάει στην οθόνη της διόρθωσης', (await ev("location.hash")).indexOf('diorthosi')>0);
 ok('ο βαθμός φαίνεται', (await ev("document.querySelector('#scr-diorthosi .scorebox .b').textContent")).trim()==='16');
 ok('το λάθος υπογραμμίζεται ΠΑΝΩ στη μετάφρασή του',
   await ev("document.querySelectorAll('#scr-diorthosi mark.e').length")===1);
 /* ⛔ σταθ. 10: ό,τι δεν βρέθηκε ΔΕΝ εξαφανίζεται σιωπηλά. */
 ok('η φράση που δεν βρέθηκε ΔΗΛΩΝΕΤΑΙ',
   /δεν μπόρεσα να τα δείξω/.test(await ev("document.getElementById('scr-diorthosi').textContent")));
 ok('η ΠΡΟΤΥΠΗ μετάφραση φαίνεται ΜΟΝΟ τώρα',
   await ev("document.querySelectorAll('#scr-diorthosi .model').length")===6);
 await go('#/grammatiki');
 ok('το γραμματικό λάθος μπήκε στο drill',
   await ev(`(function(){var t=window.AGN.activeText();
     return window.AGN.gramItems(t).some(function(i){return i.fromFix===true;});})()`));

 console.log('\nΗ · ΤΟ ΣΥΝΤΑΚΤΙΚΟ');
 await go('#/syntaktiko');
 const synOK=await ev(`(function(){var t=window.AGN.activeText();
   var w=t.syntax.word_items[0];
   var opts=[].slice.call(document.querySelectorAll('#wOpts .opt')).map(function(b){return b.getAttribute('data-o')});
   var all=w.accept.every(function(a){return opts.indexOf(a)>=0});
   return JSON.stringify({n:opts.length, all:all, accept:w.accept});})()`);
 const SY=JSON.parse(synOK);
 ok('8–10 επιλογές', SY.n>=8 && SY.n<=10, SY.n);
 ok('ΟΛΕΣ οι σωστές είναι μέσα στις επιλογές (απαίτηση του brief)', SY.all, SY);
 await ev(`(function(){var b=document.querySelector('#wOpts .opt[data-o='+JSON.stringify(${JSON.stringify(SY.accept[0])})+']');b.click();})()`);
 await sleep(300);
 ok('μετά την απάντηση φαίνεται το ΠΛΗΡΕΣ answer',
   await ev(`(function(){var t=window.AGN.activeText();
     return document.getElementById('wOut').textContent.indexOf(t.syntax.word_items[0].answer)>=0;})()`));
 ok('τα 4 πεδία της δευτερεύουσας υπάρχουν',
   await ev("document.querySelectorAll('#pC [data-f]').length")===4);
 await ev("document.getElementById('cGo').click()"); await sleep(250);
 ok('άδεια πεδία → ΛΕΕΙ τι λείπει (σταθ. 65)',
   /Λείπ/.test(await ev("document.getElementById('cOut').textContent")));
 ok('οι μετατροπές δείχνουν λύση μόνο όταν τη ζητήσει',
   await ev("document.querySelectorAll('#pT .modelbox').length")===0);

 console.log('\nΘ · ΟΙ ΑΔΕΙΕΣ ΟΘΟΝΕΣ ΛΕΝΕ «ΑΔΕΙΟ», ΟΧΙ «ΧΑΛΑΣΕ» (σταθ. 10)');
 await go('#/pinakakia');
 ok('τα πινακάκια λένε ότι δεν ήρθαν ακόμη',
   /Κανένας πίνακας ακόμη/.test(await ev("document.getElementById('scr-pinakakia').textContent")));
 ok('και ΔΕΝ λένε ότι απέτυχε η ανάγνωση',
   !/Δεν μπόρεσα/.test(await ev("document.getElementById('scr-pinakakia').textContent")));
 await go('#/xronoi');
 const xr=await ev("document.getElementById('scr-xronoi').textContent");
 ok('οι αρχικοί χρόνοι λένε «0 ρήματα»', /0 ρήματα/.test(xr));
 ok('και δείχνουν πού ζει η ανάκληση σήμερα', /αρχικοί χρόνοι/.test(xr));
 ok('⛔ κανένα placeholder ρήμα του σχεδίου δεν μπήκε',
   !/λαμβάνω|ἤνεγκα|ἔλαβον/.test(xr));
 await go('#/lexilogio');
 ok('το λεξιλόγιο έχει τις κάρτες του κειμένου',
   await ev("document.querySelectorAll('#scr-lexilogio .vrow').length")===21);

 console.log('\nΙ · ΜΗΔΕΝ ΟΡΙΖΟΝΤΙΑ ΚΥΛΙΣΗ (1440 ΚΑΙ ΑΛΗΘΙΝΑ 393)');
 const SCREENS=['#/','#/keimeno/lysias-7-27-29','#/diorthosi/lysias-7-27-29','#/grammatiki','#/syntaktiko','#/lexilogio','#/pinakakia','#/xronoi'];
 for (const w of [1440, 393]){
   await size(w, w===393?800:2000);
   let bad=[];
   for (const h of SCREENS){
     await go(h);
     const r=await ev(`(function(){var out=[];
       if(document.documentElement.scrollWidth>document.documentElement.clientWidth+1) out.push('DOC');
       document.querySelectorAll('.scr:not([hidden]) *').forEach(function(n){
         var cs=getComputedStyle(n);
         if(cs.overflowX==='auto'||cs.overflowX==='scroll') return;
         if(n.scrollWidth-n.clientWidth>2 && n.textContent.trim() && cs.textOverflow!=='ellipsis')
           out.push(n.tagName+'.'+n.className);
       });
       return JSON.stringify(out.slice(0,3));})()`);
     const o=JSON.parse(r); if(o.length) bad.push(h+' → '+o.join(','));
   }
   ok('καμία υπερχείλιση στα '+w+'px', bad.length===0, bad);
 }
 await size(1440,2000);

 console.log('\nΚ · ΜΗΔΕΝ EXCEPTIONS');
 ok('καμία εξαίρεση σε ΟΛΗ τη διαδρομή', exc.length===0, exc.slice(0,3));

 console.log('\n' + (F? '  ✗ ':'  ✓ ') + P + ' passed, ' + F + ' failed');
 try{chrome.kill()}catch(e){}
 server.close();
 process.exit(F?1:0);
})().catch(e=>{console.error('  ✗ FAIL harness',e&&e.message);process.exit(1)});
