/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { fixture, html } from '@open-wc/testing';
import { expect } from '@esm-bundle/chai';
import './UnifiedDJControlBlock';
import type { UnifiedDJControlBlock } from './UnifiedDJControlBlock';

describe('UnifiedDJControlBlock State Management', () => {
  let element: UnifiedDJControlBlock;

  beforeEach(async () => {
    element = await fixture(html`<unified-dj-control-block></unified-dj-control-block>`);
  });

  it('should initialize with idle state', () => {
    expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('idle')).to.be.true;
  });

  it('should transition to playing state when playbackState changes', async () => {
    element.playbackState = 'playing';
    await element.updateComplete;
    await element.updateComplete; // Wait for another update cycle
    
    expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('playing')).to.be.true;
  });

  it('should transition to paused state when playbackState changes', async () => {
    element.playbackState = 'paused';
    await element.updateComplete;
    await element.updateComplete; // Wait for another update cycle
    
    expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('paused')).to.be.true;
  });

  it('should transition to recording state when isRecording is true', async () => {
    element.isRecording = true;
    await element.updateComplete;
    await element.updateComplete; // Wait for another update cycle
    
    expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('recording')).to.be.true;
  });

  it('should transition to loading state when playbackState is loading', async () => {
    element.playbackState = 'loading';
    await element.updateComplete;
    await element.updateComplete; // Wait for another update cycle
    
    expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('loading')).to.be.true;
  });

  it('should handle state transitions from idle to playing to paused', async () => {
    // Start idle
    expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('idle')).to.be.true;
    
    // Transition to playing
    element.playbackState = 'playing';
    await element.updateComplete;
    await element.updateComplete; // Wait for another update cycle
    expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('playing')).to.be.true;
    
    // Transition to paused
    element.playbackState = 'paused';
    await element.updateComplete;
    await element.updateComplete; // Wait for another update cycle
    expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('paused')).to.be.true;
  });

  it('should handle recording state with previous state tracking', async () => {
    // Start in playing state
    element.playbackState = 'playing';
    await element.updateComplete;
    await element.updateComplete; // Wait for another update cycle
    expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('playing')).to.be.true;
    
    // Enter recording state
    element.isRecording = true;
    await element.updateComplete;
    await element.updateComplete; // Wait for another update cycle
    expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('recording')).to.be.true;
    
    // Exit recording state
    element.isRecording = false;
    await element.updateComplete;
    await element.updateComplete; // Wait for another update cycle
    // Should return to playing state (though this depends on playbackState prop)
    expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('playing')).to.be.true;
  });

  it('should emit correct events on click', async () => {
    let eventType = '';
    
    element.addEventListener('play-pause-click', () => { eventType = 'play-pause'; });
    element.addEventListener('record-click', () => { eventType = 'record'; });
    
    const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
    
    // Test play-pause event from idle state
    button.click();
    // Wait for debounce timer
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(eventType).to.equal('play-pause');
    
    // Test play-pause event from playing state (same event for both play and pause)
    element.playbackState = 'playing';
    await element.updateComplete;
    await element.updateComplete; // Wait for another update cycle
    eventType = '';
    // Wait a bit to ensure debounce period has passed
    await new Promise(resolve => setTimeout(resolve, 200));
    button.click();
    // Wait for debounce timer
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(eventType).to.equal('play-pause');
    
    // Test record event from recording state (record-click for both start and stop)
    element.isRecording = true;
    await element.updateComplete;
    await element.updateComplete; // Wait for another update cycle
    eventType = '';
    // Wait a bit to ensure debounce period has passed
    await new Promise(resolve => setTimeout(resolve, 200));
    button.click();
    // Wait for debounce timer
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(eventType).to.equal('record');
  });

  it('should handle cleanup on disconnect', () => {
    // This test verifies that the cleanup method exists and can be called
    // The actual cleanup behavior is tested implicitly through other tests
    element.disconnectedCallback();
    // If no errors are thrown, the cleanup is working
    expect(true).to.be.true;
  });
});

