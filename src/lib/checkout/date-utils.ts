/**
 * Utility functions for date-based checkout page logic
 */
import { COURSES } from '@/config/courses';

// Define dates in UTC for consistent timezone handling across server and client
// All times are converted from Eastern Time (ET) to UTC
// During EDT (Mar-Nov): ET+4=UTC, During EST (Nov-Mar): ET+5=UTC
export const COURSE_DATES = {
  START_DATE: new Date('2025-03-18T04:00:00.000Z'), // Midnight Eastern = 4am UTC
  END_DATE: new Date('2025-04-02T03:59:59.000Z'),   // 11:59:59pm Eastern = 3:59:59am UTC
  CLASS_DATES: [
    new Date('2025-03-18T04:00:00.000Z'), // Class 1 - UTC (Midnight Eastern)
    new Date('2025-03-20T04:00:00.000Z'), // Class 2 - UTC (Midnight Eastern)
    new Date('2025-03-25T04:00:00.000Z'), // Class 3 - UTC (Midnight Eastern)
    new Date('2025-03-27T04:00:00.000Z'), // Class 4 - UTC (Midnight Eastern)
    new Date('2025-04-01T04:00:00.000Z'), // Class 5 - UTC (Midnight Eastern)
  ]
};

/**
 * Checks if the current date is before the course starts
 */
export function isBeforeCourse(): boolean {
  const now = new Date();
  const nowDateString = getDateString(now);
  const startDateString = getDateString(COURSE_DATES.START_DATE);
  
  // Using date string comparison to ignore time component
  const result = nowDateString < startDateString;
  
  console.log('[DATE-UTILS] isBeforeCourse check:', {
    now: now.toString(),
    nowISO: now.toISOString(),
    nowDateString: nowDateString,
    startDate: COURSE_DATES.START_DATE.toString(),
    startDateISO: COURSE_DATES.START_DATE.toISOString(),
    startDateString: startDateString,
    result,
    note: 'Using date-only comparison (ignoring time)'
  });
  
  return result;
}

/**
 * Checks if the current date is during the course
 */
export function isDuringCourse(): boolean {
  const now = new Date();
  const nowDateString = getDateString(now);
  const startDateString = getDateString(COURSE_DATES.START_DATE);
  const endDateString = getDateString(COURSE_DATES.END_DATE);
  
  // Using date string comparison to ignore time component
  const result = nowDateString >= startDateString && nowDateString <= endDateString;
  
  console.log('[DATE-UTILS] isDuringCourse check:', {
    now: now.toString(),
    nowISO: now.toISOString(),
    nowDateString: nowDateString,
    startDate: COURSE_DATES.START_DATE.toString(),
    startDateISO: COURSE_DATES.START_DATE.toISOString(),
    startDateString: startDateString,
    endDate: COURSE_DATES.END_DATE.toString(),
    endDateISO: COURSE_DATES.END_DATE.toISOString(),
    endDateString: endDateString,
    result,
    note: 'Using date-only comparison (ignoring time)'
  });
  
  return result;
}

/**
 * Checks if the current date is after the course ends
 */
export function isAfterCourse(): boolean {
  const now = new Date();
  const nowDateString = getDateString(now);
  const endDateString = getDateString(COURSE_DATES.END_DATE);
  
  // Using date string comparison to ignore time component
  const result = nowDateString > endDateString;
  
  console.log('[DATE-UTILS] isAfterCourse check:', {
    now: now.toString(),
    nowISO: now.toISOString(),
    nowDateString: nowDateString,
    endDate: COURSE_DATES.END_DATE.toString(),
    endDateISO: COURSE_DATES.END_DATE.toISOString(),
    endDateString: endDateString,
    result,
    note: 'Using date-only comparison (ignoring time)'
  });
  
  return result;
}

/**
 * Gets the index of the current or next upcoming class
 * Returns -1 if all classes have passed
 */
export function getCurrentClassIndex(): number {
  const now = new Date();
  const nowDateString = getDateString(now);
  let result = -1;
  
  // First, check if today is a class day (ignoring time)
  for (let i = 0; i < COURSE_DATES.CLASS_DATES.length; i++) {
    const classDateString = getDateString(COURSE_DATES.CLASS_DATES[i]);
    
    // If today is a class day, return that class index
    if (nowDateString === classDateString) {
      result = i;
      break;
    }
  }
  
  // If today is not a class day, find the next upcoming class
  if (result === -1) {
    // If before course, return first class
    if (getDateString(now) < getDateString(COURSE_DATES.CLASS_DATES[0])) {
      result = 0;
    }
    // If after all classes, return -1
    else if (getDateString(now) > getDateString(COURSE_DATES.CLASS_DATES[COURSE_DATES.CLASS_DATES.length - 1])) {
      result = -1;
    }
    // Find the next upcoming class
    else {
      for (let i = 0; i < COURSE_DATES.CLASS_DATES.length; i++) {
        if (getDateString(now) < getDateString(COURSE_DATES.CLASS_DATES[i])) {
          result = i;
          break;
        }
      }
    }
  }
  
  console.log('[DATE-UTILS] getCurrentClassIndex:', {
    now: now.toString(),
    nowISO: now.toISOString(),
    nowDateString: getDateString(now),
    classDates: COURSE_DATES.CLASS_DATES.map(d => d.toString()),
    classDateStrings: COURSE_DATES.CLASS_DATES.map(d => getDateString(d)),
    result,
    message: result === -1 ? 'No upcoming classes' : 
             nowDateString === getDateString(COURSE_DATES.CLASS_DATES[result]) ? 
             `Today is Class ${result + 1}` : `Next class is Class ${result + 1}`
  });
  
  return result;
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
  const now = new Date();
  const nowDateString = getDateString(now);
  const classDateString = getDateString(COURSE_DATES.CLASS_DATES[classIndex]);
  
  // A class is considered past if today's date is after the class date
  // If today is the class day, it's not considered past yet (since classes are at 7pm)
  const result = nowDateString > classDateString;
  
  console.log('[DATE-UTILS] isClassPast check for class', classIndex + 1, ':', {
    now: now.toString(),
    nowDateString,
    classDate: COURSE_DATES.CLASS_DATES[classIndex].toString(),
    classDateString,
    result
  });
  
  return result;
}

/**
 * Helper function to get the date string in YYYY-MM-DD format using UTC
 * This normalizes dates to compare them without time or timezone issues
 * Using UTC ensures consistent behavior between server and client
 */
function getDateString(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
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

/**
 * Calculates the number of days until the course starts
 * Returns 0 if the course has already started
 */
export function getDaysUntilCourseStart(): number {
  const now = new Date();
  
  // If course has already started, return 0
  if (now >= COURSE_DATES.START_DATE) {
    return 0;
  }
  
  // Calculate days difference
  const diffTime = COURSE_DATES.START_DATE.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}
