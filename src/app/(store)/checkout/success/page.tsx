import styles from './page.module.css';
import Button from '@/components/ui/Button/Button';
import Link from 'next/link';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { settleOrder } from '@/lib/orders';
import ClearCart from './ClearCart';

export const dynamic = 'force-dynamic';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  // Verify the payment completed. If it did, settle the order here too — a
  // safety net so the order is recorded even if the webhook never arrives
  // (e.g. `stripe listen` wasn't running locally). settleOrder is idempotent
  // and race-safe with the webhook.
  let paid = false;
  if (session_id && isStripeConfigured()) {
    try {
      const checkout = await getStripe().checkout.sessions.retrieve(session_id);
      paid = checkout.payment_status === 'paid';
      if (paid && checkout.metadata?.orderId) {
        await settleOrder(checkout.metadata.orderId, checkout);
      }
    } catch {
      paid = false;
    }
  }

  return (
    <div className={styles.container}>
      {paid && <ClearCart />}
      <h1 className={styles.title}>
        {paid ? (
          <>TRANSACTION <span className={styles.titleRed}>SECURED</span></>
        ) : (
          <>PAYMENT <span className={styles.titleRed}>PENDING</span></>
        )}
      </h1>
      <p className={styles.message}>
        {paid
          ? 'Your acquisition has been logged into the ledger. You will receive transmission regarding your shipping status shortly.'
          : 'We have not yet confirmed your payment. If you completed checkout, your order will appear in your ledger once it clears.'}
      </p>
      <div className={styles.btnWrap}>
        <Link href="/account/orders">
          <Button variant="secondary">VIEW LEDGER</Button>
        </Link>
        <Link href="/shop">
          <Button variant="primary">RETURN TO COLLECTION</Button>
        </Link>
      </div>
    </div>
  );
}
