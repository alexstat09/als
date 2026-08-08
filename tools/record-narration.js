/* ⛔ ΚΑΜΙΑ ΓΡΑΜΜΗ #! ΕΔΩ — το smoke-test.sh σκάει σε shebang. Τρέξε με `node`.
   ══════════════════════════════════════════════════════════════════════════
   ΤΟ ΣΤΟΥΝΤΙΟ — ηχογράφησε την αφήγηση με τη ΔΙΚΗ ΣΟΥ φωνή

     node tools/record-narration.js            # μετά άνοιξε localhost:8090
     node tools/record-narration.js --unit b1 --port 8090

   Δείχνει ΜΙΑ πρόταση τη φορά, ηχογραφείς, ακούς, κρατάς ή ξανακάνεις.
   Το αρχείο πάει ΚΑΤΕΥΘΕΙΑΝ στη θέση του και το βίντεο προσαρμόζεται μόνο
   του, γιατί η διάρκεια της σκηνής ΕΙΝΑΙ η διάρκεια του ήχου.

   ⭐ ΤΟ ΚΕΙΜΕΝΟ ΔΕΝ ΑΓΓΙΖΕΤΑΙ ΠΟΤΕ. Διαβάζεται αυτούσιο από το manifest.json
   και ξαναγράφεται ίδιο. Αλλάζει μόνο ο ΗΧΟΣ και η ΔΙΑΡΚΕΙΑ.
   ⭐ Η ΠΑΛΙΑ ΑΦΗΓΗΣΗ ΚΡΑΤΙΕΤΑΙ σε `_prev/` πριν γραφτεί οτιδήποτε, ώστε μια
   κακή ηχογράφηση να μη σε αφήνει χωρίς τίποτα.
   ══════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf('--' + n); return i < 0 ? d : args[i + 1]; };

const UNIT = arg('unit', 'a1a');
const PORT = +arg('port', 8090);
const DIR  = path.join(ROOT, 'vid', UNIT);
const MF   = path.join(DIR, 'manifest.json');
const PREV = path.join(DIR, '_prev');

if (!fs.existsSync(MF)){ console.error('⛔ Δεν υπάρχει ' + MF); process.exit(1); }
let scenes = JSON.parse(fs.readFileSync(MF, 'utf8'));

/* Αντίγραφο ασφαλείας, μία φορά. */
if (!fs.existsSync(PREV)){
  fs.mkdirSync(PREV, { recursive: true });
  scenes.forEach(s => {
    const f = path.join(DIR, s.id + '.m4a');
    if (fs.existsSync(f)) fs.copyFileSync(f, path.join(PREV, s.id + '.m4a'));
  });
  fs.copyFileSync(MF, path.join(PREV, 'manifest.json'));
  console.log('📦 Η προηγούμενη αφήγηση φυλάχτηκε στο ' + path.relative(ROOT, PREV));
}

