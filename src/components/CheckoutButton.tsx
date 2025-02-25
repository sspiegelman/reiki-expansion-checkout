import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Course, ReattunementOption, PaymentOption } from '@/types';
import { BUNDLE_PRICE } from '@/config/courses';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

interface CheckoutButtonProps {
  selectedCourses: string[];
  includeReattunement: boolean;
  courses: Course[];
  reattunement: ReattunementOption;
  disabled: boolean;
}

export function CheckoutButton({
  selectedCourses,
  includeReattunement,
  courses,
  reattunement,
  disabled
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('full');

  const getPaymentOptions = () => {
    const total = selectedCourses.length === courses.length
      ? (includeReattunement ? BUNDLE_PRICE + reattunement.price : BUNDLE_PRICE)
      : 0;

    if (total === 0) return [];

    return [
      {
        type: 'full',
        label: `Pay in full: $${(total / 100).toFixed(2)}`,
        amount: total
      },
      {
        type: 'split-2',
        label: `2 payments of $${(total / 200).toFixed(2)} (Today + 30 days)`,
        amount: total
      },
      {
        type: 'split-3',
        label: `3 payments of $${(total / 300).toFixed(2)} (Today + 30/60 days)`,
        amount: total
      }
    ];
  };

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      let selectedItems = [];
      const checkoutOptions = {};
      
      if (selectedCourses.length === courses.length) {
        // Bundle price for all classes
        selectedItems.push({
          name: "Reiki Expansion & Reactivation: A Five-Part Immersive Course",
          price: BUNDLE_PRICE
        });

        // Calculate total including re-attunement if selected
        const total = includeReattunement ? BUNDLE_PRICE + reattunement.price : BUNDLE_PRICE;

        if (paymentOption !== 'full') {
          const payments = paymentOption === 'split-2' ? 2 : 3;
          const splitAmount = Math.floor(total / payments);
          
          selectedItems = [{
            name: [
              `Reiki Expansion & Reactivation${includeReattunement ? ' with Re-Attunement' : ''}`,
              'Payment Schedule:',
              `• First payment: $${(splitAmount / 100).toFixed(2)} today`,
              ...(payments === 2 
                ? [`• Final payment: $${(splitAmount / 100).toFixed(2)} in 30 days`]
                : [
                    `• Second payment: $${(splitAmount / 100).toFixed(2)} in 30 days`,
                    `• Final payment: $${(splitAmount / 100).toFixed(2)} in 60 days`
                  ]
              )
            ].join('\n'),
            price: splitAmount
          }];
        } else {
          // Full payment - add bundle and re-attunement separately
          selectedItems = [{
            name: "Reiki Expansion & Reactivation: A Five-Part Immersive Course",
            price: BUNDLE_PRICE
          }];
          
          if (includeReattunement) {
            selectedItems.push({
              name: reattunement.title,
              price: reattunement.price
            });
          }
        }
      } else {
        // Individual class prices
        selectedItems = selectedCourses.map(courseId => {
          const course = courses.find(c => c.id === courseId)!;
          return {
            name: course.title,
            price: course.price
          };
        });

        if (includeReattunement) {
          selectedItems.push({
            name: reattunement.title,
            price: reattunement.price
          });
        }
      }

      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: selectedItems,
          options: checkoutOptions
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to checkout. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Debug logs
  console.log('Render state:', {
    selectedCourses,
    totalCourses: courses.length,
    isBundle: selectedCourses.length === courses.length,
    paymentOptions: getPaymentOptions()
  });

  return (
    <div className="space-y-4">
      {selectedCourses.length === courses.length && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Payment Options:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {getPaymentOptions().map((option) => (
              <button
                key={option.type}
                onClick={() => setPaymentOption(option.type as PaymentOption)}
                className={`p-3 text-sm rounded-lg border transition-colors ${
                  paymentOption === option.type
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 hover:border-primary/30'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={disabled || isLoading}
        className={`w-full py-3 px-4 text-white font-medium rounded-lg transition-colors ${
          disabled || isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-primary hover:bg-primary/90'
        }`}
      >
        {isLoading ? 'Processing...' : 'Proceed to Checkout'}
      </button>
    </div>
  );
}
