import { addMonths, differenceInCalendarMonths, parseISO } from "date-fns";
import {
  AmortizationRow,
  LoanType,
  RateChange,
  Prepayment,
  AdjustmentMode,
  PrepaymentReduction,
  PrepaymentType,
  MoratoriumPaymentOption,
  MoratoriumInterestType,
} from "./types";

export const LOAN_DEFAULTS = {
  [LoanType.HOME]: {
    amount: 5000000,
    rate: 8.5,
    tenure: 20,
    maxAmount: 50000000,
    maxTenure: 30,
  },
  [LoanType.CAR]: {
    amount: 1000000,
    rate: 9.5,
    tenure: 5,
    maxAmount: 5000000,
    maxTenure: 7,
  },
  [LoanType.PERSONAL]: {
    amount: 500000,
    rate: 12,
    tenure: 3,
    maxAmount: 2500000,
    maxTenure: 5,
  },
  [LoanType.EDUCATION]: {
    amount: 2000000,
    rate: 9.5,
    tenure: 10,
    maxAmount: 15000000,
    maxTenure: 15,
  },
};

export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number,
): number {
  if (annualRate === 0) return principal / tenureMonths;
  const monthlyRate = annualRate / 12 / 100;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1)
  );
}

export function generateAmortizationSchedule(
  principal: number,
  initialRate: number,
  initialTenureMonths: number,
  startDate: Date,
  rateChanges: RateChange[] = [],
  prepayments: Prepayment[] = [],
  emiStepUpPercent: number = 0,
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  let currentBalance = principal;
  let currentRate = initialRate;
  let currentEmi = calculateEMI(principal, initialRate, initialTenureMonths);
  let month = 1;

  // Sort rate changes and prepayments by date
  const sortedRateChanges = [...rateChanges].sort((a, b) =>
    a.effectiveDate.localeCompare(b.effectiveDate),
  );

  while (currentBalance > 0.01 && month <= 600) {
    // Safety break at 50 years
    const currentDate = addMonths(startDate, month - 1);

    // Apply EMI step-up every 12 months (before rate change, on anniversary)
    if (emiStepUpPercent > 0 && month > 1 && (month - 1) % 12 === 0) {
      currentEmi = currentEmi * (1 + emiStepUpPercent / 100);
    }

    // Check for rate changes
    const rateChange = sortedRateChanges.find((rc) => {
      const rcMonth =
        differenceInCalendarMonths(parseISO(rc.effectiveDate), startDate) + 1;
      return rcMonth === month;
    });

    if (rateChange) {
      currentRate = rateChange.newRate;
      if (rateChange.mode === AdjustmentMode.KEEP_TENURE) {
        const remainingMonths = initialTenureMonths - month + 1;
        currentEmi = calculateEMI(
          currentBalance,
          currentRate,
          Math.max(1, remainingMonths),
        );
      } else {
        // Keep EMI same, tenure will naturally adjust as we continue the loop
      }
    }

    const monthlyRate = currentRate / 12 / 100;
    const interest = currentBalance * monthlyRate;
    let principalPaid = Math.min(currentBalance, currentEmi - interest);

    // Calculate prepayments for this month
    let totalPrepayment = 0;
    prepayments.forEach((p) => {
      const pStartMonth =
        differenceInCalendarMonths(parseISO(p.startDate), startDate) + 1;
      if (p.type === PrepaymentType.ONE_TIME) {
        if (pStartMonth === month) {
          totalPrepayment += p.amount;
        }
      } else if (p.type === PrepaymentType.RECURRING) {
        if (
          month >= pStartMonth &&
          (month - pStartMonth) % (p.frequency || 12) === 0
        ) {
          totalPrepayment += p.amount;
        }
      }
    });

    totalPrepayment = Math.min(currentBalance - principalPaid, totalPrepayment);

    const openingBalance = currentBalance;
    currentBalance = currentBalance - principalPaid - totalPrepayment;

    schedule.push({
      month,
      date: currentDate,
      openingBalance,
      emi: principalPaid + interest,
      interest,
      principal: principalPaid,
      prepayment: totalPrepayment,
      closingBalance: Math.max(0, currentBalance),
      interestRate: currentRate,
    });

    // If prepayment reduces EMI, recalculate EMI for next month
    const activePrepayment = prepayments.find((p) => {
      const pStartMonth =
        differenceInCalendarMonths(parseISO(p.startDate), startDate) + 1;
      return (
        (p.type === PrepaymentType.ONE_TIME &&
          pStartMonth === month &&
          p.reduction === PrepaymentReduction.EMI) ||
        (p.type === PrepaymentType.RECURRING &&
          month >= pStartMonth &&
          (month - pStartMonth) % (p.frequency || 12) === 0 &&
          p.reduction === PrepaymentReduction.EMI)
      );
    });

    if (activePrepayment && currentBalance > 0) {
      const remainingMonths = initialTenureMonths - month;
      if (remainingMonths > 0) {
        currentEmi = calculateEMI(currentBalance, currentRate, remainingMonths);
      }
    }

    month++;
  }

  return schedule;
}

