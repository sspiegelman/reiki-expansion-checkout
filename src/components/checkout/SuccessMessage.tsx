import { useState, useEffect } from 'react';

interface SuccessMessageProps {
  paymentIntentId: string;
  items: {
    name: string;
    price: number;
  }[];
  paymentSchedule: {
    splitAmount: number;
    totalAmount: number;
    payments: number;
  };
  onClose: () => void;
}

export function SuccessMessage({ 
  paymentIntentId, 
  items, 
  paymentSchedule,
  onClose 
}: SuccessMessageProps) {
  const [isClosing, setIsClosing] = useState(false);
  const { splitAmount, totalAmount, payments } = paymentSchedule;
  
  // Add a subtle animation to the logout/login instruction
  useEffect(() => {
    const interval = setInterval(() => {
      const element = document.getElementById('logout-instruction');
      if (element) {
        element.classList.toggle('bg-yellow-100');
        element.classList.toggle('bg-yellow-50');
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };
  
  return (
    <div className={`transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900">
          Thank You for Your Purchase!
        </h1>
        
        <p className="mt-2 text-gray-600">
          Your payment has been successfully processed.
        </p>
      </div>
      
      {/* Important Logout Instruction */}
      <div 
        id="logout-instruction"
        className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 mb-6 transition-colors duration-1000"
      >
        <div className="flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-medium text-yellow-800">Important:</p>
            <p className="text-yellow-700">
              Please log out and log back in to your account to access your newly purchased class(es).
            </p>
          </div>
        </div>
      </div>
      
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Order Summary:</h2>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between text-gray-600">
              <span>{item.name}</span>
              <span>${(item.price / 100).toFixed(2)}</span>
            </div>
          ))}
          
          <div className="border-t pt-2 flex justify-between font-semibold text-gray-900">
            <span>Total Value</span>
            <span>${(totalAmount / 100).toFixed(2)}</span>
          </div>
          
          {payments > 1 ? (
            <>
              <div className="flex justify-between text-gray-700">
                <span>Amount Paid Today</span>
                <span>${(splitAmount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Payment Plan</span>
                <span>{payments} payments</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Remaining Payments</span>
                <span>
                  {payments - 1} × ${(splitAmount / 100).toFixed(2)}
                </span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-gray-700">
              <span>Amount Paid</span>
              <span>${(splitAmount / 100).toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Next Steps */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Next Steps:</h2>
        <ol className="list-decimal pl-5 space-y-2 text-gray-600">
          <li>Log out and log back in to your account</li>
          <li>Navigate to the course section of your membership area</li>
          <li>Your new class(es) will be available in your dashboard</li>
          <li>Check your email for additional information</li>
        </ol>
      </div>
      
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="w-full py-3 px-4 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
      >
        Close
      </button>
    </div>
  );
}
