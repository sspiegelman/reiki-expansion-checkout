import { getSessionDetails } from '@/lib/stripe';
import { REATTUNEMENT } from '@/config/courses';
import Link from 'next/link';

interface MetadataItem {
  name: string;
  price: number;
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { session_id: string };
}) {
  let session;
  try {
    if (searchParams.session_id) {
      session = await getSessionDetails(searchParams.session_id);
    }
  } catch (error) {
    console.error('Error fetching session:', error);
  }

  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-primary mb-4">
            Thank You for Your Purchase!
          </h1>
          
          <p className="text-lg text-gray-600 mb-6">
            We&apos;re excited to have you join the Reiki Expansion & Reactivation course.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Next Steps:</h2>
            <ul className="text-left space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                Check your email for a welcome message with course instructions
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                Mark your calendar for your first live class
              </li>
              {session?.metadata?.items && 
                JSON.parse(session.metadata.items).some((item: MetadataItem) => 
                  item.name === REATTUNEMENT.title
                ) && (
                  <li className="flex items-start">
                    <span className="mr-2">3.</span>
                    We&apos;ll contact you shortly to schedule your Re-Attunement session
                  </li>
                )
              }
            </ul>
          </div>

          {session && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary:</h2>
              <div className="space-y-3">
                {session.line_items?.data.map((item, index) => (
                  <div key={index} className="flex justify-between text-gray-600">
                    <span>{item.description}</span>
                    <span>${(item.amount_total / 100).toFixed(2)}</span>
                  </div>
                ))}
                {session.amount_total && (
                  <div className="border-t pt-3 flex justify-between font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${(session.amount_total / 100).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8">
            <Link
              href={process.env.THANK_YOU_URL || 'https://beaconsofchange.com'}
              className="inline-flex items-center text-primary hover:text-primary/80"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Beacons of Change website
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
    </main>
  );
}
