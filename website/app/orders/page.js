import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { money } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function Orders() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  return (
    <>
      <h1>My orders</h1>
      {!orders?.length && <p>No orders yet. <Link href="/">Start shopping</Link></p>}
      {orders?.map((o) => (
        <div className="card" key={o.id} style={{ marginBottom: 14 }}>
          <b>Order #{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleDateString()}</b>
          {o.order_items.map((i) => (
            <span key={i.id}>{i.quantity} × {i.name} — {money(i.price_cents * i.quantity)}</span>
          ))}
          <b>Total: {money(o.total_cents)}</b>
        </div>
      ))}
    </>
  );
}
