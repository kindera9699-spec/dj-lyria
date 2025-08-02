/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { PlaybackState } from '../types';

/**
 * Interface for the DJ control state management
 */
interface DJControlState {
  mode: 'idle' | 'playing' | 'paused' | 'recording' | 'loading';
  isPressed: boolean;
  holdTimer: number | null;
}

/**
 * Unified DJ Control Block component that combines play/pause/record functionality
 * into a single hardware-style switch positioned as a sidebar header
 */
@customElement('unified-dj-control-block')
export class UnifiedDJControlBlock extends LitElement {
  @property({ type: String }) playbackState: PlaybackState = 'stopped';
  @property({ type: Boolean }) isRecording = false;

  @state() private controlState: DJControlState = {
    mode: 'idle',
    isPressed: false,
    holdTimer: null,
  };

  static override styles = css`
    :host {
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 80px;
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
      border-bottom: 2px solid #444;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      margin-bottom: 20px;
    }

    .dj-control-container {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 60px;
    }

    .dj-hardware-switch {
      position: relative;
      width: 100px;
      height: 50px;
      background: linear-gradient(145deg, #2a2a2a, #1a1a1a);
      border: 2px solid #444;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 
        inset 0 2px 4px rgba(255, 255, 255, 0.1),
        inset 0 -2px 4px rgba(0, 0, 0, 0.3),
        0 4px 8px rgba(0, 0, 0, 0.2);
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dj-hardware-switch:hover {
      background: linear-gradient(145deg, #333, #222);
      box-shadow: 
        inset 0 2px 4px rgba(255, 255, 255, 0.15),
        inset 0 -2px 4px rgba(0, 0, 0, 0.4),
        0 6px 12px rgba(0, 0, 0, 0.3);
    }

    .dj-hardware-switch:active,
    .dj-hardware-switch.pressed {
      background: linear-gradient(145deg, #1a1a1a, #2a2a2a);
      box-shadow: 
        inset 0 3px 6px rgba(0, 0, 0, 0.4),
        inset 0 -1px 2px rgba(255, 255, 255, 0.1),
        0 2px 4px rgba(0, 0, 0, 0.2);
      transform: translateY(1px);
    }

    .switch-icon {
      font-size: 20px;
      color: #fff;
      transition: all 0.3s ease;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    /* State-specific styling */
    .dj-hardware-switch.idle .switch-icon {
      color: #888;
    }

    .dj-hardware-switch.playing {
      background: linear-gradient(145deg, #0066cc, #004499);
      border-color: #0088ff;
    }

    .dj-hardware-switch.playing .switch-icon {
      color: #fff;
    }

    .dj-hardware-switch.paused {
      background: linear-gradient(145deg, #666, #444);
      border-color: #888;
    }

    .dj-hardware-switch.paused .switch-icon {
      color: #ccc;
    }

    .dj-hardware-switch.recording {
      background: linear-gradient(145deg, #cc0000, #990000);
      border-color: #ff0000;
      animation: recording-pulse 1.5s ease-in-out infinite;
    }

    .dj-hardware-switch.recording .switch-icon {
      color: #fff;
    }

    .dj-hardware-switch.loading {
      background: linear-gradient(145deg, #444, #333);
      border-color: #666;
    }

    .dj-hardware-switch.loading .switch-icon {
      animation: loading-spin 1s linear infinite;
    }

    @keyframes recording-pulse {
      0%, 100% { 
        box-shadow: 
          inset 0 2px 4px rgba(255, 255, 255, 0.1),
          inset 0 -2px 4px rgba(0, 0, 0, 0.3),
          0 4px 8px rgba(255, 0, 0, 0.3);
      }
      50% { 
        box-shadow: 
          inset 0 2px 4px rgba(255, 255, 255, 0.1),
          inset 0 -2px 4px rgba(0, 0, 0, 0.3),
          0 4px 16px rgba(255, 0, 0, 0.6);
      }
    }

    @keyframes loading-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Accessibility */
    .dj-hardware-switch:focus {
      outline: 2px solid #0088ff;
      outline-offset: 2px;
    }

    .dj-hardware-switch:focus:not(:focus-visible) {
      outline: none;
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    this.updateControlState();
  }

  override updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    
    if (changedProperties.has('playbackState') || changedProperties.has('isRecording')) {
      this.updateControlState();
    }
  }

  private updateControlState() {
    if (this.isRecording) {
      this.controlState = { ...this.controlState, mode: 'recording' };
    } else {
      switch (this.playbackState) {
        case 'playing':
          this.controlState = { ...this.controlState, mode: 'playing' };
          break;
        case 'paused':
          this.controlState = { ...this.controlState, mode: 'paused' };
          break;
        case 'loading':
          this.controlState = { ...this.controlState, mode: 'loading' };
          break;
        case 'stopped':
        default:
          this.controlState = { ...this.controlState, mode: 'idle' };
          break;
      }
    }
    this.requestUpdate();
  }

  private renderIcon() {
    switch (this.controlState.mode) {
      case 'playing':
        return '⏸️'; // Pause icon
      case 'paused':
      case 'idle':
        return '▶️'; // Play icon
      case 'recording':
        return '⏺️'; // Record icon
      case 'loading':
        return '⟳'; // Loading/refresh icon
      default:
        return '▶️';
    }
  }

  private handleClick() {
    // Prevent action if currently loading
    if (this.controlState.mode === 'loading') {
      return;
    }

    // Handle recording state
    if (this.controlState.mode === 'recording') {
      this.dispatchEvent(new CustomEvent('dj-control-record-stop'));
      return;
    }

    // Handle play/pause states
    switch (this.controlState.mode) {
      case 'idle':
      case 'paused':
        this.dispatchEvent(new CustomEvent('dj-control-play'));
        break;
      case 'playing':
        this.dispatchEvent(new CustomEvent('dj-control-pause'));
        break;
    }
  }

  private handleMouseDown() {
    this.controlState = { ...this.controlState, isPressed: true };
    
    // Set up hold timer for record functionality
    this.controlState.holdTimer = window.setTimeout(() => {
      if (this.controlState.mode !== 'recording' && this.controlState.mode !== 'loading') {
        this.dispatchEvent(new CustomEvent('dj-control-record-start'));
      }
    }, 500); // 500ms hold time

    this.requestUpdate();
  }

  private handleMouseUp() {
    this.controlState = { ...this.controlState, isPressed: false };
    
    // Clear hold timer
    if (this.controlState.holdTimer) {
      clearTimeout(this.controlState.holdTimer);
      this.controlState.holdTimer = null;
    }

    this.requestUpdate();
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.handleClick();
    }
  }

  override render() {
    const switchClasses = {
      'dj-hardware-switch': true,
      [this.controlState.mode]: true,
      'pressed': this.controlState.isPressed,
    };

    return html`
      <div class="dj-control-container">
        <div 
          class=${Object.entries(switchClasses)
            .filter(([, value]) => value)
            .map(([key]) => key)
            .join(' ')}
          tabindex="0"
          role="button"
          aria-label="DJ Control Switch - ${this.controlState.mode}"
          @click=${this.handleClick}
          @mousedown=${this.handleMouseDown}
          @mouseup=${this.handleMouseUp}
          @mouseleave=${this.handleMouseUp}
          @keydown=${this.handleKeyDown}
        >
          <span class="switch-icon">${this.renderIcon()}</span>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unified-dj-control-block': UnifiedDJControlBlock;
  }
}