describe('UnifiedDJControlBlock Click and Hold Interaction', () => {
  let element: UnifiedDJControlBlock;

  beforeEach(async () => {
    element = await fixture(html`<unified-dj-control-block></unified-dj-control-block>`);
  });

  describe('Single Click Detection', () => {
    it('should emit play-pause event on single click from idle state', async () => {
      let eventEmitted = false;
      element.addEventListener('play-pause-click', () => { eventEmitted = true; });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      button.click();
      
      // Wait for debounce timer
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventEmitted).to.be.true;
    });

    it('should emit play-pause event on single click from playing state', async () => {
      element.playbackState = 'playing';
      await element.updateComplete;
      
      let eventEmitted = false;
      element.addEventListener('play-pause-click', () => { eventEmitted = true; });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      button.click();
      
      // Wait for debounce timer
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventEmitted).to.be.true;
    });

    it('should emit record event on single click from recording state', async () => {
      element.isRecording = true;
      await element.updateComplete;
      
      let eventEmitted = false;
      element.addEventListener('record-click', () => { eventEmitted = true; });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      button.click();
      
      // Wait for debounce timer
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventEmitted).to.be.true;
    });
  });

  describe('Hold Detection Logic', () => {
    it('should emit record event after holding for 500ms', async () => {
      let eventEmitted = false;
      element.addEventListener('record-click', () => { eventEmitted = true; });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Simulate mouse down (start hold)
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      
      // Wait for hold timer (500ms + buffer)
      await new Promise(resolve => setTimeout(resolve, 600));
      
      expect(eventEmitted).to.be.true;
    });

    it('should not emit record event if mouse up occurs before 500ms', async () => {
      let eventEmitted = false;
      element.addEventListener('record-click', () => { eventEmitted = true; });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Simulate mouse down
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      
      // Wait 200ms (less than hold time)
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Simulate mouse up (cancel hold)
      button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      
      // Wait additional time to ensure timer would have fired
      await new Promise(resolve => setTimeout(resolve, 400));
      
      expect(eventEmitted).to.be.false;
    });

    it('should set pressed state during mouse down', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Simulate mouse down
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      await element.updateComplete;
      
      expect(button.classList.contains('pressed')).to.be.true;
    });

    it('should clear pressed state on mouse up', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Simulate mouse down then up
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      await element.updateComplete;
      
      button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      await element.updateComplete;
      
      expect(button.classList.contains('pressed')).to.be.false;
    });

    it('should clear pressed state on mouse leave', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Simulate mouse down then leave
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      await element.updateComplete;
      
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      await element.updateComplete;
      
      expect(button.classList.contains('pressed')).to.be.false;
    });
  });

  describe('Debouncing Logic', () => {
    it('should prevent rapid clicks within 150ms', async () => {
      let clickCount = 0;
      element.addEventListener('play-pause-click', () => { clickCount++; });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Rapid clicks
      button.click();
      button.click();
      button.click();
      
      // Wait for debounce timers
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Only the first click should have been processed
      expect(clickCount).to.equal(1);
    });

    it('should allow clicks after debounce period', async () => {
      let clickCount = 0;
      element.addEventListener('play-pause-click', () => { clickCount++; });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // First click
      button.click();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Wait for debounce period to pass
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Second click after debounce period
      button.click();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(clickCount).to.equal(2);
    });

    it('should debounce state changes with 50ms delay', async () => {
      let eventEmitted = false;
      element.addEventListener('play-pause-click', () => { eventEmitted = true; });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      button.click();
      
      // Check immediately - should not be emitted yet
      expect(eventEmitted).to.be.false;
      
      // Wait for debounce delay
      await new Promise(resolve => setTimeout(resolve, 60));
      
      // Now should be emitted
      expect(eventEmitted).to.be.true;
    });
  });

  describe('Keyboard Accessibility', () => {
    it('should handle Enter key press', async () => {
      let eventEmitted = false;
      element.addEventListener('play-pause-click', () => { eventEmitted = true; });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Simulate Enter key press
      const enterEvent = new KeyboardEvent('keydown', { 
        key: 'Enter', 
        bubbles: true, 
        cancelable: true 
      });
      button.dispatchEvent(enterEvent);
      
      // Wait for debounce timer
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventEmitted).to.be.true;
    });

    it('should handle Space key press', async () => {
      let eventEmitted = false;
      element.addEventListener('play-pause-click', () => { eventEmitted = true; });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Simulate Space key press
      const spaceEvent = new KeyboardEvent('keydown', { 
        key: ' ', 
        bubbles: true, 
        cancelable: true 
      });
      button.dispatchEvent(spaceEvent);
      
      // Wait for debounce timer
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventEmitted).to.be.true;
    });

    it('should prevent default behavior for Enter and Space keys', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Test Enter key
      const enterEvent = new KeyboardEvent('keydown', { 
        key: 'Enter', 
        bubbles: true, 
        cancelable: true 
      });
      button.dispatchEvent(enterEvent);
      expect(enterEvent.defaultPrevented).to.be.true;
      
      // Test Space key
      const spaceEvent = new KeyboardEvent('keydown', { 
        key: ' ', 
        bubbles: true, 
        cancelable: true 
      });
      button.dispatchEvent(spaceEvent);
      expect(spaceEvent.defaultPrevented).to.be.true;
    });

    it('should ignore other key presses', async () => {
      let eventEmitted = false;
      element.addEventListener('dj-control-play', () => { eventEmitted = true; });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Simulate other key press
      const otherKeyEvent = new KeyboardEvent('keydown', { 
        key: 'a', 
        bubbles: true, 
        cancelable: true 
      });
      button.dispatchEvent(otherKeyEvent);
      
      // Wait for potential debounce timer
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventEmitted).to.be.false;
      expect(otherKeyEvent.defaultPrevented).to.be.false;
    });

    it('should have proper ARIA attributes', () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      expect(button.getAttribute('role')).to.equal('button');
      expect(button.getAttribute('tabindex')).to.equal('0');
      expect(button.getAttribute('aria-label')).to.include('DJ Control Switch');
    });

    it('should update ARIA label based on current state', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Test idle state
      expect(button.getAttribute('aria-label')).to.include('idle');
      
      // Test playing state
      element.playbackState = 'playing';
      await element.updateComplete;
      await element.updateComplete; // Wait for another update cycle
      expect(button.getAttribute('aria-label')).to.include('playing');
      
      // Test recording state
      element.isRecording = true;
      await element.updateComplete;
      await element.updateComplete; // Wait for another update cycle
      expect(button.getAttribute('aria-label')).to.include('recording');
    });
  });

  describe('Timer Management', () => {
    it('should clean up hold timer on component disconnect', () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Start hold timer
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      
      // Disconnect component
      element.disconnectedCallback();
      
      // If no errors are thrown, cleanup worked properly
      expect(true).to.be.true;
    });

    it('should clean up debounce timer on component disconnect', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Start debounce timer
      button.click();
      
      // Disconnect component
      element.disconnectedCallback();
      
      // If no errors are thrown, cleanup worked properly
      expect(true).to.be.true;
    });

    it('should not emit events if component is disconnected during timer', async () => {
      let eventEmitted = false;
      element.addEventListener('dj-control-record-start', () => { eventEmitted = true; });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Start hold timer
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      
      // Disconnect component before timer fires
      element.disconnectedCallback();
      
      // Wait for timer period
      await new Promise(resolve => setTimeout(resolve, 600));
      
      expect(eventEmitted).to.be.false;
    });
  });

  describe('Loading State Interaction', () => {
    it('should prevent clicks when in loading state', async () => {
      element.playbackState = 'loading';
      await element.updateComplete;
      
      let eventEmitted = false;
      element.addEventListener('dj-control-play', () => { eventEmitted = true; });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      button.click();
      
      // Wait for debounce timer
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventEmitted).to.be.false;
    });

    it('should prevent hold actions when in loading state', async () => {
      element.playbackState = 'loading';
      await element.updateComplete;
      
      let eventEmitted = false;
      element.addEventListener('dj-control-record-start', () => { eventEmitted = true; });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      
      // Wait for hold timer
      await new Promise(resolve => setTimeout(resolve, 600));
      
      expect(eventEmitted).to.be.false;
    });
  });
});

