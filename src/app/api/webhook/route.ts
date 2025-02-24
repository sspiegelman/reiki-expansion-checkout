import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

async function sendToMake(data: any) {
  if (!process.env.MAKE_WEBHOOK_URL) {
    console.warn('MAKE_WEBHOOK_URL not set, skipping Make.com integration');
    return;
  }

  try {
    const response = await fetch(process.env.MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Make.com webhook failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error sending to Make.com:', error);
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const items = session.metadata?.items ? JSON.parse(session.metadata.items) : [];
  
  await sendToMake({
    event: 'checkout.session.completed',
    customer: {
      email: session.customer_details?.email,
      name: session.customer_details?.name,
      phone: session.customer_details?.phone,
      address: session.customer_details?.address
    },
    purchase: {
      items,
      total: session.amount_total,
      isFullExperience: items.some((i: any) => i.name === "Full 5-Part Experience"),
      hasReattunement: items.some((i: any) => i.name.includes("Re-Attunement"))
    },
    payment: {
      status: 'completed',
      id: session.payment_intent
    }
  });
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  await sendToMake({
    event: 'payment_intent.succeeded',
    payment: {
      status: 'succeeded',
      id: paymentIntent.id,
      amount: paymentIntent.amount
    }
  });
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  await sendToMake({
    event: 'payment_intent.payment_failed',
    payment: {
      status: 'failed',
      id: paymentIntent.id,
      error: paymentIntent.last_payment_error?.message
    }
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
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
