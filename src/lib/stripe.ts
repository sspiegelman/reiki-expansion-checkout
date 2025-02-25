import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
});

type PaymentMode = 'payment' | 'subscription';

interface CheckoutOptions {
  mode?: PaymentMode;
  payment_method_types?: Stripe.Checkout.SessionCreateParams.PaymentMethodType[];
  subscription_data?: {
    trial_period_days: number;
    payment_behavior: 'default_incomplete';
  };
  metadata?: Record<string, string>;
}

export const createCheckoutSession = async (
  items: { price: number; name: string; description?: string }[],
  customerEmail?: string,
  options?: CheckoutOptions
) => {
  // Create line items - simple pass-through
  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        description: item.description
      },
      unit_amount: item.price
    },
    quantity: 1
  }));

  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: options?.mode || 'payment',
    payment_method_types: options?.payment_method_types || ['card'],
    success_url: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}`,
    customer_email: customerEmail,
    billing_address_collection: 'required',
    phone_number_collection: {
      enabled: true,
    },
    metadata: options?.metadata || {
      items: JSON.stringify(items)
    }
  });

  return session;
};

export const getSessionDetails = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'customer'],
  });
  return session;
};
