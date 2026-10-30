/* t122: backup has stimer; last/filt/nm not backed up; restore stimer */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c){pass++}else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await b.newPage({viewport:{width:400,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.newOptOut','1')}catch(e){}});
await p.goto(APP);await p.waitForTimeout(700);
const ev=(f,a)=>p.evaluate(f,a);
await ev(()=>localStorage.setItem('lunaSleep.stimer','{"min":45}'));
const bk=await ev(()=>JSON.parse(backup()));
ok(bk.ls&&bk.ls.stimer&&bk.ls.stimer.min===45,'backup has stimer');
ok(!JSON.stringify(bk).includes('lunaSleep.last')&&!bk.ls.last&&!bk.ls.filt&&!bk.ls.nm,'last/filt/nm not backed up');
await ev(()=>localStorage.removeItem('lunaSleep.stimer'));
await ev(o=>LT.restoreStores(o),{stimer:{min:30}});
ok(await ev(()=>JSON.parse(localStorage.getItem('lunaSleep.stimer')).min===30),'restore stimer');
await ev(o=>LT.restoreStores(o),{stimer:{min:7}});
ok(await ev(()=>JSON.parse(localStorage.getItem('lunaSleep.stimer')).min===30),'bad stimer ignored');
await ev(o=>LT.restoreStores(o),{stimer:'x'});
ok(await ev(()=>JSON.parse(localStorage.getItem('lunaSleep.stimer')).min===30),'junk stimer ignored');
// kid dialog Esc returns to menu
await ev(()=>document.getElementById('set-open').click());
await ev(()=>{document.getElementById('set-links').open=true;document.getElementById('io-open').click()});await p.waitForTimeout(200);
ok(await ev(()=>!document.getElementById('io-dlg').hidden&&document.getElementById('set-dlg').hidden),'io open');
await p.keyboard.press('Escape');await p.waitForTimeout(300);
ok(await ev(()=>document.getElementById('io-dlg').hidden&&!document.getElementById('set-dlg').hidden),'Esc returns to menu from io');
// Esc with menu only closes menu
await p.keyboard.press('Escape');await p.waitForTimeout(200);
ok(await ev(()=>document.getElementById('set-dlg').hidden),'Esc closes menu');
// nothing reopens
await p.waitForTimeout(300);
ok(await ev(()=>document.getElementById('set-dlg').hidden),'stays closed');
// dock minimized keeps bar height
await ev(()=>{const t=Object.values(TI).find(t=>LT.canPlayT(t));LT.dockPlay(t)});await p.waitForTimeout(200);
await ev(()=>document.querySelector('#pdock .pdmin').click());await p.waitForTimeout(500);
const vis=await ev(()=>{const r=document.getElementById('pdock').getBoundingClientRect();return innerHeight-r.top});
ok(vis>=50&&vis<=100,'minimized visible height '+vis);
ok(errs.length===0,'errs '+errs.join('|'));
}finally{await b.close()}console.log('t122 pass='+pass+' bad='+bad)})().catch(e=>{console.log('ERR',e.message.slice(0,300));process.exit(1)});
