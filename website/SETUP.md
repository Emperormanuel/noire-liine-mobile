# Setup guide (do these in order)

You need 3 free accounts: Supabase, Google Cloud, Mailgun. Do NOT paste secret keys into chat; put them in `.env.local`.

## 1. Supabase (database + login)
1. Go to https://supabase.com -> Sign up -> **New project**. Name it `my-shop`, set a database password (save it), pick a nearby region.
2. Wait ~2 minutes. Open **SQL Editor** -> **New query** -> paste everything from `supabase/schema.sql` -> **Run**. (Creates tables + 6 sample products.)
3. **Project Settings -> API**: copy the **Project URL** and the **anon public** key.
4. Create the file `.env.local` (copy of `.env.example`) and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key
5. **Authentication -> URL Configuration**: set **Site URL** to `http://localhost:3000` and add `http://localhost:3000/**` under **Redirect URLs**.
6. Copy your **Callback URL** from **Authentication -> Sign In / Providers -> Google** (looks like `https://xxxx.supabase.co/auth/v1/callback`). You need it in step 2.

## 2. Google Cloud Console (Google login)
1. Go to https://console.cloud.google.com, sign in, create a **New Project** (name: `my-shop`).
2. **APIs & Services -> OAuth consent screen** (may be called "Google Auth Platform"): choose **External**, fill app name + your email, save. Under **Audience/Test users** add your own Gmail (and anyone else who will test).
3. **Credentials -> Create credentials -> OAuth client ID** -> type **Web application**:
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: the Supabase **Callback URL** from step 1.6
4. Copy the **Client ID** and **Client secret**.
5. Back in Supabase: **Authentication -> Sign In / Providers -> Google** -> enable, paste Client ID + Secret -> Save.

## 3. Mailgun (confirmation emails)
1. Go to https://www.mailgun.com -> sign up (free plan).
2. **Sending -> Domains**: use the **sandbox domain** (looks like `sandboxXXXX.mailgun.org`).
3. Sandbox only sends to approved addresses: on the sandbox domain page, add your Gmail under **Authorized Recipients** and click the verification link Mailgun emails you.
4. **API keys**: create/copy your **Private API key**.
5. In `.env.local` set `MAILGUN_API_KEY`, `MAILGUN_DOMAIN` (the sandbox domain) and `MAILGUN_FROM` (`My Shop <postmaster@sandboxXXXX.mailgun.org>`). If your account is EU region, set `MAILGUN_API_URL=https://api.eu.mailgun.net`.

## 4. Run it
```
npm run dev
```
Open http://localhost:3000, sign in with Google, add items, check out, and check your inbox (and spam).

## Deploying (optional, for submission)
Push to GitHub, import into https://vercel.com, add the same env variables, then add your Vercel URL to Supabase Redirect URLs and Google authorized origins.
