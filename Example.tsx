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
            <strong>Total Nights:</strong> {selectedDays.length} per week
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
          <li>Click individual days to select/deselect</li>
          <li>Click and drag across days to select a range</li>
          <li>Select 2-5 contiguous nights per week</li>
          <li>Days must be consecutive (e.g., Mon-Tue-Wed)</li>
        </ul>
      </div>
    </div>
  );
};

export default SearchScheduleSelectorExample;
