/* t154: release-day clock time (9pm Mountain hold) and TLSA episode links on stories */
const APP='file://'+require('path').resolve(__dirname,'../index.html');const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c)pass++;else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const mk=async(iso)=>{const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();p.__errs=[];p.on('pageerror',e=>p.__errs.push(e.message));
 await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.newSeen','2026-11-06f');localStorage.setItem('lunaSleep.newOptOut','1')}catch(e){}});
 await p.clock.setFixedTime(new Date(iso));await p.goto(APP);await p.waitForTimeout(700);await p.evaluate(()=>{RELTIME['2026-11-06']={at:'2026-11-07T04:00:00Z',say:'9pm Mountain'};render()});await p.waitForTimeout(200);return p};
// 1. afternoon of Nov 6 Mountain (3pm MST = 22:00Z): not out yet
let p=await mk('2026-11-06T22:00:00Z');
ok(await p.evaluate(()=>released('2026-11-06')===false&&heldRel('2026-11-06')===true),'Nov 6 releases are held at 3pm Mountain');
ok(await p.evaluate(()=>released('2026-11-04')===true),'earlier dates are unaffected');
await p.evaluate(()=>{S.tab='home';render()});await p.waitForTimeout(300);
const txt=await p.evaluate(()=>document.getElementById('view').innerText);
ok(/comes out tonight at 9pm Mountain/.test(txt),'Home says it comes out tonight at 9pm Mountain');
ok(!/is out today/.test(txt),'Home does not say it is out today yet');
ok(!(await p.evaluate(()=>{const ids=Object.keys(TI).filter(i=>TI[i]&&TI[i].date==='2026-11-06');return ids.some(i=>trackStatus(i)==='ready'&&released(TI[i].date))})),'held tracks are not counted as released');
await p.context().close();
// 2. 9:30pm Mountain (04:30Z Nov 7): out
p=await mk('2026-11-07T04:30:00Z');
ok(await p.evaluate(()=>released('2026-11-06')===true&&heldRel('2026-11-06')===false),'Nov 6 releases are live at 9:30pm Mountain');
await p.context().close();
// 3. TLSA links
p=await mk('2026-11-07T10:00:00Z');
await p.evaluate(()=>{S.tab='stories';S.storyOpen=null;render()});await p.waitForTimeout(250);
ok(!(await p.evaluate(()=>/Listen to the episode/.test(document.getElementById('view').innerText))),'no episode buttons before any are linked');
await p.evaluate(()=>{TLSA_EPS['files-1']='https://example.com/ep1';TLSA_EPS['jakob']='http://insecure.example/x';render()});await p.waitForTimeout(250);
const n=await p.evaluate(()=>[...document.querySelectorAll('#view a')].filter(a=>/Listen to the episode/.test(a.textContent)).map(a=>a.href));
ok(n.length===1&&n[0]==='https://example.com/ep1','a linked story card shows its episode link, and non-https is ignored '+JSON.stringify(n));
await p.evaluate(()=>{S.storyOpen='files-1';render()});await p.waitForTimeout(250);
ok(await p.evaluate(()=>/Free podcast episode from The Luna Sleep Archives/.test(document.querySelector('.reader').innerText)&&[...document.querySelectorAll('.reader a')].some(a=>a.href==='https://example.com/ep1')),'the story page shows the episode link');
await p.evaluate(()=>{S.storyOpen=null;S.tab='archives';render()});await p.waitForTimeout(250);
const at=await p.evaluate(()=>document.getElementById('view').innerText);
ok(/Episodes/.test(at)&&/Listen to the episode/.test(at)&&!/first episode is not out yet/.test(at),'Archives page lists the episode and drops the not-out-yet line');
ok(!p.__errs.length,'no page errors '+p.__errs);
console.log('t154',pass,'pass',bad,'fail');process.exit(bad?1:0)}finally{await b.close()}})();
