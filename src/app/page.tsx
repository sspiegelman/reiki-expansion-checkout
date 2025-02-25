'use client';

import { useState } from 'react';
import { CourseList } from '@/components/CourseList';
import { CheckoutButton } from '@/components/CheckoutButton';
import { COURSES, REATTUNEMENT, COURSE_TITLE, COURSE_SUBTITLE, COURSE_DESCRIPTION } from '@/config/courses';

export default function Home() {
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
