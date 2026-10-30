/* smoke */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();let bad=0;try{
for(const mob of [true,false]){
const ctx=await b.newContext({viewport:mob?{width:380,height:760}:{width:1200,height:800},hasTouch:mob});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_|net::/.test(m.text()))errs.push('console:'+m.text().slice(0,120))});
if(mob)await p.addInitScript(()=>{navigator.vibrate=()=>true});
await p.goto(APP);await p.waitForTimeout(900);
const ids=await p.evaluate(()=>[...document.querySelectorAll('#set-quick button, #set-links button')].map(b=>b.id).filter(Boolean));
for(const id of ids){await p.evaluate(id=>{document.getElementById('set-dlg').hidden=false;document.getElementById(id).click()},id);await p.waitForTimeout(150);
 await p.evaluate(()=>{try{cxClose()}catch(e){};['cv-dlg','io-dlg','help-dlg','new-dlg','set-dlg'].forEach(i=>{const d=document.getElementById(i);if(d)d.hidden=true});const f=document.getElementById('fs');if(f&&!f.hidden)document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));const bed=document.getElementById('bed');if(bed&&!bed.hidden)bed.querySelector('#bed-exit').click();const o=document.getElementById('sos');if(o&&!o.hidden)document.getElementById('sos-close').click();const q=document.querySelectorAll('.qh,#qh');document.body.style.overflow=''});}
for(const t of ['map','cat','combos','lore','ideas','home']){await p.evaluate(t=>{const x=[...document.querySelectorAll('#tabs button')];if(x.length)x[['home','map','cat','combos','lore','ideas'].indexOf(t)]?.click()},t);await p.waitForTimeout(150)}
console.log((mob?'mobile':'desktop'),'items',ids.length,'errors',errs.length,errs.slice(0,3));bad+=errs.length}
}finally{await b.close()}process.exit(bad?1:0)})();
