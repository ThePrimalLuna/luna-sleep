/* Luna Sleep push Worker (Cloudflare). Paste into the Worker editor.
   Needs: a KV binding named SUBS, a secret named ADMIN_TOKEN, and a cron trigger (every 15 minutes).
   No payload is sent with a push. The phone wakes up and asks /latest what to show, so there is no encryption to get wrong. */
const APP = 'https://theprimalluna.github.io/luna-sleep';
const SUB = APP;
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type,authorization', 'access-control-allow-methods': 'GET,POST,OPTIONS' };
const J = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...CORS } });
const b64u = b => btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const HOST_OK = /(^|\.)(googleapis\.com|mozilla\.com|mozaws\.net|push\.apple\.com|notify\.windows\.com)$/;
const MAX_SUBS = 3000, CHUNK = 40;

async function sha(s) { const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(d)].slice(0, 16).map(x => x.toString(16).padStart(2, '0')).join(''); }
async function vapid(env) {
  let j = await env.SUBS.get('vapid', 'json');
  if (!j) {
    const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    j = { priv: await crypto.subtle.exportKey('jwk', kp.privateKey), pub: b64u(await crypto.subtle.exportKey('raw', kp.publicKey)) };
    await env.SUBS.put('vapid', JSON.stringify(j));
  }
  return j;
}
async function authHeader(env, endpoint) {
  const k = await vapid(env);
  const key = await crypto.subtle.importKey('jwk', k.priv, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const enc = o => b64u(new TextEncoder().encode(JSON.stringify(o)));
  const head = enc({ typ: 'JWT', alg: 'ES256' }), body = enc({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: SUB });
  const sig = b64u(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(head + '.' + body)));
  return 'vapid t=' + head + '.' + body + '.' + sig + ', k=' + k.pub;
}
async function pushOne(env, endpoint) {
  try {
    const r = await fetch(endpoint, { method: 'POST', headers: { TTL: '86400', Urgency: 'normal', Authorization: await authHeader(env, endpoint) } });
    return r.status;
  } catch (e) { return 0; }
}
const clean = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, ' ').trim().slice(0, n);
async function startJob(env, n) {
  const id = String(Date.now());
  const latest = { id, title: clean(n.title, 60) || 'Luna Sleep', body: clean(n.body, 140), url: './' };
  await env.SUBS.put('latest', JSON.stringify(latest));
  await env.SUBS.put('job', JSON.stringify({ id, cursor: null, done: false, sent: 0, gone: 0 }));
  return latest;
}
async function step(env) {
  const job = await env.SUBS.get('job', 'json');
  if (!job || job.done) return job || { done: true, sent: 0, gone: 0 };
  const l = await env.SUBS.list({ prefix: 'sub:', limit: CHUNK, cursor: job.cursor || undefined });
  await Promise.all(l.keys.map(async k => {
    const e = k.metadata && k.metadata.e; if (!e) return;
    const st = await pushOne(env, e);
    if (st === 404 || st === 410) { await env.SUBS.delete(k.name); job.gone++; } else if (st >= 200 && st < 300) job.sent++;
  }));
  job.done = l.list_complete; job.cursor = l.list_complete ? null : l.cursor;
  await env.SUBS.put('job', JSON.stringify(job));
  return job;
}
async function countSubs(env) { let n = 0, cursor; do { const l = await env.SUBS.list({ prefix: 'sub:', limit: 1000, cursor }); n += l.keys.length; cursor = l.list_complete ? null : l.cursor; } while (cursor); return n; }
function isAdmin(req, env) { const t = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, ''); return !!env.ADMIN_TOKEN && t.length > 0 && t === env.ADMIN_TOKEN; }

/* new releases: releases.json is generated from the app's catalog (worker/make-releases.py) */
async function checkReleases(env) {
  const now = new Date();
  const hour = +now.toLocaleString('en-US', { timeZone: 'America/Denver', hour: 'numeric', hour12: false }) % 24;
  const today = now.toLocaleDateString('en-CA', { timeZone: 'America/Denver' });
  let list; try { const r = await fetch(APP + '/releases.json?x=' + Date.now()); if (!r.ok) return; list = await r.json(); } catch (e) { return; }
  if (!Array.isArray(list)) return;
  const out = list.filter(x => x && x.id && x.date && x.date <= today);
  let seen = await env.SUBS.get('notified', 'json');
  if (!seen) { await env.SUBS.put('notified', JSON.stringify(out.map(x => x.id))); return; } /* first run: stay quiet about what is already out */
  if (hour < 8) return;
  const fresh = out.filter(x => !seen.includes(x.id));
  if (!fresh.length) return;
  const job = await env.SUBS.get('job', 'json');
  if (job && !job.done) return;
  const title = 'New in Luna Sleep';
  const body = fresh.length === 1 ? (fresh[0].sfw ? fresh[0].title + ' is out now.' : 'A new track is out now.') : fresh.length + ' new tracks are out now.';
  await startJob(env, { title, body });
  await env.SUBS.put('notified', JSON.stringify(seen.concat(fresh.map(x => x.id))));
}

