/* ⛔ ΚΑΜΙΑ ΓΡΑΜΜΗ #! ΕΔΩ — το smoke-test.sh σκάει σε shebang. Τρέξε με `node`.
   ══════════════════════════════════════════════════════════════════════════
   Η ΑΦΗΓΗΣΗ — ξαναπαραγωγή με αληθινή φωνή (ElevenLabs)

   Τρέχει ΜΙΑ ΦΟΡΑ στο Mac. Το αποτέλεσμα είναι αρχεία ήχου που μπαίνουν στο
   repo. Η εφαρμογή ΔΕΝ καλεί ποτέ καμία υπηρεσία φωνής — παίζει τα αρχεία.

   ⭐ ΤΟ ΚΕΙΜΕΝΟ ΔΕΝ ΤΟ ΓΡΑΦΕΙ ΑΥΤΟ ΤΟ SCRIPT. Το διαβάζει αυτούσιο από το
   manifest.json, που έχει ήδη επαληθευτεί χαρακτήρα-προς-χαρακτήρα απέναντι
   στο istoria-data.js. Αλλάζει Η ΦΩΝΗ, ποτέ τα ΛΟΓΙΑ.

   ΧΡΗΣΗ
     node tools/gen-narration.js --list            # ποιες φωνές έχει ο λογαριασμός
     node tools/gen-narration.js --voice <id>      # ξαναφτιάξε την αφήγηση
     node tools/gen-narration.js --voice <id> --unit a1a --dry   # δοκιμή 1 σκηνής

   ΤΟ ΚΛΕΙΔΙ διαβάζεται από τη μεταβλητή ELEVEN_API_KEY ή από το .env
   (και τα δύο είναι στο .gitignore). ⛔ Δεν τυπώνεται ΠΟΤΕ και δεν γράφεται
   σε κανένα αρχείο που μπαίνει στο git.
   ══════════════════════════════════════════════════════════════════════ */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

/* ── Το κλειδί ─────────────────────────────────────────────────────────
   ⛔ Δεν τυπώνεται ΠΟΤΕ και δεν γράφεται σε αρχείο που μπαίνει στο git.   */
