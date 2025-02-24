# Reiki Expansion Course Checkout

A clean, modern checkout page for the Reiki Expansion & Reactivation course built with Next.js 14 and Tailwind CSS.

## Features

- Individual class selection or bundle pricing
- Optional Re-Attunement add-on
- Stripe hosted checkout integration
- Make.com integration for Keap CRM
- Responsive design
- TypeScript support

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables in `.env.local`:
```
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
MAKE_WEBHOOK_URL=your_make_webhook_url
THANK_YOU_URL=optional_thank_you_page_url
```

3. Run the development server:
```bash
npm run dev
```

## Stripe Setup

1. Create products in Stripe dashboard
2. Set up webhook endpoint: `/api/webhook`
3. Configure webhook secret in `.env.local`

## Make.com Integration

The webhook endpoint sends the following data to Make.com:

- Customer information (name, email, phone, address)
- Order details (amount, currency, payment status)
- Selected courses
- Re-Attunement status

## Deployment

1. Push to GitHub repository
2. Deploy to Vercel:
```bash
vercel
```

3. Configure environment variables in Vercel dashboard
4. Update Stripe webhook endpoint to production URL

## Development

- `src/components/` - React components
- `src/app/` - Next.js pages and API routes
- `src/lib/` - Utility functions
- `src/types/` - TypeScript definitions
- `src/config/` - Course configuration
