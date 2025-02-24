import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import type { Stripe } from 'stripe';

async function sendToMake(session: Stripe.Checkout.Session) {
  if (!process.env.MAKE_WEBHOOK_URL) {
    throw new Error('MAKE_WEBHOOK_URL is not set');
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  const customFields = session.custom_fields?.reduce<Record<string, string>>((acc, field) => ({
    ...acc,
    [field.key]: field.text?.value || ''
  }), {}) || {};

  const payload = {
    customer: {
      email: session.customer_details?.email,
      name: session.customer_details?.name,
      phone: customFields?.phone,
      address: customFields?.address,
    },
    order: {
      id: session.id,
      date: new Date(session.created * 1000).toISOString(),
      total_amount: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status,
    },
    products: lineItems.data.map(item => ({
      name: item.description,
      price: item.price?.unit_amount,
      quantity: item.quantity,
    })),
    metadata: session.metadata,
  };

  const response = await fetch(process.env.MAKE_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to send data to Make.com');
  }

  return response.json();
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature found' },
      { status: 400 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await sendToMake(session);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}
