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
  @state() private _glowIntensity = 0;

  // Progressive color stops: Green → Yellow → Red → Purple → Blue
  private readonly colorStops: OverloadColorStop[] = [
    { threshold: 0.0, color: { r: 0, g: 255, b: 0 }, name: 'Safe' },      // Green
    { threshold: 0.3, color: { r: 255, g: 255, b: 0 }, name: 'Caution' }, // Yellow  
    { threshold: 0.6, color: { r: 255, g: 0, b: 0 }, name: 'Warning' },   // Red
    { threshold: 0.8, color: { r: 128, g: 0, b: 128 }, name: 'Critical' }, // Purple
    { threshold: 1.0, color: { r: 0, g: 0, b: 255 }, name: 'Extreme' },   // Blue
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

    // Calculate combined overload factor (0 to 1+ range)
    const overloadFactor = Math.max(promptAvg, knobExt) * 2;

    // Normalize to 0-1 range for color calculation
    this._overloadLevel = Math.min(1, Math.max(0, overloadFactor - 0.2));

    // Determine visibility - show when overload > 0.2 (20%)
    const shouldBeVisible = overloadFactor > 0.2;

    if (shouldBeVisible !== this._visible) {
      this._visible = shouldBeVisible;
      if (shouldBeVisible) {
        this.classList.add('is-visible');
      } else {
        this.classList.remove('is-visible');
      }
    }

    if (this._visible) {
      this.updateColorAndGlow();
    }
  }

  private updateColorAndGlow() {
    const { color, intensity } = this.calculateColorAndIntensity(this._overloadLevel);

    this._currentColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
    this._glowIntensity = intensity;

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
