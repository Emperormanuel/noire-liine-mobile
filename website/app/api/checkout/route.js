import { NextResponse } from 'next/server';
import { createClient as createTokenClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { sendOrderEmail } from '@/lib/mailgun';

// The website sends its login in cookies; the mobile app sends it as "Authorization: Bearer <token>".
async function getSupabase(request) {
  const auth = request.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) {
    return createTokenClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: auth } },
      auth: { persistSession: false },
    });
  }
  return createClient();
}

export async function POST(request) {
  const supabase = await getSupabase(request);
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 });

  const { name, address, items } = await request.json();
  if (!name?.trim() || !address?.trim() || !Array.isArray(items) || !items.length)
    return NextResponse.json({ error: 'Missing details.' }, { status: 400 });

  // Never trust prices from the browser: look them up in the database.
  const ids = items.map((i) => i.id);
  const { data: products, error: pErr } = await supabase.from('products').select('*').in('id', ids);
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  const lines = [];
  for (const i of items) {
    const p = products.find((x) => x.id === i.id);
    const quantity = Number(i.quantity);
    if (!p || !Number.isInteger(quantity) || quantity < 1 || quantity > 99)
      return NextResponse.json({ error: 'Invalid cart.' }, { status: 400 });
    lines.push({ product_id: p.id, name: p.name, price_cents: p.price_cents, quantity });
  }
  const totalCents = lines.reduce((n, l) => n + l.price_cents * l.quantity, 0);

  const { data: order, error: oErr } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      email: user.email,
      customer_name: name.trim(),
      shipping_address: address.trim(),
      total_cents: totalCents,
    })
    .select()
    .single();
  if (oErr) return NextResponse.json({ error: oErr.message }, { status: 500 });

  const { error: iErr } = await supabase.from('order_items').insert(lines.map((l) => ({ ...l, order_id: order.id })));
  if (iErr) return NextResponse.json({ error: iErr.message }, { status: 500 });

  let emailSent = false;
  try {
    emailSent = await sendOrderEmail({ to: user.email, name: name.trim(), orderId: order.id, items: lines, totalCents });
  } catch (e) {
    console.error('Email failed', e);
  }

  return NextResponse.json({ orderId: order.id, emailSent });
}
