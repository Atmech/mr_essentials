import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import CheckoutResume from "@/components/layout/CheckoutResume";

// Storefront chrome lives here so the admin panel (which has its own layout)
// renders without the shop navbar, footer, cart and search overlays.
export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
      <CheckoutResume />
    </>
  );
}
