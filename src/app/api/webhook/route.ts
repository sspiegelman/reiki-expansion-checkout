import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

interface StripeError extends Error {
  type?: string;
  code?: string;
  decline_code?: string;
  payment_intent?: {
    id: string;
    status: string;
  };
}

interface WebhookItem {
  name: string;
  price: number;
}

interface WebhookData {
  event: string;
  customer?: {
    email?: string | null;
    name?: string | null;
    phone?: string | null;
    address?: Stripe.Address | null;
  };
  purchase?: {
    items: WebhookItem[];
    total: number | null;
    isFullExperience: boolean;
    hasReattunement: boolean;
  };
  payment: {
    status: string;
    id: string | null;
    amount?: number;
    error?: string | null;
  };
}

async function sendToMake(data: WebhookData) {
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

    console.log('Successfully sent to Make.com:', {
      event: data.event,
      customer: data.customer?.email,
      payment_id: data.payment?.id
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error sending to Make.com:', {
      message: err.message,
      data: {
        event: data.event,
        customer: data.customer?.email,
        payment_id: data.payment?.id
      }
    });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.status !== 'complete') {
    console.log('Skipping webhook, session not complete');
    return;
  }

  const items = session.metadata?.items ? JSON.parse(session.metadata.items) as WebhookItem[] : [];
  
  console.log('Processing completed checkout:', {
    session_id: session.id,
    customer: session.customer_details?.email,
    items: items.map(i => i.name)
  });

  await sendToMake({
    event: 'checkout.session.completed',
    customer: {
      email: session.customer_details?.email,
      name: session.customer_details?.name,
      phone: session.customer_details?.phone,
      address: session.customer_details?.address ? {
        city: session.customer_details.address.city,
        country: session.customer_details.address.country,
        line1: session.customer_details.address.line1,
        line2: session.customer_details.address.line2 || null,
        postal_code: session.customer_details.address.postal_code,
        state: session.customer_details.address.state
      } : null
    },
    purchase: {
      items,
      total: session.amount_total,
      isFullExperience: items.some(i => i.name === "Reiki Expansion & Reactivation: A Five-Part Immersive Course"),
      hasReattunement: items.some(i => i.name.includes("Re-Attunement"))
    },
    payment: {
      status: 'completed',
      id: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null
    }
  });
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Webhook configuration error:', {
      has_signature: !!signature,
      has_secret: !!process.env.STRIPE_WEBHOOK_SECRET
    });
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log('Received webhook event:', {
      type: event.type,
      id: event.id
    });

    if (event.type === 'checkout.session.completed') {
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
    } else {
      console.log('Ignoring webhook event:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const err = error as StripeError;
    console.error('Webhook error:', {
      message: err.message,
      type: err.type,
      code: err.code,
      decline_code: err.decline_code,
      payment_intent: err.payment_intent
    });
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}
