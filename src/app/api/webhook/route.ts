import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
  try {
    // Get the raw request body as text (important for signature verification)
    const body = await request.text();
    
    // Get the signature header
    const signature = request.headers.get('stripe-signature') as string;
    
    // Log key information for debugging
    console.log('Webhook received:', {
      signatureExists: !!signature,
      signaturePrefix: signature ? signature.substring(0, 10) + '...' : 'missing',
      bodyLength: body.length,
      bodyPreview: body.substring(0, 50) + '...'
    });

    let event: Stripe.Event;

    try {
      // Verify the signature
      const secret = process.env.STRIPE_WEBHOOK_SECRET!;
      console.log('Using webhook secret:', secret.substring(0, 5) + '...');
      
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        secret
      );
      
      console.log('Webhook signature verified successfully');
    } catch (err) {
      const error = err as Error;
      console.error('Webhook signature verification failed:', {
        error: error.message,
        secretFirstChars: process.env.STRIPE_WEBHOOK_SECRET 
          ? process.env.STRIPE_WEBHOOK_SECRET.substring(0, 5) + '...' 
          : 'missing'
      });
      
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    console.log('Webhook event received:', {
      type: event.type,
      id: event.id,
      livemode: event.livemode
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

        // Get customer info - first try from Stripe customer, then fallback to metadata
        let customerInfo = {};
        let firstName = '';
        let lastName = '';
        
        try {
          if (paymentIntent.customer) {
            // Get customer details from Stripe
            const customer = await stripe.customers.retrieve(paymentIntent.customer as string);
            if (!customer.deleted) {
              console.log('Retrieved customer from Stripe:', customer.id);
              
              // Use customer data from Stripe
              const fullName = customer.name || '';
              const nameParts = fullName.trim().split(/\s+/);
              firstName = nameParts[0] || '';
              lastName = nameParts.slice(1).join(' ') || '';
              
              customerInfo = {
                fullName: customer.name,
                firstName,
                lastName,
                email: customer.email,
                phone: customer.phone
              };
            }
          }
        } catch (error) {
          console.error('Error retrieving customer from Stripe:', error);
        }
        
        // Fallback to metadata if needed
        if (!Object.keys(customerInfo).length) {
          const contactInfo = JSON.parse(metadata.contact_info || '{}');
          console.log('Using customer info from metadata');
          
          // Parse the full name into first and last name
          const nameParts = contactInfo.fullName ? contactInfo.fullName.trim().split(/\s+/) : [];
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
          
          customerInfo = {
            fullName: contactInfo.fullName,
            firstName,
            lastName,
            email: contactInfo.email,
            phone: contactInfo.phone
          };
        }
        
        console.log('Customer info:', customerInfo);

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
              fullName: (customerInfo as any).fullName,
              firstName: firstName,
              lastName: lastName,
              email: (customerInfo as any).email,
              phone: (customerInfo as any).phone
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

      case 'customer.created': {
        const customer = event.data.object as Stripe.Customer;
        console.log('Customer created:', {
          customer_id: customer.id,
          email: customer.email,
          name: customer.name,
          metadata: customer.metadata
        });
        return NextResponse.json({ success: true });
      }

      case 'customer.updated': {
        const customer = event.data.object as Stripe.Customer;
        console.log('Customer updated:', {
          customer_id: customer.id,
          email: customer.email,
          name: customer.name,
          metadata: customer.metadata
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