const ADMIN_HTML = `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Luna push</title>
<style>body{font:16px system-ui;max-width:480px;margin:24px auto;padding:0 16px;background:#14162a;color:#e8eaff}input,textarea,button{font:inherit;width:100%;box-sizing:border-box;padding:10px;margin:6px 0 14px;border-radius:10px;border:1px solid #556;background:#1d2040;color:inherit}button{background:#7a86ff;border:0;color:#fff;font-weight:700}small{opacity:.7}</style>
<h1>Send a notification</h1><label>Admin password<input id=t type=password autocomplete=off></label>
<label>Title<input id=ti maxlength=60 value="Luna Sleep"></label><label>Message<textarea id=b rows=3 maxlength=140></textarea></label>
<button id=s>Send to everyone</button><p id=o role=status></p><small>Subscribers: <span id=n>?</span>. Nothing is sent until you press the button.</small>
<script>const $=i=>document.getElementById(i);const H=()=>({'content-type':'application/json',authorization:'Bearer '+$('t').value});
$('t').onchange=async()=>{try{const r=await fetch('/stats',{headers:H()});$('n').textContent=r.ok?(await r.json()).subs:'wrong password'}catch(e){}};
$('s').onclick=async()=>{const o=$('o');o.textContent='Sending...';try{let r=await fetch('/send',{method:'POST',headers:H(),body:JSON.stringify({title:$('ti').value,body:$('b').value})});if(!r.ok){o.textContent='Not sent: '+(r.status===401?'wrong password':'error '+r.status);return}
let j=await r.json();while(!j.done){r=await fetch('/step',{method:'POST',headers:H()});j=await r.json();o.textContent='Sending... '+j.sent+' so far'}o.textContent='Done. Sent to '+j.sent+(j.gone?' ('+j.gone+' old ones removed)':'')+'.'}catch(e){o.textContent='Something went wrong.'}};</script>`;

export default {
  async fetch(req, env) {
    const u = new URL(req.url), p = u.pathname;
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    try {
      if (p === '/' ) return J({ ok: true, name: 'luna-push' });
      if (p === '/vapid') return J({ key: (await vapid(env)).pub });
      if (p === '/latest') return new Response((await env.SUBS.get('latest')) || '{}', { headers: { 'content-type': 'application/json', 'cache-control': 'no-store', ...CORS } });
      if (p === '/subscribe' && req.method === 'POST') {
        const b = await req.json().catch(() => ({})); const e = String(b.endpoint || '');
        let h; try { h = new URL(e); } catch (x) { return J({ error: 'bad' }, 400); }
        if (h.protocol !== 'https:' || !HOST_OK.test(h.hostname) || e.length > 900) return J({ error: 'bad' }, 400);
        const k = 'sub:' + await sha(e);
        if (!(await env.SUBS.get(k)) && (await countSubs(env)) >= MAX_SUBS) return J({ error: 'full' }, 503);
        await env.SUBS.put(k, '1', { metadata: { e } });
        return J({ ok: true });
      }
      if (p === '/unsubscribe' && req.method === 'POST') {
        const b = await req.json().catch(() => ({})); if (b.endpoint) await env.SUBS.delete('sub:' + await sha(String(b.endpoint)));
        return J({ ok: true });
      }
      if (p === '/admin') return new Response(ADMIN_HTML, { headers: { 'content-type': 'text/html;charset=utf-8', 'cache-control': 'no-store' } });
      if (p === '/stats') { if (!isAdmin(req, env)) return J({ error: 'no' }, 401); return J({ subs: await countSubs(env) }); }
      if (p === '/send' && req.method === 'POST') {
        if (!isAdmin(req, env)) return J({ error: 'no' }, 401);
        const b = await req.json().catch(() => ({})); if (!clean(b.body, 140) && !clean(b.title, 60)) return J({ error: 'empty' }, 400);
        await startJob(env, b); return J(await step(env));
      }
      if (p === '/step' && req.method === 'POST') { if (!isAdmin(req, env)) return J({ error: 'no' }, 401); return J(await step(env)); }
    } catch (e) { return J({ error: 'server' }, 500); }
    return J({ error: 'not found' }, 404);
  },
  async scheduled(_e, env) { await checkReleases(env); await step(env); }
};
