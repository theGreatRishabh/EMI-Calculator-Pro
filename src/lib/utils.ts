import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  currency: string = "INR",
  locale: string = "en-IN",
  useIndianNotation: boolean = true,
) {
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  });

  if (useIndianNotation && currency === "INR") {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakh`;
    }
  } else if (!useIndianNotation || currency !== "INR") {
    if (amount >= 1000000000) {
      return `${formatter.format(amount / 1000000000)}B`;
    } else if (amount >= 1000000) {
      const symbol = formatter
        .formatToParts(amount)
        .find((p) => p.type === "currency")?.value;
      return `${symbol}${(amount / 1000000).toFixed(2)}M`;
    }
  }

  return formatter.format(amount);
}

export function formatCurrencyFull(
  amount: number,
  currency: string = "INR",
  locale: string = "en-IN",
) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCompactCurrency(
  value: number,
  symbol: string = "₹",
  useIndianNotation: boolean = true,
  currencyCode: string = "INR",
): string {
  if (value === 0) return `${symbol}0`;

  const absVal = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (useIndianNotation && currencyCode === "INR") {
    if (absVal >= 10000000) {
      const cr = absVal / 10000000;
      return `${sign}${symbol}${Number.isInteger(cr) ? cr : Number(cr.toFixed(2))}Cr`;
    }
    if (absVal >= 100000) {
      const l = absVal / 100000;
      return `${sign}${symbol}${Number.isInteger(l) ? l : Number(l.toFixed(2))}L`;
    }
    if (absVal >= 1000) {
      const k = absVal / 1000;
      return `${sign}${symbol}${Number.isInteger(k) ? k : Number(k.toFixed(1))}k`;
    }
    return `${sign}${symbol}${absVal}`;
  }

  // Western / US notation (100K, 1M, 1B etc.)
  if (absVal >= 1000000000) {
    const b = absVal / 1000000000;
    return `${sign}${symbol}${Number.isInteger(b) ? b : Number(b.toFixed(2))}B`;
  }
  if (absVal >= 1000000) {
    const m = absVal / 1000000;
    return `${sign}${symbol}${Number.isInteger(m) ? m : Number(m.toFixed(2))}M`;
  }
  if (absVal >= 1000) {
    const k = absVal / 1000;
    return `${sign}${symbol}${Number.isInteger(k) ? k : Number(k.toFixed(1))}K`;
  }
  return `${sign}${symbol}${absVal}`;
}

