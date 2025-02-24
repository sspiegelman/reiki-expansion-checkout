import { useState, useEffect } from 'react';
import { Course, ReattunementOption } from '@/types';
import { BUNDLE_PRICE } from '@/config/courses';

interface CourseListProps {
  courses: Course[];
  reattunement: ReattunementOption;
  onSelectionChange: (selectedCourses: string[], includeReattunement: boolean) => void;
}

export function CourseList({ courses, reattunement, onSelectionChange }: CourseListProps) {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [includeReattunement, setIncludeReattunement] = useState(false);

  useEffect(() => {
    // Reset reattunement when no courses are selected
    if (selectedCourses.length === 0 && includeReattunement) {
      setIncludeReattunement(false);
      onSelectionChange([], false);
    }
  }, [selectedCourses, includeReattunement, onSelectionChange]);

  const handleCourseToggle = (courseId: string) => {
    const newSelection = selectedCourses.includes(courseId)
      ? selectedCourses.filter(id => id !== courseId)
      : [...selectedCourses, courseId];
    setSelectedCourses(newSelection);
    onSelectionChange(newSelection, includeReattunement);
  };

  const handleSelectAll = () => {
    const allCourseIds = courses.map(course => course.id);
    const newSelection = selectedCourses.length === courses.length ? [] : allCourseIds;
    setSelectedCourses(newSelection);
    onSelectionChange(newSelection, includeReattunement);
  };

  const handleReattunementToggle = () => {
    if (selectedCourses.length === 0) return;
    setIncludeReattunement(!includeReattunement);
    onSelectionChange(selectedCourses, !includeReattunement);
  };

  const calculateTotal = () => {
    const coursesTotal = selectedCourses.length === courses.length
      ? BUNDLE_PRICE
      : selectedCourses.length * courses[0].price;
    const reattunementTotal = includeReattunement ? reattunement.price : 0;
    return coursesTotal + reattunementTotal;
  };

  return (
    <div className="space-y-6">
      <div 
        onClick={handleSelectAll}
        className="p-6 md:p-8 bg-white rounded-lg shadow border border-primary/20 cursor-pointer hover:shadow-lg transition-all"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Register for the Full 5-Part Experience</h2>
            <p className="text-base text-gray-600 mt-2">Transform your Reiki practice with the complete immersive journey</p>
          </div>
          <div className="flex flex-row md:flex-col items-center md:items-end gap-4 md:gap-2">
            <div className="text-right order-2 md:order-1">
              <p className="text-2xl font-bold text-primary">$395</p>
              <p className="text-sm text-primary/70">Full Experience savings: $80</p>
            </div>
            <div className={`order-1 md:order-2 h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors ${
              selectedCourses.length === courses.length
                ? 'bg-primary border-primary'
                : 'border-gray-300'
            }`}>
              {selectedCourses.length === courses.length && (
                <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            onClick={() => handleCourseToggle(course.id)}
            className="bg-white rounded-lg shadow hover:shadow-md transition-all cursor-pointer h-full flex overflow-hidden min-h-[200px] relative group"
          >
            <div className="w-16 bg-primary/10 flex flex-col items-center justify-start py-4 border-r border-primary/20">
              <span className="text-primary/70 text-xs font-medium mb-1">Class</span>
              <span className="text-primary font-bold text-2xl">
                {course.id.split('-')[1]}
              </span>
            </div>
            <div className="flex-1 p-5 flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900 flex-grow pr-4">
                  {course.title}
                </h3>
                <div className="flex items-center space-x-4">
                  <span className="text-gray-900 font-medium">${course.price / 100}</span>
                  <div className={`h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                    selectedCourses.includes(course.id)
                      ? 'bg-primary border-primary'
                      : 'border-gray-300 group-hover:border-primary/50'
                  }`}>
                    {selectedCourses.includes(course.id) && (
                      <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">{course.description}</p>
              <div className="mt-auto pt-3">
                <p className="text-sm text-primary">Live or watch recording - {course.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div 
        onClick={selectedCourses.length > 0 ? handleReattunementToggle : undefined}
        className={`bg-white rounded-lg shadow transition-all h-full flex overflow-hidden ${
          selectedCourses.length > 0 
            ? 'hover:shadow-md cursor-pointer' 
            : 'opacity-50 cursor-not-allowed'
        }`}
      >
        <div className="w-16 bg-primary/5 flex flex-col items-center justify-start py-4 border-r border-primary/10">
          <span className="text-primary/70 text-xs font-medium mb-1">Add-on</span>
          <span className="text-primary/70 font-bold text-2xl">+</span>
        </div>
        <div className="flex-1 p-5 flex flex-col">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-gray-900 flex-grow pr-4">
              {reattunement.title}
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-gray-900 font-medium">${reattunement.price / 100}</span>
              <div className={`h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                includeReattunement
                  ? 'bg-primary border-primary'
                  : selectedCourses.length > 0
                    ? 'border-gray-300 group-hover:border-primary/50'
                    : 'border-gray-300'
              }`}>
                {includeReattunement && (
                  <svg className="w-4 h-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">Optional add-on - Scheduled separately</p>
          <div className="mt-auto pt-3">
            <p className="text-sm text-primary">
              Regular price <span className="line-through">$197</span> - Special price $97
            </p>
            {selectedCourses.length === 0 && (
              <p className="text-sm text-gray-500 italic mt-1">
                Select at least one class to add this option
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 p-6 bg-white rounded-lg shadow-lg border-t-2 border-primary">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-lg font-medium text-gray-900">Total Amount</span>
            <p className="text-sm text-gray-600 mt-1">
              {selectedCourses.length === courses.length 
                ? 'Full 5-Part Experience' 
                : `${selectedCourses.length} ${selectedCourses.length === 1 ? 'class' : 'classes'}`}
              {includeReattunement ? ' + Re-attunement' : ''}
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-primary">
              ${calculateTotal() / 100}
            </span>
            {selectedCourses.length === courses.length && (
              <p className="text-sm text-primary mt-1">Full Experience savings: $80</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