export interface EducationMoratoriumParams {
  principal: number;
  annualRate: number;
  courseDurationMonths: number;
  gracePeriodMonths: number;
  moratoriumPaymentOption: MoratoriumPaymentOption;
  moratoriumInterestType: MoratoriumInterestType;
  partialPaymentAmount?: number;
  enableConcession?: boolean;
  concessionRatePercent?: number; // e.g. 1.0% discount if paying SI
}

export interface EducationMoratoriumSummary {
  moratoriumMonths: number;
  totalInterestAccrued: number;
  totalInterestPaid: number;
  capitalizedInterest: number;
  capitalizedPrincipal: number;
  monthlySimpleInterest: number;
  effectiveRepaymentRate: number;
}

export function calculateEducationMoratorium(
  params: EducationMoratoriumParams,
): EducationMoratoriumSummary {
  const {
    principal,
    annualRate,
    courseDurationMonths,
    gracePeriodMonths,
    moratoriumPaymentOption,
    moratoriumInterestType,
    partialPaymentAmount = 0,
    enableConcession = true,
    concessionRatePercent = 1.0,
  } = params;

  const moratoriumMonths = Math.max(0, courseDurationMonths + gracePeriodMonths);
  const monthlyRate = annualRate / 12 / 100;
  const monthlySimpleInterest = principal * monthlyRate;

  let totalInterestAccrued = 0;
  let totalInterestPaid = 0;
  let currentBalance = principal;

  if (moratoriumInterestType === MoratoriumInterestType.SIMPLE_INTEREST) {
    totalInterestAccrued = monthlySimpleInterest * moratoriumMonths;

    if (moratoriumPaymentOption === MoratoriumPaymentOption.PAY_SIMPLE_INTEREST) {
      totalInterestPaid = totalInterestAccrued;
    } else if (moratoriumPaymentOption === MoratoriumPaymentOption.PARTIAL_INTEREST) {
      totalInterestPaid = Math.min(totalInterestAccrued, partialPaymentAmount * moratoriumMonths);
    } else {
      totalInterestPaid = 0;
    }
  } else {
    // COMPOUND INTEREST (Monthly compounding during moratorium)
    for (let m = 1; m <= moratoriumMonths; m++) {
      const interest = currentBalance * monthlyRate;
      totalInterestAccrued += interest;

      let payment = 0;
      if (moratoriumPaymentOption === MoratoriumPaymentOption.PAY_SIMPLE_INTEREST) {
        payment = interest;
      } else if (moratoriumPaymentOption === MoratoriumPaymentOption.PARTIAL_INTEREST) {
        payment = partialPaymentAmount;
      }

      totalInterestPaid += payment;
      currentBalance = currentBalance + interest - payment;
    }
  }

  const capitalizedInterest = Math.max(0, totalInterestAccrued - totalInterestPaid);
  const capitalizedPrincipal = principal + capitalizedInterest;

  // 1% concession applied if simple interest is serviced promptly during moratorium
  let effectiveRepaymentRate = annualRate;
  if (
    moratoriumPaymentOption === MoratoriumPaymentOption.PAY_SIMPLE_INTEREST &&
    enableConcession
  ) {
    effectiveRepaymentRate = Math.max(0.1, annualRate - concessionRatePercent);
  }

  return {
    moratoriumMonths,
    totalInterestAccrued,
    totalInterestPaid,
    capitalizedInterest,
    capitalizedPrincipal,
    monthlySimpleInterest,
    effectiveRepaymentRate,
  };
}

