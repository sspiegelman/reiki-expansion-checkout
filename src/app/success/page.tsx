import { getSessionDetails } from '@/lib/stripe';
import Link from 'next/link';

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
            We're excited to have you join the Reiki Expansion & Reactivation course.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Next Steps:</h2>
            <ul className="text-left space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                Check your email for a welcome message with course access instructions
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                {session?.custom_fields?.find(f => f.key === 'phone') && 
                  "We'll contact you shortly to schedule your Re-Attunement session"}
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                Mark your calendar for your first live class
              </li>
            </ul>
          </div>

          {process.env.THANK_YOU_URL && (
            <div className="mt-8">
              <Link
                href={process.env.THANK_YOU_URL}
                className="text-primary hover:text-primary/80 underline"
              >
                Click here for additional information
              </Link>
            </div>
          )}

          <p className="mt-8 text-sm text-gray-500">
            If you have any questions, please don't hesitate to reach out.
          </p>
        </div>
      </div>
    </main>
  );
}
