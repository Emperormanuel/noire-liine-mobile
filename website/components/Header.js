'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/lib/cart';
import { SITE } from '@/lib/site';

export default function Header() {
  const { count } = useCart();
  const [user, setUser] = useState(null);
  const [first, ...rest] = SITE.name.toUpperCase().split(' ');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function logout() {
    await createClient().auth.signOut();
    window.location.href = '/';
  }

  return (
    <header>
      <Link href="/" className="logo">{first} <span>{rest.join(' ')}</span></Link>
      <form className="search" action="/">
        <input name="q" placeholder="Search for outfits, styles, accessories…" />
      </form>
      <nav>
        <Link href="/cart">Cart: {count}</Link>
        {user ? (
          <>
            <Link href="/orders">Orders</Link>
            <span>Hello, {(user.user_metadata?.full_name || user.email).split(' ')[0]}</span>
            <button className="btn secondary" onClick={logout}>Log out</button>
          </>
        ) : (
          <Link href="/login" className="btn">Sign in</Link>
        )}
      </nav>
    </header>
  );
}
