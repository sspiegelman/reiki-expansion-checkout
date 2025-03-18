import { isBeforeCourse, isDuringCourse, isAfterCourse, getCurrentClassIndex } from '@/lib/checkout/date-utils';

export async function GET() {
  const now = new Date();
  
  // Helper function to get UTC date string (same as in date-utils.ts)
  const getUTCDateString = (date: Date): string => {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  };
  
  // Helper function to get local date string
  const getLocalDateString = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  return Response.json({
    rawTime: now.toString(),
    isoTime: now.toISOString(),
    utcTime: now.toUTCString(),
    localTime: now.toLocaleString('en-US', { timeZone: 'America/New_York' }),
    timestamp: now.getTime(),
    timezone: {
      offset: now.getTimezoneOffset(),
      offsetHours: now.getTimezoneOffset() / -60,
    },
    dateStrings: {
      utcDateString: getUTCDateString(now), // This is what's used for comparisons
      localDateString: getLocalDateString(now),
      note: "UTC date string is used for all date comparisons"
    },
    dateChecks: {
      isBeforeCourse: isBeforeCourse(),
      isDuringCourse: isDuringCourse(),
      isAfterCourse: isAfterCourse(),
      currentClassIndex: getCurrentClassIndex()
    }
  });
}
