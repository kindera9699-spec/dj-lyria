# 🎧 [DJ](https://daoch4n.github.io/dj-lyria/) [Lyria](https://deepmind.google/models/lyria/realtime) [MIDI](https://en.wikipedia.org/wiki/MIDI) AI synth 🎛️

- 🎛️ 32 reassignable knobs ( 🖱️ mouse | 🫵🏻 touch | 🎛️ MIDI )
- 💾 save | load presets
- ✨ auto ( ⚖️ randomizer )
- 🪩 flow ( 🌱 randomizer )
- ⚙️ control sidebar:
  - `BPM`
  - `Density`
  - `Brightness`
  - `Scale`
  - `Temperature`
  - `Top K`
  - `Guidance`
  - `Bass / Drums Solo`
- ⏺️ inbrowser [OGG](https://en.wikipedia.org/wiki/Vorbis) encoder with wasm polyfill for safari ( see [#67](https://github.com/daoch4n/dj-lyria/issues/67) )

### cloud:

1. [fork the repo](https://github.com/daoch4n/dj-lyria/fork)
2. in your fork, go to `⚙️ Settings` > `Pages` and set `Build and deployment` > `Source` to `Github Actions`
3. update readme to trigger new action run or find initial run that failed due to `Pages` not enabled and click `Rerun all jobs`
4. GitHub Action will handle the build and deploy
   - 🚀 check it out at yourusername.github.io/dj-lyria

### local:

1. install:
   `npm install`
2. run:
   `npm run dev`
