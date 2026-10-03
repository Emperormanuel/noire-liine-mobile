'use client';
import { useState } from 'react';
import { useCart } from '@/lib/cart';

export default function AddToCart({ product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  return (
    <button
      className="btn small"
      onClick={() => {
        add(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 1000);
      }}
    >
      {added ? 'Added ✓' : 'Add to cart'}
    </button>
  );
}
