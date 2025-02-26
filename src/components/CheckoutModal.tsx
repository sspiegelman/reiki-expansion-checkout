import { Dialog } from '@headlessui/react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

const getMonthlyPaymentDates = (payments: number) => {
  const today = new Date();
  return Array.from({ length: payments - 1 }, (_, i) => {
    const date = new Date(today);
    date.setMonth(today.getMonth() + i + 1);
    return date.toLocaleDateString('en-US', { 
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  });
};

const CheckoutForm = ({ 
  splitAmount, 
  totalAmount,
  payments,
  onClose,
  isLoading,
  setIsLoading,
  items
}: { 
  splitAmount: number;
  totalAmount: number;
  payments: number;
  onClose: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  items: { name: string; price: number; }[];
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

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
          items: items, // Pass items to the payment intent
          metadata: {
            type: payments === 1 ? 'full_payment' : 'split_payment',
            payment_number: '1',
            total_payments: payments.toString(),
            total_amount: totalAmount.toString(),
            contact_info: JSON.stringify(contactInfo)
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
            name: contactInfo.fullName,
            email: contactInfo.email,
            phone: contactInfo.phone
          },
        },
        ...(payments > 1 ? { setup_future_usage: 'off_session' } : {}) // Only enable for split payments
      });

      if (result.error) {
        throw new Error(result.error.message || 'Payment failed');
      }

      // For split payments, set up subscription for future payments
      if (payments > 1) {
        try {
          console.log('Setting up subscription for future payments');
          
          // Create a subscription
          const subscriptionResponse = await fetch('/api/create-subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paymentMethodId: result.paymentIntent.payment_method,
              paymentIntentId: result.paymentIntent.id,
              customerInfo: contactInfo,
              items: items,
              splitAmount: splitAmount,
              totalPayments: payments
            })
          });

          if (!subscriptionResponse.ok) {
            console.warn('Failed to set up future payments, but initial payment succeeded');
          } else {
            console.log('Future payments scheduled successfully');
          }
        } catch (error) {
          console.error('Error setting up subscription:', error);
          // Continue to success page even if subscription setup fails
        }
      }

      // Payment successful
      window.location.href = `/success?payment_intent=${result.paymentIntent.id}&payment_intent_client_secret=${clientSecret}`;
    } catch (error) {
      console.error('Error:', error);
      setError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
        {/* Contact Information */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={contactInfo.fullName}
              onChange={e => setContactInfo(prev => ({...prev, fullName: e.target.value}))}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={contactInfo.email}
              onChange={e => setContactInfo(prev => ({...prev, email: e.target.value}))}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              required
              value={contactInfo.phone}
              onChange={e => setContactInfo(prev => ({...prev, phone: e.target.value}))}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>
        </div>

        {/* Card Element */}
        <div className="rounded-md border border-gray-300 p-3 sm:p-4">
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

      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !stripe}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md disabled:opacity-50"
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
        <Dialog.Panel className="w-full max-w-lg rounded-lg bg-white p-4 sm:p-6 shadow-xl">
          <div className="flex justify-between items-center">
            <Dialog.Title className="text-lg sm:text-xl font-semibold text-gray-900">
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

          <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-6">
            {/* First Payment */}
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-medium">
                  {payments === 1 ? 'Payment' : 'First Payment Today'}
                </h3>
                {payments > 1 && (
                  <p className="text-sm text-gray-500">Payment 1 of {payments}</p>
                )}
              </div>
              <span className="text-lg sm:text-xl font-semibold">${splitAmountFormatted}</span>
            </div>

            {/* Selected Items */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-medium">Selected Items:</h3>
              {items.map((item, index) => (
                <div key={index} className="space-y-1">
                  <p>{item.name}</p>
                  <p className="text-sm text-gray-600">
                    Price: ${(item.price / 100).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Payment Schedule - Only show for split payments */}
            {payments > 1 && (
              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-medium">Payment Schedule</h3>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span>Today</span>
                    <span>${splitAmountFormatted}</span>
                  </div>
                  {getMonthlyPaymentDates(payments).map((date) => (
                    <div key={date} className="flex justify-between items-center">
                      <span>{date}</span>
                      <span>${splitAmountFormatted}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total Value */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg font-medium">Total Value:</span>
                <span className="text-lg sm:text-xl font-semibold">${totalAmountFormatted}</span>
              </div>
            </div>

            <CheckoutForm 
              splitAmount={splitAmount}
              totalAmount={totalAmount}
              payments={payments}
              onClose={onClose}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              items={items}
            />
          </div>
        </Dialog.Panel>
      </div>
      </Dialog>
    </Elements>
  );
}
