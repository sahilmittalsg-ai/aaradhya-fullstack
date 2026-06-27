import { ImagePlus, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { fallbackHomepage, getAdminHomepage, updateAdminHomepage } from "../lib/api";
import type { ApiHomepage, ApiTrendingProduct } from "../lib/api";

const blankProduct: ApiTrendingProduct = {
  id: 0,
  slug: "",
  image: "/assets/products/rudraksha-bracelet.jpg",
  name: "",
  price: 0,
  oldPrice: 0,
  discount: "0% OFF",
  badge: "New arrival",
  category: "Rudraksha",
  purpose: "Wealth",
  enabled: true
};

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminTrendingManager() {
  const [homepage, setHomepage] = useState<ApiHomepage>(fallbackHomepage);
  const [items, setItems] = useState<ApiTrendingProduct[]>(fallbackHomepage.trending.products);
  const [draft, setDraft] = useState<ApiTrendingProduct>({ ...blankProduct, id: Date.now() });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [autoSlide, setAutoSlide] = useState(fallbackHomepage.trending.autoplay);
  const [slideInterval, setSlideInterval] = useState(fallbackHomepage.trending.intervalMs);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminHomepage()
      .then((savedHomepage) => {
        setHomepage(savedHomepage);
        setItems(savedHomepage.trending.products);
        setAutoSlide(savedHomepage.trending.autoplay);
        setSlideInterval(savedHomepage.trending.intervalMs);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Latest & Trending content load nahi ho paya.");
      });
  }, []);

  async function persist(nextItems = items, nextAutoSlide = autoSlide, nextSlideInterval = slideInterval) {
    setSaving(true);
    setMessage("");
    setError("");

    const normalizedItems = nextItems.map((item, index) => ({
      ...item,
      id: Number(item.id || Date.now() + index),
      slug: item.slug || toSlug(item.name),
      badge: "New arrival" as const
    }));

    try {
      const savedHomepage = await updateAdminHomepage({
        ...homepage,
        trending: {
          ...homepage.trending,
          enabled: true,
          autoplay: nextAutoSlide,
          intervalMs: nextSlideInterval,
          products: normalizedItems
        }
      });
      setHomepage(savedHomepage);
      setItems(savedHomepage.trending.products);
      setAutoSlide(savedHomepage.trending.autoplay);
      setSlideInterval(savedHomepage.trending.intervalMs);
      setMessage("Latest & Trending saved. Client homepage reload ke baad updated carousel dikhega.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Latest & Trending save nahi ho paya.");
    } finally {
      setSaving(false);
    }
  }

  function saveProduct() {
    if (!draft.name.trim()) return;

    const product = {
      ...draft,
      id: editingId || Date.now(),
      slug: draft.slug || toSlug(draft.name)
    };
    const nextItems = editingId
      ? items.map((item) => (item.id === editingId ? product : item))
      : [product, ...items];

    setItems(nextItems);
    void persist(nextItems);
    setDraft({ ...blankProduct, id: Date.now() });
    setEditingId(null);
  }

  function editProduct(product: ApiTrendingProduct) {
    setDraft(product);
    setEditingId(product.id);
  }

  function deleteProduct(id: number) {
    const nextItems = items.filter((item) => item.id !== id);
    setItems(nextItems);
    void persist(nextItems);
    if (editingId === id) {
      setDraft({ ...blankProduct, id: Date.now() });
      setEditingId(null);
    }
  }

  function updateDraft<K extends keyof ApiTrendingProduct>(key: K, value: ApiTrendingProduct[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateDraft("image", String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <div className="admin-card p-5">
        <h3 className="font-bold text-admin">{editingId ? "Edit Trending Product" : "Add Trending Product"}</h3>
        <div className="mt-5 grid gap-3">
          <label className="grid gap-1 text-sm font-semibold">
            Product Image
            <div className="flex items-center gap-3">
              <img src={draft.image} alt="" loading="lazy" decoding="async" className="h-16 w-16 rounded-md bg-sand object-cover" />
              <label className="admin-button cursor-pointer gap-2">
                <ImagePlus size={17} /> Upload
                <input type="file" accept="image/*" className="hidden" onChange={uploadImage} />
              </label>
            </div>
          </label>
          <Field label="Product Name" value={draft.name} onChange={(value) => updateDraft("name", value)} />
          <Field label="Product Slug" value={draft.slug} onChange={(value) => updateDraft("slug", toSlug(value))} />
          <Field label="Price" value={String(draft.price)} onChange={(value) => updateDraft("price", Number(value))} type="number" />
          <Field label="Old Price" value={String(draft.oldPrice)} onChange={(value) => updateDraft("oldPrice", Number(value))} type="number" />
          <Field label="Discount Badge" value={draft.discount} onChange={(value) => updateDraft("discount", value)} />
          <Field label="Category" value={draft.category} onChange={(value) => updateDraft("category", value)} />
          <Field label="Purpose" value={draft.purpose} onChange={(value) => updateDraft("purpose", value)} />
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={draft.enabled} onChange={(event) => updateDraft("enabled", event.target.checked)} />
            Enable in Latest & Trending
          </label>
          <button onClick={saveProduct} disabled={saving} className="admin-button gap-2 disabled:opacity-60">
            {editingId ? <Save size={17} /> : <Plus size={17} />}
            {saving ? "Saving..." : editingId ? "Save Changes" : "Add Product"}
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="admin-card p-5">
          <h3 className="font-bold text-admin">Carousel Settings</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={autoSlide} onChange={(event) => setAutoSlide(event.target.checked)} />
              Auto-slide {autoSlide ? "ON" : "OFF"}
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Auto-slide timing
              <select value={slideInterval} onChange={(event) => setSlideInterval(Number(event.target.value))} className="rounded-md border border-admin/10 px-3 py-2">
                <option value={3000}>3s</option>
                <option value={4000}>4s</option>
                <option value={5000}>5s</option>
                <option value={6000}>6s</option>
              </select>
            </label>
          </div>
          <button type="button" onClick={() => void persist()} disabled={saving} className="admin-button mt-5 gap-2 disabled:opacity-60">
            <Save size={17} /> {saving ? "Saving..." : "Save Carousel"}
          </button>
          {message && <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>}
          {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        </div>

        <div className="admin-card overflow-hidden">
          <div className="border-b border-admin/10 px-5 py-4">
            <h3 className="font-bold text-admin">Latest & Trending Products</h3>
          </div>
          <div className="grid gap-3 p-5">
            {items.map((item) => (
              <div key={item.id} className="grid gap-3 rounded-md border border-admin/10 p-3 md:grid-cols-[72px_1fr_auto] md:items-center">
                <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="h-16 w-16 rounded-md bg-sand object-cover" />
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-ink/55">
                    Rs.{item.price} / <span className="line-through">Rs.{item.oldPrice}</span> | {item.discount} | {item.category} | {item.purpose}
                  </p>
                  <p className="mt-1 text-xs font-bold text-admin">{item.enabled ? "Enabled" : "Disabled"}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editProduct(item)} className="rounded-md bg-sand p-2 text-admin" aria-label="Edit product">
                    <Pencil size={17} />
                  </button>
                  <button onClick={() => deleteProduct(item.id)} className="rounded-md bg-red-100 p-2 text-red-700" aria-label="Delete product">
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-1 text-sm font-semibold">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-md border border-admin/10 px-3 py-2 outline-none focus:border-admin/40"
      />
    </label>
  );
}
