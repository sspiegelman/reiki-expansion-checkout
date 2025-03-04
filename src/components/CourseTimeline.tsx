import { Course } from '@/types';

interface CourseTimelineProps {
  courses: Course[];
  selectedCourses: string[];
}

export function CourseTimeline({ courses, selectedCourses }: CourseTimelineProps) {
  // Helper function to get a shortened version of the course title
  const getShortenedTitle = (title: string) => {
    // Extract the part after the dash and before the date in parentheses
    const parts = title.split('-');
    if (parts.length > 1) {
      const mainTitle = parts[1].trim();
      const withoutDate = mainTitle.split('(')[0].trim();
      return withoutDate;
    }
    return title;
  };

  return (
    <div className="mb-8 bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-medium mb-4">Your Learning Journey</h3>
      
      {/* Desktop Timeline (horizontal cards) */}
      <div className="hidden md:flex space-x-4 overflow-x-auto pb-2">
        {courses.map((course, index) => (
          <div 
            key={course.id}
            className={`flex-shrink-0 p-3 rounded-lg border-2 transition-colors ${
              selectedCourses.includes(course.id)
                ? 'border-green-600 bg-green-50'
                : 'border-gray-200'
            }`}
            style={{ width: '150px' }}
          >
            <div className="flex items-center mb-2">
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium mr-2">
                {index + 1}
              </span>
              <span className="text-sm font-medium">{course.date}</span>
            </div>
            <div className="text-xs">
              {getShortenedTitle(course.title)}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Timeline (vertical cards) */}
      <div className="md:hidden space-y-3">
        {courses.map((course, index) => (
          <div 
            key={course.id}
            className={`p-3 rounded-lg border-l-4 transition-colors ${
              selectedCourses.includes(course.id)
                ? 'border-l-green-600 bg-green-50'
                : 'border-l-gray-300 border border-gray-200'
            }`}
          >
            <div className="flex items-center">
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium mr-2">
                {index + 1}
              </span>
              <span className="text-sm font-medium">{course.date}</span>
            </div>
            <div className="text-xs mt-1 ml-8">
              {getShortenedTitle(course.title)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
