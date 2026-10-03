-- Run this whole file once in Supabase: SQL Editor -> New query -> paste -> Run

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  emoji text default '🛍️'
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  email text not null,
  customer_name text not null,
  shipping_address text not null,
  total_cents integer not null,
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id),
  name text not null,
  price_cents integer not null,
  quantity integer not null check (quantity > 0)
);

alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Newer Supabase projects need explicit permissions for the API roles
grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;
grant select, insert on public.orders to authenticated;
grant select, insert on public.order_items to authenticated;

create policy "anyone can view products" on products for select using (true);

create policy "users view own orders" on orders for select using (auth.uid() = user_id);
create policy "users create own orders" on orders for insert with check (auth.uid() = user_id);

create policy "users view own order items" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));
create policy "users add items to own orders" on order_items for insert
  with check (exists (select 1 from orders o where o.id = order_id and o.user_id = auth.uid()));

insert into products (name, description, price_cents, emoji) values
  ('Classic Sneakers', 'Comfortable everyday sneakers.', 4999, '👟'),
  ('Canvas Backpack', 'Fits a laptop and a lunch.', 3500, '🎒'),
  ('Wireless Headphones', 'Long battery life, great sound.', 7900, '🎧'),
  ('Sunglasses', 'UV-protected and stylish.', 2200, '🕶️'),
  ('Water Bottle', 'Keeps drinks cold for 24 hours.', 1800, '🍶'),
  ('Wrist Watch', 'Simple, clean and reliable.', 12000, '⌚');
