/* t158: The Pack secret theme loads its scene on demand, stays behind the app, switches off cleanly, has a secret achievement, and is not announced */
const {chromium}=require('playwright');const fs=require('fs');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:420,height:860}});let f=0;const ok=(c,m)=>{if(!c){f++;console.log('FAIL',m)}};const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.newSeen','2026-11-12b')}catch(e){}});
await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(400);
ok(await p.evaluate(()=>[...document.querySelectorAll('#theme-sel option')].some(o=>o.value==='Pack'&&/Pack/.test(o.textContent))),'picker lists The Pack');
ok(!(await p.$('script[src*="themes/pack.js"]'))&&!(await p.$('#pkfx')),'nothing loaded before the theme is chosen');
await p.evaluate(()=>{const s=document.getElementById('theme-sel');s.value='Pack';s.onchange()});
await p.waitForSelector('#pkfx',{timeout:8000}).catch(()=>{});await p.waitForTimeout(600);
const r=await p.evaluate(()=>{const f=document.getElementById('pkfx');if(!f)return null;const c=getComputedStyle(f);const s=document.querySelector('.sosfab');return{kids:f.children.length,pe:c.pointerEvents,z:c.zIndex,skin:document.documentElement.dataset.skin,sos:!!s&&getComputedStyle(s).display!=='none',canv:f.querySelectorAll('canvas').length}});
ok(r&&r.kids>20,'scene built '+JSON.stringify(r));ok(r&&r.pe==='none'&&r.z==='-1','scene is behind and click-through');ok(r&&r.skin==='Pack','skin attribute set');ok(r&&r.sos,'Emergency Exit still shown');
await p.screenshot({path:process.env.PACK_SHOT||'/tmp/pack.png'});
await p.evaluate(()=>document.documentElement.classList.add('calm'));
ok(await p.evaluate(()=>getComputedStyle(document.querySelector('#pkfx .sn')).display==='none'),'calm hides snow');
await p.evaluate(()=>document.documentElement.classList.remove('calm'));
await p.evaluate(()=>{const s=document.getElementById('theme-sel');s.value='Blue';s.onchange()});await p.waitForTimeout(300);
ok(!(await p.$('#pkfx')),'scene removed when theme changes');
await p.evaluate(()=>{const s=document.getElementById('theme-sel');s.value='Pack';s.onchange()});await p.waitForTimeout(500);
ok(!!(await p.$('#pkfx')),'scene returns when chosen again');
ok(await p.evaluate(()=>{const t=ALLR.find(x=>x.id==='whats-new-history');return !/pack theme|the pack look|run with the pack|themes\/pack/i.test((t||{}).body||'')}),'not in What\'s new history');
const sw=fs.readFileSync('sw.js','utf8');ok(!/pack\.js/.test(sw),'not precached');
ok(!errs.length,'no page errors '+errs.join(';').slice(0,200));
const gr=await p.evaluate(()=>[...document.querySelectorAll('#theme-sel optgroup')].map(g=>({l:g.label,o:[...g.children].map(o=>o.textContent)})));
ok(gr.map(g=>g.l).join()==='Album colors,Pride,Seasonal,Other themes','picker groups '+gr.map(g=>g.l));
const srt=a=>a.every((x,i)=>!i||a[i-1].localeCompare(x,'en',{sensitivity:'base'})<=0);
ok(gr.slice(1).every(g=>srt(g.o)),'groups after Album colors are alphabetical');
await b.close();console.log(f?'t158 FAILED':'t158 ok');process.exit(f?1:0)})()
