import { db } from '@/lib/db';
import { desc } from 'drizzle-orm';
import { orders } from '@/lib/db/schema';
import { ORDER_TRANSITIONS, type OrderStatus } from '@/lib/constants';
import { formatGBP } from '@/lib/format';
import { updateOrderStatus } from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Orders — Admin' };

type OrderWithRelations = Awaited<ReturnType<typeof loadOrders>>[number];

function loadOrders() {
  return db.query.orders.findMany({
    orderBy: [desc(orders.createdAt)],
    with: {
      user: true,
      items: { with: { product: true } },
    },
  });
}

function OrderCard({ order }: { order: OrderWithRelations }) {
  const status = order.status as OrderStatus;
  // Current status + the transitions allowed from it; terminal states offer no moves.
  const statusOptions: OrderStatus[] = [status, ...(ORDER_TRANSITIONS[status] ?? [])];

  return (
    <div style={{ backgroundColor: 'var(--color-white)', border: 'var(--border-thin)', padding: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', fontWeight: 700 }}>
            #{order.id.slice(0, 8).toUpperCase()}
            {order.oversold && (
              <span style={{ marginLeft: 'var(--space-2)', color: 'var(--color-alert-red)', border: '1px solid var(--color-alert-red)', padding: '1px 6px', fontSize: 'var(--text-xs)' }}>
                OVERSOLD
              </span>
            )}
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-mid-gray)' }}>
            {order.user?.email ?? 'guest'} · {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB') : ''}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-lg)', fontWeight: 700 }}>{formatGBP(order.totalAmount)}</p>
          {order.discountAmount > 0 && (
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--color-mid-gray)' }}>
              {order.couponCode ?? 'promo code'}: −{formatGBP(order.discountAmount)}
            </p>
          )}
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--color-mid-gray)' }}>{order.status}</p>
        </div>
      </div>

      {/* Line items */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        {order.items.map((it) => (
          <li key={it.id} style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', display: 'flex', justifyContent: 'space-between' }}>
            <span>{it.quantity}× {it.product?.name ?? `#${it.productId}`}{it.size ? ` (${it.size})` : ''}</span>
            <span>{formatGBP(it.price * it.quantity)}</span>
          </li>
        ))}
      </ul>

      {/* Invoice links */}
      {(order.invoiceUrl || order.invoicePdf) && (
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)' }}>
          {order.invoiceUrl && (
            <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
              INVOICE ↗
            </a>
          )}
          {order.invoicePdf && (
            <a href={order.invoicePdf} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
              PDF ↓
            </a>
          )}
        </p>
      )}

      {/* Status + tracking update */}
      <form action={updateOrderStatus} style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'end', borderTop: 'var(--border-thin)', paddingTop: 'var(--space-4)' }}>
        <input type="hidden" name="orderId" value={order.id} />
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
          Status<br />
          <select name="status" defaultValue={order.status} style={{ padding: 'var(--space-2)', border: 'var(--border-thin)' }}>
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
          Tracking #<br />
          <input name="trackingNumber" defaultValue={order.trackingNumber ?? ''} style={{ padding: 'var(--space-2)', border: 'var(--border-thin)' }} />
        </label>
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
          Tracking URL<br />
          <input name="trackingUrl" defaultValue={order.trackingUrl ?? ''} style={{ padding: 'var(--space-2)', border: 'var(--border-thin)', minWidth: '220px' }} />
        </label>
        <button type="submit" style={{ padding: 'var(--space-2) var(--space-5)', backgroundColor: 'var(--color-black)', color: 'var(--color-white)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', textTransform: 'uppercase', cursor: 'pointer' }}>
          Update
        </button>
      </form>
    </div>
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const allOrders = await loadOrders();

  // Pending rows are started-but-unpaid checkouts. They are not real orders yet —
  // keep them out of the fulfilment list, collapsed below.
  const realOrders = allOrders.filter((o) => o.status !== 'pending');
  const abandoned = allOrders.filter((o) => o.status === 'pending');

  return (
    <div>
      {error && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-4)', border: '1px solid var(--color-alert-red)', color: 'var(--color-alert-red)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-6)', backgroundColor: 'var(--color-white)' }}>
          <span>{error}</span>
          <a href="/admin/orders" style={{ color: 'inherit', textDecoration: 'underline', flexShrink: 0 }}>DISMISS</a>
        </div>
      )}
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', letterSpacing: 'var(--tracking-widest)', color: 'var(--color-mid-gray)', textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>
          Fulfilment
        </p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-4xl)', lineHeight: 1 }}>ORDERS</h1>
      </div>

      {realOrders.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-mid-gray)' }}>No orders yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {realOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {abandoned.length > 0 && (
        <details style={{ marginTop: 'var(--space-10)' }}>
          <summary style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)', letterSpacing: 'var(--tracking-wider)', color: 'var(--color-mid-gray)', cursor: 'pointer', marginBottom: 'var(--space-4)' }}>
            ABANDONED CHECKOUTS ({abandoned.length}) — started but never paid
          </summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {abandoned.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
