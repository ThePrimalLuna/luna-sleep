# Haptic scores

One JSON master per track (luna-haptic v1). `tools/gen-score.py` compacts them into `index.html`. Edit the master, run the generator, run the tests.

- `the-call.json`: SKU 00 THE CALL. Cues follow the script's timestamps. Cues tagged `sync: est` were placed by estimate and may need re-timing against the final audio.
- Format: `t` seconds from audio start, `i` intensity 0..1, `s` sharpness 0..1, kinds tap, seq, hit, hum, heartbeat, void. `playback.bedCeiling` caps beds and breaths. A `void` is deliberate silence and always wins.
- The `ahap`, CSV and cue sheet files from the handoff are not used by the app.
- `the-instinct.json`: SKU 02 INSTINCT, same texture-cue format as the-coat.json.
- `the-den.json`: SKU 03 THE DEN, same texture-cue format.
- `the-howl.json`: SKU 04 THE HOWL, same texture-cue format.
- `the-pack.json`: SKU 05 THE PACK, same texture-cue format. Its last cue is past 15:30, so the score length is 15:45.
- `the-hunt.json`: SKU 06 THE HUNT, same texture-cue format (final heartbeat runs at 80 bpm).
- `the-stream.json`: SKU 07 THE STREAM, same texture-cue format.
- `the-shadow.json`: SKU 08 THE SHADOW, same texture-cue format.
- `the-alpha.json`: SKU 09 THE ALPHA, same texture-cue format. Last cue ends at 15:00, score length 15:05.
- `the-coat.json`: SKU 01 THE COAT. Texture cues (`kind: tex`, `feel` = a texture id from the Haptics screen, `d` = seconds, `bpm` for heart). The app plays the texture's own pattern at the listener's strength. Textures with randomness are seeded from the cue time, so a cue sounds the same every time.
