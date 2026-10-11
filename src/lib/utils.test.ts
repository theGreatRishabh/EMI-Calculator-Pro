import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatCurrencyFull,
  formatCompactCurrency,
} from "./utils";

describe("Currency Formatters", () => {
  describe("formatCurrencyFull", () => {
    it("formats standard USD currency correctly", () => {
      const formatted = formatCurrencyFull(1234567.89, "USD", "en-US");
      // Expect $1,234,568 (since maximumFractionDigits is 0)
      expect(formatted.replace(/\s/g, "")).toBe("$1,234,568");
    });

    it("formats INR currency correctly using Indian locale", () => {
      const formatted = formatCurrencyFull(1234567.89, "INR", "en-IN");
      // Expect ₹12,34,568
      expect(formatted.replace(/\s/g, "")).toBe("₹12,34,568");
    });
  });

  describe("formatCurrency", () => {
    it("formats Indian notation dynamically turning large numbers into Lakh/Cr", () => {
      expect(formatCurrency(50000, "INR", "en-IN", true)).toContain("50,000");
      expect(formatCurrency(150000, "INR", "en-IN", true)).toBe("₹1.50 Lakh");
      expect(formatCurrency(20000000, "INR", "en-IN", true)).toBe("₹2.00 Cr");
    });

    it("formats Western notation dynamically turning large numbers into M, B", () => {
      expect(formatCurrency(50000, "USD", "en-US", false)).toContain("50,000");
      expect(formatCurrency(1500000, "USD", "en-US", false)).toBe("$1.50M");
      // 2 billion
      expect(formatCurrency(2000000000, "USD", "en-US", false)).toBe("$2B");
    });

    it("falls back to base format when below large thresholds", () => {
      expect(
        formatCurrency(500, "EUR", "de-DE", false).replace(/\s/g, ""),
      ).toContain("500");
    });
  });

  describe("formatCompactCurrency", () => {
    it("formats Indian notation correctly for axis ticks (L, Cr, k)", () => {
      expect(formatCompactCurrency(0, "₹", true, "INR")).toBe("₹0");
      expect(formatCompactCurrency(50000, "₹", true, "INR")).toBe("₹50k");
      expect(formatCompactCurrency(500000, "₹", true, "INR")).toBe("₹5L");
      expect(formatCompactCurrency(1500000, "₹", true, "INR")).toBe("₹15L");
      expect(formatCompactCurrency(10000000, "₹", true, "INR")).toBe("₹1Cr");
      expect(formatCompactCurrency(25000000, "₹", true, "INR")).toBe("₹2.5Cr");
    });

    it("formats Western/US notation correctly for foreign markets (K, M, B)", () => {
      expect(formatCompactCurrency(0, "$", false, "USD")).toBe("$0");
      expect(formatCompactCurrency(50000, "$", false, "USD")).toBe("$50K");
      expect(formatCompactCurrency(100000, "$", false, "USD")).toBe("$100K");
      expect(formatCompactCurrency(500000, "$", false, "USD")).toBe("$500K");
      expect(formatCompactCurrency(1000000, "$", false, "USD")).toBe("$1M");
      expect(formatCompactCurrency(1500000, "$", false, "USD")).toBe("$1.5M");
      expect(formatCompactCurrency(2000000000, "$", false, "USD")).toBe("$2B");
    });
  });
});
