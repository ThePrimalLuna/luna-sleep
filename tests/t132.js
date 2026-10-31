/* t132: report has no saved data; note included; banner shows */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c){pass++}else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const ctx=await b.newContext({viewport:{width:400,height:800}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{if(!sessionStorage.getItem('i')){sessionStorage.setItem('i','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.newOptOut','1');localStorage.setItem('otherapp.key','keep')}}catch(e){}
 window.__posts=[];let sub=null;
 const reg={pushManager:{getSubscription:async()=>sub,subscribe:async o=>{sub={endpoint:'https://fcm.googleapis.com/x/1',unsubscribe:async()=>{sub=null;return true}};return sub}}};
 Object.defineProperty(navigator,'serviceWorker',{value:{ready:Promise.resolve(reg),addEventListener(){},register:()=>Promise.resolve(reg),controller:null},configurable:true});
 window.PushManager=function(){};window.Notification={permission:'default',requestPermission:async()=>{window.Notification.permission='granted';return 'granted'}};
 const of=window.fetch;window.fetch=async(u,o)=>{u=String(u);if(u.includes('workers.dev')){window.__posts.push([u.replace(/.*dev/,''),o&&o.body]);if(u.endsWith('/vapid'))return new Response(JSON.stringify({key:'BAUXvA9m4ZlXE0dqYQ8FkF5s9nQ4m3Kx6xZc5oQ0yZpWqkGZ8WJ4WfM6l1p9h2QvZ8y3m5n7b1c4d6f8g0h2j4k6l8'}));return new Response('{"ok":true}')}return of(u,o)}});
await p.goto(APP);await p.waitForTimeout(700);
const ev=(f,a)=>p.evaluate(f,a);const W=ms=>p.waitForTimeout(ms);const btnTxt=t=>ev(x=>{const e=[...document.querySelectorAll('#cx-body button, .errbar button, #nag button')].find(y=>y.textContent===x);if(e){e.click();return true}return false},t);
// report
await ev(()=>LT.reportOpen());await W(300);
let rep=await ev(()=>document.querySelector('#cx-body textarea[readonly]').value);
ok(/Luna Sleep v62/.test(rep)&&/Errors: none seen/.test(rep),'report has version: '+rep.slice(0,60));
ok(!/lunaSleep|notes|profile/i.test(rep.replace(/Luna Sleep v62/,'')),'report has no saved data');
await ev(()=>{const t=document.getElementById('rp-note');t.value='the ring is weird';t.dispatchEvent(new Event('input'))});
ok((await ev(()=>document.querySelector('#cx-body textarea[readonly]').value)).includes('the ring is weird'),'note included');
await ev(()=>cxClose());await W(450);
// error banner
await ev(()=>{setTimeout(()=>{throw new Error('boom test')},0)});await W(300);
ok(await ev(()=>!!document.querySelector('.errbar')&&document.querySelector('.errbar').getAttribute('role')==='alert'),'banner shows');
await btnTxt('Report it');await W(300);
ok((await ev(()=>document.querySelector('#cx-body textarea[readonly]').value)).includes('boom test'),'error listed in report');
await ev(()=>cxClose());await W(450);
// quick action
await ev(()=>LT.go('count'));await W(300);ok(await ev(()=>document.getElementById('cx-body').innerText.includes('A ring closes in slowly')),'go=count');
await ev(()=>cxClose());await W(450);
// push prefs
await ev(()=>LT.pushOpen());await W(300);await btnTxt('Turn on notifications');await W(500);
ok(await ev(()=>document.getElementById('cx-body').innerText.includes('What to send')),'prefs shown');
await ev(()=>{const c=[...document.querySelectorAll('#cx-body input[type=checkbox]')];c[1].click()});await W(300);
await btnTxt('11pm to 7am');await W(300);
const last=await ev(()=>JSON.parse(window.__posts[window.__posts.length-1][1]));
ok(last.n===0&&last.r===1&&last.q[0]===23&&last.q[1]===7&&typeof last.z==='string','prefs posted '+JSON.stringify(last));
await ev(()=>cxClose());await W(450);
// nag text
await ev(()=>{S.done={};for(let i=0;i<6;i++)S.done['x'+i]=true;S.lastBackup=0;S.nagSnooze=0;render()});await W(200);
ok(await ev(()=>!document.getElementById('nag').hidden&&/on this phone only/.test(document.getElementById('nag').innerText)),'nag shows');
await btnTxt('Remind me in a week');
await W(200);ok(await ev(()=>{const x=document.getElementById('nag');return x.hidden}),'nag snoozed');
ok(await ev(()=>JSON.parse(localStorage.getItem('lunaNeuroMap.v2')).nagSnooze>0),'snooze saved');
// wipe
await ev(()=>localStorage.setItem('lunaNeuroMap.album','Dusk'));
await ev(()=>LT.wipeOpen());await W(300);
ok(await ev(()=>[...document.querySelectorAll('#cx-body button')].find(x=>x.textContent==='Delete everything').disabled),'wipe disabled until ticked');
await ev(()=>document.querySelector('#cx-body input[type=checkbox]').click());await W(100);
await Promise.all([p.waitForNavigation({timeout:5000}).catch(()=>{}),btnTxt('Delete everything')]);await W(800);
const left=await ev(()=>Object.keys(localStorage).filter(k=>/^lunaSleep|^lunaNeuroMap/.test(k)));
ok(await ev(()=>localStorage.getItem('otherapp.key')==='keep'),'other app key kept');
ok(await ev(()=>!localStorage.getItem('lunaNeuroMap.album')),'theme reset by wipe');
ok(!left.includes('lunaSleep.push')&&!left.includes('lunaSleep.mixes'),'own keys gone: '+left.join());
console.log('pass',pass,'bad',bad,'pageerrors',errs.filter(e=>!/boom test/.test(e)).join('|'));
}catch(e){console.log('ERR',e.message)}await b.close()})();
