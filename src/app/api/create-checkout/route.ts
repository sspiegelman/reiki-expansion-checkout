import { NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';

interface StripeError extends Error {
  type?: string;
  code?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, options } = body;

    console.log('Creating checkout session:', {
      items,
      options,
      mode: options?.mode,
      subscription_data: options?.subscription_data
    });

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const session = await createCheckoutSession(items, undefined, options);
    console.log('Checkout session created:', {
      id: session.id,
      mode: session.mode,
      payment_method_types: session.payment_method_types
    });

    return NextResponse.json({
      sessionId: session.id
    });
  } catch (error: unknown) {
    const stripeError = error as StripeError;
    console.error('Error creating checkout session:', {
      message: stripeError.message,
      type: stripeError.type,
      code: stripeError.code,
      stack: stripeError.stack,
      raw: error
    });
    return NextResponse.json(
      { error: stripeError.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
