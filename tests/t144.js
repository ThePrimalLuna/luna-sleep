/* t144: Home "Out now" lists every released track, not just the Foundation ten */
const APP='file://'+require('path').resolve(__dirname,'../index.html');const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c)pass++;else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const run=async(iso,pre)=>{const p=await (await b.newContext({viewport:{width:400,height:820}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.newSeen','2026-11-06a');localStorage.setItem('lunaSleep.newOptOut','1')}catch(e){}});
if(pre)await p.addInitScript(pre);
await p.clock.setFixedTime(new Date(iso));
await p.goto(APP);await p.waitForTimeout(700);
const r=await p.evaluate(()=>{S.tab='home';render();const h=[...document.querySelectorAll('h2.hh')].find(x=>/^Out now/.test(x.textContent));if(!h)return null;const sec=h.closest('section');const ids=[...sec.querySelectorAll('.card .mono')].map(x=>x.textContent);return{head:h.textContent,ids,note:(sec.querySelector('p.note')||{}).textContent||''}});
return{r,errs}};
// Nov 3: B-01 is out; R-01 (Nov 6, age-gated) is not yet
let {r,errs}=await run('2026-11-03T12:00:00');
ok(r&&r.ids[0]==='B-01','B-01 is first in Out now: '+JSON.stringify(r&&r.ids.slice(0,3)));
ok(r&&r.ids.length===11&&r.head==='Out now (11)','ten Foundation tracks plus B-01: '+(r&&r.head));
ok(r&&/Newest releases first/.test(r.note),'note explains the order');
ok(!errs.length,'no page errors '+errs);
// Before release day: Foundation only, old note
({r,errs}=await run('2026-11-01T12:00:00'));
ok(r&&r.ids.length===10&&!r.ids.includes('B-01'),'B-01 absent before its day');
ok(r&&/same ten Foundation/.test(r.note),'old note when only Foundation is out');
// Nov 7: R-01 is out but age-gated, so it stays hidden until adult content is allowed
({r,errs}=await run('2026-11-07T12:00:00'));
ok(r&&r.ids.includes('B-01')&&!r.ids.includes('R-01'),'R-01 hidden from Out now while adult content is off: '+JSON.stringify(r&&r.ids.slice(0,3)));
// R-01 was pushed back to Fri Nov 6, the same day as G-01; the rest of the schedule is unchanged
{const pg=await (await b.newContext()).newPage();await pg.goto(APP);await pg.waitForTimeout(500);
const d=await pg.evaluate(()=>({r:TI['R-01'].date,g:TI['G-01'].date,ro:TI['RO-01'].date,b2:TI['B-02'].date,row:DATA.rows.find(x=>x.ID==='R-01')['Release Date']}));
ok(d.r==='2026-11-06'&&d.g==='2026-11-06'&&d.ro==='2026-11-09'&&d.b2==='2026-11-18'&&d.row==='2026-11-06','R-01 and G-01 share Nov 6, later dates unchanged '+JSON.stringify(d))}
console.log('t144',pass,'pass',bad,'fail');process.exit(bad?1:0)}finally{await b.close()}})();
