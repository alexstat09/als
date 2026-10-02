// Renders docs/catalog.jpg — a labelled sheet of EVERY reusable character and prop, all expressions included.
// Run after adding anything to engine/props.mjs or engine/chars.mjs:   node tools/catalog.mjs
import { render } from '../engine/render.mjs';
import * as P from '../engine/props.mjs';
import { venizelos, konstantinos } from '../engine/chars.mjs';
const lab = (x, y, t) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="JetBrains Mono" font-size="15" fill="#222">${t}</text>`;
const g = (x, y, s, inner, name) => `<g transform="translate(${x},${y}) scale(${s})">${inner}</g>${lab(x, y + 26, name)}`;
const people = [
  ['konstantinos()', konstantinos({ id: 'a1', start: 'angry' })], ['venizelos()', venizelos({ id: 'a2', start: 'happy' })],
  ['P.marianne()  FR', P.marianne('a3', { start: 'happy' })], ['P.johnbull()  UK', P.johnbull('a4')], ['P.unclesam()  US', P.unclesam('a5', { start: 'angry' })],
  ['P.soldier()', P.soldier('a6', { start: 'yawn' })], ['P.citizen()', P.citizen('a7', { start: 'sad' })], ['P.minister()', P.minister('a8', { start: 'shock' })],
  ['P.person({...})', P.person({ id: 'a9', coat: '#6a4c93', hair: 'long', female: true, dress: true, start: 'happy' })],
];
const exprs = ['neutral', 'happy', 'angry', 'sad', 'shock', 'yawn', 'blink', 'strain'];
const props = [
  ['moneyBag("£")', P.moneyBag('£'), .55], ['banknote()', P.banknote(), .45], ['scroll("ΔΑΝΕΙΟ")', P.scroll('ΔΑΝΕΙΟ'), .45], ['stamp("…")', P.stamp('ΕΓΚΡΙΘΗΚΕ'), .4],
  ['ship("fr"|"uk")', P.ship('uk'), .45], ['palace()', P.palace(), .3], ['cloudStorm()', P.cloudStorm(), .35], ['vault()', P.vault(), .3],
  ['balance()', P.balance(), .3], ['press()', P.press(), .3], ['ballotBox()', P.ballotBox(), .35], ['ledger()', P.ledger(), .25],
  ['goldBars()', P.goldBars(), .6], ['fxStack()', P.fxStack(), .6], ['padlock()', P.padlock(), .5], ['scissors()', P.scissors(), .35],
  ['wreath()', P.wreath(), .3], ['bond()', P.bond(), .4], ['wall()', P.wall(), .25], ['bulb()', P.bulb(), .45],
  ['building("…")', P.building('ΚΕΚΤΗΜΕΝΑ'), .3], ['weightBlock("…")', P.weightBlock('ΚΟΣΤΟΣ'), .25],
  ['flag("gr")', P.flag('gr'), .9], ['flag("fr")', P.flag('fr'), .9], ['flag("uk")', P.flag('uk'), .9], ['flag("us")', P.flag('us'), .9],
];
let s = `<svg width="1920" height="2160" style="background:#efe9dc"><defs>${P.ukFlagPattern}</defs>`;
s += `<text x="20" y="40" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="34">CHARACTERS (engine/chars.mjs, engine/props.mjs)</text>`;
people.forEach(([n, svg], i) => { s += g(110 + i * 210, 470, .85, svg, n); });
s += `<text x="20" y="560" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="34">EXPRESSIONS — expr(id, name). person(): all 8 · venizelos(): neutral/angry/blink/shock/happy/sad · konstantinos(): neutral/angry/blink/shock/happy</text>`;
exprs.forEach((e, i) => { s += g(120 + i * 230, 1000, .9, P.citizen('e' + i, { start: e, hat: 'none', hair: 'short' }), e); });
s += `<text x="20" y="1090" font-family="Fira Sans Extra Condensed" font-weight="900" font-size="34">PROPS (engine/props.mjs) — origin = bottom-centre for standing objects, centre for flat ones</text>`;
props.forEach(([n, svg, sc], i) => { const c = i % 9, r = Math.floor(i / 9); const x = 110 + c * 212, y = 1290 + r * 300; s += g(x, y, sc, svg, n); });
s += '</svg>';
await render([[`<div style="width:1920px;height:2160px">${s}</div>`, 'docs/catalog.png']]);
console.log('docs/catalog.png');
