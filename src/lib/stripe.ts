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
}

export const createCheckoutSession = async (
  items: { price: number; name: string }[],
  customerEmail?: string,
  options?: CheckoutOptions
) => {
  const lineItems = items.map((item) => {
    const priceData = options?.mode === 'subscription'
      ? {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.floor(item.price / (options.subscription_data?.trial_period_days === 30 ? 2 : 3)),
          recurring: {
            interval: 'month' as Stripe.Price.Recurring.Interval,
            interval_count: 1
          }
        }
      : {
          currency: 'usd',
          product_data: {
            name: item.name,
          },
          unit_amount: item.price,
        };

    return {
      price_data: priceData,
      quantity: 1,
    };
  });

  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: options?.mode || 'payment',
    payment_method_types: options?.payment_method_types || ['card'] as Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
    payment_method_collection: options?.mode === 'subscription' ? 'always' : undefined,
    subscription_data: options?.subscription_data,
    success_url: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}`,
    customer_email: customerEmail,
    billing_address_collection: 'required',
    phone_number_collection: {
      enabled: true,
    },
    metadata: {
      items: JSON.stringify(items),
    },
  });

  return session;
};

export const getSessionDetails = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'customer'],
  });
  return session;
};
