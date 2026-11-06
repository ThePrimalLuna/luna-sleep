/* t152: Start here guide explains the idea (purpose, consent, nine pillars) before the how-to */
const APP='file://'+require('path').resolve(__dirname,'../index.html');const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c)pass++;else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const ctx=await b.newContext({viewport:{width:400,height:820}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.newSeen','2026-11-06b');localStorage.setItem('lunaSleep.newOptOut','1')}catch(e){}});
const ev=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
await p.goto(APP);await W(700);
await ev(()=>{goRes('faq-start-here')});await W(500);
const txt=await ev(()=>document.body.innerText);
ok(/What is the idea\?/.test(txt),'Start here has a What is the idea? section');
ok(txt.indexOf('What is the idea?')<txt.indexOf('What do I need?'),'the idea comes before the how-to');
ok(/empowerment through submission/.test(txt)&&/not sissification or bimboification/.test(txt),'says what it is and is not');
['Blue','Green','Red','Rose, Azure and Prism','Silver, Purple and Black'].forEach(k=>ok(txt.includes(k),'mentions '+k));
ok(/opt-in/.test(txt)&&/nine pillars/.test(txt),'mentions opt-in and the nine pillars');
ok(!errs.length,'no page errors '+errs);console.log('t152',pass,'pass',bad,'fail');process.exit(bad?1:0)}finally{await b.close()}})();
