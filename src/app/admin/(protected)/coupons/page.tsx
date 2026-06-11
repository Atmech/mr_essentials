import { db } from '@/lib/db';
import { coupons } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { formatGBP } from '@/lib/format';
import { createCoupon, toggleCouponActive, deleteCoupon } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Coupons — Admin' };

const cellStyle: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'var(--text-sm)',
  padding: 'var(--space-3)',
  borderBottom: 'var(--border-thin)',
  textAlign: 'left',
  verticalAlign: 'middle',
};

const inputStyle: React.CSSProperties = { width: '100%', padding: 'var(--space-3)', border: 'var(--border-thin)' };
const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 'var(--space-2)' };

function formatWindow(startsAt: Date | null, endsAt: Date | null): string {
  if (!startsAt && !endsAt) return 'always';
  const fmt = (d: Date) => d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  return `${startsAt ? fmt(startsAt) : '…'} → ${endsAt ? fmt(endsAt) : '…'}`;
}

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const allCoupons = await db.select().from(coupons).orderBy(desc(coupons.id));
  const now = new Date();

  return (
    <div>
      {error && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)', border: '1px solid var(--color-alert-red)', color: 'var(--color-alert-red)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)', backgroundColor: 'var(--color-white)' }}>
          <span>{error}</span>
          <a href="/admin/coupons" style={{ color: 'inherit', textDecoration: 'underline', flexShrink: 0 }}>DISMISS</a>
        </div>
      )}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-widest)', color: 'var(--color-mid-gray)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
          Offers
        </p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', lineHeight: 1 }}>COUPONS</h1>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-mid-gray)', marginTop: 'var(--space-3)' }}>
          Codes customers enter in the cart. Redemptions are counted when an order is actually paid.
        </p>
      </div>

      {/* Create form */}
      <form action={createCoupon} style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', alignItems: 'end', padding: 'var(--space-6)', border: 'var(--border-thin)', backgroundColor: 'var(--color-white)', marginBottom: 'var(--space-8)' }}>
        <div style={{ flex: '1 1 140px' }}>
          <label className="label" style={labelStyle}>Code</label>
          <input
            required
            name="code"
            type="text"
            placeholder="WELCOME10"
            minLength={3}
            maxLength={32}
            pattern="[A-Za-z0-9_\-]{3,32}"
            title="3-32 characters: letters, numbers, hyphens or underscores (no spaces)"
            style={{ ...inputStyle, textTransform: 'uppercase' }}
          />
        </div>
        <div style={{ flex: '0 1 120px' }}>
          <label className="label" style={labelStyle}>Type</label>
          <select required name="type" defaultValue="percent" style={inputStyle}>
            <option value="percent">% off</option>
            <option value="fixed">£ off</option>
          </select>
        </div>
        <div style={{ flex: '0 1 120px' }}>
          <label className="label" style={labelStyle}>Value</label>
          <input required name="value" type="number" step="0.01" min="0" placeholder="10" style={inputStyle} />
        </div>
        <div style={{ flex: '1 1 180px' }}>
          <label className="label" style={labelStyle}>Starts — optional</label>
          <input name="startsAt" type="datetime-local" style={inputStyle} />
        </div>
        <div style={{ flex: '1 1 180px' }}>
          <label className="label" style={labelStyle}>Ends — optional</label>
          <input name="endsAt" type="datetime-local" style={inputStyle} />
        </div>
        <div style={{ flex: '0 1 110px' }}>
          <label className="label" style={labelStyle}>Max uses</label>
          <input name="maxUses" type="number" min="1" placeholder="∞" style={inputStyle} />
        </div>
        <div style={{ flex: '0 1 130px' }}>
          <label className="label" style={labelStyle}>Min spend (£)</label>
          <input name="minSubtotal" type="number" step="0.01" min="0" placeholder="none" style={inputStyle} />
        </div>
        <button type="submit" style={{ padding: 'var(--space-3) var(--space-6)', backgroundColor: 'var(--color-black)', color: 'var(--color-white)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', letterSpacing: 'var(--tracking-wider)', border: 'none', cursor: 'pointer' }}>
          + CREATE
        </button>
      </form>

      {/* Coupon table */}
      {allCoupons.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-mid-gray)' }}>No coupons yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'var(--color-white)', border: 'var(--border-thin)' }}>
          <thead>
            <tr>
              <th style={cellStyle}>CODE</th>
              <th style={cellStyle}>DISCOUNT</th>
              <th style={cellStyle}>WINDOW</th>
              <th style={cellStyle}>USED</th>
              <th style={cellStyle}>MIN SPEND</th>
              <th style={cellStyle}>STATUS</th>
              <th style={cellStyle}></th>
            </tr>
          </thead>
          <tbody>
            {allCoupons.map((coupon) => {
              const expired = coupon.endsAt != null && coupon.endsAt <= now;
              const exhausted = coupon.maxUses != null && coupon.usedCount >= coupon.maxUses;
              return (
                <tr key={coupon.id}>
                  <td style={{ ...cellStyle, fontWeight: 700 }}>{coupon.code}</td>
                  <td style={cellStyle}>{coupon.type === 'percent' ? `${coupon.value}%` : formatGBP(coupon.value)}</td>
                  <td style={cellStyle}>{formatWindow(coupon.startsAt, coupon.endsAt)}</td>
                  <td style={cellStyle}>{coupon.usedCount}{coupon.maxUses != null ? ` / ${coupon.maxUses}` : ''}</td>
                  <td style={cellStyle}>{coupon.minSubtotal != null ? formatGBP(coupon.minSubtotal) : '—'}</td>
                  <td style={{ ...cellStyle, color: coupon.active && !expired && !exhausted ? 'inherit' : 'var(--color-alert-red)' }}>
                    {!coupon.active ? 'INACTIVE' : expired ? 'EXPIRED' : exhausted ? 'EXHAUSTED' : 'ACTIVE'}
                  </td>
                  <td style={{ ...cellStyle, whiteSpace: 'nowrap' }}>
                    <form action={toggleCouponActive} style={{ display: 'inline' }}>
                      <input type="hidden" name="couponId" value={coupon.id} />
                      <button type="submit" style={{ background: 'none', border: 'var(--border-thin)', padding: 'var(--space-1) var(--space-3)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', cursor: 'pointer', marginRight: 'var(--space-2)' }}>
                        {coupon.active ? 'DISABLE' : 'ENABLE'}
                      </button>
                    </form>
                    <form action={deleteCoupon} style={{ display: 'inline' }}>
                      <input type="hidden" name="couponId" value={coupon.id} />
                      <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--color-alert-red)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', cursor: 'pointer', textDecoration: 'underline' }}>
                        DELETE
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
