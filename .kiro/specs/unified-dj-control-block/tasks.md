# Implementation Plan

- [x] 1. Create core UnifiedDJControlBlock component structure
  - Create new component file with basic Lit element structure
  - Define component properties and state interfaces
  - Set up initial CSS styling framework for sidebar header positioning
  - _Requirements: 2.1, 2.2_

- [x] 2. Implement DJ hardware switch visual design
  - Create hardware-inspired CSS styling with metallic gradients and shadows
  - Implement base button structure with proper dimensions for sidebar header
  - Add hover and active state visual feedback
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 3. Implement multi-state functionality and state management
  - Create state management logic for idle/playing/paused/recording/loading states
  - Implement state transition validation and logic
  - Add proper state initialization and cleanup
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 4. Add click and hold interaction handling
  - Implement single click detection for play/pause functionality
  - Add hold detection logic using setTimeout for record activation
  - Implement debouncing to prevent rapid state changes
  - Add keyboard accessibility support (Enter/Space keys)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 5. Create visual state indicators and animations
  - Implement distinct visual states for each mode (idle/play/pause/record/loading)
  - Add smooth CSS transitions between states
  - Create pulsing animation for recording state
  - Add loading spinner animation
  - _Requirements: 3.2, 3.3, 3.4_

- [ ] 6. Implement event system for parent component integration
  - Create custom events for play, pause, record start, and record stop actions
  - Ensure event payloads match existing PlayPauseButton and RecordButton events
  - Add proper event dispatching in state change handlers
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 7. Write comprehensive unit tests for component functionality
  - Test state transition logic and validation
  - Test event emission and payload correctness
  - Test timer management for hold detection
  - Test keyboard interaction handling
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 8. Update main application layout to integrate new component
  - Remove existing PlayPauseButton and RecordButton from current layout
  - Add UnifiedDJControlBlock to sidebar header position
  - Update CSS layout to accommodate new sidebar header structure
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 9. Connect component to existing audio system event handlers
  - Wire up play/pause event handlers from existing system
  - Connect record functionality to existing MediaRecorder logic
  - Ensure playbackState and isRecording props are properly passed
  - Test integration with existing audio context and session management
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 10. Add responsive design and final styling polish
  - Ensure component scales properly in sidebar header
  - Add final hardware-style visual polish and refinements
  - Test component appearance across different screen sizes
  - Verify accessibility compliance and focus management
  - _Requirements: 2.3, 3.1, 3.4_