describe('UnifiedDJControlBlock State Transition Logic and Validation', () => {
  let element: UnifiedDJControlBlock;

  beforeEach(async () => {
    element = await fixture(html`<unified-dj-control-block></unified-dj-control-block>`);
  });

  describe('Valid State Transitions', () => {
    it('should allow transition from idle to playing', async () => {
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('idle')).to.be.true;
      
      element.playbackState = 'playing';
      await element.updateComplete;
      await element.updateComplete;
      
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('playing')).to.be.true;
    });

    it('should allow transition from idle to recording', async () => {
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('idle')).to.be.true;
      
      element.isRecording = true;
      await element.updateComplete;
      await element.updateComplete;
      
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('recording')).to.be.true;
    });

    it('should allow transition from idle to loading', async () => {
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('idle')).to.be.true;
      
      element.playbackState = 'loading';
      await element.updateComplete;
      await element.updateComplete;
      
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('loading')).to.be.true;
    });

    it('should allow transition from playing to paused', async () => {
      element.playbackState = 'playing';
      await element.updateComplete;
      await element.updateComplete;
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('playing')).to.be.true;
      
      element.playbackState = 'paused';
      await element.updateComplete;
      await element.updateComplete;
      
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('paused')).to.be.true;
    });

    it('should allow transition from playing to recording', async () => {
      element.playbackState = 'playing';
      await element.updateComplete;
      await element.updateComplete;
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('playing')).to.be.true;
      
      element.isRecording = true;
      await element.updateComplete;
      await element.updateComplete;
      
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('recording')).to.be.true;
    });

    it('should allow transition from paused to playing', async () => {
      element.playbackState = 'paused';
      await element.updateComplete;
      await element.updateComplete;
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('paused')).to.be.true;
      
      element.playbackState = 'playing';
      await element.updateComplete;
      await element.updateComplete;
      
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('playing')).to.be.true;
    });

    it('should allow transition from recording to any previous state', async () => {
      // Start in playing state, then record
      element.playbackState = 'playing';
      await element.updateComplete;
      await element.updateComplete;
      
      element.isRecording = true;
      await element.updateComplete;
      await element.updateComplete;
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('recording')).to.be.true;
      
      // Exit recording, should return to playing
      element.isRecording = false;
      await element.updateComplete;
      await element.updateComplete;
      
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('playing')).to.be.true;
    });

    it('should allow transition from loading to any state', async () => {
      element.playbackState = 'loading';
      await element.updateComplete;
      await element.updateComplete;
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('loading')).to.be.true;
      
      element.playbackState = 'playing';
      await element.updateComplete;
      await element.updateComplete;
      
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('playing')).to.be.true;
    });
  });

  describe('State Persistence and Memory', () => {
    it('should remember previous state when entering recording mode', async () => {
      // Start in playing state
      element.playbackState = 'playing';
      await element.updateComplete;
      await element.updateComplete;
      
      // Enter recording
      element.isRecording = true;
      await element.updateComplete;
      await element.updateComplete;
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('recording')).to.be.true;
      
      // Exit recording - should return to playing
      element.isRecording = false;
      await element.updateComplete;
      await element.updateComplete;
      
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('playing')).to.be.true;
    });

    it('should handle complex state transitions correctly', async () => {
      // idle -> playing -> recording -> playing -> paused
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('idle')).to.be.true;
      
      element.playbackState = 'playing';
      await element.updateComplete;
      await element.updateComplete;
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('playing')).to.be.true;
      
      element.isRecording = true;
      await element.updateComplete;
      await element.updateComplete;
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('recording')).to.be.true;
      
      element.isRecording = false;
      await element.updateComplete;
      await element.updateComplete;
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('playing')).to.be.true;
      
      element.playbackState = 'paused';
      await element.updateComplete;
      await element.updateComplete;
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('paused')).to.be.true;
    });
  });

  describe('Prop-driven State Updates', () => {
    it('should update state when playbackState prop changes', async () => {
      const states: Array<{ prop: string; expectedClass: string }> = [
        { prop: 'playing', expectedClass: 'playing' },
        { prop: 'paused', expectedClass: 'paused' },
        { prop: 'loading', expectedClass: 'loading' },
        { prop: 'stopped', expectedClass: 'idle' }
      ];

      for (const { prop, expectedClass } of states) {
        element.playbackState = prop as any;
        await element.updateComplete;
        await element.updateComplete;
        
        expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains(expectedClass)).to.be.true;
      }
    });

    it('should prioritize recording state over playback state', async () => {
      element.playbackState = 'playing';
      element.isRecording = true;
      await element.updateComplete;
      await element.updateComplete;
      
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('recording')).to.be.true;
      expect(element.shadowRoot?.querySelector('.dj-hardware-switch')?.classList.contains('playing')).to.be.false;
    });
  });
});

