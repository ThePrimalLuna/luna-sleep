/* Three listeners on a dark-mode phone: brand new, returning after a week, and a veteran.
   Checks what each one sees first, that the next step is right for them, and that nothing errors.
   Screenshots go to tests/out/ (ignored by git) for a human to look at. */
const {chromium,devices}=require('playwright'),path=require('path'),fs=require('fs');
const APP='file://'+path.resolve(__dirname,'..','index.html'),OUT=path.join(__dirname,'out');fs.mkdirSync(OUT,{recursive:true});
let pass=0,bad=0;const ok=(c,m)=>{if(c)pass++;else{bad++;console.log('FAIL',m)}};
const DAY=864e5;const LOGV=(fs.readFileSync(path.resolve(__dirname,'..','index.html'),'utf8').match(/LOGV='([^']+)'/)||[])[1];
const visibleOverlays=p=>p.evaluate(()=>[...document.querySelectorAll('#den,#new-dlg,#cx-dlg,#nag,#toast,.toast,.cheevo-pop,#sos,#bed,[role=dialog],[role=alertdialog]')]
  .filter(e=>!e.hidden&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden'&&e.getBoundingClientRect().height>20).map(e=>e.id||String(e.className).split(' ')[0]));
const homeInfo=p=>p.evaluate(()=>{const v=document.getElementById('view');const card=v.querySelector('.tonight');
  return {start:(v.querySelector('.tnstart')||{}).textContent||null,primaries:card?[...card.querySelectorAll('.btn.primary')].map(b=>b.textContent.trim()):[],
    nag:(()=>{const n=document.getElementById('nag');return n&&!n.hidden?n.textContent.trim().slice(0,90):''})(),
    pickup:/Pick up where you left off/.test(v.innerText),skin:document.documentElement.dataset.skin}});

async function persona(b,name,seed){
  const c=await b.newContext({...devices['iPhone 13'],colorScheme:'dark'});const p=await c.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load resource/.test(m.text()))errs.push(m.text().slice(0,120))});
  await p.addInitScript(()=>{navigator.vibrate=()=>true});
  if(seed){await p.goto(APP);await p.waitForTimeout(500);await p.evaluate(`window.LOGV_=${JSON.stringify(LOGV)}`);await p.evaluate(seed);}
  await p.goto(APP);await p.waitForTimeout(1300);
  const first=await visibleOverlays(p);await p.screenshot({path:path.join(OUT,name+'-1-open.png')});
  return {p,c,errs,first}}

const closeAll=p=>p.evaluate(()=>{const d=document.getElementById('new-dlg');if(d&&!d.hidden){const x=d.querySelector('[data-close],.x,button');(document.getElementById('new-close')||x).click()}try{cxDismiss()}catch(e){}});

