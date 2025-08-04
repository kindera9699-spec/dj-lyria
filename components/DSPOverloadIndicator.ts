import { LitElement, type PropertyValues, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

interface OverloadColorStop {
  threshold: number;
  color: { r: number; g: number; b: number };
  name: string;
}

@customElement('dsp-overload-indicator')
export class DSPOverloadIndicator extends LitElement {
  @property({ type: Number }) currentPromptAverage = 0;
  @property({ type: Number }) currentKnobAverageExtremeness = 0;
  @state() private _visible = false;
  @state() private _overloadLevel = 0;
  @state() private _currentColor = 'rgb(0, 255, 0)';
  @state() private _isOverloadState = false;

  private _blinkAnimationId: number | null = null;
  private _overloadResetTimer: number | null = null;

  // Progressive color stops: Green → Yellow → Red → Purple → Blue → OVERLOAD
  private readonly colorStops: OverloadColorStop[] = [
    { threshold: 0.0, color: { r: 0, g: 255, b: 0 }, name: 'Safe' },      // Green
    { threshold: 0.3, color: { r: 255, g: 255, b: 0 }, name: 'Caution' }, // Yellow  
    { threshold: 0.6, color: { r: 255, g: 0, b: 0 }, name: 'Warning' },   // Red
    { threshold: 0.8, color: { r: 128, g: 0, b: 128 }, name: 'Critical' }, // Purple
    { threshold: 1.0, color: { r: 0, g: 0, b: 255 }, name: 'Extreme' },   // Blue
    { threshold: 1.2, color: { r: 255, g: 0, b: 0 }, name: 'OVERLOAD' },  // Red (Easter egg)
  ];

  static styles = css`
    :host {
      position: relative;
      background: rgba(0, 0, 0, 0.6);
      padding: 0 12px;
      border-radius: 5px;
      border: 1px solid var(--border-color, #555);
      color: white;
      width: 100%;
      box-sizing: border-box;
      overflow: hidden;
      opacity: 0;
      max-height: 0;
      margin-bottom: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--glow-shadow, none);
    }

    :host(.is-visible) {
      opacity: 1;
      max-height: 100px;
      padding: 16px 12px;
      margin-top: 15px;
      margin-bottom: 15px;
    }
  `;

  updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (
      changedProperties.has('currentPromptAverage') ||
      changedProperties.has('currentKnobAverageExtremeness')
    ) {
      this.updateOverloadState();
    }
  }

  private updateOverloadState() {
    const promptAvg = this.currentPromptAverage;
    const knobExt = this.currentKnobAverageExtremeness;

    // Calculate combined overload factor (0 to 1.5+ range for easter egg)
    const overloadFactor = Math.max(promptAvg, knobExt) * 2;

    // Allow overload level to exceed 1.0 for OVERLOAD state
    this._overloadLevel = Math.max(0, overloadFactor - 0.2);

    // Determine visibility - show when overload > 0.2 (20%)
    const shouldBeVisible = overloadFactor > 0.2;

    // Check for OVERLOAD easter egg state (threshold 1.2)
    const isOverloadState = this._overloadLevel >= 1.2;

    if (shouldBeVisible !== this._visible) {
      this._visible = shouldBeVisible;
      if (shouldBeVisible) {
        this.classList.add('is-visible');
      } else {
        this.classList.remove('is-visible');
        this._stopBlinking();
      }
    }

    // Handle OVERLOAD state transition
    if (isOverloadState !== this._isOverloadState) {
      this._isOverloadState = isOverloadState;
      if (isOverloadState) {
        this._startOverloadSequence();
      } else {
        this._stopOverloadSequence();
      }
    }

    if (this._visible) {
      this.updateColorAndGlow();
    }
  }

  private updateColorAndGlow() {
    const { color, intensity } = this.calculateColorAndIntensity(this._overloadLevel);

    this._currentColor = `rgb(${color.r}, ${color.g}, ${color.b})`;

    // Update CSS variables for dynamic styling
    this.style.setProperty('--border-color', this._currentColor);

    // Create progressive glow effect with increasing intensity
    const baseGlow = 4 + (intensity * 12); // 4px to 16px
    const outerGlow = 8 + (intensity * 24); // 8px to 32px
    const glowShadow = `0 0 ${baseGlow}px ${this._currentColor}, 0 0 ${outerGlow}px ${this._currentColor}`;

    this.style.setProperty('--glow-shadow', glowShadow);
  }

  private calculateColorAndIntensity(level: number): { color: { r: number; g: number; b: number }, intensity: number } {
    // Find the two color stops to interpolate between
    let lowerStop = this.colorStops[0];
    let upperStop = this.colorStops[this.colorStops.length - 1];

    for (let i = 0; i < this.colorStops.length - 1; i++) {
      if (level >= this.colorStops[i].threshold && level <= this.colorStops[i + 1].threshold) {
        lowerStop = this.colorStops[i];
        upperStop = this.colorStops[i + 1];
        break;
      }
    }

    // Calculate interpolation factor
    const range = upperStop.threshold - lowerStop.threshold;
    const factor = range === 0 ? 0 : (level - lowerStop.threshold) / range;

    // Interpolate between colors
    const color = {
      r: Math.round(lowerStop.color.r + (upperStop.color.r - lowerStop.color.r) * factor),
      g: Math.round(lowerStop.color.g + (upperStop.color.g - lowerStop.color.g) * factor),
      b: Math.round(lowerStop.color.b + (upperStop.color.b - lowerStop.color.b) * factor),
    };

    // Calculate glow intensity (0 to 1)
    const intensity = Math.pow(level, 1.5); // Exponential curve for more dramatic effect

    return { color, intensity };
  }

  private getCurrentOverloadStatus(): string {
    const level = this._overloadLevel;

    for (let i = this.colorStops.length - 1; i >= 0; i--) {
      if (level >= this.colorStops[i].threshold) {
        return this.colorStops[i].name;
      }
    }

    return this.colorStops[0].name;
  }

  private _startOverloadSequence() {
    // Start with slow blinking, then accelerate
    this._startBlinking();

    // Set timer to trigger reset after 10 seconds of OVERLOAD state
    this._overloadResetTimer = window.setTimeout(() => {
      this._triggerReset();
    }, 10000);
  }

  private _stopOverloadSequence() {
    this._stopBlinking();
    if (this._overloadResetTimer) {
      clearTimeout(this._overloadResetTimer);
      this._overloadResetTimer = null;
    }
  }

  private _startBlinking() {
    if (this._blinkAnimationId !== null) return;

    let blinkCount = 0;
    const maxBlinks = 30; // Total blinks before reset

    const blink = () => {
      if (!this._isOverloadState) {
        this._stopBlinking();
        return;
      }

      // Accelerate blinking: start at 300ms, end at 25ms
      const progress = blinkCount / maxBlinks;
      const blinkInterval = 300 - (progress * 275); // 300ms -> 25ms

      // Toggle visibility for blink effect
      const isVisible = blinkCount % 2 === 0;
      this.style.opacity = isVisible ? '1' : '0.3';

      blinkCount++;

      if (blinkCount < maxBlinks) {
        this._blinkAnimationId = window.setTimeout(blink, blinkInterval);
      } else {
        // Max blinks reached, trigger reset
        this._triggerReset();
      }
    };

    blink();
  }

  private _stopBlinking() {
    if (this._blinkAnimationId !== null) {
      clearTimeout(this._blinkAnimationId);
      this._blinkAnimationId = null;
    }
    // Restore normal opacity
    this.style.opacity = '';
  }

  private _triggerReset() {
    // Dispatch custom event to trigger the main app's resetAll method
    this.dispatchEvent(new CustomEvent('dsp-overload-reset', {
      bubbles: true,
      composed: true,
      detail: { message: 'DSP Overload triggered system reset!' }
    }));

    // Clean up overload state
    this._stopOverloadSequence();
    this._isOverloadState = false;
  }

  override connectedCallback() {
    super.connectedCallback();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._stopOverloadSequence();
  }

  render() {
    const status = this.getCurrentOverloadStatus();
    return html`DSP ${status}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'dsp-overload-indicator': DSPOverloadIndicator;
  }
}
