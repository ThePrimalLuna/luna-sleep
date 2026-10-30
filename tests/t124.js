/* t124: none option */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c){pass++}else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await b.newPage({viewport:{width:400,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.newOptOut','1')}catch(e){}});
await p.goto(APP);await p.waitForTimeout(700);
const ev=(f,a)=>p.evaluate(f,a);
await ev(()=>LT.tonightOpen());await p.waitForTimeout(200);
const o=await ev(()=>[...document.querySelectorAll('#tn-track option')].map(x=>x.value+'|'+x.textContent));
ok(o.length>=2,'options '+o.length);
const sel=await ev(()=>document.getElementById('tn-track').value);ok(!!sel,'default recommended '+sel);
await ev(()=>{const s=document.getElementById('tn-track');s.value=s.options[s.options.length-1].value;s.dispatchEvent(new Event('change'))});
const last=o[o.length-1].split('|')[1].replace(' (heard)','');
ok(await ev(t=>[...document.querySelectorAll('#cx-body p')].some(p=>p.textContent==='Then: '+t+'.'),last),'then line updates to '+last);
await ev(()=>{const s=document.getElementById('tn-track');s.value='';s.dispatchEvent(new Event('change'))});
ok(await ev(()=>[...document.querySelectorAll('#cx-body p')].some(p=>/ends in Bedside/.test(p.textContent))),'none option');
// after foundation done, all released non-locked appear and no adult in SFW
await ev(()=>{FOUND_IDS.forEach(i=>S.done[i]=true);save()});
await ev(()=>LT.tonightOpen());await p.waitForTimeout(200);
const n2=await ev(()=>document.querySelectorAll('#tn-track option').length);ok(n2>=o.length,'more after foundation '+n2);
ok(errs.length===0,'errs '+errs.join('|'));
}finally{await b.close()}console.log('t124 pass='+pass+' bad='+bad)})().catch(e=>{console.log('ERR',e.message.slice(0,300));process.exit(1)});
