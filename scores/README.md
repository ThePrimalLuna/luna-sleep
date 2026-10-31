# Haptic scores

One JSON master per track (luna-haptic v1). `tools/gen-score.py` compacts them into `index.html`. Edit the master, run the generator, run the tests.

- `the-call.json`: SKU 00 THE CALL. Drafted with Claude's help from the script's timestamps. The spoken script is Luna's. Cues tagged `sync: est` were placed by estimate and may need re-timing against the final audio.
- Format: `t` seconds from audio start, `i` intensity 0..1, `s` sharpness 0..1, kinds tap, seq, hit, hum, heartbeat, void. `playback.bedCeiling` caps beds and breaths. A `void` is deliberate silence and always wins.
- The `ahap`, CSV and cue sheet files from the handoff are not used by the app.
