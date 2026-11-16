/* tests/arxaia-eisagogi-v2.test.js — ΤΟ ΓΕΝΙΚΟ TEST ΤΗΣ ΕΙΣΑΓΩΓΗΣ v2 (page2.tpl, 16/11/26)
   Τρέχει για ΚΑΘΕ κεφάλαιο που έχει `acts` στο json (νέο κεφάλαιο = μηδέν γραμμές test).
   node tests/arxaia-eisagogi-v2.test.js
   Τι φυλάει:
   · η σελίδα στον δίσκο = το build (κανένα HTML με το χέρι)
   · κάθε στάση ζωγραφίζεται με τον τίτλο της · τα νούμερα κάθε σκηνής υπάρχουν και στο κείμενο
   · κανένα «πηγή:», κανένα «Το διάβασα»/«ξανά» (δική του εντολή, 16/11) στο Διάβασμα
   · η αποθήκη γράφει ΜΟΝΟ τα δύο κλειδιά της, επιβιώνει reload, δεν πετάει άγνωστα πεδία,
     και αποθήκη που δεν διαβάζεται ΔΕΝ γράφεται από πάνω (και λέει άλλη πρόταση)
   · κάθε πολυτονικό ζωγραφίζεται σε GFS Didot (ο φρουρός 7b του homework-look, σε runtime)
   · κανένα min-width · καμία οριζόντια κύλιση σε 1440/1180/390 · μηδέν σφάλματα JS
   · κάθε ερώτηση του σημερινού Ελέγχου (η παλιά σελίδα) υπάρχει και στον νέο
   ⛔ Η σελίδα δεν έχει κανένα sync script· το test το ΑΠΑΙΤΕΙ (σταθ. 8). */
'use strict';
const fs = require('fs');
const path = require('path');
const REPO = path.join(__dirname, '..');
const DIR = path.join(REPO, 'tools/eisagogi/arxaia');
const { build } = require(path.join(DIR, 'build.js'));
const { chromium } = require(path.join(REPO, 'video-kit/node_modules/playwright'));

