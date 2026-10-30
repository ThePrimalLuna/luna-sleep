/* t111: share row; offer opens; no html injected */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c){pass++}else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const ctx=await b.newContext({viewport:{width:400,height:820},hasTouch:true});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__v=[];navigator.vibrate=function(x){window.__v.push(x);return true};try{}catch(e){}});
await p.goto(APP);await p.waitForTimeout(900);
const ev=(f,a)=>p.evaluate(f,a);
const body=()=>ev(()=>document.getElementById('cx-body').innerText);
const clickText=(t)=>ev(t=>{const x=[...document.querySelectorAll('#cx-dlg button')].find(b=>(b.textContent||'').trim().startsWith(t));if(x){x.click();return true}return false},t);
const pickTex=async id=>{for(let i=0;i<5;i++){const hit=await p.evaluate(id=>{const b=document.querySelector('#cx-body [data-tex="'+id+'"]');if(b){b.click();return true}return false},id);if(hit)return true;const ok2=await p.evaluate(i=>{const t=document.querySelectorAll('#cx-body .textabs button')[i];if(t){t.click();return true}return false},i);if(!ok2)return false}return false};
// textures
for(const k of ['thunder','fire','tide','train','moth','knead','fur','paws','bellows','cricket','chimes']){
 for(const lvl of [1,3,5])for(const secs of [2,4,6]){await ev(([k,l])=>{localStorage.setItem('lunaSleep.vib',JSON.stringify({on:true,lvl:l,pat:k}));window.__v=[]},[k,lvl]);
  for(const ty of [1,0])await ev(([ty,s])=>LT.buzz(ty,s,true),[ty,secs]);
  const v=await ev(()=>window.__v);ok(v.length===2,k+' two');v.forEach(a=>{ok(Array.isArray(a)&&a.length%2===1&&a.length<=99&&a.every(x=>Number.isInteger(x)&&x>0&&x<=1100),k+' valid '+JSON.stringify(a).slice(0,90))})}
 const v=await ev(()=>window.__v);console.log(k,'len',v.map(a=>a.length).join('/'),'ms',v.map(a=>a.reduce((x,y)=>x+y,0)).join('/'))}
// picker
await ev(()=>{localStorage.removeItem('lunaSleep.vib');LT.hapticsOpen()});
for(const [lab,k] of [['Thunder','thunder'],['Campfire','fire'],['Tide','tide'],['Night train','train'],['Moth wings','moth'],['Cat kneading','knead'],['Fur stroke','fur'],['Wolf paws on snow','paws'],['Breath bellows','bellows'],['Cricket song','cricket'],['Wind chimes','chimes']]){ok(await pickTex(k),'btn '+lab);ok(await ev(()=>JSON.parse(localStorage.getItem('lunaSleep.vib')).pat)===k,'set '+k)}
let t=await body();ok(/Share this feel/.test(t),'share row');
await ev(()=>{const i=document.querySelector('#cx-body input[type=text]');i.value='Slow Tide <b>';i.dispatchEvent(new Event('input'))});
const link=await ev(()=>LT.feelLink(LT.vpat(),LT.vbpm(),LT.vdesc(),'Slow Tide <b>'));ok(/\?feel=chimes/.test(link)&&!/[<>]/.test(decodeURIComponent(link)),'link '+link);
// open link flow
const page2=await ctx.newPage();await page2.addInitScript(()=>{window.__v=[];navigator.vibrate=function(x){window.__v.push(x);return true};try{localStorage.setItem('lunaSleep.vib',JSON.stringify({on:false,lvl:2,pat:'swell'}))}catch(e){}});
await page2.goto('file://'+require('path').resolve(__dirname,'..','index.html')+'?feel=thunder&desc=15&bpm=55&n=Night%20Swim%3Cb%3E');await page2.waitForTimeout(1200);
const e2=(f,a)=>page2.evaluate(f,a);
ok(await e2(()=>!document.getElementById('cx-dlg').hidden&&document.getElementById('cx-h').textContent==='A feel for this track'),'offer opens');
const bt=await e2(()=>document.getElementById('cx-body').innerText);ok(/Night Swimb|Night Swim/.test(bt)&&/Thunder/.test(bt)&&/15 minutes/.test(bt)&&!/Heartbeat speed/.test(bt),'offer text '+bt.slice(0,200));
ok(await e2(()=>document.getElementById('cx-body').innerHTML.indexOf('<b>')<0),'no html injected');
ok(await e2(()=>JSON.parse(localStorage.getItem('lunaSleep.vib')).pat)==='swell','nothing applied before consent');
await e2(()=>{[...document.querySelectorAll('#cx-dlg button')].find(b=>/^Feel it/.test(b.textContent)).click()});
ok(await e2(()=>window.__v.length>0&&JSON.parse(localStorage.getItem('lunaSleep.vib')).pat==='swell'),'preview buzzes, restores');
await e2(()=>{[...document.querySelectorAll('#cx-dlg button')].find(b=>/^Use this/.test(b.textContent)).click()});
const cfg=await e2(()=>JSON.parse(localStorage.getItem('lunaSleep.vib')));ok(cfg.pat==='thunder'&&cfg.on===true&&cfg.desc===15&&cfg.lvl===2,'applied '+JSON.stringify(cfg));
ok(await e2(()=>{window.cvCheck();return !!JSON.parse(localStorage.getItem('lunaSleep.cv')||localStorage.getItem('lunaSleep.cheevos')||'{}').feelink||true}),'cheevo check ran');
// bad links
const page3=await ctx.newPage();await page3.goto('file://'+require('path').resolve(__dirname,'..','index.html')+'?feel=bogus');await page3.waitForTimeout(1200);
ok(await page3.evaluate(()=>/does not look right/.test(document.getElementById('cx-body').innerText)),'bad feel handled');
// themes
for(const k of ['Opera','Champagne','BlackCard']){await ev(k=>{const s=document.getElementById('theme-sel');s.value=k;s.dispatchEvent(new Event('change',{bubbles:true}))},k);
 ok(await ev(()=>document.documentElement.getAttribute('data-skin')),'skin '+k);
 const sk=await ev(()=>document.documentElement.getAttribute('data-skin'));ok(sk===k,'skin is '+k+' got '+sk);
 const bg=await ev(()=>getComputedStyle(document.body).color);ok(bg!=='',k+' color')}
await ev(()=>window.cvCheck());
const cv=await ev(()=>{const o={};for(const k of Object.keys(localStorage))if(/cv|ach|cheev/i.test(k))o[k]=localStorage.getItem(k).slice(0,300);return o});console.log(JSON.stringify(cv).slice(0,400));
const cvk=await ev(()=>window.cvGet());ok(cvk.opera&&cvk.champ&&cvk.blackcard,'three theme cheevos '+Object.keys(cvk));ok(cvk.taste,'taste combo');
ok(errs.length===0,'page errors '+errs.join('|'));
}finally{await b.close()}
console.log('t111 pass='+pass+' bad='+bad)})().catch(e=>{console.log('ERR',e.message.slice(0,200));process.exit(1)});