function keyFor(name){
  if (process.env[name]) return process.env[name].trim();
  const f = path.join(ROOT, '.env');
  if (fs.existsSync(f)){
    const m = fs.readFileSync(f, 'utf8').match(new RegExp('^\\s*' + name + '\\s*=\\s*(.+)\\s*$', 'm'));
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  console.error('\n⛔ Δεν βρέθηκε το ' + name + '.\n' +
    '   Βάλ\' το ΜΙΑ φορά, σε αρχείο που είναι ήδη στο .gitignore:\n\n' +
    '     echo \'' + name + '=το_κλειδι_σου\' >> "' + path.join(ROOT, '.env') + '"\n');
  process.exit(1);
}

/* ══════════════════════════════════════════════════════════════════════════
   ΟΙ ΠΑΡΟΧΟΙ — ίδια εγγύηση, δύο δρόμοι. Δεν δενόμαστε πουθενά.
   · google  — Chirp 3: HD. 1.000.000 χαρακτήρες/μήνα δωρεάν.
   · eleven  — το καλύτερο ακουστικά, αλλά 10.000/μήνα δωρεάν.
   ⚠️ Και οι δύο επιστρέφουν MP3, που μετατρέπεται σε m4a ώστε ο προβολέας
      να μην αλλάξει ούτε γραμμή.
   ══════════════════════════════════════════════════════════════════════ */
const PROVIDERS = {
  eleven: {
    env: 'ELEVEN_API_KEY',
    async list(){
      const r = await fetch('https://api.elevenlabs.io/v2/voices?page_size=100', { headers: { 'xi-api-key': keyFor('ELEVEN_API_KEY') } });
      if (!r.ok) throw new Error('HTTP ' + r.status + ' — ' + (await r.text()).slice(0, 300));
      return (await r.json()).voices.map(v => ({
        id: v.voice_id, name: v.name,
        info: [(v.labels || {}).gender, (v.labels || {}).age, (v.labels || {}).accent].filter(Boolean).join(' · ')
      }));
    },
    async synth(text, voice, model){
      const r = await fetch('https://api.elevenlabs.io/v1/text-to-speech/' + voice + '?output_format=mp3_44100_128', {
        method: 'POST',
        headers: { 'xi-api-key': keyFor('ELEVEN_API_KEY'), 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text, model_id: model || 'eleven_multilingual_v2',
          voice_settings: { stability: 0.45, similarity_boost: 0.75, style: 0.15, use_speaker_boost: true } })
      });
      if (!r.ok) throw new Error('HTTP ' + r.status + ' — ' + (await r.text()).slice(0, 300));
      return Buffer.from(await r.arrayBuffer());
    }
  },

  google: {
    env: 'GOOGLE_TTS_KEY',
    async list(){
      const k = keyFor('GOOGLE_TTS_KEY');
      const r = await fetch('https://texttospeech.googleapis.com/v1/voices?languageCode=el-GR&key=' + k);
      if (!r.ok) throw new Error('HTTP ' + r.status + ' — ' + (await r.text()).slice(0, 300));
      return ((await r.json()).voices || []).map(v => ({
        id: v.name, name: v.name.replace('el-GR-', ''),
        info: [v.ssmlGender, /Chirp3-HD/.test(v.name) ? '⭐ Chirp 3 HD' : /Chirp/.test(v.name) ? 'Chirp HD' :
               /Wavenet/.test(v.name) ? 'WaveNet' : /Neural2/.test(v.name) ? 'Neural2' : 'Standard'].join(' · ')
      })).sort((a, b) => (/Chirp3/.test(b.id) ? 1 : 0) - (/Chirp3/.test(a.id) ? 1 : 0));
    },
    async synth(text, voice){
      const k = keyFor('GOOGLE_TTS_KEY');
      const r = await fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key=' + k, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: text },
          voice: { languageCode: 'el-GR', name: voice },
          /* ⚠️ Στα el-GR ΔΕΝ υποστηρίζεται έλεγχος παύσεων ούτε προσαρμοσμένη
             προφορά — γι' αυτό στέλνουμε σκέτο κείμενο, όχι SSML. */
          audioConfig: { audioEncoding: 'MP3', speakingRate: 0.96, sampleRateHertz: 44100 }
        })
      });
      if (!r.ok) throw new Error('HTTP ' + r.status + ' — ' + (await r.text()).slice(0, 300));
      const j = await r.json();
      if (!j.audioContent) throw new Error('η απάντηση δεν είχε ήχο');
      return Buffer.from(j.audioContent, 'base64');
    }
  }
};

const args = process.argv.slice(2);
const arg  = (n, d) => { const i = args.indexOf('--' + n); return i < 0 ? d : args[i + 1]; };
const has  = n => args.indexOf('--' + n) >= 0;

const UNIT  = arg('unit', 'a1a');
const MODEL = arg('model');
const DIR   = path.join(ROOT, 'vid', UNIT);
const PROV  = PROVIDERS[arg('provider', 'google')];
if (!PROV){ console.error('⛔ Άγνωστος πάροχος. Δώσε --provider google ή eleven.'); process.exit(1); }

/* ── --list · ποιες φωνές υπάρχουν ────────────────────────────────────── */
async function list(){
  const vs = await PROV.list();
  console.log('\nΕΛΛΗΝΙΚΕΣ ΦΩΝΕΣ (' + vs.length + ')\n');
  vs.forEach(v => console.log('  ' + String(v.id).padEnd(30) + ' ' + String(v.name).padEnd(18) + ' ' + v.info));
  console.log('\n→ node tools/gen-narration.js --voice <id> --dry\n');
}

