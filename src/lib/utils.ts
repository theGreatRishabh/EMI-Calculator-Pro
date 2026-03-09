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
