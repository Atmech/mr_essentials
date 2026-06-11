import { db } from '@/lib/db';
import { products } from '@/lib/db/schema';
import { asc, isNotNull } from 'drizzle-orm';
import { CATEGORIES } from '@/lib/constants';
import { formatGBP, saleWindowActive } from '@/lib/format';
import { applyBulkSale, clearSale } from './actions';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sales — Admin' };

const inputStyle: React.CSSProperties = { width: '100%', padding: 'var(--space-3)', border: 'var(--border-thin)' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 'var(--space-2)' };
const cardStyle: React.CSSProperties = {
  padding: 'var(--space-6)',
  border: 'var(--border-thin)',
  backgroundColor: 'var(--color-white)',
  marginBottom: 'var(--space-8)',
};

function ScopeSelect() {
  return (
    <select name="category" defaultValue="all" style={inputStyle}>
      <option value="all">Whole store</option>
      {CATEGORIES.map((c) => (
        <option key={c.value} value={c.value}>{c.label}</option>
      ))}
    </select>
  );
}

const cellStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-sm)',
  padding: 'var(--space-3)',
  borderBottom: 'var(--border-thin)',
  textAlign: 'left',
  verticalAlign: 'middle',
};

function formatWindow(startsAt: Date | null, endsAt: Date | null): string {
  if (!startsAt && !endsAt) return 'always on';
  const fmt = (d: Date) => d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  return `${startsAt ? fmt(startsAt) : '…'} → ${endsAt ? fmt(endsAt) : '…'}`;
}

export default async function AdminSalesPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const saleProducts = await db
    .select()
    .from(products)
    .where(isNotNull(products.salePrice))
    .orderBy(asc(products.category), asc(products.name));
  const onSaleCount = saleProducts.length;
  const now = new Date();

  return (
    <div style={{ maxWidth: '720px' }}>
      {error && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)', border: '1px solid var(--color-alert-red)', color: 'var(--color-alert-red)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)', backgroundColor: 'var(--color-white)' }}>
          <span>{error}</span>
          <a href="/admin/sales" style={{ color: 'inherit', textDecoration: 'underline', flexShrink: 0 }}>DISMISS</a>
        </div>
      )}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-widest)', color: 'var(--color-mid-gray)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
          Offers
        </p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', lineHeight: 1 }}>BULK SALES</h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-mid-gray)', marginTop: 'var(--space-3)' }}>
          {onSaleCount} product{onSaleCount === 1 ? '' : 's'} currently carry a sale price. Per-product sale prices can be fine-tuned on each product&apos;s edit page.
        </p>
      </div>

      {/* Active sales */}
      <div style={cardStyle}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>ACTIVE SALES</h2>
        {saleProducts.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-mid-gray)' }}>No products carry a sale price right now.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={cellStyle}>PRODUCT</th>
                <th style={cellStyle}>PRICE</th>
                <th style={cellStyle}>SALE</th>
                <th style={cellStyle}>OFF</th>
                <th style={cellStyle}>WINDOW</th>
                <th style={cellStyle}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {saleProducts.map((p) => {
                const scheduled = p.saleStartsAt != null && p.saleStartsAt > now;
                const expired = p.saleEndsAt != null && p.saleEndsAt <= now;
                const live = !p.archived && p.salePrice != null && p.salePrice < p.price && saleWindowActive(p.saleStartsAt, p.saleEndsAt, now);
                const pctOff = p.salePrice != null && p.price > 0 ? Math.round((1 - p.salePrice / p.price) * 100) : 0;
                return (
                  <tr key={p.id}>
                    <td style={cellStyle}>
                      <Link href={`/admin/products/${p.id}/edit`} style={{ textDecoration: 'underline' }}>{p.name}</Link>
                      <span style={{ color: 'var(--color-mid-gray)' }}> · {p.category}</span>
                      {p.archived && <span style={{ color: 'var(--color-alert-red)' }}> · ARCHIVED</span>}
                    </td>
                    <td style={{ ...cellStyle, textDecoration: 'line-through', color: 'var(--color-mid-gray)' }}>{formatGBP(p.price)}</td>
                    <td style={{ ...cellStyle, fontWeight: 700 }}>{p.salePrice != null ? formatGBP(p.salePrice) : '—'}</td>
                    <td style={cellStyle}>{pctOff}%</td>
                    <td style={cellStyle}>{formatWindow(p.saleStartsAt, p.saleEndsAt)}</td>
                    <td style={{ ...cellStyle, color: live ? 'var(--color-success, #1a7f37)' : 'var(--color-mid-gray)' }}>
                      {live ? 'LIVE' : scheduled ? 'SCHEDULED' : expired ? 'EXPIRED' : 'INACTIVE'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Apply */}
      <div style={cardStyle}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>APPLY SALE</h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-mid-gray)', marginBottom: 'var(--space-4)' }}>
          Sets the sale price to (100 − N)% of each product&apos;s base price. Overwrites any existing sale price in scope. Leave dates blank for an open-ended sale.
        </p>
        <form action={applyBulkSale} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'end' }}>
          <div style={{ flex: '0 1 120px' }}>
            <label className="label" style={labelStyle}>% off</label>
            <input required name="percent" type="number" min="1" max="90" placeholder="20" style={inputStyle} />
          </div>
          <div style={{ flex: '1 1 160px' }}>
            <label className="label" style={labelStyle}>Scope</label>
            <ScopeSelect />
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label className="label" style={labelStyle}>Starts — optional</label>
            <input name="saleStartsAt" type="datetime-local" style={inputStyle} />
          </div>
          <div style={{ flex: '1 1 180px' }}>
            <label className="label" style={labelStyle}>Ends — optional</label>
            <input name="saleEndsAt" type="datetime-local" style={inputStyle} />
          </div>
          <button type="submit" style={{ padding: 'var(--space-3) var(--space-6)', backgroundColor: 'var(--color-black)', color: 'var(--color-white)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', letterSpacing: 'var(--tracking-wider)', border: 'none', cursor: 'pointer' }}>
            APPLY
          </button>
        </form>
      </div>

      {/* Clear */}
      <div style={cardStyle}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>END SALE</h2>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-mid-gray)', marginBottom: 'var(--space-4)' }}>
          Removes sale prices and sale windows from every product in scope.
        </p>
        <form action={clearSale} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'end' }}>
          <div style={{ flex: '1 1 160px' }}>
            <label className="label" style={labelStyle}>Scope</label>
            <ScopeSelect />
          </div>
          <button type="submit" style={{ padding: 'var(--space-3) var(--space-6)', backgroundColor: 'var(--color-white)', color: 'var(--color-alert-red)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', letterSpacing: 'var(--tracking-wider)', border: '1px solid var(--color-alert-red)', cursor: 'pointer' }}>
            CLEAR SALES
          </button>
        </form>
      </div>
    </div>
  );
}
