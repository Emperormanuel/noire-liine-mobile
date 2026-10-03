import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { useAuth } from './auth';

const CartContext = createContext(null);

// The cart is the `cart_items` table, shared with the website.
// A Realtime subscription refreshes it the instant the website (or another phone) changes it.
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [live, setLive] = useState('connecting'); // shows the sync status on screen

  const load = useCallback(async () => {
    if (!user) return setItems([]);
    const { data, error } = await supabase
      .from('cart_items')
      .select('product_id, quantity, products(name, price_cents, emoji, image_url)')
      .order('updated_at');
    if (error) return console.warn('Cart load failed', error.message);
    setItems(data.filter((r) => r.products).map((r) => ({ id: r.product_id, quantity: r.quantity, ...r.products })));
  }, [user?.id]);

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel(`cart-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cart_items', filter: `user_id=eq.${user.id}` }, load)
      .subscribe((status) => setLive(status === 'SUBSCRIBED' ? 'live' : status.toLowerCase()));
    return () => supabase.removeChannel(channel);
  }, [user?.id, load]);

  async function setQty(productId, quantity) {
    setItems((cur) =>
      quantity <= 0 ? cur.filter((i) => i.id !== productId) : cur.map((i) => (i.id === productId ? { ...i, quantity } : i))
    );
    const { error } =
      quantity <= 0
        ? await supabase.from('cart_items').delete().eq('product_id', productId)
        : await supabase
            .from('cart_items')
            .upsert({ user_id: user.id, product_id: productId, quantity, updated_at: new Date().toISOString() }, { onConflict: 'user_id,product_id' });
    if (error) {
      console.warn('Cart save failed', error.message);
      load();
    }
  }

  async function add(product) {
    const found = items.find((i) => i.id === product.id);
    const quantity = Math.min(99, (found?.quantity || 0) + 1);
    if (!found) setItems((cur) => [...cur, { ...product, quantity }]);
    await setQty(product.id, quantity);
  }

  async function clear() {
    setItems([]);
    if (user) await supabase.from('cart_items').delete().eq('user_id', user.id);
  }

  const count = items.reduce((n, i) => n + i.quantity, 0);
  const total = items.reduce((n, i) => n + i.quantity * i.price_cents, 0);

  return <CartContext.Provider value={{ items, add, setQty, clear, count, total, live }}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
