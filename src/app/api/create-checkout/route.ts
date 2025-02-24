import { NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';

interface StripeError extends Error {
  type?: string;
  code?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const session = await createCheckoutSession(items);

    return NextResponse.json({
      sessionId: session.id
    });
  } catch (error: unknown) {
    const stripeError = error as StripeError;
    console.error('Error creating checkout session:', {
      message: stripeError.message,
      type: stripeError.type,
      code: stripeError.code
    });
    return NextResponse.json(
      { error: stripeError.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
