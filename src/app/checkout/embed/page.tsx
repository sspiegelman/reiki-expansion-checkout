'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { COURSES, REATTUNEMENT } from '@/config/courses';
import { CheckoutModal } from '@/components/CheckoutModal';
import { TrustIndicators } from '@/components/TrustIndicators';
import { SuccessMessage } from '@/components/checkout/SuccessMessage';

/**
 * Embedded checkout page designed to be opened in a popup window
 * Accepts URL parameters:
 * - classId: The ID of the class to purchase (e.g., class-1, class-2, etc.)
 * - customerEmail: Pre-filled customer email
 * - customerName: Pre-filled customer name
 * - returnUrl: URL to redirect to after successful purchase
 * - popup: Set to 'true' if opened in a popup window
 */
export default function EmbeddedCheckoutPage() {
  const searchParams = useSearchParams();
  
  // Get parameters from URL
  const classId = searchParams.get('classId');
  const customerEmail = searchParams.get('customerEmail');
  const customerName = searchParams.get('customerName');
  const returnUrl = searchParams.get('returnUrl');
  const isPopup = searchParams.get('popup') === 'true';
  
  // State for checkout
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [includeReattunement, setIncludeReattunement] = useState(false);
  const [paymentOption, setPaymentOption] = useState<'full' | 'split-2' | 'split-3'>('full');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'initial' | 'success'>('initial');
  const [successfulPaymentIntentId, setSuccessfulPaymentIntentId] = useState<string | null>(null);
  
  // Find the selected course
  const selectedCourse = classId ? COURSES.find(course => course.id === classId) : null;
  
  // Set up initial state based on URL parameters
  useEffect(() => {
    if (classId) {
      setSelectedCourses([classId]);
    }
    
    // Auto-open the modal after a short delay
    const timer = setTimeout(() => {
      setIsModalOpen(true);
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [classId]);
  
  // Handle successful purchase
  const handlePurchaseSuccess = (paymentIntentId: string) => {
    // Set payment status to success and store the payment intent ID
    setPaymentStatus('success');
    setSuccessfulPaymentIntentId(paymentIntentId);
    setIsModalOpen(false);
    
    // Optional: Notify parent window about successful purchase
    if (window.opener && isPopup) {
      try {
        // Post a message to the parent window
        window.opener.postMessage({
          type: 'PURCHASE_SUCCESS',
          paymentIntentId: paymentIntentId
        }, '*');
      } catch (error) {
        console.error('Error posting message to parent window:', error);
      }
    }
  };
  
  // Handle final close (after success message)
  const handleFinalClose = () => {
    // If in popup, close the window
    if (isPopup) {
      window.close();
    } else {
      // If not in popup, redirect to success page
      if (successfulPaymentIntentId) {
        if (returnUrl) {
          const url = returnUrl.includes('?') 
            ? `${returnUrl}&payment_intent=${successfulPaymentIntentId}` 
            : `${returnUrl}?payment_intent=${successfulPaymentIntentId}`;
          window.location.href = url;
        } else {
          window.location.href = `/success?payment_intent=${successfulPaymentIntentId}`;
        }
      }
    }
  };
  
  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    
    // If in popup, close the window when modal is closed
    if (isPopup) {
      window.close();
    }
  };
  
  // Get selected items for checkout
  const getSelectedItems = () => {
    const items = [];
    
    // Add selected course
    if (selectedCourse) {
      items.push({
        name: selectedCourse.title,
        price: selectedCourse.price
      });
    }
    
    // Add re-attunement if selected
    if (includeReattunement) {
      items.push({
        name: REATTUNEMENT.title,
        price: REATTUNEMENT.price
      });
    }
    
    return items;
  };
  
  // Calculate payment schedule
  const getPaymentSchedule = () => {
    const totalAmount = getSelectedItems().reduce((sum, item) => sum + item.price, 0);
    
    let splitAmount = totalAmount;
    let payments = 1;
    
    if (paymentOption === 'split-2') {
      splitAmount = Math.round(totalAmount / 2);
      payments = 2;
    } else if (paymentOption === 'split-3') {
      splitAmount = Math.round(totalAmount / 3);
      payments = 3;
    }
    
    return {
      splitAmount,
      totalAmount,
      payments
    };
  };
  
  return (
    <main className={`min-h-screen py-6 px-4 ${isPopup ? 'max-w-full' : 'max-w-lg mx-auto'}`}>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary mb-4"></div>
          <p className="text-lg font-medium text-gray-800">Loading checkout...</p>
        </div>
      ) : paymentStatus === 'success' && successfulPaymentIntentId ? (
        // Show success message after successful payment
        <SuccessMessage
          paymentIntentId={successfulPaymentIntentId}
          items={getSelectedItems()}
          paymentSchedule={getPaymentSchedule()}
          onClose={handleFinalClose}
        />
      ) : (
        // Show checkout form
        <>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Complete Your Purchase
            </h1>
            
            {selectedCourse && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                <h2 className="text-xl font-semibold">{selectedCourse.title}</h2>
                <p className="mt-2 text-gray-600">{selectedCourse.description}</p>
                <p className="mt-3 text-2xl font-bold text-primary">
                  ${(selectedCourse.price / 100).toFixed(2)}
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-6 space-y-4">
            {/* Payment Options */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Payment Options:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentOption('full')}
                  className={`py-2.5 px-4 text-sm rounded-lg border transition-colors text-center font-medium ${
                    paymentOption === 'full'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-primary/30 text-gray-700'
                  }`}
                >
                  Pay in full
                </button>
                <button
                  onClick={() => setPaymentOption('split-2')}
                  className={`py-2.5 px-4 text-sm rounded-lg border transition-colors text-center font-medium ${
                    paymentOption === 'split-2'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-primary/30 text-gray-700'
                  }`}
                >
                  2 payments
                </button>
                <button
                  onClick={() => setPaymentOption('split-3')}
                  className={`py-2.5 px-4 text-sm rounded-lg border transition-colors text-center font-medium ${
                    paymentOption === 'split-3'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-primary/30 text-gray-700'
                  }`}
                >
                  3 payments
                </button>
              </div>
            </div>
            
            {/* Checkout Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-3 px-4 text-white font-medium rounded-lg transition-colors bg-primary hover:bg-primary/90"
            >
              <span>Proceed to Checkout</span>
              <span className="ml-1">•</span>
              <span className="ml-1 font-bold">
                ${(getSelectedItems().reduce((sum, item) => sum + item.price, 0) / 100).toFixed(2)}
              </span>
            </button>
            
            {/* Trust Indicators */}
            <div className="mt-6">
              <TrustIndicators />
            </div>
          </div>
          
          {/* Checkout Modal */}
          <CheckoutModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            items={getSelectedItems()}
            paymentSchedule={getPaymentSchedule()}
            customerInfo={{
              fullName: customerName || '',
              email: customerEmail || '',
              phone: ''
            }}
            onSuccess={handlePurchaseSuccess}
            isPopup={isPopup}
          />
        </>
      )}
    </main>
  );
}
