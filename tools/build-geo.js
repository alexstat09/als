/* ⛔ ΚΑΜΙΑ ΓΡΑΜΜΗ #! ΕΔΩ — το smoke-test.sh σκάει σε shebang. Τρέξε με `node`.
   ══════════════════════════════════════════════════════════════════════════
   ΠΑΡΑΓΩΓΗ ΤΟΥ ΑΛΗΘΙΝΟΥ ΧΑΡΤΗ
   Natural Earth (public domain) → greece-geo.js

   Τρέχει ΜΙΑ ΦΟΡΑ στο Mac. Το αποτέλεσμα μπαίνει στο repo. Καμία κλήση
   δικτύου στο runtime.
   ══════════════════════════════════════════════════════════════════════ */
const fs = require('fs');

const R = 6378137;
const rad = d => d * Math.PI / 180;
/* Web Mercator. Δηλωμένη ρητά, ίδια παντού. */
const merc = ([lon, lat]) => [R * rad(lon), R * Math.log(Math.tan(Math.PI / 4 + rad(lat) / 2))];

/* ── Douglas–Peucker ──────────────────────────────────────────────────── */
function sqSegDist(p, a, b){
  let x = a[0], y = a[1], dx = b[0] - x, dy = b[1] - y;
  if (dx || dy){
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1){ x = b[0]; y = b[1]; } else if (t > 0){ x += dx * t; y += dy * t; }
  }
  dx = p[0] - x; dy = p[1] - y;
  return dx * dx + dy * dy;
}
function dp(pts, tol){
  if (pts.length < 3) return pts;
  const t2 = tol * tol, keep = new Array(pts.length).fill(false);
  keep[0] = keep[pts.length - 1] = true;
  (function rec(i, j){
    let max = 0, idx = -1;
    for (let k = i + 1; k < j; k++){
      const d = sqSegDist(pts[k], pts[i], pts[j]);
      if (d > max){ max = d; idx = k; }
    }
    if (max > t2){ keep[idx] = true; rec(i, idx); rec(idx, j); }
  })(0, pts.length - 1);
  return pts.filter((_, i) => keep[i]);
}

/* ── Φόρτωση ──────────────────────────────────────────────────────────── */
const rd = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const A0 = rd('ne_10m_admin_0_countries.geojson');
const A1 = rd('ne_10m_admin_1_states_provinces.geojson');

const ringsOf = geom => geom.type === 'Polygon' ? [geom.coordinates[0]]
                      : geom.type === 'MultiPolygon' ? geom.coordinates.map(p => p[0]) : [];

const centroid = r => { let x = 0, y = 0; r.forEach(p => { x += p[0]; y += p[1]; }); return [x / r.length, y / r.length]; };
const areaOf = r => { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] * r[i][1] - r[i][0] * r[j][1]); return Math.abs(a / 2); };

/* ══════════════════════════════════════════════════════════════════════════
   ⚠️ ΤΟ ΕΥΡΗΜΑ ΠΟΥ ΑΛΛΑΖΕΙ ΤΗ ΜΕΘΟΔΟ
   Οι σημερινές περιφέρειες ΔΕΝ κόβονται εκεί που κόβει η ιστορία:
     · «Νότιο Αιγαίο» = Κυκλάδες + Δωδεκάνησα, αλλά τα Δωδεκάνησα ήρθαν 1947
     · οι Β. Σποράδες ανήκουν στη «Θεσσαλία», αλλά ήταν ελληνικές από το 1832
   Άρα τα νησιά ταξινομούνται ΑΝΑ ΝΗΣΙ, με bounding box, όχι ανά περιφέρεια.
   Κάθε ομάδα δηλώνει το κουτί της ρητά ώστε να ελέγχεται.
   ══════════════════════════════════════════════════════════════════════ */
const ISLE_GROUPS = {
  ionia:      { lon:[19.0, 21.3], lat:[36.0, 40.0] },  // Ιόνια — 1864
  kyklades:   { lon:[24.0, 26.6], lat:[36.0, 38.0] },  // Κυκλάδες — 1832
  sporades:   { lon:[23.0, 24.8], lat:[38.7, 39.6] },  // Β. Σποράδες — 1832
  kriti:      { lon:[23.4, 26.4], lat:[34.7, 35.8] },  // Κρήτη — 1913
  dodekanisa: { lon:[26.6, 28.4], lat:[35.0, 37.9] },  // Δωδεκάνησα — 1947 ⚠️
  voreio:     { lon:[24.9, 26.7], lat:[38.2, 39.6] }   // Β. Αιγαίο — 1913
};
function isleGroup(c){
  for (const [k, b] of Object.entries(ISLE_GROUPS))
    if (c[0] >= b.lon[0] && c[0] <= b.lon[1] && c[1] >= b.lat[0] && c[1] <= b.lat[1]) return k;
  return null;
}

/* ── Ηπειρωτικές περιφέρειες που μας ενδιαφέρουν ─────────────────────── */
const MAINLAND = {
  'Stereá Elláda':'sterea', 'Attiki':'attiki', 'Peloponnisos':'peloponnisos',
  'Dytiki Ellada':'dytiki', 'Thessalia':'thessalia', 'Ipeiros':'ipeiros',
  'Dytiki Makedonia':'dmakedonia', 'Kentriki Makedonia':'kmakedonia',
  'Anatoliki Makedonia kai Thraki':'thraki'
};

const parts = {};      // κλειδί → πίνακας από rings (lon/lat)
const add = (k, ring) => { (parts[k] = parts[k] || []).push(ring); };

