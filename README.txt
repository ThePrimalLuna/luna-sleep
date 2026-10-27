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
- Haptic scores are a placeholder. Haptics and glow shows a locked, labelled "Not active yet" slot, and the
  code has an empty SCORES table (format described in the comment above it) plus LT.scoreFor(id). Nothing
  calls it yet, so adding an entry does nothing until the playback side is built.
- The app never listens: it uses no microphone, camera or motion sensors. The Hold pad and every haptic
  feature only respond to touch and to timers.
