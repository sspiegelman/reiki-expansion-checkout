'use client';

import { useState } from 'react';
import { COURSES, REATTUNEMENT, COURSE_TITLE, COURSE_SUBTITLE, COURSE_DESCRIPTION } from '@/config/courses';
import { getDaysUntilCourseStart } from '@/lib/checkout/date-utils';
import { CourseList } from '@/components/CourseList';
import { CheckoutButton } from '@/components/CheckoutButton';

/**
 * Before course page that promotes the full bundle and allows individual class signups
 * Shown before March 18
 */
export default function FullCheckoutPage() {
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

  // Get days until course starts using the timezone-safe utility function
  const daysUntilStart = getDaysUntilCourseStart();

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
          
          {/* Countdown timer - Informational Style */}
          {daysUntilStart > 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <p className="text-blue-700 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Course begins in {daysUntilStart} {daysUntilStart === 1 ? 'day' : 'days'}
              </p>
            </div>
          )}
        </div>

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
      </div>
    </main>
  );
}
