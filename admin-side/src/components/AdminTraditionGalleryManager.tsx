import { ImagePlus, Save } from "lucide-react";
import { ChangeEvent, useState } from "react";

const defaultImages = [
  "/assets/tradition/tradition-1.jpg",
  "/assets/tradition/tradition-2.jpg",
  "/assets/tradition/tradition-3.jpg",
  "/assets/tradition/tradition-4.jpg",
  "/assets/tradition/tradition-wide-1.jpg",
  "/assets/tradition/tradition-wide-2.jpg"
];

export function AdminTraditionGalleryManager() {
  const [enabled, setEnabled] = useState(true);
  const [heading, setHeading] = useState("Rooted In Tradition, Made For Today");
  const [images, setImages] = useState(defaultImages);
  const [saved, setSaved] = useState(false);

  function uploadImage(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImages((current) => current.map((image, imageIndex) => (imageIndex === index ? String(reader.result) : image)));
      setSaved(false);
    };
    reader.readAsDataURL(file);
  }

  function saveSettings() {
    setSaved(true);
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
                setSaved(false);
              }}
              className="rounded-md border border-admin/10 px-3 py-2 outline-none focus:border-admin/40"
            />
          </label>
          <button onClick={saveSettings} className="admin-button gap-2">
            <Save size={17} /> Save Section
          </button>
          {saved && <p className="rounded-md bg-green-100 p-3 text-sm font-semibold text-green-700">Gallery settings saved locally.</p>}
        </div>
      </div>

      <div className="admin-card p-5">
        <h3 className="font-bold text-admin">Gallery Images</h3>
        <p className="mt-1 text-sm text-ink/55">Change all 6 homepage tradition images.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {images.map((image, index) => (
            <div key={index} className="rounded-md border border-admin/10 p-3">
              <img src={image} alt="" className="h-36 w-full rounded-md bg-sand object-cover" />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold">{index < 4 ? `Left Image ${index + 1}` : `Wide Image ${index - 3}`}</p>
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
