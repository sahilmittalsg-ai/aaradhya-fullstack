import { useEffect, useRef, useState } from "react";
import { getProducts, refreshProducts } from "../lib/api";
import type { Product } from "../types";

const LIVE_PRODUCTS_REFRESH_MS = 120_000;
const FOCUS_REFRESH_MIN_MS = 45_000;

export function useLiveProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const signatureRef = useRef("");
  const lastRefreshRef = useRef(0);

  useEffect(() => {
    let active = true;

    async function loadProducts(force = false) {
      const rows = force ? await refreshProducts() : await getProducts();
      if (!active) return;

      const signature = productsSignature(rows);
      if (signatureRef.current !== signature) {
        signatureRef.current = signature;
        setProducts(rows);
      }
      lastRefreshRef.current = Date.now();
    }

    void loadProducts();

    const refresh = () => {
      if (document.hidden) return;
      void loadProducts(true);
    };
    const refreshAfterFocus = () => {
      if (Date.now() - lastRefreshRef.current >= FOCUS_REFRESH_MIN_MS) refresh();
    };
    const refreshWhenVisible = () => {
      if (!document.hidden) refreshAfterFocus();
    };

    window.addEventListener("focus", refreshAfterFocus);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    const interval = window.setInterval(refresh, LIVE_PRODUCTS_REFRESH_MS);

    return () => {
      active = false;
      window.removeEventListener("focus", refreshAfterFocus);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.clearInterval(interval);
    };
  }, []);

  return products;
}

function productsSignature(products: Product[]) {
  return products
    .map((product) =>
      [
        product._id || product.slug,
        product.title,
        product.images[0],
        product.category,
        product.collection,
        product.price,
        product.compareAtPrice,
        product.stock,
        product.rating,
        product.featured
      ].join(":")
    )
    .join("|");
}
