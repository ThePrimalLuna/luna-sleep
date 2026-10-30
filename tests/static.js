#!/usr/bin/env node
/* Fast checks with no browser: duplicate ids, version sync, parseable data, releases.json shape. */
const fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
let bad=0;const ok=(c,m)=>{if(!c){bad++;console.log('FAIL',m)}};
const ids={};for(const m of html.matchAll(/\sid="([^"]+)"/g))ids[m[1]]=(ids[m[1]]||0)+1;
const dup=Object.keys(ids).filter(k=>ids[k]>1);ok(!dup.length,'duplicate ids: '+dup.join(', '));
const av=(html.match(/APP_VERSION='(v\d+)'/)||[])[1],sv=(sw.match(/VERSION='luna-sleep-(v\d+)'/)||[])[1];
ok(av&&av===sv,'APP_VERSION ('+av+') and sw.js VERSION ('+sv+') must match');
const rel=JSON.parse(fs.readFileSync(path.join(root,'releases.json'),'utf8'));
ok(Array.isArray(rel)&&rel.length>0&&rel.every(r=>r.id&&r.title&&/^\d{4}-\d\d-\d\d$/.test(r.date)&&typeof r.sfw==='boolean'),'releases.json shape');
ok(!/thorned\.rose|@gmail\.com/i.test(html),'personal email must not appear in index.html');
JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
console.log(bad?'static: '+bad+' failed':'static checks: pass ('+av+')');
process.exit(bad?1:0);
