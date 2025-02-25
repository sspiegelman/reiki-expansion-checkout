import { Dialog } from '@headlessui/react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

const CheckoutForm = ({ 
  splitAmount, 
  totalAmount,
  payments,
  onClose,
  isLoading,
  setIsLoading 
}: { 
  splitAmount: number;
  totalAmount: number;
  payments: number;
  onClose: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setError(null);
    setIsLoading(true);
    
    try {
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: splitAmount,
          metadata: {
            type: payments === 1 ? 'full_payment' : 'split_payment',
            payment_number: '1',
            total_payments: payments.toString(),
            total_amount: totalAmount.toString()
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Confirm payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            email: '', // Will be collected by Stripe
          },
        },
        ...(payments > 1 ? { setup_future_usage: 'off_session' } : {}) // Only enable for split payments
      });

      if (result.error) {
        throw new Error(result.error.message || 'Payment failed');
      }

      // Payment successful
      window.location.href = '/success';
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 mt-6">
        <div className="rounded-md border border-gray-300 p-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>

        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !stripe}
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : `Pay $${(splitAmount / 100).toFixed(2)}`}
        </button>
      </div>
    </form>
  );
};

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: {
    name: string;
    price: number;
  }[];
  paymentSchedule: {
    splitAmount: number;
    totalAmount: number;
    payments: number;
  };
}

export function CheckoutModal({ isOpen, onClose, items, paymentSchedule }: CheckoutModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { splitAmount, totalAmount, payments } = paymentSchedule;
  const splitAmountFormatted = (splitAmount / 100).toFixed(2);
  const totalAmountFormatted = (totalAmount / 100).toFixed(2);

  return (
    <Elements stripe={stripePromise}>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
          <div className="flex justify-between items-center">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Checkout
            </Dialog.Title>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {/* First Payment */}
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="font-medium">
                  {payments === 1 ? 'Payment' : 'First Payment Today'}
                </h3>
                {payments > 1 && (
                  <p className="text-sm text-gray-500">Payment 1 of {payments}</p>
                )}
              </div>
              <span className="text-xl font-semibold">${splitAmountFormatted}</span>
            </div>

            {/* Selected Items */}
            <div className="space-y-4">
              <h3 className="font-medium">Selected Items:</h3>
              {items.map((item, index) => (
                <div key={index} className="space-y-1">
                  <p>{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Price: ${(item.price / 100).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Payment Schedule */}
            <div className="space-y-2">
              <h3 className="font-medium">Payment Schedule:</h3>
              {payments === 1 ? (
                <p>• One-time payment: ${splitAmountFormatted}</p>
              ) : (
                <>
                  <p>• First Payment Today: ${splitAmountFormatted}</p>
                  {payments === 2 ? (
                    <p>• Final Payment in 30 days: ${splitAmountFormatted}</p>
                  ) : (
                    <>
                      <p>• Second Payment in 30 days: ${splitAmountFormatted}</p>
                      <p>• Final Payment in 60 days: ${splitAmountFormatted}</p>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Total Value */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Value:</span>
                <span className="text-lg font-semibold">${totalAmountFormatted}</span>
              </div>
            </div>

            <CheckoutForm 
              splitAmount={splitAmount}
              totalAmount={totalAmount}
              payments={payments}
              onClose={onClose}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>
        </Dialog.Panel>
      </div>
      </Dialog>
    </Elements>
  );
}
