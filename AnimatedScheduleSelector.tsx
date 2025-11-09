import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SearchScheduleSelector } from './SearchScheduleSelector';
import type { SearchScheduleSelectorProps, Day } from './types';
import {
  AnimationContainer,
  ExpandableGridContainer,
  AdditionalGrid,
  WeekIndicator,
} from './AnimatedScheduleSelector.styles';

/**
 * Days of the week constant - needed for rendering additional grids
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
}

/**
 * AnimatedScheduleSelector - Wraps SearchScheduleSelector with an intro animation
 *
 * Animation sequence:
 * 1. Container expands vertically
 * 2. 3 additional DaysGrids drop down from the original
 * 3. Cycles through different weekly patterns on all 4 grids
 * 4. 3 additional grids swoop back up into the original
 * 5. Container shrinks to original size
 * 6. Enables full interactivity
 */
export const AnimatedScheduleSelector: React.FC<AnimatedScheduleSelectorProps> = ({
  enableAnimation = false,
  onAnimationComplete,
  animationSpeed = 1,
  ...selectorProps
}) => {
  const [animationState, setAnimationState] = useState<'idle' | 'expanding' | 'showing-patterns' | 'collapsing' | 'complete'>('idle');
  const [currentPatternIndex, setCurrentPatternIndex] = useState(0);
  const [weekSelections, setWeekSelections] = useState<number[][]>([[], [], [], []]);
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
   * Animation sequence orchestration
   */
  useEffect(() => {
    if (!enableAnimation || animationState === 'idle') return;

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
        const newSelections = [[], [], [], []].map((_, weekIndex) => {
          if (pattern.weeks) {
            return pattern.weeks.includes(weekIndex) ? pattern.selection : [];
          }
          return pattern.selection;
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
        const totalSwoopTime = timing.COLLAPSE_DURATION + (3 * timing.SWOOP_STAGGER);
        timeoutId = setTimeout(() => {
          setAnimationState('complete');
          setIsInteractive(true);
          setWeekSelections([[], [], [], []]);
          if (onAnimationComplete) {
            onAnimationComplete();
          }
        }, totalSwoopTime + timing.POST_COLLAPSE_DELAY);
        break;
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [animationState, currentPatternIndex, enableAnimation, onAnimationComplete, timing]);

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
   * Determine if we should show additional grids
   */
  const showAdditionalGrids = animationState === 'expanding' ||
                               animationState === 'showing-patterns' ||
                               animationState === 'collapsing';

  /**
   * Get selection state for a specific day in a specific week
   */
  const isDaySelected = (weekIndex: number, dayIndex: number): boolean => {
    return weekSelections[weekIndex]?.includes(dayIndex) || false;
  };

  /**
   * Animation variants for additional grids (drop down from original)
   */
  const gridVariants = useMemo(() => ({
    hidden: {
      opacity: 0,
      y: -40,
      scale: 0.95,
    },
    visible: (weekIndex: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4 / animationSpeed,
        delay: weekIndex * (timing.DROP_STAGGER / 1000),
        ease: 'easeOut',
      },
    }),
    exit: (weekIndex: number) => ({
      opacity: 0,
      y: -40,
      scale: 0.95,
      transition: {
        duration: 0.3 / animationSpeed,
        delay: (2 - weekIndex) * (timing.SWOOP_STAGGER / 1000), // Reverse order for swoop up
        ease: 'easeIn',
      },
    }),
  }), [animationSpeed, timing.DROP_STAGGER, timing.SWOOP_STAGGER]);

  return (
    <AnimationContainer>
      <ExpandableGridContainer
        $isExpanded={showAdditionalGrids}
        $expandDuration={timing.EXPAND_DURATION / 1000}
        $collapseDuration={timing.COLLAPSE_DURATION / 1000}
        style={{ pointerEvents: isInteractive ? 'auto' : 'none' }}
      >
        {/* Main SearchScheduleSelector - always visible */}
        <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '12px' }}>
          {showAdditionalGrids && (
            <WeekIndicator
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              Week 1
            </WeekIndicator>
          )}
          <div style={{ flex: 1 }}>
            <SearchScheduleSelector
              {...selectorProps}
              initialSelection={weekSelections[0]}
              key={`main-selector-${weekSelections[0].join(',')}`}
              hideInfoDuringAnimation={showAdditionalGrids}
            />
          </div>
        </div>

        {/* Additional DaysGrids (3 more) - only during animation */}
        <AnimatePresence mode="sync">
          {showAdditionalGrids && (
            <>
              {[1, 2, 3].map((weekIndex) => (
                <motion.div
                  key={`week-${weekIndex}`}
                  custom={weekIndex - 1}
                  variants={gridVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  style={{ position: 'relative' }}
                >
                  <AdditionalGrid>
                    <WeekIndicator>
                      Week {weekIndex + 1}
                    </WeekIndicator>
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                    }}>
                      <div style={{ fontSize: '32px', flexShrink: 0 }}>📅</div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        gap: '8px',
                        padding: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        flex: 1,
                      }}>
                        {DAYS_OF_WEEK.map((day, dayIndex) => (
                          <motion.button
                            key={day.id}
                            style={{
                              width: '48px',
                              height: '48px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 600,
                              fontSize: '16px',
                              border: 'none',
                              borderRadius: '12px',
                              cursor: 'default',
                              background: isDaySelected(weekIndex, dayIndex)
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'rgba(255, 255, 255, 0.9)',
                              color: isDaySelected(weekIndex, dayIndex) ? '#ffffff' : '#333333',
                              boxShadow: isDaySelected(weekIndex, dayIndex)
                                ? '0 4px 12px rgba(102, 126, 234, 0.4)'
                                : '0 2px 8px rgba(0, 0, 0, 0.1)',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                            whileHover={{ scale: 1.02 }}
                            aria-label={`Week ${weekIndex + 1} - ${day.fullName}`}
                          >
                            {day.singleLetter}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </AdditionalGrid>
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Check-in/Checkout and Weekly Pattern - shown below all grids during animation */}
        {showAdditionalGrids && animationState === 'showing-patterns' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#667eea', marginBottom: '4px' }}>
              Pattern: {ANIMATION_PATTERNS[currentPatternIndex].name}
            </div>
          </motion.div>
        )}
      </ExpandableGridContainer>
    </AnimationContainer>
  );
};

export default AnimatedScheduleSelector;
