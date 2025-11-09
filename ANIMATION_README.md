# Animated Schedule Selector

## Overview

The `AnimatedScheduleSelector` displays a unified calendar view with an engaging intro animation. It shows a single glass-morphism container with 7 day headers and 28 date buttons (4 weeks × 7 days), cycling through different weekly schedule patterns before becoming interactive.

## ⚡ Simplified Structure (v2)

This component has been redesigned for simplicity and clarity:

**Before (Complex):**
- Purple container
- Main SearchScheduleSelector (separate container)
- 3 additional week grids (each with separate containers)
- Multiple week indicators
- Too many nested layers

**After (Simplified):**
- ✅ One purple expanding container
- ✅ One glass translucent container inside
- ✅ Unified calendar grid (7×5 layout)
- ✅ All buttons share consistent 8px gaps
- ✅ Calendar appearance, not separate weekly sections

## Features

### Animation Sequence

1. **Container Expand Phase (0.8s)**
   - The purple container smoothly expands
   - Glass translucent calendar grid becomes visible
   - Shows unified 7×5 layout (icon + headers + 4 weeks)

2. **Pattern Display Phase (~5s)**
   - Cycles through 4 different weekly schedule patterns:
     - **Every Week**: Monday-Friday selected on all 4 weeks
     - **Every Other Week**: Monday-Thursday on weeks 1 & 3
     - **2 Weeks On, 2 Weeks Off**: Sunday-Wednesday on weeks 1 & 2
     - **1 Week On, 3 Weeks Off**: Thursday-Saturday on week 1 only
   - Each pattern displays for 1.2 seconds
   - Buttons smoothly transition between white and purple gradient
   - Pattern name shown below the calendar

3. **Container Collapse Phase (0.7s)**
   - Container smoothly shrinks back to original size
   - Calendar grid fades out
   - Returns to normal selector mode

4. **Interactive Phase**
   - Normal SearchScheduleSelector appears
   - Full functionality restored
   - User can click/drag to select their own schedule
   - All validation and error handling works normally

### Grid Layout

```
📅 | S | M | T | W | T | F | S |  <- Day headers
---|---|---|---|---|---|---|---|
   | □ | □ | □ | □ | □ | □ | □ |  <- Week 1
   | □ | □ | □ | □ | □ | □ | □ |  <- Week 2
   | □ | □ | □ | □ | □ | □ | □ |  <- Week 3
   | □ | □ | □ | □ | □ | □ | □ |  <- Week 4
```

- **8 columns**: Calendar icon + 7 days
- **5 rows**: Headers + 4 weeks
- **35 total cells**: 1 icon + 7 headers + 28 buttons
- **Consistent gaps**: 8px between all elements

### Non-Interactive During Animation

- `pointer-events: none` is applied during the entire animation
- Prevents user clicks from interfering with the animation
- Automatically restored after animation completes

### Toggle-able Animation

- Can be enabled/disabled via the `enableAnimation` prop
- When disabled, component behaves like normal `SearchScheduleSelector`
- Perfect for production use where you may want to show animation only once

## Usage

### Basic Usage (Animation on Mount)

```tsx
import { AnimatedScheduleSelector } from './AnimatedScheduleSelector';

function MyPage() {
  return (
    <AnimatedScheduleSelector
      enableAnimation={true}
      onAnimationComplete={() => console.log('Animation done!')}
      onSelectionChange={(days) => console.log(days)}
      minDays={3}
      requireContiguous={true}
    />
  );
}
```

### Manual Trigger with Play Button

```tsx
import { AnimatedScheduleSelector } from './AnimatedScheduleSelector';
import { useState } from 'react';

function MyPage() {
  const [animate, setAnimate] = useState(false);
  const [key, setKey] = useState(0);

  const playAnimation = () => {
    setAnimate(true);
    setKey(prev => prev + 1); // Force re-mount
  };

  return (
    <>
      <button onClick={playAnimation}>Play Animation</button>
      <AnimatedScheduleSelector
        key={key}
        enableAnimation={animate}
        onAnimationComplete={() => setAnimate(false)}
        onSelectionChange={(days) => console.log(days)}
        minDays={3}
        requireContiguous={true}
      />
    </>
  );
}
```

### Disable Animation (Normal Selector)

```tsx
import { AnimatedScheduleSelector } from './AnimatedScheduleSelector';

function MyPage() {
  return (
    <AnimatedScheduleSelector
      enableAnimation={false}
      onSelectionChange={(days) => console.log(days)}
      minDays={3}
      requireContiguous={true}
    />
  );
}
```

## Props

### AnimatedScheduleSelectorProps

All props from `SearchScheduleSelectorProps` are supported, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableAnimation` | `boolean` | `false` | Enable the intro animation on mount |
| `onAnimationComplete` | `() => void` | `undefined` | Callback fired when animation completes |

### Inherited Props from SearchScheduleSelector

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSelectionChange` | `(days: Day[]) => void` | `undefined` | Callback when selection changes |
| `onError` | `(error: string) => void` | `undefined` | Callback when validation error occurs |
| `minDays` | `number` | `3` | Minimum nights per week (checkout day excluded) |
| `requireContiguous` | `boolean` | `true` | Require contiguous day selection |
| `initialSelection` | `number[]` | `[]` | Initial selected days (0-6) |
| `className` | `string` | `undefined` | Custom CSS class |

