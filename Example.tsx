import React, { useState } from 'react';
import { SearchScheduleSelector } from './SearchScheduleSelector';
import type { Day } from './types';

/**
 * Example usage of the SearchScheduleSelector component
 */
export const SearchScheduleSelectorExample: React.FC = () => {
  const [selectedDays, setSelectedDays] = useState<Day[]>([]);
  const [lastError, setLastError] = useState<string>('');

  const handleSelectionChange = (days: Day[]) => {
    console.log('Selected days:', days);
    setSelectedDays(days);
    setLastError(''); // Clear error on successful selection
  };

  const handleError = (error: string) => {
    console.error('Selection error:', error);
    setLastError(error);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        Find Your Perfect Split Lease
      </h1>

      <SearchScheduleSelector
        onSelectionChange={handleSelectionChange}
        onError={handleError}
        minDays={2}
        maxDays={5}
        requireContiguous={true}
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
          <p style={{ fontSize: '14px', color: '#666', marginTop: '8px' }}>
            (Check-out day doesn't count as a night)
          </p>
        </div>
      )}

      {lastError && (
        <div
          style={{
            marginTop: '20px',
            padding: '15px',
            background: '#ffebee',
            color: '#c62828',
            borderRadius: '8px',
            borderLeft: '4px solid #c62828',
          }}
        >
          {lastError}
        </div>
      )}

      <div
        style={{
          marginTop: '40px',
          padding: '20px',
          background: '#e3f2fd',
          borderRadius: '12px',
        }}
      >
        <h3 style={{ marginTop: 0 }}>How to use:</h3>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>Click to toggle:</strong> Click any day to select/deselect it. Build your schedule one click at a time!</li>
          <li><strong>Drag to auto-fill:</strong> Click and drag from check-in to check-out day to auto-fill the entire range (e.g., drag Friday to Tuesday for Fri-Sat-Sun-Mon-Tue)</li>
          <li><strong>Validation:</strong> Errors only appear 3 seconds after you stop selecting, giving you time to complete your schedule</li>
          <li><strong>Reset:</strong> Click "Clear selection" to start over anytime</li>
          <li><strong>Requirements:</strong> Select 2-5 contiguous nights per week</li>
          <li><strong>Note:</strong> Check-out day doesn't count as a night</li>
        </ul>
      </div>
    </div>
  );
};

export default SearchScheduleSelectorExample;
