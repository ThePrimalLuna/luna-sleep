/* t153: tab hints, newcomer Welcome first, Archives page and Home card */
const APP='file://'+require('path').resolve(__dirname,'../index.html');const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c)pass++;else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const ctx=await b.newContext({viewport:{width:390,height:844}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.newSeen','2026-11-06b');localStorage.setItem('lunaSleep.newOptOut','1')}catch(e){}});
const ev=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
await p.goto(APP);await W(800);
await ev(()=>{S.done={};S.tab='home';save();render()});await W(200);
ok(/Tonight/.test(await ev(()=>document.getElementById('tabhint').textContent)),'Home has a tab hint');
const order=await ev(()=>{const v=document.getElementById('view');const k=[...v.children];const i=k.findIndex(x=>/Welcome to Luna Sleep/.test(x.textContent)),j=k.findIndex(x=>/Late night|Good morning|Good evening|Tonight|night/i.test(x.textContent)&&x.tagName==='SECTION'&&!/Welcome to Luna Sleep/.test(x.textContent));return{i,j}});
ok(order.i===0,'newcomer Welcome is the first thing on Home '+JSON.stringify(order));
ok(await ev(()=>[...document.querySelectorAll('#view .home-hero button')].some(x=>/New here\? Start here/.test(x.textContent))),'Welcome has Start here');
// Archives card and page
ok(await ev(()=>/Free: The Luna Sleep Archives/.test(document.getElementById('view').textContent)),'Home has the Archives card');
await ev(()=>[...document.querySelectorAll('#view button')].find(x=>/About the Archives/.test(x.textContent)).click());await W(250);
const a=await ev(()=>({tab:S.tab,txt:document.getElementById('view').innerText,sel:document.querySelector('#tabs [aria-selected="true"]').textContent,hint:document.getElementById('tabhint').textContent}));
ok(a.tab==='archives'&&/The Luna Sleep Archives/.test(a.txt),'Archives page opens');
ok(/no hypnosis, no trance and no trigger words/.test(a.txt),'says it is not hypnosis');
ok(/every weekend/i.test(a.txt)&&/first episode is not out yet/i.test(a.txt),'weekend show, first episode not out yet');
ok(/Bonus & Lore/.test(a.sel),'Bonus & Lore tab stays selected '+a.sel);
ok(/Archives/.test(a.hint),'tab hint mentions Archives');
ok(await ev(()=>[...document.querySelectorAll('.bnav button')].map(x=>x.textContent).join('|'))==='Bonus episodes|Lore|Stories|Archives','four buttons in the Bonus nav');
await ev(()=>[...document.querySelectorAll('#view button')].find(x=>/Read the stories/.test(x.textContent)).click());await W(250);
ok(await ev(()=>S.tab==='stories'),'Read the stories goes to Stories');
// once something is heard the Welcome goes away
await ev(()=>{S.done['SKU 00']=true;S.tab='home';save();render()});await W(200);
ok(!(await ev(()=>/Welcome to Luna Sleep/.test(document.getElementById('view').textContent))),'Welcome hides after the first track is heard');
// Discord link is not default blue
await ev(()=>document.getElementById('set-open').click());await W(300);
const col=await ev(()=>{const a=[...document.querySelectorAll('#ql-menu a')].find(x=>/Discord/.test(x.textContent));return getComputedStyle(a).color});
ok(col!=='rgb(0, 0, 238)','Discord link is themed, not default blue '+col);
ok(!errs.length,'no page errors '+errs);console.log('t153',pass,'pass',bad,'fail');process.exit(bad?1:0)}finally{await b.close()}})();
