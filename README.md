# Luna Sleep

Listener app (installable PWA) for Luna Sleep, a Patreon-only hypnotic audio catalog by The Primal Luna. Single-file vanilla JS, no build step.
Live: https://theprimalluna.github.io/luna-sleep

## Develop
```
npm install
npx playwright install chromium
npm run check     # static checks, lint, accessibility scan, all browser tests
```
Open `index.html` in a browser to try it (serve over https or localhost to test install and push).

Read CLAUDE.md first (standing rules), then docs/ARCHITECTURE.md, docs/STORAGE.md, docs/RELEASING.md and worker/README.md.
README.txt is the owner's plain-language hosting note.
