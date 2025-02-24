import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
});

export const createCheckoutSession = async (
  items: { price: number; name: string }[],
  customerEmail?: string
) => {
  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
      },
      unit_amount: item.price,
    },
    quantity: 1,
  }));

  const session = await stripe.checkout.sessions.create({
    line_items: lineItems,
    mode: 'payment',
    success_url: `${process.env.VERCEL_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.VERCEL_URL || 'http://localhost:3000'}`,
    customer_email: customerEmail,
    custom_fields: [
      {
        key: 'phone',
        label: { type: 'custom', custom: 'Phone Number' },
        type: 'text',
        optional: false,
      },
      {
        key: 'address',
        label: { type: 'custom', custom: 'Address' },
        type: 'text',
        optional: false,
      },
    ],
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
