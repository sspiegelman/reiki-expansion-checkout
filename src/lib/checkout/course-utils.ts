/**
 * Utility functions for course-related checkout page logic
 */

import { COURSES, BUNDLE_PRICE } from '@/config/courses';
import { isClassPast, isClassToday, isAfterCourse } from './date-utils';

// Price for recordings after the class has passed
export const RECORDING_PRICE = 7500; // $75.00

/**
 * Gets the price for a class based on whether it has passed or not
 * If the class has passed, it returns the recording price
 * Otherwise, it returns the original price
 */
export function getClassPrice(classIndex: number): number {
  return isClassPast(classIndex) ? RECORDING_PRICE : COURSES[classIndex].price;
}

/**
 * Gets the status of a class: 'upcoming', 'live-today', or 'past'
 */
export function getClassStatus(classIndex: number): 'upcoming' | 'live-today' | 'past' {
  if (isClassPast(classIndex)) {
    return 'past';
  }
  
  if (isClassToday(classIndex)) {
    return 'live-today';
  }
  
  return 'upcoming';
}

/**
 * Gets the appropriate label for a class based on its status
 */
export function getClassLabel(classIndex: number): string {
  const status = getClassStatus(classIndex);
  
  switch (status) {
    case 'upcoming':
      return 'Join Live';
    case 'live-today':
      return 'Join Live Today!';
    case 'past':
      return 'Recording Available';
  }
}
