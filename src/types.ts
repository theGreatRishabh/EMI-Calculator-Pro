export enum LoanType {
  HOME = "HOME",
  CAR = "CAR",
  PERSONAL = "PERSONAL",
}

export enum AdjustmentMode {
  KEEP_EMI = "KEEP_EMI",
  KEEP_TENURE = "KEEP_TENURE",
}

export enum PrepaymentType {
  ONE_TIME = "ONE_TIME",
  RECURRING = "RECURRING",
}

export enum PrepaymentReduction {
  TENURE = "TENURE",
  EMI = "EMI",
}

export interface RateChange {
  id: string;
  effectiveDate: string; // YYYY-MM-DD
  newRate: number;
  mode: AdjustmentMode;
}

export interface Prepayment {
  id: string;
  amount: number;
  startDate: string; // YYYY-MM-DD
  type: PrepaymentType;
  frequency?: number; // months
  reduction: PrepaymentReduction;
}

export interface AmortizationRow {
  month: number;
  date: Date;
  openingBalance: number;
  emi: number;
  interest: number;
  principal: number;
  prepayment: number;
  closingBalance: number;
  interestRate: number;
}

export interface LoanSummary {
  monthlyEmi: number;
  totalPrincipal: number;
  totalInterest: number;
  totalPayment: number;
  tenureMonths: number;
  savedInterest: number;
  savedMonths: number;
}

export interface TaxTip {
  title: string;
  amount: number;
  limitLabel: string;
  description: string;
}

export interface CurrencyConfig {
  code: string;
  locale: string;
  symbol: string;
  name: string;
  taxTips: TaxTip[];
  useIndianNotation: boolean; // For Lakhs/Crores
  stampDutyRate?: number; // percentage
  registrationRate?: number; // percentage
}
