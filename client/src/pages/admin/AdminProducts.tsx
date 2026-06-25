import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminShell } from "../../components/AdminShell";
import { getProducts } from "../../lib/api";
import type { Product } from "../../types";

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  return (
    <AdminShell title="Products">
      <div className="mb-5 flex justify-end">
        <button className="btn-primary gap-2">
          <Plus size={18} /> Add Product
        </button>
      </div>
      <div className="overflow-hidden rounded-lg border border-rudra/10 bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-sandal text-xs uppercase tracking-[0.16em] text-rudra">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Collection</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rudra/10">
            {products.map((product) => (
              <tr key={product.slug}>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <img src={product.images[0]} alt={product.title} className="h-14 w-14 rounded-md object-cover" />
                    <div>
                      <p className="font-black">{product.title}</p>
                      <p className="text-xs text-ink/50">{product.subtitle}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">{product.collection}</td>
                <td className="px-4 py-4">
                  <p className="text-xs text-ink/45 line-through">MRP Rs.{product.compareAtPrice}</p>
                  <p className="font-black">Rs.{product.price}</p>
                  <p className="text-xs font-bold text-green-700">
                    {Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% off
                  </p>
                </td>
                <td className="px-4 py-4">{product.stock}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
