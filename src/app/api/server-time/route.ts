import { isBeforeCourse, isDuringCourse, isAfterCourse, getCurrentClassIndex } from '@/lib/checkout/date-utils';

export async function GET() {
  const now = new Date();
  
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
    dateString: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
    dateChecks: {
      isBeforeCourse: isBeforeCourse(),
      isDuringCourse: isDuringCourse(),
      isAfterCourse: isAfterCourse(),
      currentClassIndex: getCurrentClassIndex()
    }
  });
}