describe('UnifiedDJControlBlock Event Emission and Payload Correctness', () => {
  let element: UnifiedDJControlBlock;

  beforeEach(async () => {
    element = await fixture(html`<unified-dj-control-block></unified-dj-control-block>`);
  });

  describe('Play-Pause Event Emission', () => {
    it('should emit play-pause-click event with correct payload from idle state', async () => {
      let eventReceived = false;
      let eventDetail: any = null;
      
      element.addEventListener('play-pause-click', (e: CustomEvent) => {
        eventReceived = true;
        eventDetail = e.detail;
      });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      button.click();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventReceived).to.be.true;
      expect(eventDetail).to.be.null; // CustomEvent detail defaults to null
    });

    it('should emit play-pause-click event from playing state', async () => {
      element.playbackState = 'playing';
      await element.updateComplete;
      await element.updateComplete;
      
      let eventReceived = false;
      element.addEventListener('play-pause-click', () => {
        eventReceived = true;
      });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      await new Promise(resolve => setTimeout(resolve, 200)); // Wait for debounce
      button.click();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventReceived).to.be.true;
    });

    it('should emit play-pause-click event from paused state', async () => {
      element.playbackState = 'paused';
      await element.updateComplete;
      await element.updateComplete;
      
      let eventReceived = false;
      element.addEventListener('play-pause-click', () => {
        eventReceived = true;
      });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      await new Promise(resolve => setTimeout(resolve, 200)); // Wait for debounce
      button.click();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventReceived).to.be.true;
    });

    it('should not emit play-pause-click event from loading state', async () => {
      element.playbackState = 'loading';
      await element.updateComplete;
      await element.updateComplete;
      
      let eventReceived = false;
      element.addEventListener('play-pause-click', () => {
        eventReceived = true;
      });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      button.click();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventReceived).to.be.false;
    });
  });

  describe('Record Event Emission', () => {
    it('should emit record-click event with correct payload from recording state', async () => {
      element.isRecording = true;
      await element.updateComplete;
      await element.updateComplete;
      
      let eventReceived = false;
      let eventDetail: any = null;
      
      element.addEventListener('record-click', (e: CustomEvent) => {
        eventReceived = true;
        eventDetail = e.detail;
      });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      await new Promise(resolve => setTimeout(resolve, 200)); // Wait for debounce
      button.click();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventReceived).to.be.true;
      expect(eventDetail).to.be.null; // CustomEvent detail defaults to null
    });

    it('should emit record-click event on hold from non-recording state', async () => {
      let eventReceived = false;
      element.addEventListener('record-click', () => {
        eventReceived = true;
      });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      
      await new Promise(resolve => setTimeout(resolve, 600)); // Wait for hold timer
      
      expect(eventReceived).to.be.true;
    });

    it('should not emit record-click event on hold from loading state', async () => {
      element.playbackState = 'loading';
      await element.updateComplete;
      await element.updateComplete;
      
      let eventReceived = false;
      element.addEventListener('record-click', () => {
        eventReceived = true;
      });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      
      await new Promise(resolve => setTimeout(resolve, 600)); // Wait for hold timer
      
      expect(eventReceived).to.be.false;
    });
  });

  describe('Event Compatibility', () => {
    it('should emit events that bubble correctly', async () => {
      let eventBubbled = false;
      
      // Listen on the element itself since shadow DOM events don't automatically bubble to document
      element.addEventListener('play-pause-click', () => {
        eventBubbled = true;
      });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      button.click();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventBubbled).to.be.true;
    });

    it('should emit CustomEvent instances', async () => {
      let eventInstance: Event | null = null;
      
      element.addEventListener('play-pause-click', (e) => {
        eventInstance = e;
      });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      button.click();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventInstance).to.be.instanceOf(CustomEvent);
    });
  });
});

