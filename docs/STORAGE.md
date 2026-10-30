# Storage

Everything lives in `localStorage` under `lunaSleep.*` on the listener's device. Nothing is sent anywhere except the optional push subscription (see below).

Main state is one blob saved by `save()`. Separate keys: act (daily activity counts for the weekly recap), calm, cheevoInit, cheevos, comfort, cvQuiet, cvd, denAck, dp, filt, font, gr, hc, hidePanic, inst, last, mixes (Trigger Mix saves), newOptOut, newSeen, nm, panicPos, push (notification preferences), qhAuto, rdpos, safe, shp, simple, sosPos, sosTuck, stimer, tn, tsz, vib, ws, wsh, wsl.

Rules for a new key:
1. Add it to the backup wrapper (search for `mixes` and `act` in the backup code).
2. Make sure "Delete everything" (`LT.wipeOpen`) clears it. It removes keys starting with `lunaSleep.`, and leaves other apps on the same github.io origin alone.
3. Never store anything the listener would not expect, and never the real name.

Push: when enabled, the browser's push subscription plus chosen preferences (releases/news, quiet hours, timezone) go to the Worker. Turning notifications off unsubscribes.
