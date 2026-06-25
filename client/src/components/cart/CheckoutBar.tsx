import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

type CheckoutBarProps = {
  total: number;
  disabled?: boolean;
  onCheckout?: () => void;
};

export function CheckoutBar({ total, disabled = false, onCheckout }: CheckoutBarProps) {
  return (
    <footer className="sticky bottom-0 border-t border-[#211d33]/10 bg-white px-5 py-4 shadow-[0_-14px_34px_rgba(33,29,51,0.12)]">
      <Link
        to="/checkout"
        onClick={onCheckout}
        className={`flex w-full items-center justify-center gap-3 rounded-lg bg-[#211d33] px-4 py-3.5 text-white transition hover:bg-[#b86b2b] ${
          disabled ? "pointer-events-none opacity-60" : ""
        }`}
      >
        <div className="text-center">
          <p className="text-base font-bold">Checkout - ₹ {total}</p>
          <p className="text-[11px] font-medium">Get Extra ₹20 off on prepaid</p>
        </div>
        <div className="hidden items-center -space-x-1 sm:flex">
          {["Paytm", "UPI", "G"].map((label) => (
            <span key={label} className="flex h-7 min-w-7 items-center justify-center rounded-full border border-white bg-white px-1 text-[9px] font-bold text-[#211d33]">
              {label}
            </span>
          ))}
        </div>
        <ChevronRight size={20} />
      </Link>
    </footer>
  );
}