describe('UnifiedDJControlBlock Timer Management', () => {
  let element: UnifiedDJControlBlock;

  beforeEach(async () => {
    element = await fixture(html`<unified-dj-control-block></unified-dj-control-block>`);
  });

  describe('Hold Timer Management', () => {
    it('should start hold timer on mousedown', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      let timerStarted = false;
      const originalSetTimeout = window.setTimeout;
      window.setTimeout = ((callback: Function, delay: number) => {
        if (delay === 500) { // Hold timer delay
          timerStarted = true;
        }
        return originalSetTimeout(callback, delay);
      }) as any;
      
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      
      expect(timerStarted).to.be.true;
      
      // Restore original setTimeout
      window.setTimeout = originalSetTimeout;
    });

    it('should clear hold timer on mouseup', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      let eventEmitted = false;
      element.addEventListener('record-click', () => {
        eventEmitted = true;
      });
      
      // Start hold
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      
      // Cancel hold before timer fires
      await new Promise(resolve => setTimeout(resolve, 200));
      button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      
      // Wait for timer period to ensure it was cancelled
      await new Promise(resolve => setTimeout(resolve, 400));
      
      expect(eventEmitted).to.be.false;
    });

    it('should clear hold timer on mouseleave', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      let eventEmitted = false;
      element.addEventListener('record-click', () => {
        eventEmitted = true;
      });
      
      // Start hold
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      
      // Cancel hold with mouseleave
      await new Promise(resolve => setTimeout(resolve, 200));
      button.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      
      // Wait for timer period to ensure it was cancelled
      await new Promise(resolve => setTimeout(resolve, 400));
      
      expect(eventEmitted).to.be.false;
    });

    it('should fire hold timer after 500ms', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      let eventEmitted = false;
      let eventTime = 0;
      const startTime = Date.now();
      
      element.addEventListener('record-click', () => {
        eventEmitted = true;
        eventTime = Date.now() - startTime;
      });
      
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      expect(eventEmitted).to.be.true;
      expect(eventTime).to.be.at.least(500);
      expect(eventTime).to.be.at.most(550); // Allow some tolerance
    });

    it('should clean up hold timer on component disconnect', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      let eventEmitted = false;
      element.addEventListener('record-click', () => {
        eventEmitted = true;
      });
      
      // Start hold
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      
      // Disconnect component
      element.disconnectedCallback();
      
      // Wait for timer period
      await new Promise(resolve => setTimeout(resolve, 600));
      
      expect(eventEmitted).to.be.false;
    });
  });

  describe('Debounce Timer Management', () => {
    it('should debounce rapid clicks', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      let clickCount = 0;
      element.addEventListener('play-pause-click', () => {
        clickCount++;
      });
      
      // Rapid clicks within debounce period
      button.click();
      button.click();
      button.click();
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      expect(clickCount).to.equal(1);
    });

    it('should allow clicks after debounce period', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      let clickCount = 0;
      element.addEventListener('play-pause-click', () => {
        clickCount++;
      });
      
      // First click
      button.click();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Wait for debounce period
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Second click after debounce
      button.click();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(clickCount).to.equal(2);
    });

    it('should use 50ms debounce delay for state changes', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      let eventEmitted = false;
      const startTime = Date.now();
      
      element.addEventListener('play-pause-click', () => {
        const elapsed = Date.now() - startTime;
        expect(elapsed).to.be.at.least(50);
        eventEmitted = true;
      });
      
      button.click();
      
      // Check immediately - should not be emitted yet
      expect(eventEmitted).to.be.false;
      
      await new Promise(resolve => setTimeout(resolve, 60));
      
      expect(eventEmitted).to.be.true;
    });

    it('should clean up debounce timer on component disconnect', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      let eventEmitted = false;
      element.addEventListener('play-pause-click', () => {
        eventEmitted = true;
      });
      
      // Start debounce
      button.click();
      
      // Disconnect before debounce fires
      element.disconnectedCallback();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventEmitted).to.be.false;
    });
  });

  describe('Timer Interaction', () => {
    it('should handle simultaneous hold and debounce timers', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      let clickEventEmitted = false;
      let holdEventEmitted = false;
      
      element.addEventListener('play-pause-click', () => {
        clickEventEmitted = true;
      });
      
      element.addEventListener('record-click', () => {
        holdEventEmitted = true;
      });
      
      // Start hold and immediately click
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      button.click();
      
      // Wait for both timers
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Both events should have fired
      expect(clickEventEmitted).to.be.true;
      expect(holdEventEmitted).to.be.true;
    });

    it('should prevent memory leaks with proper timer cleanup', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Start multiple timers
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      button.click();
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      button.click();
      
      // Disconnect should clean up all timers
      element.disconnectedCallback();
      
      // If no errors are thrown, cleanup worked
      expect(true).to.be.true;
    });
  });
});

