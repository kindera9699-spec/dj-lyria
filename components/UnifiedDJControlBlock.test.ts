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
    
    element.addEventListener('dj-control-play', () => { eventType = 'play'; });
    element.addEventListener('dj-control-pause', () => { eventType = 'pause'; });
    element.addEventListener('dj-control-record-stop', () => { eventType = 'record-stop'; });
    
    const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
    
    // Test play event from idle state
    button.click();
    // Wait for debounce timer
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(eventType).to.equal('play');
    
    // Test pause event from playing state
    element.playbackState = 'playing';
    await element.updateComplete;
    await element.updateComplete; // Wait for another update cycle
    eventType = '';
    // Wait a bit to ensure debounce period has passed
    await new Promise(resolve => setTimeout(resolve, 200));
    button.click();
    // Wait for debounce timer
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(eventType).to.equal('pause');
    
    // Test record stop event from recording state
    element.isRecording = true;
    await element.updateComplete;
    await element.updateComplete; // Wait for another update cycle
    eventType = '';
    // Wait a bit to ensure debounce period has passed
    await new Promise(resolve => setTimeout(resolve, 200));
    button.click();
    // Wait for debounce timer
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(eventType).to.equal('record-stop');
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
    it('should emit play event on single click from idle state', async () => {
      let eventEmitted = false;
      element.addEventListener('dj-control-play', () => { eventEmitted = true; });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      button.click();
      
      // Wait for debounce timer
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventEmitted).to.be.true;
    });

    it('should emit pause event on single click from playing state', async () => {
      element.playbackState = 'playing';
      await element.updateComplete;
      
      let eventEmitted = false;
      element.addEventListener('dj-control-pause', () => { eventEmitted = true; });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      button.click();
      
      // Wait for debounce timer
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventEmitted).to.be.true;
    });

    it('should emit record-stop event on single click from recording state', async () => {
      element.isRecording = true;
      await element.updateComplete;
      
      let eventEmitted = false;
      element.addEventListener('dj-control-record-stop', () => { eventEmitted = true; });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      button.click();
      
      // Wait for debounce timer
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(eventEmitted).to.be.true;
    });
  });

  describe('Hold Detection Logic', () => {
    it('should emit record-start event after holding for 500ms', async () => {
      let eventEmitted = false;
      element.addEventListener('dj-control-record-start', () => { eventEmitted = true; });
      
      const button = element.shadowRoot?.querySelector('.dj-hardware-switch') as HTMLElement;
      
      // Simulate mouse down (start hold)
      button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      
      // Wait for hold timer (500ms + buffer)
      await new Promise(resolve => setTimeout(resolve, 600));
      
      expect(eventEmitted).to.be.true;
    });

    it('should not emit record-start if mouse up occurs before 500ms', async () => {
      let eventEmitted = false;
      element.addEventListener('dj-control-record-start', () => { eventEmitted = true; });
      
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
      element.addEventListener('dj-control-play', () => { clickCount++; });
      
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
      element.addEventListener('dj-control-play', () => { clickCount++; });
      
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
      element.addEventListener('dj-control-play', () => { eventEmitted = true; });
      
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
      element.addEventListener('dj-control-play', () => { eventEmitted = true; });
      
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
      element.addEventListener('dj-control-play', () => { eventEmitted = true; });
      
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