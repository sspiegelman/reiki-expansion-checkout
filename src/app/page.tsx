'use client';

import { useState, useEffect } from 'react';
import { CourseList } from '@/components/CourseList';
import { CheckoutButton } from '@/components/CheckoutButton';
import { COURSES, REATTUNEMENT, COURSE_TITLE, COURSE_SUBTITLE, COURSE_DESCRIPTION } from '@/config/courses';
import { 
  isBeforeCourse, 
  isDuringCourse, 
  isAfterCourse, 
  getCurrentClassIndex, 
  isClassToday,
  getDaysUntilCourseStart
} from '@/lib/checkout/date-utils';

// Type for server time response
interface ServerTimeResponse {
  rawTime: string;
  isoTime: string;
  utcTime: string;
  localTime: string;
  timestamp: number;
  timezone: {
    offset: number;
    offsetHours: number;
  };
  dateStrings: {
    utcDateString: string;
    localDateString: string;
    note: string;
  };
  dateChecks: {
    isBeforeCourse: boolean;
    isDuringCourse: boolean;
    isAfterCourse: boolean;
    currentClassIndex: number;
  };
}

export default function Home() {
  // Course status checks
  const beforeCourse = isBeforeCourse();
  const duringCourse = isDuringCourse();
  const afterCourse = isAfterCourse();
  const currentClassIndex = getCurrentClassIndex();
  
  // Debug state
  const [showDebug, setShowDebug] = useState(false);
  const [serverTime, setServerTime] = useState<ServerTimeResponse | null>(null);
  
  // Fetch server time when debug is shown
  useEffect(() => {
    if (showDebug) {
      fetch('/api/server-time')
        .then(res => res.json())
        .then(data => setServerTime(data))
        .catch(err => console.error('Error fetching server time:', err));
    }
  }, [showDebug]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [includeReattunement, setIncludeReattunement] = useState(false);
  const [paymentOption, setPaymentOption] = useState<'full' | 'split-2' | 'split-3'>('full');

  const handleSelectionChange = (courses: string[], reattunement: boolean) => {
    setSelectedCourses(courses);
    setIncludeReattunement(reattunement);
  };

  const handleBundleSelection = (selected: boolean) => {
    if (selected) {
      // Select all courses at once with bundle price
      setSelectedCourses(COURSES.map(course => course.id));
    } else {
      // Clear all selections
      setSelectedCourses([]);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {COURSE_TITLE}
          </h1>
          <p className="mt-2 text-xl text-secondary">
            {COURSE_SUBTITLE}
          </p>
          <p className="mt-4 text-lg text-gray-600">
            {COURSE_DESCRIPTION}
          </p>
          
          {/* Dynamic Status Banner */}
          {beforeCourse && (
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <p className="text-blue-700 flex items-center justify-center font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Course begins in {getDaysUntilCourseStart()} {getDaysUntilCourseStart() === 1 ? 'day' : 'days'}!
              </p>
              <p className="text-blue-600 text-center mt-1">
                Sign up now to secure your spot for all classes at 7 PM Eastern
              </p>
            </div>
          )}

          {duringCourse && currentClassIndex >= 0 && (
            <div className="mt-6 bg-green-50 border border-green-100 rounded-lg px-4 py-3">
              <h3 className="font-medium text-green-800 text-center">
                {isClassToday(currentClassIndex) 
                  ? "🔴 Class " + (currentClassIndex + 1) + " is live today at 7 PM Eastern!" 
                  : "📅 Next up: Class " + (currentClassIndex + 1) + " on " + COURSES[currentClassIndex].date + " at 7 PM Eastern"}
              </h3>
              <p className="text-green-700 text-center mt-1">
                {isClassToday(currentClassIndex)
                  ? "Sign up now to join us live today for " + COURSES[currentClassIndex].title
                  : "Register now for " + COURSES[currentClassIndex].title}
              </p>
            </div>
          )}

          {afterCourse && (
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <p className="text-gray-700 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
                This course has concluded. Thank you for your interest!
              </p>
            </div>
          )}
        </div>

        {/* Only show course selection if course hasn't ended */}
        {!afterCourse && (
          <div className="mt-12">
            <CourseList
              courses={COURSES}
              reattunement={REATTUNEMENT}
              selectedCourses={selectedCourses}
              includeReattunement={includeReattunement}
              onSelectCourse={(courseId) => {
                // If course is already selected, remove it
                if (selectedCourses.includes(courseId)) {
                  handleSelectionChange(
                    selectedCourses.filter(id => id !== courseId),
                    includeReattunement
                  );
                } else {
                  // If course is not selected, add it
                  handleSelectionChange(
                    [...selectedCourses, courseId],
                    includeReattunement
                  );
                }
              }}
              onBundleSelection={handleBundleSelection}
              onToggleReattunement={() => {
                handleSelectionChange(selectedCourses, !includeReattunement);
              }}
            />
            <div className="mt-8">
              <CheckoutButton
                selectedCourses={selectedCourses}
                includeReattunement={includeReattunement}
                courses={COURSES}
                reattunement={REATTUNEMENT}
                disabled={selectedCourses.length === 0}
                paymentOption={paymentOption}
                onPaymentOptionChange={setPaymentOption}
              />
            </div>
            <p className="mt-4 text-sm text-center text-gray-600">
              You will receive a welcome email with course information after purchase.
            </p>
          </div>
        )}

        {/* After course message */}
        {afterCourse && (
          <div className="mt-8 text-center">
            <p className="text-lg text-gray-700">
              The Reiki Expansion & Reactivation course has concluded.
            </p>
            <p className="mt-2 text-gray-600">
              Please check back for future course offerings or contact us for more information.
            </p>
          </div>
        )}
        
        {/* Debug Information */}
        <div className="mt-16 border-t pt-4">
          <button 
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs text-gray-300 hover:text-gray-500"
          >
            {showDebug ? 'Hide Debug Info' : 'Show Debug Info'}
          </button>
          
          {showDebug && (
            <div className="mt-2 p-4 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
              <h4 className="font-bold">Client Time:</h4>
              <p>Raw: {new Date().toString()}</p>
              <p>ISO: {new Date().toISOString()}</p>
              <p className="font-semibold mt-1">Date Strings:</p>
              <p>UTC Date String: {`${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, '0')}-${String(new Date().getUTCDate()).padStart(2, '0')}`} <span className="text-green-600 font-semibold">(used for comparisons)</span></p>
              <p>Local Date String: {`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}</p>
              
              <h4 className="font-bold mt-2">Date Checks (Client):</h4>
              <p>isBeforeCourse: {String(beforeCourse)}</p>
              <p>isDuringCourse: {String(duringCourse)}</p>
              <p>isAfterCourse: {String(afterCourse)}</p>
              <p>currentClassIndex: {currentClassIndex}</p>
              
              {serverTime && (
                <>
                  <h4 className="font-bold mt-2">Server Time:</h4>
                  <p>Raw: {serverTime.rawTime}</p>
                  <p>ISO: {serverTime.isoTime}</p>
                  <p>UTC: {serverTime.utcTime}</p>
                  <p>Local (ET): {serverTime.localTime}</p>
                  <p className="font-semibold mt-1">Date Strings (used for comparison):</p>
                  <p>UTC Date String: {serverTime.dateStrings.utcDateString} <span className="text-green-600 font-semibold">(used for comparisons)</span></p>
                  <p>Local Date String: {serverTime.dateStrings.localDateString}</p>
                  <p>Timezone Offset: {serverTime.timezone.offsetHours} hours</p>
                  
                  <h4 className="font-bold mt-2">Date Checks (Server):</h4>
                  <p>isBeforeCourse: {String(serverTime.dateChecks.isBeforeCourse)}</p>
                  <p>isDuringCourse: {String(serverTime.dateChecks.isDuringCourse)}</p>
                  <p>isAfterCourse: {String(serverTime.dateChecks.isAfterCourse)}</p>
                  <p>currentClassIndex: {serverTime.dateChecks.currentClassIndex}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
