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

        // Parse the full name into first and last name
        const nameParts = contactInfo.fullName ? contactInfo.fullName.trim().split(/\s+/) : [];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Send to Make.com webhook
        try {
          // Check if MAKE_WEBHOOK_URL is set
          if (!process.env.MAKE_WEBHOOK_URL) {
            console.error('MAKE_WEBHOOK_URL is not set in environment variables');
            return NextResponse.json({ error: 'Webhook URL not configured' }, { status: 500 });
          }
          
          // Log the webhook URL (redacted for security)
          const redactedUrl = process.env.MAKE_WEBHOOK_URL.replace(/\/[^\/]+$/, '/***');
          console.log('Sending to Make.com webhook:', redactedUrl);
          
          // Parse items from metadata
          const items = JSON.parse(metadata.items || '[]');
          
          // Prepare the payload for Make.com - keeping original values in cents
          const makePayload = {
            event: 'payment.succeeded',
            timestamp: new Date().toISOString(),
            customer: {
              fullName: contactInfo.fullName,
              firstName: firstName,
              lastName: lastName,
              email: contactInfo.email,
              phone: contactInfo.phone
            },
            payment: {
              id: paymentIntent.id,
              amount: paymentIntent.amount, // Original amount in cents
              currency: paymentIntent.currency,
              status: 'succeeded',
              paymentType: metadata.type,
              paymentNumber: metadata.payment_number,
              totalPayments: metadata.total_payments,
              totalAmount: metadata.total_amount // Original total amount in cents
            },
            items: items // Original items with prices in cents
          };

          // Log the payload being sent to Make.com
          console.log('Sending payload to Make.com:', JSON.stringify(makePayload, null, 2));

          const makeResponse = await fetch(process.env.MAKE_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(makePayload)
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

        // Log payment failure details but don't send to Make.com
        console.log('Payment failed details:', {
          customer: contactInfo,
          payment: {
            id: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
            error: paymentIntent.last_payment_error?.message
          },
          metadata
        });

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
