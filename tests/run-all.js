#!/usr/bin/env node
/* Runs every test file in this folder one after another and prints a summary.
   A file fails if it prints a FAIL or ERR line, reports bad > 0, exits non-zero, or never prints a result.
   Usage: node tests/run-all.js [name-filter] */
const {spawnSync}=require('child_process'),fs=require('fs'),path=require('path');
const filter=process.argv[2]||'';
const files=fs.readdirSync(__dirname).filter(f=>/^(t\d+|smoke|worker\.test|static|lint|a11y|personas|crawl)\.m?js$/.test(f)&&f.includes(filter)).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}));
let failed=0;
for(const f of files){
  const t0=Date.now();
  const r=spawnSync('node',[path.join(__dirname,f)],{encoding:'utf8',timeout:f==='crawl.js'?900000:240000});
  const out=(r.stdout||'')+(r.stderr||'');
  const bad=/^(FAIL|ERR)/m.test(out)||/\bbad[= ](?!0\b)\d+/.test(out)||r.status!==0||!/(pass|ok|items)/i.test(out);
  const last=out.trim().split('\n').filter(Boolean).slice(-1)[0]||'(no output)';
  console.log((bad?'FAIL ':'ok   ')+f.padEnd(18)+((Date.now()-t0)/1000).toFixed(1).padStart(6)+'s  '+last.slice(0,90));
  if(bad){failed++;console.log(out.split('\n').filter(l=>/FAIL|ERR/.test(l)).slice(0,8).map(l=>'     '+l).join('\n'))}
}
console.log('\n'+(failed?failed+' of '+files.length+' test files failed':'all '+files.length+' test files passed'));
process.exit(failed?1:0);
