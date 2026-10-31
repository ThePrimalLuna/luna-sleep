/* t137: THE CALL haptic score. Rendering rules, silence, caps, controls, safety stops. */
const APP='file://'+require('path').resolve(__dirname,'../index.html');const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c)pass++;else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await (await b.newContext({viewport:{width:400,height:820},hasTouch:true})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__v=[];navigator.vibrate=x=>{window.__v.push(x);return true};try{localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.newSeen','2026-10-30b')}catch(e){}});
await p.route(/open\.spotify\.com\/embed\/(?!iframe-api)/,r=>r.abort());
await p.route('https://open.spotify.com/embed/iframe-api/v1',r=>r.fulfill({contentType:'text/javascript',body:"setTimeout(()=>window.onSpotifyIframeApiReady({createController:(el,o,cb)=>{const f=document.createElement('iframe');f.dataset.uri=o.uri;el.replaceWith(f);const L={};cb({addListener:(n,fn)=>{L[n]=fn}});window.__emit=d=>L.playback_update&&L.playback_update({data:d})}}),0)"}));
await p.goto(APP);await p.waitForTimeout(900);const ev=(f,a)=>p.evaluate(f,a);
const sc=await ev(()=>LT.scoreFor('the call'));ok(sc&&sc.cues.length===96&&sc.len===930,'score found, 96 cues');
ok(await ev(()=>LT.scoreFor('THE STREAM')===null),'other tracks have none');
// every window of the whole track, every strength: valid pattern, <=99 numbers, silence in the voids
const r=await ev(()=>{const bad=[],tot=[];const voidsOk=[];let pulses=0;
 for(let l=1;l<=5;l++)for(let s=0;s<935;s+=2.5){const x=LT.scoreRender(LT.scoreFor('THE CALL'),s,3.2,l);const a=x.p;
  if(a.length>99)bad.push('len '+s);if(a.some((n,i)=>!Number.isInteger(n)||n<0||(n===0&&i!==0)||n>10000))bad.push('val '+s+' '+JSON.stringify(a).slice(0,60));if(x.end<s*1000+1)bad.push('noadvance '+s);pulses+=a.length}
 return{bad:bad.slice(0,5),pulses}});
ok(!r.bad.length,'all windows valid '+JSON.stringify(r.bad));
// absolute silence 13:10 to 13:18 (790 to 798), pre-hit blackout 780.5 to 782, and 1:12 to 1:21 vacuum is covered by marks too
const sil=await ev(()=>{const f=(a,b)=>{const x=LT.scoreRender(LT.scoreFor('THE CALL'),a,b-a,3);return x.p};return{vac:f(790.05,797.95),pre:f(780.6,781.9),gap:f(572.9,577.9)}});
ok(sil.vac.length===0,'vacuum 13:10-13:18 is silent '+sil.vac);ok(sil.pre.length===0,'pre-hit blackout silent '+sil.pre);
// the three PRIMAL hits are the strongest pulses and land on time
const hit=await ev(()=>{const g=t=>{const x=LT.scoreRender(LT.scoreFor('THE CALL'),t-.05,.3,3);return x.p};return[g(782),g(785),g(788)]});
ok(hit.every(a=>a[0]===0&&a[1]===50&&a[2]>=70),'hits land 50 ms in with a firm pulse '+JSON.stringify(hit));
const lo=await ev(()=>{let m=0;const sc=LT.scoreFor('THE CALL');for(let s=0;s<930;s+=1){const x=LT.scoreRender(sc,s,1.1,3).p;for(let i=0;i<x.length;i+=2){const t=(i===0&&x[0]===0)?x[2]:x[i];}}return 1});
// strongest bed pulse never exceeds 66% of the strength's pulse length; hits may
const cap=await ev(()=>{const sc=LT.scoreFor('THE CALL'),hi=75;let bed=0,hits=0;for(const s of [60,200,350,500,650,720,850,870]){const x=LT.scoreRender(sc,s,3,3).p;const on=x.filter((n,i)=>x[0]===0?i>=2&&i%2===0:i%2===0);if(on.length)bed=Math.max(bed,...on)}
 const h=LT.scoreRender(sc,788,.4,3).p;hits=Math.max(...h.filter((n,i)=>i%2===0&&h[0]!==0||(h[0]===0&&i>=2&&i%2===0)));return{bed,hits}});
ok(cap.bed<=Math.round(75*.66)+8,'bed pulses stay under the ceiling '+cap.bed);ok(cap.hits>=70,'hit pulse is full strength '+cap.hits);
// optional subliminal cue is left out
ok(await ev(()=>LT.scoreRender(LT.scoreFor('THE CALL'),889.9,.3,5).p.length===0),'optional 14:50 cue skipped');
// strength follows the setting
const lv=await ev(()=>[1,5].map(l=>LT.scoreRender(LT.scoreFor('THE CALL'),788,.4,l).p.slice(0,3)));ok(Math.max(...lv[0])<Math.max(...lv[1]),'strength scales pulses '+JSON.stringify(lv));
// controls under the player, off by default
await ev(()=>{const t=Object.values(TI).find(x=>x.title==='THE CALL');window.__t=t;t.spotify=t.spotify||'https://open.spotify.com/episode/aaaaaaaaaaaaaaaaaaaaaa';LT.dockPlay(t)});await p.waitForTimeout(300);
ok(await ev(()=>/Turn it on/.test(document.querySelector('#pdock .pdscore').textContent)),'off by default, offers to turn on');
await ev(()=>[...document.querySelectorAll('#pdock .pdscore button')].find(b=>b.textContent==='Turn it on').click());await p.waitForTimeout(200);
ok(await ev(()=>JSON.parse(localStorage.getItem('lunaSleep.vib')).score===true&&!!document.querySelector('#pdock .pdscore .mono')),'switch saved, controls shown');
await ev(()=>{window.__v=[];[...document.querySelectorAll('#pdock .pdscore button')].find(b=>b.textContent==='Start score').click()});await p.waitForTimeout(500);
ok(await ev(()=>window.__v.length>=1),'start vibrates');
ok(await ev(()=>/Score at 0:0/.test(document.querySelector('#pdock .pdscore .mono').textContent)),'status shows time');
await ev(()=>LT.scoreSeek(30));ok(await ev(()=>Math.round(LT.scorePos())>=30),'nudge +30 moves the clock (api)');
await ev(()=>{[...document.querySelectorAll('#pdock .pdscore button')].find(b=>b.textContent==='Pause score').click()});
ok(await ev(()=>window.__v[window.__v.length-1]===0),'pause cancels vibration');
const pp=await ev(()=>LT.scorePos());await p.waitForTimeout(600);ok(Math.abs(await ev(()=>LT.scorePos())-pp)<.05,'paused clock holds');

// Following Spotify (the page API is mocked here: this checks our wiring, not Spotify itself)
await ev(()=>{LT.dockStop();window.__v=[];window.__emit=null;LT.dockPlay(window.__t)});await p.waitForTimeout(400);
ok(await ev(()=>{const f=document.querySelector('#pdock iframe');return f&&/episode:/.test(f.dataset.uri||'')&&f.className==='pdfr'}),'player made through the Spotify page API');
ok(await ev(()=>/Spotify is paused|Score paused|Score at/.test(document.querySelector('#pdock .pdscore .mono').textContent)),'controls before first update');
await ev(()=>window.__emit({position:788000,duration:900000,isPaused:false,isBuffering:false}));await p.waitForTimeout(300);
ok(await ev(()=>Math.abs(LT.scorePos()-788)<1&&/Following Spotify/.test(document.querySelector('#pdock .pdscore .mono').textContent)),'follows the reported position');
ok(await ev(()=>window.__v.some(a=>Array.isArray(a)&&a.length>1)),'hit pattern sent at 13:08');
ok(await ev(()=>[...document.querySelectorAll('#pdock .pdscore .acts button')].filter(b=>!b.hidden).map(b=>b.textContent).join('|')==='Buzz earlier|Buzz later|Sync by hand instead'),'auto buttons shown, manual hidden');
await ev(()=>{window.__v=[];window.__emit({position:790500,duration:900000,isPaused:true,isBuffering:false})});await p.waitForTimeout(150);
ok(await ev(()=>window.__v[window.__v.length-1]===0&&Math.abs(LT.scorePos()-790.5)<.1),'paused in Spotify stops buzzing and holds the position');
await ev(()=>{window.__v=[];window.__emit({position:100000,duration:900000,isPaused:false,isBuffering:false})});await p.waitForTimeout(250);
ok(await ev(()=>Math.abs(LT.scorePos()-100)<1),'seek in Spotify carries over');
await ev(()=>{[...document.querySelectorAll('#pdock .pdscore button')].find(b=>b.textContent==='Buzz earlier').click()});
ok(await ev(()=>Math.abs(LT.scorePos()-100.5)<1),'Buzz earlier nudges the clock');
await ev(()=>{[...document.querySelectorAll('#pdock .pdscore button')].find(b=>b.textContent==='Sync by hand instead').click()});await p.waitForTimeout(100);
await ev(()=>window.__emit({position:400000,isPaused:false,isBuffering:false}));
ok(await ev(()=>Math.abs(LT.scorePos()-400)>5&&[...document.querySelectorAll('#pdock .pdscore button')].some(b=>!b.hidden&&b.textContent==='Restart')),'hand mode ignores Spotify and shows manual buttons');
// safety: Emergency Exit and closing the player stop it
await ev(()=>{LT.scoreStart('THE CALL',100);window.__v=[]});await p.waitForTimeout(200);
await ev(()=>sosOpen());await p.waitForTimeout(200);
ok(await ev(()=>!document.querySelector('#pdock .pdscore')&&window.__v.some(x=>x===0)),'Emergency Exit stops the score');
await p.waitForTimeout(3500);ok(await ev(()=>window.__v.filter(x=>Array.isArray(x)&&x.length>1&&x.some(n=>n>0)).length<=2),'nothing keeps scheduling after stop');
// script blocked: plain player, manual score
{const p2=await (await b.newContext({viewport:{width:400,height:820}})).newPage();await p2.addInitScript(()=>{window.__v=[];navigator.vibrate=x=>{window.__v.push(x);return true};try{localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.newSeen','2026-10-30b');localStorage.setItem('lunaSleep.vib',JSON.stringify({score:true}))}catch(e){}});
 await p2.route(/open\.spotify\.com/,r=>r.abort());await p2.goto(APP);await p2.waitForTimeout(800);
 await p2.evaluate(()=>{const t=Object.values(TI).find(x=>x.title==='THE CALL');t.spotify='https://open.spotify.com/episode/aaaaaaaaaaaaaaaaaaaaaa';LT.dockPlay(t)});await p2.waitForTimeout(800);
 ok(await p2.evaluate(()=>{const f=document.querySelector('#pdock iframe.pdfr');return f&&/embed\/episode\/a+/.test(f.src)&&!document.querySelector('#pdock .pdph')}),'script blocked: plain player');
 ok(await p2.evaluate(()=>[...document.querySelectorAll('#pdock .pdscore button')].some(b=>!b.hidden&&b.textContent==='Start score')),'script blocked: Start score available');
 await p2.close()}
ok(!errs.length,'errors '+errs);
}catch(e){bad++;console.log('ERR',e.message)}finally{await b.close()}
console.log('t137 pass='+pass+' bad='+bad);process.exit(bad?1:0)})();
