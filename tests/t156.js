const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:420,height:860}});let f=0;const ok=(c,m)=>{if(!c){f++;console.log('FAIL',m)}};const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.newSeen','2026-11-08')}catch(e){}});
await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(400);
ok(await p.evaluate(()=>[...document.querySelectorAll('#theme-sel option')].some(o=>o.value==='Montana'&&/Montana/.test(o.textContent))),'picker lists Montana');
ok(!(await p.$('#mtnfx')),'no scene before choosing');
await p.evaluate(()=>{const s=document.getElementById('theme-sel');s.value='Montana';s.onchange()});await p.waitForTimeout(300);
ok(await p.evaluate(()=>document.documentElement.dataset.skin==='Montana'&&!!document.getElementById('mtnfx')&&document.getElementById('mtnfx').children.length>20),'scene built');
const st=await p.evaluate(()=>{const f=document.getElementById('mtnfx'),c=getComputedStyle(f),s=document.querySelector('.sosfab');return{pe:c.pointerEvents,z:c.zIndex,sos:s&&getComputedStyle(s).zIndex}});
ok(st.pe==='none'&&st.z==='-1','scene is behind and click-through '+JSON.stringify(st));
ok(await p.evaluate(()=>!!document.querySelector('.sosfab')&&getComputedStyle(document.querySelector('.sosfab')).display!=='none'),'Emergency Exit still shown');
ok((await p.evaluate(()=>localStorage.getItem('lunaNeuroMap.album')))==='Montana','choice saved');
await p.reload();await p.waitForTimeout(400);ok(!!(await p.$('#mtnfx')),'scene survives reload');
await p.evaluate(()=>document.documentElement.classList.add('calm'));
ok(await p.evaluate(()=>getComputedStyle(document.querySelector('#mtnfx .ff')).display==='none'),'calm hides fireflies');
await p.evaluate(()=>{const s=document.getElementById('theme-sel');s.value='Blue';s.onchange()});await p.waitForTimeout(200);
ok(!(await p.$('#mtnfx')),'scene removed when theme changes');
ok(!errs.length,'no page errors '+errs.join(';'));
ok(await p.evaluate(()=>{const h=(ALLR.find(x=>x.id==='whats-new-history')||{}).body||'';return !/montana/i.test(h)&&!/montana/i.test(JSON.stringify(typeof LOG!=='undefined'?LOG:''))}),'Montana not in What\'s new');
await b.close();console.log(f?'t156 FAILED':'t156 ok');process.exit(f?1:0)})()
