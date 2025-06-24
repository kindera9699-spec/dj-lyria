# Prompt DJ MIDI 🎛️ powered by [Lyria RealTime](https://deepmind.google/models/lyria/realtime/)

### Generate 48kHz PCM stereo music with Auto Flow

## Features
- 🎛️ 32 reassignable prompt knobs (🖱️mouse / 🫵🏻touch or 🎛️hardware MIDI control)
- ✨ Auto (prompt weights randomizer on every knob)
- 🪩 Flow (generator seed `randomizer` / `🆙` / `down`)
- 💾 Save / Load Presets
- ⚙️ Advanced settings knobs and buttons for granular synthesizer control:
  - `BPM`
  - `Density`
  - `Brightness`
  - `Scale`
  - `Temperature`
  - `Top K`
  - `Guidance`
  - `Bass / Drums Solo`

### Run Hosted

1. [Fork the repo](https://github.com/daoch4n/promptdj-midi/fork)
2. In your fork, go to `⚙️ Settings` > `Pages` and set `Build and deployment` > `Source` to `Github Actions`
3. Update README to trigger new action run or find initial run that failed due to Pages not enabled and click `Rerun all jobs`
4. GitHub Action will handle the build and deploy
   - 🚀 Check it out at yourusername.github.io/promptdj-midi

### Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
