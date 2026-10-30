#!/usr/bin/env node
/* Lints the inline <script> blocks of index.html (no plugin needed), plus sw.js and worker/worker.js.
   Errors fail the run. Warnings are printed as a count. Needs eslint (npm install). */
const fs=require('fs'),path=require('path'),os=require('os'),{spawnSync}=require('child_process');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const js=[...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).join('\n;\n');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'lunalint-'));
const f=path.join(tmp,'index-scripts.js');fs.writeFileSync(f,js);
const cfg=JSON.parse(fs.readFileSync(path.join(root,'.eslintrc.json'),'utf8'));delete cfg.plugins;delete cfg.overrides;
const cf=path.join(tmp,'rc.json');fs.writeFileSync(cf,JSON.stringify(cfg));
const bin=path.join(root,'node_modules','.bin','eslint');
const run=(files,extra=[])=>spawnSync(fs.existsSync(bin)?bin:'eslint',['--no-eslintrc','-c',cf,'-f','json',...extra,...files],{encoding:'utf8',maxBuffer:1<<28});
let errors=0,warn=0;
for(const [files,extra] of [[[f],[]],[[path.join(root,'sw.js')],[]],[[path.join(root,'worker','worker.js')],['--parser-options=sourceType:module']]]){
  const r=run(files,extra);let out;try{out=JSON.parse(r.stdout)}catch(e){console.log('ERR eslint did not run:',(r.stderr||r.stdout).slice(0,300));process.exit(1)}
  for(const x of out)for(const m of x.messages){if(m.severity===2){errors++;console.log('ERR',path.basename(x.filePath),m.line+':'+m.column,m.ruleId,m.message)}else warn++}
}
console.log('lint: '+(errors?'FAIL ':'pass, ')+errors+' errors, '+warn+' warnings ');
process.exit(errors?1:0);
