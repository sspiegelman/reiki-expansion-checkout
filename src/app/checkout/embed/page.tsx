import { Suspense } from 'react';
import EmbeddedCheckoutClient from './EmbeddedCheckoutClient';

export default function EmbeddedCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mb-4"></div>
        <p className="text-lg font-medium text-gray-800">Loading checkout...</p>
      </div>
    }>
      <EmbeddedCheckoutClient />
    </Suspense>
  );
}
