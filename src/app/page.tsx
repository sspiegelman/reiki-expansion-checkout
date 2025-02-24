'use client';

import { useState } from 'react';
import { CourseList } from '@/components/CourseList';
import { CheckoutButton } from '@/components/CheckoutButton';
import { COURSES, REATTUNEMENT, COURSE_TITLE, COURSE_SUBTITLE, COURSE_DESCRIPTION } from '@/config/courses';

export default function Home() {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [includeReattunement, setIncludeReattunement] = useState(false);

  const handleSelectionChange = (courses: string[], reattunement: boolean) => {
    setSelectedCourses(courses);
    setIncludeReattunement(reattunement);
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
            onSelectionChange={handleSelectionChange}
          />
          <div className="mt-8">
            <CheckoutButton
              selectedCourses={selectedCourses}
              includeReattunement={includeReattunement}
              courses={COURSES}
              reattunement={REATTUNEMENT}
              disabled={selectedCourses.length === 0}
            />
          </div>
          <p className="mt-4 text-sm text-center text-gray-600">
            You will receive a welcome email with access instructions after purchase.
          </p>
        </div>
      </div>
    </main>
  );
}
