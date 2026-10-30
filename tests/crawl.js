/* Full pass: opens every tab, track, article, story, tool and theme on a dark-mode phone and a light desktop,
   checks the safety features, a backup round trip, and that the installed app opens offline.
   Fails on page errors, horizontal overflow, things that do not open, low theme contrast or a lost setting. */
const {chromium,devices}=require('playwright'),path=require('path'),http=require('http'),fs=require('fs');
const ROOT=path.resolve(__dirname,'..'),APP='file://'+path.join(ROOT,'index.html');
let pass=0,bad=0;const ok=(c,m)=>{if(c)pass++;else{bad++;console.log('FAIL',m)}};
const SEED=()=>{try{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.newOptOut','1');localStorage.setItem('lunaSleep.cheevoInit','1')}}catch(e){}};
const noise=t=>/ERR_TUNNEL|ERR_NAME|ERR_INTERNET|net::|Failed to load resource|fonts\.g/.test(t);
async function page(b,opts){const c=await b.newContext(opts);const p=await c.newPage();p._errs=[];
  p.on('pageerror',e=>p._errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!noise(m.text()))p._errs.push('console: '+m.text().slice(0,140))});
  await p.addInitScript(SEED);await p.addInitScript(()=>{navigator.vibrate=()=>true});return p}
const errsSince=(p,n)=>p._errs.slice(n);
const overflow=p=>p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);

async function sweep(p,label){
  await p.goto(APP);await p.waitForTimeout(900);
  // tabs
  const tabs=await p.evaluate(()=>TABS.map(t=>t[0]));
  for(const t of tabs){const n=p._errs.length;await p.evaluate(t=>{S.tab=t;S.sel=null;render()},t);await p.waitForTimeout(150);
    ok(!errsSince(p,n).length,label+' tab '+t+' errors '+errsSince(p,n).join('|'));ok(await overflow(p)<=1,label+' tab '+t+' overflows sideways')}
  // every track, adult off then on
  for(const adult of [false,true]){
    const r=await p.evaluate(async adult=>{S.fullOk=adult;S.tab='cat';render();const fails=[];let n=0;
      for(const id of Object.keys(TI)){try{openTrack(id);n++;const s=document.getElementById('side');if(!s||!s.querySelector('h2'))fails.push(id+' no title');
        if(document.documentElement.scrollWidth>document.documentElement.clientWidth+1)fails.push(id+' overflow')}catch(e){fails.push(id+' '+e.message)}}
      S.sel=null;render();return {n,fails}},adult);
    ok(r.n>200&&!r.fails.length,label+' tracks (adult '+adult+') opened '+r.n+' fails '+r.fails.slice(0,5).join(', '))}
  // every article and bonus text
  {const r=await p.evaluate(()=>{const fails=[];let n=0;for(const a of ALLR){try{goRes(a.id);n++;const v=document.getElementById('view');if(!v.innerText.includes(a.title.slice(0,30)))fails.push(a.id+' title missing')}catch(e){fails.push(a.id+' '+e.message)}}
      S.resOpen=null;S.bonusOpen=null;S.tab='home';render();return {n,fails}});
    ok(r.n===await p.evaluate(()=>ALLR.length)&&!r.fails.length,label+' articles opened '+r.n+' fails '+r.fails.slice(0,5).join(', '))}
  // every story
  {const r=await p.evaluate(()=>{const fails=[];let n=0;for(const s of STORIES){try{rdToStory(s.id);n++;if(!document.body.innerText.includes(s.title.slice(0,20)))fails.push(s.id)}catch(e){fails.push(s.id+' '+e.message)}}return {n,fails}});
    ok(r.n>0&&!r.fails.length,label+' stories opened '+r.n+' fails '+r.fails.slice(0,5).join(', '))}
  // every tool, each on a fresh load so one cannot hide another's problem
  const tools=await p.evaluate(()=>Object.keys(LT).filter(k=>/Open$/.test(k)&&typeof LT[k]==='function'&&!['hubOpen','readOpen'].includes(k)));
  const hubs=['settle','after','you','device','tools'];
  const jobs=tools.map(k=>['tool '+k,`LT.${k}()`]).concat(hubs.map(h=>['hub '+h,`LT.hubOpen('${h}')`]));
  jobs.push(['guided read',"LT.readOpen(RES.find(r=>!r.adult))"]);
  for(const [name,code] of jobs){await p.goto(APP);await p.waitForTimeout(500);const n=p._errs.length;
    const shown=await p.evaluate(async code=>{try{(0,eval)(code)}catch(e){return 'threw '+e.message}await new Promise(r=>setTimeout(r,450));
      const vis=[...document.querySelectorAll('#cx-dlg,#bed,#sos,#tp-dlg,#rd,.cxfull,[role=dialog]')].some(e=>!e.hidden&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>60);return vis?'ok':'nothing visible'},code);
    ok(shown==='ok',label+' '+name+': '+shown);ok(!errsSince(p,n).length,label+' '+name+' errors '+errsSince(p,n).join('|'));
    const esc=await p.evaluate(()=>{document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));return true});await p.waitForTimeout(120)}
}

