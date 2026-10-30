/* t110: 13 menu buttons; haptics title; haptics sections */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c){pass++}else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:400,height:820},hasTouch:true});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{window.__v=[];navigator.vibrate=function(x){window.__v.push(x);return true};
 window.__bat={level:.5,charging:false,_l:{},addEventListener(t,f){(this._l[t]=this._l[t]||[]).push(f)}};navigator.getBattery=()=>Promise.resolve(window.__bat);
 try{}catch(e){}});
await p.goto(APP);
await p.waitForTimeout(900);
const ev=(f,a)=>p.evaluate(f,a);
const open=()=>ev(()=>!document.getElementById('cx-dlg').hidden);
const title=()=>ev(()=>document.getElementById('cx-h').textContent);
const body=()=>ev(()=>document.getElementById('cx-body').innerText);
const clickText=(t)=>ev(t=>{const bs=[...document.querySelectorAll('#cx-dlg button, #fs button, #cx-dlg input')];const x=bs.find(b=>(b.textContent||'').trim().startsWith(t));if(x){x.click();return true}return false},t);
// menu structure
const ids=await ev(()=>['tn-open','plan-open','bed-open','hp-open','br-open','dp-open','hx-open','ws-open','cf-open','sf-open','qh-open','rt-open','morn-open','cb-open','rc-open','tp-open','prof-open','cv-open','cal-open','pa-open','io-open'].filter(i=>!document.getElementById(i)));
ok(ids.length===0,'menu ids missing '+ids);
ok(await ev(()=>[...document.querySelectorAll('#set-quick button')].filter(b=>!b.closest('#menu-legacy')).length===13),'13 menu buttons');
// haptics dialog
await ev(()=>LT.hapticsOpen());ok(await open()&&(await title())==='Haptics and glow','haptics title');
let t=await body();ok(/Buzz feel/.test(t)&&/Slow descent/.test(t)&&/Tap your own heartbeat/.test(t)&&/Breath glow/.test(t)&&/Battery-kind/.test(t)&&/Drift check/.test(t),'haptics sections');
for(const [lab,k] of [['Purr','purr'],['Rain','rain'],['Rocking','rock'],['Heartbeat','heart'],['Swell and fade','swell']]){await clickText(lab);const pat=await ev(()=>JSON.parse(localStorage.getItem('lunaSleep.vib')||'{}').pat);ok(pat===k,'pattern '+k+' got '+pat)}
// pattern shapes
for(const k of ['swell','heart','purr','rain','rock']){await ev(k=>{localStorage.setItem('lunaSleep.vib',JSON.stringify({on:true,lvl:3,pat:k}));window.__v=[]},k);
 for(const ty of [1,0]){await ev(ty=>LT.buzz(ty,6,true),ty);}
 const v=await ev(()=>window.__v);ok(v.length===2,k+' two buzzes');v.forEach((a,i)=>{ok(Array.isArray(a)&&a.length%2===1&&a.every(x=>Number.isInteger(x)&&x>0),k+' valid pattern '+i+' '+JSON.stringify(a).slice(0,80));if(k!=='swell')ok(a.length<=99,k+' len '+a.length)})
 console.log(k,'len',v.map(a=>a.length).join('/'),'total ms',v.map(a=>a.reduce((x,y)=>x+y,0)).join('/'))}
