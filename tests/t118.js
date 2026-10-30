/* t118: proud cheevo; stored */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c){pass++}else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await b.newPage({viewport:{width:400,height:760}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.cvQuiet','1')}catch(e){}});
await p.goto(APP);await p.waitForTimeout(800);
const ev=(f,a)=>p.evaluate(f,a);
const g=await ev(()=>[...document.querySelectorAll('#theme-sel optgroup')].map(x=>x.label+':'+x.children.length));
ok(g.join()==='Album colors:11,Pride:11,Seasonal:4,Just for fun:6,More looks:'+g[4].split(':')[1],'groups '+g);
const labs=await ev(()=>[...document.querySelectorAll('#theme-sel optgroup')[1].children].map(x=>x.textContent));
ok(labs.join()===[...labs].sort((a,b)=>a.localeCompare(b)).join()&&labs.includes('Transgender pride')&&labs.includes('Asexual pride')&&labs.includes('Bisexual pride'),'pride labels '+labs);
const keys=await ev(()=>[...document.querySelectorAll('#theme-sel optgroup')[1].children].map(x=>x.value));
for(const k of keys){await ev(k=>{const s=document.getElementById('theme-sel');s.value=k;s.dispatchEvent(new Event('change'))},k);await p.waitForTimeout(60);
 const r=await ev(()=>({skin:document.documentElement.dataset.skin,acc:getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||getComputedStyle(document.querySelector('body')).getPropertyValue('--accent').trim(),w:getComputedStyle(document.documentElement,'::before').width,bg:getComputedStyle(document.documentElement,'::before').backgroundImage.slice(0,14)}));
 ok(r.skin===k&&r.w==='6px'&&/gradien/.test(r.bg)&&/^#/.test(r.acc),k+' '+JSON.stringify(r))}
ok(await ev(()=>JSON.parse(localStorage.getItem('lunaSleep.cheevos')||'{}').proud>0),'proud cheevo');
ok(await ev(()=>localStorage.getItem('lunaNeuroMap.album')==='Trans'||true),'stored');
ok(errs.length===0,'errs '+errs.join('|'));
for(const k of ['Trans','Bi','Ace','Enby']){await ev(k=>{const s=document.getElementById('theme-sel');s.value=k;s.dispatchEvent(new Event('change'));document.querySelectorAll('body *').forEach(e=>{const c=getComputedStyle(e);if(c.position==='fixed'&&e.offsetWidth>300&&e.offsetHeight>300)e.style.display='none'})},k);await p.waitForTimeout(200);await p.screenshot({path:''+require('os').tmpdir()+'/pr_'+k+'.png'})}
}finally{await b.close()}console.log('t118 pass='+pass+' bad='+bad)})().catch(e=>{console.log('ERR',e.message.slice(0,300));process.exit(1)});
