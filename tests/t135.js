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
ok(await p.evaluate(()=>![...document.querySelectorAll('#view button')].some(x=>/^Start with /.test(x.textContent.trim()))),'old Start with button is gone');
ok(await p.evaluate(()=>document.querySelectorAll('#view .tnstart').length===1),'one merged start button');
await p.evaluate(()=>document.querySelector('#view .tnstart').click());await p.waitForTimeout(600);
const tn=await p.evaluate(()=>{const s=document.getElementById('tn-track');return {title:(document.querySelector('#cx-dlg h2,#cx-dlg .cxh,#cx-title')||{}).textContent,track:s&&s.options[s.selectedIndex].textContent}});
ok(/THE CALL/.test(tn.track||''),'Start my night preselects THE CALL: '+JSON.stringify(tn));
await p.evaluate(()=>{try{cxDismiss()}catch(e){}});await p.waitForTimeout(300);
await p.evaluate(()=>[...document.querySelectorAll('#view button')].find(x=>x.textContent.trim()==='About THE CALL').click());await p.waitForTimeout(700);
const pos=await p.evaluate(()=>{const s=document.getElementById('side');const t=s.querySelector('.topplay');if(!t)return -1;return Math.round(t.getBoundingClientRect().top-s.getBoundingClientRect().top+s.scrollTop)});
ok(pos>=0&&pos<900,'play row near top of track page: '+pos);
ok(await p.evaluate(()=>!!document.querySelector('#side .topplay a[href*="open.spotify.com"]')),'top row has Spotify link');
ok(errs.length===0,'no page errors '+errs.join('|'));
{const c2=await b.newContext({...devices['iPhone 13'],colorScheme:'dark'});const q=await c2.newPage();await q.addInitScript(()=>{localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.newOptOut','1')});
 await q.goto('file://'+path.resolve(__dirname,'..','index.html'));await q.waitForTimeout(800);
 const sk=()=>q.evaluate(()=>document.documentElement.dataset.skin);
 ok(await sk()==='Dusk','dark-mode phone gets Dusk on Home');
 await q.evaluate(()=>{F.col='Gold';S.tab='cat';render()});ok(await sk()==='Dusk','light album color becomes Dusk in dark mode');
 await q.evaluate(()=>{F.col='Blue';render()});ok(await sk()==='Blue','dark album color still follows');
 await q.evaluate(()=>{const s=document.getElementById('theme-sel');s.value='White';s.dispatchEvent(new Event('change'))});ok(await sk()==='White','an explicit theme wins');
 await q.emulateMedia({colorScheme:'light'});await q.evaluate(()=>{const s=document.getElementById('theme-sel');s.value='';s.dispatchEvent(new Event('change'));F.col='';S.tab='home';render()});ok(await sk()==='White','light mode Auto stays White');
 await c2.close()}
}finally{await b.close()}console.log('t135 pass='+pass+' bad='+bad);process.exit(bad?1:0)})();
