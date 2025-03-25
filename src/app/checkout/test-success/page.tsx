'use client';

import { useState, useEffect } from 'react';
import { SuccessMessage } from '@/components/checkout/SuccessMessage';
import { COURSES } from '@/config/courses';

/**
 * Test page for the success message
 * This page is for development and testing only
 */
export default function TestSuccessPage() {
  const [isClosing, setIsClosing] = useState(false);
  
  // Sample data for testing
  const testItems = [
    {
      name: COURSES[2].title, // Class 3
      price: COURSES[2].price
    }
  ];
  
  const testPaymentSchedule = {
    splitAmount: COURSES[2].price,
    totalAmount: COURSES[2].price,
    payments: 1
  };
  
  // Handle close button click
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      // In a real scenario, this would close the popup or redirect
      setIsClosing(false);
      alert('Close button clicked - in a real scenario, this would close the popup');
    }, 300);
  };
  
  return (
    <main className="min-h-screen py-6 px-4 max-w-lg mx-auto">
      <div className="mb-4 p-3 bg-yellow-100 rounded-lg text-yellow-800 text-sm">
        <strong>Test Page:</strong> This page simulates the success message after a successful purchase.
      </div>
      
      <SuccessMessage
        paymentIntentId="pi_test_123456789"
        items={testItems}
        paymentSchedule={testPaymentSchedule}
        onClose={handleClose}
      />
    </main>
  );
}
