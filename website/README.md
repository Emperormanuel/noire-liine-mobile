# Noire Liine (website)

Part of the Stage 3 project. See the [root README](../README.md) for the mobile app, live links and documentation.
An online fashion shop for Nigerian styles (Ankara, Adire, Agbada, Aso-oke and more), built as a bootcamp project.

## Features

- **Shop** with categories, search and price sorting; prices in Nigerian naira (₦)
- **Cart** saved to your account in the database (guests keep a browser cart that merges on sign-in). It updates live across devices, including the mobile app
- **Checkout** that saves each order to the database
- **Google sign-in** (Google Cloud Console OAuth, handled through Supabase Auth)
- **Order history** page for signed-in customers
- **Confirmation emails** sent through Mailgun after each order

## Tech stack

| Part | Tool |
| --- | --- |
| Framework | Next.js 15 (App Router) + React 19 |
| Database + Auth | Supabase (Postgres, Row Level Security) |
| Google login | Google Cloud Console OAuth client |
| Email | Mailgun HTTP API |
| Hosting | Vercel |

## How it works

1. Products are read from the `products` table in Supabase.
2. Customers sign in with Google. Supabase stores the session in cookies.
3. At checkout, the server (`app/api/checkout/route.js`) re-reads prices from the database, so prices cannot be changed from the browser. It saves the order and order items, then sends the email (`lib/mailgun.js`).
4. Row Level Security means customers can only see their own orders.

## Run it locally

1. Install [Node.js](https://nodejs.org) 20 or newer.
2. Install packages:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local` and fill in the values (see below).
4. In the Supabase SQL Editor run `supabase/schema.sql`, then `supabase/migration-fashion.sql`, then `supabase/migration-images.sql`, then `supabase/migration-cart.sql`.
5. Start the app:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000.

## Environment variables

| Name | What it is |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon / publishable key |
| `MAILGUN_API_KEY` | Mailgun sending API key (keep secret) |
| `MAILGUN_DOMAIN` | Mailgun domain (sandbox or your own) |
| `MAILGUN_FROM` | Sender, e.g. `Noire Liine <postmaster@your-domain>` |
| `MAILGUN_API_URL` | `https://api.mailgun.net` (US) or `https://api.eu.mailgun.net` (EU) |

Never commit `.env.local`. It is listed in `.gitignore`.

## Setting up the services

Step-by-step instructions for Supabase, Google Cloud Console and Mailgun are in [SETUP.md](SETUP.md).

When the site is deployed, add the live URL to:
- Supabase: Authentication, URL Configuration (Site URL and Redirect URLs)
- Google Cloud Console: OAuth client, Authorized JavaScript origins

## Project structure

```
app/            Pages and API routes (shop, cart, checkout, orders, login)
components/     Header and add-to-cart button
lib/            Supabase clients, cart state, Mailgun, formatting, site name
public/products Product photos
supabase/       SQL for the database
```

## Notes

- This is a demo shop. No real payment is taken at checkout.
- A Mailgun sandbox domain only delivers to recipients authorized in the Mailgun dashboard. Use a verified domain to email any customer.