(async()=>{const b=await chromium.launch();try{
  const ONLY=process.env.ONLY||'';/* ONLY=quick skips the long sweeps */
  const phone=await page(b,{...devices['iPhone 13'],colorScheme:'dark'});if(ONLY!=='quick')await sweep(phone,'phone');
  const desk=await page(b,{viewport:{width:1280,height:800},colorScheme:'light'});if(ONLY!=='quick')await sweep(desk,'desktop');

  // themes: every option applies and keeps readable text
  {const p=desk;await p.goto(APP);await p.waitForTimeout(700);
   const r=await p.evaluate(()=>{const lum=c=>{const m=c.match(/[\d.]+/g);if(!m)return null;const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(+m[0])+.7152*f(+m[1])+.0722*f(+m[2])};
     const cr=(a,b)=>{const x=lum(a),y=lum(b);if(x==null||y==null)return 99;return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
     const probe=document.createElement('div');document.body.append(probe);const col=v=>{probe.style.color='var('+v+')';return getComputedStyle(probe).color};
     const sel=document.getElementById('theme-sel');const out=[];
     for(const o of sel.options){if(!o.value)continue;sel.value=o.value;sel.dispatchEvent(new Event('change'));
       const ink=col('--ink'),bg=col('--bg'),sf=col('--surface'),mu=col('--mute');const a=cr(ink,bg),s=cr(ink,sf),m=cr(mu,sf);
       if(document.documentElement.dataset.skin!==o.value)out.push(o.value+' did not apply');
       if(a<4.5||s<4.5||m<3)out.push(o.value+' ink/bg '+a.toFixed(1)+' ink/surface '+s.toFixed(1)+' mute/surface '+m.toFixed(1))}
     sel.value='';sel.dispatchEvent(new Event('change'));probe.remove();return {n:sel.options.length,out}});
   ok(!r.out.length,'themes ('+r.n+'): '+r.out.join('; '))}

  // safety: Emergency Exit, Quick hide, Get help with no network
  {const p=phone;await p.goto(APP);await p.waitForTimeout(700);await p.context().setOffline(true);
   await p.evaluate(()=>sosOpen());await p.waitForTimeout(300);
   const s=await p.evaluate(()=>{const e=document.getElementById('sos');return !e.hidden&&/AWAKE|HUMAN/.test(e.textContent)&&/Human Trafficking Hotline/.test(e.textContent)});ok(s,'Emergency Exit opens offline with exit steps and Get help');
   await p.evaluate(()=>document.getElementById('sos-close').click());await p.waitForTimeout(200);ok(await p.evaluate(()=>document.getElementById('sos').hidden),'Emergency Exit closes');
   await p.evaluate(()=>document.getElementById('qh-open').click());await p.waitForTimeout(200);
   ok(await p.evaluate(()=>!document.getElementById('qh').hidden&&document.title==='Notes'),'Quick hide covers the app');
   await p.evaluate(()=>qhHide());ok(await p.evaluate(()=>document.getElementById('qh').hidden),'Quick hide undoes');
   await p.context().setOffline(false)}

  // backup round trip: everything set, wiped, restored
  {const p=desk;await p.goto(APP);await p.waitForTimeout(700);
   const before=await p.evaluate(()=>{S.done['SKU 00']=true;S.done['SKU 01']=true;S.profile=Object.assign(S.profile||{},{name:'Test Wolf'});S.rdTheme='night';S.rdFont='easy';save();
     localStorage.setItem('lunaSleep.mixes',JSON.stringify({list:[{n:'Mine',pat:'swell',lvl:2,bpm:55,hue:'blue'}]}));
     localStorage.setItem('lunaSleep.act',JSON.stringify({h:['SKU 00'],r:['files-1'],d:{'2026-10-29':{h:1,r:1}}}));
     localStorage.setItem('lunaSleep.hc','1');localStorage.setItem('lunaSleep.tsz','lg');localStorage.setItem('lunaSleep.calm','1');
     localStorage.setItem('lunaSleep.rdpos',JSON.stringify({'files-1':{f:0.42,t:Date.now()}}));
     const sel=document.getElementById('theme-sel');sel.value='Dusk';sel.dispatchEvent(new Event('change'));
     const snap={};Object.keys(localStorage).filter(k=>/^luna/.test(k)).sort().forEach(k=>snap[k]=localStorage.getItem(k));return {snap,text:backup()}});
   await p.evaluate(()=>{Object.keys(localStorage).filter(k=>/^luna/.test(k)).forEach(k=>localStorage.removeItem(k))});
   await p.goto(APP);await p.waitForTimeout(700);
   await p.evaluate(t=>{const m=document.createElement('p');doRestore(t,m)},before.text);await p.waitForTimeout(500);await p.goto(APP);await p.waitForTimeout(700);
   const after=await p.evaluate(()=>{const snap={};Object.keys(localStorage).filter(k=>/^luna/.test(k)).sort().forEach(k=>snap[k]=localStorage.getItem(k));return snap});
   const lost=['lunaSleep.mixes','lunaSleep.act','lunaNeuroMap.album','lunaSleep.hc','lunaSleep.tsz','lunaSleep.calm','lunaSleep.rdpos'].filter(k=>{const a=before.snap[k],z=after[k];if(k==='lunaSleep.rdpos')return !(z&&JSON.parse(z)['files-1']&&JSON.parse(z)['files-1'].f===0.42);if(k==='lunaSleep.act')return !(z&&JSON.parse(z).h.includes('SKU 00'));return a!==z});
   ok(!lost.length,'backup restores separate keys; lost: '+lost.join(', '));
   const st=await p.evaluate(()=>({done:!!S.done['SKU 00']&&!!S.done['SKU 01'],name:S.profile&&S.profile.name,rd:S.rdTheme+'/'+S.rdFont}));
   ok(st.done&&st.name==='Test Wolf'&&st.rd==='night/easy','backup restores progress, profile and reader: '+JSON.stringify(st))}

  // offline: the installed app opens with no connection
  {const srv=http.createServer((q,r)=>{let f=decodeURIComponent(q.url.split('?')[0]);if(f==='/')f='/index.html';const fp=path.join(ROOT,f);
     if(!fp.startsWith(ROOT)||!fs.existsSync(fp)||fs.statSync(fp).isDirectory()){r.writeHead(404);return r.end()}
     const ty={'.html':'text/html','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'}[path.extname(fp)]||'application/octet-stream';
     r.writeHead(200,{'Content-Type':ty});fs.createReadStream(fp).pipe(r)});
   await new Promise(r=>srv.listen(0,'127.0.0.1',r));const url='http://localhost:'+srv.address().port+'/index.html';
   const c=await b.newContext({...devices['iPhone 13']});const p=await c.newPage();await p.addInitScript(SEED);await p.goto(url);
   const ready=await p.evaluate(async()=>{if(!navigator.serviceWorker)return false;await navigator.serviceWorker.ready;return true});ok(ready,'service worker installs');
   await p.reload();await p.waitForTimeout(600);await c.setOffline(true);await p.reload();await p.waitForTimeout(900);
   const off=await p.evaluate(()=>({title:document.title,txt:(document.getElementById('view')||{}).innerText||''}));
   ok(/Luna Sleep/.test(off.title)&&off.txt.length>200,'app opens offline ('+off.txt.length+' chars)');
   await c.close();srv.close()}

  ok(!phone._errs.length&&!desk._errs.length,'no stray errors: '+phone._errs.concat(desk._errs).slice(0,5).join(' | '));
}catch(e){bad++;console.log('ERR',e.message)}finally{await b.close()}
console.log('crawl pass='+pass+' bad='+bad);process.exit(bad?1:0)})();
