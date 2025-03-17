import { redirect } from 'next/navigation';
import { isAfterCourse, getNextClassPage } from '@/lib/checkout/date-utils';

/**
 * Live checkout page that redirects users to the appropriate class page
 * - If after course: Redirect to /checkout/closed
 * - Otherwise: Redirect to the next class page
 */
export default function LiveCheckoutPage() {
  if (isAfterCourse()) {
    redirect('/checkout/closed');
  } else {
    redirect(getNextClassPage());
  }
  
  // This will never be rendered, but is required for TypeScript
  return null;
}
