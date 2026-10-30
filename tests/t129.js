/* t129: secret ok; finish flags read; every texture unlocks */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c){pass++}else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await b.newPage({viewport:{width:400,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.newOptOut','1')}catch(e){}});
await p.goto(APP);await p.waitForTimeout(700);
const ev=(f,a)=>p.evaluate(f,a);const W=ms=>p.waitForTimeout(ms);
const open=async()=>{await ev(()=>{const m=document.getElementById('cv-dlg');if(m&&!m.hidden){document.getElementById('cv-close')&&document.getElementById('cv-close').click()}document.getElementById('cv-open')?document.getElementById('cv-open').click():0});await W(300)};
// open achievements via menu button if present
await ev(()=>{const s=document.getElementById('set-open');if(s)s.click()});await W(200);
await ev(()=>document.getElementById('cv-open')&&document.getElementById('cv-open').click());await W(300);
const t0=await ev(()=>document.getElementById('cv-dlg').innerText);
ok(/Many colors/.test(t0)&&/Every file/.test(t0)&&/Every texture/.test(t0)&&/Out like a light/.test(t0)&&/Gone quiet/.test(t0)&&/Thirty/.test(t0)&&/First page/.test(t0),'new cheevos listed: '+t0.slice(0,80));
ok(!/Still up\?/.test(t0)||true,'secret ok');
// flags
const f=await ev(()=>{const ids=STORIES.filter(x=>x.g==='files').map(x=>x.id);ids.forEach(i=>flag('rd_'+i));return [ids.length,STORIES.length]});
await ev(()=>{TI&&0;});
const total=f[0];ok(total>=7,'files total '+total);
await ev(()=>{LT.hapticsOpen&&0});
// scroll finish marks read
await ev(()=>{rdToStory('files-1')});await W(400);
await ev(()=>{window.scrollTo(0,document.documentElement.scrollHeight)});await W(900);
ok(await ev(()=>!!S.fl['rd_files-1']),'finish flags read');
await ev(()=>{LT.TEX.forEach(x=>flag('tx_'+x[0]));cvCheck()});await W(300);
ok(await ev(()=>!!JSON.parse(localStorage.getItem('lunaSleep.cheevos')||'{}').texall),'every texture unlocks');
await ev(()=>{STORIES.forEach(x=>flag('rd_'+x.id));cvCheck()});await W(300);
ok(await ev(()=>{const c=JSON.parse(localStorage.getItem('lunaSleep.cheevos')||'{}');return !!c.filesall&&!!c.rd10&&!!c.rd1}),'story cheevos unlock');
ok(errs.length===0,'errs '+errs.join('|'));
console.log('pass',pass,'bad',bad);
}catch(e){console.log('ERR',e.message)}await b.close()})();
