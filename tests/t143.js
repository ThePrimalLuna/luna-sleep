/* t143: B-01 THE TETHER release: Spotify link, haptic score, Bloom manual, deep dive */
const APP='file://'+require('path').resolve(__dirname,'../index.html');const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c)pass++;else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await (await b.newContext({viewport:{width:400,height:820}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__v=[];navigator.vibrate=x=>{window.__v.push(x);return true};try{localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.newSeen','2026-11-07a');localStorage.setItem('lunaSleep.newOptOut','1')}catch(e){}});
await p.route(/open\.spotify\.com/,r=>r.abort());
await p.goto(APP);await p.waitForTimeout(800);const ev=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
ok(await ev(()=>TI['B-01'].spotify==='https://open.spotify.com/episode/45l8Tn0nOaa1l8nT6YvvHY'),'B-01 has its Spotify episode');
ok(await ev(()=>['B-02','B-09'].every(k=>!TI[k].spotify)),'later Bloom tracks have none yet');
await ev(()=>openTrack('B-01'));await W(400);
ok(await ev(()=>[...document.querySelectorAll('#side button')].some(b=>b.textContent==='Play here')),'Play here shows on B-01');
ok(await ev(()=>[...document.querySelectorAll('#side button')].some(b=>b.textContent==='Bloom manual')),'Bloom manual button on B-01');
ok(await ev(()=>[...document.querySelectorAll('#side button')].some(b=>b.textContent==='Read the deep dive')),'deep dive link on B-01');
await ev(()=>openTrack('B-02'));await W(300);
ok(await ev(()=>[...document.querySelectorAll('#side button')].some(b=>b.textContent==='Bloom manual')),'Bloom manual button on B-02 too');
ok(await ev(()=>{openTrack('B-17');return ![...document.querySelectorAll('#side button')].some(b=>b.textContent==='Bloom manual')}),'not on B-17');
// resources
const r=await ev(()=>{const m=ALLR.find(x=>x.id==='bloom-manual'),d=ALLR.find(x=>x.id==='dd-b01');return{m:!!m&&m.body.length>5000&&/HUMAN/.test(m.body)&&/B-09: THE GARDEN/.test(m.body)&&!/Patreon: \[/.test(m.body),d:!!d&&d.track==='B-01'&&/Welcome back to the Den/.test(d.body)&&/Research Architecture/.test(d.body)&&!/Den's Library/.test(d.body)&&/dissociat/i.test(d.note),ord:d&&d.ord}});
ok(r.m,'Bloom manual present and clean');ok(r.d,'deep dive present, content note kept, nav list not copied');ok(r.ord>19&&r.ord<20,'deep dive follows SKU 09');
await ev(()=>goRes('bloom-manual'));await W(400);
ok(await ev(()=>/The Bloom Album/.test(document.querySelector('h2').textContent)&&document.body.innerText.includes('1.0 The Safety Protocol')),'manual opens and renders headings');
await ev(()=>goRes('dd-b01'));await W(400);ok(await ev(()=>/Feeling Held/.test(document.body.innerText)&&/Content notes/i.test(document.body.innerText)),'deep dive opens with its content note');
// haptic score
const s=await ev(()=>{const sc=LT.scoreFor('THE TETHER'),bad=[];if(!sc)return{none:1};for(let l=1;l<=5;l++)for(let t=0;t<905;t+=2.5){const x=LT.scoreRender(sc,t,3.2,l).p;if(x.length>99||x.some((v,i)=>!Number.isInteger(v)||v<0||(v===0&&i!==0)||v>10000))bad.push(l+'@'+t)}return{cues:sc.cues.length,bad:bad.length,hb:LT.scoreRender(sc,520,6,3).p.length>0,feel:LT.feelFor('B-01','THE TETHER')}});
ok(s.cues===21&&s.bad===0&&s.hb&&s.feel===null,'THE TETHER score valid, no separate feel '+JSON.stringify(s));
ok(!errs.length,'no page errors '+errs);console.log('t143',pass,'pass',bad,'fail');process.exit(bad?1:0)}finally{await b.close()}})();
