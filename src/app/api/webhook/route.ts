import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      const error = err as Error;
      console.error('Webhook signature verification failed:', error.message);
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    console.log('Webhook event received:', {
      type: event.type,
      id: event.id
    });

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;

        if (!metadata) {
          console.error('No metadata found in session:', session.id);
          return NextResponse.json(
            { error: 'No metadata found in session' },
            { status: 400 }
          );
        }

        // Parse items from metadata
        const items = JSON.parse(metadata.items);
        console.log('Processing completed checkout session:', {
          session_id: session.id,
          customer_email: session.customer_details?.email,
          items
        });

        // Handle split payments
        if (metadata.payments_remaining) {
          const paymentsRemaining = parseInt(metadata.payments_remaining, 10);
          const splitAmount = parseInt(metadata.split_amount, 10);

          console.log('Processing split payment:', {
            payments_remaining: paymentsRemaining,
            split_amount: splitAmount
          });

          // Create payment schedule for remaining payments
          // This is where you would set up future payments
        }

        // Send confirmation email
        // This is where you would send the confirmation email with course access

        return NextResponse.json({ success: true });
      }

      default: {
        console.log(`Unhandled event type: ${event.type}`);
        return NextResponse.json({ success: true });
      }
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Webhook error:', err.message);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
