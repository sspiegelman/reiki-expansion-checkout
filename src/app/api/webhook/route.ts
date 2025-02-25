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
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const metadata = paymentIntent.metadata;

        console.log('Processing successful payment:', {
          payment_intent_id: paymentIntent.id,
          amount: paymentIntent.amount,
          metadata
        });

        // Parse customer info
        const contactInfo = JSON.parse(metadata.contact_info || '{}');
        console.log('Customer info:', contactInfo);

        // Send to Make.com webhook
        try {
          const makeResponse = await fetch(process.env.MAKE_WEBHOOK_URL!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'payment.succeeded',
              timestamp: new Date().toISOString(),
              customer: {
                fullName: contactInfo.fullName,
                email: contactInfo.email,
                phone: contactInfo.phone
              },
              payment: {
                id: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: 'succeeded',
                paymentType: metadata.type,
                paymentNumber: metadata.payment_number,
                totalPayments: metadata.total_payments,
                totalAmount: metadata.total_amount
              },
              items: JSON.parse(metadata.items || '[]')
            })
          });

          if (!makeResponse.ok) {
            console.error('Make.com webhook failed:', await makeResponse.text());
          } else {
            console.log('Successfully sent to Make.com');
          }
        } catch (error) {
          console.error('Error sending to Make.com:', error);
        }

        return NextResponse.json({ success: true });
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const metadata = paymentIntent.metadata;
        const contactInfo = JSON.parse(metadata.contact_info || '{}');
        
        console.log('Payment failed:', {
          payment_intent_id: paymentIntent.id,
          error: paymentIntent.last_payment_error
        });

        // Send failure to Make.com
        try {
          const makeResponse = await fetch(process.env.MAKE_WEBHOOK_URL!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'payment.failed',
              timestamp: new Date().toISOString(),
              customer: {
                fullName: contactInfo.fullName,
                email: contactInfo.email,
                phone: contactInfo.phone
              },
              payment: {
                id: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: 'failed',
                error: paymentIntent.last_payment_error?.message,
                paymentType: metadata.type,
                paymentNumber: metadata.payment_number,
                totalPayments: metadata.total_payments,
                totalAmount: metadata.total_amount
              },
              items: JSON.parse(metadata.items || '[]')
            })
          });

          if (!makeResponse.ok) {
            console.error('Make.com webhook failed:', await makeResponse.text());
          } else {
            console.log('Successfully sent failure to Make.com');
          }
        } catch (error) {
          console.error('Error sending to Make.com:', error);
        }

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
