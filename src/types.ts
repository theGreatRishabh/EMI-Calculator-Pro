export enum LoanType {
  HOME = "HOME",
  CAR = "CAR",
  PERSONAL = "PERSONAL",
  EDUCATION = "EDUCATION",
}

export enum MoratoriumPaymentOption {
  NO_PAYMENT = "NO_PAYMENT",
  PAY_SIMPLE_INTEREST = "PAY_SIMPLE_INTEREST",
  PARTIAL_INTEREST = "PARTIAL_INTEREST",
}

export enum MoratoriumInterestType {
  SIMPLE_INTEREST = "SIMPLE_INTEREST",
  COMPOUND_INTEREST = "COMPOUND_INTEREST",
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
  isMoratorium?: boolean;
  phase?: "MORATORIUM" | "REPAYMENT";
  moratoriumInterestAccrued?: number;
  moratoriumPayment?: number;
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

export interface EducationTaxTip {
  title: string;
  amount: number;
  limitLabel: string;
  description: string;
  details?: string;
}

export interface EducationAdvice {
  concessionTitle: string;
  concessionDescription: string;
  defaultConcessionRate: number;
  bankingTip: string;
  taxTips: EducationTaxTip[];
}

export interface CurrencyConfig {
  code: string;
  locale: string;
  symbol: string;
  name: string;
  taxTips: TaxTip[];
  educationAdvice?: EducationAdvice;
  useIndianNotation: boolean; // For Lakhs/Crores
  stampDutyRate?: number; // percentage
  registrationRate?: number; // percentage
}

