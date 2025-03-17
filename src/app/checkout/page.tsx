import { redirect } from 'next/navigation';
import { isBeforeCourse, isDuringCourse } from '@/lib/checkout/date-utils';

/**
 * Main checkout page that redirects users based on the current date
 * - Before March 18: Redirect to /checkout/full
 * - March 18 - April 1: Redirect to /checkout/live
 * - After April 1: Redirect to /checkout/recordings
 */
export default function CheckoutPage() {
  if (isBeforeCourse()) {
    redirect('/checkout/full');
  } else if (isDuringCourse()) {
    redirect('/checkout/live');
  } else {
    redirect('/checkout/recordings');
  }
  
  // This will never be rendered, but is required for TypeScript
  return null;
}
