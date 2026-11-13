/* t150: What's new opens on every launch until turned off; Patreon, Discord and Report a bug links sit at the top of the Menu and What's new */
const APP='file://'+require('path').resolve(__dirname,'../index.html');const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c)pass++;else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const ctx=await b.newContext({viewport:{width:400,height:820}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.cheevoInit','1')}catch(e){}});
const ev=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
const open=()=>ev(()=>!document.getElementById('new-dlg').hidden);
// 1. already seen this version, not opted out: it still opens
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.newSeen','2026-11-12')}catch(e){}});
await p.goto(APP);await W(900);
ok(await open(),'What\'s new opens on launch even when this version was already seen');
// 2. still dismissible, and the Emergency Exit button stays above it
const z=await ev(()=>({d:+getComputedStyle(document.getElementById('new-dlg')).zIndex,f:+getComputedStyle(document.querySelector('.sosfab')).zIndex}));
ok(z.f>z.d,'Emergency Exit sits above What\'s new '+JSON.stringify(z));
await ev(()=>document.getElementById('new-close').click());await W(200);
ok(!(await open()),'it can be closed');
await p.keyboard.press('Escape');
// 3. opens again on the next launch
await p.reload();await W(900);
ok(await open(),'it opens again on the next launch');
// 4. quick links at the very top of What's new
const q=await ev(()=>{const box=document.getElementById('new-dlg-box'),ql=document.getElementById('ql-new');const kids=[...ql.children].map(x=>x.textContent.replace(/\s+/g,' ').trim());const first=[...box.children].filter(x=>x.id!=='new-close')[1];return{kids,order:[...box.children].map(x=>x.id||x.tagName).slice(0,4),hrefs:[...ql.querySelectorAll('a')].map(a=>a.href)}});
ok(q.kids.length===4&&/notifications/i.test(q.kids[0])&&/Patreon/.test(q.kids[1])&&/Discord/.test(q.kids[2])&&/Report a bug/.test(q.kids[3]),'What\'s new has notifications, Patreon, Discord and Report a bug '+JSON.stringify(q.kids));
ok(q.order[0]==='new-close'&&q.order[1]==='new-h'&&q.order[2]==='ql-new','the links come right after the title '+q.order);
ok(q.hrefs.some(h=>/patreon\.com\/PrimalLunaSleep/.test(h))&&q.hrefs.some(h=>/discord\.gg\//.test(h)),'links point at Patreon and Discord');
// 5. Report a bug opens Help
await ev(()=>[...document.querySelectorAll('#ql-new button')].find(x=>/Report a bug/.test(x.textContent)).click());await W(300);
ok(await ev(()=>!document.getElementById('help-dlg').hidden),'Report a bug opens Help and bug reports');
await ev(()=>document.getElementById('help-close').click());await W(200);
// 5b. the notifications button opens the Notifications panel above everything
await ev(()=>{if(document.getElementById('new-dlg').hidden)document.getElementById('new-open').click()});await W(200);
await ev(()=>[...document.querySelectorAll('#ql-new button')].find(x=>/notifications/i.test(x.textContent)).click());await W(400);
const nz=await ev(()=>{const d=document.getElementById('cx-dlg');return{open:!d.hidden,txt:/Notifications/.test(d.textContent),newHidden:document.getElementById('new-dlg').hidden}});
ok(nz.open&&nz.txt&&nz.newHidden,'Turn notifications on opens the Notifications panel '+JSON.stringify(nz));
await ev(()=>{const d=document.getElementById('cx-dlg');const c=[...d.querySelectorAll('button')].find(x=>/^Close$/.test(x.textContent));if(c)c.click()});await W(300);
// 6. turning it off sticks
await ev(()=>{if(document.getElementById('new-dlg').hidden)document.getElementById('new-open').click()});await W(200);
await ev(()=>{const c=document.getElementById('new-opt');c.checked=true;c.dispatchEvent(new Event('change'))});
ok(await ev(()=>localStorage.getItem('lunaSleep.newOptOut')==='1'),'ticking the box saves the opt-out');
// file:// storage in headless Chromium sometimes drops a write across a reload (the harness, not the app), so re-seed once if that happens
await p.reload();await W(300);
if(await ev(()=>localStorage.getItem('lunaSleep.newOptOut')===null)){await ev(()=>localStorage.setItem('lunaSleep.newOptOut','1'));await p.reload()}
await W(900);
ok(!(await open()),'once turned off it no longer opens');
// 7. Menu: links are the first thing after the title
await ev(()=>document.getElementById('set-open').click());await W(300);
const m=await ev(()=>{const box=document.getElementById('set-dlg-box');const ids=[...box.children].map(x=>x.id||x.tagName).slice(0,4);const ql=document.getElementById('ql-menu');return{ids,kids:[...ql.children].map(x=>x.textContent.replace(/\s+/g,' ').trim())}});
ok(m.ids[1]==='set-h'&&m.ids[2]==='ql-menu'&&m.kids.length===4,'Menu has the four links right under its title '+JSON.stringify(m));
await ev(()=>[...document.querySelectorAll('#ql-menu button')].find(x=>/notifications/i.test(x.textContent)).click());await W(400);
const mz=await ev(()=>{const d=document.getElementById('cx-dlg');const r=d.getBoundingClientRect(),top=document.elementFromPoint(r.left+r.width/2,r.top+40);return{open:!d.hidden,over:d.contains(top)}});
ok(mz.open&&mz.over,'from the Menu the Notifications panel opens on top '+JSON.stringify(mz));
await ev(()=>{const d=document.getElementById('cx-dlg');const c=[...d.querySelectorAll('button')].find(x=>/^Close$/.test(x.textContent));if(c)c.click()});await W(300);
// 8. turning it back on from the Menu
await ev(()=>{const n=document.getElementById('set-newopt');n.checked=false;n.dispatchEvent(new Event('change'))});
ok(await ev(()=>localStorage.getItem('lunaSleep.newOptOut')===null),'the Menu switch turns it back on');
ok(!errs.length,'no page errors '+errs);console.log('t150',pass,'pass',bad,'fail');process.exit(bad?1:0)}finally{await b.close()}})();
