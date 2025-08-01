# 🎧 [DJ](https://daoch4n.github.io/dj-lyria/) [Lyria](https://deepmind.google/models/lyria/realtime) [MIDI](https://en.wikipedia.org/wiki/MIDI) - AI synth 🎛️

## Features
- 🎛️ 32 reassignable knobs ( 🖱️ mouse | 🫵🏻 touch | 🎛️ MIDI)
- 💾 Save | Load Presets
- ✨ Auto ( ⚖️ randomizer )
- 🪩 Flow ( 🌱 randomizer )
- ⚙️ Control sidebar:
  - `BPM`
  - `Density`
  - `Brightness`
  - `Scale`
  - `Temperature`
  - `Top K`
  - `Guidance`
  - `Bass / Drums Solo`
- ⏺️ In-browser [OGG](https://en.wikipedia.org/wiki/Vorbis) encoder with Safari polyfill ( see [#67](https://github.com/daoch4n/dj-lyria/issues/67) )

### Run Hosted

1. [Fork the repo](https://github.com/daoch4n/dj-lyria/fork)
2. In your fork, go to `⚙️ Settings` > `Pages` and set `Build and deployment` > `Source` to `Github Actions`
3. Update README to trigger new action run or find initial run that failed due to `Pages` not enabled and click `Rerun all jobs`
4. GitHub Action will handle the build and deploy
   - 🚀 Check it out at yourusername.github.io/dj-lyria

### Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
