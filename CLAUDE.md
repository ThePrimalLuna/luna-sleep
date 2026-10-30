# Luna Sleep: notes for any developer or AI assistant

Owner: Wolfie, brand "The Primal Luna" (they/them). Hypnotic audio catalog on Patreon; this repo is the free listener app.

## Standing rules
- Single-file vanilla JS app: `index.html`. No framework, no build step, no tracking.
- Push to `main` only when the owner says "push". Preview first, then commit locally.
- Every release: bump `APP_VERSION` in index.html AND `VERSION` in sw.js (they must match; `npm run static` checks), add a What's new entry (secret themes and secret achievements are never listed), update the tests that name the version/log id (`LOGV`).
- Anything new stored in localStorage must be included in Backup/Restore and in "Delete everything". See docs/STORAGE.md.
- Never build listening, microphone, camera or motion features. The app only responds to touch and timers.
- The owner's real name must never appear in public content or code.
- Lovense/toy support is pinned (owner has no toys). Do not start it unprompted.
- Safety first: Emergency Exit, Quick hide, Get help cards and AWAKE guidance must keep working. Test them after UI changes.

## Commands
`npm install`, `npx playwright install chromium`, then `npm run check` (static, lint, all browser tests). Lint should show 0 errors.

## Docs
docs/ARCHITECTURE.md, docs/STORAGE.md, docs/RELEASING.md, worker/README.md.
