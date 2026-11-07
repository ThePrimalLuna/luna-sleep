/* t151: Library track cards have a heard tick (Blue and the rest, not just the Foundation) */
const APP='file://'+require('path').resolve(__dirname,'../index.html');const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c)pass++;else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const ctx=await b.newContext({viewport:{width:400,height:820}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.newSeen','2026-11-06e');localStorage.setItem('lunaSleep.newOptOut','1')}catch(e){}});
const ev=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
await p.goto(APP);await W(700);
await ev(()=>{S.done={};S.tab='cat';S.path=S.path||'Full';save();render()});await W(200);
// 1. Foundation not finished: Blue cards show no tick (they are locked), Foundation cards do
await ev(()=>{F.col='';F.q='';F.pils=[];F.shown=500;render()});await W(200);
const a=await ev(()=>{const cards=[...document.querySelectorAll('.card')];const has=id=>{const c=cards.find(x=>x.querySelector('.open .mono')&&x.querySelector('.open .mono').textContent===id);return c?!!c.querySelector('.tcheck'):null};return{found:has(FOUND_IDS[0]),blue:has('B-01')}});
ok(a.found===true,'Foundation card has a tick '+JSON.stringify(a));
ok(a.blue===false||a.blue===null,'locked Blue card has no tick before the Foundation is done '+JSON.stringify(a));
// 2. Foundation done: Blue gets a tick and it marks heard, then undoes
await ev(()=>{FOUND_IDS.forEach(i=>S.done[i]=true);save();render()});await W(300);
const blueId=await ev(()=>{const t=Object.keys(TI).find(i=>/^B-\d\d$/.test(i)&&!S.done[i]);return t});
ok(!!blueId,'a Blue track exists');
const sel=(id)=>`.card:has(.open .mono:text-is("${id}")) .tcheck`;
ok(await p.locator(sel(blueId)).count()===1,'Blue card now has a tick');
await p.locator(sel(blueId)).first().click();await W(250);
ok(await ev(id=>!!S.done[id],blueId),'ticking marks the track heard');
ok(await p.locator(sel(blueId)).first().getAttribute('aria-checked')==='true','tick shows checked');
ok(await ev(id=>!document.getElementById('side')||document.getElementById('side').hidden||S.sel!==id,blueId),'ticking does not open the track');
await ev(()=>{const d=document.getElementById('cx-dlg');if(d&&!d.hidden){const c=[...d.querySelectorAll('button')].find(x=>/^(Close|Done|Not now)/.test(x.textContent.trim()));if(c)c.click();else document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape'}))}});await W(300);
await p.locator(sel(blueId)).first().click();await W(250);
ok(!(await ev(id=>!!S.done[id],blueId)),'tapping again undoes it');
ok(!errs.length,'no page errors '+errs);console.log('t151',pass,'pass',bad,'fail');process.exit(bad?1:0)}finally{await b.close()}})();
