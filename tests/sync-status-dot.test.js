/* als-v656 — the sync watchdog: a dot at 2 min, the banner only at 30 min.
   Fake DOM, real als-sync-status.js. Run: node tests/sync-status-dot.test.js */
const vm=require('vm'),fs=require('fs');
function mkEl(tag){const e={tagName:tag,children:[],style:{},attrs:{},listeners:{},parentNode:null,className:'',textContent:'',
 get isConnected(){let n=this;while(n){if(n===doc.body||n===doc.head)return true;n=n.parentNode;}return false;},
 appendChild(c){c.parentNode=this;this.children.push(c);return c;},remove(){if(this.parentNode){this.parentNode.children=this.parentNode.children.filter(x=>x!==this);this.parentNode=null;}},
 setAttribute(k,v){this.attrs[k]=v;},addEventListener(t,f){(this.listeners[t]=this.listeners[t]||[]).push(f);},
 click(){let ev={preventDefault(){},stopPropagation(){this.stopped=true}};(this.listeners.click||[]).forEach(f=>f(ev));return ev;}};return e;}
let doc;
function run(stuckMinAgo,withTopbar){
  doc={head:mkEl('head'),body:mkEl('body'),createElement:mkEl,documentElement:null,
    getElementById:id=>id==='topbarAcct'?acct:null,addEventListener(){}};
  var acct=withTopbar?doc.body.appendChild(mkEl('button')):null;
  const store=new Map([['als:sync-stuck',JSON.stringify({nutrition:Date.now()-stuckMinAgo*60000})]]);
  const win={addEventListener(){},dispatchEvent(){}};
  const sb={window:win,document:doc,navigator:{onLine:true},localStorage:{getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
    getComputedStyle:()=>({position:'static'}),setInterval:()=>1,clearInterval(){},Event:function(){},console,Date,JSON,Math,Object,Array};
  sb.window.localStorage=sb.localStorage;
  vm.createContext(sb); vm.runInContext(fs.readFileSync(require('path').join(__dirname,'..','als-sync-status.js'),'utf8'),sb);
  const find=(n,f)=>{if(f(n))return n;for(const c of n.children){const r=find(c,f);if(r)return r;}return null;};
  const dot=()=>find(doc.body,n=>n.className&&n.className.indexOf('als-sync-dot')===0);
  const ban=()=>find(doc.body,n=>n.attrs&&n.attrs.role==='alert');
  return {dot,ban,acct,S:sb.window.ALSSyncStatus};
}
let p=0,f=0;const ok=(m,c)=>{c?p++:f++;console.log((c?'✓ ':'✗ FAIL ')+m)};
let t=run(1,true); ok('1 min: no dot, no banner',!t.dot()&&!t.ban());
t=run(5,true); ok('5 min: dot shown',t.dot()&&t.dot().style.display==='');
ok('5 min: dot sits on the account button',t.dot().parentNode===t.acct);
ok('5 min: no banner yet',!t.ban()||t.ban().style.display==='none');
let ev=t.dot().click(); ok('tap dot: does not open the account sheet',ev.stopped===true);
ok('tap dot: banner opens',t.ban()&&t.ban().style.display==='');
const hide=t.ban().children.find(c=>c.textContent==='Hide'); ok('opened by hand: has Hide',hide&&hide.style.display==='');
hide.click(); ok('Hide closes it',t.ban().style.display==='none'); ok('dot stays after Hide',t.dot().style.display==='');
t.S.ok('nutrition'); ok('saved: dot gone',t.dot().style.display==='none');
t=run(40,true); ok('40 min: banner shown by itself',t.ban()&&t.ban().style.display==='');
ok('40 min: no Hide button',t.ban().children.find(c=>c.textContent==='Hide').style.display==='none');
ok('40 min: dot hidden (banner says it)',!t.dot()||t.dot().style.display==='none');
t.S.ok('nutrition'); ok('saved: banner gone',t.ban().style.display==='none');
t=run(5,false); ok('no top bar: dot floats',t.dot()&&t.dot().className.indexOf('als-sync-dot--float')>0);
console.log(p+' passed, '+f+' failed');process.exit(f?1:0);
