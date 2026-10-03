import { createContext, useContext, useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { SITE_URL, supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Google sign-in through Supabase, exactly like the website, but the browser hands us back to the app.
  async function signInWithGoogle() {
    // The app's own address (where the user must end up) ...
    const redirectTo = Linking.createURL('auth-callback');
    // ... but Supabase is told to go via the website's relay page, which forwards to the app.
    const viaWebsite = `${SITE_URL}/auth/mobile?app=${encodeURIComponent(redirectTo)}`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: viaWebsite, skipBrowserRedirect: true },
    });
    if (error) throw error;

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') {
      throw new Error(
        `The browser closed before returning to the app (${result.type}). ` +
          `Expected return to:\n${redirectTo}\nvia ${viaWebsite}\n` +
          `Both ${SITE_URL}/** and exp://** must be Redirect URLs in Supabase, and the website must be running.`
      );
    }

    const url = new URL(result.url);
    const code = url.searchParams.get('code');
    const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
    if (code) {
      const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
      if (exErr) throw exErr;
    } else if (hash.get('access_token') && hash.get('refresh_token')) {
      const { error: sErr } = await supabase.auth.setSession({
        access_token: hash.get('access_token'),
        refresh_token: hash.get('refresh_token'),
      });
      if (sErr) throw sErr;
    } else {
      throw new Error(`Returned to the app without a login code. Returned address:\n${result.url}`);
    }
  }

  // Sign in with a one-time code emailed to you. No browser redirect involved.
  // shouldCreateUser: false means only an EXISTING account (e.g. the one you made with Google) can sign in,
  // so it can never create a second, separate account for the same person.
  async function sendEmailCode(email) {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { shouldCreateUser: false },
    });
    if (error) throw error;
  }

  async function verifyEmailCode(email, token) {
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token: token.trim(),
      type: 'email',
    });
    if (error) throw error;
  }

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, ready, signInWithGoogle, sendEmailCode, verifyEmailCode, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
