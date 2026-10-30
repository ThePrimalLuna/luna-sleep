/* t125: 7 parts; part 7 opens; text present */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c){pass++}else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await b.newPage({viewport:{width:400,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.newOptOut','1')}catch(e){}});
await p.goto(APP);await p.waitForTimeout(700);
const ev=(f,a)=>p.evaluate(f,a);
ok(await ev(()=>STORIES.filter(x=>x.g==='files').length===7),'7 parts');
await ev(()=>{S.tab='stories';S.storyOpen='files-7';render()});await p.waitForTimeout(200);
ok(await ev(()=>document.querySelector('.rdsub').textContent==='The Luna Sleep Files, Part 7'),'part 7 opens');
ok(await ev(()=>/LOCK IN/.test(document.querySelector('.reader').textContent)),'text present');
ok(await ev(()=>[...document.querySelectorAll('.rdfoot .btn')].some(b=>/← Part 6/.test(b.textContent))),'prev link');
ok(await ev(()=>[...document.querySelectorAll('.rdfoot .btn')].some(b=>/THE HUNT/.test(b.textContent))),'track link');
await ev(()=>{S.storyOpen='files-6';render()});await p.waitForTimeout(150);
ok(await ev(()=>[...document.querySelectorAll('.rdfoot .btn')].some(b=>/Part 7 →/.test(b.textContent))),'part 6 links forward');
await ev(()=>{S.storyOpen='two';render()});await p.waitForTimeout(150);
ok(await ev(()=>document.querySelectorAll('.rdpair').length===36),'36 pairs '+0);
ok(await ev(()=>[...document.querySelectorAll('.rdh')].map(x=>x.textContent).join()==='Horror,Sadness,Plot Twist,Comedy,Happiness'),'headings');
ok(await ev(()=>!/\(New\)|^\d+\./m.test(document.querySelector('.reader').textContent)),'no numbering artefacts');
ok(await ev(()=>/Your dog usually greets/.test(document.querySelector('.reader').textContent)),'new #8');
await ev(()=>{S.storyOpen=null;render()});
ok(await ev(()=>document.querySelectorAll('.story').length===14+1),'15 story cards');
ok(errs.length===0,'errs '+errs.join('|'));
}finally{await b.close()}console.log('t125 pass='+pass+' bad='+bad)})().catch(e=>{console.log('ERR',e.message.slice(0,300));process.exit(1)});
