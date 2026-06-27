import { ImagePlus, Save } from "lucide-react";
import { ChangeEvent, useEffect, useState } from "react";
import { fallbackHomepage, getAdminHomepage, updateAdminHomepage } from "../lib/api";
import type { ApiHomepage } from "../lib/api";

export function AdminHeroSliderManager() {
  const [homepage, setHomepage] = useState<ApiHomepage>(fallbackHomepage);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAdminHomepage().then(setHomepage);
  }, []);

  function updateSlideImage(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setHomepage((current) => ({
        ...current,
        hero: {
          ...current.hero,
          slides: current.hero.slides.map((slide, slideIndex) =>
            slideIndex === index ? { ...slide, image: String(reader.result) } : slide
          )
        }
      }));
      setMessage("");
      setError("");
    };
    reader.readAsDataURL(file);
  }

  async function saveHeroImages() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const savedHomepage = await updateAdminHomepage(homepage);
      setHomepage(savedHomepage);
      setMessage("Hero slider photos saved. Client homepage refresh ke baad updated images dikhenge.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Hero slider photos save nahi ho payi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="admin-card p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="font-bold text-admin">Uploaded Hero Photos</h3>
            <p className="mt-1 text-sm leading-6 text-ink/55">
              Yahan wahi photos dikh rahi hain jo homepage slider me currently set hain. Kisi slide ki photo replace karni ho to Change Photo use karo.
            </p>
          </div>
          <button type="button" onClick={saveHeroImages} disabled={saving} className="admin-button gap-2 disabled:opacity-60">
            <Save size={17} /> {saving ? "Saving..." : "Save Photos"}
          </button>
        </div>
        {message && <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>}
        {error && <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {homepage.hero.slides.map((slide, index) => (
          <div key={slide.id} className="admin-card overflow-hidden">
            <img src={slide.image} alt={slide.heading} loading="lazy" decoding="async" className="h-56 w-full bg-[#f6e8ce] object-cover" />
            <div className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b86b2b]">Slide {index + 1}</p>
                  <h4 className="mt-1 font-bold text-admin">{slide.heading}</h4>
                  <p className="mt-1 text-xs text-ink/45 break-all">{slide.image.startsWith("data:") ? "Uploaded custom image" : slide.image}</p>
                </div>
                <label className="admin-button cursor-pointer gap-2 px-4 py-2">
                  <ImagePlus size={16} /> Change Photo
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => updateSlideImage(index, event)} />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
