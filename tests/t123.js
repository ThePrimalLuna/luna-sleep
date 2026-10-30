/* t123: home tonight card has Play here; foundation list; next up strip renders */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c){pass++}else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await b.newPage({viewport:{width:400,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.newOptOut','1')}catch(e){}});
await p.goto(APP);await p.waitForTimeout(700);
const ev=(f,a)=>p.evaluate(f,a);const W=ms=>p.waitForTimeout(ms);
const has=sel=>ev(s=>[...document.querySelectorAll(s)].some(b=>/Play/.test(b.textContent+(b.getAttribute('aria-label')||''))),sel);
ok(await has('section.tonight .acts .btn'),'home tonight card has Play here');
ok(await has('.frow .btn'),'foundation list');
await ev(()=>{FOUND_IDS.forEach(i=>S.done[i]=true);S.tab='home';render()});await W(200);ok(await ev(()=>document.querySelectorAll('.next').length===1),'next up strip renders');
await ev(()=>{const f=Object.keys(TI).find(k=>LT.canPlayT(TI[k]));S.seq=[f];S.tab='ideas';render()});await W(200);
ok(await has('#view .btn, main .btn'),'builder row');
await ev(()=>{S.tab='bonus';S.bonusOpen=null;render()});await W(200);
ok(await has('.btn'),'bonus Velvet play (any)');
const v=await ev(()=>[...document.querySelectorAll('.btn')].filter(b=>/Play here/.test(b.textContent)).length);
ok(v>=1,'bonus play count '+v);
await ev(()=>{[...document.querySelectorAll('.btn')].find(b=>/Play here/.test(b.textContent)).click()});await W(200);
ok(await ev(()=>!document.getElementById('pdock').hidden),'bonus plays in dock');
ok(errs.length===0,'errs '+errs.join('|'));
}finally{await b.close()}console.log('t123 pass='+pass+' bad='+bad)})().catch(e=>{console.log('ERR',e.message.slice(0,300));process.exit(1)});
