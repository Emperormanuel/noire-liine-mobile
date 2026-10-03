'use client';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  async function signIn() {
    await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }
  return (
    <div className="center">
      <h1>Sign in</h1>
      <p className="muted">Sign in to checkout and see your orders.</p>
      <button className="btn" onClick={signIn}>Continue with Google</button>
    </div>
  );
}
