import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Course, ReattunementOption } from '@/types';

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

  const handleCheckout = async () => {
    try {
      setIsLoading(true);

      const selectedItems = selectedCourses.map(courseId => {
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

      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: selectedItems,
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

  return (
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
  );
}