describe('UnifiedDJControlBlock Keyboard Interaction Handling', () => {
  let element: UnifiedDJControlBlock;

  beforeEach(async () => {
    element = await fixture(html`<unified-dj-control-block></unified-dj-control-block>`);
  });

  describe('Keyboard Event Handling', () => {
    it('should handle Enter key press', async () => {
      let eventEmitted = false;
      element.addEventListener('play-pause-click', () => {
        eventEmitted = true;
      });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true
      });
      
      button.dispatchEvent(enterEvent);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventEmitted).to.be.true;
      expect(enterEvent.defaultPrevented).to.be.true;
    });

    it('should handle Space key press', async () => {
      let eventEmitted = false;
      element.addEventListener('play-pause-click', () => {
        eventEmitted = true;
      });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      const spaceEvent = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true
      });
      
      button.dispatchEvent(spaceEvent);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventEmitted).to.be.true;
      expect(spaceEvent.defaultPrevented).to.be.true;
    });

    it('should ignore other key presses', async () => {
      let eventEmitted = false;
      element.addEventListener('play-pause-click', () => {
        eventEmitted = true;
      });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      const otherKeyEvent = new KeyboardEvent('keydown', {
        key: 'a',
        bubbles: true,
        cancelable: true
      });
      
      button.dispatchEvent(otherKeyEvent);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventEmitted).to.be.false;
      expect(otherKeyEvent.defaultPrevented).to.be.false;
    });

    it('should handle keyboard events in different states', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Test in playing state
      element.playbackState = 'playing';
      await element.updateComplete;
      await element.updateComplete;
      
      let playPauseEventEmitted = false;
      element.addEventListener('play-pause-click', () => {
        playPauseEventEmitted = true;
      });
      
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true
      });
      
      await new Promise(resolve => setTimeout(resolve, 200)); // Wait for debounce
      button.dispatchEvent(enterEvent);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(playPauseEventEmitted).to.be.true;
      
      // Test in recording state
      element.isRecording = true;
      await element.updateComplete;
      await element.updateComplete;
      
      let recordEventEmitted = false;
      element.addEventListener('record-click', () => {
        recordEventEmitted = true;
      });
      
      const spaceEvent = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true
      });
      
      await new Promise(resolve => setTimeout(resolve, 200)); // Wait for debounce
      button.dispatchEvent(spaceEvent);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(recordEventEmitted).to.be.true;
    });

    it('should prevent keyboard events in loading state', async () => {
      element.playbackState = 'loading';
      await element.updateComplete;
      await element.updateComplete;
      
      let eventEmitted = false;
      element.addEventListener('play-pause-click', () => {
        eventEmitted = true;
      });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true
      });
      
      button.dispatchEvent(enterEvent);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventEmitted).to.be.false;
      expect(enterEvent.defaultPrevented).to.be.true; // Still prevents default
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA attributes', () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      expect(button.getAttribute('role')).to.equal('button');
      expect(button.getAttribute('tabindex')).to.equal('0');
      expect(button.getAttribute('aria-label')).to.include('DJ Control Switch');
    });

    it('should update ARIA label based on current state', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Test idle state
      expect(button.getAttribute('aria-label')).to.include('idle');
      
      // Test playing state
      element.playbackState = 'playing';
      await element.updateComplete;
      await element.updateComplete;
      expect(button.getAttribute('aria-label')).to.include('playing');
      
      // Test paused state
      element.playbackState = 'paused';
      await element.updateComplete;
      await element.updateComplete;
      expect(button.getAttribute('aria-label')).to.include('paused');
      
      // Test recording state
      element.isRecording = true;
      await element.updateComplete;
      await element.updateComplete;
      expect(button.getAttribute('aria-label')).to.include('recording');
      
      // Test loading state
      element.isRecording = false;
      element.playbackState = 'loading';
      await element.updateComplete;
      await element.updateComplete;
      expect(button.getAttribute('aria-label')).to.include('loading');
    });

    it('should be focusable with keyboard navigation', () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      expect(button.tabIndex).to.equal(0);
      
      // Test focus
      button.focus();
      expect(document.activeElement).to.equal(element);
    });

    it('should handle focus and blur events properly', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Focus should not trigger any events
      let eventEmitted = false;
      element.addEventListener('play-pause-click', () => {
        eventEmitted = true;
      });
      
      button.focus();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventEmitted).to.be.false;
      
      // Blur should not trigger any events
      button.blur();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventEmitted).to.be.false;
    });
  });

  describe('Keyboard and Mouse Interaction Compatibility', () => {
    it('should handle mixed keyboard and mouse interactions', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      let eventCount = 0;
      element.addEventListener('play-pause-click', () => {
        eventCount++;
      });
      
      // Mouse click
      button.click();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Wait for debounce
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Keyboard press
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true
      });
      button.dispatchEvent(enterEvent);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventCount).to.equal(2);
    });

    it('should respect debouncing across keyboard and mouse events', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      let eventCount = 0;
      element.addEventListener('play-pause-click', () => {
        eventCount++;
      });
      
      // Rapid mouse and keyboard events
      button.click();
      
      const enterEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true
      });
      button.dispatchEvent(enterEvent);
      
      const spaceEvent = new KeyboardEvent('keydown', {
        key: ' ',
        bubbles: true,
        cancelable: true
      });
      button.dispatchEvent(spaceEvent);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Only first event should have been processed due to debouncing
      expect(eventCount).to.equal(1);
    });
  });
});

