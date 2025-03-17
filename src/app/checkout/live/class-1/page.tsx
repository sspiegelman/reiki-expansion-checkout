'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { COURSES, BUNDLE_PRICE, REATTUNEMENT } from '@/config/courses';
import { 
  isClassPast, 
  getCurrentClassIndex, 
  getNextClassPage,
  isClassToday
} from '@/lib/checkout/date-utils';
import { 
  getClassPrice, 
  getClassStatus, 
  getClassLabel
} from '@/lib/checkout/course-utils';
import { ClassStatusBadge } from '@/components/checkout/ClassStatusBadge';
import { CourseOfferCard } from '@/components/checkout/CourseOfferCard';
import { CheckoutButton } from '@/components/CheckoutButton';

/**
 * Class 1 page with dynamic content based on the current date
 */
export default function Class1Page() {
  const router = useRouter();
  const classIndex = 0; // This is class-1
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
  const isCurrentClass = classIndex === currentClassIndex;
  
  // Handle course selection
  const handleCourseSelection = (courseId: string) => {
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(selectedCourses.filter(id => id !== courseId));
    } else {
      setSelectedCourses([...selectedCourses, courseId]);
    }
  };
  
  // Handle bundle selection
  const handleBundleSelection = () => {
    setSelectedCourses(COURSES.map(course => course.id));
  };
  
  // Handle individual class selection
  const handleClassSelection = () => {
    setSelectedCourses([COURSES[classIndex].id]);
  };
  
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {classStatus === 'live-today' ? 'Join Live Today: ' : ''}
            {COURSES[classIndex].title}
          </h1>
          
          {/* Dynamic status badge */}
          <div className="mt-2">
            <ClassStatusBadge status={classStatus} />
          </div>
          
          <p className="mt-4 text-lg text-gray-600">
            {COURSES[classIndex].description}
          </p>
        </div>
        
        {/* Main content */}
        <div className="mt-12 space-y-8">
          {/* 1. Full Course Offer (Always Available) */}
          <CourseOfferCard
            title="Full Course Bundle"
            description="Get all 5 classes for one discounted price. Includes live access and recordings."
            price={BUNDLE_PRICE}
            originalPrice={COURSES.reduce((sum, course) => sum + course.price, 0)}
            ctaText="Get the Full Bundle"
            highlight={true}
            onClick={handleBundleSelection}
          />
          
          {/* 2. Current Class Promotion */}
          <CourseOfferCard
            title={`${getClassLabel(classIndex)}: ${COURSES[classIndex].title}`}
            description={COURSES[classIndex].description}
            price={getClassPrice(classIndex)}
            ctaText={classStatus === 'past' ? "Get Recording Access" : "Join Live Class"}
            highlight={isCurrentClass}
            onClick={handleClassSelection}
          />
          
          {/* 3. Next Upcoming Class (if this one is past) */}
          {classStatus === 'past' && currentClassIndex >= 0 && currentClassIndex < COURSES.length && (
            <CourseOfferCard
              title={`Next Live Class: ${COURSES[currentClassIndex].title}`}
              description={COURSES[currentClassIndex].description}
              price={COURSES[currentClassIndex].price}
              ctaText="Join Next Live Class"
              highlight={true}
              onClick={() => router.push(`/checkout/live/class-${currentClassIndex + 1}`)}
            />
          )}
          
          {/* 4. All Classes List */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">All Available Classes</h2>
            <div className="space-y-4">
              {COURSES.map((course, idx) => (
                <div key={course.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{course.title}</h3>
                    <ClassStatusBadge status={getClassStatus(idx)} small />
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${(getClassPrice(idx) / 100).toFixed(2)}</p>
                    <button 
                      className="text-sm text-primary hover:underline"
                      onClick={() => router.push(`/checkout/live/class-${idx + 1}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Checkout Button */}
          {selectedCourses.length > 0 && (
            <div className="mt-8 p-6 border border-gray-200 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Complete Your Purchase</h2>
              <CheckoutButton
                selectedCourses={selectedCourses}
                includeReattunement={includeReattunement}
                courses={COURSES}
                reattunement={REATTUNEMENT}
                disabled={selectedCourses.length === 0}
                paymentOption={paymentOption}
                onPaymentOptionChange={setPaymentOption}
              />
              
              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id="reattunement"
                  checked={includeReattunement}
                  onChange={() => setIncludeReattunement(!includeReattunement)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="reattunement" className="ml-2 block text-sm text-gray-700">
                  Add Private Reiki Re-Attunement with Michal (+${(REATTUNEMENT.price / 100).toFixed(2)})
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
