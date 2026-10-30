# Storage

Everything lives in `localStorage` under `lunaSleep.*` on the listener's device. Nothing is sent anywhere except the optional push subscription (see below).

Main state is one blob saved by `save()`. Separate keys: act (daily activity counts for the weekly recap), calm, cheevoInit, cheevos, comfort, cvQuiet, cvd, denAck, dp, filt, font, gr, hc, hidePanic, inst, last, mixes (Trigger Mix saves), newOptOut, newSeen, nm, panicPos, push (notification preferences), qhAuto, rdpos, safe, shp, simple, sosPos, sosTuck, stimer, tn, tsz, vib, ws, wsh, wsl.

Backup coverage: the main state, cheevos, looks, and `LT.backupStores()` (vib, gr, dp, tn, safe, flags, stimer, mixes, act, and `prefs`: font, hc, simple, calm, cvQuiet, cvd, shp, qhAuto, tsz, newOptOut, theme, reader options, night mode, story positions). Not backed up on purpose: push (tied to one device), filt (expires in 3 days), last, newSeen, denAck, cheevoInit, positions of floating buttons.
`tests/crawl.js` checks a full backup round trip.

Rules for a new key:
1. Add it to backup by wrapping `LT.backupStores` / `LT.restoreStores` (see the v60 prefs wrapper) and validate on restore.
2. Make sure "Delete everything" (`LT.wipeOpen`) clears it. It removes keys starting with `lunaSleep.`, and leaves other apps on the same github.io origin alone.
3. Never store anything the listener would not expect, and never the real name.

Push: when enabled, the browser's push subscription plus chosen preferences (releases/news, quiet hours, timezone) go to the Worker. Turning notifications off unsubscribes.
