import Link from 'next/link';
import { COURSE_TITLE, COURSE_SUBTITLE } from '@/config/courses';

/**
 * After course page that informs visitors the course has concluded
 * Shown after April 1
 */
export default function RecordingsPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Course Completed
          </h1>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <p className="text-lg text-amber-800">
              The {COURSE_TITLE} {COURSE_SUBTITLE} has concluded.
            </p>
          </div>
          
          <p className="text-lg text-gray-600 mb-6">
            Thank you for your interest in the {COURSE_TITLE} {COURSE_SUBTITLE}. 
            This five-part immersive course ran from March 18 to April 1, 2025 and is no longer available for registration.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Interested in future courses?</h2>
            <p className="text-gray-600 mb-4">
              Join our mailing list to be notified when new courses become available.
            </p>
            
            <div className="mt-4">
              <a 
                href="https://beaconsofchange.com/subscribe" 
                className="inline-block bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg"
              >
                Subscribe to Updates
              </a>
            </div>
          </div>

          <div className="mt-8">
            <Link
              href="https://beaconsofchange.com"
              className="inline-flex items-center text-primary hover:text-primary/80"
            >
              Beacons of Change Website
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L15.586 11H3a1 1 0 110-2h12.586l-5.293-5.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            If you have any questions, please don&apos;t hesitate to reach out at{' '}
            <a 
              href="mailto:info@beaconsofchange.com" 
              className="text-primary hover:text-primary/80"
            >
              info@beaconsofchange.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
