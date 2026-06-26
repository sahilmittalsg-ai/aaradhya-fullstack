import { Grid2X2Plus, MapPin, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const dismissKey = "aaradhya-help-choose-dismissed";

export function HelpMeChoose() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(dismissKey) === "1";
    if (dismissed) return;

    const timer = window.setTimeout(() => {
      if (window.innerWidth < 769) setOpen(true);
    }, 20000);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  function closeDrawer(remember = false) {
    if (remember) window.localStorage.setItem(dismissKey, "1");
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-0 top-1/2 z-50 flex -translate-y-1/2 items-stretch overflow-hidden rounded-l-2xl border border-[#c9a55c]/25 bg-[#17120f] text-left shadow-2xl shadow-black/30 md:hidden"
        aria-label="Help me choose a product"
      >
        <span className="w-1 bg-gradient-to-b from-[#8b7340] via-[#e8d5a3] to-[#8b7340]" />
        <span className="flex items-center gap-2 px-2.5 py-3">
          <Sparkles size={19} className="text-[#c9a55c]" />
          <span className="grid border-l border-[#c9a55c]/25 pl-2 leading-none">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9a55c]">Help Me</span>
            <span className="mt-1 text-[12px] font-bold uppercase tracking-[0.08em] text-[#f5e6c8]">Choose</span>
          </span>
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] md:hidden" role="dialog" aria-modal="true" aria-label="Product recommendation help">
          <button
            type="button"
            className="absolute inset-0 bg-black/62"
            aria-label="Close product recommendation help"
            onClick={() => closeDrawer(true)}
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-[28px] border border-[#c9a55c]/18 bg-[#0c0a09] px-5 pb-6 pt-3 text-[#f5e6c8] shadow-2xl">
            <div className="mx-auto h-1.5 w-14 rounded-full bg-[#c9a55c]/25" />
            <button
              type="button"
              onClick={() => closeDrawer(true)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#c9a55c]/20 bg-white/5 text-[#f5e6c8]"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <p className="mt-8 text-center text-xs font-bold uppercase tracking-[0.26em] text-[#c9a55c]">Om guidance</p>
            <h2 className="mx-auto mt-3 max-w-xs text-center font-heading text-[28px] font-bold leading-tight text-white">
              Not sure what's right for you?
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-6 text-[#d6cab7]">
              Tell Aaradhya Sevak your intent, order need, or product question and get guided to the best match.
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Your Intent", icon: Sparkles },
                { label: "Need Match", icon: MapPin },
                { label: "Best Picks", icon: Grid2X2Plus }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="grid gap-2">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a55c]/20 bg-[#17120f] text-[#c9a55c]">
                      <Icon size={22} />
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d6cab7]">{item.label}</span>
                  </div>
                );
              })}
            </div>

            <Link
              to="/support"
              onClick={() => closeDrawer(true)}
              className="mt-7 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#8b7340] via-[#e8d5a3] to-[#8b7340] px-5 py-4 text-sm font-black uppercase tracking-[0.05em] text-[#0c0a09] shadow-lg shadow-[#c9a55c]/15"
            >
              Find My Perfect Match
            </Link>
            <p className="mt-4 text-center text-xs text-[#d6cab7]/72">5 simple questions · Free · No sign-up needed</p>
          </div>
        </div>
      )}
    </>
  );
}
