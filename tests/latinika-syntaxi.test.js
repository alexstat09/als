// latinika-syntaxi.html — «Σύνταξε μόνος σου». Η σελίδα ΔΕΝ κρατάει δική της
// ύλη: διαβάζει τα πακέτα των Lectio και κρύβει το συντακτικό τους. Άρα ο
// φρουρός ελέγχει ότι ο αναγνώστης βγάζει από ΚΑΘΕ πακέτο ακριβώς τις λέξεις
// του, ότι το «σωστό» είναι το `x` του πακέτου αυτούσιο, και ότι ο γύρος
// κλειδώνει / ξεκλειδώνει σωστά.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = path.join(__dirname, '..');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m); } };
const read = f => fs.readFileSync(path.join(R, f), 'utf8');

const PAGE = read('latinika-syntaxi.html');
const script = PAGE.match(/<script>([\s\S]*?)<\/script>/g).map(s => s.replace(/<\/?script>/g, '')).join('\n');

// --- κόψε τα καθαρά κομμάτια (χωρίς DOM) από την αληθινή σελίδα
const cut = (from, to) => { const a = script.indexOf(from), b = script.indexOf(to, a); if (a < 0 || b < 0) throw new Error('cut ' + from); return script.slice(a, b); };
const logic = cut('var TEXTS = [', 'function load()') + cut('function roundSlots', 'function renderText');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(logic + '\nthis.TEXTS=TEXTS;this.parsePack=parsePack;this.slotsOf=slotsOf;this.askable=askable;this.roundSlots=roundSlots;', ctx);

// §1 — κάθε κείμενο της βιβλιοθήκης υπάρχει εδώ, και αντίστροφα
const hub = read('latinika.html');
const hubIds = [...hub.matchAll(/href="latinika-lectio(\d+)\.html"/g)].map(m => m[1]);
const ids = ctx.TEXTS.map(t => t.id);
ok(ids.length === 7, 'επτά κείμενα (' + ids.length + ')');
[...new Set(hubIds)].forEach(id => ok(ids.includes(id), 'το XVI…XXII της βιβλιοθήκης λείπει: ' + id));
ids.forEach(id => ok(hubIds.includes(id), 'κείμενο που η βιβλιοθήκη δεν έχει: ' + id));
ok(/href="latinika-syntaxi\.html"/.test(hub), 'η βιβλιοθήκη δείχνει στη σελίδα');

// §2 — ο αναγνώστης βγάζει ΑΚΡΙΒΩΣ τις λέξεις κάθε πακέτου, με τη σειρά
ctx.TEXTS.forEach(t => {
  const src = read(t.file);
  let p; try { p = ctx.parsePack(src); } catch (e) { ok(false, t.id + ': parsePack έσκασε ' + e.message); return; }
  const slots = ctx.slotsOf(p);
  ok(slots.length > 40, t.id + ': λέξεις ' + slots.length);
  ok(p.title && !/Lectio/.test(p.title), t.id + ': τίτλος «' + p.title + '»');
  // ανεξάρτητη μέτρηση από το ίδιο το αρχείο
  const m = /\nconst (S|SC) = \[/.exec(src);
  const arr = vm.runInNewContext('(' + src.slice(m.index + 1 + ('const ' + m[1] + ' = ').length, src.indexOf('\n];', m.index) + 2) + ')');
  const words = [];
  arr.forEach(sc => (sc.s || []).forEach(u => m[1] === 'SC' ? (u.c || []).forEach(c => words.push([c.la + (c.lp || ''), c.t || ''])) : (u.la || []).forEach(w => words.push([w.w, w.x]))));
  ok(words.length === slots.length, t.id + ': ' + words.length + ' λέξεις στο πακέτο, ' + slots.length + ' στη σελίδα');
  const sameW = slots.every((s, i) => words[i] && s.w === words[i][0]);
  ok(sameW, t.id + ': οι λέξεις δεν είναι ίδιες με τη σειρά');
  ok(slots.every((s, i) => s.x === words[i][1]), t.id + ': το «σωστό» δεν είναι η ανάλυση του πακέτου αυτούσια');
  slots.forEach(s => { if (s.plain) ok(/^Πρόθεση/.test(s.x || ''), t.id + ': χωρίς κουτί αλλά δεν είναι πρόθεση: ' + s.w); });
  slots.forEach(s => { if (/^Πρόθεση/.test(s.x || '')) ok(s.plain, t.id + ': πρόθεση με κουτί: ' + s.w); });
  ok(ctx.askable(p) === slots.filter(s => !s.plain).length, t.id + ': askable');
  ok(slots.filter(s => !s.plain).every(s => (s.x || '').trim().length > 0), t.id + ': λέξη προς σύνταξη χωρίς σωστή απάντηση');
});

// §3 — ο γύρος: κλειδωμένα δεν ξαναρωτιούνται, «όλο από την αρχή» τα ρωτάει, τέλος = ξανά όλα
const p21 = ctx.parsePack(read('latinika-lectio21.html'));
const n21 = ctx.askable(p21);
ok(ctx.slotsOf(p21).filter(s => s.plain).length === 8, 'XXI: οκτώ προθέσεις χωρίς κουτί (μετρημένο στο render)');
ctx.rec = id => ctx._r; // stub
vm.runInContext('function rec(id){return this._r;}', ctx);
ctx._r = { locked: {}, all: false };
ok(ctx.roundSlots('21', p21).length === n21, 'καινούργιο: ρωτάει όλες (' + n21 + ')');
const first = ctx.slotsOf(p21).findIndex(s => !s.plain);
ctx._r = { locked: { [first]: true }, all: false };
ok(ctx.roundSlots('21', p21).length === n21 - 1 && !ctx.roundSlots('21', p21).includes(first), 'κλειδωμένη λέξη δεν ξαναρωτιέται');
ctx._r = { locked: { [first]: true }, all: true };
ok(ctx.roundSlots('21', p21).length === n21, '«όλο από την αρχή» ρωτάει και τις κλειδωμένες');
const allL = {}; ctx.slotsOf(p21).forEach((s, i) => { if (!s.plain) allL[i] = true; });
ctx._r = { locked: allL, all: false };
ok(ctx.roundSlots('21', p21).length === n21, 'όλα κλειδωμένα → ξαναρωτάει όλο το κείμενο, ποτέ άδεια οθόνη');
ok(ctx.roundSlots('21', p21).every(i => !ctx.slotsOf(p21)[i].plain), 'καμία πρόθεση στον γύρο');

// §4 — συμβόλαιο σελίδας
ok(!/@media\s*\(\s*min-width/i.test(PAGE), 'κανένα @media(min-width) (σταθ. 51)');
ok(/max-width:\s*1180px/.test(PAGE), 'κέλυφος 1180');
ok(!/src=["'](vendor\/supabase|sync\.js|pocoach)/.test(PAGE), 'καμία μηχανή sync — η αποθήκη είναι τοπική');
ok(/catch\s*\(\s*e\s*\)\s*\{[^}]*\S/.test(script.slice(script.indexOf('function save()'), script.indexOf('function showMsg'))), 'save() λέει την αποτυχία, όχι άδειο catch (σταθ. 17)');
ok(/'latinika-syntaxi\.html'/.test(read('sw.js')), 'SW CORE');

console.log('latinika-syntaxi: ' + pass + ' pass, ' + fail + ' fail');
process.exit(fail ? 1 : 0);