const PAGE = `<!DOCTYPE html><html lang="el"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ΤΟ ΣΤΟΥΝΤΙΟ — ${UNIT}</title><style>
:root{--gold:#DFA845;--bone:#F5EDDD;--ok:#8FBF6A;--bad:#E08C7A}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#15110C;color:var(--bone);font:16px/1.6 'Avenir Next',system-ui,sans-serif;
 min-height:100vh;display:grid;place-items:center;padding:24px}
.w{width:100%;max-width:760px}
.top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px}
.k{font-size:11px;letter-spacing:.3em;color:var(--gold)}
.pos{font-size:12px;letter-spacing:.1em;color:rgba(245,237,221,.5);font-variant-numeric:tabular-nums}
.bar{height:6px;border-radius:4px;background:rgba(255,255,255,.1);overflow:hidden;margin-bottom:24px}
/* scaleX αντί για width: η κίνηση μένει στο compositor, χωρίς επανυπολογισμό
   διάταξης σε κάθε ηχογράφηση. */
.bar i{display:block;height:100%;background:var(--gold);width:100%;
 transform:scaleX(0);transform-origin:0 50%;transition:transform .3s ease}
.card{background:#211A12;border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:30px 30px 26px}
.line{font-size:clamp(19px,2.6vw,27px);line-height:1.55;font-weight:500;margin-bottom:8px}
.hint{font-size:12.5px;color:rgba(245,237,221,.42);margin-bottom:22px}
.row{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
button{font:inherit;font-size:15px;font-weight:600;border:0;border-radius:11px;padding:13px 20px;cursor:pointer;
 background:rgba(255,255,255,.1);color:var(--bone);transition:filter .15s,transform .1s}
button:hover:not(:disabled){filter:brightness(1.25)}button:active:not(:disabled){transform:scale(.97)}
button:disabled{opacity:.35;cursor:default}
button.rec{background:var(--bad);color:#2B1410;min-width:190px}
button.rec.on{background:#C4433A;color:#fff}
button.keep{background:var(--gold);color:#241B10}
audio{width:100%;margin:18px 0 4px}
.done{margin-top:22px;font-size:13.5px;color:rgba(245,237,221,.55);line-height:1.8}
.done b{color:var(--ok)}
.warn{margin-top:14px;font-size:13px;color:var(--bad)}
.list{margin-top:22px;display:flex;flex-wrap:wrap;gap:6px}
.list span{font:600 11px/1 ui-monospace,monospace;padding:6px 8px;border-radius:6px;background:rgba(255,255,255,.08);color:rgba(245,237,221,.5)}
.list span.ok{background:rgba(143,191,106,.22);color:var(--ok)}
.list span.cur{outline:2px solid var(--gold)}
</style></head><body><div class="w">
 <div class="top"><div class="k">ΤΟ ΣΤΟΥΝΤΙΟ · ${UNIT}</div><div class="pos" id="pos"></div></div>
 <div class="bar"><i id="prog"></i></div>
 <div class="card">
   <div class="line" id="line">…</div>
   <div class="hint" id="hint"></div>
   <div class="row">
     <button class="rec" id="rec">● Ηχογράφηση</button>
     <button id="again" disabled>Ξανά</button>
     <button class="keep" id="keep" disabled>Κράτα το →</button>
     <button id="skip">Προσπέρασε</button>
   </div>
   <audio id="pb" controls style="display:none"></audio>
   <div class="warn" id="warn"></div>
 </div>
 <div class="list" id="list"></div>
 <div class="done" id="done"></div>
</div>
<script>
let S=[],i=0,rec=null,chunks=[],blob=null,stream=null;
const $=id=>document.getElementById(id);
const done=new Set();

function paint(){
  const s=S[i];
  $('line').textContent=s.text;
  $('pos').textContent=(i+1)+' / '+S.length;
  $('prog').style.transform='scaleX('+(done.size/S.length)+')';
  $('hint').textContent='Διάβασέ το φυσικά. Η προηγούμενη διάρκεια ήταν '+s.dur.toFixed(1)+'δ — δεν χρειάζεται να την πετύχεις.';
  $('pb').style.display='none'; $('keep').disabled=true; $('again').disabled=true; blob=null; $('warn').textContent='';
  $('list').innerHTML=S.map((x,n)=>'<span class="'+(done.has(x.id)?'ok ':'')+(n===i?'cur':'')+'">'+x.id+'</span>').join('');
  $('done').innerHTML=done.size===S.length
    ? '<b>Όλες οι '+S.length+' ηχογραφήθηκαν.</b> Κλείσε το παράθυρο και πες μου «τελείωσα».'
    : done.size+' από '+S.length+' έτοιμες.';
}
async function mic(){
  if(stream) return stream;
  stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
  return stream;
}
$('rec').onclick=async()=>{
  if(rec&&rec.state==='recording'){ rec.stop(); return; }
  try{ await mic(); }catch(e){ $('warn').textContent='Δεν δόθηκε άδεια στο μικρόφωνο.'; return; }
  chunks=[]; rec=new MediaRecorder(stream,{mimeType:'audio/webm'});
  rec.ondataavailable=e=>chunks.push(e.data);
  rec.onstop=()=>{
    blob=new Blob(chunks,{type:'audio/webm'});
    $('pb').src=URL.createObjectURL(blob); $('pb').style.display='block';
    $('keep').disabled=false; $('again').disabled=false;
    $('rec').textContent='● Ηχογράφηση'; $('rec').classList.remove('on');
  };
  rec.start(); $('rec').textContent='■ Σταμάτα'; $('rec').classList.add('on');
};
$('again').onclick=()=>{ blob=null; $('pb').style.display='none'; $('keep').disabled=true; $('again').disabled=true; };
$('skip').onclick=()=>{ if(i<S.length-1){i++;paint();} };
$('keep').onclick=async()=>{
  if(!blob) return;
  $('keep').disabled=true; $('warn').textContent='Αποθηκεύεται…';
  const r=await fetch('/api/take?id='+encodeURIComponent(S[i].id),{method:'POST',body:blob});
  const j=await r.json();
  if(!r.ok){ $('warn').textContent='⛔ '+(j.error||'απέτυχε'); $('keep').disabled=false; return; }
  done.add(S[i].id); S[i].dur=j.dur;
  if(i<S.length-1){ i++; } paint();
};
document.addEventListener('keydown',e=>{
  if(e.code==='Space'){e.preventDefault();$('rec').click();}
  if(e.code==='Enter'&&!$('keep').disabled)$('keep').click();
});
fetch('/api/scenes').then(r=>r.json()).then(j=>{S=j;paint();});
</script></body></html>`;

