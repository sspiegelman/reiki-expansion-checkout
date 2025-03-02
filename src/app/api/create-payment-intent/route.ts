import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

// Define the contact info interface
interface ContactInfo {
  fullName?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, metadata, items } = body;

    // Extract contact info from metadata
    let contactInfo: ContactInfo = {};
    try {
      if (metadata.contact_info) {
        contactInfo = JSON.parse(metadata.contact_info);
      }
    } catch (e) {
      console.warn('Could not parse contact info:', e);
    }

    // Create or retrieve customer if email is available
    let customer: Stripe.Customer | undefined;
    if (contactInfo.email) {
      try {
        // Check for existing customer with this email
        const existingCustomers = await stripe.customers.list({
          email: contactInfo.email,
          limit: 1
        });

        if (existingCustomers.data.length > 0) {
          // Use existing customer
          customer = existingCustomers.data[0] as Stripe.Customer;
          console.log('Using existing customer:', customer.id);
        } else {
          // Create new customer
          customer = await stripe.customers.create({
            email: contactInfo.email,
            name: contactInfo.fullName || '',
            phone: contactInfo.phone || '',
            metadata: {
              source: 'website_checkout'
            }
          });
          console.log('Created new customer:', customer.id);
        }
      } catch (e) {
        // If customer creation fails, log but continue
        console.error('Error creating/finding customer:', e);
      }
    }

    // Build payment intent parameters
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
      setup_future_usage: 'off_session' as Stripe.PaymentIntentCreateParams.SetupFutureUsage,
      metadata: {
        type: metadata.type || 'split_payment',
        payment_number: metadata.payment_number || '1',
        total_payments: metadata.total_payments,
        total_amount: metadata.total_amount?.toString(),
        items: items ? JSON.stringify(items) : '[]',
        ...metadata
      }
    };

    // Add customer ID if available
    if (customer?.id) {
      paymentIntentParams.customer = customer.id;
    }

    // Add receipt_email if available
    if (contactInfo.email) {
      paymentIntentParams.receipt_email = contactInfo.email;
    }

    // Create the payment intent
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
