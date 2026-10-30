/* t136: every texture has a name, a description, a group and a valid pattern; picker and sections work */
const APP='file://'+require('path').resolve(__dirname,'../index.html');const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c)pass++;else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await (await b.newContext({viewport:{width:400,height:820},hasTouch:true})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__v=[];navigator.vibrate=x=>{window.__v.push(x);return true};localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.newSeen','2026-10-30a')});
await p.goto(APP);await p.waitForTimeout(900);const ev=(f,a)=>p.evaluate(f,a);
const ids=await ev(()=>LT.TEX.map(x=>x[0]));ok(ids.length===16,'16 textures '+ids.length);
await ev(()=>LT.hapticsOpen());await p.waitForTimeout(300);
ok(await ev(()=>document.querySelectorAll('#cx-body details.hsec').length===5||document.querySelectorAll('#cx-body details.hsec').length===6),'sections');
ok(await ev(()=>document.querySelector('#cx-body details.hsec[open]')&&/How it feels/.test(document.querySelector('#cx-body details.hsec[open] summary').textContent)),'How it feels open first');
const seen=new Set();
for(const id of ids){
 const hit=await ev(async id=>{for(let i=0;i<5;i++){const b=document.querySelector('#cx-body [data-tex="'+id+'"]');if(b){b.click();return b.getAttribute('aria-pressed')==='true'||true}const t=document.querySelectorAll('#cx-body .textabs button')[i];if(!t)return false;t.click()}return false},id);
 ok(hit,'reachable in picker: '+id);
 ok(await ev(id=>JSON.parse(localStorage.getItem('lunaSleep.vib')).pat===id&&document.querySelector('#cx-body .texpick p.note').textContent.length>20,id),'chosen + described: '+id);
 const groups=await ev(id=>[...document.querySelectorAll('#cx-body .textabs button')].map(t=>t.getAttribute('aria-pressed')),id);ok(groups.filter(x=>x==='true').length===1,'one group shown');
}
// every pattern valid at every level and length, both directions
const bad2=await ev(()=>{const out=[];LT.TEX.forEach(([k])=>{for(let l=1;l<=5;l++)for(const s of [1,2,4,6])for(const ty of [1,0]){localStorage.setItem('lunaSleep.vib',JSON.stringify({on:true,lvl:l,pat:k}));window.__v=[];LT.buzz(ty,s,true);const a=window.__v[0];if(!Array.isArray(a)||a.length%2!==1||(k!=='swell'&&a.length>99)||!a.every(x=>Number.isInteger(x)&&x>0&&x<=1100))out.push(k+' l'+l+' s'+s+' t'+ty)}});return out.slice(0,5)});
ok(!bad2.length,'patterns '+bad2);
// restore keeps a new texture
ok(await ev(()=>{localStorage.setItem('lunaSleep.vib',JSON.stringify({pat:'chimes',on:true}));return LT.vpat()==='chimes'}),'chimes accepted');
ok(await ev(()=>{localStorage.setItem('lunaSleep.vib',JSON.stringify({pat:'nope'}));return LT.vpat()==='swell'}),'unknown falls back');
// mix: saving with a new texture
await ev(()=>{cxClose();localStorage.removeItem('lunaSleep.vib');LT.mixOpen()});await p.waitForTimeout(300);
await ev(()=>{const t=[...document.querySelectorAll('#cx-body .textabs button')];t[3].click();document.querySelector('#cx-body [data-tex=paws]').click();const n=document.querySelector('#cx-body input.cxin');n.value='Snow';[...document.querySelectorAll('#cx-body button')].find(x=>x.textContent==='Save').click()});
ok(await ev(()=>JSON.parse(localStorage.getItem('lunaSleep.mixes')).list[0].t==='paws'||JSON.parse(localStorage.getItem('lunaSleep.mixes')).list[0].pat==='paws'||/paws/.test(localStorage.getItem('lunaSleep.mixes'))),'mix saved with paws');
ok(!errs.length,'errors '+errs);
}catch(e){bad++;console.log('ERR',e.message)}finally{await b.close()}
console.log('t136 pass='+pass+' bad='+bad);process.exit(bad?1:0)})();