let pass = 0, fail = 0;
const ok = (msg, cond) => { if (cond) pass++; else { fail++; console.log('  ✗ ' + msg); } };
const plain = s => String(s || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1');
const dataOf = html => { const m = html.match(/var D = (\{[\s\S]*?\});\n/); return m ? JSON.parse(m[1]) : null; };

const NAMES = fs.readdirSync(DIR).filter(f => f.endsWith('.json')).map(f => f.slice(0, -5))
  .filter(n => { try { return !!JSON.parse(fs.readFileSync(path.join(DIR, n + '.json'), 'utf8')).acts; } catch (e) { return false; } });

(async () => {
  ok('υπάρχει τουλάχιστον ένα κεφάλαιο v2', NAMES.length > 0);
  const browser = await chromium.launch();
  for (const name of NAMES) {
    console.log('── ' + name);
    const d = JSON.parse(fs.readFileSync(path.join(DIR, name + '.json'), 'utf8'));
    const r = build(name, { v2: true });
    const file = path.join(REPO, r.file);
    const disk = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    ok(r.file + ': η σελίδα στον δίσκο είναι ακριβώς το build', disk === r.html);
    /* στατικοί φρουροί */
    const css = (disk.match(/<style>([\s\S]*?)<\/style>/) || [, ''])[1];
    /* ο κανόνας αφορά τα breakpoints (σταθ. 51)· η ΙΔΙΟΤΗΤΑ min-width:0 σε flex παιδί είναι σωστή */
  ok('κανένα @media (min-width) στο CSS', !/@media[^{]*min-width/.test(css));
  ok('…και ο φρουρός πιάνει όντως ένα @media', /@media[^{]*max-width/.test(css));
    ok('καμία Instrument Serif / Georgia (σταθ. 43)', !/Instrument Serif|Georgia/i.test(disk));
    ok('κανένα εξωτερικό script, κανένα sync (σταθ. 8)', !/<script[^>]+src=/i.test(disk));
    /* κάθε ερώτηση του σημερινού Ελέγχου υπάρχει και στον νέο — από τα δεδομένα των ΔΥΟ σελίδων */
    /* η παλιά μορφή: ζωντανή δίπλα (προεπισκόπηση -v2) ή στο archive/ όταν η νέα πήρε τη θέση της (tpl:2) */
    const oldF = d.tpl === 2 ? path.join(REPO, 'archive', path.basename(d.file)) : path.join(REPO, d.file);
    ok('η παλιά μορφή σώζεται (' + path.relative(REPO, oldF) + ')', fs.existsSync(oldF));
    if (d.tpl === 2) {
      ok('η νέα μορφή κάθεται στο ΙΔΙΟ URL', r.file === d.file);
      ok('καμία ορφανή προεπισκόπηση -v2', !fs.existsSync(path.join(REPO, d.file.replace(/\.html$/, '-v2.html'))));
      ok('…και η παλιά στο archive είναι όντως το παλιό καλούπι', /Η ΜΗΧΑΝΗ ΤΟΥ ΚΑΛΟΥΠΙΟΥ ═/.test(fs.readFileSync(oldF, 'utf8')) && !/page2\.tpl/.test(fs.readFileSync(oldF, 'utf8')));
      const SW = fs.readFileSync(path.join(REPO, 'sw.js'), 'utf8'), ARX = fs.readFileSync(path.join(REPO, 'arxaia.html'), 'utf8');
      const NO_VT = eval(/const NO_VT = (\/.*\/);/.exec(fs.readFileSync(path.join(REPO, 'topbar.js'), 'utf8'))[1]); // eslint-disable-line no-eval
      ok('στο SW CORE', SW.indexOf("'" + d.file + "'") > 0);
      ok('στο NO_VT (δεν φοράει aurora/kentro-exit)', NO_VT.test(d.file));
      ok('η κάρτα του Γνωστού (arxaia.html) δείχνει εδώ', ARX.indexOf('href="' + d.file + '"') > 0);
      ok('ακριβώς ένα const KEY, το δικό του (σταθ. του Γνωστού)', (disk.match(/const KEY="([^"]+)"/g) || []).join('|') === 'const KEY="' + d.key + '"');
    }
    const oldD = fs.existsSync(oldF) ? dataOf(fs.readFileSync(oldF, 'utf8')) : null, newD = dataOf(disk);
    ok('τα δεδομένα των δύο σελίδων διαβάζονται', !!oldD && !!newD);
    if (oldD && newD) ['recall', 'tf', 'mc'].forEach(k => {
      const sig = x => JSON.stringify([x.id, x.q || x.t, x.r || x.ok, x.o || null]);
      const a = oldD.check[k].map(sig), b = new Set(newD.check[k].map(sig));
      ok(k + ': και οι ' + a.length + ' ερωτήσεις της παλιάς σελίδας υπάρχουν αυτούσιες', a.every(x => b.has(x)));
    });

    const K1 = d.key, K2 = d.key.replace(/-v1$/, '') + '-v2';
    const url = 'file://' + file;
    for (const [w, h] of [[1440, 900], [1180, 800], [390, 844]]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const p = await ctx.newPage();
      const errs = [];
      p.on('pageerror', e => errs.push(e.message));
      p.on('console', m => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.text())) errs.push(m.text()); });
      await p.addInitScript(([k]) => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', 1); localStorage.setItem(k, JSON.stringify({ v: 1, at: 3, read: { 2: 123 }, rc: {}, tf: {}, mc: {}, mine: 'κρατήσου' })); } }, [K1]);
      await p.goto(url);
      await p.waitForTimeout(600);
      const m = await p.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
      ok(w + ': καμία οριζόντια κύλιση (' + m.sw + ' ≤ ' + m.iw + ')', m.sw <= m.iw);
      if (w === 1440 || w === 390) {
        const R = await p.evaluate(() => {
          const read = document.getElementById('v-read');
          const POLY = /[ἀ-῿̓̔͂]/, bad = [];
          const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
          let n; while ((n = tw.nextNode())) {
            if (!POLY.test(n.nodeValue)) continue;
            const el = n.parentElement; if (!el || !el.getClientRects().length || el.closest('script,style,[hidden]')) continue;
            const ff = getComputedStyle(el).fontFamily;
            if (!/^"?GFS Didot/.test(ff)) bad.push(n.nodeValue.trim().slice(0, 30) + ' → ' + ff.split(',')[0]);
          }
          return { text: read.innerText, bad,
            secs: [...document.querySelectorAll('#stops .sec')].map(s => [s.id, s.querySelector('h2').textContent, [...s.querySelectorAll('.txt u')].map(u => u.textContent)]),
            scenes: [...document.querySelectorAll('#stops .sec')].map(s => [s.id, s.querySelectorAll('[data-scene] .num').length]) };
        });
        ok(w + ': κάθε πολυτονικό σε GFS Didot (σταθ. 43)' + (R.bad.length ? ' — ' + R.bad.slice(0, 3).join(' · ') : ''), R.bad.length === 0);
        ok(w + ': κανένα «πηγή:» στο Διάβασμα', !/πηγή\s*:/i.test(R.text));
        ok(w + ': κανένα «Το διάβασα» / υπενθύμιση στο Διάβασμα', !/Το διάβασα|Το ξαναδιάβασα|ξανά σε \d|εδώ\s*$/m.test(R.text));
        d.stations.forEach(s => {
          const sec = R.secs.find(x => x[0] === 's' + s.n);
          ok(w + ': η στάση ' + s.n + ' ζωγραφίζεται με τον τίτλο της', !!sec && sec[1] === plain(s.title));
          if (s.fig && s.fig.type === 'scene') s.fig.steps.forEach(st =>
            ok(w + ': στάση ' + s.n + ', το νούμερο ' + st.n + ' της σκηνής υπάρχει και στο κείμενο', !!sec && sec[2].includes(String(st.n))));
        });
      }
      if (w === 1440) {
        /* η αποθήκη: μόνο τα δύο κλειδιά, επιβιώνει reload, άγνωστο πεδίο μένει */
        await p.click('#t-ch'); await p.waitForTimeout(150);
        ok('ο Έλεγχος ανοίγει στην Ανάκληση', await p.$eval('#pane', e => !!e.querySelector('.ck-card')));
        await p.click('[data-mode="tf"]');
        ok('Σωστό/Λάθος: όλες οι προτάσεις στην οθόνη', await p.$$eval('#pane .ck-qi', e => e.length) === d.check.tf.length);
        const falseTf = d.check.tf.find(t => t.ok === false);
        await p.click('[data-tf="' + falseTf.id + '"][data-v="true"]');
        const ex = await p.$eval('[data-q="' + falseTf.id + '"]', e => { const a = e.querySelector('.ck-ex a'); return { why: e.querySelector('.ck-ex') ? e.querySelector('.ck-ex').textContent : '', href: a && a.getAttribute('href') }; });
        ok('λάθος απάντηση στο Σ/Λ: δείχνει το γιατί', ex.why.length > 20);
        ok('…και σύνδεσμο σε στάση/παράγραφο που ΥΠΑΡΧΕΙ', !!ex.href && await p.evaluate(h => !!document.getElementById(h.slice(1)), ex.href));
        await p.click('[data-mode="mc"]');
        ok('Πολλαπλή: όλες οι ερωτήσεις στην οθόνη', await p.$$eval('#pane .ck-qi', e => e.length) === d.check.mc.length);
        const nMatch = d.stations.filter(s => s.match).length + d.stations.filter(s => s.fig && s.fig.type === 'tiers').length;
        if (nMatch) {
          await p.click('[data-mode="mt"]');
          ok('Αντιστοίχιση: ένα κουμπί ανά πίνακα (' + nMatch + ')', await p.$$eval('[data-mtset]', e => e.length) === nMatch);
          await p.click('[data-mtl="0"]');
          const rights = await p.$$eval('[data-mtr]', e => e.map(x => x.dataset.mtr));
          const set = await p.$eval('[data-mtset][aria-pressed="true"]', e => e.dataset.mtset);
          /* διάλεξε σκόπιμα ΛΑΘΟΣ ζευγάρι: όποιο δεξί δεν είναι το σωστό του πρώτου */
          const first = (d.stations.find(s => ('m' + s.n) === set) || {}).match;
          const firstT = d.stations.find(s => ('t' + s.n) === set);
          const rightD = first ? first.rows[0].d : (firstT.fig.rows[0].r.t + (firstT.fig.rows[0].r.s ? ' ' + firstT.fig.rows[0].r.s : ''));
          const pick = rights.find(x => x !== rightD);
          await p.click('[data-mtr="' + pick.replace(/"/g, '\\"') + '"]');
          ok('λάθος ζευγάρι: δείχνει το σωστό', await p.$eval('#pane .mt .pr.no', (e, t) => e.textContent.includes(t), plainJS(rightD)).catch(() => false));
          await p.click('[data-mode="gaps"]');
          ok('…και πάει στα «κενά μου»', /Αντιστοίχιση · λάθος ζευγάρι/.test(await p.$eval('#pane', e => e.innerText)));
        }
        const ls = await p.evaluate(() => Object.keys(localStorage));
        ok('η αποθήκη γράφει ΜΟΝΟ το δικό της κλειδί (' + ls.join(', ') + ')', ls.every(k => k === K1));
        ok('…και η Αντιστοίχιση γράφτηκε εκεί (mt)', await p.evaluate(k => Object.keys(JSON.parse(localStorage.getItem(k)).mt || {}).length > 0, K1));
        await p.reload(); await p.waitForTimeout(300);
        const s1 = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), K1);
        ok('η απάντηση Σ/Λ επιβιώνει το reload', s1.tf[falseTf.id] === true);
        ok('το άγνωστο πεδίο δεν χάθηκε (σταθ. 35)', s1.mine === 'κρατήσου' && s1.read[2] === 123 && s1.at === 3);
        await p.goto(url + '#elegxos'); await p.waitForTimeout(200);
        await p.click('[data-mode="tf"]');
        ok('μετά το reload η απάντηση φαίνεται στον Έλεγχο', await p.$eval('[data-q="' + falseTf.id + '"] .ck-opt.no', e => !!e).catch(() => false));
        /* σύνδεσμος από τον Έλεγχο → παράγραφος στο Διάβασμα */
        await p.click('[data-q="' + falseTf.id + '"] .ck-ex a'); await p.waitForTimeout(400);
        ok('ο σύνδεσμος γυρίζει στο Διάβασμα', await p.$eval('#v-read', e => !e.hidden));
        /* σχεδιάγραμμα */
        await p.click('#t-sx'); await p.waitForTimeout(150);
        const nl2 = (d.outline || []).reduce((a, x) => a + (x.items || []).length, 0);
        ok('Σχεδιάγραμμα: ' + nl2 + ' σημεία δεύτερου επιπέδου, όλα σύνδεσμοι', await p.$$eval('#ol .l2 > li > a[href^="#s"]', e => e.length) === nl2);
        await p.click('[data-bare]');
        ok('«Κρύψε τα υποσημεία» κρύβει το τρίτο επίπεδο', await p.$$eval('#ol .l3', e => e.every(x => getComputedStyle(x).display === 'none')));
        ok(w + ': μηδέν σφάλματα JS' + (errs.length ? ' — ' + errs[0] : ''), errs.length === 0);
        await ctx.close();
        /* αποθήκη που δεν διαβάζεται: ΔΕΝ γράφεται από πάνω, και λέει άλλη πρόταση από το «τίποτα» */
        const c2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const p2 = await c2.newPage();
        await p2.addInitScript(([k]) => localStorage.setItem(k, '{χαλασμένο'), [K1]);
        await p2.goto(url + '#elegxos'); await p2.waitForTimeout(300);
        ok('χαλασμένη αποθήκη: εμφανίζεται μήνυμα', await p2.$eval('#banner', e => !e.hidden && e.textContent.length > 20));
        ok('…και ο Έλεγχος ΔΕΝ λέει «δεν έχεις ελέγξει τίποτα» (σταθ. 10)', !/τίποτα ακόμα/.test(await p2.$eval('#say', e => e.textContent)));
        await p2.click('[data-mode="tf"]'); await p2.click('[data-tf="' + falseTf.id + '"][data-v="false"]');
        ok('…και δεν γράφεται από πάνω', await p2.evaluate(k => localStorage.getItem(k), K1) === '{χαλασμένο');
        await c2.close();
        /* η προεπισκόπηση της 16/11 έγραφε την Αντιστοίχιση στο K2: διαβάζεται, δεν χάνεται, δεν γράφεται ποτέ */
        const c3 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
        const p3 = await c3.newPage();
        const seedK2 = JSON.stringify({ v: 1, mt: { 'm6|Κέφαλος': 0 } });
        await p3.addInitScript(([k, v]) => localStorage.setItem(k, v), [K2, seedK2]);
        await p3.goto(url + '#elegxos'); await p3.waitForTimeout(300); await p3.click('[data-mode="gaps"]');
        ok('οι απαντήσεις του K2 φαίνονται στα «κενά μου»', /Κέφαλος/.test(await p3.$eval('#pane', e => e.innerText)));
        await p3.click('[data-mode="tf"]'); await p3.click('[data-tf="' + falseTf.id + '"][data-v="false"]');
        ok('…περνάνε στο K1 με την πρώτη εγγραφή', await p3.evaluate(k => JSON.parse(localStorage.getItem(k)).mt['m6|Κέφαλος'] === 0, K1));
        ok('…και το K2 δεν αγγίζεται', await p3.evaluate(k => localStorage.getItem(k), K2) === seedK2);
        await c3.close();
        continue;
      }
      ok(w + ': μηδέν σφάλματα JS' + (errs.length ? ' — ' + errs[0] : ''), errs.length === 0);
      await ctx.close();
    }
  }
  await browser.close();
  console.log('──────────────────────────────────────────────\nΑΡΧΑΙΑ · ΕΙΣΑΓΩΓΗ v2 (' + NAMES.join(', ') + ')\n' + (fail ? '✗' : '✓') + ' ' + pass + ' πέρασαν, ' + fail + ' απέτυχαν\n──────────────────────────────────────────────');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
function plainJS(s) { return String(s || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1'); }
