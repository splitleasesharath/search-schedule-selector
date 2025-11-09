import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchScheduleSelector } from './SearchScheduleSelector';
import type { SearchScheduleSelectorProps, Day } from './types';
import {
  AnimationContainer,
  PatternLabel,
} from './AnimatedScheduleSelector.styles';

/**
 * Days of the week constant
 */
const DAYS_OF_WEEK: Day[] = [
  { id: '1', singleLetter: 'S', fullName: 'Sunday', index: 0 },
  { id: '2', singleLetter: 'M', fullName: 'Monday', index: 1 },
  { id: '3', singleLetter: 'T', fullName: 'Tuesday', index: 2 },
  { id: '4', singleLetter: 'W', fullName: 'Wednesday', index: 3 },
  { id: '5', singleLetter: 'T', fullName: 'Thursday', index: 4 },
  { id: '6', singleLetter: 'F', fullName: 'Friday', index: 5 },
  { id: '7', singleLetter: 'S', fullName: 'Saturday', index: 6 },
];

/**
 * Animation patterns for the schedule selector
 * Each pattern can have multiple stages to show the progression
 */
const ANIMATION_PATTERNS = [
  // Pattern 1: Every Week (1 stage)
  { name: 'Every Week', selection: [1, 2, 3, 4, 5] }, // Mon-Fri (5 nights)

  // Pattern 2: Every Other Week (2 stages)
  // Stage 1: Show weekdays in rows 2 & 4 (weeks 0 & 2)
  { name: 'Every Other Week - Option A', selection: [1, 2, 3, 4, 5], weeks: [0, 2] }, // Mon-Fri in weeks 1 & 3
  // Stage 2: Show weekdays in rows 3 & 5 (weeks 1 & 3) - the alternate pattern
  { name: 'Every Other Week - Option B', selection: [1, 2, 3, 4, 5], weeks: [1, 3] }, // Mon-Fri in weeks 2 & 4

  // Pattern 3: 2 Weeks On, 2 Weeks Off (2 stages)
  // Stage 1: Show Sun, Mon, Fri, Sat in rows 2 & 3 (weeks 0 & 1)
  { name: '2 Weeks On, 2 Weeks Off - Option A', selection: [0, 1, 5, 6], weeks: [0, 1] }, // Sun, Mon, Fri, Sat in weeks 1 & 2
  // Stage 2: Show Sun, Mon, Fri, Sat in rows 4 & 5 (weeks 2 & 3) - the alternate pattern
  { name: '2 Weeks On, 2 Weeks Off - Option B', selection: [0, 1, 5, 6], weeks: [2, 3] }, // Sun, Mon, Fri, Sat in weeks 3 & 4

  // Pattern 4: 1 Week On, 3 Weeks Off (4 stages - cycle through each week)
  // Only one week is active at a time, showing the rotation
  { name: '1 Week On, 3 Weeks Off - Week 1', selection: [4, 5, 6], weeks: [0] }, // Thu-Sat on week 1
  { name: '1 Week On, 3 Weeks Off - Week 2', selection: [4, 5, 6], weeks: [1] }, // Thu-Sat on week 2
  { name: '1 Week On, 3 Weeks Off - Week 3', selection: [4, 5, 6], weeks: [2] }, // Thu-Sat on week 3
  { name: '1 Week On, 3 Weeks Off - Week 4', selection: [4, 5, 6], weeks: [3] }, // Thu-Sat on week 4
];

/**
 * Animation timing configuration
 */
const TIMING = {
  INITIAL_DELAY: 300,
  EXPAND_DURATION: 800,
  DROP_STAGGER: 100, // Stagger delay between each grid dropping
  PATTERN_DISPLAY_DURATION: 1200,
  PATTERN_TRANSITION_DURATION: 300,
  COLLAPSE_DURATION: 700,
  SWOOP_STAGGER: 80, // Stagger delay for grids swooping back up
  POST_COLLAPSE_DELAY: 200,
};

export interface AnimatedScheduleSelectorProps extends SearchScheduleSelectorProps {
  /** Enable animation on mount (can be disabled for testing) */
  enableAnimation?: boolean;
  /** Callback when animation completes */
  onAnimationComplete?: () => void;
  /** Animation speed multiplier (1 = normal, 0.5 = half speed, 0.25 = quarter speed) */
  animationSpeed?: number;
  /** Step-by-step mode for debugging */
  stepByStepMode?: boolean;
  /** Current step in step-by-step mode (0-13) */
  currentStep?: number;
}

