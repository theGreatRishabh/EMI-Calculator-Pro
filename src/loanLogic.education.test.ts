import { describe, it, expect } from "vitest";
import {
  calculateEducationMoratorium,
  generateEducationAmortizationSchedule,
  calculateEducationComparison,
} from "./loanLogic";
import {
  MoratoriumPaymentOption,
  MoratoriumInterestType,
  PrepaymentType,
  PrepaymentReduction,
} from "./types";

describe("Education Loan Calculations", () => {
  const defaultParams = {
    principal: 2000000, // 20 Lakhs
    annualRate: 10, // 10% p.a.
    courseDurationMonths: 24, // 2 years
    gracePeriodMonths: 6, // 6 months (total 30 months)
    moratoriumPaymentOption: MoratoriumPaymentOption.NO_PAYMENT,
    moratoriumInterestType: MoratoriumInterestType.SIMPLE_INTEREST,
  };

  describe("calculateEducationMoratorium", () => {
    it("correctly calculates Simple Interest with No Payment (Capitalization)", () => {
      const summary = calculateEducationMoratorium(defaultParams);

      // Monthly SI = 20,00,000 * 10% / 12 = 16,666.666...
      // Total 30 months SI = 20,00,000 * 10% * (30/12) = 5,00,000
      expect(summary.moratoriumMonths).toBe(30);
      expect(summary.totalInterestAccrued).toBeCloseTo(500000, 0);
      expect(summary.totalInterestPaid).toBe(0);
      expect(summary.capitalizedInterest).toBeCloseTo(500000, 0);
      expect(summary.capitalizedPrincipal).toBeCloseTo(2500000, 0);
      expect(summary.effectiveRepaymentRate).toBe(10);
    });

    it("correctly handles Pay Simple Interest Monthly with 1% concession discount", () => {
      const summary = calculateEducationMoratorium({
        ...defaultParams,
        moratoriumPaymentOption: MoratoriumPaymentOption.PAY_SIMPLE_INTEREST,
        enableConcession: true,
        concessionRatePercent: 1.0,
      });

      expect(summary.moratoriumMonths).toBe(30);
      expect(summary.totalInterestAccrued).toBeCloseTo(500000, 0);
      expect(summary.totalInterestPaid).toBeCloseTo(500000, 0);
      expect(summary.capitalizedInterest).toBe(0);
      expect(summary.capitalizedPrincipal).toBe(2000000);
      // Rate reduced from 10% to 9% due to 1% concession
      expect(summary.effectiveRepaymentRate).toBe(9);
    });

    it("correctly handles Partial Interest Payment", () => {
      const summary = calculateEducationMoratorium({
        ...defaultParams,
        moratoriumPaymentOption: MoratoriumPaymentOption.PARTIAL_INTEREST,
        partialPaymentAmount: 10000, // Pays 10k/month
      });

      // Total paid = 10,000 * 30 = 3,00,000
      // Total accrued = 5,00,000
      // Capitalized = 2,00,000
      expect(summary.totalInterestPaid).toBe(300000);
      expect(summary.capitalizedInterest).toBe(200000);
      expect(summary.capitalizedPrincipal).toBe(2200000);
    });

    it("calculates Compound Interest when configured for private lenders", () => {
      const summary = calculateEducationMoratorium({
        ...defaultParams,
        moratoriumInterestType: MoratoriumInterestType.COMPOUND_INTEREST,
      });

      // Compounded monthly: 2,000,000 * (1 + 0.10/12)^30 = ~2,564,073
      expect(summary.capitalizedPrincipal).toBeGreaterThan(2500000);
      expect(summary.totalInterestAccrued).toBeGreaterThan(500000);
    });
  });

  describe("generateEducationAmortizationSchedule", () => {
    it("generates a continuous schedule with Moratorium followed by Repayment", () => {
      const startDate = new Date("2024-01-01");
      const schedule = generateEducationAmortizationSchedule({
        ...defaultParams,
        repaymentTenureMonths: 120, // 10 years
        startDate,
      });

      // Total months = 30 moratorium + 120 repayment = 150 months
      expect(schedule.length).toBe(150);

      // Phase 1 verification
      const month1 = schedule[0];
      expect(month1.isMoratorium).toBe(true);
      expect(month1.phase).toBe("MORATORIUM");
      expect(month1.principal).toBe(0);
      expect(month1.interest).toBeCloseTo(16666.67, 1);

      // Transition verification at month 30
      const month30 = schedule[29];
      expect(month30.isMoratorium).toBe(true);
      expect(month30.closingBalance).toBeCloseTo(2500000, 0);

      // Phase 2 verification at month 31
      const month31 = schedule[30];
      expect(month31.isMoratorium).toBe(false);
      expect(month31.phase).toBe("REPAYMENT");
      expect(month31.openingBalance).toBeCloseTo(2500000, 0);
      expect(month31.principal).toBeGreaterThan(0);

      // Final month payoff
      const lastMonth = schedule[schedule.length - 1];
      expect(lastMonth.closingBalance).toBeCloseTo(0, 0);

      // Verify that total payments = principal + total interest
      const totalInterest = schedule.reduce((sum, r) => sum + r.interest, 0);
      const totalPaid = schedule.reduce(
        (sum, r) => sum + r.emi + r.prepayment,
        0,
      );
      expect(totalPaid).toBeCloseTo(defaultParams.principal + totalInterest, 0);
    });

    it("handles prepayments during the repayment phase of an education loan", () => {
      const startDate = new Date("2024-01-01");
      const schedule = generateEducationAmortizationSchedule({
        ...defaultParams,
        repaymentTenureMonths: 120,
        startDate,
        prepayments: [
          {
            id: "pp-1",
            amount: 500000,
            startDate: "2026-07-01", // Month 31 (month 1 of repayment)
            type: PrepaymentType.ONE_TIME,
            reduction: PrepaymentReduction.TENURE,
          },
        ],
      });

      // Tenure should be shortened due to 5 lakh prepayment
      expect(schedule.length).toBeLessThan(150);
      const lastMonth = schedule[schedule.length - 1];
      expect(lastMonth.closingBalance).toBeCloseTo(0, 0);
    });
  });

  describe("calculateEducationComparison", () => {
    it("calculates meaningful savings when servicing Simple Interest during moratorium", () => {
      const comparison = calculateEducationComparison(
        defaultParams,
        120, // 10 years repayment
      );

      expect(comparison.savings.totalInterestSaved).toBeGreaterThan(100000);
      expect(comparison.savings.monthlyEmiDifference).toBeGreaterThan(0);
      expect(comparison.savings.capitalizedInterestAvoided).toBeCloseTo(
        500000,
        0,
      );
    });
  });
});
