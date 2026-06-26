import { useEffect, useState } from "react";
import { getProducts, refreshProducts } from "../lib/api";
import type { Product } from "../types";

const LIVE_PRODUCTS_REFRESH_MS = 30_000;

export function useLiveProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;

    async function loadProducts(force = false) {
      const rows = force ? await refreshProducts() : await getProducts();
      if (active) setProducts(rows);
    }

    void loadProducts();

    const refresh = () => {
      void loadProducts(true);
    };
    const refreshWhenVisible = () => {
      if (!document.hidden) refresh();
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    const interval = window.setInterval(refresh, LIVE_PRODUCTS_REFRESH_MS);

    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
      window.clearInterval(interval);
    };
  }, []);

  return products;
}