/* ⚠️⚠️ ΤΟ ΚΟΥΤΙ ΔΕΝ ΑΡΚΕΙ — ΧΡΕΙΑΖΕΤΑΙ ΚΑΙ ΜΕΓΕΘΟΣ.
   Το κέντρο της ΗΠΕΙΡΟΥ (20.8, 39.6) πέφτει μέσα στο κουτί των Ιονίων, οπότε
   ολόκληρη η Ήπειρος ταξινομούνταν ως «ιόνιο νησί». Ο χάρτης του 1864 θα
   πρόσθετε έδαφος που η Ελλάδα πήρε το 1913. Βρέθηκε ΚΟΙΤΑΖΟΝΤΑΣ τον χάρτη.
   Κανόνας: ένα κομμάτι φεύγει από την περιφέρειά του μόνο αν είναι ΜΙΚΡΟ. */
const ISLE_MAX_AREA = 0.25;   // μοίρες², ~3× η Κέρκυρα, ~1/4 της Ηπείρου

A1.features.filter(f => f.properties.admin === 'Greece').forEach(f => {
  const key = MAINLAND[f.properties.name];
  ringsOf(f.geometry).forEach(ring => {
    if (ring.length < 4) return;
    const g = isleGroup(centroid(ring));
    const isle = g && (!key || areaOf(ring) < ISLE_MAX_AREA);
    if (isle) add(g, ring);         // αληθινό νησί → στην ομάδα του
    else if (key) add(key, ring);   // ηπειρωτικό → στην περιφέρειά του
    else if (g) add(g, ring);
  });
});

/* ── Γείτονες, ως ουδέτερο φόντο ─────────────────────────────────────── */
const NEIGHBOURS = ['Turkey','Albania','North Macedonia','Bulgaria','Italy','Kosovo','Serbia'];
A0.features.filter(f => NEIGHBOURS.includes(f.properties.ADMIN)).forEach(f => {
  ringsOf(f.geometry).forEach(r => { if (areaOf(r) > 0.02) add('_neighbours', r); });
});

/* ── Προβολή + απλοποίηση + κανονικοποίηση σε viewBox 1000 × H ───────── */
/* ⚠️ Το κάδρο ορίζεται από την ΕΛΛΑΔΑ ΜΟΝΟ. Αν μπουν οι γείτονες στο bbox,
   η Ιταλία και η Τουρκία το τραβάνε και η Ελλάδα ζαρώνει στη μέση. Οι
   γείτονες απλώς ξεχειλίζουν έξω από το viewBox, που είναι το σωστό. */
const all = [];
Object.entries(parts).forEach(([k, rs]) => {
  if (k === '_neighbours') return;
  rs.forEach(r => r.forEach(p => all.push(merc(p))));
});
const xs = all.map(p => p[0]), ys = all.map(p => p[1]);
const bb = { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
const W = 1000, S = W / (bb.x1 - bb.x0), H = Math.round((bb.y1 - bb.y0) * S);
const proj = p => { const m = merc(p); return [ (m[0] - bb.x0) * S, (bb.y1 - m[1]) * S ]; };

/* Ανοχή σε μονάδες viewBox. Χαμηλή για τα νησιά, ώστε να μη γίνουν κύκλοι. */
const TOL = { _neighbours: 2.2, kyklades: 0.35, sporades: 0.35, dodekanisa: 0.35,
              voreio: 0.4, ionia: 0.45, kriti: 0.5, _default: 0.8 };

const out = {}; let ptsIn = 0, ptsOut = 0;
for (const [k, rs] of Object.entries(parts)){
  const tol = TOL[k] || TOL._default;
  out[k] = rs.map(r => {
    const pr = r.map(proj); ptsIn += pr.length;
    const s = dp(pr, tol); ptsOut += s.length;
    return s.map(p => [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10]);
  }).filter(r => r.length >= 4 && areaOf(r) > 0.6);
}

const d = rs => rs.map(r => 'M' + r.map(p => p[0] + ' ' + p[1]).join('L') + 'Z').join('');
const PATHS = {}; Object.keys(out).forEach(k => PATHS[k] = d(out[k]));

fs.writeFileSync('greece-geo.js',
`/* ΠΑΡΑΓΟΜΕΝΟ — μην το πειράξεις στο χέρι. Ξανατρέξε tools/build-geo.js.
   Πηγή: Natural Earth 10m (public domain), nvkelso/natural-earth-vector
   Προβολή: Web Mercator · viewBox 0 0 ${W} ${H}
   Παρήχθη: ${new Date().toISOString().slice(0,10)}
   ⚠️ Τα νησιά ταξινομούνται ΑΝΑ ΝΗΣΙ με bounding box, γιατί οι σημερινές
      περιφέρειες δεν κόβονται εκεί που κόβει η ιστορία (Δωδεκάνησα 1947,
      Β. Σποράδες 1832 αλλά διοικητικά «Θεσσαλία»). */
var GEO_VB = { w: ${W}, h: ${H} };
var GEO = ${JSON.stringify(PATHS)};
if (typeof module !== 'undefined') module.exports = { GEO: GEO, GEO_VB: GEO_VB };
`);

console.log('viewBox 0 0 ' + W + ' ' + H);
console.log('σημεία: ' + ptsIn + ' → ' + ptsOut + '  (' + (100 - ptsOut / ptsIn * 100).toFixed(1) + '% μείωση)');
console.log('μέγεθος: ' + (fs.statSync('greece-geo.js').size / 1024).toFixed(0) + 'KB\n');
Object.keys(out).sort().forEach(k => console.log('  ' + k.padEnd(14) + String(out[k].length).padStart(4) + ' σχήματα'));
