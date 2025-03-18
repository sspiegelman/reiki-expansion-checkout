import React from 'react';

export const RecordingsNote: React.FC = () => {
  return (
    <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-800">
      <p className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          <strong>Note:</strong> Recordings of all past classes are available on the membership portal after purchase.
        </span>
      </p>
    </div>
  );
};
