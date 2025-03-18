/**
 * Utility functions for date-based checkout page logic
 */
import { COURSES } from '@/config/courses';

// Define dates in a timezone-safe way
export const COURSE_DATES = {
  START_DATE: new Date('2025-03-18T00:00:00.000-04:00'), // Eastern Time
  END_DATE: new Date('2025-04-01T23:59:59.000-04:00'), // Eastern Time
  CLASS_DATES: [
    new Date('2025-03-18T00:00:00.000-04:00'), // Class 1 - Eastern Time
    new Date('2025-03-20T00:00:00.000-04:00'), // Class 2 - Eastern Time
    new Date('2025-03-25T00:00:00.000-04:00'), // Class 3 - Eastern Time
    new Date('2025-03-27T00:00:00.000-04:00'), // Class 4 - Eastern Time
    new Date('2025-04-01T00:00:00.000-04:00'), // Class 5 - Eastern Time
  ]
};

/**
 * Checks if the current date is before the course starts
 */
export function isBeforeCourse(): boolean {
  return new Date() < COURSE_DATES.START_DATE;
}

/**
 * Checks if the current date is during the course
 */
export function isDuringCourse(): boolean {
  const now = new Date();
  return now >= COURSE_DATES.START_DATE && now <= COURSE_DATES.END_DATE;
}

/**
 * Checks if the current date is after the course ends
 */
export function isAfterCourse(): boolean {
  return new Date() > COURSE_DATES.END_DATE;
}

/**
 * Gets the index of the current or next upcoming class
 * Returns -1 if all classes have passed
 */
export function getCurrentClassIndex(): number {
  const now = new Date();
  
  // If before course, return first class
  if (now < COURSE_DATES.CLASS_DATES[0]) {
    return 0;
  }
  
  // If after all classes, return -1
  if (now > COURSE_DATES.CLASS_DATES[COURSE_DATES.CLASS_DATES.length - 1]) {
    return -1;
  }
  
  // Find the next upcoming class
  for (let i = 0; i < COURSE_DATES.CLASS_DATES.length; i++) {
    if (now <= COURSE_DATES.CLASS_DATES[i]) {
      return i;
    }
  }
  
  return -1; // After all classes
}

/**
 * Gets the URL for the next class page
 */
export function getNextClassPage(): string {
  const currentIndex = getCurrentClassIndex();
  
  if (currentIndex === -1) {
    // After all classes, go to closed page
    return '/checkout/closed';
  }
  
  return `/checkout/live/class-${currentIndex + 1}`;
}

/**
 * Checks if a specific class has already passed
 */
export function isClassPast(classIndex: number): boolean {
  return new Date() > COURSE_DATES.CLASS_DATES[classIndex];
}

/**
 * Helper function to get the date string in YYYY-MM-DD format
 * This normalizes dates to compare them without time or timezone issues
 */
function getDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Helper function to create a date from a month-day string with the current year
 */
function createDateFromMonthDay(monthDayString: string): Date {
  const currentYear = new Date().getFullYear();
  return new Date(`${monthDayString}, ${currentYear}`);
}

/**
 * Checks if a specific class is happening today
 */
export function isClassToday(classIndex: number): boolean {
  // Get today's date string in Eastern Time
  const now = new Date();
  const todayString = getDateString(now);
  
  // Get class date string with current year
  const classDateStr = COURSES[classIndex].date;
  const classDate = createDateFromMonthDay(classDateStr);
  const classDateString = getDateString(classDate);
  
  return todayString === classDateString;
}

/**
 * Checks if a specific class is happening tomorrow
 */
export function isClassTomorrow(classIndex: number): boolean {
  // Get current date and add one day
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowString = getDateString(tomorrow);
  
  // Get class date string with current year
  const classDateStr = COURSES[classIndex].date;
  const classDate = createDateFromMonthDay(classDateStr);
  const classDateString = getDateString(classDate);
  
  return tomorrowString === classDateString;
}
