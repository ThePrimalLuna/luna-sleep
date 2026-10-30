/* t114: backup has ls; gr restored; tuck restored */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c){pass++}else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const ctx=await b.newContext({viewport:{width:400,height:820}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{}catch(e){}});
await p.goto(APP);await p.waitForTimeout(900);
const ev=(f,a)=>p.evaluate(f,a);
await ev(()=>{localStorage.setItem('lunaSleep.vib',JSON.stringify({on:true,lvl:4,pat:'thunder',bpm:55,desc:15,halo:true}));localStorage.setItem('lunaSleep.gr',JSON.stringify({mode:'b8',size:'l',aloud:true}));
 localStorage.setItem('lunaSleep.safe',JSON.stringify({cues:[{id:'a1',w:'sleep',t:1,exp:99999999999999,span:30}],body:{chest:2,feet:1},anchors:['my dog','tea'],card:{help:'tea',avoid:'noise'},drills:{n:3,best:1500}}));localStorage.setItem('lunaSleep.sosTuck','1');
 document.getElementById('io-open').click()});
await ev(()=>document.getElementById('io-copy').click());const txt=await ev(()=>document.getElementById('io-text').value);
const j=JSON.parse(txt);ok(j.ls&&j.ls.vib&&j.ls.safe&&j.ls.flags.tuck===true,'backup has ls');
await ev(()=>{['vib','gr','safe','sosTuck'].forEach(k=>localStorage.removeItem('lunaSleep.'+k))});
await ev(t=>{document.getElementById('io-text').value=t;document.getElementById('io-load').click()},txt);await p.waitForTimeout(300);
const r=await ev(()=>({vib:JSON.parse(localStorage.getItem('lunaSleep.vib')),gr:JSON.parse(localStorage.getItem('lunaSleep.gr')),safe:JSON.parse(localStorage.getItem('lunaSleep.safe')),tuck:localStorage.getItem('lunaSleep.sosTuck'),cls:document.getElementById('sos-open').classList.contains('tucked')}));
ok(r.vib.pat==='thunder'&&r.vib.lvl===4&&r.vib.desc===15,'vib restored '+JSON.stringify(r.vib));ok(r.gr.mode==='b8'&&r.gr.aloud===true,'gr restored');
ok(r.safe.cues.length===1&&r.safe.body.chest===2&&r.safe.anchors.length===2&&r.safe.card.help==='tea'&&r.safe.drills.n===3,'safe restored '+JSON.stringify(r.safe));ok(r.tuck==='1'&&r.cls,'tuck restored');
// hostile restore
const bad1=JSON.stringify({app:'luna-sleep',v:2,ls:{vib:{pat:'<script>',lvl:99,on:'yes',__proto__:{x:1}},safe:{cues:[{id:'x',w:'y'.repeat(500),t:'z'}],body:{head:7,__proto__:1},anchors:['a'.repeat(900),5,null],card:{help:{a:1},avoid:'q'.repeat(999)},drills:{n:-5,best:'x'}},gr:[1],flags:{tuck:'1'}}});
await ev(t=>{document.getElementById('io-text').value=t;document.getElementById('io-load').click()},bad1);await p.waitForTimeout(300);
const h=await ev(()=>({vib:JSON.parse(localStorage.getItem('lunaSleep.vib')),safe:JSON.parse(localStorage.getItem('lunaSleep.safe'))}));
ok(h.vib.pat==='thunder'&&h.vib.lvl===4,'hostile vib ignored '+JSON.stringify(h.vib));
ok(h.safe.cues[0].w.length<=40&&h.safe.cues[0].t===0&&!h.safe.body.head&&h.safe.anchors.every(a=>a.length<=40)&&(!h.safe.card.help)&&h.safe.card.avoid.length<=240&&h.safe.drills.n===0,'hostile safe cleaned '+JSON.stringify(h.safe).slice(0,300));
// old backup without ls still restores
await ev(t=>{document.getElementById('io-text').value=t;document.getElementById('io-load').click()},JSON.stringify({app:'luna-sleep',v:2,done:{}}));await p.waitForTimeout(200);
ok(await ev(()=>/Restored/.test(document.getElementById('io-msg').textContent)),'old backup ok');
ok(errs.length===0,'errs '+errs.join('|'));
}finally{await b.close()}console.log('t114 pass='+pass+' bad='+bad)})().catch(e=>{console.log('ERR',e.message.slice(0,300));process.exit(1)});
