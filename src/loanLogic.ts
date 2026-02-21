import { addMonths, differenceInCalendarMonths, parseISO } from 'date-fns';
import { 
  AmortizationRow, 
  LoanType, 
  RateChange, 
  Prepayment, 
  AdjustmentMode, 
  PrepaymentReduction,
  PrepaymentType
} from './types';

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
};

export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (annualRate === 0) return principal / tenureMonths;
  const monthlyRate = annualRate / 12 / 100;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / (Math.pow(1 + monthlyRate, tenureMonths) - 1);
}

export function generateAmortizationSchedule(
  principal: number,
  initialRate: number,
  initialTenureMonths: number,
  startDate: Date,
  rateChanges: RateChange[] = [],
  prepayments: Prepayment[] = []
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  let currentBalance = principal;
  let currentRate = initialRate;
  let currentEmi = calculateEMI(principal, initialRate, initialTenureMonths);
  let month = 1;

  // Sort rate changes and prepayments by date
  const sortedRateChanges = [...rateChanges].sort((a, b) => a.effectiveDate.localeCompare(b.effectiveDate));

  while (currentBalance > 0.01 && month <= 600) { // Safety break at 50 years
    const currentDate = addMonths(startDate, month - 1);

    // Check for rate changes
    const rateChange = sortedRateChanges.find(rc => {
      const rcMonth = differenceInCalendarMonths(parseISO(rc.effectiveDate), startDate) + 1;
      return rcMonth === month;
    });
    
    if (rateChange) {
      currentRate = rateChange.newRate;
      if (rateChange.mode === AdjustmentMode.KEEP_TENURE) {
        const remainingMonths = initialTenureMonths - month + 1;
        currentEmi = calculateEMI(currentBalance, currentRate, Math.max(1, remainingMonths));
      } else {
        // Keep EMI same, tenure will naturally adjust as we continue the loop
      }
    }

    const monthlyRate = currentRate / 12 / 100;
    const interest = currentBalance * monthlyRate;
    let principalPaid = Math.min(currentBalance, currentEmi - interest);
    
    // Calculate prepayments for this month
    let totalPrepayment = 0;
    prepayments.forEach(p => {
      const pStartMonth = differenceInCalendarMonths(parseISO(p.startDate), startDate) + 1;
      if (p.type === PrepaymentType.ONE_TIME) {
        if (pStartMonth === month) {
          totalPrepayment += p.amount;
        }
      } else if (p.type === PrepaymentType.RECURRING) {
        if (month >= pStartMonth && (month - pStartMonth) % (p.frequency || 12) === 0) {
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
    const activePrepayment = prepayments.find(p => {
      const pStartMonth = differenceInCalendarMonths(parseISO(p.startDate), startDate) + 1;
      return (p.type === PrepaymentType.ONE_TIME && pStartMonth === month && p.reduction === PrepaymentReduction.EMI) ||
             (p.type === PrepaymentType.RECURRING && month >= pStartMonth && (month - pStartMonth) % (p.frequency || 12) === 0 && p.reduction === PrepaymentReduction.EMI);
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
