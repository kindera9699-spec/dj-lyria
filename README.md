# 🎧 [DJ](https://daoch4n.github.io/dj-lyria/) [Lyria](https://deepmind.google/models/lyria/realtime) [MIDI](https://en.wikipedia.org/wiki/MIDI) AI synth 🎛️

- 🎛️ vibe knobs ( 🖱️ mouse | 🫵🏻 touch | 🎛️ MIDI )
- 💾 save | load presets
- ✨ auto ( ⚖️ randomizer )
- 🎐 flow ( 🌱 randomizer )
- ⚙️ sidebar:
  - `BPM`
  - `Density`
  - `Brightness`
  - `Scale`
  - `Temperature`
  - `Top K`
  - `Guidance`
  - `Bass / Drums Solo`
- ⏺️ rec ( 🎙️ [ogg](https://en.wikipedia.org/wiki/Vorbis) encoder with wasm polyfill for safari ( alpha feat | see [#67](https://github.com/daoch4n/dj-lyria/issues/67) ) ):
  - hold the power button to start recording | tap again to stop

### cloud:

1. [fork the repo](https://github.com/daoch4n/dj-lyria/fork)
2. in your fork, go to `⚙️ Settings` > `Pages` and set `Build and deployment` > `Source` to `Github Actions`
3. update readme to trigger new action run
4. GitHub Action will handle the build and deploy
   - 🚀 check it out at yourusername.github.io/dj-lyria

### local:

1. install:
   `npm install`
2. run:
   `npm run dev`
