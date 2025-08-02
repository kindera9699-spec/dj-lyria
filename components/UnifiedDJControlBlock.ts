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
  previousMode?: 'idle' | 'playing' | 'paused'; // Track previous state for recording return
  lastClickTime: number; // For debouncing rapid clicks
  debounceTimer: number | null; // For debouncing state changes
}

/**
 * Valid state transitions for the DJ control
 */
const VALID_TRANSITIONS: Record<string, string[]> = {
  idle: ['playing', 'recording', 'loading'],
  playing: ['paused', 'recording', 'loading'],
  paused: ['playing', 'recording', 'loading'],
  recording: ['idle', 'playing', 'paused'], // Can return to any previous state
  loading: ['idle', 'playing', 'paused', 'recording'], // Loading can transition to any state
};

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
    lastClickTime: 0,
    debounceTimer: null,
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
      /* Hardware panel background */
      background: 
        linear-gradient(145deg, #3a3a3a 0%, #2a2a2a 50%, #1a1a1a 100%);
      border-radius: 12px;
      padding: 8px;
      box-shadow: 
        inset 0 1px 3px rgba(255, 255, 255, 0.1),
        inset 0 -1px 3px rgba(0, 0, 0, 0.3),
        0 2px 6px rgba(0, 0, 0, 0.2);
    }

    .dj-hardware-switch {
      position: relative;
      width: 100px;
      height: 50px;
      /* Authentic DJ hardware metallic finish */
      background: 
        linear-gradient(145deg, 
          #4a4a4a 0%, 
          #3a3a3a 25%, 
          #2a2a2a 50%, 
          #1a1a1a 75%, 
          #0a0a0a 100%);
      border: 2px solid #555;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
      /* Enhanced hardware-style shadows */
      box-shadow: 
        /* Top highlight */
        inset 0 2px 4px rgba(255, 255, 255, 0.15),
        /* Bottom shadow */
        inset 0 -2px 4px rgba(0, 0, 0, 0.4),
        /* Left highlight */
        inset 2px 0 3px rgba(255, 255, 255, 0.08),
        /* Right shadow */
        inset -2px 0 3px rgba(0, 0, 0, 0.2),
        /* External shadow */
        0 4px 8px rgba(0, 0, 0, 0.3),
        /* Subtle outer glow */
        0 0 0 1px rgba(255, 255, 255, 0.05);
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
      /* Hardware texture */
      background-image: 
        radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
        radial-gradient(circle at 80% 80%, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
      background-size: 8px 8px, 12px 12px;
    }

    .dj-hardware-switch:hover {
      /* Enhanced hover state with more pronounced metallic effect */
      background: 
        linear-gradient(145deg, 
          #5a5a5a 0%, 
          #4a4a4a 25%, 
          #3a3a3a 50%, 
          #2a2a2a 75%, 
          #1a1a1a 100%);
      border-color: #666;
      box-shadow: 
        inset 0 2px 5px rgba(255, 255, 255, 0.2),
        inset 0 -2px 5px rgba(0, 0, 0, 0.5),
        inset 2px 0 4px rgba(255, 255, 255, 0.1),
        inset -2px 0 4px rgba(0, 0, 0, 0.25),
        0 6px 12px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.08);
      transform: translateY(-0.5px);
    }

    .dj-hardware-switch:active,
    .dj-hardware-switch.pressed {
      /* Pressed state mimics physical button depression */
      background: 
        linear-gradient(145deg, 
          #1a1a1a 0%, 
          #2a2a2a 25%, 
          #3a3a3a 50%, 
          #2a2a2a 75%, 
          #1a1a1a 100%);
      border-color: #444;
      box-shadow: 
        /* Inverted shadows for pressed effect */
        inset 0 3px 8px rgba(0, 0, 0, 0.6),
        inset 0 -1px 2px rgba(255, 255, 255, 0.1),
        inset 3px 0 6px rgba(0, 0, 0, 0.3),
        inset -1px 0 2px rgba(255, 255, 255, 0.05),
        0 2px 4px rgba(0, 0, 0, 0.2);
      transform: translateY(1.5px);
    }

    .switch-icon {
      font-size: 20px;
      color: #fff;
      transition: all 0.2s ease;
      text-shadow: 
        0 1px 2px rgba(0, 0, 0, 0.8),
        0 0 4px rgba(255, 255, 255, 0.1);
      filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5));
    }

    /* State-specific styling with enhanced hardware aesthetics */
    .dj-hardware-switch.idle {
      background: 
        linear-gradient(145deg, 
          #3a3a3a 0%, 
          #2a2a2a 25%, 
          #1a1a1a 50%, 
          #0a0a0a 75%, 
          #000000 100%);
    }

    .dj-hardware-switch.idle .switch-icon {
      color: #666;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    }

    .dj-hardware-switch.playing {
      background: 
        linear-gradient(145deg, 
          #0088ff 0%, 
          #0066cc 25%, 
          #004499 50%, 
          #003366 75%, 
          #002244 100%);
      border-color: #00aaff;
      box-shadow: 
        inset 0 2px 4px rgba(255, 255, 255, 0.2),
        inset 0 -2px 4px rgba(0, 0, 0, 0.4),
        inset 2px 0 3px rgba(255, 255, 255, 0.1),
        inset -2px 0 3px rgba(0, 0, 0, 0.2),
        0 4px 8px rgba(0, 136, 255, 0.3),
        0 0 12px rgba(0, 136, 255, 0.2);
    }

    .dj-hardware-switch.playing .switch-icon {
      color: #fff;
      text-shadow: 
        0 1px 2px rgba(0, 0, 0, 0.8),
        0 0 6px rgba(0, 136, 255, 0.5);
    }

    .dj-hardware-switch.paused {
      background: 
        linear-gradient(145deg, 
          #888 0%, 
          #666 25%, 
          #444 50%, 
          #333 75%, 
          #222 100%);
      border-color: #999;
      box-shadow: 
        inset 0 2px 4px rgba(255, 255, 255, 0.15),
        inset 0 -2px 4px rgba(0, 0, 0, 0.4),
        inset 2px 0 3px rgba(255, 255, 255, 0.08),
        inset -2px 0 3px rgba(0, 0, 0, 0.2),
        0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .dj-hardware-switch.paused .switch-icon {
      color: #ddd;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
    }

    .dj-hardware-switch.recording {
      background: 
        linear-gradient(145deg, 
          #ff3333 0%, 
          #cc0000 25%, 
          #990000 50%, 
          #660000 75%, 
          #330000 100%);
      border-color: #ff4444;
      animation: recording-pulse 1.5s ease-in-out infinite;
    }

    .dj-hardware-switch.recording .switch-icon {
      color: #fff;
      text-shadow: 
        0 1px 2px rgba(0, 0, 0, 0.8),
        0 0 6px rgba(255, 0, 0, 0.5);
    }

    .dj-hardware-switch.loading {
      background: 
        linear-gradient(145deg, 
          #555 0%, 
          #444 25%, 
          #333 50%, 
          #222 75%, 
          #111 100%);
      border-color: #666;
    }

    .dj-hardware-switch.loading .switch-icon {
      animation: loading-spin 1s linear infinite;
      color: #aaa;
    }

    @keyframes recording-pulse {
      0%, 100% { 
        box-shadow: 
          inset 0 2px 4px rgba(255, 255, 255, 0.2),
          inset 0 -2px 4px rgba(0, 0, 0, 0.4),
          inset 2px 0 3px rgba(255, 255, 255, 0.1),
          inset -2px 0 3px rgba(0, 0, 0, 0.2),
          0 4px 8px rgba(255, 0, 0, 0.4),
          0 0 12px rgba(255, 0, 0, 0.3);
      }
      50% { 
        box-shadow: 
          inset 0 2px 4px rgba(255, 255, 255, 0.2),
          inset 0 -2px 4px rgba(0, 0, 0, 0.4),
          inset 2px 0 3px rgba(255, 255, 255, 0.1),
          inset -2px 0 3px rgba(0, 0, 0, 0.2),
          0 4px 16px rgba(255, 0, 0, 0.7),
          0 0 20px rgba(255, 0, 0, 0.5);
      }
    }

    @keyframes loading-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Enhanced accessibility with hardware-style focus */
    .dj-hardware-switch:focus {
      outline: none;
      box-shadow: 
        inset 0 2px 4px rgba(255, 255, 255, 0.15),
        inset 0 -2px 4px rgba(0, 0, 0, 0.4),
        inset 2px 0 3px rgba(255, 255, 255, 0.08),
        inset -2px 0 3px rgba(0, 0, 0, 0.2),
        0 4px 8px rgba(0, 0, 0, 0.3),
        0 0 0 2px #0088ff,
        0 0 8px rgba(0, 136, 255, 0.4);
    }

    .dj-hardware-switch:focus:not(:focus-visible) {
      box-shadow: 
        inset 0 2px 4px rgba(255, 255, 255, 0.15),
        inset 0 -2px 4px rgba(0, 0, 0, 0.4),
        inset 2px 0 3px rgba(255, 255, 255, 0.08),
        inset -2px 0 3px rgba(0, 0, 0, 0.2),
        0 4px 8px rgba(0, 0, 0, 0.3);
    }
  `;

  override connectedCallback() {
    super.connectedCallback();
    this.initializeState();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupState();
  }

  override updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    
    if (changedProperties.has('playbackState') || changedProperties.has('isRecording')) {
      this.updateControlState();
    }
  }

  /**
   * Initialize the component state with proper defaults
   */
  private initializeState() {
    this.controlState = {
      mode: 'idle',
      isPressed: false,
      holdTimer: null,
      previousMode: undefined,
      lastClickTime: 0,
      debounceTimer: null,
    };
    this.updateControlState();
  }

  /**
   * Clean up any pending timers and reset state
   */
  private cleanupState() {
    this.clearHoldTimer();
    this.clearDebounceTimer();
    // Reset to idle state on cleanup
    this.controlState = {
      ...this.controlState,
      mode: 'idle',
      isPressed: false,
      previousMode: undefined,
      lastClickTime: 0,
      debounceTimer: null,
    };
  }



  /**
   * Validate if a state transition is allowed
   */
  private isValidTransition(fromState: string, toState: string): boolean {
    const validTransitions = VALID_TRANSITIONS[fromState];
    return validTransitions ? validTransitions.includes(toState) : false;
  }

  /**
   * Safely transition to a new state with validation
   */
  private transitionToState(newMode: DJControlState['mode']) {
    const currentMode = this.controlState.mode;
    
    // Validate the transition
    if (!this.isValidTransition(currentMode, newMode)) {
      console.warn(`Invalid state transition from ${currentMode} to ${newMode}`);
      return false;
    }

    // Store previous mode when entering recording state
    const previousMode = newMode === 'recording' ? currentMode : this.controlState.previousMode;

    // Update state
    this.controlState = {
      ...this.controlState,
      mode: newMode,
      previousMode: previousMode as 'idle' | 'playing' | 'paused' | undefined,
    };

    this.requestUpdate();
    return true;
  }

  /**
   * Update control state based on external props (bypasses validation for prop-driven changes)
   */
  private updateControlState() {
    let targetMode: DJControlState['mode'];

    // Determine target mode based on props
    if (this.isRecording) {
      targetMode = 'recording';
    } else {
      switch (this.playbackState) {
        case 'playing':
          targetMode = 'playing';
          break;
        case 'paused':
          targetMode = 'paused';
          break;
        case 'loading':
          targetMode = 'loading';
          break;
        case 'stopped':
        default:
          targetMode = 'idle';
          break;
      }
    }

    // Only update if the mode actually changed
    if (targetMode !== this.controlState.mode) {
      // Store previous mode when entering recording state
      const previousMode = targetMode === 'recording' ? this.controlState.mode : this.controlState.previousMode;

      // Update state directly for prop-driven changes (no validation needed)
      const newState = {
        ...this.controlState,
        mode: targetMode,
        previousMode: previousMode as 'idle' | 'playing' | 'paused' | undefined,
      };
      
      this.controlState = newState;
      this.requestUpdate();
    }
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
    const currentTime = Date.now();
    const timeSinceLastClick = currentTime - this.controlState.lastClickTime;
    
    // Debounce rapid clicks (prevent clicks within 150ms of each other)
    if (timeSinceLastClick < 150) {
      return;
    }

    // Update last click time
    this.controlState = { ...this.controlState, lastClickTime: currentTime };

    // Clear any existing debounce timer
    this.clearDebounceTimer();

    // Debounce the actual action to prevent rapid state changes
    this.controlState.debounceTimer = window.setTimeout(() => {
      this.executeClickAction();
    }, 50); // Small delay to ensure smooth interaction
  }

  /**
   * Execute the actual click action after debouncing
   */
  private executeClickAction() {
    // Prevent action if currently loading
    if (this.controlState.mode === 'loading') {
      return;
    }

    // Handle recording state - return to previous state
    if (this.controlState.mode === 'recording') {
      this.dispatchEvent(new CustomEvent('dj-control-record-stop'));
      
      // Transition back to previous state if available, otherwise idle
      const returnMode = this.controlState.previousMode || 'idle';
      if (this.isValidTransition('recording', returnMode)) {
        this.transitionToState(returnMode);
      }
      return;
    }

    // Handle play/pause states with proper state transitions
    switch (this.controlState.mode) {
      case 'idle':
      case 'paused':
        if (this.isValidTransition(this.controlState.mode, 'playing')) {
          this.dispatchEvent(new CustomEvent('dj-control-play'));
        }
        break;
      case 'playing':
        if (this.isValidTransition(this.controlState.mode, 'paused')) {
          this.dispatchEvent(new CustomEvent('dj-control-pause'));
        }
        break;
    }
  }

  private handleMouseDown() {
    this.controlState = { ...this.controlState, isPressed: true };
    
    // Set up hold timer for record functionality
    this.controlState.holdTimer = window.setTimeout(() => {
      if (this.controlState.mode !== 'recording' && this.controlState.mode !== 'loading') {
        // Validate transition to recording state
        if (this.isValidTransition(this.controlState.mode, 'recording')) {
          this.dispatchEvent(new CustomEvent('dj-control-record-start'));
          // The actual state transition will happen when isRecording prop updates
        }
      }
    }, 500); // 500ms hold time

    this.requestUpdate();
  }

  private handleMouseUp() {
    this.controlState = { ...this.controlState, isPressed: false };
    
    // Clear hold timer using cleanup method
    this.clearHoldTimer();
    this.requestUpdate();
  }

  /**
   * Clear the hold timer safely
   */
  private clearHoldTimer() {
    if (this.controlState.holdTimer) {
      clearTimeout(this.controlState.holdTimer);
      this.controlState.holdTimer = null;
    }
  }

  /**
   * Clear the debounce timer safely
   */
  private clearDebounceTimer() {
    if (this.controlState.debounceTimer) {
      clearTimeout(this.controlState.debounceTimer);
      this.controlState.debounceTimer = null;
    }
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