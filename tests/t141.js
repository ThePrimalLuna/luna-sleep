/* t141: by-hand score sync: 3-2-1 countdown and Jump to */
const APP='file://'+require('path').resolve(__dirname,'../index.html');const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c)pass++;else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await (await b.newContext({viewport:{width:400,height:820}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__v=[];navigator.vibrate=x=>{window.__v.push(x);return true};try{localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.newSeen','2026-11-01b');localStorage.setItem('lunaSleep.vib',JSON.stringify({on:true,score:true,follow:false}))}catch(e){}});
await p.route(/open\.spotify\.com/,r=>r.abort());
await p.goto(APP);await p.waitForTimeout(800);const ev=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
await ev(()=>{const t=Object.values(TI).find(x=>x.title==='THE COAT');LT.dockPlay(t)});await W(300);
const btns=()=>ev(()=>[...document.querySelectorAll('#pdock .pdscore button')].map(b=>b.textContent));
ok((await btns()).includes('Start score')&&(await btns()).includes('Start at'),'Start score and Start at shown');
// already playing in Spotify: type its time, tap Start at
await ev(()=>{const i=document.querySelector('#pdock .scjump input');i.value='0:47';[...document.querySelectorAll('#pdock .pdscore button')].find(b=>b.textContent==='Start at').click()});await W(600);
ok(await ev(()=>/Score at 0:4[78]/.test(document.querySelector('#pdock .pdscore .mono').textContent)),'Start at 0:47 runs the score from there: '+await ev(()=>document.querySelector('#pdock .pdscore .mono').textContent));
await ev(()=>[...document.querySelectorAll('#pdock .pdscore button')].find(b=>b.textContent==='Pause score').click());await W(200);
await ev(()=>LT.scoreStop());await W(100);await ev(()=>{const t=Object.values(TI).find(x=>x.title==='THE COAT');LT.dockStop();LT.dockPlay(t)});await W(300);
await ev(()=>[...document.querySelectorAll('#pdock .pdscore button')].find(b=>b.textContent==='Start score').click());await W(700);
ok(/Starting in [123]/.test(await ev(()=>document.querySelector('#pdock .pdscore .mono').textContent)),'countdown shows');
ok((await btns()).includes('Cancel'),'Cancel offered');
await ev(()=>[...document.querySelectorAll('#pdock .pdscore button')].find(b=>b.textContent==='Cancel').click());await W(200);
ok(await ev(()=>!/Starting in/.test(document.querySelector('#pdock .pdscore .mono').textContent)),'cancel stops the countdown');
await W(3200);ok(await ev(()=>/paused at 0:00/.test(document.querySelector('#pdock .pdscore .mono').textContent)),'cancelled countdown never starts the score');
await ev(()=>[...document.querySelectorAll('#pdock .pdscore button')].find(b=>b.textContent==='Start score').click());await W(3700);
ok(await ev(()=>/Score at /.test(document.querySelector('#pdock .pdscore .mono').textContent)),'starts after 3, 2, 1');
await ev(()=>{const i=document.querySelector('#pdock .scjump input');i.value='4:12';[...document.querySelectorAll('#pdock .pdscore button')].find(b=>b.textContent==='Jump to').click()});await W(700);
ok(await ev(()=>/Score at 4:1[23]/.test(document.querySelector('#pdock .pdscore .mono').textContent)),'jump to 4:12 '+await ev(()=>document.querySelector('#pdock .pdscore .mono').textContent));
ok(await ev(()=>LT.scoreJump('abc')===false&&LT.scoreJump('99:99')===true),'bad text refused, big times clamp');
ok(await ev(()=>LT.scorePos()<=LT.scoreFor('THE COAT').len+1),'clamped to score length');
await ev(()=>LT.dockStop());ok(await ev(()=>true),'closes');
ok(!errs.length,'no page errors '+errs);console.log('t141',pass,'pass',bad,'fail');process.exit(bad?1:0)}finally{await b.close()}})();
