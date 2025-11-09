import React, { useState, useRef } from 'react';
import { AnimatedScheduleSelector } from './AnimatedScheduleSelector';
import type { Day } from './types';
import {
  TestContainer,
  TestHeader,
  ControlPanel,
  PlayButton,
  ToggleContainer,
  ToggleLabel,
  ToggleSwitch,
  StatusMessage,
} from './AnimatedScheduleSelector.styles';

/**
 * Test page for the AnimatedScheduleSelector
 * Provides controls to test the animation with a Play button
 */
export const AnimationTestPage: React.FC = () => {
  const [selectedDays, setSelectedDays] = useState<Day[]>([]);
  const [enableAnimation, setEnableAnimation] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState<1 | 0.5 | 0.25>(1);

  /**
   * Play the animation
   */
  const handlePlayAnimation = () => {
    setIsAnimating(true);
    setShowStatus(true);
    // Force re-mount by changing key, but enable animation
    setEnableAnimation(true);
    setAnimationKey(prev => prev + 1);
  };

  /**
   * Handle animation completion
   */
  const handleAnimationComplete = () => {
    setIsAnimating(false);
    setEnableAnimation(false);
    setTimeout(() => {
      setShowStatus(false);
    }, 2000);
  };

  /**
   * Handle selection change
   */
  const handleSelectionChange = (days: Day[]) => {
    console.log('Selected days:', days);
    setSelectedDays(days);
  };

  /**
   * Handle errors
   */
  const handleError = (error: string) => {
    console.error('Selection error:', error);
  };

  return (
    <TestContainer>
      <TestHeader>
        <h1>🎬 Animated Schedule Selector Test</h1>
        <p>
          Test the intro animation that showcases different weekly patterns.
          Click the Play button to see the animation sequence.
        </p>
      </TestHeader>

      <ControlPanel>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <PlayButton
            onClick={handlePlayAnimation}
            disabled={isAnimating}
            whileHover={{ scale: isAnimating ? 1 : 1.05 }}
            whileTap={{ scale: isAnimating ? 1 : 0.95 }}
          >
            {isAnimating ? (
              <>
                <span>▶️</span>
                <span>Animation Playing...</span>
              </>
            ) : (
              <>
                <span>▶️</span>
                <span>Play Animation</span>
              </>
            )}
          </PlayButton>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#666' }}>Speed:</span>
            <button
              onClick={() => setAnimationSpeed(1)}
              disabled={isAnimating}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '8px',
                cursor: isAnimating ? 'not-allowed' : 'pointer',
                background: animationSpeed === 1 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e0e0e0',
                color: animationSpeed === 1 ? '#ffffff' : '#666',
                opacity: isAnimating ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              1x
            </button>
            <button
              onClick={() => setAnimationSpeed(0.5)}
              disabled={isAnimating}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '8px',
                cursor: isAnimating ? 'not-allowed' : 'pointer',
                background: animationSpeed === 0.5 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e0e0e0',
                color: animationSpeed === 0.5 ? '#ffffff' : '#666',
                opacity: isAnimating ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              1/2x
            </button>
            <button
              onClick={() => setAnimationSpeed(0.25)}
              disabled={isAnimating}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 600,
                border: 'none',
                borderRadius: '8px',
                cursor: isAnimating ? 'not-allowed' : 'pointer',
                background: animationSpeed === 0.25 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e0e0e0',
                color: animationSpeed === 0.25 ? '#ffffff' : '#666',
                opacity: isAnimating ? 0.5 : 1,
                transition: 'all 0.2s ease',
              }}
            >
              1/4x
            </button>
          </div>
        </div>

        {showStatus && (
          <StatusMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {isAnimating
              ? '🎥 Animation in progress - Watch the schedule patterns!'
              : '✅ Animation complete - Selector is now interactive!'}
          </StatusMessage>
        )}
      </ControlPanel>

      <AnimatedScheduleSelector
        key={animationKey}
        enableAnimation={enableAnimation}
        onAnimationComplete={handleAnimationComplete}
        onSelectionChange={handleSelectionChange}
        onError={handleError}
        minDays={3}
        requireContiguous={true}
        animationSpeed={animationSpeed}
      />

      {selectedDays.length > 0 && (
        <div
          style={{
            marginTop: '30px',
            padding: '20px',
            background: '#f5f5f5',
            borderRadius: '12px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Selected Schedule:</h3>
          <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
            <strong>Days:</strong> {selectedDays.map(d => d.fullName).join(', ')}
          </p>
          <p style={{ fontSize: '16px', lineHeight: '1.6' }}>
            <strong>Total Nights:</strong> {selectedDays.length - 1} per week
          </p>
        </div>
      )}

      <div
        style={{
          marginTop: '40px',
          padding: '20px',
          background: '#fff3e0',
          borderRadius: '12px',
          borderLeft: '4px solid #ff9800',
        }}
      >
        <h3 style={{ marginTop: 0, color: '#e65100' }}>Animation Sequence:</h3>
        <ol style={{ lineHeight: '1.8', color: '#555' }}>
          <li>
            <strong>Container Expands (0.8s):</strong> The main container expands vertically to
            prepare space for additional grids
          </li>
          <li>
            <strong>Grids Drop Down (0.3s each):</strong> 3 additional day grids drop down from
            the original with a staggered effect, representing weeks 2, 3, and 4
          </li>
          <li>
            <strong>Pattern: Every Week (1.2s):</strong> All 4 week grids show Monday-Friday
            selected
          </li>
          <li>
            <strong>Pattern: Every Other Week (1.2s):</strong> Weeks 1 & 3 show Monday-Thursday
            selected
          </li>
          <li>
            <strong>Pattern: 2 Weeks On, 2 Off (1.2s):</strong> Weeks 1 & 2 show
            Sunday-Wednesday selected
          </li>
          <li>
            <strong>Pattern: 1 Week On, 3 Off (1.2s):</strong> Only Week 1 shows
            Thursday-Saturday selected
          </li>
          <li>
            <strong>Grids Swoop Up (0.3s each):</strong> The 3 additional grids swoop back up
            into the original in reverse order
          </li>
          <li>
            <strong>Container Shrinks (0.7s):</strong> Container returns to its original size,
            leaving a single interactive selector
          </li>
        </ol>
        <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
          <strong>Technical Note:</strong> Only the day selection grids are duplicated during
          animation. The calendar icon and info section remain singular. The selector is
          non-interactive during animation to prevent conflicts. After completion, full
          functionality is restored.
        </p>
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '20px',
          background: '#e8f5e9',
          borderRadius: '12px',
          borderLeft: '4px solid #4caf50',
        }}
      >
        <h3 style={{ marginTop: 0, color: '#2e7d32' }}>How to Use:</h3>
        <ul style={{ lineHeight: '1.8', color: '#555' }}>
          <li>
            <strong>Click "Play Animation"</strong> to trigger the intro sequence
          </li>
          <li>
            <strong>Watch the patterns:</strong> The animation cycles through different weekly
            schedules
          </li>
          <li>
            <strong>After animation:</strong> The selector becomes fully interactive for your
            own selections
          </li>
          <li>
            <strong>Test functionality:</strong> Click/drag days to ensure everything works
            after animation
          </li>
        </ul>
      </div>
    </TestContainer>
  );
};

export default AnimationTestPage;
