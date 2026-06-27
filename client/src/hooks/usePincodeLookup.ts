import { useEffect, useState } from "react";
import { lookupPincode } from "../lib/api";
import type { PincodeLocation } from "../lib/api";

type LookupState = {
  status: "idle" | "loading" | "success" | "error";
  location?: PincodeLocation;
  message?: string;
};

const locationCache = new Map<string, PincodeLocation>();

export function usePincodeLookup(pincode: string): LookupState {
  const digits = pincode.replace(/\D/g, "").slice(0, 6);
  const [lookup, setLookup] = useState<LookupState>({ status: "idle" });

  useEffect(() => {
    if (digits.length !== 6) {
      setLookup({ status: "idle" });
      return;
    }

    const cached = locationCache.get(digits);
    if (cached) {
      setLookup({ status: "success", location: cached });
      return;
    }

    let active = true;
    setLookup({ status: "loading" });
    const timer = window.setTimeout(() => {
      lookupPincode(digits)
        .then((location) => {
          if (!active) return;
          locationCache.set(digits, location);
          setLookup({ status: "success", location });
        })
        .catch((error) => {
          if (!active) return;
          setLookup({
            status: "error",
            message: error instanceof Error ? error.message : "PIN code could not be found."
          });
        });
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [digits]);

  return lookup;
}
