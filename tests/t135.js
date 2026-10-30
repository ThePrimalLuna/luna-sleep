/* First-time visitor on a phone: gate has a short version and a jump link; the first track page shows Play near the top. */
const {chromium,devices}=require('playwright'),path=require('path');
let pass=0,bad=0;const ok=(c,m)=>{if(c)pass++;else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const c=await b.newContext({...devices['iPhone 13']});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+path.resolve(__dirname,'..','index.html'));await p.waitForTimeout(1000);
ok(await p.evaluate(()=>/The short version/.test(document.getElementById('den').innerText)),'den short version');
await p.evaluate(()=>document.getElementById('den-jump').click());await p.waitForTimeout(900);
const y=await p.evaluate(()=>{const r=document.getElementById('den-ack').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight});
ok(y,'jump brings the checkbox on screen');
await p.evaluate(()=>{document.getElementById('den-ack').click();document.getElementById('den-enter').click()});await p.waitForTimeout(600);
ok(await p.evaluate(()=>document.getElementById('den').hidden),'entered');
await p.evaluate(()=>[...document.querySelectorAll('button')].find(x=>x.textContent.trim().startsWith('Start with THE CALL')).click());await p.waitForTimeout(700);
const pos=await p.evaluate(()=>{const s=document.getElementById('side');const t=s.querySelector('.topplay');if(!t)return -1;return Math.round(t.getBoundingClientRect().top-s.getBoundingClientRect().top+s.scrollTop)});
ok(pos>=0&&pos<900,'play row near top of track page: '+pos);
ok(await p.evaluate(()=>!!document.querySelector('#side .topplay a[href*="open.spotify.com"]')),'top row has Spotify link');
ok(errs.length===0,'no page errors '+errs.join('|'));
}finally{await b.close()}console.log('t135 pass='+pass+' bad='+bad);process.exit(bad?1:0)})();
