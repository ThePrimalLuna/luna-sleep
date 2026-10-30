/* t121: 3 playable tracks; dock open; status */
const APP='file://'+require('path').resolve(__dirname,'../index.html');
const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c){pass++}else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const ctx=await b.newContext({viewport:{width:400,height:800}});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{try{if(!sessionStorage.getItem('init')){sessionStorage.setItem('init','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.newOptOut','1')}}catch(e){}});
const go=async()=>{await p.goto(APP);await p.waitForTimeout(700)};
await go();
const ev=(f,a)=>p.evaluate(f,a);
const W=ms=>p.waitForTimeout(ms);
const tr=await ev(()=>Object.values(TI).filter(t=>LT.canPlayT(t)).slice(0,3).map(t=>({id:t.id,title:t.title})));
ok(tr.length===3,'3 playable tracks');
// ---- dock
await ev(i=>LT.dockPlay(TI[i]),tr[0].id);await W(150);
ok(await ev(()=>!document.getElementById('pdock').hidden),'dock open');
ok(await ev(()=>!!document.querySelector('#pdock .pdthumb')),'thumb');
ok(await ev(t=>document.querySelector('#pdock .pdt b').textContent===t,tr[0].title),'title');
ok(await ev(()=>document.querySelector('#pdock .pdtl').textContent==='Now playing'),'status');
ok(await ev(()=>document.querySelector('#pdock .pdmin').getAttribute('aria-label')==='Hide player'),'hide label');
await ev(()=>document.querySelector('#pdock .pdmin').click());
ok(await ev(()=>document.getElementById('pdock').classList.contains('min')&&document.querySelector('#pdock .pdmin').getAttribute('aria-label')==='Show player'),'minimized');
await ev(()=>LT.dockPlay(TI[Object.keys(TI).find(k=>LT.canPlayT(TI[k]))]));
ok(await ev(()=>!document.getElementById('pdock').classList.contains('min')),'replay restores');
ok(await ev(()=>!!document.querySelector('#pdock .pdhelp')&&!document.querySelector('#pdock .pdhelp').open),'help collapsed');
// timer
await ev(()=>{const s=document.querySelector('#pdock .pdsl select');s.value='15';s.dispatchEvent(new Event('change'))});
ok(await ev(()=>Math.abs(LT.stEnd-Date.now()-15*60000)<3000),'timer set');
ok(await ev(()=>JSON.parse(localStorage.getItem('lunaSleep.stimer')).min===15),'timer stored');
await W(1200);
ok(await ev(()=>/^Stops in 1[45]:\d\d$/.test(document.querySelector('#pdock .pdtl').textContent)),'timer label '+await ev(()=>document.querySelector('#pdock .pdtl').textContent));
await ev(()=>LT.dockStop());
ok(await ev(()=>LT.stEnd===0&&document.getElementById('pdock').hidden),'stop clears');
await ev(i=>LT.dockPlay(TI[i]),tr[1].id);
ok(await ev(()=>LT.stEnd>0),'remembered timer auto-starts');
ok(await ev(()=>document.querySelector('#pdock .pdsl select').value==='15'),'select shows 15');
// expiry
await ev(()=>{LT.stEnd=Date.now()+1300});await W(2600);
ok(await ev(()=>document.getElementById('pdock').hidden),'timer expiry stops player');
await ev(i=>LT.dockPlay(TI[i]),tr[1].id);
await ev(()=>{const s=document.querySelector('#pdock .pdsl select');s.value='0';s.dispatchEvent(new Event('change'))});
await ev(()=>LT.dockStop());await ev(i=>LT.dockPlay(TI[i]),tr[1].id);
ok(await ev(()=>LT.stEnd===0),'Off stays off');
await ev(()=>LT.dockStop());
// next in plan
await ev(a=>{S.plan={at:Date.now(),need:'custom',ids:a};save()},[tr[0].id,tr[1].id,tr[2].id]);
await ev(i=>LT.dockPlay(TI[i]),tr[0].id);
ok(await ev(t=>{const n=document.querySelector('#pdock .pdnext');return n&&n.textContent==='Next: '+t},tr[1].title),'next button');
await ev(()=>document.querySelector('#pdock .pdnext').click());await W(100);
ok(await ev(t=>document.querySelector('#pdock .pdt b').textContent===t,tr[1].title),'next plays');
ok(await ev(t=>document.querySelector('#pdock .pdnext').textContent==='Next: '+t,tr[2].title),'next chain');
await ev(()=>LT.dockStop());
await ev(()=>{S.plan=null;save()});
// ---- resume card
await go();
ok(await ev(()=>[...document.querySelectorAll('section.resume h2')].some(h=>/Pick up where you left off/.test(h.textContent))),'resume card');
ok(await ev(t=>document.querySelector('section.resume').textContent.includes(t),tr[1].title),'resume shows last track');
ok(await ev(()=>!!document.querySelector('section.resume .btn')),'resume buttons');
// ---- filters persist
await ev(()=>{F.sort='title';CF.sort='peak';F.maxI=3;render()});
await go();
ok(await ev(()=>F.sort==='title'&&CF.sort==='peak'&&F.maxI===3),'filters persisted');
await ev(()=>{localStorage.setItem('lunaSleep.filt',JSON.stringify({at:Date.now()-5*864e5,f:{sort:'rt'},c:{}}))});
await go();
ok(await ev(()=>F.sort==='date'),'filters expire');
await ev(()=>{localStorage.setItem('lunaSleep.filt',JSON.stringify({at:Date.now(),f:{sort:'<bad>',cat:'<script>'},c:{sort:'zz',maxM:-5}}))});
await go();
ok(await ev(()=>F.sort==='date'&&F.cat===''&&CF.sort==='ready'&&CF.maxM===999),'filters sanitised');
// ---- plan button
await ev(()=>{S.tab='cat';render()});await W(200);
const pb=await ev(()=>{const b=document.querySelector('.planbtn');return b?b.textContent:null});
ok(pb==='+ Tonight','plan button '+pb);
await ev(()=>document.querySelector('.planbtn').click());
ok(await ev(()=>S.plan&&S.plan.ids.length===1&&S.plan.need==='custom'),'plan add');
ok(await ev(()=>document.querySelector('.planbtn').textContent==='✓ Tonight'),'plan label');
await ev(()=>document.querySelector('.planbtn').click());
ok(await ev(()=>S.plan===null||!S.plan),'plan remove');
// ---- ics
await ev(i=>LT.bedCal([i]),tr[0].id);await W(150);
ok(await ev(()=>document.getElementById('cx-h').textContent==='Bedtime reminder'),'ics dialog');
await ev(()=>[...document.querySelectorAll('#cx-body button')].find(b=>/Download/.test(b.textContent)).click());await W(300);
const ics=await ev(()=>{const t=document.querySelector('#cx-body textarea');return t&&!t.hidden?t.value:''});
const stx=await ev(()=>document.querySelector('#cx-body [role=status]').textContent);ok(/BEGIN:VCALENDAR/.test(ics)&&/TRIGGER:-PT30M/.test(ics)&&/SUMMARY:Luna Sleep bedtime/.test(ics)&&/END:VCALENDAR/.test(ics)||/^Saved\./.test(stx),'ics body '+stx);
ok(!/Wolfie/i.test(ics),'no real name');
await ev(()=>document.getElementById('cx-close').click());
// ---- shortcuts
console.log('pre-shortcuts open',await ev(()=>['cx-dlg','prof-dlg','sos','new-dlg','cv-dlg','set-dlg','help-dlg','io-dlg','about','den','fs','bed','ws'].filter(i=>{const x=document.getElementById(i);return x&&!x.hidden})));
await ev(()=>document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyH',key:'h',altKey:true,bubbles:true})));await W(150);
ok(await ev(()=>document.getElementById('cx-h').textContent==='Keyboard shortcuts'&&!document.getElementById('cx-dlg').hidden),'Alt+H');
await ev(()=>document.getElementById('cx-close').click());
await ev(()=>document.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyM',key:'m',altKey:true,bubbles:true})));await W(100);
ok(await ev(()=>!document.getElementById('set-dlg').hidden),'Alt+M');
// typing guard
await ev(()=>{const q=document.getElementById('set-q');q.focus();q.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyH',key:'h',altKey:true,bubbles:true}))});await W(100);
ok(await ev(()=>document.getElementById('cx-dlg').hidden),'shortcut ignored in input');
// ---- night mode
await ev(()=>document.getElementById('set-close').click());
await ev(()=>{localStorage.setItem('lunaSleep.simple','1')});
await go();await ev(()=>document.getElementById('set-open').click());
const st0=await ev(()=>({calm:document.getElementById('set-calm').checked,simple:document.getElementById('set-simple').checked}));
await ev(()=>document.getElementById('nm-sw').click());await W(100);
ok(await ev(()=>document.getElementById('set-calm').checked&&document.getElementById('set-simple').checked),'night mode on');
await ev(()=>document.getElementById('nm-sw').click());await W(100);
ok(await ev(s=>document.getElementById('set-calm').checked===s.calm&&document.getElementById('set-simple').checked===s.simple,st0),'night mode restores');
// ---- settings search
await ev(()=>{document.getElementById('set-settings').open=true});
await ev(()=>{const q=document.getElementById('set-q');q.value='contrast';q.dispatchEvent(new Event('input'))});
const vis=await ev(()=>[...document.querySelectorAll('#set-settings .setsub')].filter(s=>!s.hidden).length);
ok(vis>=1&&vis<4,'search narrows '+vis);
await ev(()=>{const q=document.getElementById('set-q');q.value='zzzqq';q.dispatchEvent(new Event('input'))});
ok(await ev(()=>!document.querySelector('.setnone').hidden),'no match message');
await ev(()=>{const q=document.getElementById('set-q');q.value='';q.dispatchEvent(new Event('input'))});
ok(await ev(()=>[...document.querySelectorAll('#set-settings .setsub')].every(s=>!s.hidden)&&[...document.querySelectorAll('#set-settings .setbody>*')].every(r=>!r.hidden)),'search clears');
// ---- back navigation
await ev(()=>{if(document.getElementById('set-dlg').hidden)document.getElementById('set-open').click()});
await ev(()=>document.getElementById('st-open').click());await W(150);
const hub=await ev(()=>document.getElementById('cx-h').textContent);
ok(await ev(()=>document.getElementById('cx-close').textContent==='Close'),'hub close label');
await ev(()=>document.querySelector('#cx-body button.path').click());await W(200);
const tool=await ev(()=>document.getElementById('cx-h').textContent);
ok(tool!==hub,'tool differs from hub '+tool);
ok(await ev(()=>/Back/.test(document.getElementById('cx-close').textContent)),'back label');
await ev(()=>document.getElementById('cx-close').click());await W(150);
ok(await ev(h=>document.getElementById('cx-h').textContent===h,hub),'back returns to hub');
await ev(()=>document.getElementById('cx-close').click());await W(150);
ok(await ev(()=>document.getElementById('cx-dlg').hidden&&!document.getElementById('set-dlg').hidden),'hub close shows menu');
// in-content Close also returns
await ev(()=>document.getElementById('st-open').click());await W(150);
await ev(()=>document.querySelector('#cx-body button.path').click());await W(200);
const cb=await ev(()=>[...document.querySelectorAll('#cx-body button')].filter(b=>/^(Close|Done)$/.test(b.textContent.trim())).length);
if(cb){await ev(()=>[...document.querySelectorAll('#cx-body button')].find(b=>/^(Close|Done)$/.test(b.textContent.trim())).click());await W(150);
 ok(await ev(h=>document.getElementById('cx-h').textContent===h,hub),'in-content Close returns to hub')}
await ev(()=>document.getElementById('cx-close').click());await W(100);
// Esc steps back
await ev(()=>document.getElementById('st-open').click());await W(150);
await ev(()=>document.querySelector('#cx-body button.path').click());await W(200);
await p.keyboard.press('Escape');await W(150);
ok(await ev(h=>document.getElementById('cx-h').textContent===h&&!document.getElementById('cx-dlg').hidden,hub),'Esc steps back');
// history back steps back
await ev(()=>document.querySelector('#cx-body button.path').click());await W(300);
await ev(()=>history.back());await W(400);
ok(await ev(h=>!document.getElementById('cx-dlg').hidden&&document.getElementById('cx-h').textContent===h,hub),'history back steps back '+await ev(()=>document.getElementById('cx-h').textContent));
await ev(()=>document.getElementById('cx-close').click());await W(100);
// menu-hand-off dialogs return to menu
await ev(()=>document.getElementById('plan-open').click());await W(200);
ok(await ev(()=>!document.getElementById('set-dlg').hidden&&!document.getElementById('cx-dlg').hidden),'plan opens over menu');
await ev(()=>document.getElementById('cx-close').click());await W(200);
ok(await ev(()=>!document.getElementById('set-dlg').hidden&&document.getElementById('cx-dlg').hidden),'plan close returns to menu');
await ev(()=>{document.getElementById('set-links').open=true;document.getElementById('help-open').click()});await W(200);
ok(await ev(()=>!document.getElementById('help-dlg').hidden&&document.getElementById('help-close').textContent==='‹ Menu'),'help label');
await ev(()=>document.getElementById('help-close').click());await W(300);
ok(await ev(()=>!document.getElementById('set-dlg').hidden&&document.getElementById('help-dlg').hidden&&document.getElementById('help-close').textContent==='Close'),'help close returns to menu');
await ev(()=>{document.getElementById('set-links').open=true;document.getElementById('keys-open').click()});await W(200);
ok(await ev(()=>document.getElementById('cx-h').textContent==='Keyboard shortcuts'&&!document.getElementById('set-dlg').hidden),'keys from help');
await ev(()=>document.getElementById('cx-close').click());await W(200);
ok(await ev(()=>!document.getElementById('set-dlg').hidden),'keys close returns to menu');
// close menu itself: nothing reopens
await ev(()=>document.getElementById('set-close').click());await W(300);
ok(await ev(()=>document.getElementById('set-dlg').hidden&&document.getElementById('cx-dlg').hidden),'menu close stays closed');
// opened from the page: no menu on close
await ev(()=>LT.keysOpen());await W(100);
ok(await ev(()=>document.getElementById('cx-close').textContent==='Close'),'page-opened has Close');
await ev(()=>document.getElementById('cx-close').click());await W(300);
ok(await ev(()=>document.getElementById('set-dlg').hidden),'page-opened stays closed');
ok(errs.length===0,'errs '+errs.join('|'));
}finally{await b.close()}console.log('t121 pass='+pass+' bad='+bad)})().catch(e=>{console.log('ERR',e.message.slice(0,400));process.exit(1)});
