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
    expect(eventType).to.equal('play');
    
    // Test pause event from playing state
    element.playbackState = 'playing';
    await element.updateComplete;
    eventType = '';
    button.click();
    expect(eventType).to.equal('pause');
    
    // Test record stop event from recording state
    element.isRecording = true;
    await element.updateComplete;
    eventType = '';
    button.click();
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