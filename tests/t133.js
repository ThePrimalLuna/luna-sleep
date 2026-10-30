/* t133: seeded quietly; 3 counted; undo/redo not double counted */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c){pass++}else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await b.newPage({viewport:{width:400,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{if(!sessionStorage.getItem('i')){sessionStorage.setItem('i','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.newOptOut','1')}}catch(e){}});
await p.goto(APP);await p.waitForTimeout(700);
const ev=(f,a)=>p.evaluate(f,a);const W=ms=>p.waitForTimeout(ms);
// activity log: first run seeds quietly
ok(await ev(()=>{const a=JSON.parse(localStorage.getItem('lunaSleep.act')||'null');return a&&Array.isArray(a.h)&&Object.keys(a.d).length===0}),'seeded quietly');
const ids=await ev(()=>Object.keys(TI).filter(i=>!hardT(TI[i])).slice(0,3));
await ev(i=>{i.forEach(x=>S.done[x]=true);save();render()},ids);await W(200);
ok(await ev(()=>Object.values(JSON.parse(localStorage.getItem('lunaSleep.act')).d)[0].h)===3,'3 counted');
await ev(i=>{delete S.done[i[0]];render();S.done[i[0]]=true;render()},ids);
ok(await ev(()=>Object.values(JSON.parse(localStorage.getItem('lunaSleep.act')).d)[0].h)===3,'undo/redo not double counted');
await ev(()=>{flag('rd_files-1');render()});await W(100);
ok(await ev(()=>Object.values(JSON.parse(localStorage.getItem('lunaSleep.act')).d)[0].r)===1,'story counted');
// backup includes act
const bk=await ev(()=>LT.backupStores());ok(bk.act&&bk.act.h.length>=3,'backup has act');
// week recap
await ev(()=>recapOpen());await W(300);
await ev(()=>{[...document.querySelectorAll('#cx-body button')].find(x=>x.textContent==='This week').click()});await W(200);
ok(await ev(()=>/This week: 3 tracks marked heard, 1 stories finished/.test(document.querySelector('#cx-body canvas').getAttribute('aria-label'))),'week canvas label: '+await ev(()=>document.querySelector('#cx-body canvas').getAttribute('aria-label')));
await ev(()=>{[...document.querySelectorAll('#cx-body button')].find(x=>x.textContent==='So far').click()});await W(200);
ok(await ev(()=>/Recap:/.test(document.querySelector('#cx-body canvas').getAttribute('aria-label'))),'back to all time');
await ev(()=>cxClose());await W(450);
// reader options persist
await ev(()=>{S.tab='stories';S.storyOpen='files-1';render()});await W(300);
await ev(()=>{[...document.querySelectorAll('.rdbar button')].find(x=>x.textContent==='Font: Serif').click()});await W(200);
ok(await ev(()=>document.querySelector('.reader').dataset.rf==='easy'&&!!document.getElementById('rd-easyfont')),'easy font on');
await ev(()=>{[...document.querySelectorAll('.rdbar button')].find(x=>/Spacing: Normal/.test(x.textContent)).click()});await W(200);
ok(await ev(()=>document.querySelector('.reader').dataset.rl==='1'),'roomy spacing');
ok(await ev(()=>{const s=JSON.parse(localStorage.getItem('lunaNeuroMap.v2'));return s.rdFont==='easy'&&s.rdLs===1}),'reader prefs saved');
ok(await ev(()=>parseFloat(getComputedStyle(document.querySelector('.reader')).lineHeight)/parseFloat(getComputedStyle(document.querySelector('.reader')).fontSize)>1.9),'line height applied');
ok(errs.length===0,'errs '+errs.join('|'));
console.log('pass',pass,'bad',bad);
}catch(e){console.log('ERR',e.message)}await b.close()})();
