import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

// These interfaces are used in the function parameters
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Item {
  name: string;
  price: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      paymentMethodId, 
      paymentIntentId,
      customerInfo, 
      items, 
      splitAmount, 
      totalPayments 
    } = body;

    console.log('Creating subscription:', {
      paymentMethodId,
      paymentIntentId,
      customerInfo,
      splitAmount,
      totalPayments
    });

    // 1. Create a customer
    const customer = await stripe.customers.create({
      name: customerInfo.fullName,
      email: customerInfo.email,
      phone: customerInfo.phone,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    console.log('Customer created:', {
      id: customer.id,
      email: customer.email
    });

    // 2. Calculate dates for subscription
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(now.getMonth() + 1);
    
    const endDate = new Date(now);
    endDate.setMonth(now.getMonth() + totalPayments - 1); // -1 because first payment is already made

    // 3. Create the subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price_data: {
            currency: 'usd',
            product: process.env.STRIPE_SUBSCRIPTION_PRODUCT_ID || 
              // Fallback: Create a product dynamically if no ID is provided
              (await stripe.products.create({
                name: 'Payment Plan - ' + new Date().toISOString(),
                description: 'Installment payment plan'
              })).id,
            unit_amount: splitAmount,
            recurring: {
              interval: 'month',
              interval_count: 1,
            },
          },
        },
      ],
      billing_cycle_anchor: Math.floor(nextMonth.getTime() / 1000),
      cancel_at: Math.floor(endDate.getTime() / 1000),
      // Prevent immediate billing
      proration_behavior: 'none',
      // Prevent automatic collection for the first cycle
      collection_method: 'send_invoice',
      days_until_due: 30, // Give 30 days to pay (but we won't actually collect)
      metadata: {
        original_payment_intent: paymentIntentId,
        items: JSON.stringify(items),
        total_payments: totalPayments.toString(),
        payment_number: '2', // Starting with 2 since 1 is already paid
      },
    });

    // After creating the subscription, update it to automatic collection for future payments
    await stripe.subscriptions.update(subscription.id, {
      collection_method: 'charge_automatically',
    });

    console.log('Subscription created:', {
      id: subscription.id,
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null
    });

    return NextResponse.json({ 
      success: true, 
      subscription: subscription.id,
      next_payment_date: new Date(subscription.current_period_end * 1000).toISOString()
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error creating subscription:', {
      message: err.message,
      stack: err.stack
    });
    
    return NextResponse.json(
      { error: 'Failed to create subscription', message: err.message },
      { status: 500 }
    );
  }
}