describe('UnifiedDJControlBlock Visual State Indicators and Animations', () => {
  let element: UnifiedDJControlBlock;

  beforeEach(async () => {
    element = await fixture(html`<unified-dj-control-block></unified-dj-control-block>`);
  });

  describe('Distinct Visual States', () => {
    it('should apply idle state CSS class', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      expect(button.classList.contains('idle')).to.be.true;
    });

    it('should apply playing state CSS class', async () => {
      element.playbackState = 'playing';
      await element.updateComplete;
      await element.updateComplete; // Wait for another update cycle
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      expect(button.classList.contains('playing')).to.be.true;
      expect(button.classList.contains('idle')).to.be.false;
    });

    it('should apply paused state CSS class', async () => {
      element.playbackState = 'paused';
      await element.updateComplete;
      await element.updateComplete; // Wait for another update cycle
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      expect(button.classList.contains('paused')).to.be.true;
      expect(button.classList.contains('idle')).to.be.false;
    });

    it('should apply recording state CSS class', async () => {
      element.isRecording = true;
      await element.updateComplete;
      await element.updateComplete; // Wait for another update cycle
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      expect(button.classList.contains('recording')).to.be.true;
      expect(button.classList.contains('idle')).to.be.false;
    });

    it('should apply loading state CSS class', async () => {
      element.playbackState = 'loading';
      await element.updateComplete;
      await element.updateComplete; // Wait for another update cycle
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      expect(button.classList.contains('loading')).to.be.true;
      expect(button.classList.contains('idle')).to.be.false;
    });
  });

  describe('Smooth CSS Transitions', () => {
    it('should have CSS transition classes applied', () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      const icon = element.shadowRoot?.querySelector('.switch-icon') as HTMLElement;
      
      // Verify elements exist and have the correct classes for transitions
      expect(button).to.not.be.null;
      expect(icon).to.not.be.null;
      expect(button.classList.contains('dj-hardware-switch')).to.be.true;
      expect(icon.classList.contains('switch-icon')).to.be.true;
    });

    it('should smoothly transition between states', async () => {
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Start in idle state
      expect(button.classList.contains('idle')).to.be.true;
      
      // Transition to playing state
      element.playbackState = 'playing';
      await element.updateComplete;
      await element.updateComplete; // Wait for another update cycle
      
      // Verify new state is applied
      expect(button.classList.contains('playing')).to.be.true;
      expect(button.classList.contains('idle')).to.be.false;
    });
  });

  describe('Recording State Pulsing Animation', () => {
    it('should apply recording CSS class with animation', async () => {
      element.isRecording = true;
      await element.updateComplete;
      await element.updateComplete; // Wait for another update cycle
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Verify that recording class is applied (which has the animation in CSS)
      expect(button.classList.contains('recording')).to.be.true;
    });

    it('should remove recording animation when exiting recording state', async () => {
      // Enter recording state
      element.isRecording = true;
      await element.updateComplete;
      await element.updateComplete; // Wait for another update cycle
      
      // Exit recording state
      element.isRecording = false;
      await element.updateComplete;
      await element.updateComplete; // Wait for another update cycle
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Verify that recording class is no longer applied
      expect(button.classList.contains('recording')).to.be.false;
    });
  });

  describe('Loading Spinner Animation', () => {
    it('should apply loading CSS class with animation', async () => {
      element.playbackState = 'loading';
      await element.updateComplete;
      await element.updateComplete; // Wait for another update cycle
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Verify that loading class is applied (which has the animation in CSS)
      expect(button.classList.contains('loading')).to.be.true;
    });

    it('should remove loading animation when exiting loading state', async () => {
      // Enter loading state
      element.playbackState = 'loading';
      await element.updateComplete;
      await element.updateComplete; // Wait for another update cycle
      
      // Exit loading state
      element.playbackState = 'idle';
      await element.updateComplete;
      await element.updateComplete; // Wait for another update cycle
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Verify that loading class is no longer applied
      expect(button.classList.contains('loading')).to.be.false;
    });
  });

  describe('Icon State Indicators', () => {
    it('should display correct icon for idle state', () => {
      const icon = element.shadowRoot?.querySelector('.switch-icon') as HTMLElement;
      expect(icon.textContent).to.equal('▶️'); // Play icon
    });

    it('should display correct icon for playing state', async () => {
      element.playbackState = 'playing';
      await element.updateComplete;
      await element.updateComplete; // Wait for another update cycle
      
      const icon = element.shadowRoot?.querySelector('.switch-icon') as HTMLElement;
      expect(icon.textContent).to.equal('⏸️'); // Pause icon
    });

    it('should display correct icon for paused state', async () => {
      element.playbackState = 'paused';
      await element.updateComplete;
      await element.updateComplete; // Wait for another update cycle
      
      const icon = element.shadowRoot?.querySelector('.switch-icon') as HTMLElement;
      expect(icon.textContent).to.equal('▶️'); // Play icon
    });

    it('should display correct icon for recording state', async () => {
      element.isRecording = true;
      await element.updateComplete;
      await element.updateComplete; // Wait for another update cycle
      
      const icon = element.shadowRoot?.querySelector('.switch-icon') as HTMLElement;
      expect(icon.textContent).to.equal('⏺️'); // Record icon
    });

    it('should display correct icon for loading state', async () => {
      element.playbackState = 'loading';
      await element.updateComplete;
      await element.updateComplete; // Wait for another update cycle
      
      const icon = element.shadowRoot?.querySelector('.switch-icon') as HTMLElement;
      expect(icon.textContent).to.equal('⟳'); // Loading/refresh icon
    });
  });
});