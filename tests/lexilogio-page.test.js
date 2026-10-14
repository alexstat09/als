/* ══════════════════════════════════════════════════════════════════════
   tests/lexilogio-page.test.js — ΤΟ ΛΕΞΙΛΟΓΙΟ, ΟΔΗΓΗΜΕΝΟ ΣΕ ΑΛΗΘΙΝΟ CHROME

   Σταθ. 57: η `arxaia-lexilogio.html` στήνει όλη της τη διεπαφή σε JS και
   φορτώνει τις σελίδες με fetch, άρα ΟΔΗΓΕΙΤΑΙ, δεν διαβάζεται. Κάθε κίνηση
   είναι ΠΛΗΚΤΡΟ, όπως τη δουλεύει ο ίδιος στο λάπτοπ (kit §7).

   ⛔ ΚΑΝΕΝΑ SYNC ΣΕ HARNESS (σταθ. 8): ο server σερβίρει ΑΔΕΙΑ τα `sync.js`
   και `vendor/supabase.min.js`, και το `initCloudSync` είναι στουμπωμένο.

     Α · πρώτο πέρασμα: γνωριμία ΠΡΙΝ από ερώτηση, κλείσιμο στη μέση → συνέχεια
     Β · το ρολόι ξεκινάει στο τέλος· οι νέες Δύσκολες ΟΧΙ την ίδια μέρα
     Γ · +2 μέρες: «Θα ήταν καλό…» χωρίς αριθμό → σελίδα → Δύσκολες → τέλος
     Δ · η αποφοίτηση από τις Δύσκολες γράφει ΤΑΦΟΠΛΑΚΑ (σταθ. 32/61)
     Ε · `_ts` σε κάθε εγγραφή (σταθ. 31) · άγνωστο πεδίο επιβιώνει (σταθ. 35)
     ΣΤ · εισαγωγή σελίδας: λάθος → μήνυμα · σωστή → προστίθεται
     Ζ · χαλασμένη αποθήκη ΔΕΝ ξαναγράφεται · αποτυχία fetch ΛΕΓΕΤΑΙ (σταθ. 10)
     Η · η έξοδος έχει λέξη, πάει στο άγνωστο, μετρημένη αντίθεση (σταθ. 64)
     Θ · μηδέν οριζόντια κύλιση σε 1440 · 1280 · 390 · μηδέν exceptions
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
const http=require('http'),fsx=require('fs'),pathx=require('path');
const ROOT=pathx.resolve(__dirname,'..');
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
const STRIPPED=['/sync.js','/vendor/supabase.min.js'];
let syncHits=0, failData=false; const otherStripped=[];
const server=http.createServer((req,res)=>{
  const u=decodeURIComponent(req.url.split('?')[0]);
  if(STRIPPED.indexOf(u)>=0||/sync|supabase|topbar|nova/i.test(u)){ if(STRIPPED.indexOf(u)>=0) syncHits++; else otherStripped.push(u); res.writeHead(200,{'Content-Type':MIME['.js']}); res.end('/* stripped by harness */'); return; }
  if(u==='/data/lexilogio.json'&&failData){ res.writeHead(503); res.end('down'); return; }
  const f=pathx.join(ROOT,u);
  if(f.indexOf(ROOT)!==0||!fsx.existsSync(f)||fsx.statSync(f).isDirectory()){res.writeHead(404);res.end('no');return}
  res.writeHead(200,{'Content-Type':MIME[pathx.extname(f)]||'application/octet-stream'});
  res.end(fsx.readFileSync(f));
});
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if(!fsx.existsSync(CHROME)){console.error('  ✗ FAIL δεν βρέθηκε το Google Chrome — ΔΕΝ έτρεξε κανένας έλεγχος, δεν πέρασε τίποτα.');process.exit(1)}
const PORT=9371;
const {spawn}=require('child_process');
let id=0,ws,pend=new Map();
const send=(m,p,s)=>new Promise((res,rej)=>{const i=++id;pend.set(i,{res,rej});ws.send(JSON.stringify({id:i,method:m,params:p,sessionId:s}))});
const sleep=n=>new Promise(r=>setTimeout(r,n));
let P=0,F=0;
const ok=(n,c,extra)=>{c?P++:F++;console.log((c?'  ✓ ':'  ✗ FAIL ')+n+(c?'':'   '+JSON.stringify(extra===undefined?null:extra)))};
const KEY='metron.lexilogio.v2', TOMB='__synctomb__lexilogio';
const SEED=`window.ALS_LOCAL_ONLY=true; window.initCloudSync=function(){}; window.supabase=null;`;
const SHOTS=process.env.LEX_SHOTS||'';

