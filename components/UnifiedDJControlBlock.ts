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
 * 
 * Events:
 * - 'play-pause-click': Dispatched for play/pause actions (compatible with PlayPauseButton)
 * - 'record-click': Dispatched for record start/stop actions (compatible with RecordButton)
 * 
 * The component maintains full compatibility with existing event handlers by using
 * the same event names and payloads as the original PlayPauseButton and RecordButton components.
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
      height: clamp(60px, 12vmin, 100px);
      /* Transparent background - no square background */
      background: transparent;
      /* Responsive padding for different screen sizes */
      padding: clamp(5px, 1.5vmin, 15px);
      box-sizing: border-box;
    }

    /* Responsive breakpoints for different screen sizes */
    @media (max-width: 480px) {
      :host {
        height: 50px;
        padding: 5px;
      }
    }

    @media (min-width: 481px) and (max-width: 768px) {
      :host {
        height: 65px;
        padding: 8px;
      }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      :host {
        height: 75px;
        padding: 10px;
      }
    }

    @media (min-width: 1025px) {
      :host {
        height: 85px;
        padding: 12px;
      }
    }



    .dj-hardware-switch {
      position: relative;
      /* Perfect circle with appropriate header sizing */
      width: 50px;
      height: 50px;
      border-radius: 50%;
      /* Premium power button metallic finish */
      background: 
        radial-gradient(circle at 30% 30%, 
          #5a5a5a 0%, 
          #4a4a4a 20%, 
          #3a3a3a 40%, 
          #2a2a2a 60%, 
          #1a1a1a 80%, 
          #0a0a0a 100%);
      border: clamp(2px, 0.5vmin, 4px) solid #666;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      /* Enhanced circular power button shadows */
      box-shadow: 
        /* Inner highlight ring */
        inset 0 clamp(2px, 0.8vmin, 6px) clamp(4px, 1.2vmin, 8px) rgba(255, 255, 255, 0.2),
        /* Inner shadow ring */
        inset 0 clamp(-2px, -0.8vmin, -6px) clamp(4px, 1.2vmin, 8px) rgba(0, 0, 0, 0.5),
        /* Outer shadow for depth */
        0 clamp(3px, 1vmin, 8px) clamp(6px, 2vmin, 15px) rgba(0, 0, 0, 0.4),
        /* Subtle outer rim glow */
        0 0 0 clamp(1px, 0.3vmin, 2px) rgba(255, 255, 255, 0.1);
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: center;
      /* Subtle brushed metal texture */
      background-image: 
        conic-gradient(from 0deg, 
          rgba(255, 255, 255, 0.1) 0deg,
          transparent 45deg,
          rgba(255, 255, 255, 0.05) 90deg,
          transparent 135deg,
          rgba(255, 255, 255, 0.1) 180deg,
          transparent 225deg,
          rgba(255, 255, 255, 0.05) 270deg,
          transparent 315deg,
          rgba(255, 255, 255, 0.1) 360deg);
    }

    /* Responsive breakpoints for power button */
    @media (max-width: 480px) {
      .dj-hardware-switch {
        width: 40px;
        height: 40px;
        border-width: 2px;
      }
    }

    @media (min-width: 481px) and (max-width: 768px) {
      .dj-hardware-switch {
        width: 45px;
        height: 45px;
        border-width: 2px;
      }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      .dj-hardware-switch {
        width: 48px;
        height: 48px;
        border-width: 2px;
      }
    }

    @media (min-width: 1025px) {
      .dj-hardware-switch {
        width: 50px;
        height: 50px;
        border-width: 2px;
      }
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
      /* Icon sizing proportional to button size */
      font-size: 16px;
      color: #fff;
      transition: all 0.2s ease;
      text-shadow: 
        0 1px 2px rgba(0, 0, 0, 0.8),
        0 0 4px rgba(255, 255, 255, 0.1);
      filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5));
      /* Ensure icons remain crisp at all sizes */
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      /* Center the icon perfectly */
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    /* Responsive breakpoints for icon sizing */
    @media (max-width: 480px) {
      .switch-icon {
        font-size: 12px;
      }
    }

    @media (min-width: 481px) and (max-width: 768px) {
      .switch-icon {
        font-size: 14px;
      }
    }

    @media (min-width: 769px) and (max-width: 1024px) {
      .switch-icon {
        font-size: 15px;
      }
    }

    @media (min-width: 1025px) {
      .switch-icon {
        font-size: 16px;
      }
    }

    /* Enhanced state-specific styling with distinct visual indicators */
    .dj-hardware-switch.idle {
      background: 
        linear-gradient(145deg, 
          #3a3a3a 0%, 
          #2a2a2a 25%, 
          #1a1a1a 50%, 
          #0a0a0a 75%, 
          #000000 100%);
      border-color: #444;
      box-shadow: 
        inset 0 2px 4px rgba(255, 255, 255, 0.08),
        inset 0 -2px 4px rgba(0, 0, 0, 0.6),
        inset 2px 0 3px rgba(255, 255, 255, 0.05),
        inset -2px 0 3px rgba(0, 0, 0, 0.3),
        0 4px 8px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.02);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .dj-hardware-switch.idle .switch-icon {
      color: #666;
      text-shadow: 
        0 1px 2px rgba(0, 0, 0, 0.8),
        0 0 4px rgba(255, 255, 255, 0.05);
      transition: all 0.3s ease;
    }

    .dj-hardware-switch.idle:hover .switch-icon {
      color: #888;
      text-shadow: 
        0 1px 2px rgba(0, 0, 0, 0.8),
        0 0 6px rgba(255, 255, 255, 0.1);
    }

    .dj-hardware-switch.playing {
      background: 
        linear-gradient(145deg, 
          #00aaff 0%, 
          #0088cc 25%, 
          #0066aa 50%, 
          #004488 75%, 
          #003366 100%);
      border-color: #00ccff;
      box-shadow: 
        inset 0 2px 4px rgba(255, 255, 255, 0.25),
        inset 0 -2px 4px rgba(0, 0, 0, 0.4),
        inset 2px 0 3px rgba(255, 255, 255, 0.15),
        inset -2px 0 3px rgba(0, 0, 0, 0.2),
        0 4px 12px rgba(0, 170, 255, 0.4),
        0 0 16px rgba(0, 170, 255, 0.3),
        0 0 0 1px rgba(0, 204, 255, 0.5);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .dj-hardware-switch.playing .switch-icon {
      color: #ffffff;
      text-shadow: 
        0 1px 2px rgba(0, 0, 0, 0.8),
        0 0 8px rgba(0, 170, 255, 0.6),
        0 0 12px rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .dj-hardware-switch.paused {
      background: 
        linear-gradient(145deg, 
          #999999 0%, 
          #777777 25%, 
          #555555 50%, 
          #333333 75%, 
          #222222 100%);
      border-color: #aaaaaa;
      box-shadow: 
        inset 0 2px 4px rgba(255, 255, 255, 0.18),
        inset 0 -2px 4px rgba(0, 0, 0, 0.4),
        inset 2px 0 3px rgba(255, 255, 255, 0.1),
        inset -2px 0 3px rgba(0, 0, 0, 0.2),
        0 4px 8px rgba(0, 0, 0, 0.3),
        0 0 8px rgba(170, 170, 170, 0.2);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .dj-hardware-switch.paused .switch-icon {
      color: #eeeeee;
      text-shadow: 
        0 1px 2px rgba(0, 0, 0, 0.8),
        0 0 4px rgba(170, 170, 170, 0.3);
      transition: all 0.3s ease;
    }

    .dj-hardware-switch.recording {
      background: 
        linear-gradient(145deg, 
          #ff4444 0%, 
          #dd2222 25%, 
          #bb0000 50%, 
          #880000 75%, 
          #440000 100%);
      border-color: #ff6666;
      animation: recording-pulse 1.5s ease-in-out infinite;
      transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .dj-hardware-switch.recording .switch-icon {
      color: #ffffff;
      text-shadow: 
        0 1px 2px rgba(0, 0, 0, 0.8),
        0 0 8px rgba(255, 68, 68, 0.8),
        0 0 12px rgba(255, 255, 255, 0.3);
      animation: recording-icon-pulse 1.5s ease-in-out infinite;
      transition: all 0.3s ease;
    }

    .dj-hardware-switch.loading {
      background: 
        linear-gradient(145deg, 
          #666666 0%, 
          #555555 25%, 
          #444444 50%, 
          #333333 75%, 
          #222222 100%);
      border-color: #777777;
      box-shadow: 
        inset 0 2px 4px rgba(255, 255, 255, 0.12),
        inset 0 -2px 4px rgba(0, 0, 0, 0.4),
        inset 2px 0 3px rgba(255, 255, 255, 0.08),
        inset -2px 0 3px rgba(0, 0, 0, 0.2),
        0 4px 8px rgba(0, 0, 0, 0.3);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .dj-hardware-switch.loading .switch-icon {
      animation: loading-spin 1s linear infinite;
      color: #bbbbbb;
      text-shadow: 
        0 1px 2px rgba(0, 0, 0, 0.8),
        0 0 4px rgba(187, 187, 187, 0.3);
      transition: color 0.3s ease;
    }

    /* Enhanced keyframe animations */
    @keyframes recording-pulse {
      0%, 100% { 
        box-shadow: 
          inset 0 2px 4px rgba(255, 255, 255, 0.25),
          inset 0 -2px 4px rgba(0, 0, 0, 0.4),
          inset 2px 0 3px rgba(255, 255, 255, 0.15),
          inset -2px 0 3px rgba(0, 0, 0, 0.2),
          0 4px 12px rgba(255, 68, 68, 0.5),
          0 0 16px rgba(255, 68, 68, 0.4),
          0 0 0 1px rgba(255, 102, 102, 0.6);
        transform: scale(1);
      }
      50% { 
        box-shadow: 
          inset 0 2px 4px rgba(255, 255, 255, 0.25),
          inset 0 -2px 4px rgba(0, 0, 0, 0.4),
          inset 2px 0 3px rgba(255, 255, 255, 0.15),
          inset -2px 0 3px rgba(0, 0, 0, 0.2),
          0 4px 20px rgba(255, 68, 68, 0.8),
          0 0 28px rgba(255, 68, 68, 0.7),
          0 0 0 2px rgba(255, 102, 102, 0.8);
        transform: scale(1.02);
      }
    }

    @keyframes recording-icon-pulse {
      0%, 100% { 
        transform: scale(1);
        text-shadow: 
          0 1px 2px rgba(0, 0, 0, 0.8),
          0 0 8px rgba(255, 68, 68, 0.8),
          0 0 12px rgba(255, 255, 255, 0.3);
      }
      50% { 
        transform: scale(1.1);
        text-shadow: 
          0 1px 2px rgba(0, 0, 0, 0.8),
          0 0 12px rgba(255, 68, 68, 1),
          0 0 16px rgba(255, 255, 255, 0.5);
      }
    }

    @keyframes loading-spin {
      from { 
        transform: rotate(0deg);
      }
      to { 
        transform: rotate(360deg);
      }
    }

    /* Smooth state transition animations */
    .dj-hardware-switch {
      transition: 
        background 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .switch-icon {
      transition: 
        color 0.3s ease,
        text-shadow 0.3s ease,
        transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Enhanced accessibility with hardware-style focus */
    .dj-hardware-switch:focus {
      outline: none;
      box-shadow: 
        inset 0 clamp(1px, 0.4vmin, 3px) clamp(2px, 0.8vmin, 5px) rgba(255, 255, 255, 0.15),
        inset 0 clamp(-1px, -0.4vmin, -3px) clamp(2px, 0.8vmin, 5px) rgba(0, 0, 0, 0.4),
        inset clamp(1px, 0.4vmin, 3px) 0 clamp(1px, 0.6vmin, 4px) rgba(255, 255, 255, 0.08),
        inset clamp(-1px, -0.4vmin, -3px) 0 clamp(1px, 0.6vmin, 4px) rgba(0, 0, 0, 0.2),
        0 clamp(2px, 0.8vmin, 5px) clamp(4px, 1.5vmin, 10px) rgba(0, 0, 0, 0.3),
        0 0 0 clamp(2px, 0.5vmin, 3px) #0088ff,
        0 0 clamp(4px, 1.5vmin, 12px) rgba(0, 136, 255, 0.4);
      /* Enhanced focus ring for better visibility */
      position: relative;
    }

    .dj-hardware-switch:focus:not(:focus-visible) {
      box-shadow: 
        inset 0 clamp(1px, 0.4vmin, 3px) clamp(2px, 0.8vmin, 5px) rgba(255, 255, 255, 0.15),
        inset 0 clamp(-1px, -0.4vmin, -3px) clamp(2px, 0.8vmin, 5px) rgba(0, 0, 0, 0.4),
        inset clamp(1px, 0.4vmin, 3px) 0 clamp(1px, 0.6vmin, 4px) rgba(255, 255, 255, 0.08),
        inset clamp(-1px, -0.4vmin, -3px) 0 clamp(1px, 0.6vmin, 4px) rgba(0, 0, 0, 0.2),
        0 clamp(2px, 0.8vmin, 5px) clamp(4px, 1.5vmin, 10px) rgba(0, 0, 0, 0.3);
    }

    /* High contrast mode support */
    @media (prefers-contrast: high) {
      .dj-hardware-switch {
        border-width: clamp(2px, 0.5vmin, 4px);
        border-color: #ffffff;
      }
      
      .dj-hardware-switch:focus {
        box-shadow: 
          0 0 0 clamp(3px, 0.8vmin, 5px) #ffffff,
          0 0 clamp(6px, 2vmin, 15px) rgba(255, 255, 255, 0.8);
      }
      
      .switch-icon {
        color: #ffffff;
        text-shadow: 
          0 0 clamp(2px, 0.5vmin, 4px) #000000,
          0 0 clamp(4px, 1vmin, 8px) #000000;
      }
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      .dj-hardware-switch,
      .switch-icon {
        transition: none;
        animation: none;
      }
      
      .dj-hardware-switch.recording {
        animation: none;
        box-shadow: 
          inset 0 2px 4px rgba(255, 255, 255, 0.25),
          inset 0 -2px 4px rgba(0, 0, 0, 0.4),
          inset 2px 0 3px rgba(255, 255, 255, 0.15),
          inset -2px 0 3px rgba(0, 0, 0, 0.2),
          0 4px 12px rgba(255, 68, 68, 0.5),
          0 0 16px rgba(255, 68, 68, 0.4),
          0 0 0 2px rgba(255, 102, 102, 0.8);
      }
      
      .dj-hardware-switch.recording .switch-icon {
        animation: none;
      }
      
      .dj-hardware-switch.loading .switch-icon {
        animation: none;
      }
    }

    /* Touch device optimizations */
    @media (hover: none) and (pointer: coarse) {
      .dj-hardware-switch {
        /* Larger touch targets for mobile */
        min-width: 44px;
        min-height: 44px;
        /* Enhanced touch feedback */
        -webkit-tap-highlight-color: rgba(0, 136, 255, 0.3);
      }
      
      .dj-hardware-switch:hover {
        /* Remove hover effects on touch devices */
        background: 
          linear-gradient(145deg, 
            #4a4a4a 0%, 
            #3a3a3a 25%, 
            #2a2a2a 50%, 
            #1a1a1a 75%, 
            #0a0a0a 100%);
        border-color: #555;
        transform: none;
      }
    }

    /* Print styles */
    @media print {
      :host {
        display: none;
      }
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
        return '⏸'; // Clean pause symbol
      case 'paused':
      case 'idle':
        return '▶'; // Clean play symbol
      case 'recording':
        return '●'; // Clean record dot
      case 'loading':
        return '◐'; // Clean loading symbol
      default:
        return '▶';
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
      // Dispatch record stop event (matches existing RecordButton event pattern)
      this.dispatchEvent(new CustomEvent('record-click'));
      return;
    }

    // Handle play/pause states with proper state transitions
    switch (this.controlState.mode) {
      case 'idle':
      case 'paused':
        if (this.isValidTransition(this.controlState.mode, 'playing')) {
          // Dispatch play event (matches existing PlayPauseButton event pattern)
          this.dispatchEvent(new CustomEvent('play-pause-click'));
        }
        break;
      case 'playing':
        if (this.isValidTransition(this.controlState.mode, 'paused')) {
          // Dispatch pause event (matches existing PlayPauseButton event pattern)
          this.dispatchEvent(new CustomEvent('play-pause-click'));
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
          // Dispatch record start event (matches existing RecordButton event pattern)
          this.dispatchEvent(new CustomEvent('record-click'));
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
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'unified-dj-control-block': UnifiedDJControlBlock;
  }
  
  interface HTMLElementEventMap {
    'play-pause-click': CustomEvent<void>;
    'record-click': CustomEvent<void>;
  }
}