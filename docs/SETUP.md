# Setup, run, build and deploy

How to run the whole project yourself, from nothing to an installed Android app.

## 1. Prerequisites

- Node.js 20 or newer
- A free [Supabase](https://supabase.com) project
- A Google Cloud OAuth client (for Google sign-in), connected in Supabase under Authentication, Sign In / Providers
- (Optional) a [Mailgun](https://www.mailgun.com) account for order confirmation emails
- (Optional) a [Vercel](https://vercel.com) account to host the website
- (Optional) an [Expo](https://expo.dev) account to build the Android APK
- A phone with the **Expo Go** app, for development testing

## 2. Database

In the Supabase SQL Editor, run these files from `website/supabase/` in order:

1. `schema.sql`: products, orders, order items and their security rules
2. `migration-fashion.sql`: fashion catalogue
3. `migration-images.sql`: product photo paths
4. `migration-cart.sql`: **the shared cart** (`cart_items` table, Row Level Security, Realtime)

## 3. Supabase sign-in settings

Authentication, URL Configuration:

- **Site URL:** your live website address (for example `https://noire-liine.vercel.app`)
- **Redirect URLs:** add `http://localhost:3000/**`, your live website address followed by `/**`, `exp://**` and `noireliine://**`

## 4. Website

```bash
cd website
cp .env.example .env.local   # then fill in the values
npm install
npm run dev
```

Open http://localhost:3000.

To deploy: `vercel deploy --prod` from the `website` folder (link the project once with `vercel link`).

## 5. Mobile app

```bash
cd mobile
cp .env.example .env
```

Fill in `.env`:

| Name | Value |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | the same Supabase project URL as the website |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | the same publishable (anon) key |
| `EXPO_PUBLIC_SITE_URL` | the live website address, for example `https://noire-liine.vercel.app` |

Then:

```bash
npm install
npx expo start -c
```

Scan the QR code with Expo Go (Android) or the Camera app (iPhone). Phone and computer must be on the same network.

## 6. Build the installable Android app (APK)

```bash
npm install -g eas-cli
eas login
cd mobile
eas build -p android --profile preview
```

The build runs on Expo's servers (about 15 to 30 minutes on the free plan). When it finishes you get a download link and a QR code. Open it on an Android phone and install. Android will ask you to allow installs from that source.

`mobile/eas.json` already bakes in the public settings the app needs. Replace them with your own values if you use a different Supabase project or website address.

## 7. Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| Google sign-in ends on the website instead of in the app | The return address is not accepted by Supabase. See `docs/CASE-STUDY.md`, challenge 3. The relay page `/auth/mobile` must be deployed on the same site as your Supabase Site URL |
| Cart label says `closed` or `channel_error` | `migration-cart.sql` has not been run, or Realtime is not enabled for `cart_items` |
| Cart on the phone is empty but items exist on the website | The items were added while signed out. Guest carts live in the browser until sign-in |
| "Cannot reach the website" at checkout | `EXPO_PUBLIC_SITE_URL` is wrong or the website is down |
| Bottom tabs hidden on Android | Fixed by `react-native-safe-area-context`. Make sure it is installed |
| `ECONNRESET` during `npm install` | Unstable connection. Retry with `--fetch-retries=5` |
