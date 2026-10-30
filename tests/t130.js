/* t130: hub item; starts off; flag push */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c){pass++}else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await b.newPage({viewport:{width:400,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.newOptOut','1')}catch(e){}
 window.__calls=[];let sub=null;
 const reg={pushManager:{getSubscription:async()=>sub,subscribe:async o=>{window.__key=o.applicationServerKey.length;sub={endpoint:'https://fcm.googleapis.com/x/1',unsubscribe:async()=>{sub=null;return true}};return sub}}};
 Object.defineProperty(navigator,'serviceWorker',{value:{ready:Promise.resolve(reg),addEventListener(){},register:()=>Promise.resolve(reg),controller:null},configurable:true});
 window.PushManager=function(){};
 window.Notification={permission:'default',requestPermission:async()=>{window.Notification.permission='granted';return 'granted'}};
 const of=window.fetch;window.fetch=async(u,o)=>{u=String(u);if(u.includes('workers.dev')){window.__calls.push(u.replace(/.*dev/,''));if(u.endsWith('/vapid'))return new Response(JSON.stringify({key:'BAUXvA9m4ZlXE0dqYQ8FkF5s9nQ4m3Kx6xZc5oQ0yZpWqkGZ8WJ4WfM6l1p9h2QvZ8y3m5n7b1c4d6f8g0h2j4k6l8'}));return new Response('{"ok":true}')}return of(u,o)}});
await p.goto(APP);await p.waitForTimeout(700);
const ev=f=>p.evaluate(f);const W=ms=>p.waitForTimeout(ms);
await ev(()=>LT.hubOpen('device'));await W(300);
ok(await ev(()=>document.getElementById('cx-body').innerText.includes('Notifications')),'hub item');
await ev(()=>LT.pushOpen());await W(300);
ok(await ev(()=>document.getElementById('cx-body').innerText.includes('Off.')),'starts off');
await ev(()=>{[...document.querySelectorAll('#cx-body button')].find(x=>x.textContent==='Turn on notifications').click()});await W(500);
ok(await ev(()=>document.getElementById('cx-body').innerText.includes('On. You will get')),'turns on: '+await ev(()=>document.querySelector('#cx-body .note[role=status]').textContent));
ok(await ev(()=>window.__calls.join()===['/vapid','/subscribe'].join()),'calls '+await ev(()=>window.__calls.join()));
ok(await ev(()=>S.fl&&S.fl.push===1),'flag push');
await ev(()=>{[...document.querySelectorAll('#cx-body button')].find(x=>x.textContent==='Turn off').click()});await W(500);
ok(await ev(()=>document.getElementById('cx-body').innerText.includes('Off.')&&window.__calls.includes('/unsubscribe')),'turns off');
ok(errs.length===0,'errs '+errs.join('|'));
console.log('pass',pass,'bad',bad);
}catch(e){console.log('ERR',e.message)}await b.close()})();
