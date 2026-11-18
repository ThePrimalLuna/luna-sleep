const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();let f=0;const ok=(c,m)=>{if(!c){f++;console.log('FAIL',m)}else console.log('ok',m)};
await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(500);
const h=await p.evaluate(()=>{const g=s=>{const e=document.querySelector(s);return e?(e.content||e.href||e.textContent):''};return{t:document.title,d:g('meta[name=description]'),c:g('link[rel=canonical]'),ogt:g('meta[property="og:title"]'),ogi:g('meta[property="og:image"]'),ogd:g('meta[property="og:description"]'),tw:g('meta[name="twitter:card"]'),ld:g('script[type="application/ld+json"]'),r:g('meta[name=robots]'),pc:document.querySelectorAll('link[rel=preconnect]').length,ns:!!document.querySelector('noscript')}});
ok(h.t.length<=60&&/Luna Sleep/.test(h.t),'title short and named: '+h.t);
ok(h.d.length>=100&&h.d.length<=160&&/18\+/.test(h.d),'description length and 18+ ('+h.d.length+')');
ok(h.c==='https://theprimalluna.github.io/luna-sleep/','canonical');
ok(h.ogt===h.t&&h.ogd===h.d&&/og-image\.png$/.test(h.ogi)&&h.tw==='summary_large_image','og and twitter tags');
let j=null;try{j=JSON.parse(h.ld)}catch(e){}
ok(j&&j['@type']==='WebApplication'&&j.isAccessibleForFree===true&&j.audience.suggestedMinAge===18,'JSON-LD parses');
ok(/index/.test(h.r)&&h.pc===2&&h.ns,'robots meta, preconnects, noscript');
const img=fs.readFileSync('og-image.png');ok(img.readUInt32BE(16)===1200&&img.readUInt32BE(20)===630,'og-image is 1200x630');
const m=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));ok(m.id==='./'&&m.start_url==='./'&&m.lang==='en','manifest id matches start_url');
ok(/theprimalluna\.github\.io\/luna-sleep\//.test(fs.readFileSync('sitemap.xml','utf8')),'sitemap');
const log=await p.evaluate(()=>document.body.innerText.toLowerCase());ok(!/\bseo\b|open graph|json-ld/.test(log),'not announced in the app');
await b.close();process.exit(f?1:0)})();
