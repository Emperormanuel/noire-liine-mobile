'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/lib/cart';
import { money } from '@/lib/format';

export default function CheckoutPage() {
  const { items, total, clear, loaded } = useCart();
  const [user, setUser] = useState(undefined);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  if (user === undefined || !loaded) return <p>Loading…</p>;
  if (!user)
    return (
      <div className="center">
        <h2>Please sign in to checkout</h2>
        <Link href="/login" className="btn">Sign in with Google</Link>
      </div>
    );
  if (!items.length)
    return (
      <div className="center">
        <h2>Your cart is empty</h2>
        <Link href="/" className="btn">Browse products</Link>
      </div>
    );

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(e.target);
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        address: form.get('address'),
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Something went wrong');
      setBusy(false);
      return;
    }
    clear();
    window.location.href = `/order-success?id=${data.orderId}&email=${data.emailSent ? 1 : 0}`;
  }

  return (
    <>
      <h1>Checkout</h1>
      {items.map((i) => (
        <div className="row" key={i.id}>
          <span className="item">
            {i.image_url ? <img src={i.image_url} alt="" className="thumb" /> : i.emoji} {i.name} × {i.quantity}
          </span>
          <b>{money(i.price_cents * i.quantity)}</b>
        </div>
      ))}
      <h2>Total: {money(total)}</h2>
      <form className="stack" onSubmit={submit}>
        <input name="name" placeholder="Full name" defaultValue={user.user_metadata?.full_name || ''} required />
        <textarea name="address" placeholder="Delivery address" rows={3} required />
        <p className="muted">Confirmation will be sent to {user.email}. (Demo shop: no real payment is taken.)</p>
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Placing order…' : 'Place order'}</button>
      </form>
    </>
  );
}
