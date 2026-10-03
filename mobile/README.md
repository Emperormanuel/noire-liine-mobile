# Noire Liine mobile app

Expo (React Native) app for the Noire Liine shop. It signs in to the same Supabase project as the website and shares the same live cart.

```bash
cp .env.example .env     # fill in the Supabase values and the live website address
npm install
npx expo start -c        # scan the QR code with Expo Go
```

Build an installable Android APK: `eas build -p android --profile preview`.

Full instructions: [../docs/SETUP.md](../docs/SETUP.md). How it works: [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md).

| Folder | Contents |
| --- | --- |
| `lib/supabase.js` | Supabase client (same project as the website), price formatting, image URLs |
| `lib/auth.js` | Google sign-in through the website's relay page |
| `lib/cart.js` | Database-backed cart with Realtime updates |
| `screens/` | Shop, Cart (with checkout), Orders, Account |
