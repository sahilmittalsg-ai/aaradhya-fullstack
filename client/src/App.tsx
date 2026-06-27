import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";

const Home = lazy(() => import("./pages/shop/Home").then((module) => ({ default: module.Home })));
const Account = lazy(() => import("./pages/shop/Account").then((module) => ({ default: module.Account })));
const Cart = lazy(() => import("./pages/shop/Cart").then((module) => ({ default: module.Cart })));
const Checkout = lazy(() => import("./pages/shop/Checkout").then((module) => ({ default: module.Checkout })));
const Collections = lazy(() => import("./pages/shop/Collections").then((module) => ({ default: module.Collections })));
const BulkWholesale = lazy(() => import("./pages/shop/BulkWholesale").then((module) => ({ default: module.BulkWholesale })));
const Page = lazy(() => import("./pages/shop/Page").then((module) => ({ default: module.Page })));
const ProductDetail = lazy(() => import("./pages/shop/ProductDetail").then((module) => ({ default: module.ProductDetail })));
const Support = lazy(() => import("./pages/shop/Support").then((module) => ({ default: module.Support })));
const TrackOrder = lazy(() => import("./pages/shop/TrackOrder").then((module) => ({ default: module.TrackOrder })));

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-[55vh] bg-[#fffaf3]" aria-label="Loading page" />}>
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
    </Suspense>
  );
}
