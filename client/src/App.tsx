import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Account } from "./pages/shop/Account";
import { Cart } from "./pages/shop/Cart";
import { Checkout } from "./pages/shop/Checkout";
import { Collections } from "./pages/shop/Collections";
import { BulkWholesale } from "./pages/shop/BulkWholesale";
import { Home } from "./pages/shop/Home";
import { Page } from "./pages/shop/Page";
import { ProductDetail } from "./pages/shop/ProductDetail";
import { Support } from "./pages/shop/Support";
import { TrackOrder } from "./pages/shop/TrackOrder";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/pages/bulk-wholesale" element={<BulkWholesale />} />
        <Route path="/pages/:slug" element={<Page />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/account" element={<Account />} />
        <Route path="/support" element={<Support />} />
        <Route path="/track-order" element={<TrackOrder />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
