/* t112: #cx-body button; hero for new user; tools hub */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c){pass++}else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const ctx=await b.newContext({viewport:{width:400,height:820},hasTouch:true});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__v=[];navigator.vibrate=function(x){window.__v.push(x);return true};try{}catch(e){}});
await p.goto(APP);await p.waitForTimeout(900);
const ev=(f,a)=>p.evaluate(f,a);
const title=()=>ev(()=>document.getElementById('cx-h').textContent);
const cxOpenQ=()=>ev(()=>!document.getElementById('cx-dlg').hidden);
const clickIn=(t,sel)=>ev(([t,sel])=>{const x=[...document.querySelectorAll(sel)].find(b=>(b.textContent||'').trim().startsWith(t));if(x){x.click();return true}return false},[t,sel]);
// menu
const vis=await ev(()=>[...document.querySelectorAll('#set-quick button')].filter(b=>!b.closest('#menu-legacy')).map(b=>b.textContent.trim()));
ok(vis.length<=14,'menu items '+vis.length+' '+vis.join('|'));
for(const [id,tt,item,after] of [['st-open','Settle tools','Breathe',()=>ev(()=>!document.getElementById('cx-dlg').hidden&&document.getElementById('cx-h').textContent.length>0&&document.getElementById('cx-h').textContent!=='Settle tools')],
  ['af-open','Afterward','Return ritual',()=>ev(()=>!document.getElementById('fs').hidden)],
  ['me-open','About you','Achievements',()=>ev(()=>!document.getElementById('cv-dlg').hidden)],
  ['dv-open','This device','Save and restore',()=>ev(()=>!document.getElementById('io-dlg').hidden)]]){
 await ev(()=>{document.getElementById('set-dlg').hidden=false});
 await ev(id=>document.getElementById(id).click(),id);ok(await title()===tt,'hub '+tt+' got '+await title());
 ok(await clickIn(item,'#cx-body button'),'click '+item);await p.waitForTimeout(250);
 const r=await after();ok(r,'opened '+item);
 await ev(()=>{try{cxClose()}catch(e){};['cv-dlg','io-dlg'].forEach(i=>{const d=document.getElementById(i);if(d)d.hidden=true});const f=document.getElementById('fs');if(f&&!f.hidden){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}))}document.getElementById('set-dlg').hidden=true;document.body.style.overflow=''});await p.waitForTimeout(200)}
// home
const home=await ev(()=>({fold:!!document.querySelector('details.fold .youbody'),open:document.querySelector('details.fold .youbody')?.closest('details').open,hero:!!document.querySelector('.home-hero'),more:[...document.querySelectorAll('.tonight .btn')].map(b=>b.textContent.trim())}));
ok(home.fold&&home.open===false,'progress fold closed '+JSON.stringify(home));ok(home.hero,'hero for new user');ok(home.more.includes('More tools')&&home.more.length<=7,'tonight buttons '+home.more.join('|'));
await ev(()=>{document.querySelectorAll('.tonight .btn').forEach(b=>{if(b.textContent==='More tools')b.click()})});ok(await title()==='More tonight tools','tools hub');await ev(()=>cxClose());
// feel chip + dock
const info=await ev(()=>{const ks=Object.keys(TI).filter(k=>TI[k].spotify);return ks.slice(0,40).map(k=>[k,TI[k].title,TI[k].spotify.slice(0,50),TI[k].date])});console.log(JSON.stringify(info.slice(0,5)));
const tr=await ev(()=>{const k=Object.keys(TI).find(k=>/STREAM/i.test(TI[k].title)&&TI[k].spotify);return k||null});
ok(!!tr,'found STREAM '+tr);
if(tr){await ev(k=>openTrack(k),tr);await p.waitForTimeout(400);
 const feel=await ev(()=>[...document.querySelectorAll('#side button, .side button')].map(b=>b.textContent.trim()).filter(t=>/Feel it|Play here/.test(t)));console.log('side',feel);ok(feel.includes('Play here'),'play here btn');ok(feel.some(t=>/Feel it: Tide/.test(t)),'feel chip');
 await ev(()=>{[...document.querySelectorAll('#side button')].find(b=>b.textContent==='Play here').click()});await p.waitForTimeout(300);
 const dk=await ev(()=>{const d=document.getElementById('pdock');const f=d.querySelector('iframe');return {hidden:d.hidden,src:f&&f.src,cls:document.body.classList.contains('hasdock'),feel:/Feel it/.test(d.innerText)}});
 ok(!dk.hidden&&/embed\/episode\//.test(dk.src||'')&&dk.cls&&dk.feel,'dock '+JSON.stringify(dk));
 await ev(()=>document.querySelector('.pdmin').click());ok(await ev(()=>document.getElementById('pdock').classList.contains('min')),'dock min');
 await ev(()=>LT.bedOpen());ok(await ev(()=>document.getElementById('pdock').classList.contains('min')&&!document.getElementById('pdock').hidden),'bed keeps dock');await ev(()=>{document.getElementById('bed').hidden=true});
 await ev(()=>sosOpen());ok(await ev(()=>document.getElementById('pdock').hidden&&!document.getElementById('pdock').querySelector('iframe')),'EE stops dock');
 await ev(()=>{const x=document.getElementById('sos-close');if(x)x.click()});
 await ev(k=>openTrack(k),tr);await p.waitForTimeout(300);await ev(()=>{[...document.querySelectorAll('#side button')].find(b=>b.textContent==='Play here').click()});
 await ev(()=>window.qhShow());ok(await ev(()=>document.getElementById('pdock').hidden),'quick hide stops dock')}
ok(errs.length===0,'errors '+errs.join('|'));
}finally{await b.close()}
console.log('t112 pass='+pass+' bad='+bad)})().catch(e=>{console.log('ERR',e.message.slice(0,300));process.exit(1)});
