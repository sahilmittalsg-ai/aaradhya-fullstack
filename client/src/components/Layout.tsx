import { Outlet } from "react-router-dom";
import { CartDrawer } from "./cart/CartDrawer";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function Layout() {
  return (
    <div className="min-h-screen bg-[#fffaf3]">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
