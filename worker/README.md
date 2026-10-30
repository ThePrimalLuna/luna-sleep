# luna-push Worker

Sends payload-less web push (VAPID) when new tracks release or when the owner posts news.

Cloudflare setup: a KV namespace bound as `SUBS`; secret `ADMIN_TOKEN`; a cron trigger `*/15 * * * *`. VAPID keys are generated on first use and kept in KV.

Endpoints: /vapid, /subscribe, /unsubscribe, /latest, /stats (admin), /send (admin), /admin (page), /step (chunked sending, 40 per step).
Subscribers keep prefs (releases/news, quiet hours via timezone). The cron reads `releases.json` from the site, notifies SFW titles only (8am America/Denver), and stays silent on its first run.
The service worker fetches `/latest` to get the text to show.
Test: `node tests/worker.test.mjs` if present (uses a mock KV).
