// Drive the REAL paintArcBand from home-live.js against the REAL chapters engine.
var fs=require('fs'), vm=require('vm');
var ALS='/Users/alexstathatos/ALS DASHBOARD ALL FILES/als';
var els={};
function mk(id){var e={id:id,_t:'',classList:{_s:{hidden:1},add(c){this._s[c]=1},remove(c){delete this._s[c]},toggle(c,f){if(f===undefined)f=!this._s[c];if(f)this._s[c]=1;else delete this._s[c];return !!this._s[c]},contains(c){return !!this._s[c]}},
 querySelectorAll:()=>[],querySelector:()=>null,getAttribute:()=>'',setAttribute(){},addEventListener(){},childNodes:[{nodeValue:''}],style:{}};
Object.defineProperty(e,'textContent',{get(){return e._t},set(v){e._t=String(v)}});
Object.defineProperty(e,'innerHTML',{get(){return e._t},set(v){e._t=String(v)}});return e;}
var store={};
var sb={console:{log(){},warn(){}},JSON:JSON,Object:Object,Array:Array,Date:Date,Math:Math,String:String,Number:Number,isNaN:isNaN,parseFloat:parseFloat,parseInt:parseInt,
 localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}},
 setTimeout:()=>0,setInterval:()=>0,requestAnimationFrame:()=>0,
 document:{getElementById:id=>els[id]||(els[id]=mk(id)),addEventListener(){},querySelectorAll:()=>[],querySelector:()=>null},
 matchMedia:()=>({matches:false})};
sb.window=sb; sb.addEventListener=()=>{};
vm.createContext(sb);

// two years of real-ish data so chapters actually form
function dk(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
var today=new Date(); today.setHours(0,0,0,0);
var W=[],WO=[],SL=[];
var seed=11; function rnd(){seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;}
for(var i=400;i>=0;i--){
  var d=new Date(today); d.setDate(today.getDate()-i);
  var kg = 78 - (400-i)*0.012 + (rnd()-0.5)*0.6;      // a long cut
  W.push({dateKey:dk(d), weight:+kg.toFixed(1)});
  if(i%2===0) WO.push({date:dk(d), volume:3000+Math.round(rnd()*7000), prs:(rnd()>0.9?['x']:[])});
  SL.push({dateKey:dk(d), hours:7+(rnd()-0.5), recovery:50+Math.round(rnd()*40)});
}
store['po_coach_weights']=JSON.stringify(W);
store['po_workouts']=JSON.stringify(WO);
store['sleep:logs']=JSON.stringify(SL);

vm.runInContext(fs.readFileSync(ALS+'/chapters-engine.js','utf8'),sb,{filename:'chapters-engine.js'});
vm.runInContext(fs.readFileSync(ALS+'/home-live.js','utf8'),sb,{filename:'home-live.js'});

var ok=0,bad=0; function is(n,c){(c?ok++:bad++);console.log((c?'  ✓ ':'  ✗ FAIL ')+n);}
var res=sb.window.ALSChapters.compute();
console.log('\nchapters detected:', res.chapters.map(c=>c.key).join(' → '));
is('engine found enough for chapters', res.hasEnough);
is('band is visible', !els.arcBand.classList.contains('hidden'));
console.log('  eyebrow :', JSON.stringify(els.arcBandN.textContent));
console.log('  title   :', JSON.stringify(els.arcBandTitle.textContent));
console.log('  meta    :', JSON.stringify(els.arcBandMeta.textContent));
console.log('  body    :', JSON.stringify(els.arcBandBody.textContent.slice(0,80)+'…'));
is('chapter is numbered', /\d+$/.test(els.arcBandN.textContent));
is('title has no trailing full stop', !/\.$/.test(els.arcBandTitle.textContent));
is('it is NOT the "Now" placeholder', els.arcBandTitle.textContent!=='Now');
is('a CLOSED chapter is not given a running day count', !(/Last chapter/.test(els.arcBandN.textContent) && /day \d+/.test(els.arcBandMeta.textContent)));
is('body is one sentence', (els.arcBandBody.textContent.match(/\. /g)||[]).length<=1);
is('first ever visit does NOT cry "new chapter"', els.arcBandNew.classList.contains('hidden'));
is('it remembered what it showed', !!store['arc:seen']);

// now simulate the chapter turning
store['arc:seen']='something|older';
els.arcBandNew.classList.add('hidden');
sb.window.__forceRepaint && sb.window.__forceRepaint();
// re-run via the storage repaint path
vm.runInContext("(function(){ var b=document.getElementById('arcBand'); })();",sb);
// call paint again through a fresh load of home-live (simplest honest way)
vm.runInContext(fs.readFileSync(ALS+'/home-live.js','utf8'),sb,{filename:'home-live.js#2'});
is('a changed chapter IS announced', !els.arcBandNew.classList.contains('hidden'));
is('…and then it stops announcing it', (function(){ els.arcBandNew.classList.add('hidden'); vm.runInContext(fs.readFileSync(ALS+'/home-live.js','utf8'),sb,{filename:'home-live.js#3'}); return els.arcBandNew.classList.contains('hidden'); })());

// no data at all
store={}; els.arcBand.classList.add('hidden');
vm.runInContext(fs.readFileSync(ALS+'/home-live.js','utf8'),sb,{filename:'home-live.js#4'});
is('no data → band hides rather than showing an empty frame', els.arcBand.classList.contains('hidden'));

console.log('\n'+ok+' passed, '+bad+' failed');
process.exit(bad?1:0);