(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r)); const HTTP=server.address().port;
 const BASE='http://127.0.0.1:'+HTTP+'/arxaia-lexilogio.html';
 const chrome=spawn(CHROME,['--headless=new','--remote-debugging-port='+PORT,'--no-first-run','--user-data-dir=/tmp/cdp-lex-test-'+process.pid,'--hide-scrollbars','about:blank'],{stdio:'ignore'});
 let info=null;for(let i=0;i<60;i++){try{info=await(await fetch('http://127.0.0.1:'+PORT+'/json/version')).json();break}catch(e){await sleep(300)}}
 ws=new WebSocket(info.webSocketDebuggerUrl);const exc=[];
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id&&pend.has(m.id)){const p=pend.get(m.id);pend.delete(m.id);m.error?p.rej(new Error(JSON.stringify(m.error))):p.res(m.result)}
  else if(m.method==='Runtime.exceptionThrown')exc.push(m.params.exceptionDetails.exception&&m.params.exceptionDetails.exception.description||m.params.exceptionDetails.text)
  else if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')exc.push('console.error: '+JSON.stringify(m.params.args.map(a=>a.value)))};
 await new Promise(r=>ws.onopen=r);
 const t=await send('Target.createTarget',{url:'about:blank'});
 const {sessionId}=await send('Target.attachToTarget',{targetId:t.targetId,flatten:true});
 const S=(m,p)=>send(m,p,sessionId);
 await S('Page.enable');await S('Runtime.enable');
 await S('Page.addScriptToEvaluateOnNewDocument',{source:SEED});
 const size=(w,h)=>S('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:false});
 const ev=async e=>{const r=await S('Runtime.evaluate',{expression:e,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(e+' → '+JSON.stringify(r.exceptionDetails.exception&&r.exceptionDetails.exception.description));return r.result.value};
 /* ⚠️ Το query ΑΛΛΑΖΕΙ σε κάθε πλοήγηση (μνήμη: ένα σκέτο #hash δεν ξαναφορτώνει). */
 let nav=0;
 /* Περιμένει να ΖΩΓΡΑΦΙΣΤΕΙ η αρχική (όχι σταθερό sleep — υπό φόρτο ένα 900ms
    έβγαζε σπάνιο κόκκινο που δεν ήταν της σελίδας). */
 const open=async(today)=>{ await S('Page.navigate',{url:BASE+'?today='+today+'&n='+(++nav)}); await sleep(150);
   for(let i=0;i<60;i++){ try{ if(await ev(`document.readyState==='complete'&&!!document.querySelector('#main section')&&!/Φορτώνει/.test(document.getElementById('main').textContent)`)) break; }catch(e){} await sleep(100); } await sleep(120); };
 const VK={Enter:13,' ':32,Escape:27,'1':49,'2':50,'/':191};
 const CODE={Enter:'Enter',' ':'Space',Escape:'Escape','1':'Digit1','2':'Digit2','/':'Slash'};
 const key=async k=>{ const p={key:k,code:CODE[k],windowsVirtualKeyCode:VK[k],nativeVirtualKeyCode:VK[k]};
   await S('Input.dispatchKeyEvent',Object.assign({type:'keyDown'},p,(k.length===1)?{text:k}:{}));
   await S('Input.dispatchKeyEvent',Object.assign({type:'keyUp'},p)); await sleep(25); };
 const store=async()=>JSON.parse(await ev(`localStorage.getItem('${KEY}')||'null'`));
 const txt=sel=>ev(`(document.querySelector(${JSON.stringify(sel)})||{}).textContent||''`);
 const shot=async name=>{ if(!SHOTS)return; const r=await S('Page.captureScreenshot',{format:'png',captureBeyondViewport:true}); fsx.writeFileSync(pathx.join(SHOTS,name+'.png'),Buffer.from(r.data,'base64')); };
 const noScroll=async label=>{
   const r=await ev(`(()=>{const d=document.documentElement;const bad=[];document.querySelectorAll('#main *, .session *').forEach(el=>{if(el.offsetParent===null&&getComputedStyle(el).position!=='fixed')return;if(el.scrollWidth>el.clientWidth+1&&getComputedStyle(el).overflowX!=='visible'&&el.clientWidth>0)bad.push(el.className||el.tagName)});
     const wide=[...document.querySelectorAll('#main *, #session *')].filter(el=>{const b=el.getBoundingClientRect();return b.width&&b.right>innerWidth+1}).map(el=>el.className||el.tagName).slice(0,5);
     return {sw:d.scrollWidth,cw:d.clientWidth,bad,wide}})()`);
   ok(label+' — μηδέν οριζόντια κύλιση ('+r.sw+' ≤ '+r.cw+')',r.sw<=r.cw&&!r.wide.length,r);
 };

 await size(1440,900);
 await S('Page.navigate',{url:BASE+'?today=2026-10-14&n=0'}); await sleep(300);
 await ev(`localStorage.clear()`);

 console.log('\nΑ · ΠΡΩΤΟ ΠΕΡΑΣΜΑ — ΜΟΝΟ ΜΕ ΠΛΗΚΤΡΟΛΟΓΙΟ');
 await open('2026-10-14');
 ok('το sync δεν φορτώθηκε: ο server έδωσε άδεια τα sync.js/supabase', syncHits>=2 && syncHits%2===0 && await ev('typeof window.ALSSync')==='undefined', {syncHits});
 ok('η αρχική λέει «Σήμερα, η νέα Σελίδα 1.»', (await txt('.today h1'))==='Σήμερα, η νέα Σελίδα 1.', await txt('.today h1'));
 ok('…και «50 κάρτες · περίπου 18 λεπτά»', /^50 κάρτες · περίπου 18 λεπτά/.test(await txt('.today .sub')), await txt('.today .sub'));
 ok('η εβδομάδα δεν λέει ονόματα σελίδων ούτε λέξεις', !/Σελίδα|λέξ/.test(await txt('.week')), await txt('.week'));
 await shot('1-home-new-1440');
 await key('Enter');
 ok('Enter → Γνωριμία (όχι ερώτηση)', (await txt('.eyebrow'))==='Γνωριμία' && !(await ev('!!document.querySelector(".card")')));
 const famHead=await ev(`[...document.querySelectorAll('.famh .gr')].map(e=>e.textContent)`);
 ok('η γνωριμία δείχνει οικογένειες', famHead.length>=1, famHead);
 await shot('2-preview-1440');
 await noScroll('γνωριμία 1440');
 const seen=new Set(await ev(`[...document.querySelectorAll('.iw .top .gr')].map(e=>e.textContent)`));
 await key('Enter');
 const target=await txt('.c-word');                       // αυτή θα τη χάσει δύο φορές → Δύσκολες
 ok('η πρώτη ερώτηση είναι λέξη που μόλις είδε', seen.has(target), {target,seen:[...seen]});
 await shot('3-card-ask-1440');
 let wrongs=0, steps=0, askedUnseen=[], resumed=false;
 for(;steps<900;steps++){
   const st=await ev(`({ack:!!document.getElementById('ack'),show:!!document.getElementById('show'),no:!!document.getElementById('no'),cont:!!document.getElementById('cont'),w:(document.querySelector('.c-word')||{}).textContent||'',pv:[...document.querySelectorAll('.iw .top .gr')].map(e=>e.textContent)})`);
   if(st.cont) break;
   if(st.ack){ st.pv.forEach(w=>seen.add(w)); await key('Enter'); continue; }
   if(st.show){ if(!seen.has(st.w)) askedUnseen.push(st.w); await key(' ');
     if(steps===8){ await shot('4-card-revealed-1440'); await noScroll('κάρτα 1440'); }
     continue; }
   if(st.no){
     const bad=st.w===target&&wrongs<2; if(bad) wrongs++;
     await key(bad?'1':'2');
     if(!resumed&&steps>60){                              // κλείσιμο στη μέση → συνέχεια
       resumed=true;
       const before=await ev(`document.getElementById('sCount').textContent`);
       await key('Escape');
       ok('Esc κλείνει τη συνεδρία', !(await ev(`document.getElementById('session').classList.contains('on')`)));
       const s1=await store();
       ok('η μισή σελίδα είναι σωσμένη (learning)', s1&&s1.pages.p170&&s1.pages.p170.status==='learning', s1&&s1.pages);
       ok('…με σφραγίδα _ts', s1&&typeof s1.pages.p170._ts==='number');
       await open('2026-10-14');
       ok('η αρχική λέει «το υπόλοιπο της Σελίδας 1»', /το υπόλοιπο της Σελίδας 1/.test(await txt('.today h1')), await txt('.today h1'));
       ok('ο πίνακας λέει «μισή» και «Πρώτο πέρασμα, Ν%»', /μισή/.test(await txt('.prow .when')) && /Πρώτο πέρασμα, \d+%/.test(await txt('.prow .ladder-note')));
       await key('Enter');
       const after=await ev(`document.getElementById('sCount').textContent`);
       ok('Enter → συνεχίζει από το ίδιο σημείο ('+before+')', after===before, {before,after});
       if(await ev(`!!document.getElementById('ack')`)) (await ev(`[...document.querySelectorAll('.iw .top .gr')].map(e=>e.textContent)`)).forEach(w=>seen.add(w));
     }
     continue; }
   await sleep(50);
 }
 ok('κανένα ερώτημα για λέξη που δεν είχε δει', askedUnseen.length===0, askedUnseen);
 ok('το πέρασμα τελείωσε μέσα σε όριο κινήσεων ('+steps+')', steps<900);
 ok('έγινε το κλείσιμο-συνέχεια', resumed);
 const endTxt=await txt('.end');
 ok('τέλος: «Ξεκίνησε.» και «πρώτη επανάληψη αύριο, Πέμ 15/10»', /Ξεκίνησε\./.test(endTxt)&&/πρώτη επανάληψη αύριο, Πέμ 15\/10/.test(endTxt), endTxt);
 ok('…και η λέξη που χάθηκε δύο φορές πάει στις Δύσκολες', endTxt.indexOf(target)>=0, {target,endTxt});
 await shot('5-first-end-1440');
 await key('Enter');

 console.log('\nΒ · ΤΟ ΡΟΛΟΙ ΚΑΙ ΟΙ ΔΥΣΚΟΛΕΣ ΤΗΝ ΙΔΙΑ ΜΕΡΑ');
 let s=await store();
 const hid=Object.keys(s.hard)[0];
 ok('σελίδα active από 14/10, σκαλί 0', s.pages.p170.status==='active'&&s.pages.p170.lastDone==='2026-10-14'&&s.pages.p170.stage===0, s.pages.p170);
 ok('ΜΙΑ Δύσκολη, η σωστή, με _ts', Object.keys(s.hard).length===1&&typeof s.hard[hid]._ts==='number', s.hard);
 ok('η αρχική: «Για σήμερα είσαι εντάξει.» (οι νέες Δύσκολες δεν ξαναμπαίνουν σήμερα)', (await txt('.today h1'))==='Για σήμερα είσαι εντάξει.', await txt('.today h1'));
 ok('…με την επόμενη ημερομηνία', /αύριο, Πέμ 15\/10/.test(await txt('.today .sub')), await txt('.today .sub'));
 ok('οι Δύσκολες φαίνονται ως κάρτα με τη λέξη', (await txt('.hc .gr'))===target);
 await ev(`document.querySelector('.hc').click()`); await sleep(100);
 ok('κλικ στη Δύσκολη → σημασία', !/πάτα για σημασία/.test(await txt('.hc .m')) && (await txt('.hc .m')).length>0);
 /* σταθ. 35: ένα άγνωστο πεδίο επιβιώνει load + save */
 await ev(`(()=>{const s=JSON.parse(localStorage.getItem('${KEY}'));s.future={kept:1};s.pages.p170.mine='x';localStorage.setItem('${KEY}',JSON.stringify(s))})()`);
 await shot('6-home-done-1440');

 console.log('\nΓ · +2 ΜΕΡΕΣ: Η ΣΕΛΙΔΑ ΠΕΡΙΜΕΝΕΙ ΧΩΡΙΣ ΝΑ ΜΕΤΡΑΕΙ');
 await open('2026-10-16');
 const h1=await txt('.today h1'), stp=await txt('.steps li .s');
 ok('«Σήμερα, η Σελίδα 1 και μία δύσκολη.»', h1==='Σήμερα, η Σελίδα 1 και μία δύσκολη.', h1);
 ok('«Θα ήταν καλό να την ξαναπεράσεις» — χωρίς αριθμό ημερών', /Θα ήταν καλό να την ξαναπεράσεις/.test(stp)&&!/\d/.test(stp), stp);
 ok('ο πίνακας: «σήμερα», όχι «καθυστέρηση»', (await txt('.prow .when'))==='σήμερα' && !/καθυστ|έληξε/.test(await txt('#main')));
 await shot('7-home-waiting-1440');
 await key('Enter');
 ok('η μπάρα λέει «Σελίδα 1 · επανάληψη · μετά: Δύσκολες»', /Σελίδα 1 · επανάληψη\s*· μετά: Δύσκολες/.test(await txt('#sWhere')), await txt('#sWhere'));
 ok('ο μετρητής ξεκινά από 0 / 51', (await txt('#sCount'))==='0 / 51', await txt('#sCount'));
 let missed=null;
 for(let i=0;i<200;i++){
   const st=await ev(`({show:!!document.getElementById('show'),no:!!document.getElementById('no'),cont:!!document.getElementById('cont'),w:(document.querySelector('.c-word')||{}).textContent||''})`);
   if(st.cont) break;
   if(st.show){ await key(' '); continue; }
   /* Χάνει την πρώτη λέξη που ΔΕΝ είναι ήδη Δύσκολη: αν χάσει την ίδια (1/50
      τυχαία), το σερί της σωστά μηδενίζεται και το σενάριο του Δ δεν στήνεται. */
   if(st.no){ const bad=!missed&&st.w!==target; if(bad) missed=st.w; await key(bad?'1':'2'); continue; }
   await sleep(50);
 }
 const seg=await txt('.end');
 ok('ενδιάμεση οθόνη σελίδας: «49 / 50»', /49\s*\/\s*50/.test(seg), seg);
 ok('«Ανέβηκε σκαλί» · «επόμενη σε 3 μέρες, Δευ 19/10»', /Ανέβηκε σκαλί/.test(seg)&&/επόμενη σε 3 μέρες, Δευ 19\/10/.test(seg), seg);
 ok('το χαμένο πάει στις Δύσκολες', seg.indexOf(missed)>=0, {missed});
 ok('το σκορ είναι σε ουδέτερο χρώμα, όχι κόκκινο', await ev(`getComputedStyle(document.querySelector('.score')).color`)==='rgb(238, 231, 220)');
 await shot('8-seg-end-1440');
 s=await store();
 ok('η σελίδα ΚΛΕΙΔΩΣΕ πριν τις Δύσκολες: σκαλί 1, 16/10', s.pages.p170.stage===1&&s.pages.p170.lastDone==='2026-10-16', s.pages.p170);
 ok('σταθ. 35: το άγνωστο πεδίο (και μέσα στην εγγραφή) επιβίωσε', s.future&&s.future.kept===1&&s.pages.p170.mine==='x', {future:s.future,mine:s.pages.p170.mine});
 await key('Enter');
 ok('Συνέχεια → Δύσκολες με τη λέξη της 14/10 (όχι τη σημερινή)', (await txt('#sWhere'))==='Δύσκολες'&&(await txt('.c-word'))===target, {w:await txt('#sWhere'),c:await txt('.c-word')});
 await key(' '); await key('2'); await sleep(100);
 const hEnd=await txt('.end');
 ok('τέλος Δυσκόλων: «1 / 1» και «θέλουν άλλη μία μέρα»', /1\s*\/\s*1/.test(hEnd)&&/άλλη μία μέρα/.test(hEnd), hEnd);
 ok('κουμπί «Τέλος για σήμερα»', /Τέλος για σήμερα/.test(await txt('#cont')));
 await key('Enter');
 s=await store();
 ok('streak 1 για τη λέξη της 14/10, καινούρια για τη σημερινή', s.hard[hid].streak===1&&s.hard[Object.keys(s.hard).find(k=>k!==hid)].lastDay==='2026-10-16', s.hard);

 console.log('\nΔ · Η ΑΠΟΦΟΙΤΗΣΗ ΓΡΑΦΕΙ ΤΑΦΟΠΛΑΚΑ');
 await open('2026-10-17');
 ok('17/10: μόνο Δύσκολες («δύο δύσκολες»)', /^Σήμερα, δύο δύσκολες\.$/.test(await txt('.today h1')), await txt('.today h1'));
 const tsBefore=s.hard[hid]._ts;
 await key('Enter');
 for(let i=0;i<20;i++){ const st=await ev(`({show:!!document.getElementById('show'),no:!!document.getElementById('no'),cont:!!document.getElementById('cont')})`); if(st.cont)break; if(st.show){await key(' ');continue} if(st.no){await key('2');continue} await sleep(50); }
 ok('«Αυτές έφυγαν από τις Δύσκολες» με τη λέξη', /έφυγαν/.test(await txt('.end'))&&(await txt('.end')).indexOf(target)>=0, await txt('.end'));
 await key('Enter');
 s=await store();
 const tomb=JSON.parse(await ev(`localStorage.getItem('${TOMB}')||'{}'`));
 ok('η λέξη έφυγε από το hard', !s.hard[hid], Object.keys(s.hard));
 ok('ταφόπλακα στο tomb[KEY].hard[id] με T > _ts', tomb[KEY]&&tomb[KEY].hard&&tomb[KEY].hard[hid]>tsBefore, tomb);
 /* Το ΑΛΗΘΙΝΟ sync.js: η ταφόπλακα πρέπει να ΣΚΟΤΩΝΕΙ το αντίγραφο του cloud. */
 /* Η μηχανή συγχώνευσης του sync.js, κομμένη ΑΥΤΟΥΣΙΑ (idOf → mergeValue).
    Αν μετακινηθούν τα σημάδια, σκάει δυνατά — ποτέ δεν περνάει σιωπηλά. */
 const vm=require('vm'), SRC=fsx.readFileSync(pathx.join(ROOT,'sync.js'),'utf8');
 const a0=SRC.indexOf('function idOf('), a1=SRC.indexOf('// Recursive deletion diff');
 if(a0<0||a1<0||a1<a0) throw new Error('δεν βρέθηκε η μηχανή συγχώνευσης στο sync.js');
 const sb={}; vm.runInNewContext(SRC.slice(a0,a1)+';this.__mv=mergeValue;',sb);
 const remote=JSON.parse(JSON.stringify(s)); remote.hard[hid]={added:'2026-10-14',streak:1,lastDay:'2026-10-16',_ts:tsBefore};
 const merged=sb.__mv(s,remote,tomb[KEY]);
 ok('mergeValue του sync.js: το παλιό αντίγραφο του cloud ΔΕΝ ξαναζωντανεύει', merged&&!merged.hard[hid], merged&&Object.keys(merged.hard));
 const remote2=JSON.parse(JSON.stringify(s)); remote2.pages.p170=Object.assign({},s.pages.p170,{stage:0,lastDone:'2026-10-14',_ts:s.pages.p170._ts-1000});
 ok('mergeValue: η ΔΕΥΤΕΡΗ επανάληψη δεν γυρνάει πίσω από παλιό cloud (σταθ. 31)', sb.__mv(s,remote2,null).pages.p170.stage===1);
 await shot('9-home-graduated-1440');

 console.log('\nΕ · ΕΙΣΑΓΩΓΗ ΣΕΛΙΔΑΣ');
 await ev(`document.getElementById('openAdd').click()`); await sleep(150);
 ok('το παράθυρο είναι native <dialog> ανοιχτό', await ev(`document.getElementById('modal').open===true && document.getElementById('modal').tagName==='DIALOG'`));
 await ev(`(()=>{const t=document.getElementById('imp');t.value='{"page": {';t.dispatchEvent(new Event('input'));document.getElementById('impBtn').click()})()`); await sleep(80);
 ok('λάθος JSON → μήνυμα', /Δεν διαβάζεται/.test(await txt('#impMsg')), await txt('#impMsg'));
 const pg={page:{id:'p171',bookPage:171,range:'αἰτίαν ἔχω → ἄκων',cards:[{id:'s171-1-01',front:'αἰτίαν ἔχω',back:'κατηγορούμαι',family:'αἰτῶ'},{id:'s171-1-02',front:'ἄκων',back:'χωρίς τη θέλησή μου',family:'Μεμονωμένες'}]}};
 await ev(`(()=>{const t=document.getElementById('imp');t.value=${JSON.stringify(JSON.stringify(pg))};t.dispatchEvent(new Event('input'));document.getElementById('impBtn').click()})()`); await sleep(80);
 ok('σωστό → «Σελίδα 2: φυλλάδιο σ. 171, 2 λέξεις»', /Σελίδα 2: φυλλάδιο σ\. 171, 2 λέξεις/.test(await txt('#impMsg')), await txt('#impMsg'));
 await shot('10-import-1440');
 await ev(`document.getElementById('impBtn').click()`); await sleep(150);
 s=await store();
 ok('προστέθηκε στο extra και ο πίνακας έχει 2 σελίδες', s.extra.length===1&&await ev(`document.querySelectorAll('.prow').length`)===2);
 ok('η αρχική προτείνει τη νέα Σελίδα 2', /η νέα Σελίδα 2/.test(await txt('.today h1')), await txt('.today h1'));
 await ev(`document.getElementById('openAdd').click()`); await sleep(100);
 await ev(`(()=>{const t=document.getElementById('imp');t.value=${JSON.stringify(JSON.stringify(pg))};t.dispatchEvent(new Event('input'));document.getElementById('impBtn').click()})()`); await sleep(80);
 ok('η ίδια σελίδα ξανά → «υπάρχει ήδη»', /υπάρχει ήδη/.test(await txt('#impMsg')), await txt('#impMsg'));
 await key('Escape'); await sleep(100);
 ok('Esc κλείνει το παράθυρο', !(await ev(`document.getElementById('modal').open`)));
 await key('/');
 ok('«/» πάει στην αναζήτηση', await ev(`document.activeElement.id`)==='q');
 await ev(`(()=>{const q=document.getElementById('q');q.value='αιρουμαι';q.dispatchEvent(new Event('input'))})()`); await sleep(80);
 ok('αναζήτηση χωρίς τόνους βρίσκει το αἱροῦμαι', /αἱροῦμαι/.test(await txt('#main')));
 await key('Escape');
 ok('Esc καθαρίζει την αναζήτηση', (await ev(`document.getElementById('q').value`))===''&&!!(await ev(`document.querySelector('.today')`)));

 console.log('\nΖ · ΣΙΩΠΗΛΗ ΑΠΟΤΥΧΙΑ: ΚΑΜΙΑ');
 await ev(`localStorage.setItem('${KEY}','{χαλασμένο')`);
 await open('2026-10-17');
 ok('χαλασμένη αποθήκη → προειδοποίηση στην οθόνη', await ev(`!document.getElementById('warn').hidden`) && /δεν διαβάζεται/.test(await txt('#warn')), await txt('#warn'));
 await key('Enter'); await sleep(100);
 for(let i=0;i<6;i++){ if(await ev(`!!document.getElementById('ack')`)) await key('Enter'); else if(await ev(`!!document.getElementById('show')`)) await key(' '); else await key('2'); }
 ok('…και ΔΕΝ γράφτηκε από πάνω της', await ev(`localStorage.getItem('${KEY}')`)==='{χαλασμένο');
 await key('Escape');
 await ev(`localStorage.removeItem('${KEY}')`);
 failData=true; await open('2026-10-14'); failData=false;
 ok('fetch 503 → «Οι σελίδες δεν ήρθαν» με τον λόγο, όχι «καμία σελίδα»', /Οι σελίδες δεν ήρθαν/.test(await txt('#main'))&&/503/.test(await txt('#main'))&&!/Ξεκίνα με την πρώτη/.test(await txt('#main')), await txt('#main'));
 ok('…και κανένα κλειδί δεν γράφτηκε', await ev(`localStorage.getItem('${KEY}')`)===null);

 console.log('\nΗ · Η ΕΞΟΔΟΣ');
 await open('2026-10-14');
 const ex=await ev(`(()=>{const a=document.querySelector('nav a.back');const r=a.getBoundingClientRect();
   const L=c=>{const m=c.match(/\\d+(\\.\\d+)?/g).map(Number).slice(0,3).map(v=>v/255).map(v=>v<=.03928?v/12.92:((v+.055)/1.055)**2.4);return .2126*m[0]+.7152*m[1]+.0722*m[2]};
   const fg=L(getComputedStyle(a).color),bg=L(getComputedStyle(document.body).backgroundColor);
   return {href:a.getAttribute('href'),text:a.textContent.trim(),h:r.height,cr:(Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05)}})()`);
 ok('έξοδος: σύνδεσμος στο arxaia-agnosto.html (από εκεί μπαίνει), με λέξη', ex.href==='arxaia-agnosto.html'&&/Αρχαία, άγνωστο/.test(ex.text), ex);
 ok('στόχος ≥ 44px και αντίθεση ≥ 4.5:1 ('+ex.cr.toFixed(2)+')', ex.h>=44&&ex.cr>=4.5, ex);
 const fonts=await ev(`[getComputedStyle(document.querySelector('.prow .rg')).fontFamily, getComputedStyle(document.body).fontFamily]`);
 ok('τα αρχαία σε GFS Didot, ποτέ Georgia πρώτη (σταθ. 43)', /^"?GFS Didot/.test(fonts[0]), fonts);

 console.log('\nΘ · ΠΛΑΤΗ');
 /* ένα γεμάτο σενάριο για να μετρηθεί: σελίδα σε επανάληψη + Δύσκολες + νέα */
 await ev(`localStorage.setItem('${KEY}',JSON.stringify({v:2,pages:{p170:{status:'active',stage:1,lastDone:'2026-10-13',started:'2026-10-12',history:[],_ts:1}},hard:{'s170-2-02':{added:'2026-10-12',streak:1,lastDay:'2026-10-13',_ts:1},'s170-1-13':{added:'2026-10-12',streak:0,lastDay:'2026-10-13',_ts:1}},extra:[${JSON.stringify(pg.page).replace(/"id":"p171"/,'"n":2,"id":"p171"')}]}))`);
 for(const [w,h] of [[1440,900],[1280,800],[390,844]]){
   await size(w,h); await open('2026-10-16');
   await noScroll('αρχική '+w);
   await shot('11-home-full-'+w);
   await key('Enter'); await sleep(150);
   // η μεγαλύτερη φράση του φυλλαδίου, πάνω στην κάρτα
   await ev(`(()=>{const c=document.querySelector('.c-word');c.textContent='καθίστημί τινα εἰς ἀγῶνα';c.className='c-word xl'})()`);
   await noScroll('κάρτα, μεγάλη φράση '+w);
   await key(' '); await sleep(250);
   await noScroll('κάρτα αποκαλυμμένη '+w);
   await shot('12-card-'+w);
   await key('Escape');
 }
 await size(1440,900);

 console.log('\nΙ · ΤΟ ΡΑΦΙ ΣΤΟ «ΑΡΧΑΙΑ · ΑΓΝΩΣΤΟ» (arxaia.html#ag), ΜΟΝΟ ΑΝΑΓΝΩΣΗ');
 /* store: Σελίδα 1 λήγει ΑΥΡΙΟ (με το ΑΛΗΘΙΝΟ σημερινό ρολόι), 2 Δύσκολες */
 const today=new Date(), iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
 const y2=new Date(today); y2.setDate(y2.getDate()-2);
 const seeded=JSON.stringify({v:2,pages:{p170:{status:'active',stage:1,lastDone:iso(y2),started:iso(y2),history:[],_ts:1}},hard:{'s170-2-02':{added:iso(y2),streak:1,lastDay:iso(y2),_ts:1},'s170-1-13':{added:iso(y2),streak:0,lastDay:iso(y2),_ts:1}},extra:[]});
 await ev(`localStorage.setItem('${KEY}',${JSON.stringify(seeded)})`);
 await S('Page.navigate',{url:'http://127.0.0.1:'+HTTP+'/arxaia.html?n='+(++nav)+'#ag'}); await sleep(1800);
 const sh=await txt('#lxSh'), side=await ev(`document.getElementById('lxSide').hidden`), sideT=await txt('#lxSideRows');
 ok('το ράφι δείχνει «Σελίδα 1 · ἄβατος — αἰτία»', /Σελίδα 1 · ἄβατος — αἰτία/.test(sh), sh);
 ok('…με «φυλλάδιο σ. 170 · 50 λέξεις» και «αύριο»', /φυλλάδιο σ\. 170 · 50 λέξεις/.test(sh)&&/αύριο/.test(sh), sh);
 ok('η σημείωση του kit, αυτολεξεί', /Μία σελίδα του φυλλαδίου τη μέρα\. Ξεκινάει όταν την περάσεις και περιμένει όσο χρειαστεί\./.test(await txt('#agWrap')));
 ok('«Για αύριο»: Σελίδα 1 αύριο + 2 Δύσκολες', side===false&&/Σελίδα 1 · επανάληψη/.test(sideT)&&/αύριο/.test(sideT)&&/Δύσκολες/.test(sideT)&&/2 λέξεις/.test(sideT), {side,sideT});
 ok('οι γραμμές οδηγούν στο arxaia-lexilogio.html', await ev(`[...document.querySelectorAll('#lxSh a,#lxSideRows a')].every(a=>a.getAttribute('href')==='arxaia-lexilogio.html')`));
 ok('ΜΟΝΟ ΑΝΑΓΝΩΣΗ: η αποθήκη έμεινε byte προς byte ίδια', await ev(`localStorage.getItem('${KEY}')`)===seeded);
 await noScroll('arxaia.html#ag 1440');
 await shot('13-arxaia-ag-1440');
 await ev(`localStorage.removeItem('${KEY}')`);
 await S('Page.navigate',{url:'http://127.0.0.1:'+HTTP+'/arxaia.html?n='+(++nav)+'#ag'}); await sleep(1500);
 ok('χωρίς πρόοδο: «νέα», και το «Για αύριο» ΔΕΝ εμφανίζεται (δεν υπάρχει ρολόι)', /νέα/.test(await txt('#lxSh'))&&await ev(`document.getElementById('lxSide').hidden`)===true);

 console.log('\nΚ · Η ΠΟΡΤΑ ΠΟΥ ΧΡΗΣΙΜΟΠΟΙΕΙ: School Studies → arxaia-agnosto.html → κάρτα 04');
 await ev(`localStorage.setItem('${KEY}',${JSON.stringify(seeded)})`);
 await S('Page.navigate',{url:'http://127.0.0.1:'+HTTP+'/arxaia-agnosto.html?n='+(++nav)}); await sleep(2200);
 const c4=await ev(`(()=>{const c=[...document.querySelectorAll('#cards .card')].find(x=>/Λεξιλόγιο/.test(x.querySelector('h2').textContent));return c?{href:c.querySelector('a.open').getAttribute('href'),sub:c.querySelector('.sub').textContent,mini:c.querySelector('#miniL').textContent,foot:(c.querySelector('a.lxk')||{}).textContent||'',fhref:(c.querySelector('a.lxk')||{getAttribute:()=>''}).getAttribute('href')}:null})()`);
 ok('η κάρτα 04 «Λεξιλόγιο» ανοίγει το arxaia-lexilogio.html', c4&&c4.href==='arxaia-lexilogio.html', c4);
 ok('…με τη γραμμή του kit', c4&&/Μία σελίδα του φυλλαδίου τη μέρα/.test(c4.sub), c4&&c4.sub);
 ok('…και λέει το σωστό «σήμερα» (η Σελίδα 1 λήγει αύριο → μόνο οι δύο δύσκολες)', c4&&/^Σήμερα, δύο δύσκολες\./.test(c4.mini)&&!/Σελίδα 1 και/.test(c4.mini), c4&&c4.mini);
 ok('οι λέξεις του ΚΕΙΜΕΝΟΥ δεν χάθηκαν: σύνδεσμος στο #/lexilogio', c4&&c4.fhref==='#/lexilogio'&&/Λέξεις του κειμένου/.test(c4.foot), c4);
 await ev(`location.hash='#/lexilogio'`); await sleep(700);
 ok('…και η παλιά οθόνη ζει ακόμα με τις 21 λέξεις του Λυσία', await ev(`document.querySelectorAll('#scr-lexilogio .vrow').length`)===21);
 ok('ΜΟΝΟ ΑΝΑΓΝΩΣΗ και εδώ: η αποθήκη ίδια', await ev(`localStorage.getItem('${KEY}')`)===seeded);
 await ev(`location.hash='#/'`); await sleep(600);
 await shot('14-agnosto-1440');
 await ev(`localStorage.removeItem('${KEY}')`);
 ok('κανένα script που σηκώνει sync δεν έτρεξε (μπλοκαρίστηκαν: '+otherStripped.length+')', await ev('typeof window.ALSSync')==='undefined');
 ok('ο κοινός αριθμός «Δευ 19/10» κ.λπ. — μηδέν exceptions σε ΟΛΗ τη διαδρομή', exc.length===0, exc.slice(0,5));

 console.log('\nlexilogio-page: '+P+' πέρασαν, '+F+' έπεσαν');
 ws.close(); chrome.kill(); server.close();
 process.exit(F?1:0);
})().catch(e=>{console.error('  ✗ FAIL '+(e.stack||e));process.exit(1)});
