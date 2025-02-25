import { useState } from 'react';
import { Course, ReattunementOption, PaymentOption, PaymentDetails } from '@/types';
import { BUNDLE_PRICE } from '@/config/courses';
import { CheckoutModal } from './CheckoutModal';

interface CheckoutButtonProps {
  selectedCourses: string[];
  includeReattunement: boolean;
  courses: Course[];
  reattunement: ReattunementOption;
  disabled: boolean;
  paymentOption?: 'full' | 'split-2' | 'split-3';
  onPaymentOptionChange: (option: 'full' | 'split-2' | 'split-3') => void;
}

export function CheckoutButton({
  selectedCourses,
  includeReattunement,
  courses,
  reattunement,
  disabled,
  paymentOption = 'full',
  onPaymentOptionChange
}: CheckoutButtonProps) {
  const getPaymentOptions = (): PaymentDetails[] => {
    // Calculate total based on selected items
    let total = selectedCourses.length === courses.length
      ? BUNDLE_PRICE // $395
      : selectedCourses.length * 9500; // $95 per class

    // Add re-attunement if selected
    if (includeReattunement) {
      total += reattunement.price; // Add $97
    }

    if (total === 0) return [];

    const totalFormatted = (total / 100).toFixed(2);

    // Format payment options
    const options = [];

    // Full payment
    options.push({
      type: 'full' as const,
      label: `Pay in full: $${totalFormatted}`,
      amount: total
    });

    // 2 payments
    const twoPaymentAmount = Math.round(total / 2);
    options.push({
      type: 'split-2' as const,
      label: `2 payments × $${(twoPaymentAmount / 100).toFixed(2)}`,
      amount: total,
      splitAmount: twoPaymentAmount
    });

    // 3 payments
    const threePaymentAmount = Math.round(total / 3);
    options.push({
      type: 'split-3' as const,
      label: `3 payments × $${(threePaymentAmount / 100).toFixed(2)}`,
      amount: total,
      splitAmount: threePaymentAmount
    });

    return options;
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCheckout = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const getSelectedItems = () => {
    const items = [];
    
    // Calculate course prices
    if (selectedCourses.length === courses.length) {
      // Bundle price for all classes
      items.push({
        name: "Reiki Expansion & Reactivation: A Five-Part Immersive Course",
        price: BUNDLE_PRICE
      });
    } else {
      // Individual class prices
      selectedCourses.forEach(courseId => {
        const course = courses.find(c => c.id === courseId)!;
        items.push({
          name: course.title,
          price: course.price
        });
      });
    }

    // Add re-attunement if selected
    if (includeReattunement) {
      items.push({
        name: reattunement.title,
        price: reattunement.price
      });
    }

    return items;
  };

  return (
    <>
      <div className="space-y-4">
        {selectedCourses.length === courses.length && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Payment Options:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {getPaymentOptions().map((option) => (
                <button
                  key={option.type}
                  onClick={() => onPaymentOptionChange(option.type as PaymentOption)}
                  className={`py-2.5 px-4 text-sm rounded-lg border transition-colors text-center font-medium ${
                    paymentOption === option.type
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 hover:border-primary/30 text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-6">
          <div className="flex-1">
            <button
              onClick={handleCheckout}
              disabled={disabled}
              className={`w-full py-3 px-4 text-white font-medium rounded-lg transition-colors ${
                disabled
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90'
              }`}
            >
              Proceed to Checkout
            </button>
          </div>
          
          {/* Order Summary */}
          {!disabled && (
            <div className="text-right">
              <div className="text-sm text-gray-600">Total Order:</div>
              <div className="font-semibold text-lg">
                ${(getSelectedItems().reduce((sum, item) => sum + item.price, 0) / 100).toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal for all payments */}
      <CheckoutModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        items={getSelectedItems()}
        paymentSchedule={{
          splitAmount: selectedCourses.length === courses.length && paymentOption !== 'full'
            ? paymentOption === 'split-2'
              ? Math.round(getSelectedItems().reduce((sum, item) => sum + item.price, 0) / 2)
              : Math.round(getSelectedItems().reduce((sum, item) => sum + item.price, 0) / 3)
            : getSelectedItems().reduce((sum, item) => sum + item.price, 0),
          totalAmount: getSelectedItems().reduce((sum, item) => sum + item.price, 0),
          payments: selectedCourses.length === courses.length && paymentOption !== 'full'
            ? paymentOption === 'split-2' ? 2 : 3
            : 1
        }}
      />
    </>
  );
}
