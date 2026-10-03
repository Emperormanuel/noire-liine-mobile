'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const CartContext = createContext(null);

const supabase = createClient();

// Signed in  -> cart lives in the `cart_items` table (shared with the mobile app, updates live).
// Signed out -> cart lives in the browser (localStorage) and is merged into the database at sign-in.
export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState(null);
  const userRef = useRef(null);
  userRef.current = userId;

  // Track who is signed in.
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUserId(session?.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const loadFromDb = useCallback(async () => {
    const { data, error } = await supabase
      .from('cart_items')
      .select('product_id, quantity, products(name, price_cents, emoji, image_url)')
      .order('updated_at');
    if (error) return console.error('Cart load failed', error);
    setItems(
      data.filter((r) => r.products).map((r) => ({ id: r.product_id, quantity: r.quantity, ...r.products }))
    );
  }, []);

  // When the user changes: guest -> read localStorage; signed in -> merge guest cart, load DB, subscribe.
  useEffect(() => {
    if (userId === null) {
      // Still unknown on first render is also null; getUser() above resolves it quickly.
      try {
        setItems(JSON.parse(localStorage.getItem('cart') || '[]'));
      } catch {}
      setLoaded(true);
      return;
    }

    let channel;
    let cancelled = false;
    (async () => {
      let guest = [];
      try {
        guest = JSON.parse(localStorage.getItem('cart') || '[]');
      } catch {}
      if (guest.length) {
        const { data: existing } = await supabase.from('cart_items').select('product_id, quantity');
        const have = new Map((existing || []).map((r) => [r.product_id, r.quantity]));
        await supabase.from('cart_items').upsert(
          guest.map((g) => ({
            user_id: userId,
            product_id: g.id,
            quantity: Math.min(99, (have.get(g.id) || 0) + g.quantity),
          })),
          { onConflict: 'user_id,product_id' }
        );
        localStorage.removeItem('cart');
      }
      if (cancelled) return;
      await loadFromDb();
      setLoaded(true);

      // Live updates: anything that changes this user's cart (e.g. the mobile app) refreshes it here.
      channel = supabase
        .channel(`cart-${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cart_items', filter: `user_id=eq.${userId}` }, loadFromDb)
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [userId, loadFromDb]);

  // Keep the guest cart saved in the browser.
  useEffect(() => {
    if (loaded && !userRef.current) localStorage.setItem('cart', JSON.stringify(items));
  }, [items, loaded]);

  async function saveQty(productId, quantity) {
    const uid = userRef.current;
    if (!uid) return;
    const { error } =
      quantity <= 0
        ? await supabase.from('cart_items').delete().eq('product_id', productId)
        : await supabase
            .from('cart_items')
            .upsert({ user_id: uid, product_id: productId, quantity, updated_at: new Date().toISOString() }, { onConflict: 'user_id,product_id' });
    if (error) {
      console.error('Cart save failed', error);
      loadFromDb(); // put the screen back in line with the database
    }
  }

  const add = (p) => {
    const found = items.find((i) => i.id === p.id);
    const quantity = Math.min(99, (found?.quantity || 0) + 1);
    setItems((cur) =>
      found
        ? cur.map((i) => (i.id === p.id ? { ...i, quantity } : i))
        : [...cur, { id: p.id, name: p.name, price_cents: p.price_cents, emoji: p.emoji, image_url: p.image_url, quantity: 1 }]
    );
    saveQty(p.id, quantity);
  };

  const setQty = (id, quantity) => {
    setItems((cur) =>
      quantity <= 0 ? cur.filter((i) => i.id !== id) : cur.map((i) => (i.id === id ? { ...i, quantity } : i))
    );
    saveQty(id, quantity);
  };

  const clear = async () => {
    setItems([]);
    if (userRef.current) await supabase.from('cart_items').delete().eq('user_id', userRef.current);
  };

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const total = items.reduce((n, i) => n + i.quantity * i.price_cents, 0);

  return (
    <CartContext.Provider value={{ items, add, setQty, clear, count, total, loaded }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
