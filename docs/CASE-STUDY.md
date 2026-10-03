# Case study: taking a web shop to a phone

## The brief

Build a mobile app for the existing Noire Liine shop, using the same API. Three requirements:

1. The same account must work on the website and the app.
2. An item added to the cart on the website must appear **instantly** in the app's cart.
3. Everything must be tested on a physical phone.

## Key decisions

| Decision | Why |
| --- | --- |
| **Move the cart from the browser into the database** | A browser's `localStorage` is private to one device, so no mobile app could ever see it. A shared cart needs a shared store. |
| **Use Supabase Realtime instead of polling** | The database pushes changes to every device the moment they happen. It is faster than refreshing on a timer and wastes less traffic. |
| **Expo (React Native)** | The shop was already JavaScript and React. Expo lets you test on a real phone by scanning a QR code, then build an installable Android app in the cloud with no Android Studio. |
| **Talk to Supabase directly for products and cart, and to `/api/checkout` for orders** | Reads are safe because of Row Level Security. Checkout needs server-side rules (recheck prices, send email), so it stays an API route that both clients share. |
| **Keep the guest cart in the browser, then merge it on sign-in** | Visitors can shop without an account, and nothing they added is lost when they sign in. |

## Challenges and how they were solved

### 1. The cart could not be shared

**Symptom:** the requirement was impossible as the site stood.
**Cause:** the cart lived in `localStorage`.
**Fix:** a `cart_items` table with Row Level Security and Realtime, and a rewritten `lib/cart.js` that keeps the same functions (`add`, `setQty`, `clear`), so no page had to change.

### 2. The app could not call the checkout API

**Symptom:** the website's API route only understood browser cookies.
**Cause:** native apps do not send cookies.
**Fix:** `/api/checkout` now also accepts `Authorization: Bearer <token>` and validates it with Supabase's `getUser(token)`. One endpoint, two ways to prove identity.

### 3. Google sign-in would not return to the app

This took the longest.

**Symptom:** the user signed in on Google, then ended up on the website instead of back in the app.
**What I ruled out:** the Supabase Redirect URL list was correct (an exact entry for the app's address and a wildcard). The app reported the address it expected. A test against the authorise endpoint showed the request was well formed.
**What the evidence showed:** the browser always ended on `https://<site>/?code=...`. That is the **Site URL**, which Supabase uses as a fallback when it rejects a return address.
**Fix:** route the sign-in through a relay page on the website, `/auth/mobile`. Supabase accepts any return address on the same site as its Site URL. The relay page checks that the final address is the app's own (`exp://`, `exps://` or `noireliine://`, never an arbitrary site) and forwards the login code to it. The app then exchanges the code for a session.
**Lesson:** when a service silently falls back, look at *where it ends up*. That address, not the error message, tells you which rule was applied.

### 4. A related bug: redirect to `0.0.0.0`

**Symptom:** after signing in on the computer, the browser tried to open `http://0.0.0.0:3000/checkout` and failed.
**Cause:** the development server was started with `-H 0.0.0.0` so a phone could reach it, and the sign-in callback built its redirect from the server's own idea of its address.
**Fix:** build the redirect from the `Host` header (the address the browser actually used).

### 5. The bottom tabs were off-screen on Android

**Symptom:** the Account tab, needed to sign in, could not be found.
**Cause:** current Android draws apps underneath the system bars. React Native's built-in `SafeAreaView` ignores that on Android, so the tab bar sat behind the navigation bar.
**Fix:** `react-native-safe-area-context`, which measures the real top and bottom insets.

### 6. Tooling and environment problems

- A **flaky network** (phone hotspot) dropped large downloads with `ECONNRESET`. Installing the build tool globally with retry flags fixed it.
- **Email-code sign-in** was considered as a redirect-free backup. Supabase's free built-in email sender does not allow editing the email template, which the code approach needs, so it was dropped once the relay page worked.
- The first deploy was blocked by an automated safety check on production deploys, so the final deploy command was run by the owner. That is the right default for something that changes a public site.

## What I would do next

- Replace the weaker PKCE fallback (`plain`) with SHA-256 by adding a Web Crypto polyfill, so mobile sign-in uses the stronger method. This is visible as a console warning today.
- Real payments (a provider's test mode first).
- An iPhone build, which needs a paid Apple developer account.
- Push notifications for order updates.
- Automated tests around the cart merge and the checkout route.

## What this project demonstrates

Full-stack work across a database with security rules, a web app, an API, a mobile app, real-time data, OAuth, cloud builds and deployment, plus the debugging habit of finding the evidence before changing code.