## Animation Timing Configuration

Timing values can be adjusted in `AnimatedScheduleSelector.tsx`:

```typescript
const TIMING = {
  INITIAL_DELAY: 300,              // Delay before animation starts
  EXPAND_DURATION: 800,            // Container expansion duration
  DROP_STAGGER: 100,               // Stagger delay between grid drops
  PATTERN_DISPLAY_DURATION: 1200, // How long each pattern displays
  PATTERN_TRANSITION_DURATION: 300, // Transition between patterns
  COLLAPSE_DURATION: 700,          // Container collapse duration
  SWOOP_STAGGER: 80,               // Stagger delay for grid swoop-up
  POST_COLLAPSE_DELAY: 200,        // Delay after collapse
};
```

Total animation duration: ~6.3 seconds

**Breakdown:**
- Initial delay: 0.3s
- Container expand + grids drop: 0.8s + (3 × 0.1s) = 1.1s
- Pattern cycling: 4 × 1.2s = 4.8s
- Grids swoop + container collapse: 0.7s + (3 × 0.08s) = 0.94s
- Post-collapse: 0.2s

## Animation Patterns

Patterns can be customized in `AnimatedScheduleSelector.tsx`:

```typescript
const ANIMATION_PATTERNS = [
  {
    name: 'Every Week',
    selection: [1, 2, 3, 4, 5] // Mon-Fri
  },
  {
    name: 'Every Other Week',
    selection: [1, 2, 3, 4],
    weeks: [0, 2] // Apply to weeks 1 & 3 only
  },
  {
    name: '2 Weeks On, 2 Weeks Off',
    selection: [0, 1, 2, 3],
    weeks: [0, 1] // Apply to weeks 1 & 2 only
  },
  {
    name: '1 Week On, 3 Weeks Off',
    selection: [4, 5, 6],
    weeks: [0] // Apply to week 1 only
  },
];
```

## Test Page

A comprehensive test page is included at `AnimationTestPage.tsx`:

```bash
npm run dev
```

Then navigate to `http://localhost:3020` (or whatever port is shown)

### Test Page Features

- **Play Button**: Trigger animation manually
- **Status Messages**: Shows animation progress
- **Pattern Descriptions**: Lists all patterns and timing
- **Functionality Test**: After animation, test all selector features
- **Toggle Button**: Switch between test page and original example

## Styled Components

### New Components (v2)

1. **CalendarGrid**
   - Single glass-morphism container
   - CSS Grid layout: `auto repeat(7, 1fr)` columns, `auto repeat(4, 1fr)` rows
   - Backdrop filter blur effect
   - Consistent 8px gap between all elements

2. **DayHeaderButton**
   - Day of week headers (S, M, T, W, T, F, S)
   - Semi-transparent white background
   - Bold, uppercase styling
   - 48px × 48px size

3. **WeekButton**
   - Individual date buttons (28 total)
   - Animated between white and purple gradient states
   - Framer Motion hover/tap effects
   - 48px × 48px size

4. **PatternLabel**
   - Shows current pattern name during animation
   - Positioned below calendar grid
   - White background with purple text
   - Fade in/out transitions

### Removed Components (v2)

- ❌ `AdditionalGrid` - No longer needed (unified grid)
- ❌ `WeekIndicator` - No longer needed (no separate weeks)

## Files

1. **AnimatedScheduleSelector.tsx**
   - Simplified component logic
   - Unified calendar grid rendering
   - Pattern cycling on all 28 buttons simultaneously

2. **AnimatedScheduleSelector.styles.ts**
   - New styled components (CalendarGrid, DayHeaderButton, WeekButton, PatternLabel)
   - Test page styling
   - Reduced complexity

3. **AnimationTestPage.tsx**
   - Comprehensive test page with controls
   - Play button to trigger animation
   - Speed controls and documentation

4. **ANIMATION_README.md** (this file)
   - Complete documentation
   - Usage examples
   - Customization guide

## Implementation Details

### Animation States

```typescript
type AnimationState =
  | 'idle'              // Not animating
  | 'expanding'         // Container expanding, calendar appearing
  | 'showing-patterns'  // Cycling through patterns
  | 'collapsing'        // Container shrinking, calendar disappearing
  | 'complete'          // Animation complete
```

### How It Works (v2 - Simplified)

