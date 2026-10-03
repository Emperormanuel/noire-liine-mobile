-- Run once in Supabase: SQL Editor -> New query -> paste -> Run
-- Moves the shopping cart from the browser into the database so the website
-- and the mobile app share ONE cart per signed-in user.

create table if not exists cart_items (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  product_id uuid not null references products(id) on delete cascade,
  quantity integer not null check (quantity > 0 and quantity <= 99),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table cart_items enable row level security;

grant select, insert, update, delete on public.cart_items to authenticated;

-- Row Level Security: each customer can only touch their own cart rows.
create policy "users view own cart" on cart_items for select using (auth.uid() = user_id);
create policy "users add to own cart" on cart_items for insert with check (auth.uid() = user_id);
create policy "users change own cart" on cart_items for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users remove from own cart" on cart_items for delete using (auth.uid() = user_id);

-- Realtime: lets apps "subscribe" and be told the moment a cart row changes.
-- REPLICA IDENTITY FULL makes DELETE events include user_id so they can be filtered.
alter table cart_items replica identity full;
alter publication supabase_realtime add table cart_items;
