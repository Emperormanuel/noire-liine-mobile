import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { money } from '@/lib/format';
import { SITE } from '@/lib/site';
import AddToCart from '@/components/AddToCart';

export const dynamic = 'force-dynamic';

const CATEGORIES = ['Women', 'Men', 'Accessories', 'Footwear'];
const SORTS = [
  ['', 'New in'],
  ['low', 'Price: low to high'],
  ['high', 'Price: high to low'],
];

export default async function Home({ searchParams }) {
  const { cat = '', q = '', sort = '' } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from('products').select('*');
  if (cat) query = query.eq('category', cat);
  const term = q.replace(/[%,()]/g, ' ').trim();
  if (term) query = query.ilike('name', `%${term}%`);
  if (sort === 'low') query = query.order('price_cents', { ascending: true });
  else if (sort === 'high') query = query.order('price_cents', { ascending: false });
  else query = query.order('name');
  const { data: products, error } = await query;

  const href = (next) => {
    const p = new URLSearchParams({ ...(cat && { cat }), ...(q && { q }), ...(sort && { sort }), ...next });
    for (const [k, v] of [...p]) if (!v) p.delete(k);
    return p.toString() ? `/?${p}` : '/';
  };

  return (
    <div className="layout">
      <aside className="side">
        <h2>Explore</h2>
        <Link href={href({ cat: '' })} className={!cat ? 'active' : ''}>⚡ New In</Link>
        {CATEGORIES.map((c) => (
          <Link key={c} href={href({ cat: c })} className={cat === c ? 'active' : ''}>{c}</Link>
        ))}
      </aside>

      <section>
        <div className="toolbar">
          <h1>{q ? `Results for “${q}”` : cat || '⚡ New In'}</h1>
          <div className="sorts">
            {SORTS.map(([value, label]) => (
              <Link key={label} href={href({ sort: value })} className={`chip ${sort === value ? 'active' : ''}`}>{label}</Link>
            ))}
          </div>
        </div>

        {!cat && !q && (
          <div className="banners">
            <div className="banner" style={{ background: '#bfe9f2' }}>
              <b>Up to 30% off</b>
              <span>Selected Ankara &amp; Adire pieces</span>
            </div>
            <div className="banner" style={{ background: '#ddd0f5' }}>
              <b>Owambe season</b>
              <span>Aso-oke, lace &amp; agbada for every celebration</span>
            </div>
          </div>
        )}

        {error && (
          <p className="error">
            Could not load products: {error.message || 'database error'}. Did you run supabase/migration-fashion.sql?
          </p>
        )}
        {!error && !products?.length && <p className="empty">No items found. Try a different search.</p>}

        <div className="grid">
          {(products || []).map((p) => (
            <div className="pcard" key={p.id}>
              <div className="pimg" style={{ background: p.color || '#ece7f7' }}>
                {p.image_url ? <img src={p.image_url} alt={p.name} /> : <span className="emoji">{p.emoji}</span>}
              </div>
              <div className="pinfo">
                <span className="name">{p.name}</span>
                <span className="muted">{p.description}</span>
                <div className="pbottom">
                  <b>{money(p.price_cents)}</b>
                  <AddToCart product={p} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