export function generateEducationAmortizationSchedule(
  params: EducationMoratoriumParams & {
    repaymentTenureMonths: number;
    startDate: Date;
    rateChanges?: RateChange[];
    prepayments?: Prepayment[];
    emiStepUpPercent?: number;
  },
): AmortizationRow[] {
  const moratoriumSummary = calculateEducationMoratorium(params);
  const {
    principal,
    annualRate,
    moratoriumPaymentOption,
    moratoriumInterestType,
    partialPaymentAmount = 0,
    repaymentTenureMonths,
    startDate,
    rateChanges = [],
    prepayments = [],
    emiStepUpPercent = 0,
  } = params;

  const schedule: AmortizationRow[] = [];
  const monthlyRate = annualRate / 12 / 100;
  const moratoriumMonths = moratoriumSummary.moratoriumMonths;

  let currentBalance = principal;

  // Phase 1: Moratorium Period
  for (let m = 1; m <= moratoriumMonths; m++) {
    const currentDate = addMonths(startDate, m - 1);
    const openingBalance = currentBalance;

    let interest = 0;
    let payment = 0;

    if (moratoriumInterestType === MoratoriumInterestType.SIMPLE_INTEREST) {
      interest = principal * monthlyRate;
      if (moratoriumPaymentOption === MoratoriumPaymentOption.PAY_SIMPLE_INTEREST) {
        payment = interest;
      } else if (moratoriumPaymentOption === MoratoriumPaymentOption.PARTIAL_INTEREST) {
        payment = partialPaymentAmount;
      }
    } else {
      interest = currentBalance * monthlyRate;
      if (moratoriumPaymentOption === MoratoriumPaymentOption.PAY_SIMPLE_INTEREST) {
        payment = interest;
      } else if (moratoriumPaymentOption === MoratoriumPaymentOption.PARTIAL_INTEREST) {
        payment = partialPaymentAmount;
      }
      currentBalance = currentBalance + interest - payment;
    }

    // On the final moratorium month, show the capitalized balance as closing balance for seamless transition
    const closingBalance =
      m === moratoriumMonths
        ? moratoriumSummary.capitalizedPrincipal
        : moratoriumInterestType === MoratoriumInterestType.SIMPLE_INTEREST
          ? principal
          : currentBalance;

    schedule.push({
      month: m,
      date: currentDate,
      openingBalance,
      emi: payment,
      interest,
      principal: 0,
      prepayment: 0,
      closingBalance,
      interestRate: annualRate,
      isMoratorium: true,
      phase: "MORATORIUM",
      moratoriumInterestAccrued: interest,
      moratoriumPayment: payment,
    });
  }

  // Phase 2: Repayment Period
  const repaymentStartDate = addMonths(startDate, moratoriumMonths);
  const repaymentSchedule = generateAmortizationSchedule(
    moratoriumSummary.capitalizedPrincipal,
    moratoriumSummary.effectiveRepaymentRate,
    repaymentTenureMonths,
    repaymentStartDate,
    rateChanges,
    prepayments,
    emiStepUpPercent,
  );

  // Offset month indices for Phase 2
  repaymentSchedule.forEach((row) => {
    schedule.push({
      ...row,
      month: moratoriumMonths + row.month,
      isMoratorium: false,
      phase: "REPAYMENT",
    });
  });

  return schedule;
}

export function calculateEducationComparison(
  params: Omit<EducationMoratoriumParams, "moratoriumPaymentOption">,
  repaymentTenureMonths: number,
) {
  // Scenario A: No Payment (Full Capitalization)
  const noPaymentSummary = calculateEducationMoratorium({
    ...params,
    moratoriumPaymentOption: MoratoriumPaymentOption.NO_PAYMENT,
  });
  const noPaymentRepaymentEmi = calculateEMI(
    noPaymentSummary.capitalizedPrincipal,
    noPaymentSummary.effectiveRepaymentRate,
    repaymentTenureMonths,
  );
  const noPaymentRepaymentInterest =
    noPaymentRepaymentEmi * repaymentTenureMonths - noPaymentSummary.capitalizedPrincipal;
  const noPaymentTotalInterest =
    noPaymentSummary.totalInterestAccrued + noPaymentRepaymentInterest;
  const noPaymentTotalCost = params.principal + noPaymentTotalInterest;

  // Scenario B: Pay Simple Interest Monthly (With concession discount if enabled)
  const paySiSummary = calculateEducationMoratorium({
    ...params,
    moratoriumPaymentOption: MoratoriumPaymentOption.PAY_SIMPLE_INTEREST,
  });
  const paySiRepaymentEmi = calculateEMI(
    paySiSummary.capitalizedPrincipal,
    paySiSummary.effectiveRepaymentRate,
    repaymentTenureMonths,
  );
  const paySiRepaymentInterest =
    paySiRepaymentEmi * repaymentTenureMonths - paySiSummary.capitalizedPrincipal;
  const paySiTotalInterest =
    paySiSummary.totalInterestPaid + paySiRepaymentInterest;
  const paySiTotalCost = params.principal + paySiTotalInterest;

  const totalInterestSaved = Math.max(0, noPaymentTotalInterest - paySiTotalInterest);
  const monthlyEmiDifference = Math.max(0, noPaymentRepaymentEmi - paySiRepaymentEmi);

  return {
    noPayment: {
      moratoriumInterest: noPaymentSummary.totalInterestAccrued,
      capitalizedPrincipal: noPaymentSummary.capitalizedPrincipal,
      repaymentEmi: noPaymentRepaymentEmi,
      totalInterest: noPaymentTotalInterest,
      totalCost: noPaymentTotalCost,
    },
    paySimpleInterest: {
      monthlySi: paySiSummary.monthlySimpleInterest,
      moratoriumInterest: paySiSummary.totalInterestPaid,
      capitalizedPrincipal: paySiSummary.capitalizedPrincipal,
      effectiveRate: paySiSummary.effectiveRepaymentRate,
      repaymentEmi: paySiRepaymentEmi,
      totalInterest: paySiTotalInterest,
      totalCost: paySiTotalCost,
    },
    savings: {
      totalInterestSaved,
      monthlyEmiDifference,
      capitalizedInterestAvoided: noPaymentSummary.capitalizedInterest,
    },
  };
}

