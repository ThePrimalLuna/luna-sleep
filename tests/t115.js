/* t115: icon shapes; settle hub icons + Hold pad; tools hub icons */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c){pass++}else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const ctx=await b.newContext({viewport:{width:400,height:820},hasTouch:false});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__v=[];Object.defineProperty(navigator,'vibrate',{value:x=>{window.__v.push(x);return true},configurable:true});try{localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.vib',JSON.stringify({lvl:2}))}catch(e){}});
await p.goto(APP);await p.waitForTimeout(900);
const ev=(f,a)=>p.evaluate(f,a);
// icons
const mi=await ev(()=>['tn-open','plan-open','bed-open','hp-open','st-open','hx-open','cf-open','af-open','sf-open','me-open','cal-open','dv-open','qh-open'].map(i=>!!document.querySelector('#'+i+' .ic svg')));
ok(mi.every(Boolean),'menu icons '+mi);
ok(await ev(()=>document.querySelectorAll('#set-quick .ic svg path,#set-quick .ic svg circle,#set-quick .ic svg rect').length>20),'icon shapes');
await ev(()=>LT.hubOpen('settle'));
ok(await ev(()=>document.querySelectorAll('#cx-body .path .ic').length===6&&/Hold pad/.test(document.getElementById('cx-body').textContent)),'settle hub icons + Hold pad');
await ev(()=>LT.hubOpen('tools'));ok(await ev(()=>document.querySelectorAll('#cx-body .path .ic').length>=4),'tools hub icons');
// guide links
const open=[['LT.deepOpen()','deepener-safety'],['LT.tonightOpen()','build-your-night'],['LT.hapticsOpen()','deepener-safety'],['LT.comfortOpen()','accessibility-guide'],['LT.cardOpen()','safe-for-me'],['LT.bodyOpen()','safe-for-me'],['LT.cuesOpen()','safe-for-me'],['LT.anchorsOpen()','safe-for-me'],['LT.drillOpen()','if-it-goes-wrong'],['LT.passOpen()','privacy-data'],['LT.padOpen()','deepener-safety'],['LT.planOpen()','build-your-night']];
for(const [c,id] of open){await ev(c);await p.waitForTimeout(80);const n=await ev(()=>document.querySelectorAll('#cx-body .guidelnk button').length);ok(n===1,c+' guide link '+n)}
await ev(()=>LT.deepOpen());await ev(()=>document.querySelector('#cx-body .guidelnk button').click());await p.waitForTimeout(250);
ok(await ev(()=>document.getElementById('cx-dlg').hidden&&/Deepener, Guided read and vibration/.test(document.body.textContent)),'guide link opens guide');
// deepener mini body map
await ev(()=>{const s=JSON.parse(localStorage.getItem('lunaSleep.safe')||'{}');localStorage.setItem('lunaSleep.safe',JSON.stringify(Object.assign(s,{body:{chest:2,feet:1}})))});
await ev(()=>LT.deepOpen());
const bm=await ev(()=>({svg:!!document.querySelector('#cx-body svg.bodymini'),s2:document.querySelectorAll('#cx-body .bodymini [data-s="2"]').length,s1:document.querySelectorAll('#cx-body .bodymini [data-s="1"]').length,txt:document.querySelector('#cx-body .bmini').textContent}));
ok(bm.svg&&bm.s2>=1&&bm.s1>=1&&/Welcome: 1 area\. Skip: 1 area/.test(bm.txt),'mini map '+JSON.stringify(bm));
await ev(()=>[...document.querySelectorAll('#cx-body .bmini button')].find(x=>/Edit body map/.test(x.textContent)).click());await p.waitForTimeout(200);
ok(await ev(()=>document.getElementById('cx-h').textContent==='Body map'),'edit opens body map');
// exit card drill link
await ev(()=>document.getElementById('sos-open').click());await p.waitForTimeout(150);
const dl=await ev(()=>[...document.querySelectorAll('#sos .sosextra button')].map(x=>x.textContent));
ok(dl.includes('Practice finding this button'),'drill link '+dl);
await ev(()=>[...document.querySelectorAll('#sos .sosextra button')].find(x=>/Practice finding/.test(x.textContent)).click());await p.waitForTimeout(300);
ok(await ev(()=>document.getElementById('sos').hidden&&document.getElementById('cx-h').textContent==='Practice the Emergency Exit'),'drill dialog opened, exit closed');
await ev(()=>document.getElementById('cx-close')&&LT.cardOpen&&document.getElementById('cx-close').click());
// hold pad
await ev(()=>{window.__v.length=0;LT.padOpen()});await p.waitForTimeout(100);
const bx=await ev(()=>{const r=document.querySelector('.holdpad').getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height}});
ok(bx.w>200&&bx.h>=200,'pad size');
await p.mouse.move(bx.x+bx.w*.1,bx.y+bx.h*.9);await p.mouse.down();await p.waitForTimeout(1500);
const slow=await ev(()=>window.__v.filter(x=>x!==0&&typeof x==='number'));
ok(slow.length>=1&&slow.every(n=>n>=12),'slow soft pulses '+slow);const softMax=Math.max(...slow);
ok(await ev(()=>document.querySelector('.holdpad').classList.contains('on')),'pad on');
ok(await ev(()=>/Holding: slow, soft/.test(document.querySelector('.padread').textContent)),'readout');
await ev(()=>{window.__v.length=0});
await p.mouse.move(bx.x+bx.w*.95,bx.y+bx.h*.05,{steps:5});await p.waitForTimeout(1500);
const fast=await ev(()=>window.__v.filter(x=>x!==0&&typeof x==='number'));
ok(fast.length>=3,'faster pulses '+fast.length+' vs '+slow.length);
// cap: lvl 2 hi=62, period>=400 => max on = round(p*.62*.45)
ok(Math.max(...fast)<=Math.round(1200*.62*.45),'cap '+Math.max(...fast));
ok(fast.length>0&&Math.max(...fast)>=0,'fast ok');
await p.mouse.up();await p.waitForTimeout(100);
const last=await ev(()=>window.__v[window.__v.length-1]);ok(last===0,'release -> vibrate(0) '+last);
ok(await ev(()=>!document.querySelector('.holdpad').classList.contains('on')),'pad off after release');
// no more pulses after release
await ev(()=>{window.__v.length=0});await p.waitForTimeout(900);ok(await ev(()=>window.__v.length===0),'silent after release');
// toast with Open it (pad unlocked on first press)
const t=await ev(()=>({hidden:document.getElementById('cv-toast').hidden,txt:document.getElementById('cv-toast').textContent,btn:!!document.querySelector('#cv-toast .cvgo')}));
ok(!t.hidden&&/Steady hands/.test(t.txt)&&t.btn,'toast with Open it '+JSON.stringify(t));
// Emergency Exit stops pad
await ev(()=>{window.__v.length=0});
await p.mouse.move(bx.x+bx.w*.5,bx.y+bx.h*.5);await p.mouse.down();await p.waitForTimeout(300);
await ev(()=>sosOpen&&0).catch(()=>{});
await ev(()=>document.getElementById('sos-open').click());await p.waitForTimeout(200);
ok(await ev(()=>window.__v.some(x=>x===0)&&!document.querySelector('.holdpad.on')),'exit stops pad');
await p.mouse.up();await ev(()=>document.getElementById('sos-close').click());
// toast click opens
await ev(()=>{document.getElementById('cv-toast').querySelector('.cvgo')&&document.getElementById('cv-toast').querySelector('.cvgo').click()});
// achievements list buttons
await ev(()=>document.getElementById('cv-open').click());await p.waitForTimeout(150);
const gb=await ev(()=>[...document.querySelectorAll('#cv-list .cvgo')].map(x=>x.textContent));
ok(gb.length>10&&gb.includes('Open it'),'list go buttons '+gb.length);
ok(await ev(()=>{const rows=[...document.querySelectorAll('#cv-list .cvrow.sec.lock')];return rows.every(r=>!r.querySelector('.cvgo'))}),'locked secrets have no go');
await ev(()=>{const r=[...document.querySelectorAll('#cv-list .cvrow')].find(r=>/Steady hands/.test(r.textContent));r.querySelector('.cvgo').click()});await p.waitForTimeout(300);
ok(await ev(()=>document.getElementById('cv-dlg').hidden&&document.getElementById('cx-h').textContent==='Hold pad'),'list Open it -> Hold pad');
await ev(()=>document.getElementById('cx-close').click());
// scores slot
await ev(()=>LT.hapticsOpen());
const sc=await ev(()=>{const w=document.querySelector('#cx-body .scoreslot');return{has:!!w,pill:/Not active yet/.test(w.textContent),dis:w.querySelector('input').disabled,chk:w.querySelector('input').checked,none:/does not do anything yet/.test(w.textContent),f:LT.scoreFor('THE STREAM')}});
ok(sc.has&&sc.pill&&sc.dis&&!sc.chk&&sc.none&&sc.f===null,'scores slot '+JSON.stringify(sc));
ok(await ev(()=>!!document.querySelector('#cx-body .wsrow button')&&/Hold pad/.test(document.getElementById('cx-body').textContent)),'pad link in haptics');
// feels
const fe=await ev(()=>['THE CALL','THE COAT','INSTINCT','THE DEN','THE HOWL','THE PACK','THE HUNT','THE STREAM','THE SHADOW','THE ALPHA','NOPE'].map(n=>{const x=LT.feelFor('x',n);return x?x.textContent:null}));
ok(fe.slice(0,10).every(Boolean)&&fe[10]===null,'feels '+fe);
// no listening features anywhere
const src=await ev(()=>document.documentElement.outerHTML);
ok(!/getUserMedia|DeviceMotionEvent|webkitSpeechRecognition|SpeechRecognition|AudioWorklet.*mic|chest mode/i.test(src.replace(/DeviceMotionEvent\s*&&/g,'')),'no listening apis');
ok(errs.length===0,'errs '+errs.join('|'));
}finally{await b.close()}console.log('t115 pass='+pass+' bad='+bad)})().catch(e=>{console.log('ERR',e.message.slice(0,300));process.exit(1)});
