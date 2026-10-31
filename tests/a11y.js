/* Automated accessibility scan with axe-core (WCAG 2 A/AA rules). This finds missing labels, bad contrast,
   bad roles and similar. It is NOT a screen-reader test: real VoiceOver/TalkBack passes are still needed. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
let axeSrc;try{axeSrc=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8')}catch(e){console.log('SKIP axe-core not installed (npm install). pass');process.exit(0)}
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:800}});
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.newSeen','2026-10-30c');localStorage.setItem('lunaSleep.newOptOut','1');localStorage.setItem('lunaSleep.cheevoInit','1');localStorage.setItem('lunaSleep.denAck','1')}catch(e){}});
await p.goto('file://'+path.resolve(__dirname,'..','index.html'));await p.waitForTimeout(900);await p.addScriptTag({content:axeSrc});
const bad={};let n=0;
const scan=async label=>{n++;const r=await p.evaluate(async()=>{const x=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']},resultTypes:['violations']});return x.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,ex:v.nodes[0].target.join(' ').slice(0,90)}))});
  for(const v of r)(bad[v.id]=bad[v.id]||[]).push(label+' x'+v.n+' '+v.ex)};
await scan('home');
for(const t of ['cat','res','bonus','combo','you','tools']){try{await p.evaluate(t=>{S.tab=t;render()},t);await p.waitForTimeout(250);await scan('tab '+t)}catch(e){}}
for(const d of ['helpOpen','safeOpen','pushOpen','countOpen','mixOpen','reportOpen','wipeOpen','holdOpen','recapOpen','achOpen']){
  try{const ok=await p.evaluate(d=>{if(!LT[d])return false;LT[d]();return true},d);if(!ok)continue;await p.waitForTimeout(350);await scan(d);await p.evaluate(()=>{try{cxDismiss()}catch(e){}});await p.waitForTimeout(150)}catch(e){}}
for(const sk of ['','Harvest','Goblin Mode','Vaporwave','Cat Loaf','Heatwave']){try{await p.evaluate(k=>{const s=document.getElementById('theme-sel');if(s){const o=[...s.options].find(o=>o.textContent===k||o.value===k.toLowerCase().replace(/ /g,'-'));if(o){s.value=o.value;s.dispatchEvent(new Event('change'))}}},sk);await p.waitForTimeout(200);await scan('theme '+(sk||'default'))}catch(e){}}
await b.close();
const ids=Object.keys(bad);
for(const id of ids)console.log('A11Y',id,'->',bad[id].slice(0,3).join(' | '));
console.log('a11y: '+(ids.length?'FAIL ':'pass, ')+n+' views scanned, '+ids.length+' rule types failing');process.exit(ids.length?1:0)})();