/* ── Η παραγωγή ───────────────────────────────────────────────────────── */
async function gen(){
  const voice = arg('voice');
  if (!voice){ console.error('⛔ Λείπει --voice <id>. Τρέξε πρώτα --list.'); process.exit(1); }

  const mf = path.join(DIR, 'manifest.json');
  if (!fs.existsSync(mf)){ console.error('⛔ Δεν υπάρχει ' + mf); process.exit(1); }
  const scenes = JSON.parse(fs.readFileSync(mf, 'utf8'));

  /* ⭐ Η ΠΑΛΙΑ ΑΦΗΓΗΣΗ ΔΕΝ ΣΒΗΝΕΤΑΙ ΜΕΧΡΙ ΝΑ ΠΕΤΥΧΟΥΝ ΟΛΕΣ ΟΙ ΣΚΗΝΕΣ.
     Μια αποτυχία στη μέση δεν επιτρέπεται να τον αφήσει χωρίς ήχο. */
  const tmp = path.join(DIR, '_new');
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });

  const todo = has('dry') ? scenes.slice(0, 1) : scenes;
  const out = [];

  for (const s of todo){
    process.stdout.write(s.id + '  ');
    const audio = await PROV.synth(s.text, voice, MODEL);   /* ⭐ ΑΥΤΟΥΣΙΟ κείμενο */
    const mp3 = path.join(tmp, s.id + '.mp3');
    fs.writeFileSync(mp3, audio);

    /* Ίδιο κοντέινερ με πριν, ώστε ο προβολέας να μην αλλάξει καθόλου. */
    const m4a = path.join(tmp, s.id + '.m4a');
    execFileSync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '64000', mp3, m4a]);
    fs.unlinkSync(mp3);

    const info = execFileSync('afinfo', [m4a]).toString();
    const dur = parseFloat((info.match(/estimated duration:\s*([\d.]+)/) || [])[1] || 0);
    if (!dur) throw new Error(s.id + ': βγήκε αρχείο χωρίς διάρκεια');

    out.push({ id: s.id, text: s.text, dur: Math.round(dur * 100) / 100, bytes: fs.statSync(m4a).size });
    console.log(dur.toFixed(2) + 's  ' + (fs.statSync(m4a).size / 1024).toFixed(0) + 'KB');
  }

  if (has('dry')){
    console.log('\nΔΟΚΙΜΗ. Άκου: ' + path.join(tmp, out[0].id + '.m4a'));
    console.log('Αν σου αρέσει, ξανατρέξε ΧΩΡΙΣ --dry.\n');
    return;
  }

  /* Έλεγχος πριν αντικαταστήσουμε ο,τιδήποτε. */
  if (out.length !== scenes.length) throw new Error('λείπουν σκηνές — δεν αντικαθιστώ τίποτα');
  for (let i = 0; i < out.length; i++){
    if (out[i].text !== scenes[i].text) throw new Error(out[i].id + ': το κείμενο ΑΛΛΑΞΕ — σταματώ');
  }

  out.forEach(s => fs.renameSync(path.join(tmp, s.id + '.m4a'), path.join(DIR, s.id + '.m4a')));
  fs.writeFileSync(mf, JSON.stringify(out, null, 2));
  fs.rmSync(tmp, { recursive: true, force: true });

  const total = out.reduce((a, s) => a + s.dur, 0);
  const kb = out.reduce((a, s) => a + s.bytes, 0) / 1024;
  console.log('\n✅ ' + out.length + ' σκηνές · ' +
    Math.floor(total / 60) + ':' + String(Math.round(total % 60)).padStart(2, '0') +
    ' · ' + kb.toFixed(0) + 'KB · φωνή ' + voice);
  console.log('   Το ΚΕΙΜΕΝΟ είναι ταυτόσημο με πριν — άλλαξε μόνο η φωνή.\n');
}

(has('list') ? list() : gen()).catch(e => { console.error('\n⛔ ' + e.message + '\n'); process.exit(1); });
