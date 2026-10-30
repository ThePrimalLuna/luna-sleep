# Releasing

1. Make the change. Bump `APP_VERSION` (index.html) and `VERSION` (sw.js) together. Add a What's new entry and bump `LOGV`.
2. If the catalog changed: `python3 worker/make-releases.py`. If themes changed: edit tools/gen-themes.py and run it.
3. `npm run check` (static, lint with 0 errors, all browser tests).
4. Publish the preview artifact and let the owner look.
5. Commit. Push to `main` only when the owner says so. GitHub Pages deploys from main; CI runs the checks, and the Update releases.json workflow keeps releases.json current.
6. If worker/worker.js changed, the owner must paste it into the Cloudflare dashboard (Workers, luna-push, Edit code, Deploy). Pushing to GitHub does not update it.