function send(res, code, body, type){
  res.writeHead(code, { 'Content-Type': type || 'application/json; charset=utf-8' });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');

  if (u.pathname === '/') return send(res, 200, PAGE, 'text/html; charset=utf-8');
  if (u.pathname === '/api/scenes') return send(res, 200, scenes);

  if (u.pathname === '/api/take' && req.method === 'POST'){
    const id = u.searchParams.get('id');
    /* ⚠️ Το id ΠΡΕΠΕΙ να υπάρχει στο manifest. Χωρίς αυτόν τον έλεγχο, ένα
       χειροποίητο αίτημα θα μπορούσε να γράψει οπουδήποτε στον δίσκο. */
    if (!scenes.some(s => s.id === id)) return send(res, 400, { error: 'άγνωστη σκηνή' });

    const buf = [];
    req.on('data', c => buf.push(c));
    req.on('end', () => {
      try {
        const webm = path.join(DIR, '_take.webm');
        fs.writeFileSync(webm, Buffer.concat(buf));
        const m4a = path.join(DIR, id + '.m4a');
        /* mono 44.1k AAC 64k — ίδιο κοντέινερ με πριν, ώστε ο προβολέας να
           μην αλλάξει ούτε γραμμή. Ελαφρύ φιλτράρισμα για καθαρή φωνή. */
        execFileSync('ffmpeg', ['-y', '-i', webm, '-ac', '1', '-ar', '44100',
          '-af', 'highpass=f=80,dynaudnorm=p=0.9:s=5', '-c:a', 'aac', '-b:a', '64k', m4a],
          { stdio: 'ignore' });
        fs.unlinkSync(webm);

        const info = execFileSync('afinfo', [m4a]).toString();
        const dur = Math.round(parseFloat((info.match(/estimated duration:\s*([\d.]+)/) || [])[1] || 0) * 100) / 100;
        if (!dur) throw new Error('βγήκε αρχείο χωρίς διάρκεια');

        const s = scenes.find(x => x.id === id);
        s.dur = dur; s.bytes = fs.statSync(m4a).size;   /* ⭐ το text ΔΕΝ αγγίζεται */
        fs.writeFileSync(MF, JSON.stringify(scenes, null, 2));
        console.log('  ✅ ' + id + '  ' + dur.toFixed(2) + 's');
        send(res, 200, { dur: dur });
      } catch (e){
        console.error('  ⛔ ' + id + ': ' + e.message);
        send(res, 500, { error: e.message });
      }
    });
    return;
  }
  send(res, 404, { error: 'not found' });
}).listen(PORT, () => {
  console.log('\n🎙  ΤΟ ΣΤΟΥΝΤΙΟ — ' + UNIT + ', ' + scenes.length + ' προτάσεις');
  console.log('   Άνοιξε:  http://localhost:' + PORT + '\n');
  console.log('   Space = ηχογράφηση/στοπ   ·   Enter = κράτα το\n');
});
