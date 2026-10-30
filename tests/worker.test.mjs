import w from '../worker/worker.js';
const store=new Map();
const env={ADMIN_TOKEN:'pw',SUBS:{
 async get(k,t){const v=store.get(k);if(!v)return null;return t==='json'?JSON.parse(v.v):v.v},
 async put(k,v,o){store.set(k,{v,m:o&&o.metadata})},
 async delete(k){store.delete(k)},
 async list({prefix,limit,cursor}){const ks=[...store.keys()].filter(k=>k.startsWith(prefix)).sort();const s=cursor?+cursor:0;const sl=ks.slice(s,s+limit);return{keys:sl.map(k=>({name:k,metadata:store.get(k).m})),list_complete:s+limit>=ks.length,cursor:String(s+limit)}}}};
let ok=0,bad=0;const t=(c,m)=>c?ok++:(bad++,console.log('FAIL',m));
const call=(p,o={})=>w.fetch(new Request('https://x'+p,o),env);
const pushes=[];globalThis.fetch=async(u,o)=>{if(String(u).includes('releases.json'))return new Response(JSON.stringify([{id:'A',title:'OLD',date:'2020-01-01',sfw:true},{id:'B',title:'NEWONE',date:'2020-01-02',sfw:true}]));pushes.push([u,o]);return new Response(null,{status:u.includes('dead')?410:201})};
let r=await(await call('/vapid')).json();t(r.key&&r.key.length>80,'vapid');
const key=r.key;
t((await call('/subscribe',{method:'POST',body:JSON.stringify({endpoint:'https://evil.example.com/x'})})).status===400,'reject host');
for(let i=0;i<45;i++)await call('/subscribe',{method:'POST',body:JSON.stringify({endpoint:'https://fcm.googleapis.com/fcm/send/'+(i===3?'dead':'ok')+i})});
t((await(await call('/stats',{headers:{authorization:'Bearer pw'}})).json()).subs===45,'45 subs');
t((await call('/send',{method:'POST',body:'{}'})).status===401,'send needs auth');
let j=await(await call('/send',{method:'POST',headers:{authorization:'Bearer pw'},body:JSON.stringify({title:'Hi <b>',body:'yo'})})).json();
t(!j.done&&j.sent+j.gone===40,'first chunk '+JSON.stringify(j));
j=await(await call('/step',{method:'POST',headers:{authorization:'Bearer pw'}})).json();
t(j.done&&j.sent===44&&j.gone===1,'second chunk '+JSON.stringify(j));
const lt=await(await call('/latest')).json();t(lt.title==='Hi  b ' .trim()||lt.title.indexOf('<')<0,'sanitized '+lt.title);
// verify VAPID JWT signature
const [u,o]=pushes[0];const a=o.headers.Authorization;const m=a.match(/t=([^,]+), k=(.+)/);const [h,b,s]=m[1].split('.');
const ub=x=>Uint8Array.from(Buffer.from(x.replace(/-/g,'+').replace(/_/g,'/'),'base64'));
const pk=await crypto.subtle.importKey('raw',ub(m[2]),{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
t(await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},pk,ub(s),new TextEncoder().encode(h+'.'+b)),'JWT verifies');
t(JSON.parse(Buffer.from(b,'base64').toString()).aud==='https://fcm.googleapis.com','aud');
// releases: first run quiet, second sends
await w.scheduled({},env);t((await env.SUBS.get('notified','json')).length===2,'first run silent');
const rel=JSON.parse(await (await fetch('https://x/releases.json')).text());
// simulate new release by altering notified
await env.SUBS.put('notified',JSON.stringify(['A']));await w.scheduled({},env);
const L=await env.SUBS.get('latest','json');t(/NEWONE/.test(L.body)||new Date().toLocaleString('en-US',{timeZone:'America/Denver',hour:'numeric',hour12:false})<8,'release body '+L.body);
// prefs
store.clear();
const sub=(n,x)=>call('/subscribe',{method:'POST',body:JSON.stringify(Object.assign({endpoint:'https://fcm.googleapis.com/fcm/send/'+n},x))});
await sub('a',{});await sub('b',{r:0});await sub('c',{n:0});
const nowHr=+new Date().toLocaleString('en-US',{timeZone:'America/Denver',hour:'numeric',hour12:false})%24;
await sub('d',{q:[nowHr,(nowHr+2)%24],z:'America/Denver'});await sub('e',{q:[25,3],z:'America/Denver'});await sub('f',{q:[1,2],z:'Not/AZone'});
pushes.length=0;
let jn=await(await call('/send',{method:'POST',headers:{authorization:'Bearer pw'},body:JSON.stringify({title:'t',body:'b',kind:'news'})})).json();
t(jn.done&&jn.sent===4&&jn.held===2,'news: r:0 sent, n:0 held, quiet held '+JSON.stringify(jn));
pushes.length=0;
jn=await(await call('/send',{method:'POST',headers:{authorization:'Bearer pw'},body:JSON.stringify({title:'t',body:'b',kind:'release'})})).json();
t(jn.done&&jn.held===2&&jn.sent===4,'release: n:0 sent, r:0 held, quiet held '+JSON.stringify(jn));
const meta=[...store.entries()].filter(([k])=>k.startsWith('sub:')).map(([k,v])=>v.m);
t(meta.some(m=>m.z==='America/Denver')&&meta.every(m=>!(m.z==='Not/AZone')),'bad zone dropped');
console.log('ok',ok,'bad',bad);
