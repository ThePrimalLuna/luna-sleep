/* t142: three secret BoJack-inspired themes and their secret achievements */
const APP='file://'+require('path').resolve(__dirname,'../index.html');const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c)pass++;else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await (await b.newContext({viewport:{width:400,height:820}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{if(!sessionStorage.getItem('i')){sessionStorage.setItem('i','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.newSeen','2026-11-03a')}}catch(e){}});
await p.goto(APP);await p.waitForTimeout(800);const ev=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
for(const [k,id,name] of [['Hollywoo','hollywoo','Missing a letter'],['HorsinAround','horsin','Studio audience'],['MidnightSwim','swim','Deep end'],['BeachCity','beachcity','Crystal clear']]){
 ok(await ev(k=>{const o=document.querySelector('#theme-sel option[value="'+k+'"]');return !!o&&o.parentNode.label==='More looks'},k),k+' is in More looks');
 await ev(k=>{const s=document.getElementById('theme-sel');s.value=k;s.dispatchEvent(new Event('change'))},k);await W(300);
 ok(await ev(k=>document.documentElement.getAttribute('data-skin')===k,k),k+' skin applied');
 await ev(()=>{S.done['x'+Math.random()]=true;save();render()});await W(400);
 const got=await ev(()=>localStorage.getItem('lunaSleep.cheevos')||'');ok(got.includes(id),name+' earned: '+got.slice(0,100));
 ok(!(await ev(()=>document.getElementById('new-log').innerText)).includes(name),name+' not named in What’s new')}
ok(!errs.length,'no page errors '+errs);console.log('t142',pass,'pass',bad,'fail');process.exit(bad?1:0)}finally{await b.close()}})();
