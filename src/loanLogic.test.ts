import { describe, it, expect } from "vitest";
import { calculateEMI, generateAmortizationSchedule } from "./loanLogic";
import { AdjustmentMode, PrepaymentType, PrepaymentReduction } from "./types";

describe("loanLogic", () => {
  describe("calculateEMI", () => {
    it("should calculate EMI correctly for a standard loan", () => {
      // 100,000 at 10% for 12 months
      const emi = calculateEMI(100000, 10, 12);
      expect(emi).toBeCloseTo(8791.59, 1);
    });

    it("should handle zero interest rate", () => {
      const emi = calculateEMI(120000, 0, 12);
      expect(emi).toBe(10000);
    });
  });

  describe("generateAmortizationSchedule", () => {
    const startDate = new Date("2024-01-01");

    it("should generate a basic schedule correctly", () => {
      const schedule = generateAmortizationSchedule(100000, 10, 12, startDate);
      expect(schedule.length).toBeGreaterThan(0);
      expect(schedule[0].month).toBe(1);

      const firstRow = schedule[0];
      expect(firstRow.openingBalance).toBe(100000);
      expect(firstRow.interest).toBeCloseTo(833.33, 1); // 100000 * 10% / 12
      expect(firstRow.emi).toBeCloseTo(8791.59, 1);

      const lastRow = schedule[schedule.length - 1];
      expect(lastRow.closingBalance).toBeCloseTo(0, 1);
    });

    it("should handle rate changes", () => {
      const schedule = generateAmortizationSchedule(100000, 10, 12, startDate, [
        {
          id: "rc-1",
          effectiveDate: "2024-04-01",
          newRate: 12,
          mode: AdjustmentMode.KEEP_TENURE,
        },
      ]);

      const rowAtChange = schedule.find((r) => r.month === 4);
      expect(rowAtChange).toBeDefined();
      expect(rowAtChange?.interestRate).toBe(12);
    });

    it("should handle one-time prepayments", () => {
      const schedule = generateAmortizationSchedule(
        100000,
        10,
        12,
        startDate,
        [],
        [
          {
            id: "prepayment-1",
            type: PrepaymentType.ONE_TIME,
            startDate: "2024-03-01",
            amount: 20000,
            reduction: PrepaymentReduction.TENURE,
          },
        ],
      );

      const rowPrepayment = schedule.find((r) => r.month === 3);
      expect(rowPrepayment).toBeDefined();
      expect(rowPrepayment?.prepayment).toBe(20000);
    });
  });
});
