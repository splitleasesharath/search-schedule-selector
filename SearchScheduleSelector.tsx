import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Container,
  SelectorRow,
  CalendarIcon,
  DaysGrid,
  DayCell,
  InfoContainer,
  InfoText,
  ResetButton,
  ErrorPopup,
  ErrorIcon,
  ErrorMessage,
} from './SearchScheduleSelector.styles';
import type {
  Day,
  SearchScheduleSelectorProps,
  ValidationResult,
} from './types';

/**
 * Days of the week constant - Starting with Sunday (S, M, T, W, T, F, S)
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
 * SearchScheduleSelector Component
 *
 * A weekly schedule selector for split-lease arrangements.
 * Allows users to select 2-5 contiguous nights per week.
 *
 * @example
 * ```tsx
 * <SearchScheduleSelector
 *   onSelectionChange={(days) => console.log(days)}
 *   onError={(error) => console.error(error)}
 * />
 * ```
 */
export const SearchScheduleSelector: React.FC<SearchScheduleSelectorProps> = ({
  listing,
  onSelectionChange,
  onError,
  className,
  minDays = 2,
  maxDays = 5,
  requireContiguous = true,
  initialSelection = [],
}) => {
  const [selectedDays, setSelectedDays] = useState<Set<number>>(
    new Set(initialSelection)
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [listingsCountPartial, setListingsCountPartial] = useState(0);
  const [listingsCountExact, setListingsCountExact] = useState(0);
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);

  /**
   * Check if selected days are contiguous (handles wrap-around)
   * Example: [5, 6, 0, 1, 2] (Fri, Sat, Sun, Mon, Tue) is contiguous
   */
  const isContiguous = useCallback((days: Set<number>): boolean => {
    if (days.size === 0) return true;

    const daysArray = Array.from(days).sort((a, b) => a - b);

    // Check for normal contiguity (no wrap-around)
    let isNormalContiguous = true;
    for (let i = 1; i < daysArray.length; i++) {
      if (daysArray[i] - daysArray[i - 1] !== 1) {
        isNormalContiguous = false;
        break;
      }
    }

    if (isNormalContiguous) return true;

    // Check for wrap-around contiguity
    // If it wraps, the pattern will be: high numbers (5,6) then low numbers (0,1,2)
    // Find the gap in the sequence
    let gapIndex = -1;
    for (let i = 1; i < daysArray.length; i++) {
      if (daysArray[i] - daysArray[i - 1] > 1) {
        if (gapIndex !== -1) {
          // More than one gap means not contiguous
          return false;
        }
        gapIndex = i;
      }
    }

    // If there's exactly one gap, check if it wraps around (6 -> 0)
    if (gapIndex !== -1) {
      // The gap should be between 6 and 0
      const beforeGap = daysArray[gapIndex - 1];
      const afterGap = daysArray[gapIndex];

      // Check if last element is 6 and first element is 0
      const lastElement = daysArray[daysArray.length - 1];
      const firstElement = daysArray[0];

      // Wrap-around is valid if: last day is 6 (Saturday) and first day is 0 (Sunday)
      if (lastElement === 6 && firstElement === 0) {
        return true;
      }
    }

    return false;
  }, []);

  /**
   * Validate the current selection
   */
  const validateSelection = useCallback(
    (days: Set<number>): ValidationResult => {
      const count = days.size;

      if (count === 0) {
        return { valid: true };
      }

      if (count < minDays) {
        return {
          valid: false,
          error: `Please select at least ${minDays} night${minDays > 1 ? 's' : ''} per week`,
        };
      }

      if (count > maxDays) {
        return {
          valid: false,
          error: `Please select no more than ${maxDays} night${maxDays > 1 ? 's' : ''} per week`,
        };
      }

      if (requireContiguous && !isContiguous(days)) {
        return {
          valid: false,
          error: 'Please select contiguous days (e.g., Mon-Tue-Wed, not Mon-Wed-Fri)',
        };
      }

      return { valid: true };
    },
    [minDays, maxDays, requireContiguous, isContiguous]
  );

  /**
   * Display error message
   */
  const displayError = useCallback(
    (error: string) => {
      setErrorMessage(error);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);

      if (onError) {
        onError(error);
      }
    },
    [onError]
  );

  /**
   * Trigger validation after inactivity
   */
  const scheduleValidation = useCallback(() => {
    // Clear existing timeout
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    // Schedule new validation after 3 seconds
    const timeout = setTimeout(() => {
      if (selectedDays.size > 0) {
        const validation = validateSelection(selectedDays);
        if (!validation.valid && validation.error) {
          displayError(validation.error);
        }
      }
    }, 3000);

    setValidationTimeout(timeout);
  }, [validationTimeout, selectedDays, validateSelection, displayError]);

  /**
   * Handle day click - Simple toggle mode for day-by-day selection
   */
  const handleDayClick = useCallback(
    (dayIndex: number, event: React.MouseEvent) => {
      // Prevent click during drag
      if (isDragging) {
        return;
      }

      setSelectedDays(prev => {
        const newSelection = new Set(prev);

        // Simple toggle: if selected, remove it; if not selected, add it
        if (newSelection.has(dayIndex)) {
          newSelection.delete(dayIndex);
        } else {
          newSelection.add(dayIndex);
        }

        return newSelection;
      });

      // Schedule validation for 3 seconds later
      scheduleValidation();
    },
    [isDragging, scheduleValidation]
  );

  /**
   * Handle drag start - clears selection and starts fresh
   */
  const handleDragStart = useCallback((dayIndex: number) => {
    setIsDragging(true);
    setDragStart(dayIndex);
    const newSelection = new Set<number>();
    newSelection.add(dayIndex);
    setSelectedDays(newSelection);
  }, []);

  /**
   * Handle drag over - fills range with wrap-around support
   */
  const handleDragOver = useCallback(
    (dayIndex: number) => {
      if (!isDragging || dragStart === null) return;

      const newSelection = new Set<number>();
      const totalDays = 7;

      // Calculate range with wrap-around
      let dayCount;
      if (dayIndex >= dragStart) {
        // Normal range
        dayCount = dayIndex - dragStart + 1;
      } else {
        // Wrap-around range
        dayCount = (totalDays - dragStart) + dayIndex + 1;
      }

      // Fill all days in range
      for (let i = 0; i < dayCount; i++) {
        const currentDay = (dragStart + i) % totalDays;
        newSelection.add(currentDay);
      }

      setSelectedDays(newSelection);
    },
    [isDragging, dragStart]
  );

  /**
   * Handle drag end - validate and schedule error if needed
   */
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);

    // Validate immediately on drag end
    if (selectedDays.size > 0) {
      const validation = validateSelection(selectedDays);
      if (!validation.valid && validation.error) {
        displayError(validation.error);
        setSelectedDays(new Set());
      }
    }
  }, [selectedDays, validateSelection, displayError]);

  /**
   * Handle reset - clear all selections
   */
  const handleReset = useCallback(() => {
    setSelectedDays(new Set());
    if (validationTimeout) {
      clearTimeout(validationTimeout);
      setValidationTimeout(null);
    }
  }, [validationTimeout]);

  /**
   * Update parent component on selection change
   */
  useEffect(() => {
    if (onSelectionChange) {
      const selectedDaysArray = Array.from(selectedDays).map(
        index => DAYS_OF_WEEK[index]
      );
      onSelectionChange(selectedDaysArray);
    }
  }, [selectedDays, onSelectionChange]);

  /**
   * Mock function for counting listings
   * Replace with actual API call in production
   */
  useEffect(() => {
    if (selectedDays.size > 0) {
      // TODO: Replace with actual API call
      // Example: fetchListingCounts(Array.from(selectedDays))
      setListingsCountPartial(Math.floor(Math.random() * 20));
      setListingsCountExact(Math.floor(Math.random() * 10));
    } else {
      setListingsCountPartial(0);
      setListingsCountExact(0);
    }
  }, [selectedDays]);

  return (
    <Container className={className}>
      <SelectorRow>
        <CalendarIcon>📅</CalendarIcon>

        <DaysGrid>
          {DAYS_OF_WEEK.map((day, index) => (
            <DayCell
              key={day.id}
              $isSelected={selectedDays.has(index)}
              $isDragging={isDragging}
              onMouseDown={(e) => {
                e.preventDefault();
                handleDragStart(index);
              }}
              onMouseEnter={() => handleDragOver(index)}
              onMouseUp={handleDragEnd}
              onClick={(e) => handleDayClick(index, e)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.2 }}
              role="button"
              aria-pressed={selectedDays.has(index)}
              aria-label={`Select ${day.fullName}`}
            >
              {day.singleLetter}
            </DayCell>
          ))}
        </DaysGrid>
      </SelectorRow>

      <InfoContainer>
        {selectedDays.size > 0 && (
          <>
            <InfoText>
              {listingsCountExact} exact match{listingsCountExact !== 1 ? 'es' : ''} • {listingsCountPartial} partial match{listingsCountPartial !== 1 ? 'es' : ''}
            </InfoText>
            <ResetButton onClick={handleReset}>Clear selection</ResetButton>
          </>
        )}
      </InfoContainer>

      <AnimatePresence>
        {showError && (
          <ErrorPopup
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ErrorIcon>⚠️</ErrorIcon>
            <ErrorMessage>{errorMessage}</ErrorMessage>
          </ErrorPopup>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default SearchScheduleSelector;
