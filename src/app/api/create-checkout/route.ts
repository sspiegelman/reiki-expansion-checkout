import { NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe';

interface StripeError extends Error {
  type?: string;
  code?: string;
}

interface CheckoutItem {
  name: string;
  price: number;
  description?: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, options } = body as {
      items: CheckoutItem[];
      options: {
        payment_schedule?: {
          total_amount: number;
          split_amount: number;
          payments: number;
          payment_description: string;
        };
      };
    };

    console.log('Creating checkout session:', {
      items,
      options,
      payment_schedule: options?.payment_schedule
    });

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // Add payment schedule to items if using split payments
    let checkoutItems = items;
    let metadata: Record<string, string> = {
      items: JSON.stringify(items)
    };

    if (options?.payment_schedule) {
      const { split_amount, payments, total_amount } = options.payment_schedule;

      // Create line items with actual prices
      checkoutItems = [
        {
          name: "First Payment Today",
          price: split_amount
        },
        ...items.map(item => ({
          name: item.name,
          price: item.price
        }))
      ];

      metadata = {
        ...metadata,
        total_amount: total_amount.toString(),
        split_amount: split_amount.toString(),
        payments_remaining: (payments - 1).toString()
      };
    }

    const session = await createCheckoutSession(checkoutItems, undefined, {
      metadata,
      mode: 'payment',
      payment_method_types: ['card']
    });

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
