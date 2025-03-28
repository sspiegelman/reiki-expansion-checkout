import { Dialog } from '@headlessui/react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';
import { TrustIndicators } from './TrustIndicators';

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
  setProcessingStep,
  items,
  initialContactInfo,
  onSuccessCallback,
  // isPopup is passed but not currently used in this component
  // keeping it for potential future popup-specific behavior
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isPopup
}: { 
  splitAmount: number;
  totalAmount: number;
  payments: number;
  onClose: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setProcessingStep: (step: number) => void;
  items: { name: string; price: number; }[];
  initialContactInfo?: {
    fullName: string;
    email: string;
    phone: string;
  };
  onSuccessCallback?: (paymentIntentId: string) => void;
  isPopup?: boolean;
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [error, setError] = useState<string | null>(null);
  const [contactInfo, setContactInfo] = useState({
    fullName: initialContactInfo?.fullName || '',
    email: initialContactInfo?.email || '',
    phone: initialContactInfo?.phone || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setError(null);
    setIsLoading(true);
    setProcessingStep(0); // Start with the first step
    
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
      setProcessingStep(1); // Move to the next step

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
      
      setProcessingStep(2); // Move to the next step
      
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
            // Get detailed error message
            const errorData = await subscriptionResponse.json();
            console.warn('Failed to set up future payments, but initial payment succeeded:', 
              errorData.message || 'Unknown error');
            
            // We'll still continue to success page, but log detailed error
            console.error('Subscription setup failed with status:', subscriptionResponse.status);
          } else {
            const subscriptionResult = await subscriptionResponse.json();
            console.log('Future payments scheduled successfully:', subscriptionResult);
            console.log('Next payment date:', subscriptionResult.next_payment_date);
          }
        } catch (error) {
          console.error('Error setting up subscription:', error);
          // Continue to success page even if subscription setup fails
        }
      }

      // Payment successful
      setProcessingStep(3); // Final step before redirect
      
      // Use the custom success handler if provided, otherwise use default redirect
      if (onSuccessCallback) {
        onSuccessCallback(result.paymentIntent.id);
      } else {
        window.location.href = `/success?payment_intent=${result.paymentIntent.id}`;
      }
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
        <div className="space-y-2 sm:space-y-4 mb-3 sm:mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              value={contactInfo.fullName}
              onChange={e => setContactInfo(prev => ({...prev, fullName: e.target.value}))}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              disabled={isLoading}
              value={contactInfo.email}
              onChange={e => setContactInfo(prev => ({...prev, email: e.target.value}))}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              required
              disabled={isLoading}
              value={contactInfo.phone}
              onChange={e => setContactInfo(prev => ({...prev, phone: e.target.value}))}
              className={`w-full rounded-md border border-gray-300 px-3 py-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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

      <div className="mt-4 sm:mt-6">
        {/* Desktop buttons - hidden on mobile */}
        <div className="hidden sm:flex sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={isLoading ? () => {} : onClose}
            disabled={isLoading}
            className={`sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !stripe}
            className="sm:w-auto px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : `Pay $${(splitAmount / 100).toFixed(2)}`}
          </button>
        </div>
        
        {/* Mobile sticky footer - hidden on desktop */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={isLoading ? () => {} : onClose}
              disabled={isLoading}
              className={`w-1/3 px-4 py-3 text-sm font-medium text-gray-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !stripe}
              className="w-2/3 px-4 py-3 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : `Pay $${(splitAmount / 100).toFixed(2)}`}
            </button>
          </div>
        </div>
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
  customerInfo?: {
    fullName: string;
    email: string;
    phone: string;
  };
  onSuccess?: (paymentIntentId: string) => void;
  isPopup?: boolean;
}

export function CheckoutModal({ 
  isOpen, 
  onClose, 
  items, 
  paymentSchedule,
  customerInfo,
  onSuccess,
  // isPopup is passed down to CheckoutForm for potential popup-specific behavior
  isPopup
}: CheckoutModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const { splitAmount, totalAmount, payments } = paymentSchedule;
  const splitAmountFormatted = (splitAmount / 100).toFixed(2);
  const totalAmountFormatted = (totalAmount / 100).toFixed(2);
  
  const processingSteps = [
    "Preparing payment...",
    "Connecting to payment processor...",
    "Processing your payment...",
    "Finalizing transaction..."
  ];

  return (
    <Elements stripe={stripePromise}>
      <Dialog 
        open={isOpen} 
        onClose={isLoading ? () => {} : onClose} 
        className="relative z-50"
      >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4">
        <Dialog.Panel className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white p-3 sm:p-6 pb-28 sm:pb-6 shadow-xl relative">
          {/* Processing Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-lg">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mb-4"></div>
              <p className="text-lg font-medium text-gray-800">{processingSteps[processingStep]}</p>
              <p className="text-sm text-gray-600 mt-2">Please don&apos;t close this window</p>
              
              <div className="flex items-center justify-center mt-4">
                <div className="animate-bounce bg-primary rounded-full h-3 w-3 mr-1"></div>
                <div className="animate-bounce bg-primary rounded-full h-3 w-3 mr-1" style={{animationDelay: '0.2s'}}></div>
                <div className="animate-bounce bg-primary rounded-full h-3 w-3" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          )}
          <div className="flex justify-between items-center">
            <Dialog.Title className="text-lg sm:text-xl font-semibold text-gray-900">
              Checkout
            </Dialog.Title>
            <button
              type="button"
              onClick={isLoading ? () => {} : onClose}
              disabled={isLoading}
              className={`text-gray-400 hover:text-gray-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-3 sm:mt-6 space-y-3 sm:space-y-5">
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
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-base sm:text-lg font-medium">Selected Items:</h3>
              {items.map((item, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <p className="text-sm sm:text-base">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    ${(item.price / 100).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Payment Schedule - Only show for split payments */}
            {payments > 1 && (
              <div className="space-y-1 sm:space-y-2">
                <h3 className="text-base sm:text-lg font-medium">Payment Schedule</h3>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm">
                  <div className="font-medium">Today</div>
                  <div className="text-right">${splitAmountFormatted}</div>
                  {getMonthlyPaymentDates(payments).flatMap((date, index) => [
                    <div key={`date-${index}`}>{date}</div>,
                    <div key={`amount-${index}`} className="text-right">${splitAmountFormatted}</div>
                  ])}
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
              setProcessingStep={setProcessingStep}
              items={items}
              initialContactInfo={customerInfo}
              onSuccessCallback={onSuccess}
              isPopup={isPopup}
            />
            
            <TrustIndicators />
          </div>
        </Dialog.Panel>
      </div>
      </Dialog>
    </Elements>
  );
}
