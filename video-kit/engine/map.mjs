// Builds projected SVG path data for Greece 1916 (stylised) for a given fit box.
import fs from 'fs';
import * as d3 from 'd3-geo';
import { feature } from 'topojson-client';

const countries = JSON.parse(fs.readFileSync(new URL('../node_modules/world-atlas/countries-10m.json', import.meta.url)));
const landTopo = JSON.parse(fs.readFileSync(new URL('../node_modules/world-atlas/land-10m.json', import.meta.url)));
const all = feature(countries, countries.objects.countries);
const landRaw = feature(landTopo, landTopo.objects.land);
const land = { type: 'MultiPolygon', coordinates: (landRaw.features ? landRaw.features[0].geometry : landRaw.geometry).coordinates.filter(p => d3.geoArea({ type: 'Polygon', coordinates: p }) < 2 * Math.PI) };
const greece = all.features.find(f => f.properties.name === 'Greece');

// Split Greek polygons into mainland / islands, classify by 1916 situation
const polys = greece.geometry.coordinates; // MultiPolygon
const areaOf = p => d3.geoArea({ type: 'Polygon', coordinates: p });
const mainIdx = polys.map(areaOf).reduce((bi, a, i, arr) => (a > arr[bi] ? i : bi), 0);

function classifyIsland(p) {
  const [lon, lat] = d3.geoCentroid({ type: 'Polygon', coordinates: p });
  // Dodecanese & Kastellorizo: Italian in 1916
  if (lat < 37.45 && lon > 26.3 && lat > 35.3) return 'foreign';
  if (lon > 29) return 'foreign';
  // "New lands" of 1912-13 that sided with Thessaloniki (Εθνική Άμυνα): Crete + North Aegean islands
  if (lat < 35.8 && lon > 23.4) return 'north';                 // Crete
  if (lon > 25.45 && lat > 37.5) return 'north';                // Ikaria, Samos, Chios, Psara, Lesbos
  if (lat > 39.3 && lon > 24.8) return 'north';                 // Lemnos, Ag. Efstratios
  if (lat > 40.3) return 'north';                               // Thasos, Samothrace
  return 'south';                                               // Old Greece incl. Cyclades, Sporades, Ionian
}
const groups = { north: [], south: [], foreign: [] };
polys.forEach((p, i) => { if (i !== mainIdx) groups[classifyIsland(p)].push(p); });
const mainland = polys[mainIdx];

// Stylised dividing line (neutral zone, approx.) west -> east, and Nestos line
const divide = [[20.3, 40.55], [20.9, 40.28], [21.5, 40.06], [22.2, 39.99], [22.75, 39.96]];
// East of Strymon: occupied by Bulgaria from Aug 1916 (not under either Greek government)
const strymonEast = [[23.55, 42.6], [23.55, 41.45], [23.62, 41.1], [23.78, 40.9], [23.88, 40.74], [24.6, 40.55], [27.5, 40.55], [27.5, 42.6]];
const nestosEast = [[24.62, 42.6], [24.62, 41.45], [24.70, 41.15], [24.80, 40.88], [25.2, 40.88], [26.0, 40.78], [26.7, 40.6], [27.5, 40.6], [27.5, 42.6]];

export function buildMap({ box, bounds = [[19.2, 34.7], [28.4, 41.9]], clip = null }) {
  const boundsFeat = { type: 'Feature', geometry: { type: 'MultiPoint', coordinates: bounds } };
  const proj = d3.geoMercator().fitExtent(box, boundsFeat);
  if (clip) proj.clipExtent(clip);
  const path = d3.geoPath(proj);
  const P = ([lon, lat]) => proj([lon, lat]).map(v => +v.toFixed(1));
  const ring = pts => 'M' + pts.map(P).map(p => p.join(',')).join('L') + 'Z';
  const line = pts => 'M' + pts.map(P).map(p => p.join(',')).join('L');
  const mp = arr => path({ type: 'MultiPolygon', coordinates: arr }) || '';
  // north clip polygon: above the divide line
  const northClip = ring([[18, 43], ...divide.map(p => p), [22.75, 39.96], [28, 39.96], [28, 43]]);
  const southClip = ring([[18, 30], [18, 43], [20.3, 43], ...divide, [22.75, 39.96], [28, 39.96], [28, 30]]);
  return {
    proj, P,
    land: path(land),
    mainland: mp([mainland]),
    north: mp(groups.north),
    south: mp(groups.south),
    foreign: mp(groups.foreign),
    northClip, southClip,
    thraceClip: ring(nestosEast),
    occClip: ring(strymonEast),
    divide: line(divide),
    graticule: path(d3.geoGraticule().step([1, 1])()),
    athens: P([23.7275, 37.9838]),
    thess: P([22.9444, 40.6401]),
    pt: P, path,
  };
}
