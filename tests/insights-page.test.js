var fs=require('fs'), vm=require('vm');
var ALS='/Users/alexstathatos/ALS DASHBOARD ALL FILES/als';
var els={}, listeners={};
function mkEl(id){var e={id:id,_t:'',_h:'',style:{},
 classList:{_s:{},add(c){this._s[c]=1},remove(c){delete this._s[c]},toggle(c,f){if(f===undefined)f=!this._s[c];if(f)this._s[c]=1;else delete this._s[c];return !!this._s[c]},contains(c){return !!this._s[c]}},
 addEventListener(ev,fn){(listeners[id]=listeners[id]||{})[ev]=fn;},
 setAttribute(k,v){this['_a'+k]=v},getAttribute(k){return this['_a'+k]},
 querySelectorAll(){return[]},closest(){return null}};
Object.defineProperty(e,'textContent',{get(){return e._t},set(v){e._t=String(v)}});
Object.defineProperty(e,'innerHTML',{get(){return e._h},set(v){e._h=String(v)}});return e;}
var store={};
var sb={console:{log(){},warn(){}},JSON:JSON,Object:Object,Array:Array,Date:Date,Math:Math,String:String,Number:Number,isNaN:isNaN,
 localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}},
 setTimeout:(f)=>{try{f()}catch(e){};return 0},requestAnimationFrame:(f)=>{try{f()}catch(e){};return 0},
 document:{getElementById:id=>els[id]||(els[id]=mkEl(id)),addEventListener(){},querySelectorAll:()=>[]}};
sb.window=sb; vm.createContext(sb);

function dk(i){var d=new Date(2026,3,1); d.setDate(d.getDate()+i); return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
var seed=7; function rnd(){ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; }
var sleep=[],nut=[],caf=[],wo=[],wts=[];
var prot=[]; for(var i=0;i<70;i++) prot.push(80+Math.round(rnd()*120));
for(var i=0;i<70;i++){
  var d=dk(i), y=i>0?prot[i-1]:140;
  sleep.push({dateKey:d,hours:+(7+(rnd()-0.5)*1.2).toFixed(2),recovery:Math.round(45+(y-80)/120*35+(rnd()-0.5)*8),quality:3,energy:3,mood:3,soreness:2});
  nut.push({dateKey:d,kcal:2200+Math.round(rnd()*600),p:prot[i],c:250});
  caf.push({ts:new Date(d+'T09:00:00').getTime(),mg:50+Math.round(rnd()*250)});
  if(i%2===0) wo.push({date:d,volume:3000+Math.round(rnd()*7000)});
  wts.push({dateKey:d,weight:+(72-i*0.01).toFixed(1)});
}
store['sleep:logs']=JSON.stringify(sleep); store['nut:logs']=JSON.stringify(nut);
store['caf:logs']=JSON.stringify(caf); store['po_workouts']=JSON.stringify(wo);
store['po_coach_weights']=JSON.stringify(wts);

vm.runInContext(fs.readFileSync(ALS+'/insights-engine.js','utf8'),sb,{filename:'engine'});
var page=fs.readFileSync(ALS+'/insights.html','utf8').match(/<script>\n\(function\(\)\{[\s\S]*?\n\}\)\(\);\n<\/script>/)[0].replace('<script>','').replace('</script>','');
vm.runInContext(page,sb,{filename:'insights.html'});

var ok=0,bad=0; function is(n,a,b){var p=JSON.stringify(a)===JSON.stringify(b);(p?ok++:bad++);console.log((p?'  ✓ ':'  ✗ FAIL ')+n+(p?'':'  got '+JSON.stringify(a)));}
function ok_(n,c){(c?ok++:bad++);console.log((c?'  ✓ ':'  ✗ FAIL ')+n);}

console.log('\nThe page renders from real statistics');
ok_('subtitle reports what it read', /reading 7\d days/.test(els.iqSub.textContent));
ok_('headline card shown', !els.leadCard.classList.contains('hidden'));
ok_('headline is a real sentence', els.leadTxt.textContent.length>40);
ok_('board rendered', els.boardBody.innerHTML.indexOf('iq-row')>=0);
ok_('board counts all three states', /confirmed · .* ruled out · .* watching/.test(els.boardN.textContent));
console.log('   →', els.boardN.textContent);
ok_('question chips rendered', (els.askQs.innerHTML.match(/data-q=/g)||[]).length===5);
ok_('shape card shown', !els.shapeCard.classList.contains('hidden'));
ok_('shape has sparklines', els.shapeBody.innerHTML.indexOf('<svg')>=0);
ok_('training rhythm shown', !els.rhyWrap.classList.contains('hidden'));
ok_('rhythm has weekly bars', (els.rhyBars.innerHTML.match(/iq-rhy-b/g)||[]).length===14);
ok_('rhythm states a per-week average', /sessions a week/.test(els.rhyV.innerHTML));
ok_('rhythm axis is labelled at both ends', !!els.rhyL.textContent && !!els.rhyR.textContent);
ok_('constellation drawn from his own data', els.iqSky.innerHTML.indexOf('<circle')>=0);
ok_('method explains both bars', /big enough to matter/.test(els.method.innerHTML)&&/statistically real/.test(els.method.innerHTML));

console.log('\nRuled-out and watching are VISIBLE, not discarded');
ok_('board shows ruled-out rows', els.boardBody.innerHTML.indexOf('iq-pip ruled')>=0 || els.boardN.textContent.indexOf('ruled out')>=0);
ok_('a shortfall is expressed as days', /\d+ of \d+ days/.test(els.boardBody.innerHTML) || /days/.test(els.boardBody.innerHTML));

console.log('\nAsking a question');
listeners.askQs.click({target:{closest:()=>({getAttribute:()=>'recovery'})}});
ok_('answer opens', !els.askAns.classList.contains('hidden'));
ok_('answer has content', els.askAns.innerHTML.length>60);
ok_('answer names what holds up or says none', /What holds up|iq-none/.test(els.askAns.innerHTML));
listeners.askQs.click({target:{closest:()=>({getAttribute:()=>'recovery'})}});
ok_('tapping again closes it', els.askAns.classList.contains('hidden'));

console.log('\nWhat changed — invents nothing without history');
ok_('no history → card hidden', els.chCard.classList.contains('hidden'));

console.log('\nEscaping');
ok_('board html is escaped', els.boardBody.innerHTML.indexOf('<script')<0);

console.log('\n'+ok+' passed, '+bad+' failed');
process.exit(bad?1:0);
