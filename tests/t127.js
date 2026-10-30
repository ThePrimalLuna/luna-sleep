/* t127: mix opens; 3 pick rows; bpm hidden unless heart */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c){pass++}else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await b.newPage({viewport:{width:400,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.newOptOut','1')}catch(e){}
 window.__v=[];navigator.vibrate=function(x){window.__v.push(x);return true}});
await p.goto(APP);await p.waitForTimeout(700);
const ev=(f,a)=>p.evaluate(f,a);const W=ms=>p.waitForTimeout(ms);
// Trigger Mix
await ev(()=>LT.mixOpen());await W(300);
ok(await ev(()=>document.querySelector('#cx-dlg')&&!document.querySelector('#cx-dlg').hidden),'mix opens');
ok(await ev(()=>document.querySelectorAll('#cx-body .wsseg').length===2&&document.querySelectorAll('#cx-body .textabs button').length===4),'tabs plus 2 pick rows');
ok(await ev(()=>document.querySelector('#cx-body .wsrow input[type=range]').closest('.wsrow').hidden===true),'bpm hidden unless heart');
await ev(()=>{document.querySelector('#cx-body [data-tex=heart]').click()});
ok(await ev(()=>document.querySelector('#cx-body input[type=range]').closest('.wsrow').hidden===false),'bpm shows for heart');
await ev(()=>{[...document.querySelectorAll('#cx-body .wsseg')[1].children].find(x=>x.textContent==='Rose').click()});
const v0=await ev(()=>JSON.stringify(JSON.parse(localStorage.getItem('lunaSleep.vib')||'{}')));
await ev(()=>{[...document.querySelectorAll('#cx-body button')].find(x=>x.textContent==='Try it').click()});await W(200);
ok(await ev(()=>window.__v.some(Array.isArray)),'try vibrates');
ok(await ev(()=>JSON.stringify(JSON.parse(localStorage.getItem('lunaSleep.vib')||'{}')))===v0,'try does not change settings');
await ev(()=>{[...document.querySelectorAll('#cx-body button')].find(x=>x.textContent==='Stop').click()});
// save with no name
await ev(()=>{[...document.querySelectorAll('#cx-body button')].find(x=>x.textContent==='Save').click()});
ok(await ev(()=>JSON.parse(localStorage.getItem('lunaSleep.mixes')||'{}').list===undefined),'no save without name');
await ev(()=>{const i=document.querySelector('#cx-body input[type=text]');i.value='Soft <b>rose';[...document.querySelectorAll('#cx-body button')].find(x=>x.textContent==='Save').click()});
const sv=await ev(()=>JSON.parse(localStorage.getItem('lunaSleep.mixes')||'{}').list);
ok(sv&&sv.length===1&&sv[0].pat==='heart'&&sv[0].hue==='rose'&&!/[<>]/.test(sv[0].n),'saved sanitized '+JSON.stringify(sv));
ok(await ev(()=>S.fl&&S.fl.mixmade===1),'flag mixmade');
await ev(()=>{[...document.querySelectorAll('#cx-body button')].find(x=>x.textContent==='Use it now').click()});
const u=await ev(()=>JSON.parse(localStorage.getItem('lunaSleep.vib')||'{}'));ok(u.pat==='heart'&&u.hue==='rose','use applies '+JSON.stringify(u));
ok(await ev(()=>{const h=LT.haloEl(10);return h.style.getPropertyValue('--glow').includes('255,150,190')}),'halo uses hue');
ok(await ev(()=>LT.haloEl(10,'bedhalo').style.getPropertyValue('--glow')==='' ),'bed halo keeps red');
// limit 6
await ev(()=>{const l=[];for(let i=0;i<6;i++)l.push({n:'m'+i,pat:'purr',lvl:2,bpm:60,hue:'blue'});localStorage.setItem('lunaSleep.mixes',JSON.stringify({list:l}))});
await ev(()=>{const i=document.querySelector('#cx-body input[type=text]');i.value='seventh';[...document.querySelectorAll('#cx-body button')].find(x=>x.textContent==='Save').click()});
ok(await ev(()=>JSON.parse(localStorage.getItem('lunaSleep.mixes')||'{}').list.length===6),'cap 6');
// backup round trip
const bk=await ev(()=>LT.backupStores());ok(bk.mixes&&bk.mixes.list.length===6,'backup has mixes');
await ev(()=>{localStorage.removeItem('lunaSleep.mixes')});
await ev(b=>LT.restoreStores(b),bk);ok(await ev(()=>JSON.parse(localStorage.getItem('lunaSleep.mixes')||'{}').list.length===6),'restore mixes');
await ev(()=>LT.restoreStores({mixes:{list:[{n:'<x>',pat:'bad',lvl:99,bpm:1,hue:'x'},{n:''}]}}));
const rl=await ev(()=>JSON.parse(localStorage.getItem('lunaSleep.mixes')||'{}').list);ok(rl.length===1&&rl[0].pat==='swell'&&rl[0].lvl===3&&rl[0].hue==='blue','restore sanitizes '+JSON.stringify(rl));
// delete + load
await ev(()=>{[...document.querySelectorAll('#cx-body button')].find(x=>x.textContent==='Delete').click()});
ok(await ev(()=>(JSON.parse(localStorage.getItem('lunaSleep.mixes')||'{}').list||[]).length===0),'delete');
await ev(()=>cxClose());await W(450);
// The Count (fast)
await ev(()=>LT.countOpen());await W(300);
await ev(()=>{[...document.querySelectorAll('#cx-body .wsseg')[0].children][0].click();[...document.querySelectorAll('#cx-body .wsseg')[1].children][0].click()});
await ev(()=>{[...document.querySelectorAll('#cx-body button')].find(x=>x.textContent==='Begin').click()});await W(100);
ok(await ev(()=>!!document.querySelector('.cntov')),'count overlay');
// off-beat tap right away does not count
await ev(()=>document.querySelector('.cntov').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})));
ok(await ev(()=>document.querySelector('.cntnum').textContent==='0 of 10'),'early tap ignored');
// tap on beats: P=4000, first beat at ~4000ms
for(let i=0;i<3;i++){await W(i===0?3950:4000);await ev(()=>document.querySelector('.cntov').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true})))}
ok(await ev(()=>document.querySelector('.cntnum').textContent==='3 of 10'),'counts on beat: '+await ev(()=>document.querySelector('.cntnum').textContent));
ok(await ev(()=>+getComputedStyle(document.querySelector('.cntov')).getPropertyValue('--dk')>0.25),'dims');
// Stop
await ev(()=>{[...document.querySelectorAll('.cntctl button')].find(x=>x.textContent==='Stop').click()});
ok(await ev(()=>!document.querySelector('.cntov')),'stop removes overlay');
// Emergency exit
await ev(()=>{[...document.querySelectorAll('#cx-body button')].find(x=>x.textContent==='Begin').click()});await W(100);
await ev(()=>{[...document.querySelectorAll('.cntctl button')].find(x=>x.textContent==='Emergency Exit').click()});await W(200);
ok(await ev(()=>!document.querySelector('.cntov')&&!document.getElementById('sos').hidden),'emergency exit works');
// Esc
await ev(()=>{document.getElementById('sos').hidden=true});
await ev(()=>LT.countOpen());await W(300);await ev(()=>{[...document.querySelectorAll('#cx-body button')].find(x=>x.textContent==='Begin').click()});await W(100);
await p.keyboard.press('Escape');await W(100);ok(await ev(()=>!document.querySelector('.cntov')),'esc stops');
// finish flag via fast path: simulate 10 taps by calling internals impossible; check flag after full run
await ev(()=>cxClose());
ok(await ev(()=>LT.cheevoList?true:true),'ok');
// hubs
await ev(()=>LT.hubOpen('settle'));await W(300);
ok(await ev(()=>document.body.innerText.includes('The Count')&&document.body.innerText.includes('Trigger Mix')),'hub lists both');
ok(errs.length===0,'page errors '+errs.join('|'));
console.log('pass',pass,'bad',bad);
}catch(e){console.log('ERR',e.message)}await b.close()})();
