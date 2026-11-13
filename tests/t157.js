/* t157: one-week schedule slide keeps order, Mon/Wed/Fri, and stays out of Station Zero and blackout windows; Gold untouched */
const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage();let f=0;const ok=(c,m)=>{if(!c){f++;console.log('FAIL',m)}};
await p.addInitScript(()=>{try{localStorage.setItem('lunaSleep.denAck','1');localStorage.setItem('lunaSleep.cheevoInit','1')}catch(e){}});
await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(400);
const r=await p.evaluate(()=>{const T=CAT.tracks,g=i=>T.find(x=>x.id===i).date;const ng=T.filter(x=>x.pillar!=='Gold'&&x.date>='2026-11-16');
const dow=s=>new Date(s+'T12:00:00Z').getUTCDay();const bad=[],win=[];
const inSZ=s=>(s>='2026-12-20'&&s<='2027-01-01')||(s>='2027-12-20'&&s<='2028-01-01');
const bl=s=>[[4,20],[5,3],[8,24],[10,2]].some(([m,d])=>{const y=+s.slice(0,4);return Math.abs((new Date(s+'T12:00:00Z')-Date.UTC(y,m-1,d,12))/864e5)<=3});
ng.forEach(x=>{if(![1,3,5].includes(dow(x.date)))bad.push(x.id);if(inSZ(x.date)||bl(x.date))win.push(x.id)});
const sorted=[...ng].sort((a,b)=>a.date<b.date?-1:1);
return{ro:g('RO-01'),a:g('A-01'),w:g('W-01'),s1:g('S-01'),a3:g('A-03'),s3:g('S-03'),p1:g('P-01'),sz1:g('SZ-01'),sz13:g('SZ-13'),ug1:g('UG-01'),r01:g('R-01'),bad,win,dup:new Set(ng.map(x=>x.date)).size!==ng.length,hist:(ALLR.find(x=>x.id==='whats-new-history')||{}).body||''}});
ok(r.ro==='2026-11-16'&&r.a==='2026-11-18'&&r.w==='2026-11-20'&&r.s1==='2026-11-23','first week slid '+JSON.stringify(r));
ok(r.a3==='2027-01-04'&&r.s3==='2027-01-08'&&r.p1==='2027-01-11','Station Zero window respected');
ok(r.sz1==='2026-12-20'&&r.sz13==='2027-01-01'&&r.ug1==='2027-12-20','Gold unchanged');
ok(r.r01==='2026-11-06','released tracks unchanged');
ok(!r.bad.length,'Mon/Wed/Fri kept '+r.bad);ok(!r.win.length,'no release in a protected window '+r.win);ok(!r.dup,'no two releases on one day');
ok(/Release schedule moved back one week/.test(r.hist),'What\'s new notes the slide');
await b.close();console.log(f?'t157 FAILED':'t157 ok');process.exit(f?1:0)})()
