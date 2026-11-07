/* t147: Craytoad theme sits in More looks and unlocks its secret achievement */
const APP='file://'+require('path').resolve(__dirname,'../index.html');const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c)pass++;else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await (await b.newContext({viewport:{width:400,height:820}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{if(!sessionStorage.getItem('i')){sessionStorage.setItem('i','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.denAck','1')}}catch(e){}});
await p.goto(APP);await p.waitForTimeout(800);const ev=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
ok(await ev(()=>{const o=document.querySelector('#theme-sel option[value="Craytoad"]');return !!o&&o.parentNode.label==='More looks'}),'Craytoad is in More looks');
await ev(()=>{const s=document.getElementById('theme-sel');s.value='Craytoad';s.dispatchEvent(new Event('change'))});await W(300);
ok(await ev(()=>document.documentElement.getAttribute('data-skin')==='Craytoad'),'skin applied');
const bg=await ev(()=>getComputedStyle(document.body).color);ok(/rgb/.test(bg),'text colour set '+bg);
await ev(()=>{S.done['x']=true;save();render()});await W(400);
const got=await ev(()=>{try{return JSON.parse(localStorage.getItem('lunaSleep.cheevos')||'{}')}catch(e){return{}}});
ok(JSON.stringify(got).includes('craytoad'),'secret achievement earned: '+JSON.stringify(got).slice(0,120));
ok(!(await ev(()=>document.getElementById('new-log').innerText)).match(/Spore print/),'secret achievement not named in What’s new');
ok(/Craytoad/.test(await ev(()=>ALLR.find(x=>x.id==='whats-new-history').body)),'theme is listed in What’s new');
ok(!errs.length,'no page errors '+errs);console.log('t147',pass,'pass',bad,'fail');process.exit(bad?1:0)}finally{await b.close()}})();
