# Snapd

Pocket-sized essential oil nasal inhaler that delivers instant 
alertness in under 3 seconds. No caffeine, no pills, no crash.

## Tech Stack
- **Frontend:** Next.js 14 (App Router), TypeScript
- **Database:** Supabase (Postgres)
- **Payments:** Stripe (one-time + subscriptions)
- **Auth:** Supabase Auth with Google OAuth
- **Deployment:** Vercel

## Features
- Product catalog with 5 scents and 3 intensity levels
- Cart with localStorage persistence
- Stripe checkout for one-time purchases
- Monthly refill subscription via Stripe
- Google OAuth authentication
- Order history and subscription management
- Webhook handler for real-time order status updates

## Getting Started

1. Clone the repo
2. Install dependencies: `npm install`
3. Copy `.env.local.example` to `.env.local` and fill in your keys
4. Run the development server: `npm run dev`

## Environment Variables
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
NEXT_PUBLIC_URL=

## Pages
- `/` — Landing page
- `/shop` — Product catalog
- `/cart` — Shopping cart
- `/about` — About page
- `/login` — Authentication
- `/account` — Order history and subscriptions
- `/success` — Post-checkout confirmation
