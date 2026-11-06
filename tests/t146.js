/* t146: Bestiary sketch plates, new entry header, threat dots, and The Craytoad */
const APP='file://'+require('path').resolve(__dirname,'../index.html');const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c)pass++;else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await (await b.newContext({viewport:{width:400,height:820}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.newSeen','2026-11-06c');localStorage.setItem('lunaSleep.newOptOut','1')}catch(e){}});
await p.goto(APP);await p.waitForTimeout(700);const ev=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
const c=await ev(()=>{const b=BEAST.find(x=>x.n==='The Craytoad');return b?{i:BEAST.indexOf(b)+1,sk:b.sketch,rel:b.rel,n:BEAST.length}:null});
ok(c&&c.sk==='bestiary/craytoad.webp'&&c.rel===true&&c.i===30,'The Craytoad is No. 030, released, with its sketch '+JSON.stringify(c));
const gl=await ev(()=>{const g=BEAST.find(x=>x.n==='The Golden Thread'),s=BEAST.find(x=>x.n==='The Gilt Shuck'),pp=BEAST.find(x=>x.n==='Persephone');return{gt:!!g&&BEAST.indexOf(g)===30&&!g.sketch&&/Moirai/.test(g.closest),gs:/Persephone subclass/.test(s.kind)&&/Golden Thread/.test(s.folk+s.ours),pe:/amber/.test(pp.folk)&&!/silver/.test(pp.folk)&&/Gilt Shuck/.test(pp.folk)}});
ok(gl.gt&&gl.gs&&gl.pe,'Golden Thread added, Gilt Shuck is a Persephone subclass, Persephone eyes are amber '+JSON.stringify(gl));
const fs=require('fs'),path=require('path');
ok(fs.existsSync(path.resolve(__dirname,'../bestiary/craytoad.webp')),'sketch file exists');
ok(/bestiary\/craytoad\.webp/.test(fs.readFileSync(path.resolve(__dirname,'../sw.js'),'utf8')),'sketch is cached offline in sw.js');
await ev(()=>{BF.q='Craytoad';LR.m='beast';S.tab='lore';render()});await W(500);
const r=await ev(()=>{const card=document.querySelector('.beast');if(!card)return null;const im=card.querySelector('.sketch img'),th=card.querySelector('.bthumb img');return{head:(card.querySelector('.bhead h2')||{}).textContent,no:(card.querySelector('.bno')||{}).textContent,plate:!!im,blurred:!!(im&&im.classList.contains('blur')),thumb:!!th,thumbBlur:!!(th&&th.classList.contains('blur')),thr:[...card.querySelectorAll('.pill.thr')].map(x=>x.textContent).join('|'),alt:im&&im.alt}});
ok(r&&r.head==='The Craytoad'&&/^No\. 030/.test(r.no),'entry header shows number and title '+JSON.stringify(r));
ok(r&&r.plate&&!r.blurred&&r.thumb&&!r.thumbBlur,'released sketch is sharp in plate and thumbnail');
ok(r&&/^●○○○○ Harmless$/.test(r.thr),'threat shows five dots and the word: '+(r&&r.thr));
ok(await ev(()=>/Field sketch of The Craytoad/.test(document.querySelector('.sketch img').alt)),'sketch has alt text');
// an entry with a sketch but not yet featured is blurred with a note; one with none says not filed
await ev(()=>{const m=BEAST.find(x=>x.n==='Mothman');m.sketch='bestiary/craytoad.webp';delete m.rel;BF.q='Mothman';render()});await W(400);
const u=await ev(()=>{const card=document.querySelector('.beast');return{blur:!!card.querySelector('.sketch img.blur'),note:/Not featured yet/.test(card.textContent),alt:card.querySelector('.sketch img').alt}});
ok(u.blur&&u.note&&/Blurred/.test(u.alt),'unreleased sketch is blurred with a note '+JSON.stringify(u));
await ev(()=>{BF.q='Wendigo';render()});await W(400);
ok(await ev(()=>{const c=document.querySelector('.beast');const im=c&&c.querySelector('.sketch img');return !!im&&im.classList.contains('blur')&&/Not featured yet/.test(c.textContent)&&BEAST.find(x=>x.n==='Wendigo').sketch==='bestiary/wendigo.webp'&&!BEAST.find(x=>x.n==='Wendigo').rel}),'Wendigo sketch is filed and blurred until its episode is out');
ok(require('fs').existsSync(require('path').resolve(__dirname,'../bestiary/wendigo.webp'))&&/wendigo\.webp/.test(require('fs').readFileSync(require('path').resolve(__dirname,'../sw.js'),'utf8')),'Wendigo sketch file exists and is cached offline');
const other=await ev(()=>BEAST.find(x=>!x.sketch).n);await ev(o=>{BF.q=o;render()},other);await W(400);
ok(await ev(()=>{const card=document.querySelector('.beast');return !!card&&/No field notes yet/.test(card.textContent)&&!!card.querySelector('.sketch.nosketch')}),'no sketch shows a No field notes yet spot');
ok(!errs.length,'no page errors '+errs);console.log('t146',pass,'pass',bad,'fail');process.exit(bad?1:0)}finally{await b.close()}})();
