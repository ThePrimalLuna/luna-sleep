/* t113: starts normal; second tap opens exit; untucks */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c){pass++}else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const ctx=await b.newContext({viewport:{width:400,height:820},hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{}catch(e){}});
await p.goto(APP);await p.waitForTimeout(900);
const ev=(f,a)=>p.evaluate(f,a);
const st=()=>ev(()=>({tucked:document.getElementById('sos-open').classList.contains('tucked'),sos:!document.getElementById('sos').hidden,panic:getComputedStyle(document.getElementById('panic')).display}));
ok(!(await st()).tucked,'starts normal');
await ev(()=>{const c=document.getElementById('set-tuck');c.checked=true;c.dispatchEvent(new Event('change'))});
ok((await st()).tucked,'tucks');
const w=await ev(()=>document.getElementById('sos-open').getBoundingClientRect().width);ok(w<40,'tab narrow '+w);
await ev(()=>document.getElementById('sos-open').click());let s=await st();ok(!s.tucked&&!s.sos,'first tap peeks, no exit '+JSON.stringify(s));
await ev(()=>document.getElementById('sos-open').click());s=await st();ok(s.sos,'second tap opens exit');
await ev(()=>document.getElementById('sos-close').click());
await ev(()=>{const c=document.getElementById('set-tuck');c.checked=false;c.dispatchEvent(new Event('change'))});ok(!(await st()).tucked,'untucks');
// panic
await ev(()=>{const c=document.getElementById('set-showpanic');c.checked=false;c.dispatchEvent(new Event('change'))});ok((await st()).panic==='none','panic hidden');
await ev(()=>{const c=document.getElementById('set-showpanic');c.checked=true;c.dispatchEvent(new Event('change'))});ok((await st()).panic!=='none','panic shown');
// bed dark auto
await ev(()=>LT.bedOpen());await ev(()=>{document.getElementById('bed').dataset.lv='3'});await p.waitForTimeout(100);ok((await st()).tucked,'dark bed tucks');
await ev(()=>{document.getElementById('bed').dataset.lv='0'});await p.waitForTimeout(100);ok(!(await st()).tucked,'bed lit untucks');
// persisted
{const p2=await ctx.newPage();await p2.addInitScript(()=>{try{localStorage.setItem('lunaSleep.sosTuck','1')}catch(e){}});await p2.goto(APP);await p2.waitForTimeout(800);ok(await p2.evaluate(()=>document.getElementById('sos-open').classList.contains('tucked')&&document.getElementById('set-tuck').checked),'saved setting applies on load')}
ok(errs.length===0,'errs '+errs.join('|'));
}finally{await b.close()}console.log('t113 pass='+pass+' bad='+bad)})().catch(e=>{console.log('ERR',e.message.slice(0,300));process.exit(1)});
