/* t139: THE COAT texture score */
const APP='file://'+require('path').resolve(__dirname,'../index.html');const {chromium}=require('playwright');
let pass=0,bad=0;const ok=(c,m)=>{if(c)pass++;else{bad++;console.log('FAIL',m)}};
(async()=>{const b=await chromium.launch();try{
const p=await (await b.newContext({viewport:{width:400,height:820}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(APP);await p.waitForTimeout(800);const ev=(f,a)=>p.evaluate(f,a);
const r=await ev(()=>{const sc=LT.scoreFor('THE COAT'),bad=[];let n=0;if(!sc)return{none:1};
 for(let l=1;l<=5;l++)for(let s=0;s<905;s+=2.5){const x=LT.scoreRender(sc,s,3.2,l).p;n+=x.length;if(x.length>99||x.some((v,i)=>!Number.isInteger(v)||v<0||(v===0&&i!==0)||v>10000))bad.push(l+'@'+s)}
 const a=JSON.stringify(LT.scoreRender(sc,60,2,3).p),c=JSON.stringify(LT.scoreRender(sc,60,2,3).p);
 return{cues:sc.cues.length,bad:bad.slice(0,5),n,same:a===c,quiet:LT.scoreRender(sc,200,20,3).p.length,thunder:LT.scoreRender(sc,59.9,1.5,3).p.length,len:sc.len}});
ok(!r.none&&r.cues===37,'37 cues '+JSON.stringify(r));ok(r.bad.length===0,'all windows valid '+r.bad);ok(r.n>1000,'plays something');ok(r.same,'same cue sounds the same each time');
ok(r.quiet===0,'quiet between cues');ok(r.thunder>0,'thunder cue at 1:00 sounds');ok(r.len===900,'length 900');
ok(await ev(()=>LT.scoreFor('THE CALL')&&LT.scoreFor('THE CALL').cues.length===96),'THE CALL untouched');
const r2=await ev(()=>{const sc=LT.scoreFor('INSTINCT'),bad=[];if(!sc)return{none:1};for(let l=1;l<=5;l++)for(let s=0;s<905;s+=2.5){const x=LT.scoreRender(sc,s,3.2,l).p;if(x.length>99||x.some((v,i)=>!Number.isInteger(v)||v<0||(v===0&&i!==0)||v>10000))bad.push(l+'@'+s)}return{cues:sc.cues.length,bad:bad.length,rock:LT.scoreRender(sc,842,3,3).p.length>0,quiet:LT.scoreRender(sc,200,20,3).p.length}});
ok(r2.cues===28&&r2.bad===0&&r2.rock&&r2.quiet===0,'INSTINCT score valid '+JSON.stringify(r2));
const r3=await ev(()=>{const sc=LT.scoreFor('THE DEN'),bad=[];if(!sc)return{none:1};for(let l=1;l<=5;l++)for(let s=0;s<905;s+=2.5){const x=LT.scoreRender(sc,s,3.2,l).p;if(x.length>99||x.some((v,i)=>!Number.isInteger(v)||v<0||(v===0&&i!==0)||v>10000))bad.push(l+'@'+s)}return{cues:sc.cues.length,bad:bad.length,hb:LT.scoreRender(sc,0,3,3).p.length>0,quiet:LT.scoreRender(sc,200,20,3).p.length}});
ok(r3.cues===11&&r3.bad===0&&r3.hb&&r3.quiet===0,'THE DEN score valid '+JSON.stringify(r3));
const r4=await ev(()=>{const sc=LT.scoreFor('THE HOWL'),bad=[];if(!sc)return{none:1};for(let l=1;l<=5;l++)for(let s=0;s<905;s+=2.5){const x=LT.scoreRender(sc,s,3.2,l).p;if(x.length>99||x.some((v,i)=>!Number.isInteger(v)||v<0||(v===0&&i!==0)||v>10000))bad.push(l+'@'+s)}return{cues:sc.cues.length,bad:bad.length,quiet:LT.scoreRender(sc,200,20,3).p.length}});
ok(r4.cues===19&&r4.bad===0&&r4.quiet===0,'THE HOWL score valid '+JSON.stringify(r4));
const r5=await ev(()=>{const sc=LT.scoreFor('THE PACK'),bad=[];if(!sc)return{none:1};for(let l=1;l<=5;l++)for(let s=0;s<945;s+=2.5){const x=LT.scoreRender(sc,s,3.2,l).p;if(x.length>99||x.some((v,i)=>!Number.isInteger(v)||v<0||(v===0&&i!==0)||v>10000))bad.push(l+'@'+s)}return{cues:sc.cues.length,bad:bad.length,len:sc.len,last:LT.scoreRender(sc,930.5,2,3).p.length>0}});
ok(r5.cues===23&&r5.bad===0&&r5.len>=932&&r5.last,'THE PACK score valid '+JSON.stringify(r5));
const r6=await ev(()=>{const sc=LT.scoreFor('THE HUNT'),bad=[];if(!sc)return{none:1};for(let l=1;l<=5;l++)for(let s=0;s<905;s+=2.5){const x=LT.scoreRender(sc,s,3.2,l).p;if(x.length>99||x.some((v,i)=>!Number.isInteger(v)||v<0||(v===0&&i!==0)||v>10000))bad.push(l+'@'+s)}return{cues:sc.cues.length,bad:bad.length,fast:LT.scoreRender(sc,855,10,3).p.length>0}});
ok(r6.cues===19&&r6.bad===0&&r6.fast,'THE HUNT score valid '+JSON.stringify(r6));
const r7=await ev(()=>{const sc=LT.scoreFor('THE STREAM'),bad=[];if(!sc)return{none:1};for(let l=1;l<=5;l++)for(let s=0;s<905;s+=2.5){const x=LT.scoreRender(sc,s,3.2,l).p;if(x.length>99||x.some((v,i)=>!Number.isInteger(v)||v<0||(v===0&&i!==0)||v>10000))bad.push(l+'@'+s)}return{cues:sc.cues.length,bad:bad.length,tide:LT.scoreRender(sc,891,6,3).p.length>0}});
ok(r7.cues===16&&r7.bad===0&&r7.tide,'THE STREAM score valid '+JSON.stringify(r7));
const r8=await ev(()=>{const sc=LT.scoreFor('THE SHADOW'),bad=[];if(!sc)return{none:1};for(let l=1;l<=5;l++)for(let s=0;s<905;s+=2.5){const x=LT.scoreRender(sc,s,3.2,l).p;if(x.length>99||x.some((v,i)=>!Number.isInteger(v)||v<0||(v===0&&i!==0)||v>10000))bad.push(l+'@'+s)}return{cues:sc.cues.length,bad:bad.length,chimes:LT.scoreRender(sc,777,6,3).p.length>0}});
ok(r8.cues===20&&r8.bad===0&&r8.chimes,'THE SHADOW score valid '+JSON.stringify(r8));
const r9=await ev(()=>{const sc=LT.scoreFor('THE ALPHA'),bad=[];if(!sc)return{none:1};for(let l=1;l<=5;l++)for(let s=0;s<910;s+=2.5){const x=LT.scoreRender(sc,s,3.2,l).p;if(x.length>99||x.some((v,i)=>!Number.isInteger(v)||v<0||(v===0&&i!==0)||v>10000))bad.push(l+'@'+s)}const all=['THE COAT','INSTINCT','THE DEN','THE HOWL','THE PACK','THE HUNT','THE STREAM','THE SHADOW','THE ALPHA','THE CALL'].every(n=>LT.scoreFor(n));return{cues:sc.cues.length,bad:bad.length,all,end:LT.scoreRender(sc,898,2,3).p.length>0}});
ok(r9.cues===16&&r9.bad===0&&r9.all&&r9.end,'THE ALPHA valid, all ten Foundation scores present '+JSON.stringify(r9));
ok(!errs.length,'no page errors '+errs);console.log('t139',pass,'pass',bad,'fail');process.exit(bad?1:0)}finally{await b.close()}})();
