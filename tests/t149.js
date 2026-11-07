/* t149: Discord server panel in the Menu loads only on tap and is removed when hidden */
const APP='file://'+require('path').resolve(__dirname,'../index.html');const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c)pass++;else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await (await b.newContext({viewport:{width:400,height:820}})).newPage();const errs=[],reqs=[];p.on('pageerror',e=>errs.push(e.message));p.on('request',r=>{if(/discord\.com/.test(r.url()))reqs.push(r.url())});
await p.route(/discord\.com/,r=>r.fulfill({status:200,contentType:'text/html',body:'<p>stub</p>'}));
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.newSeen','2026-11-06f');localStorage.setItem('lunaSleep.newOptOut','1')}catch(e){}});
await p.goto(APP);await p.waitForTimeout(800);const ev=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
ok(await ev(()=>!!document.getElementById('dc-show')&&!document.querySelector('#dc-frame iframe')&&document.getElementById('dc-frame').hidden),'button is in the Menu and no iframe exists yet');
ok(reqs.length===0,'nothing is requested from discord.com on load: '+reqs);
await ev(()=>{document.getElementById('set-open').click()});await W(300);
await ev(()=>{const d=document.getElementById('dc-widget').closest('details');if(d)d.open=true});
await ev(()=>document.getElementById('dc-show').click());await W(500);
const o=await ev(()=>{const f=document.querySelector('#dc-frame iframe');return f?{src:f.src,sb:f.getAttribute('sandbox'),t:f.title,ex:document.getElementById('dc-show').getAttribute('aria-expanded'),vis:!document.getElementById('dc-frame').hidden,w:f.getBoundingClientRect().width}:null});
ok(o&&/^https:\/\/discord\.com\/widget\?id=1513689038710767777&theme=(dark|light)$/.test(o.src),'iframe points at the server widget '+(o&&o.src));
ok(o&&o.sb==='allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts'&&o.t==='Discord server panel'&&o.ex==='true'&&o.vis,'sandboxed, titled and expanded '+JSON.stringify(o));
ok(o&&o.w<=352&&o.w>200,'fits a phone: '+(o&&o.w));
ok(reqs.length>0,'tap is what loads it');
await ev(()=>document.getElementById('dc-show').click());await W(200);
ok(await ev(()=>!document.querySelector('#dc-frame iframe')&&document.getElementById('dc-frame').hidden&&document.getElementById('dc-show').getAttribute('aria-expanded')==='false'),'second tap removes it');
ok(!errs.length,'no page errors '+errs);console.log('t149',pass,'pass',bad,'fail');process.exit(bad?1:0)}finally{await b.close()}})();
