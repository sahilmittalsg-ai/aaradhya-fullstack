import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="mt-20 bg-ink text-sandal">
      <div className="container-pad grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <h2 className="text-2xl font-black">Aaradhya Beads</h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-sandal/70">
            A complete ecommerce build for spiritual bracelets, malas, crystals, orders, and admin operations.
          </p>
        </div>
        <div>
          <h3 className="font-bold">Shop</h3>
          <div className="mt-4 space-y-3 text-sm text-sandal/70">
            <Link className="block" to="/collections">All Products</Link>
            <Link className="block" to="/collections?collection=Rudraksha">Rudraksha</Link>
            <Link className="block" to="/collections?collection=Energy%20Stones">Energy Stones</Link>
          </div>
        </div>
        <div>
          <h3 className="font-bold">Quick Links</h3>
          <div className="mt-4 space-y-3 text-sm text-sandal/70">
            <Link className="block" to="/pages/about-us">About Us</Link>
            <Link className="block" to="/track-order">Track Order</Link>
            <Link className="block font-semibold text-white" to="/pages/bulk-wholesale">Bulk / Wholesale</Link>
            <Link className="block" to="/pages/returns-exchange">Returns / Exchange</Link>
            <Link className="block" to="/pages/contact-us">Contact Us</Link>
            <Link className="block" to="/pages/marketplace-store">Aaradhya on Amazon</Link>
          </div>
        </div>
        <div>
          <h3 className="font-bold">Policies</h3>
          <div className="mt-4 space-y-3 text-sm text-sandal/70">
            <Link className="block" to="/pages/refund-return-policy">Refund & Return Policy</Link>
            <Link className="block" to="/pages/shipping-policy">Shipping Policy</Link>
            <Link className="block" to="/pages/privacy-policy">Privacy Policy</Link>
            <Link className="block" to="/pages/terms-of-service">Terms of Service</Link>
            <Link className="block" to="/pages/cashback-policy">Cashback Policy</Link>
            <Link className="block" to="/pages/cancellation-policy">Cancellation Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