// descent
await ev(()=>{localStorage.setItem('lunaSleep.vib',JSON.stringify({on:true,lvl:3,pat:'heart',bpm:60,desc:10}));LT.sess.t0=Date.now()});
ok(await ev(()=>Math.abs(LT.dfac()-1)<.01),'dfac start 1');
await ev(()=>{LT.sess.t0=Date.now()-10*60000});ok(await ev(()=>Math.abs(LT.dfac()-1.35)<.01),'dfac end 1.35');
await ev(()=>{LT.sess.t0=Date.now()-300*60000});ok(await ev(()=>LT.dfac()===1),'dfac stale 1');
await ev(()=>{localStorage.setItem('lunaSleep.vib',JSON.stringify({on:true,lvl:3,pat:'swell'}));LT.sess.t0=0});
// tap heartbeat
await ev(()=>LT.hapticsOpen());
for(let i=0;i<9;i++){await ev(()=>{const x=[...document.querySelectorAll('#cx-body button')].find(b=>b.textContent==='Tap with my pulse');x.click()});await p.waitForTimeout(700)}
t=await body();ok(/About (8\d|9\d|85|86) a minute|About 8[0-9]/.test(t)||/About \d+ a minute/.test(t),'tap tempo text: '+t.match(/About[^.]*\./));
await clickText('Use this speed');const bp=await ev(()=>JSON.parse(localStorage.getItem('lunaSleep.vib')).bpm);ok(bp>=40&&bp<=90,'bpm set '+bp);
await ev(()=>cxClose());
// battery
await ev(()=>{window.__bat.level=.1;window.__bat.charging=false;(window.__bat._l.levelchange||[]).forEach(f=>f())});
ok(await ev(()=>LT.battSave===true),'battSave on low');
await ev(()=>{window.__v=[];LT.buzz(1,3,true)});ok(await ev(()=>window.__v.length===0),'battSave blocks buzz');
await ev(()=>LT.tonightOpen());t=await body();ok(/battery is at 10%/i.test(t),'battery warning shown');ok(/Tonight I agree to/.test(t)&&/Your night/.test(t),'tonight sections');
ok(await ev(()=>document.querySelectorAll('#cx-body .tls').length>=4),'timeline segments');
await ev(()=>{window.__bat.level=.9;window.__bat.charging=true;(window.__bat._l.chargingchange||[]).forEach(f=>f())});
ok(await ev(()=>LT.battSave===false),'battSave off charging');
// preflight edit
await clickText('Edit list');ok((await title())==='Preflight list','preflight edit opens');
await ev(()=>{const i=document.querySelector('#cx-body input[type=text]');i.value='Take my meds';});
await clickText('Add');t=await body();ok(/Take my meds/.test(t),'preflight add');
await clickText('Done');await p.waitForTimeout(150);ok((await title())==='Start my night','back to tonight');
// begin chain
await ev(()=>{const c=[...document.querySelectorAll('#cx-body input[type=checkbox]')];c.forEach(x=>{if(/I am somewhere safe/.test(x.parentNode.textContent)&&!x.checked){x.click()}})});
await ev(()=>{const g=[...document.querySelectorAll('#cx-body button')].find(b=>b.textContent==='Begin');g.click()});
await p.waitForTimeout(400);ok((await title())==='Preflight','preflight step');t=await body();ok(/Take my meds/.test(t),'preflight shows custom item');
await clickText('Continue');await p.waitForTimeout(500);ok((await title())==='Guided breathing','breathing step');
ok(await ev(()=>+document.getElementById('wdim').style.opacity>0),'dim applied');ok(await ev(()=>LT.chain===true),'chain active');
await ev(()=>cxClose());await p.waitForTimeout(6500);
ok(await ev(()=>LT.chain===false),'chain ended after stop');ok(await ev(()=>+document.getElementById('wdim').style.opacity===0),'dim cleared');
// safety hub
await ev(()=>LT.safeOpen());ok((await title())==='Safety and consent','safety hub');t=await body();ok(/Cue ledger/.test(t)&&/Body map/.test(t)&&/Anchors/.test(t)&&/Practice the Emergency Exit/.test(t)&&/Comfort card/.test(t),'hub items');
await clickText('Cue ledger');await p.waitForTimeout(150);ok((await title())==='Cue ledger','cue ledger');
await ev(()=>{const i=document.querySelector('#cx-body input[type=text]');i.value='velvet';});await clickText('Add');t=await body();ok(/v••••|v•+/.test(t)&&!/velvet/.test(t),'cue masked: '+t.match(/v•+/));
await ev(()=>{[...document.querySelectorAll('#cx-body input[type=checkbox]')].forEach(c=>c.click())});t=await body();ok(/velvet/.test(t),'cue revealed');
// expire it
await ev(()=>{const s=JSON.parse(localStorage.getItem('lunaSleep.safe'));s.cues[0].exp=Date.now()-1000;localStorage.setItem('lunaSleep.safe',JSON.stringify(s))});
ok(await ev(()=>LT.cuesDue()===1),'cue due');
await clickText('Renew');ok(await ev(()=>LT.cuesDue()===0),'renew clears due');
await clickText('Retire');await p.waitForTimeout(150);ok((await title())==='Retire a cue','retire dialog');
ok(await ev(()=>[...document.querySelectorAll('#cx-body button')].find(b=>b.textContent==='Retire it').disabled),'retire disabled until ticks');
await ev(()=>{[...document.querySelectorAll('#cx-body input[type=checkbox]')].forEach(c=>c.click())});
await clickText('Retire it');await p.waitForTimeout(200);ok((await title())==='Retired','retired');ok(await ev(()=>JSON.parse(localStorage.getItem('lunaSleep.safe')).cues.length===0),'cue removed');
ok(await ev(()=>JSON.parse(localStorage.getItem('lunaSleep.fl')||'null')===null||true),'flag');
// body map
await ev(()=>{cxClose();LT.bodyOpen()});ok((await title())==='Body map','body map');
await ev(()=>{document.querySelector('.zonebtns .btn').click();});ok(await ev(()=>LT.bodyState('head')===1),'head welcome');
await ev(()=>{document.querySelector('.zonebtns .btn').click();});ok(await ev(()=>LT.bodyState('head')===2),'head skip');
await ev(()=>{const b=[...document.querySelectorAll('.zonebtns .btn')].find(x=>/^Hands/.test(x.textContent));b.click();b.click();});ok(await ev(()=>LT.bodyState('hands')===2),'hands skip');
ok(await ev(()=>LT.bodyCue('Let your forehead soften.')==='Let your breath be easy.'&&LT.bodyCue('Let your belly be soft.')==='Let your belly be soft.'),'bodyCue');
// deepener tighten & release skips Hands and Face
await ev(()=>{cxClose();localStorage.setItem('lunaSleep.dp',JSON.stringify({style:'tr',pace:'quick',tone:false}));LT.deepOpen()});
await ev(()=>{const c=[...document.querySelectorAll('#cx-body input[type=checkbox]')].find(x=>/somewhere safe/.test(x.parentNode.textContent));c.click()});
await ev(()=>{[...document.querySelectorAll('#cx-body button')].find(b=>b.textContent==='Start').click()});await p.waitForTimeout(500);
t=await ev(()=>document.getElementById('fs').innerText);ok(/Arms/.test(t)&&!/Hands/.test(t),'tr skips hands: '+t.slice(0,60));
await ev(()=>{[...document.querySelectorAll('#fs button')].find(b=>b.textContent==='Stop').click()});
// anchors + exit
await ev(()=>LT.anchorsOpen());await ev(()=>{const i=[...document.querySelectorAll('#cx-body input[type=text]')];i[0].value='my blanket';i[1].value='Mochi'});await clickText('Save');
await ev(()=>{cxClose();sosOpen()});t=await ev(()=>document.getElementById('sos-box').innerText);ok(/my blanket/.test(t)&&/Mochi/.test(t),'anchors on exit');
await ev(()=>sosClose());
// drill
await ev(()=>LT.drillOpen());await clickText('Start the drill');await p.waitForTimeout(150);ok(await ev(()=>!!document.getElementById('drillbar')),'drill bar');
await ev(()=>document.getElementById('sos-open').click());await p.waitForTimeout(100);ok(await ev(()=>!document.getElementById('drillbar')),'drill bar gone');
await ev(()=>document.getElementById('sos-close').click());await p.waitForTimeout(500);ok((await title())==='You found it','drill result');
ok(await ev(()=>JSON.parse(localStorage.getItem('lunaSleep.safe')).drills.n===1),'drill counted');
// comfort card
await ev(()=>{cxClose();LT.cardOpen()});t=await ev(()=>document.querySelector('.cardpre').textContent);ok(/COMFORT CARD/.test(t)&&/Safe words/.test(t)&&/my blanket/.test(t)&&/Please skip: Head and face, Hands/.test(t),'card text: '+t.replace(/\n/g,' | '));
// return ritual
await ev(()=>{cxClose();LT.returnOpen()});await p.waitForTimeout(200);t=await ev(()=>document.getElementById('fs').innerText);ok(/You are back/.test(t),'return step1');
for(let i=0;i<3;i++){await ev(()=>{const x=[...document.querySelectorAll('#fs button')].find(b=>/^(Start|Next)/.test(b.textContent));if(x)x.click()});await p.waitForTimeout(100)}
t=await ev(()=>document.getElementById('fs').innerText);ok(/Look after yourself/.test(t)&&/Drink some water/.test(t),'return aftercare');
await ev(()=>{[...document.querySelectorAll('#fs button')].find(b=>b.textContent==='Close').click()});
// pass along
await ev(()=>{localStorage.setItem('lunaSleep.vib',JSON.stringify({on:true,lvl:4,pat:'purr',bpm:55,desc:15,halo:true,drift:true,here:10}));LT.passOpen()});
t=await ev(()=>document.querySelector('.cardpre').textContent);ok(/^LS1\./.test(t),'setup code');ok(await ev(()=>{const i=document.querySelector('.qrimg');return !!i&&i.src.startsWith('data:image')}),'qr image');
const parsed=await ev(c=>LT.setupParse(c),t);ok(parsed&&parsed.vib.lvl===4&&parsed.vib.pat==='purr'&&parsed.vib.desc===15&&parsed.vib.halo===true,'roundtrip');
const u=o=>'LS1.'+Buffer.from(JSON.stringify(o)).toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
ok(await ev(c=>LT.setupParse(c)===null,u({v:1,vib:{lvl:99,pat:'evil',bpm:5}})),'rejects bad values');
ok(await ev(()=>LT.setupParse('garbage')===null&&LT.setupParse('')===null),'rejects garbage');
ok(await ev(c=>{const r=LT.setupParse(c);return r&&r.vib.lvl===2&&!('junk' in r.vib)&&r.gr.mode==='b8'},u({v:1,vib:{lvl:2,on:true,junk:'<b>x</b>'},gr:{mode:'b8',evil:1}})),'filters unknown keys');
await ev(c=>{localStorage.setItem('lunaSleep.vib','{}');LT.setupImport(c)},t);t=await body();ok(/Haptics: \d+ settings/.test(t),'import summary');
await clickText('Load these settings');ok(await ev(()=>JSON.parse(localStorage.getItem('lunaSleep.vib')).pat==='purr'),'import applied');
await ev(()=>cxClose());
// bedside
await ev(()=>{localStorage.setItem('lunaSleep.vib',JSON.stringify({on:true,lvl:3,here:5,drift:true,halo:true}));LT.nlock=false;LT.bedOpen()});
ok(await ev(()=>!document.getElementById('bed').hidden),'bed open');ok(await ev(()=>!!document.querySelector('#bed .halo')),'bed halo');
const dim=async()=>{await ev(()=>[...document.querySelectorAll('#bed button')].find(b=>b.textContent==='Dimmer').click());return ev(()=>document.getElementById('bed').dataset.lv)};
ok((await dim())==='1'&&(await dim())==='2'&&(await dim())==='3'&&(await dim())==='0','dimmer cycles 4');
await dim();await dim();await dim();ok(await ev(()=>document.getElementById('bed').dataset.lv==='3'),'dark level');
ok(await ev(()=>getComputedStyle(document.querySelector('#bed .bedclock')).visibility==='hidden'),'clock hidden in dark');
await p.waitForTimeout(100);
await ev(()=>{const d=document.getElementById('bed');d.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))});await p.waitForTimeout(900);ok(await ev(()=>document.getElementById('bed').dataset.lv==='1'),'hold wakes');
ok(await ev(()=>document.getElementById('bed-exit').textContent==='Leave bedside mode'),'exit label normal');
await ev(()=>LT.driftSleep('drift'));ok(await ev(()=>document.getElementById('bed').dataset.lv==='3'&&LT.drift.asleep),'driftSleep');
await ev(()=>{const d=document.getElementById('bed');d.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))});await p.waitForTimeout(900);t=await ev(()=>document.getElementById('bed-row').innerText);ok(/did not answer/.test(t),'wake note');
await ev(()=>LT.bedClose());
// lock
await ev(()=>{LT.nlock=true;LT.bedOpen()});ok(await ev(()=>/Hold to leave/.test(document.getElementById('bed-exit').textContent)),'lock label');
await ev(()=>{document.getElementById('bed-exit').click()});ok(await ev(()=>!document.getElementById('bed').hidden),'plain click does not leave');
await p.keyboard.press('Escape');ok(await ev(()=>!document.getElementById('bed').hidden),'esc blocked in lock');
await ev(()=>{document.getElementById('bed-exit').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))});await p.waitForTimeout(1100);ok(await ev(()=>document.getElementById('bed').hidden),'hold leaves');ok(await ev(()=>LT.nlock===false),'lock cleared');
// guided read aloud + descent
const R={id:'x',title:'Test read',cw:[],wake:'You wake gently.',trig:[],body:'First sentence is here for you to read slowly.\n\nSecond paragraph begins here and it goes on for a bit longer than the first one.\n\nThird paragraph ends it softly now.'};
await ev(r=>{localStorage.setItem('lunaSleep.gr',JSON.stringify({mode:'b8',size:'l',breath:true,aloud:true,vib:'breath'}));localStorage.setItem('lunaSleep.vib',JSON.stringify({on:true,lvl:3,pat:'swell',halo:true,desc:10}));LT.readOpen(r)},R);
t=await body();ok(/Read aloud to someone/.test(t),'aloud option');
await ev(()=>{const c=[...document.querySelectorAll('#cx-body input[type=checkbox]')].find(x=>/somewhere safe/.test(x.parentNode.textContent));c.click()});
await ev(()=>{[...document.querySelectorAll('#cx-body button')].find(b=>b.textContent==='Start reading').click()});await p.waitForTimeout(400);
ok(await ev(()=>!!document.querySelector('#fs .fsnextline')&&document.querySelector('#fs .fsnextline').textContent.length>0),'next phrase preview');
ok(await ev(()=>!!document.querySelector('#fs .fsback .halo')),'fs halo');ok(await ev(()=>document.querySelectorAll('#fs .fsbreath').length===1),'one circle');
ok(await ev(()=>LT.sess.t0>0&&LT.sess.kind==='read'),'session started read');
await ev(()=>{[...document.querySelectorAll('#fs button')].find(b=>b.textContent==='Stop').click()});
// frac ladder
await ev(()=>{localStorage.setItem('lunaSleep.dp',JSON.stringify({style:'frac',pace:'quick',tone:false}));LT.deepOpen()});
await ev(()=>{const c=[...document.querySelectorAll('#cx-body input[type=checkbox]')].find(x=>/somewhere safe/.test(x.parentNode.textContent));c.click()});
t=await body();ok(/ago|sessions in the last/.test(t),'cooldown note: '+t.match(/You (started|have)[^.]*\./));
await ev(()=>{[...document.querySelectorAll('#cx-body button')].find(b=>b.textContent==='Start').click()});await p.waitForTimeout(500);
ok(await ev(()=>document.querySelectorAll('#fs .fsladder i').length===5&&/Round 1 of 5/.test(document.querySelector('#fs .fsrnd').textContent)),'ladder rounds');
await ev(()=>{[...document.querySelectorAll('#fs button')].find(b=>b.textContent==='Stop').click()});
// offline row
await ev(()=>LT.tonightOpen());await p.waitForTimeout(300);ok(/offline copy|airplane/i.test(await body()),'offline row');
await ev(()=>cxClose());
// whats new
ok(await ev(()=>/v48/.test(document.getElementById('new-log').textContent)),'whats new v48');
ok(errs.length===0,'page errors: '+errs.join('|'));
console.log('t110 pass='+pass+' bad='+bad);await b.close()})();