1. **Single Calendar Grid**: One unified grid with all 35 cells (icon + headers + 28 buttons)
2. **CSS Grid Layout**: Uses native CSS Grid for perfect alignment
3. **Boolean State**: Week selections stored as `boolean[][]` (4 weeks × 7 days)
4. **Unified Container**: One glass-morphism container instead of multiple
5. **Smooth Transitions**: All buttons transition together using CSS
6. **Framer Motion**: Used for button hover/tap effects and pattern label
7. **Container Animation**: Purple container expands/collapses via CSS transitions
8. **Pointer Events**: Disables interaction during animation
9. **State Machine**: Clean state management with useEffect hooks
10. **Cleanup**: Proper timeout cleanup on unmount

### Pattern Application

- Patterns are applied to all 28 buttons simultaneously
- Each week can have different selections (stored as `boolean[7]`)
- Patterns with `weeks` array apply only to specific weeks
- Patterns without `weeks` apply to all 4 weeks
- Smooth color transitions show pattern changes

### Data Structure

```typescript
// Week selections: 4 weeks, 7 days each
const weekSelections: boolean[][] = [
  [false, true, true, true, true, true, false],  // Week 1: Mon-Fri
  [false, false, false, false, false, false, false],  // Week 2: None
  [false, true, true, true, true, true, false],  // Week 3: Mon-Fri
  [false, false, false, false, false, false, false],  // Week 4: None
];
```

## Customization Examples

### Change Animation Speed

```typescript
// Make animation 2x faster
const TIMING = {
  INITIAL_DELAY: 150,
  EXPAND_DURATION: 400,
  PATTERN_DISPLAY_DURATION: 600,
  PATTERN_TRANSITION_DURATION: 200,
  COLLAPSE_DURATION: 400,
  POST_COLLAPSE_DELAY: 150,
};
```

### Add Custom Pattern

```typescript
const ANIMATION_PATTERNS = [
  // ... existing patterns
  {
    name: 'Weekend Warrior',
    selection: [5, 6, 0], // Fri, Sat, Sun
    weeks: [0, 1, 2, 3] // All weeks
  },
];
```

### Change Number of Weeks

```typescript
// Show 3 weeks instead of 4 (adjust the array in render)
{[1, 2].map((weekIndex) => (  // Changed from [1, 2, 3] to [1, 2]
  <motion.div key={`week-${weekIndex}`}>
    {/* ... */}
  </motion.div>
))}
```

### Adjust Grid Spacing

```typescript
// In AnimatedScheduleSelector.styles.ts
export const ExpandableGridContainer = styled.div<...>`
  gap: ${props => props.$isExpanded ? '20px' : '0px'};  // Changed from 12px
  // ...
`;
```

## Production Deployment

### Option 1: Show Once Per Session

```tsx
function App() {
  const [hasSeenAnimation, setHasSeenAnimation] = useState(() => {
    return sessionStorage.getItem('seenAnimation') === 'true';
  });

  const handleAnimationComplete = () => {
    setHasSeenAnimation(true);
    sessionStorage.setItem('seenAnimation', 'true');
  };

  return (
    <AnimatedScheduleSelector
      enableAnimation={!hasSeenAnimation}
      onAnimationComplete={handleAnimationComplete}
      // ... other props
    />
  );
}
```

### Option 2: Only on Landing Page

```tsx
function LandingPage() {
  return (
    <AnimatedScheduleSelector
      enableAnimation={true}
      // ... other props
    />
  );
}

function SearchPage() {
  return (
    <AnimatedScheduleSelector
      enableAnimation={false} // No animation on search page
      // ... other props
    />
  );
}
```

### Option 3: User Preference

```tsx
function App() {
  const [enableAnimations, setEnableAnimations] = useState(true);

  return (
    <>
      <Settings
        enableAnimations={enableAnimations}
        onChange={setEnableAnimations}
      />
      <AnimatedScheduleSelector
        enableAnimation={enableAnimations}
        // ... other props
      />
    </>
  );
}
```

## Browser Compatibility

- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Framer Motion handles browser prefixes automatically
- Gracefully degrades if animations are disabled in browser settings

## Performance

- Lightweight: Only renders 4 selectors during animation
- No performance impact when `enableAnimation={false}`
- Animations use GPU acceleration via `transform` and `opacity`
- Proper cleanup prevents memory leaks

## Troubleshooting

### Animation Not Playing

1. Check that `enableAnimation={true}`
2. Ensure component is mounting fresh (use `key` prop to force re-mount)
3. Check browser console for errors

### Animation Feels Too Fast/Slow

- Adjust timing values in `TIMING` constant
- Recommended total duration: 5-8 seconds

### Selector Not Interactive After Animation

- Verify `onAnimationComplete` callback is firing
- Check that `pointer-events` style is being removed
- Ensure no overlay elements blocking interaction

## Future Enhancements

Potential improvements for future versions:

- [ ] Add animation presets (fast, normal, slow)
- [ ] Support custom pattern arrays from props
- [ ] Add skip animation button
- [ ] Persist animation preference to localStorage
- [ ] Add reduced motion support for accessibility
- [ ] Create Storybook stories
- [ ] Add unit tests for animation states

## Credits

Built with:
- React 18+
- TypeScript
- Framer Motion
- Styled Components

Created for Split Lease schedule visualization.
