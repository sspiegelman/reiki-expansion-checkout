'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { COURSES, BUNDLE_PRICE, REATTUNEMENT, COURSE_TITLE, COURSE_SUBTITLE, COURSE_DESCRIPTION } from '@/config/courses';
import { 
  isClassPast, 
  isClassToday,
  isClassTomorrow,
  getCurrentClassIndex, 
  getNextClassPage
} from '@/lib/checkout/date-utils';
import { 
  getClassStatus
} from '@/lib/checkout/course-utils';
import { ClassStatusBadge } from '@/components/checkout/ClassStatusBadge';
import { RecordingsNote } from '@/components/checkout/RecordingsNote';
import { CourseList } from '@/components/CourseList';
import { CheckoutButton } from '@/components/CheckoutButton';

/**
 * Class 2 page with dynamic content based on the current date
 */
export default function Class2Page() {
  const router = useRouter();
  const classIndex = 1; // This is class-2
  const currentClassIndex = getCurrentClassIndex();
  
  // State for checkout
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [includeReattunement, setIncludeReattunement] = useState(false);
  const [paymentOption, setPaymentOption] = useState<'full' | 'split-2' | 'split-3'>('full');
  
  // Redirect if this class is in the past and not the current focus
  useEffect(() => {
    if (isClassPast(classIndex) && classIndex < currentClassIndex) {
      router.push(getNextClassPage());
    }
  }, [router, classIndex, currentClassIndex]);
  
  const classStatus = getClassStatus(classIndex);
  
  // Debug information
  useEffect(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    
    // Create a proper date string with the current year
    const currentYear = now.getFullYear();
    const fullClassDateString = `${COURSES[classIndex].date}, ${currentYear}`;
    const classDate = new Date(fullClassDateString);
    
    // Debug date strings
    const todayString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const tomorrowString = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    const classDateString = `${classDate.getFullYear()}-${String(classDate.getMonth() + 1).padStart(2, '0')}-${String(classDate.getDate()).padStart(2, '0')}`;
    
    console.log('===== DEBUG INFO (Class 2) =====');
    console.log('Current Date:', now.toString());
    console.log('Today String:', todayString);
    console.log('Tomorrow String:', tomorrowString);
    console.log('Class Date:', COURSES[classIndex].date);
    console.log('Class Date String:', classDateString);
    console.log('Class Status:', classStatus);
    console.log('Is Today:', isClassToday(classIndex) ? 'Yes' : 'No');
    console.log('Is Tomorrow:', isClassTomorrow(classIndex) ? 'Yes' : 'No');
    console.log('=====================');
  }, [classIndex, classStatus]);
  
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
          {/* Prominent Status Banners */}
          {classStatus === 'live-today' && (
            <div className="bg-green-600 text-white py-3 px-4 rounded-lg mb-4 animate-pulse">
              <p className="text-xl font-bold">Class 2 is live today!</p>
            </div>
          )}
          {classStatus === 'live-tomorrow' && (
            <div className="bg-yellow-600 text-white py-3 px-4 rounded-lg mb-4">
              <p className="text-xl font-bold">Class 2 is live tomorrow!</p>
            </div>
          )}
          {classStatus === 'live-on-date' && (
            <div className="bg-blue-600 text-white py-3 px-4 rounded-lg mb-4">
              <p className="text-xl font-bold">Class 2 is live on {COURSES[classIndex].date}!</p>
            </div>
          )}
          
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {COURSES[classIndex].title}
          </h1>
          
          {/* Dynamic status badge */}
          <div className="mt-2">
            <ClassStatusBadge status={classStatus} />
          </div>
          
          <p className="mt-4 text-lg text-gray-600">
            {COURSES[classIndex].description}
          </p>
          
          <RecordingsNote />
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
