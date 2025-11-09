import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchScheduleSelector } from './SearchScheduleSelector';
import type { SearchScheduleSelectorProps, Day } from './types';
import {
  AnimationContainer,
  ExpandableGridContainer,
  CalendarGrid,
  DayHeaderButton,
  WeekButton,
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
 */
const ANIMATION_PATTERNS = [
  { name: 'Every Week', selection: [1, 2, 3, 4, 5] }, // Mon-Fri (5 nights)
  { name: 'Every Other Week', selection: [1, 2, 3, 4], weeks: [0, 2] }, // Mon-Thu on weeks 1 & 3
  { name: '2 Weeks On, 2 Weeks Off', selection: [0, 1, 2, 3], weeks: [0, 1] }, // Sun-Wed on weeks 1 & 2
  { name: '1 Week On, 3 Weeks Off', selection: [4, 5, 6], weeks: [0] }, // Thu-Sat on week 1 only
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
  /** Current step in step-by-step mode (0-7) */
  currentStep?: number;
}

/**
 * AnimatedScheduleSelector - Calendar view with intro animation
 *
 * Animation sequence:
 * 1. Purple container expands
 * 2. Calendar shows with 7 day headers + 28 date buttons (4 weeks × 7 days)
 * 3. Cycles through different weekly patterns
 * 4. Container collapses back
 * 5. Returns to normal interactive state
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
    } else if (currentStep >= 2 && currentStep <= 5) {
      setAnimationState('showing-patterns');
      setCurrentPatternIndex(currentStep - 2); // Steps 2-5 -> patterns 0-3
      setIsInteractive(false);
    } else if (currentStep === 6) {
      setAnimationState('collapsing');
      setIsInteractive(false);
    } else if (currentStep === 7) {
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
      {/* The core SearchScheduleSelector - ALWAYS VISIBLE */}
      <SearchScheduleSelector
        {...selectorProps}
        hideInfoDuringAnimation={showAnimatedCalendar}
      />

      {/* Animation overlay - expands from and collapses into selector */}
      <AnimatePresence>
        {showAnimatedCalendar && (
          <ExpandableGridContainer
            $isExpanded={showAnimatedCalendar}
            $expandDuration={timing.EXPAND_DURATION / 1000}
            $collapseDuration={timing.COLLAPSE_DURATION / 1000}
            style={{ pointerEvents: 'none' }}
            initial={{
              scaleY: 0.1,
              opacity: 0,
              transformOrigin: 'center center'
            }}
            animate={{
              scaleY: animationState === 'collapsing' ? 0.1 : 1,
              opacity: animationState === 'collapsing' ? 0 : 1,
              transformOrigin: 'center center'
            }}
            exit={{
              scaleY: 0.1,
              opacity: 0,
              transformOrigin: 'center center'
            }}
            transition={{
              duration: animationState === 'collapsing' ? timing.COLLAPSE_DURATION / 1000 : timing.EXPAND_DURATION / 1000,
              ease: 'easeInOut'
            }}
          >
            <CalendarGrid $isVisible={showAnimatedCalendar}>
              {/* Calendar icon */}
              <div style={{
                fontSize: '32px',
                gridColumn: '1 / 2',
                gridRow: '1 / 6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                📅
              </div>

              {/* Day headers - S, M, T, W, T, F, S */}
              {DAYS_OF_WEEK.map((day, index) => (
                <DayHeaderButton key={`header-${day.id}`}>
                  {day.singleLetter}
                </DayHeaderButton>
              ))}

              {/* Week buttons - 4 weeks × 7 days = 28 buttons */}
              {[0, 1, 2, 3].map((weekIndex) => (
                DAYS_OF_WEEK.map((day, dayIndex) => (
                  <WeekButton
                    key={`week-${weekIndex}-day-${dayIndex}`}
                    $isSelected={isButtonSelected(weekIndex, dayIndex)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {day.singleLetter}
                  </WeekButton>
                ))
              ))}
            </CalendarGrid>

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
          </ExpandableGridContainer>
        )}
      </AnimatePresence>
    </AnimationContainer>
  );
};

export default AnimatedScheduleSelector;
