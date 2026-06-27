import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fallbackHomepage, getHomepage } from "../lib/api";
import type { HomepageSettings } from "../lib/api";

export function Footer() {
  const [settings, setSettings] = useState<HomepageSettings>(fallbackHomepage.settings);

  useEffect(() => {
    getHomepage().then((homepage) => setSettings(homepage.settings)).catch(() => undefined);
  }, []);

  return (
    <footer className="mt-20 bg-ink text-sandal">
      <div className="container-pad grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#211d33] font-heading text-xl font-black tracking-tight text-[#f6e8ce] shadow-[0_12px_28px_rgba(33,29,51,0.22)]" aria-hidden="true">
              जपं
            </span>
            <h2 className="text-2xl font-black">{settings.brandName} {settings.brandTagline}</h2>
          </Link>
          <p className="mt-4 max-w-md text-sm leading-7 text-sandal/70">
            {settings.footerDescription}
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