(async()=>{const b=await chromium.launch();try{
  // 1. Brand new: the gate, then Home
  {const {p,c,errs,first}=await persona(b,'new',null);
   ok(first.includes('den'),'new: welcome gate first ('+first+')');
   ok(first.length===1,'new: nothing else competes with the gate ('+first+')');
   await p.evaluate(()=>{document.getElementById('den-ack').click();document.getElementById('den-enter').click()});await p.waitForTimeout(900);
   const after=await visibleOverlays(p);await p.screenshot({path:path.join(OUT,'new-2-home.png')});
   const h=await homeInfo(p);
   ok(h.start==='Start my night with THE CALL','new: one start button for THE CALL ('+h.start+')');
   ok(h.primaries.length===1,'new: one primary button on the Tonight card ('+h.primaries+')');
   ok(!h.nag,'new: no backup nag ('+h.nag+')');ok(h.skin==='Dusk','new: Dusk on a dark phone');
   console.log('  new: after the gate ->',JSON.stringify(after));
   ok(!errs.length,'new: errors '+errs.join('|'));await c.close()}

  // 2. Returning: three Foundation tracks a week ago, has not seen the last two updates
  {const {p,c,errs,first}=await persona(b,'returning',()=>{const t=Date.now()-8*864e5;
     localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.newSeen','2026-10-27a');
     const k='lunaNeuroMap.v2';const x=JSON.parse(localStorage.getItem(k)||'{}');x.done={'SKU 00':true,'SKU 01':true,'SKU 02':true};x.hlog=[{id:'SKU 00',t:t-2*864e5},{id:'SKU 01',t:t-864e5},{id:'SKU 02',t}];x.welcomed=true;
     localStorage.setItem(k,JSON.stringify(x));localStorage.setItem('lunaSleep.last',JSON.stringify({ids:['SKU 02'],pt:t}))});
   ok(first.includes('new-dlg'),'returning: What\'s new shows once ('+first+')');
   const top=await p.evaluate(()=>{const d=document.getElementById('new-dlg');const m=d&&d.innerText.match(/v\d+ \u00b7 [^\n]+/);return m?m[0]:''});
   ok(/^v63/.test(top),'returning: newest entry on top: '+top);
   await closeAll(p);await p.waitForTimeout(400);await p.screenshot({path:path.join(OUT,'returning-2-home.png')});
   const h=await homeInfo(p);
   ok(h.start==='Start my night with THE DEN','returning: next Foundation track is THE DEN ('+h.start+')');
   ok(h.primaries.length===1,'returning: one primary button ('+h.primaries+')');
   console.log('  returning: home ->',JSON.stringify(h));
   await p.goto(APP);await p.waitForTimeout(900);ok(!(await visibleOverlays(p)).includes('new-dlg'),'returning: What\'s new does not show twice');
   ok(!errs.length,'returning: errors '+errs.join('|'));await c.close()}

  // 3. Veteran: Foundation done, 40 tracks heard, adult on, own theme, mixes, plan for tonight, old backup
  {const {p,c,errs,first}=await persona(b,'veteran',()=>{const now=Date.now();
     localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.newSeen',LOGV_);
     const k='lunaNeuroMap.v2';const x=JSON.parse(localStorage.getItem(k)||'{}');x.done={};x.hlog=[];
     const ids=Object.keys(TI).filter(id=>released(TI[id].date));ids.slice(0,40).forEach((id,i)=>{x.done[id]=true;x.hlog.push({id,t:now-(40-i)*864e5})});
     CAT.found.forEach(f=>x.done[f.sku]=true);x.fullOk=true;x.welcomed=true;x.lastBackup=now-45*864e5;x.identity='Prism';
     x.profile={name:'Moss'};x.plan={at:now-3600e3,ids:[ids[3]]};x.read={};STORIES.slice(0,4).forEach(s=>x.read[s.id]=1);
     localStorage.setItem(k,JSON.stringify(x));localStorage.setItem('lunaNeuroMap.album','Harvest');
     localStorage.setItem('lunaSleep.mixes',JSON.stringify({list:[{n:'Rain hush',t:'rain',s:1,h:'violet'}]}));
     localStorage.setItem('lunaSleep.cheevos',JSON.stringify({first:now,found:now}));window.__vetPlan=TI[ids[3]].title;localStorage.setItem('vetPlan',TI[ids[3]].title)});
   const plan=await p.evaluate(()=>localStorage.getItem('vetPlan'));
   ok(!first.includes('new-dlg')&&!first.includes('den'),'veteran: straight to Home ('+first+')');
   const h=await homeInfo(p);console.log('  veteran: home ->',JSON.stringify(h));
   ok(h.start==='Start my night with '+plan,'veteran: start button follows tonight\'s plan ('+h.start+' vs '+plan+')');
   ok(h.skin==='Harvest','veteran: own theme kept on a dark phone ('+h.skin+')');
   ok(/backup|saved on this phone/i.test(h.nag),'veteran: reminded to back up after 45 days ('+h.nag+')');
   ok(/Moss/.test(await p.evaluate(()=>document.getElementById('view').innerText)),'veteran: greeted by name');
   await p.screenshot({path:path.join(OUT,'veteran-1-home.png'),fullPage:false});
   await p.evaluate(()=>document.querySelector('#view .tnstart').click());await p.waitForTimeout(500);
   const sel=await p.evaluate(()=>{const s=document.getElementById('tn-track');return s?s.options[s.selectedIndex].textContent:''});
   ok(sel.startsWith(plan),'veteran: Start my night preselects the planned track ('+sel+')');
   await p.evaluate(()=>{try{cxDismiss()}catch(e){}});
   for(const t of ['map','cat','combo','bonus','ideas']){await p.evaluate(t=>{S.tab=t;render()},t);await p.waitForTimeout(200);await p.screenshot({path:path.join(OUT,'veteran-tab-'+t+'.png')})}
   {const r=await p.evaluate(()=>{Object.keys(TI).forEach(id=>S.done[id]=true);S.plan=null;S.tab='home';render();const b=document.querySelector('#view .tnstart');return b?b.textContent:'missing'});
    ok(/^Start my night/.test(r),'veteran with everything heard still gets a start button ('+r+')')}
   ok(!errs.length,'veteran: errors '+errs.join('|'));await c.close()}
}catch(e){bad++;console.log('ERR',e.message)}finally{await b.close()}
console.log('personas pass='+pass+' bad='+bad);process.exit(bad?1:0)})();
