# Sakuga interface audio

Selected [Kenney UI Audio](https://github.com/Calinou/kenney-ui-audio), a GitHub package of Kenney Vleugels' UI SFX Set. The README and `LICENSE.txt` were read before use; they identify CC0 1.0 and explicitly permit personal and commercial use. The source commit is `8c3d81b9159d058c444f89d12d518276b0b09345`.

| Action                       | Unmodified source file               | Duration |
| ---------------------------- | ------------------------------------ | -------: |
| Button activation            | `addons/kenney_ui_audio/click3.wav`  |     89ms |
| Link navigation              | `addons/kenney_ui_audio/click1.wav`  |    103ms |
| Select, toggle or disclosure | `addons/kenney_ui_audio/switch7.wav` |    213ms |

The three original WAV files total 71,658 bytes and are served from `/audio/kenney/v1/` with immutable caching. `LICENSE.txt` and `provenance.json` accompany them; the manifest records upstream commit, original paths, sizes, durations and SHA-256 fingerprints. No generation scripts or upstream executable code were run.

GitHub research also considered the Soft Sounds repository. Its README describes AI-generated effects; the existing Kenney collection supplied the desired cohesive, physical interface cues without adding another runtime dependency.

Audio stays opt-in, with the existing version-2 preference preserved. No sound files load until the user enables sounds or interacts with an already-enabled preference. Buffers are fetched and decoded once per player, active voices are bounded, late requests are discarded, mute cancels pending playback, and teardown aborts pending fetches and closes the context. Missing or blocked audio never prevents navigation or saving. Hover chatter, synthesized oscillators and all music are absent. Sounds indicate an action, not successful server persistence.