/**
 * AnimatedScheduleSelector - Calendar view with intro animation
 *
 * Animation sequence (14 steps total: 0-13):
 * Step 0: Idle state
 * Step 1: Purple container expands, calendar shows with 7 day headers + 28 date buttons (4 weeks × 7 days)
 * Step 2: Pattern 1 - Every Week (Mon-Fri in all weeks)
 * Step 3-4: Pattern 2 - Every Other Week (2 alternating options):
 *   - Step 3: Weekdays in rows 2&4 (weeks 1&3)
 *   - Step 4: Weekdays in rows 3&5 (weeks 2&4) - shows alternate configuration
 * Step 5-6: Pattern 3 - 2 Weeks On/Off (2 alternating options):
 *   - Step 5: Sun,Mon,Fri,Sat in rows 2&3 (weeks 1&2)
 *   - Step 6: Sun,Mon,Fri,Sat in rows 4&5 (weeks 3&4) - shows alternate configuration
 * Step 7-10: Pattern 4 - 1 Week On, 3 Weeks Off (4 stages: cycle through weeks 1→2→3→4)
 *   - Each step shows Thu-Sat in only one week, demonstrating the rotation
 * Step 11: Container collapses back
 * Step 12: Returns to normal interactive state
 */
export const AnimatedScheduleSelector: React.FC<AnimatedScheduleSelectorProps> = ({
  enableAnimation = false,
  onAnimationComplete,
  animationSpeed = 1,
  stepByStepMode = false,
  currentStep = 0,
  ...selectorProps
}) => {
  const [animationState, setAnimationState] = useState<'idle' | 'expanding' | 'showing-patterns' | 'collapsing' | 'complete'>('idle');
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [weekSelections, setWeekSelections] = useState<boolean[][]>([
    Array(7).fill(false), // Week 1
    Array(7).fill(false), // Week 2
    Array(7).fill(false), // Week 3
    Array(7).fill(false), // Week 4
  ]);
  const [isInteractive, setIsInteractive] = useState(true);

  // Apply speed multiplier to all timing values
  const timing = useMemo(() => ({
    INITIAL_DELAY: TIMING.INITIAL_DELAY / animationSpeed,
    EXPAND_DURATION: TIMING.EXPAND_DURATION / animationSpeed,
    DROP_STAGGER: TIMING.DROP_STAGGER / animationSpeed,
    PATTERN_DISPLAY_DURATION: TIMING.PATTERN_DISPLAY_DURATION / animationSpeed,
    PATTERN_TRANSITION_DURATION: TIMING.PATTERN_TRANSITION_DURATION / animationSpeed,
    COLLAPSE_DURATION: TIMING.COLLAPSE_DURATION / animationSpeed,
    SWOOP_STAGGER: TIMING.SWOOP_STAGGER / animationSpeed,
    POST_COLLAPSE_DELAY: TIMING.POST_COLLAPSE_DELAY / animationSpeed,
  }), [animationSpeed]);

  /**
   * Start the animation sequence
   */
  const startAnimation = useCallback(() => {
    setIsInteractive(false);
    setAnimationState('expanding');
  }, []);

  /**
   * Handle step-by-step mode updates
   */
  useEffect(() => {
    if (!stepByStepMode) return;

    // Map step to animation state
    if (currentStep === 0) {
      setAnimationState('idle');
      setIsInteractive(true);
    } else if (currentStep === 1) {
      setAnimationState('expanding');
      setIsInteractive(false);
    } else if (currentStep >= 2 && currentStep <= 11) {
      setAnimationState('showing-patterns');
      setCurrentPatternIndex(currentStep - 2); // Steps 2-11 -> patterns 0-9
      setIsInteractive(false);
    } else if (currentStep === 12) {
      setAnimationState('collapsing');
      setIsInteractive(false);
    } else if (currentStep === 13) {
      setAnimationState('complete');
      setIsInteractive(true);
      setWeekSelections([
        Array(7).fill(false),
        Array(7).fill(false),
        Array(7).fill(false),
        Array(7).fill(false),
      ]);
    }
  }, [stepByStepMode, currentStep]);

  /**
   * Update week selections when pattern index changes (for step-by-step mode)
   */
  useEffect(() => {
    if (!stepByStepMode || animationState !== 'showing-patterns') return;

    const pattern = ANIMATION_PATTERNS[currentPatternIndex];
    const newSelections = [0, 1, 2, 3].map((weekIndex) => {
      const weekSelection = Array(7).fill(false);
      if (pattern.weeks) {
        // Only apply to specific weeks
        if (pattern.weeks.includes(weekIndex)) {
          pattern.selection.forEach(dayIndex => {
            weekSelection[dayIndex] = true;
          });
        }
      } else {
        // Apply to all weeks
        pattern.selection.forEach(dayIndex => {
          weekSelection[dayIndex] = true;
        });
      }
      return weekSelection;
    });
    setWeekSelections(newSelections);
  }, [stepByStepMode, animationState, currentPatternIndex]);

  /**
   * Animation sequence orchestration (auto-play mode only)
   */
  useEffect(() => {
    if (!enableAnimation || animationState === 'idle' || stepByStepMode) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    switch (animationState) {
      case 'expanding':
        // After expansion and grids drop down, start showing patterns
        const totalDropTime = timing.EXPAND_DURATION + (3 * timing.DROP_STAGGER);
        timeoutId = setTimeout(() => {
          setAnimationState('showing-patterns');
          setCurrentPatternIndex(0);
        }, totalDropTime);
        break;

      case 'showing-patterns':
        // Apply current pattern to appropriate weeks
        const pattern = ANIMATION_PATTERNS[currentPatternIndex];
        const newSelections = [0, 1, 2, 3].map((weekIndex) => {
          const weekSelection = Array(7).fill(false);
          if (pattern.weeks) {
            // Only apply to specific weeks
            if (pattern.weeks.includes(weekIndex)) {
              pattern.selection.forEach(dayIndex => {
                weekSelection[dayIndex] = true;
              });
            }
          } else {
            // Apply to all weeks
            pattern.selection.forEach(dayIndex => {
              weekSelection[dayIndex] = true;
            });
          }
          return weekSelection;
        });
        setWeekSelections(newSelections);

        // Move to next pattern or collapse
        if (currentPatternIndex < ANIMATION_PATTERNS.length - 1) {
          timeoutId = setTimeout(() => {
            setCurrentPatternIndex(prev => prev + 1);
          }, timing.PATTERN_DISPLAY_DURATION);
        } else {
          // All patterns shown, start collapse
          timeoutId = setTimeout(() => {
            setAnimationState('collapsing');
          }, timing.PATTERN_DISPLAY_DURATION);
        }
        break;

      case 'collapsing':
        // After collapse, complete animation
        timeoutId = setTimeout(() => {
          setAnimationState('complete');
          setIsInteractive(true);
          setWeekSelections([
            Array(7).fill(false),
            Array(7).fill(false),
            Array(7).fill(false),
            Array(7).fill(false),
          ]);
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }, timing.COLLAPSE_DURATION + timing.POST_COLLAPSE_DELAY);
        break;
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [animationState, currentPatternIndex, enableAnimation, onAnimationComplete, timing, stepByStepMode]);

  /**
   * Auto-start animation on mount if enabled
   */
  useEffect(() => {
    if (enableAnimation) {
      const timeoutId = setTimeout(() => {
        startAnimation();
      }, timing.INITIAL_DELAY);
      return () => clearTimeout(timeoutId);
    }
  }, [enableAnimation, startAnimation, timing.INITIAL_DELAY]);

  /**
   * Determine if we should show the animated calendar
   */
  const showAnimatedCalendar = animationState === 'expanding' ||
                                animationState === 'showing-patterns' ||
                                animationState === 'collapsing';

  /**
   * Get selection state for a specific button
   */
  const isButtonSelected = (weekIndex: number, dayIndex: number): boolean => {
    return weekSelections[weekIndex]?.[dayIndex] || false;
  };

  return (
    <AnimationContainer>
      {/* The core SearchScheduleSelector - now expands to show calendar grid */}
      <SearchScheduleSelector
        {...selectorProps}
        hideInfoDuringAnimation={showAnimatedCalendar}
        showAnimatedCalendar={showAnimatedCalendar}
        weekSelections={weekSelections}
        isButtonSelected={isButtonSelected}
      />

      {/* Pattern label - shown during pattern animation */}
      <AnimatePresence>
        {animationState === 'showing-patterns' && (
          <PatternLabel
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            Pattern: {ANIMATION_PATTERNS[currentPatternIndex].name}
          </PatternLabel>
        )}
      </AnimatePresence>
    </AnimationContainer>
  );
};

export default AnimatedScheduleSelector;
