LUNA SLEEP - installable web app (PWA)

WHAT THIS IS
A folder of static files. Put the whole folder on any HTTPS web host and visitors can
open the link and install Luna Sleep to their home screen like an app. No app store.

FILES
  index.html            the app
  manifest.webmanifest  name, colors and icons (this is what makes it installable)
  sw.js                 lets it open offline and load fast
                  app icons

PUT IT ONLINE (any one of these, all free)
  Netlify:       drag this folder onto app.netlify.com/drop, then (optional) attach your own domain.
  Cloudflare Pages: create a project and upload this folder.
  GitHub Pages:  put the files in a repo and turn on Pages.
It must be served over https:// (all of the above do this for you). Opening index.html
straight from your computer will work as a page but will not be installable.

HOW YOUR SUBSCRIBERS INSTALL IT
  Android (Chrome): open the link, tap the "Install app" button in the top bar
                    (or menu > Install app).
  iPhone/iPad:      open the link in Safari, tap Share, then "Add to Home Screen".
  Computer:         use the install icon in the address bar.

UPDATING LATER
Replace index.html, then change VERSION at the top of sw.js (for example luna-sleep-v1
to luna-sleep-v2) and re-upload. Installed copies refresh the next time they are opened
with a connection.

NOTES
- Everyone's progress, saved sessions and settings stay on their own device. The app has
  a Backup file option for moving them.
- The page itself and its text (including unreleased track names) can be read by anyone with
  the link. Only the audio is gated, by Patreon.
- Haptic scores: scores/*.json are the masters, tools/gen-score.py compacts them into index.html (npm run check
  verifies they match). THE CALL is the first. Playback follows the Spotify embed's page API (a script from
  open.spotify.com, loaded only when the switch is on and the track has a score), with a by-hand fallback.
- The app never listens: it uses no microphone, camera or motion sensors. The Hold pad and every haptic
  feature only respond to touch and to timers.

- v56 storage: lunaSleep.stimer (sleep timer choice) is included in backups. lunaSleep.last (last tracks and tool),
  lunaSleep.filt (Library and Combos filters, 3-day expiry) and lunaSleep.nm (Night mode's remembered settings) are
  deliberately not backed up. Closing a dialog returns to the previous dialog or the Menu (see cxS in index.html).

- v58 storage: lunaSleep.mixes (up to six saved Trigger Mixes: name, texture, strength, heartbeat speed, glow color) is
  included in backups. lunaSleep.vib gained an optional hue (glow color). The Count stores nothing and uses touch only.

- v58 notifications: the Worker lives at luna-push.thorned-rose2010.workers.dev (code in worker/worker.js, paste it into
  the Cloudflare editor). It needs a KV binding named SUBS, a secret named ADMIN_TOKEN and a cron every 15 minutes.
  Pushes carry no text; the service worker asks the Worker's /latest what to show. New-release alerts come from
  releases.json, which worker/make-releases.py builds from the catalog: run it and push the file whenever dates change.
  Only SFW titles are ever shown. The Worker's /admin page sends a manual notice. The app stores nothing for this.

v59 NOTES
- New storage: lunaSleep.act (daily activity counts for the weekly recap), lunaSleep.push (notification choices),
  lunaSleep.mixes (Trigger Mix saves). Reader font, size and spacing now save with the main state.
  Delete everything clears all of them. Backup carries act and mixes; push choices stay on the phone because a
  notification subscription belongs to one device.
- Get help (trafficking and domestic violence hotlines) is in the Emergency Exit screen, Safety and consent, and the Resources tab. It saves nothing.
- Developer docs are in README.md, CLAUDE.md and docs/. Run "npm run check" before releasing.
- If worker/worker.js changed, paste it into the Cloudflare Worker editor again and Deploy.

v62 NOTES
- THE CALL haptic score (scores/the-call.json). Edit the master, run python3 tools/gen-score.py, run the tests (t137).
- Settings key lunaSleep.vib gains "score" (backup and wipe already cover it).
- Not verified against real Spotify from the build machine: auto-follow is tested with a mock of the page API. Try it on a phone.

v61 NOTES
- Six new haptic textures (knead, fur, paws, bellows, cricket, chimes). To add one: TEX, TXN, a texPat branch and a group in TXC. Backup, mixes and the Every texture achievement follow TEX.
- texPick is the shared group-and-texture picker used by Haptics and Trigger Mix.
- Haptics and glow is built from collapsible sections (sec() in LT.hapticsOpen).

v60 NOTES
- Backups now include settings (theme, text size, contrast, font, calm, night mode, reader options, story positions) in ls.prefs.
- Dusk theme: Auto uses it on dark-mode phones in place of the light album colors (White, Silver, Rose, Prism, Gold).
- What's new opens by itself only when LOGV changes.
- tests/personas.js walks the app as a new, returning and veteran listener; tests/crawl.js opens everything.
