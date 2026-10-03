-- Run once in Supabase SQL Editor. Adds fashion fields and replaces the sample products.

alter table products add column if not exists category text default 'Women';
alter table products add column if not exists color text default '#e9d5ff';
alter table products add column if not exists image_url text;

-- let products be replaced without breaking old orders
alter table order_items drop constraint if exists order_items_product_id_fkey;
alter table order_items add constraint order_items_product_id_fkey
  foreign key (product_id) references products(id) on delete set null;

delete from products;
insert into products (name, description, price_cents, emoji, category, color) values
  ('Ankara Wrap Dress', 'Bold Ankara print, tailored fit.', 3500000, '👗', 'Women', '#fde68a'),
  ('Iro & Buba Set', 'Classic two-piece with matching gele.', 4800000, '👘', 'Women', '#fbcfe8'),
  ('Adire Kaftan', 'Hand-dyed Yoruba indigo pattern.', 2800000, '🥻', 'Women', '#bfdbfe'),
  ('Lace Owambe Gown', 'Statement gown for the weekend party.', 7500000, '👗', 'Women', '#ddd6fe'),
  ('Agbada Set', 'Three-piece embroidered agbada.', 8500000, '🧥', 'Men', '#fed7aa'),
  ('Senator Suit', 'Sharp senator wear in rich fabric.', 6500000, '🤵', 'Men', '#bbf7d0'),
  ('Dashiki Shirt', 'Light, bright and breathable.', 1800000, '👔', 'Men', '#fecaca'),
  ('Isiagu Top', 'Igbo-inspired lion-head print.', 3200000, '👕', 'Men', '#fef08a'),
  ('Aso-Oke Gele', 'Pre-tied headwrap in woven aso-oke.', 1500000, '🧣', 'Accessories', '#c7d2fe'),
  ('Fila Cap', 'Hand-woven traditional cap.', 800000, '🧢', 'Accessories', '#bae6fd'),
  ('Beaded Necklace', 'Handmade coral-style beads.', 1200000, '📿', 'Accessories', '#fbcfe8'),
  ('Leather Slides', 'Handcrafted leather slides.', 2200000, '🩴', 'Footwear', '#d9f99d');
