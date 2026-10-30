/* t117: top icons; settings before help; settings opens */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c){pass++}else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await b.newPage({viewport:{width:400,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.cheevoInit','1')}catch(e){}});
await p.goto(APP);await p.waitForTimeout(800);
const ev=(f,a)=>p.evaluate(f,a);
await ev(()=>document.getElementById('set-open').click());
ok(await ev(()=>['set-settings','set-links'].every(i=>document.getElementById(i)&&document.getElementById(i).querySelector(':scope>summary .ic'))),'top icons');
ok(await ev(()=>document.getElementById('set-settings').compareDocumentPosition(document.getElementById('set-links'))&4),'settings before help');
await ev(()=>document.querySelector('#set-settings>summary').click());ok(await ev(()=>document.getElementById('set-settings').open),'settings opens');
await ev(()=>document.querySelector('#set-links>summary').click());ok(await ev(()=>document.getElementById('set-links').open&&!document.getElementById('set-settings').open),'exclusive');
const st=await ev(()=>['pat-link','dc-link','kofi-link','throne-link'].map(i=>{const c=getComputedStyle(document.getElementById(i));return c.textDecorationLine+'|'+c.display+'|'+c.borderTopWidth}));
ok(st.every(x=>/^none\|flex\|1px/.test(x)),'link styling '+st);
ok(await ev(()=>/Haptics$/.test(document.getElementById('hx-open').textContent.trim())&&/Calendar$/.test(document.getElementById('cal-open').textContent.trim())),'labels');
// rows open their targets
for(const [id,chk] of [['faq-open',()=>!document.getElementById('set-dlg').hidden===false],['help-open',()=>!document.getElementById('help-dlg').hidden],['about-open',()=>true]]){
 await ev(()=>{const m=document.getElementById('set-dlg');if(m.hidden)document.getElementById('set-open').click();document.getElementById('set-links').open=true});
 await ev(i=>document.getElementById(i).click(),id);await p.waitForTimeout(250);
 ok(await ev(()=>document.getElementById('set-dlg').hidden),id+' closes menu');
 await ev(()=>{document.querySelectorAll('.sos:not([hidden]) .sosx,#help-close,#new-close').forEach(x=>{try{x.click()}catch(e){}});const d=document.getElementById('den');if(d&&!d.hidden)document.getElementById('den-close')&&document.getElementById('den-close').click()});
 await p.waitForTimeout(150)}
ok(await ev(()=>{const t=document.getElementById('help-dlg-box').textContent;return /Play here/.test(t)}),'help text updated');
ok(errs.length===0,'errs '+errs.join('|'));
}finally{await b.close()}console.log('t117 pass='+pass+' bad='+bad)})().catch(e=>{console.log('ERR',e.message.slice(0,300));process.exit(1)});
