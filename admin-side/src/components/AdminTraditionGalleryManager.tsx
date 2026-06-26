import { ImagePlus, Save } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { fallbackHomepage, getAdminHomepage, updateAdminHomepage } from "../lib/api";
import type { ApiHomepage, ApiTraditionGalleryItem } from "../lib/api";

export function AdminTraditionGalleryManager() {
  const [homepage, setHomepage] = useState<ApiHomepage>(fallbackHomepage);
  const [enabled, setEnabled] = useState(fallbackHomepage.traditionGallery.enabled);
  const [heading, setHeading] = useState(fallbackHomepage.traditionGallery.heading);
  const [items, setItems] = useState<ApiTraditionGalleryItem[]>(fallbackHomepage.traditionGallery.items);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminHomepage()
      .then((savedHomepage) => {
        setHomepage(savedHomepage);
        setEnabled(savedHomepage.traditionGallery.enabled);
        setHeading(savedHomepage.traditionGallery.heading);
        setItems(savedHomepage.traditionGallery.items);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Tradition gallery content load nahi ho paya.");
      });
  }, []);

  function uploadImage(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setItems((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, image: String(reader.result) } : item)));
      setMessage("");
      setError("");
    };
    reader.readAsDataURL(file);
  }

  async function saveSettings() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const savedHomepage = await updateAdminHomepage({
        ...homepage,
        traditionGallery: {
          enabled,
          heading: heading.trim() || fallbackHomepage.traditionGallery.heading,
          items
        }
      });
      setHomepage(savedHomepage);
      setEnabled(savedHomepage.traditionGallery.enabled);
      setHeading(savedHomepage.traditionGallery.heading);
      setItems(savedHomepage.traditionGallery.items);
      setMessage("Gallery saved. Client homepage reload ke baad updated images dikhenge.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Gallery settings save nahi ho payi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <div className="admin-card p-5">
        <h3 className="font-bold text-admin">Section Settings</h3>
        <div className="mt-5 grid gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
            Enable Tradition Gallery
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Section Heading
            <input
              value={heading}
              onChange={(event) => {
                setHeading(event.target.value);
                setMessage("");
                setError("");
              }}
              className="rounded-md border border-admin/10 px-3 py-2 outline-none focus:border-admin/40"
            />
          </label>
          <button onClick={() => void saveSettings()} disabled={saving} className="admin-button gap-2 disabled:opacity-60">
            <Save size={17} /> {saving ? "Saving..." : "Save Section"}
          </button>
          {message && <p className="rounded-md bg-green-100 p-3 text-sm font-semibold text-green-700">{message}</p>}
          {error && <p className="rounded-md bg-red-100 p-3 text-sm font-semibold text-red-700">{error}</p>}
        </div>
      </div>

      <div className="admin-card p-5">
        <h3 className="font-bold text-admin">Gallery Images</h3>
        <p className="mt-1 text-sm text-ink/55">Change homepage tradition images and save them to the live client homepage.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {items.map((item, index) => (
            <div key={`${item.label}-${index}`} className="rounded-md border border-admin/10 p-3">
              <img src={item.image} alt="" className="h-36 w-full rounded-md bg-sand object-cover" />
              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="mt-1 text-xs text-ink/45 break-all">{item.image.startsWith("data:") ? "Uploaded custom image" : item.image}</p>
                </div>
                <label className="admin-button cursor-pointer gap-2 px-3 py-2">
                  <ImagePlus size={16} /> Change
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => uploadImage(index, event)} />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
