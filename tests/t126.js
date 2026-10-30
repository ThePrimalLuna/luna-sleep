/* t126: search hit; groups hidden while searching; no match */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c){pass++}else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await b.newPage({viewport:{width:400,height:800}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{if(!sessionStorage.getItem('i')){sessionStorage.setItem('i','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.newOptOut','1')}}catch(e){}});
await p.goto(APP);await p.waitForTimeout(700);
const ev=(f,a)=>p.evaluate(f,a);const W=ms=>p.waitForTimeout(ms);
// search
await ev(()=>{S.tab='stories';S.storyOpen=null;render()});await W(200);
await ev(()=>{const q=document.getElementById('story-q');q.value='loofah';q.dispatchEvent(new Event('input'))});
ok(await ev(()=>document.querySelectorAll('.storyhit').length>=1&&document.querySelectorAll('.storyhit mark').length>=1),'search hit');
ok(await ev(()=>[...document.querySelectorAll('.storysec')].every(x=>x.hidden)),'groups hidden while searching');
await ev(()=>{const q=document.getElementById('story-q');q.value='zzqqxx';q.dispatchEvent(new Event('input'))});
ok(await ev(()=>/No story has that/.test(document.querySelector('.storyres').textContent)),'no match');
await ev(()=>{const q=document.getElementById('story-q');q.value='loofah';q.dispatchEvent(new Event('input'))});
await ev(()=>document.querySelector('.storyhit .btn').click());await W(500);
ok(await ev(()=>!!document.querySelector('.reader .rdhit')),'jump highlights line');
// themes
await ev(()=>{S.storyOpen='files-6';render()});await W(150);
const seq=[];for(let i=0;i<3;i++){seq.push(await ev(()=>document.querySelector('.reader').dataset.rt));await ev(()=>[...document.querySelectorAll('.rdbar .btn')].find(b=>/^Page:/.test(b.textContent)).click());await W(100)}
ok(seq.join()==='dark,light,night'&&await ev(()=>document.querySelector('.reader').dataset.rt)==='dark','theme cycle '+seq);
await ev(()=>{S.rdTheme='night';render()});
const col=await ev(()=>{const r=document.querySelector('.reader');const c=getComputedStyle(r);return c.backgroundColor+'|'+c.color});ok(/4, 2, 2/.test(col),'night colours '+col);
// listen cue: unheard shows note, heard shows play
ok(await ev(()=>/reads best after you have heard/.test(document.querySelector('.rdlisten').textContent)&&!/Play THE PACK/.test(document.querySelector('.rdlisten').textContent)),'unheard note');
await ev(()=>{S.done['SKU 05']=true;save();render()});await W(100);
ok(await ev(()=>[...document.querySelectorAll('.rdlisten .btn')].some(b=>/Play THE PACK while I read/.test(b.textContent))),'heard shows play');
// progress
await ev(()=>{S.rdTheme='dark';S.storyOpen='files-6';render();window.scrollTo(0,0)});await W(200);
await ev(()=>window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*.5));await W(900);
ok(await ev(()=>{const o=JSON.parse(localStorage.getItem('lunaSleep.rdpos')||'{}');return o['files-6']&&o['files-6'].f>.4&&o['files-6'].f<.6}),'position saved');
await ev(()=>{S.storyOpen=null;S.tab='home';render()});await W(200);
ok(await ev(()=>[...document.querySelectorAll('.resume .btn')].some(b=>/Continue reading/.test(b.textContent))),'home continue');
await ev(()=>[...document.querySelectorAll('.resume .btn')].find(b=>/Continue reading/.test(b.textContent)).click());await W(500);
ok(await ev(()=>scrollY>500),'auto scroll '+await ev(()=>scrollY));
// reopened story shows continue button
await ev(()=>{S.storyOpen=null;render();S.storyOpen='files-6';render()});await W(150);
ok(await ev(()=>[...document.querySelectorAll('.rdresume .btn')].some(b=>/Continue where you left off/.test(b.textContent))),'continue button in story');
// finish clears
await ev(()=>window.scrollTo(0,document.documentElement.scrollHeight));await W(900);
ok(await ev(()=>!JSON.parse(localStorage.getItem('lunaSleep.rdpos')||'{}')['files-6']),'finished clears');
// track page link + after heard nudge
await ev(()=>{S.tab='home';S.storyOpen=null;S.sel='SKU 05';render()});await W(200);
ok(await ev(()=>[...document.querySelectorAll('#side .btn, .side .btn, main .btn')].some(b=>/Read the story: Part 6/.test(b.textContent))),'track page story link');
await ev(()=>afterHeard('SKU 05'));await W(150);
ok(await ev(()=>/A story pairs with this track/.test(document.getElementById('cx-body').textContent)),'after heard nudge');
await ev(()=>[...document.querySelectorAll('#cx-body .btn')].find(b=>/Open the story/.test(b.textContent)).click());await W(300);
ok(await ev(()=>S.tab==='stories'&&S.storyOpen==='files-6'&&document.getElementById('cx-dlg').hidden),'nudge opens story');
ok(errs.length===0,'errs '+errs.join('|'));
}finally{await b.close()}console.log('t126 pass='+pass+' bad='+bad)})().catch(e=>{console.log('ERR',e.message.slice(0,300));process.exit(1)});
