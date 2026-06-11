import type { Metadata } from 'next';
import WishlistClient from './WishlistClient';

export const metadata: Metadata = { title: 'Wishlist — MR Essentials' };

export default function WishlistPage() {
  return <WishlistClient />;
}
