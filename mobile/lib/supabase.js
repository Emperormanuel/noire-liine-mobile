import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL;

// SAME Supabase project as the website -> same users, same products, same carts.
export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage, // keeps you signed in after closing the app
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  }
);

// Prices are stored in kobo (1 naira = 100 kobo), like on the website.
export const money = (kobo) => '₦' + Math.round(kobo / 100).toLocaleString('en-US');

// Product photos live on the website (/products/...); fall back to the emoji if there is none.
export const imageUrl = (p) => (p.image_url?.startsWith('/') ? SITE_URL + p.image_url : p.image_url || null);
