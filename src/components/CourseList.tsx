import { useState } from 'react';
import { Course, ReattunementOption } from '@/types';
import { BUNDLE_PRICE } from '@/config/courses';

interface CourseListProps {
  courses: Course[];
  reattunement: ReattunementOption;
  selectedCourses: string[];
  includeReattunement: boolean;
  onSelectCourse: (courseId: string) => void;
  onToggleReattunement: () => void;
  onPaymentOptionChange: (option: 'full' | 'split-2' | 'split-3') => void;
  onBundleSelection: (selected: boolean) => void;
}

export function CourseList({
  courses,
  reattunement,
  selectedCourses,
  includeReattunement,
  onSelectCourse,
  onToggleReattunement,
  onPaymentOptionChange,
  onBundleSelection
}: CourseListProps) {
  const [showIndividualClasses, setShowIndividualClasses] = useState(false);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<'full' | 'split-2' | 'split-3'>('full');

  return (
    <div className="space-y-8">
      {/* Full Experience Option */}
      <div 
        className={`bg-white rounded-xl p-6 border-2 transition-colors ${
          selectedCourses.length === courses.length 
            ? 'border-primary bg-primary/5 shadow-lg' 
            : 'border-gray-200 hover:border-primary/30'
        }`}
      >
        <h2 className="text-2xl font-semibold text-gray-900">
          Register for the Full 5-Part Experience
        </h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg text-gray-700">
                Complete Reiki Expansion & Reactivation Course
              </p>
              <p className="text-primary font-medium mt-1">
                Full Course Price: ${(BUNDLE_PRICE / 100).toFixed(2)} (Save $80)
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Get access to all 5 classes at our best value
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBundleSelection(selectedCourses.length !== courses.length);
                setShowIndividualClasses(false);
              }}
              className={`w-full md:w-auto px-8 py-3 rounded-lg transition-colors text-white font-medium ${
                selectedCourses.length === courses.length
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              {selectedCourses.length === courses.length ? 'Full Course Selected' : 'Select Full Course'}
            </button>
          </div>

        </div>
      </div>

      {/* Individual Classes */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <button 
          onClick={() => setShowIndividualClasses(!showIndividualClasses)}
          className="w-full flex justify-between items-center"
        >
          <div>
            <h2 className="text-xl font-medium text-gray-900">
              Individual Classes
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Select one or more classes
            </p>
          </div>
          <svg 
            className={`h-5 w-5 transform transition-transform ${showIndividualClasses ? 'rotate-180' : ''}`}
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth="1.5" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expandable class list */}
        {showIndividualClasses && (
          <div className="mt-6 space-y-4 border-t pt-4">
            {courses.map(course => (
              <div 
                key={course.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCourse(course.id);
                  // If all courses are selected after this change, close the section
                  const willBeSelected = !selectedCourses.includes(course.id);
                  if (willBeSelected && selectedCourses.length === courses.length - 1) {
                    setShowIndividualClasses(false);
                  }
                }}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedCourses.includes(course.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/30'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course.id)}
                    onChange={() => {}} // Handled by parent div click
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-600">
                      {course.date} • ${(course.price / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Re-Attunement Add-on */}
      <div 
        onClick={onToggleReattunement}
        className={`bg-white rounded-xl p-6 border transition-colors cursor-pointer ${
          includeReattunement
            ? 'border-primary bg-primary/5'
            : 'border-gray-200 hover:border-primary/30'
        }`}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-medium text-gray-900">
            Enhance Your Experience
            <span className="ml-2 text-sm text-primary font-normal">Add-on</span>
          </h2>
        </div>
        <div className="mt-4 flex items-start space-x-4">
          <input
            type="checkbox"
            checked={includeReattunement}
            onChange={onToggleReattunement}
            onClick={(e) => e.stopPropagation()}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:opacity-50"
          />
          <div>
            <h3 className="font-medium text-gray-900">{reattunement.title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              One-on-one session with Michal
            </p>
            <p className="text-sm text-gray-900 mt-1">
              ${(reattunement.price / 100).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
