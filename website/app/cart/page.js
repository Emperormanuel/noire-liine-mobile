'use client';
import Link from 'next/link';
import { useCart } from '@/lib/cart';
import { money } from '@/lib/format';

export default function CartPage() {
  const { items, setQty, total } = useCart();
  if (!items.length)
    return (
      <div className="center">
        <h2>Your cart is empty</h2>
        <Link href="/" className="btn">Browse products</Link>
      </div>
    );
  return (
    <>
      <h1>Your cart</h1>
      {items.map((i) => (
        <div className="row" key={i.id}>
          <span className="item">
            {i.image_url ? <img src={i.image_url} alt="" className="thumb" /> : i.emoji} {i.name}
          </span>
          <div className="qty">
            <button onClick={() => setQty(i.id, i.quantity - 1)}>−</button>
            {i.quantity}
            <button onClick={() => setQty(i.id, i.quantity + 1)}>+</button>
          </div>
          <b>{money(i.price_cents * i.quantity)}</b>
        </div>
      ))}
      <h2>Total: {money(total)}</h2>
      <Link href="/checkout" className="btn">Go to checkout</Link>
    </>
  );
}
