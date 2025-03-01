import { stripe } from '@/lib/stripe';
import { REATTUNEMENT } from '@/config/courses';
import Link from 'next/link';

// Tell Next.js this is a dynamic page that should not be statically generated
export const dynamic = 'force-dynamic';

interface MetadataItem {
  name: string;
  price: number;
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { payment_intent: string; payment_intent_client_secret: string };
}) {
  let paymentIntent;
  try {
    if (searchParams.payment_intent) {
      paymentIntent = await stripe.paymentIntents.retrieve(
        searchParams.payment_intent,
        { expand: ['payment_method'] }
      );
    }
  } catch (error) {
    console.error('Error fetching payment:', error);
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
              {paymentIntent?.metadata?.items && 
                JSON.parse(paymentIntent.metadata.items).some((item: MetadataItem) => 
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

          {paymentIntent && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary:</h2>
              <div className="space-y-3">
                {JSON.parse(paymentIntent.metadata.items || '[]').map((item: MetadataItem) => (
                  <div key={item.name} className="flex justify-between text-gray-600">
                    <span>{item.name}</span>
                    <span>${(item.price / 100).toFixed(2)}</span>
                  </div>
                ))}
                
                <div className="border-t pt-3 flex justify-between font-semibold text-gray-900">
                  <span>Total Value</span>
                  <span>${(parseInt(paymentIntent.metadata.total_amount || paymentIntent.amount.toString()) / 100).toFixed(2)}</span>
                </div>
                
                {paymentIntent.metadata.total_payments && parseInt(paymentIntent.metadata.total_payments) > 1 ? (
                  <>
                    <div className="flex justify-between text-gray-700">
                      <span>Amount Paid Today</span>
                      <span>${(paymentIntent.amount / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Payment Plan</span>
                      <span>{paymentIntent.metadata.total_payments} payments</span>
                    </div>
                    {parseInt(paymentIntent.metadata.total_payments) > 1 && (
                      <div className="flex justify-between text-gray-700">
                        <span>Remaining Payments</span>
                        <span>
                          {parseInt(paymentIntent.metadata.total_payments) - 1} × ${(paymentIntent.amount / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between text-gray-700">
                    <span>Amount Paid</span>
                    <span>${(paymentIntent.amount / 100).toFixed(2)}</span>
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
    </main>
  );
}
