# Prompt DJ MIDI 🎛️ Pro Frontend for [Lyria RealTime](https://deepmind.google/models/lyria/realtime/)

### Generate professional-grade 48kHz stereo audio with Auto Flow

## Features
- 🎛️ 32 reassignable prompt knobs (🖱️mouse / 🫵🏻touch or 🎛️hardware MIDI control)
- ✨ Auto (prompt weights fluctualtion on every knob)
- 🪩 Flow (generator seed `fluctuation` / `🆙` / `down`)
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
3. Update README to trigger action run or find failed initial run due to pages not enabled and click `Rerun all jobs`)
4. Github Action will trigger on push and handle the build and deploy
   - 🚀 Check it out at yourusername.github.io/promptdj-midi

### Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
