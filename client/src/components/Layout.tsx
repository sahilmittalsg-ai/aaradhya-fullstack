import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { prefetchStorefrontData } from "../lib/api";
import { CartDrawer } from "./cart/CartDrawer";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { HelpMeChoose } from "./HelpMeChoose";

export function Layout() {
  useEffect(() => {
    prefetchStorefrontData();
  }, []);

  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <HelpMeChoose />
    </div>
  );
}
