# Design Document

## Overview

This design transforms the existing separate PlayPauseButton and RecordButton components into a unified DJ hardware-style control block positioned in the sidebar header. The new component will feature a single multi-state button that handles play/pause/record functionality with authentic DJ hardware aesthetics.

## Architecture

### Component Structure
- **UnifiedDJControlBlock**: Main container component positioned as sidebar header
- **DJHardwareSwitch**: Core button component with multi-state functionality
- **State Management**: Centralized state handling for play/pause/record modes
- **Event System**: Custom events for integration with existing audio system

### Integration Points
- Replaces existing PlayPauseButton and RecordButton in the main layout
- Maintains compatibility with existing audio context and session management
- Preserves all existing event handlers and callbacks
- Integrates with current MIDI dispatcher and audio analyzer systems

## Components and Interfaces

### UnifiedDJControlBlock Component
```typescript
interface UnifiedDJControlBlockProps {
  playbackState: PlaybackState;
  isRecording: boolean;
  onPlayPause: () => void;
  onRecord: () => void;
}

interface DJControlState {
  mode: 'idle' | 'playing' | 'paused' | 'recording' | 'loading';
  isPressed: boolean;
  holdTimer: number | null;
}
```

### DJHardwareSwitch Component
```typescript
interface DJHardwareSwitchProps {
  state: DJControlState;
  onStateChange: (newState: DJControlState) => void;
}
```

### Event Interface
```typescript
interface DJControlEvents {
  'dj-control-play': CustomEvent<void>;
  'dj-control-pause': CustomEvent<void>;
  'dj-control-record-start': CustomEvent<void>;
  'dj-control-record-stop': CustomEvent<void>;
}
```

## Data Models

### State Transitions
```
idle → playing (single click)
playing → paused (single click)
paused → playing (single click)
idle/playing/paused → recording (hold/double-click)
recording → previous_state (single click)
```

### Visual States
- **Idle**: Dark base with subtle glow, play triangle icon
- **Playing**: Bright accent color, pause bars icon
- **Paused**: Dimmed accent color, play triangle icon
- **Recording**: Red accent with pulsing animation, record dot icon
- **Loading**: Animated spinner overlay

## Error Handling

### Input Validation
- Debounce rapid clicks to prevent state confusion
- Validate state transitions before applying changes
- Handle edge cases where audio context is not ready

### Fallback Behavior
- Graceful degradation if hardware-style animations fail
- Fallback to basic button styling if CSS animations are unsupported
- Error logging for debugging integration issues

### State Recovery
- Reset to idle state on critical errors
- Preserve last known good state for recovery
- Clear any pending timers on component unmount

## Testing Strategy

### Unit Tests
- State transition logic validation
- Event emission verification
- Props handling and validation
- Timer management (hold detection)

### Integration Tests
- Compatibility with existing audio system
- MIDI integration preservation
- Event propagation to parent components
- Recording functionality integration

### Visual Tests
- Hardware-style aesthetics rendering
- State transition animations
- Responsive design in sidebar header
- Hover and active state feedback

### Accessibility Tests
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- ARIA labels and roles

## Implementation Details

### Styling Approach
- CSS-in-JS using Lit's css template literal
- Hardware-inspired design with metallic gradients
- Subtle shadows and bevels for depth
- Smooth transitions between states
- Responsive sizing for sidebar header

### Animation Strategy
- CSS transitions for smooth state changes
- Keyframe animations for loading and recording states
- Transform-based hover effects
- Hardware-style button press animations

### Event Handling
- Mouse and touch event support
- Hold detection using setTimeout
- Double-click detection with timing validation
- Keyboard accessibility (Enter/Space)

### Performance Considerations
- Minimal DOM updates using Lit's efficient rendering
- CSS transforms for animations (GPU acceleration)
- Debounced event handlers to prevent spam
- Cleanup of timers and event listeners

## Migration Strategy

### Component Replacement
1. Create new UnifiedDJControlBlock component
2. Update main layout to use new component in sidebar header
3. Remove old PlayPauseButton and RecordButton from layout
4. Preserve existing event handler logic

### Backward Compatibility
- Maintain same event names and payloads
- Preserve existing CSS class names where possible
- Keep same component lifecycle behavior
- Ensure no breaking changes to parent component APIs