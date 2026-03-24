// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: localStorage-backed currency preference hook.
//          Used by the donate page and PremiumGate to let users
//          choose between EUR and USD for Stripe checkout.
// ============================================================

import { useState, useEffect, useCallback } from "react";

export type Currency = "eur" | "usd";

const STORAGE_KEY = "preferred_currency";
const DEFAULT_CURRENCY: Currency = "eur";

export function useCurrency() {
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "eur" || stored === "usd") {
        setCurrencyState(stored);
      }
    } catch {}
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {}
  }, []);

  const symbol = currency === "eur" ? "\u20ac" : "$";

  return { currency, setCurrency, symbol } as const;
}
