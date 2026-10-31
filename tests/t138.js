/* t138: new-track notification nudge (once, never again after an answer) and the At a glance strip */
const APP='file://'+require('path').resolve(__dirname,'../index.html');const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c)pass++;else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await (await b.newContext({viewport:{width:400,height:820}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{if(!sessionStorage.getItem('i')){sessionStorage.setItem('i','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.denAck','1')}}catch(e){}
 window.__perm='default';try{Object.defineProperty(Notification,'permission',{configurable:true,get:()=>window.__perm})}catch(e){}
 try{if(!('PushManager' in window))window.PushManager=function(){}}catch(e){}});
await p.goto(APP);await p.waitForTimeout(800);const ev=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
const ids=await ev(()=>Object.keys(TI).filter(i=>!hardT(TI[i])&&!gated(TI[i])));
ok(ids.length>3,'have ungated tracks');
// no nudge before any track is heard
await ev(()=>{S.done={};S.pushAsk=0;S.fl=S.fl||{};render()});await W(150);
ok(await ev(()=>document.getElementById('nag').hidden),'no nudge before first heard track');
// after first heard track it appears
await ev(i=>{S.done[i]=true;save();render()},ids[0]);await W(200);
let t=await ev(()=>({h:document.getElementById('nag').hidden,x:document.getElementById('nag').innerText}));
ok(!t.h&&/new track/i.test(t.x),'nudge shows after first heard track: '+t.x.slice(0,60));
// No thanks: gone and stays gone after reload
await ev(()=>{[...document.querySelectorAll('#nag button')].find(b=>/no thanks/i.test(b.textContent)).click()});await W(200);
ok(await ev(()=>document.getElementById('nag').hidden),'hidden after No thanks');
await p.reload();await W(700);ok(await ev(()=>document.getElementById('nag').hidden&&S.pushAsk>0),'stays gone after reload');
// denied permission: never offered
await ev(()=>{window.__perm='denied';S.pushAsk=0;S.done['x']=true;render()});await W(150);
ok(await ev(()=>document.getElementById('nag').hidden),'not offered when browser said no');
// backup nag has priority and they do not stack
await ev(()=>{window.__perm='default';S.pushAsk=0;S.done={};for(let i=0;i<6;i++)S.done['x'+i]=true;S.lastBackup=0;S.nagSnooze=0;render()});await W(150);
ok(await ev(()=>/back/i.test(document.getElementById('nag').innerText)),'backup nag wins');
// pushAsk is saved, in backup
await ev(()=>{S.pushAsk=123;save()});
ok(await ev(()=>JSON.parse(localStorage.getItem(KEY)).pushAsk===123),'pushAsk persisted');
// strip
await ev(i=>{S.pushAsk=1;openTrack(i)},ids[0]);await W(250);
const st=await ev(()=>{const e=document.querySelector('#side .expect');return e?{n:e.querySelectorAll('li').length,x:e.innerText}:null});
ok(st&&st.n>=2&&/At a glance/i.test(st.x),'strip on track page: '+JSON.stringify(st).slice(0,160));
ok(st&&/HUMAN or AWAKE/.test(st.x),'safe word line present');
ok(st&&!/undefined|NaN|null/.test(st.x),'no junk values');
ok(!errs.length,'no page errors '+errs);
console.log('t138',pass,'pass',bad,'fail');process.exit(bad?1:0)}finally{await b.close()}})();
