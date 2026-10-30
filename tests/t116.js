/* t116: all ids; 4 sections w icons; accordion */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c){pass++}else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await b.newPage({viewport:{width:400,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.cheevoInit','1')}catch(e){}});
await p.goto(APP);await p.waitForTimeout(800);
const ev=(f,a)=>p.evaluate(f,a);
await ev(()=>{document.getElementById('set-open').click();document.getElementById('set-settings').open=true});
const ids=['theme-sel','a11y-size','set-calm','a11y-hc','a11y-font','a11y-shp','set-simple','a11y-cvd','adult-btn','trig-btn','set-ident','set-start','set-cvquiet','set-newopt','set-qhauto','set-tuck','set-showpanic','set-sosreset','set-panicreset','set-off','inst-btn'];
ok(await ev(i=>i.every(x=>!!document.getElementById(x)),ids),'all ids');
ok(await ev(()=>document.querySelectorAll('#set-settings .setsub').length===4&&document.querySelectorAll('#set-settings .setsub>summary .ic').length===4),'4 sections w icons');
await ev(()=>document.querySelector('#sg-content>summary').click());await p.waitForTimeout(100);
ok(await ev(()=>document.getElementById('sg-content').open&&!document.getElementById('sg-look').open),'accordion');
// toggles work
await ev(()=>document.querySelector('#sg-safety>summary').click());
await ev(()=>document.getElementById('set-calm').click());ok(await ev(()=>document.documentElement.classList.contains('calm')),'reduce motion toggles');
await ev(()=>document.getElementById('set-calm').click());
await ev(()=>document.getElementById('set-tuck').click());ok(await ev(()=>document.getElementById('sos-open').classList.contains('tucked')),'tuck toggles');
await ev(()=>document.getElementById('set-tuck').click());
ok(await ev(()=>document.getElementById('adult-btn').textContent.length>0&&document.getElementById('set-off').textContent!=='Checking.'),'adult text/offline text '+await ev(()=>document.getElementById('set-off').textContent));
// theme select
const g=await ev(()=>[...document.querySelectorAll('#theme-sel optgroup')].map(x=>x.label+':'+x.children.length));
ok(g.length===5&&/Album colors:11/.test(g[0])&&/Seasonal:4/.test(g[2])&&/Just for fun:6/.test(g[3]),'groups '+g);
const more=await ev(()=>[...document.querySelectorAll('#theme-sel optgroup')[4].children].map(x=>x.textContent));
ok(more.includes('Rainy Day')&&more.join()===[...more].sort((a,b)=>a.localeCompare(b)).join(),'sorted more looks '+more.length);
await ev(()=>{const s=document.getElementById('theme-sel');s.value='Rainy';s.dispatchEvent(new Event('change'))});await p.waitForTimeout(300);
const r=await ev(()=>({skin:document.documentElement.dataset.skin,bg:getComputedStyle(document.documentElement,'::before').backgroundImage.slice(0,30),an:getComputedStyle(document.documentElement,'::before').animationName,pe:getComputedStyle(document.documentElement,'::after').pointerEvents,ch:JSON.parse(localStorage.getItem('lunaSleep.cheevos')||'{}').rainy}));
ok(r.skin==='Rainy'&&/svg/.test(r.bg)&&r.an==='rainFar'&&r.pe==='none'&&!!r.ch,'rainy applied '+JSON.stringify(r));
await ev(()=>{document.getElementById('set-calm').click()});await p.waitForTimeout(150);
ok(await ev(()=>getComputedStyle(document.documentElement,'::before').animationName==='none'),'calm stops rain');
ok(errs.length===0,'errs '+errs.join('|'));
await ev(()=>{document.getElementById('set-calm').click()});
await p.screenshot({path:''+require('os').tmpdir()+'/q_set.png'});
}finally{await b.close()}console.log('t116 pass='+pass+' bad='+bad)})().catch(e=>{console.log('ERR',e.message.slice(0,300));process.exit(1)});
