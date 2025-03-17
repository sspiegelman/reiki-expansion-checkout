/**
 * Utility functions for date-based checkout page logic
 */

export const COURSE_DATES = {
  START_DATE: new Date('2025-03-18'),
  END_DATE: new Date('2025-04-01'),
  CLASS_DATES: [
    new Date('2025-03-18'), // Class 1
    new Date('2025-03-20'), // Class 2
    new Date('2025-03-25'), // Class 3
    new Date('2025-03-27'), // Class 4
    new Date('2025-04-01'), // Class 5
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
 * Checks if a specific class is happening today
 */
export function isClassToday(classIndex: number): boolean {
  const now = new Date();
  const classDate = COURSE_DATES.CLASS_DATES[classIndex];
  
  return now.getDate() === classDate.getDate() && 
         now.getMonth() === classDate.getMonth() && 
         now.getFullYear() === classDate.getFullYear();
}
