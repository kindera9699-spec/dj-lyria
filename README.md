# Prompt DJ MIDI 🎛️ Pro Frontend for [Lyria RealTime](https://deepmind.google/models/lyria/realtime/)

### Generate professional-grade 48kHz stereo audio with Auto Flow

## Features
- 🎛️ 32 reassignable prompt knobs (🖱️mouse / 🫵🏻touch or 🎛️hardware MIDI control)
- ✨ Auto (weights fluctualtion on every knob)
- 🪩 Flow (seed fluctuation (both on)/ `🆙` / `down`)
- 💾 Save / Load Presets
- ⚙️ Advanced settings knobs and buttons for granular synthesis control:
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
3. Go back to fork page, check that `▶️ Actions` are enabled
4. Update README or commit & push something (or find failed initial run due to pages not set and click `Rerun all jobs`)
5. Github Action will trigger on push and handle the build and deploy
   - 🚀 Check it out at yourusername.github.io/promptdj-midi

### Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
