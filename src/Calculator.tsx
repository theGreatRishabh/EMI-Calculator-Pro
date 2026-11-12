import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Calculator,
  TrendingUp,
  Calendar,
  ArrowRight,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Info,
  IndianRupee,
  Clock,
  Percent,
  Download,
  Target,
  FileText,
  Table as TableIcon,
  Share2,
  Check,
  Mail,
  MessageSquare,
  ExternalLink,
  ShieldCheck,
  Zap,
  Award,
  Lock,
  User,
  Phone,
  Send,
  X,
  GraduationCap,
  School,
  Sparkles,
  BookOpen,
  Sliders,
  Layers,
  LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  format,
  addMonths,
  parseISO,
  getYear,
  differenceInMonths,
} from "date-fns";
import {
  cn,
  formatCurrency,
  formatCurrencyFull,
  formatCompactCurrency,
} from "./lib/utils";
import { trackClick } from "./lib/analytics";
import {
  LoanType,
  AdjustmentMode,
  PrepaymentType,
  PrepaymentReduction,
  RateChange,
  Prepayment,
  AmortizationRow,
  CurrencyConfig,
  MoratoriumPaymentOption,
  MoratoriumInterestType,
} from "./types";
import {
  LOAN_DEFAULTS,
  calculateEMI,
  generateAmortizationSchedule,
  calculateEducationMoratorium,
  generateEducationAmortizationSchedule,
  calculateEducationComparison,
} from "./loanLogic";

import countryConfigsData from "./countryConfigs.json";

const COLORS = ["#10b981", "#f59e0b"];

const CURRENCY_CONFIGS: Record<string, CurrencyConfig> =
  countryConfigsData as unknown as Record<string, CurrencyConfig>;

const parseNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  let val = e.target.value;
  if (val === "") return 0;
  // Remove leading zeros for display, but keep single 0
  if (/^0[0-9]/.test(val)) {
    val = val.replace(/^0+/, "");
    // Force sync with DOM to prevent "07" flickering in some browsers
    e.target.value = val;
  }
  return Math.max(0, Number(val));
};

interface RateChangeCardProps {
  key?: React.Key;
  rateChange: RateChange;
  onUpdate: (id: string, updates: Partial<RateChange>) => void;
  onRemove: (id: string) => void;
}

function RateChangeCard({
  rateChange,
  onUpdate,
  onRemove,
}: RateChangeCardProps) {
  const [local, setLocal] = useState(rateChange);
  const isDirty = JSON.stringify(local) !== JSON.stringify(rateChange);

  const handleApply = () => {
    if (isDirty) {
      onUpdate(rateChange.id, local);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative group transition-all hover:border-amber-200"
    >
      <button
        aria-label="Remove rate change"
        onClick={() => onRemove(rateChange.id)}
        className="absolute -top-2 -right-2 p-2.5 bg-white text-slate-400 hover:text-red-500 rounded-full shadow-md border border-slate-200 opacity-0 group-hover:opacity-100 transition-all z-10 sm:p-2"
      >
        <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label
            htmlFor={`rate-date-${rateChange.id}`}
            className="text-[10px] uppercase tracking-wider font-bold text-slate-400"
          >
            Effective Date
          </label>
          <input
            id={`rate-date-${rateChange.id}`}
            type="date"
            value={local.effectiveDate}
            onChange={(e) =>
              setLocal({ ...local, effectiveDate: e.target.value })
            }
            onBlur={handleApply}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor={`rate-input-${rateChange.id}`}
            className="text-[10px] uppercase tracking-wider font-bold text-slate-400"
          >
            New Rate (%)
          </label>
          <div className="relative">
            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
            <input
              id={`rate-input-${rateChange.id}`}
              type="number"
              step="0.1"
              value={local.newRate}
              onChange={(e) =>
                setLocal({ ...local, newRate: parseNumberInput(e) })
              }
              onBlur={handleApply}
              className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
          Adjustment Mode
        </label>
        <select
          value={local.mode}
          onChange={(e) =>
            setLocal({ ...local, mode: e.target.value as AdjustmentMode })
          }
          onBlur={handleApply}
          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all appearance-none cursor-pointer"
        >
          <option value={AdjustmentMode.KEEP_EMI}>
            Keep EMI Same (Tenure Changes)
          </option>
          <option value={AdjustmentMode.KEEP_TENURE}>
            Keep Tenure Same (EMI Changes)
          </option>
        </select>
      </div>
      {isDirty && (
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleApply}
          className="w-full py-2 bg-amber-500 text-white text-xs font-bold rounded-lg hover:bg-amber-600 transition-all shadow-md shadow-amber-200"
        >
          Apply Changes
        </motion.button>
      )}
    </motion.div>
  );
}

interface PrepaymentCardProps {
  key?: React.Key;
  prepayment: Prepayment;
  currencySymbol: string;
  onUpdate: (id: string, updates: Partial<Prepayment>) => void;
  onRemove: (id: string) => void;
}

function PrepaymentCard({
  prepayment,
  currencySymbol,
  onUpdate,
  onRemove,
}: PrepaymentCardProps) {
  const [local, setLocal] = useState(prepayment);
  const isDirty = JSON.stringify(local) !== JSON.stringify(prepayment);

  const handleApply = () => {
    if (isDirty) {
      onUpdate(prepayment.id, local);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative group transition-all hover:border-emerald-200"
    >
      <button
        aria-label="Remove prepayment"
        onClick={() => onRemove(prepayment.id)}
        className="absolute -top-2 -right-2 p-2.5 bg-white text-slate-400 hover:text-red-500 rounded-full shadow-md border border-slate-200 opacity-0 group-hover:opacity-100 transition-all z-10 sm:p-2"
      >
        <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label
            htmlFor={`prepay-amount-${prepayment.id}`}
            className="text-[10px] uppercase tracking-wider font-bold text-slate-400"
          >
            Amount
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 flex items-center justify-center font-bold text-slate-300 leading-none text-xs">
              {currencySymbol}
            </div>
            <input
              id={`prepay-amount-${prepayment.id}`}
              type="number"
              value={local.amount}
              onChange={(e) =>
                setLocal({ ...local, amount: parseNumberInput(e) })
              }
              onBlur={handleApply}
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label
            htmlFor={`prepay-date-${prepayment.id}`}
            className="text-[10px] uppercase tracking-wider font-bold text-slate-400"
          >
            Start Date
          </label>
          <input
            id={`prepay-date-${prepayment.id}`}
            type="date"
            value={local.startDate}
            onChange={(e) => setLocal({ ...local, startDate: e.target.value })}
            onBlur={handleApply}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label
            htmlFor={`prepay-type-${prepayment.id}`}
            className="text-[10px] uppercase tracking-wider font-bold text-slate-400"
          >
            Type
          </label>
          <select
            id={`prepay-type-${prepayment.id}`}
            value={local.type}
            onChange={(e) =>
              setLocal({ ...local, type: e.target.value as PrepaymentType })
            }
            onBlur={handleApply}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value={PrepaymentType.ONE_TIME}>One Time</option>
            <option value={PrepaymentType.RECURRING}>Recurring</option>
          </select>
        </div>
        <div className="space-y-1">
          <label
            htmlFor={`prepay-reduction-${prepayment.id}`}
            className="text-[10px] uppercase tracking-wider font-bold text-slate-400"
          >
            Reduce
          </label>
          <select
            id={`prepay-reduction-${prepayment.id}`}
            value={local.reduction}
            onChange={(e) =>
              setLocal({
                ...local,
                reduction: e.target.value as PrepaymentReduction,
              })
            }
            onBlur={handleApply}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value={PrepaymentReduction.TENURE}>Tenure</option>
            <option value={PrepaymentReduction.EMI}>EMI</option>
          </select>
        </div>
      </div>
      {local.type === PrepaymentType.RECURRING && (
        <div className="space-y-1">
          <label
            htmlFor={`prepay-frequency-${prepayment.id}`}
            className="text-[10px] uppercase tracking-wider font-bold text-slate-400"
          >
            Frequency (Months)
          </label>
          <input
            id={`prepay-frequency-${prepayment.id}`}
            type="number"
            value={local.frequency}
            onChange={(e) =>
              setLocal({ ...local, frequency: parseNumberInput(e) })
            }
            onBlur={handleApply}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
      )}
      {isDirty && (
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={handleApply}
          className="w-full py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-all shadow-md shadow-emerald-200"
        >
          Apply Changes
        </motion.button>
      )}
    </motion.div>
  );
}

const LOAN_TYPE_META: Record<
  string,
  { title: string; description: string; slug: string }
> = {
  HOME: {
    slug: "/home-loan",
    title:
      "Home Loan EMI Calculator with Multiple Prepayments - Smart EMI Planner",
    description:
      "Calculate Home Loan EMI with multiple lump-sum and recurring prepayments. Simulate rate hikes, EMI step-ups, and see exact interest savings and tenure reduction.",
  },
  CAR: {
    slug: "/car-loan",
    title: "Car Loan EMI Calculator - Smart EMI Planner",
    description:
      "Calculate your Car Loan EMI with on-road price breakdown including insurance. Plan prepayments and see your payoff date. Free car loan amortization schedule.",
  },
  PERSONAL: {
    slug: "/personal-loan",
    title: "Personal Loan EMI Calculator - Smart EMI Planner",
    description:
      "Calculate Personal Loan EMI with processing fee breakdown. Simulate prepayments and rate changes. Free personal loan amortization schedule.",
  },
  EDUCATION: {
    slug: "/education-loan",
    title:
      "Education Loan EMI Calculator with Moratorium (Simple vs Compound Interest)",
    description:
      "Calculate Education Loan EMI with course and grace moratorium period. Simulate Simple Interest vs Compound Interest capitalization, bank concessions, and Section 80E tax deductions.",
  },
};

const LOAN_TYPE_TITLES: Record<LoanType, string> = {
  [LoanType.HOME]: "Home Loan EMI Calculator",
  [LoanType.CAR]: "Car Loan EMI Calculator",
  [LoanType.PERSONAL]: "Personal Loan EMI Calculator",
  [LoanType.EDUCATION]: "Education Loan EMI Calculator",
};

export default function App({
  initialLoanType = "HOME",
}: {
  initialLoanType?: string;
}) {
  const navigate = useNavigate();
  const resolvedInitialType = (
    Object.values(LoanType).includes(initialLoanType as LoanType)
      ? initialLoanType
      : "HOME"
  ) as LoanType;
  const [loanType, setLoanType] = useState<LoanType>(resolvedInitialType);
  const [amount, setAmount] = useState(
    LOAN_DEFAULTS[resolvedInitialType].amount,
  );
  const [rate, setRate] = useState(LOAN_DEFAULTS[resolvedInitialType].rate);
  const [tenure, setTenure] = useState(
    LOAN_DEFAULTS[resolvedInitialType].tenure,
  );
  const [tenureUnit, setTenureUnit] = useState<"Y" | "M">("Y");
  const [loanStartDate, setLoanStartDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );

  // Education Loan Specific State
  const [courseDurationYears, setCourseDurationYears] = useState(2);
  const [gracePeriodMonths, setGracePeriodMonths] = useState(6);
  const [moratoriumPaymentOption, setMoratoriumPaymentOption] =
    useState<MoratoriumPaymentOption>(MoratoriumPaymentOption.NO_PAYMENT);
  const [moratoriumInterestType, setMoratoriumInterestType] =
    useState<MoratoriumInterestType>(MoratoriumInterestType.SIMPLE_INTEREST);
  const [partialPaymentAmount, setPartialPaymentAmount] = useState(0);
  const [enableConcession, setEnableConcession] = useState(true);
  const [concessionRate, setConcessionRate] = useState(1.0);

  const [rateChanges, setRateChanges] = useState<RateChange[]>([]);
  const [prepayments, setPrepayments] = useState<Prepayment[]>([]);
  const [emiStepUpPercent, setEmiStepUpPercent] = useState(0);

  const [monthlyTax, setMonthlyTax] = useState(0);
  const [monthlyInsurance, setMonthlyInsurance] = useState(0);

  const [downPayment, setDownPayment] = useState(0);
  const [propertyValue, setPropertyValue] = useState(0);
  const [customStampDutyRate, setCustomStampDutyRate] = useState<number | null>(
    null,
  );
  const [customRegistrationRate, setCustomRegistrationRate] = useState<
    number | null
  >(null);

  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>(
    {},
  );

  const sortedCurrencies = useMemo(() => {
    return Object.values(CURRENCY_CONFIGS).sort((a, b) =>
      (a.country || a.name).localeCompare(b.country || b.name),
    );
  }, []);

  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const urlCurr = params.get("curr");
        if (urlCurr && CURRENCY_CONFIGS[urlCurr]) {
          return urlCurr;
        }
      } catch (e) {}

      try {
        const userPreferred = localStorage.getItem("user_selected_currency");
        if (userPreferred && CURRENCY_CONFIGS[userPreferred]) {
          return userPreferred;
        }

        const savedState = localStorage.getItem("emi_calculator_state");
        if (savedState) {
          const parsed = JSON.parse(savedState);
          if (parsed?.currencyCode && CURRENCY_CONFIGS[parsed.currencyCode]) {
            return parsed.currencyCode;
          }
        }
      } catch (e) {}
    }

    // Default to INR
    return "INR";
  });

  const currency = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.INR;

  const handleCurrencyChange = (newCode: string) => {
    trackClick("click_change_currency", "calculator_currency", {
      from_currency: currencyCode,
      to_currency: newCode,
    });
    setCurrencyCode(newCode);
    try {
      localStorage.setItem("user_selected_currency", newCode);
    } catch (e) {}
    const cfg = CURRENCY_CONFIGS[newCode];
    if (cfg?.educationAdvice) {
      setConcessionRate(cfg.educationAdvice.defaultConcessionRate);
    }
  };

  // Update page title + meta description + dynamic JSON-LD for SEO, AEO, and GEO
  useEffect(() => {
    const meta = LOAN_TYPE_META[loanType] || LOAN_TYPE_META.HOME;
    document.title = meta.title;
    const desc = document.querySelector<HTMLMetaElement>(
      "meta[name='description']",
    );
    if (desc) desc.content = meta.description;
    const ogTitle = document.querySelector<HTMLMetaElement>(
      "meta[property='og:title']",
    );
    if (ogTitle) ogTitle.content = meta.title;
    const ogDesc = document.querySelector<HTMLMetaElement>(
      "meta[property='og:description']",
    );
    if (ogDesc) ogDesc.content = meta.description;
    const ogUrl = document.querySelector<HTMLMetaElement>(
      "meta[property='og:url']",
    );
    if (ogUrl) ogUrl.content = `https://smartemiplanner.com${meta.slug}`;
    const canonical = document.querySelector<HTMLLinkElement>(
      "link[rel='canonical']",
    );
    if (canonical) canonical.href = `https://smartemiplanner.com${meta.slug}`;

    // Dynamic Route-Specific JSON-LD Schema for AEO & GEO
    const dynamicSchemaId = "dynamic-route-schema";
    let scriptTag = document.getElementById(
      dynamicSchemaId,
    ) as HTMLScriptElement | null;
    if (!scriptTag) {
      scriptTag = document.createElement("script");
      scriptTag.id = dynamicSchemaId;
      scriptTag.type = "application/ld+json";
      document.head.appendChild(scriptTag);
    }

    const routeUrl = `https://smartemiplanner.com${meta.slug}`;
    const loanName =
      loanType === LoanType.HOME
        ? "Home Loan EMI Calculator"
        : loanType === LoanType.CAR
          ? "Car Loan EMI Calculator"
          : loanType === LoanType.PERSONAL
            ? "Personal Loan EMI Calculator"
            : "Education Loan EMI Calculator";

    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "FinancialCalculator",
          "@id": `${routeUrl}#calculator`,
          name: loanName,
          url: routeUrl,
          description: meta.description,
          category: "FinanceApplication",
          provider: {
            "@type": "Organization",
            name: "Smart EMI Planner",
            url: "https://smartemiplanner.com",
          },
          currencyAccepted: currencyCode,
          featureList: [
            "Equated Monthly Installment (EMI) Calculation",
            "Amortization Schedule Generation",
            "Principal Prepayment Optimization",
            "Floating Interest Rate Hike and Drop Simulation",
            loanType === LoanType.EDUCATION
              ? "Study and Grace Moratorium Period Interest Modeling"
              : "Step-Up Annual Repayment Modeling",
          ],
        },
        {
          "@type": "HowTo",
          "@id": `${routeUrl}#howto`,
          name: `How to Calculate and Optimize your ${loanName}`,
          description: `Step-by-step instructions to calculate monthly installments and accelerate loan closure on Smart EMI Planner.`,
          step: [
            {
              "@type": "HowToStep",
              name: "Enter Loan Amount and Interest Rate",
              text: `Specify your total principal borrowing amount, expected annual interest rate percentage, and loan tenure.`,
            },
            {
              "@type": "HowToStep",
              name: "Model Rate Fluctuations or Moratorium",
              text:
                loanType === LoanType.EDUCATION
                  ? "Configure your course duration and grace moratorium period to see simple interest vs compound capitalization."
                  : "Add prospective floating interest rate hikes or rate reductions to simulate impact on remaining tenure.",
            },
            {
              "@type": "HowToStep",
              name: "Simulate Prepayments to Save Interest",
              text: "Add one-time or recurring principal prepayments or an annual step-up percentage to observe early payoff dates and interest savings.",
            },
          ],
        },
      ],
    };

    scriptTag.textContent = JSON.stringify(schemaData);
  }, [loanType, currencyCode]);

  // URL & LocalStorage State Persistence
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") as LoanType;
    const amt = params.get("amt");
    const r = params.get("rate");
    const ten = params.get("ten");
    const unit = params.get("unit") as "Y" | "M";
    const start = params.get("start");
    const tax = params.get("tax");
    const ins = params.get("ins");
    const dp = params.get("dp");
    const pval = params.get("pval");
    const sdr = params.get("sdr");
    const regr = params.get("regr");
    const rc = params.get("rc");
    const pp = params.get("pp");
    const curr = params.get("curr");
    const emiSU = params.get("emiSU");

    // Load from LocalStorage if URL is empty and it matches the current loan type (to prevent cross-type leakage)
    const savedState = !window.location.search
      ? localStorage.getItem("emi_calculator_state")
      : null;
    let local = savedState ? JSON.parse(savedState) : null;
    if (local && local.loanType !== resolvedInitialType) {
      local = null;
    }

    if (curr && CURRENCY_CONFIGS[curr]) {
      setCurrencyCode(curr);
      try {
        localStorage.setItem("user_selected_currency", curr);
      } catch (e) {}
    } else {
      try {
        const userPreferred = localStorage.getItem("user_selected_currency");
        if (userPreferred && CURRENCY_CONFIGS[userPreferred]) {
          setCurrencyCode(userPreferred);
        } else if (
          local?.currencyCode &&
          CURRENCY_CONFIGS[local.currencyCode]
        ) {
          setCurrencyCode(local.currencyCode);
        }
      } catch (e) {}
    }

    if (type && Object.values(LoanType).includes(type)) {
      setLoanType(type);
    } else if (
      local?.loanType &&
      Object.values(LoanType).includes(local.loanType)
    ) {
      setLoanType(local.loanType);
    }

    if (amt) setAmount(Number(amt));
    else if (local?.amount) setAmount(local.amount);

    if (r) setRate(Number(r));
    else if (local?.rate) setRate(local.rate);

    if (ten) setTenure(Number(ten));
    else if (local?.tenure) setTenure(local.tenure);

    if (unit) setTenureUnit(unit);
    else if (local?.tenureUnit) setTenureUnit(local.tenureUnit);

    if (start) setLoanStartDate(start);
    else if (local?.loanStartDate) setLoanStartDate(local.loanStartDate);

    if (tax) setMonthlyTax(Number(tax));
    else if (local?.monthlyTax) setMonthlyTax(local.monthlyTax);

    if (ins) setMonthlyInsurance(Number(ins));
    else if (local?.monthlyInsurance)
      setMonthlyInsurance(local.monthlyInsurance);

    if (dp) setDownPayment(Number(dp));
    else if (local?.downPayment) setDownPayment(local.downPayment);

    if (pval) setPropertyValue(Number(pval));
    else if (local?.propertyValue) setPropertyValue(local.propertyValue);
    else if (!window.location.search)
      setPropertyValue(Number((amount / 0.8).toFixed(0)));

    if (sdr) setCustomStampDutyRate(Number(sdr));
    else if (local?.customStampDutyRate !== undefined)
      setCustomStampDutyRate(local.customStampDutyRate);

    if (regr) setCustomRegistrationRate(Number(regr));
    else if (local?.customRegistrationRate !== undefined)
      setCustomRegistrationRate(local.customRegistrationRate);

    const validateArray = (val: any) => (Array.isArray(val) ? val : []);

    if (rc) {
      try {
        const parsed = JSON.parse(atob(rc));
        setRateChanges(validateArray(parsed));
      } catch (e) {
        console.error("Failed to parse shared rate changes", e);
      }
    } else if (local?.rateChanges) {
      setRateChanges(local.rateChanges);
    }

    if (pp) {
      try {
        const parsed = JSON.parse(atob(pp));
        setPrepayments(validateArray(parsed));
      } catch (e) {
        console.error("Failed to parse shared prepayments", e);
      }
    } else if (local?.prepayments) {
      setPrepayments(local.prepayments);
    }

    if (emiSU) {
      setEmiStepUpPercent(Number(emiSU));
    } else if (local?.emiStepUpPercent !== undefined) {
      setEmiStepUpPercent(local.emiStepUpPercent);
    }

    // Education Loan parameters from URL or storage
    const cd = params.get("cd");
    const gp = params.get("gp");
    const mpo = params.get("mpo") as MoratoriumPaymentOption;
    const mit = params.get("mit") as MoratoriumInterestType;
    const ppa = params.get("ppa");
    const conc = params.get("conc");
    const concr = params.get("concr");

    if (cd) setCourseDurationYears(Number(cd));
    else if (local?.courseDurationYears !== undefined)
      setCourseDurationYears(local.courseDurationYears);

    if (gp) setGracePeriodMonths(Number(gp));
    else if (local?.gracePeriodMonths !== undefined)
      setGracePeriodMonths(local.gracePeriodMonths);

    if (mpo && Object.values(MoratoriumPaymentOption).includes(mpo)) {
      setMoratoriumPaymentOption(mpo);
    } else if (local?.moratoriumPaymentOption) {
      setMoratoriumPaymentOption(local.moratoriumPaymentOption);
    }

    if (mit && Object.values(MoratoriumInterestType).includes(mit)) {
      setMoratoriumInterestType(mit);
    } else if (local?.moratoriumInterestType) {
      setMoratoriumInterestType(local.moratoriumInterestType);
    }

    if (ppa) setPartialPaymentAmount(Number(ppa));
    else if (local?.partialPaymentAmount !== undefined)
      setPartialPaymentAmount(local.partialPaymentAmount);

    if (conc !== null) setEnableConcession(conc === "1" || conc === "true");
    else if (local?.enableConcession !== undefined)
      setEnableConcession(local.enableConcession);

    if (concr) setConcessionRate(Number(concr));
    else if (local?.concessionRate !== undefined)
      setConcessionRate(local.concessionRate);
  }, [resolvedInitialType]);

  // Save to LocalStorage
  useEffect(() => {
    const state = {
      loanType,
      amount,
      rate,
      tenure,
      tenureUnit,
      loanStartDate,
      monthlyTax,
      monthlyInsurance,
      downPayment,
      propertyValue,
      customStampDutyRate,
      customRegistrationRate,
      rateChanges,
      prepayments,
      currencyCode,
      emiStepUpPercent,
      courseDurationYears,
      gracePeriodMonths,
      moratoriumPaymentOption,
      moratoriumInterestType,
      partialPaymentAmount,
      enableConcession,
      concessionRate,
    };
    try {
      localStorage.setItem("emi_calculator_state", JSON.stringify(state));
      localStorage.setItem("user_selected_currency", currencyCode);
    } catch (e) {}
  }, [
    loanType,
    amount,
    rate,
    tenure,
    tenureUnit,
    loanStartDate,
    monthlyTax,
    monthlyInsurance,
    downPayment,
    propertyValue,
    customStampDutyRate,
    customRegistrationRate,
    rateChanges,
    prepayments,
    currencyCode,
    emiStepUpPercent,
    courseDurationYears,
    gracePeriodMonths,
    moratoriumPaymentOption,
    moratoriumInterestType,
    partialPaymentAmount,
    enableConcession,
    concessionRate,
  ]);

  const [isShared, setIsShared] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    phone: "",
    loanAmount: "",
  });
  const [isLeadSubmitted, setIsLeadSubmitted] = useState(false);

  const isConsultancyEnabled =
    (import.meta as any).env.VITE_ENABLE_CONSULTANCY === "true" ||
    (typeof process !== "undefined" &&
      process.env &&
      process.env.VITE_ENABLE_CONSULTANCY === "true");

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackClick("submit_consultancy_lead", "lead_generation", {
      loan_type: loanType,
      loan_amount: leadForm.loanAmount,
    });
    console.log("Lead captured:", leadForm);
    setIsLeadSubmitted(true);
    setTimeout(() => {
      setShowLeadModal(false);
      setIsLeadSubmitted(false);
    }, 2000);
  };

  const handleShare = () => {
    trackClick("click_share_calculation", "calculator_share", {
      loan_type: loanType,
      currency: currency.code,
      principal: amount,
      rate: rate,
      tenure: tenure,
    });
    const params = new URLSearchParams({
      type: loanType,
      amt: amount.toString(),
      rate: rate.toString(),
      ten: tenure.toString(),
      unit: tenureUnit,
      start: loanStartDate,
      tax: monthlyTax.toString(),
      ins: monthlyInsurance.toString(),
      dp: downPayment.toString(),
      pval: propertyValue.toString(),
      sdr: customStampDutyRate !== null ? customStampDutyRate.toString() : "",
      regr:
        customRegistrationRate !== null
          ? customRegistrationRate.toString()
          : "",
      rc: btoa(JSON.stringify(rateChanges)),
      pp: btoa(JSON.stringify(prepayments)),
      curr: currencyCode,
      emiSU: emiStepUpPercent.toString(),
      ...(loanType === LoanType.EDUCATION
        ? {
            cd: courseDurationYears.toString(),
            gp: gracePeriodMonths.toString(),
            mpo: moratoriumPaymentOption,
            mit: moratoriumInterestType,
            ppa: partialPaymentAmount.toString(),
            conc: enableConcession ? "1" : "0",
            concr: concessionRate.toString(),
          }
        : {}),
    });
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url);
    setIsShared(true);
    setTimeout(() => setIsShared(false), 2000);
  };

  const tenureMonths = tenureUnit === "Y" ? tenure * 12 : tenure;
  const startDate = useMemo(() => {
    try {
      return parseISO(loanStartDate);
    } catch {
      return new Date();
    }
  }, [loanStartDate]);

  const isEducation = loanType === LoanType.EDUCATION;
  const courseDurationMonths = courseDurationYears * 12;

  const originalSchedule = useMemo(() => {
    if (isEducation) {
      return generateEducationAmortizationSchedule({
        principal: amount,
        annualRate: rate,
        courseDurationMonths,
        gracePeriodMonths,
        moratoriumPaymentOption,
        moratoriumInterestType,
        partialPaymentAmount,
        enableConcession,
        concessionRatePercent: concessionRate,
        repaymentTenureMonths: tenureMonths,
        startDate,
        rateChanges: [],
        prepayments: [],
        emiStepUpPercent: 0,
      });
    }
    return generateAmortizationSchedule(amount, rate, tenureMonths, startDate);
  }, [
    isEducation,
    amount,
    rate,
    courseDurationMonths,
    gracePeriodMonths,
    moratoriumPaymentOption,
    moratoriumInterestType,
    partialPaymentAmount,
    enableConcession,
    concessionRate,
    tenureMonths,
    startDate,
  ]);

  const adjustedSchedule = useMemo(() => {
    if (isEducation) {
      return generateEducationAmortizationSchedule({
        principal: amount,
        annualRate: rate,
        courseDurationMonths,
        gracePeriodMonths,
        moratoriumPaymentOption,
        moratoriumInterestType,
        partialPaymentAmount,
        enableConcession,
        concessionRatePercent: concessionRate,
        repaymentTenureMonths: tenureMonths,
        startDate,
        rateChanges,
        prepayments,
        emiStepUpPercent,
      });
    }
    return generateAmortizationSchedule(
      amount,
      rate,
      tenureMonths,
      startDate,
      rateChanges,
      prepayments,
      emiStepUpPercent,
    );
  }, [
    isEducation,
    amount,
    rate,
    courseDurationMonths,
    gracePeriodMonths,
    moratoriumPaymentOption,
    moratoriumInterestType,
    partialPaymentAmount,
    enableConcession,
    concessionRate,
    tenureMonths,
    startDate,
    rateChanges,
    prepayments,
    emiStepUpPercent,
  ]);

  const educationMoratoriumSummary = useMemo(() => {
    if (!isEducation) return null;
    return calculateEducationMoratorium({
      principal: amount,
      annualRate: rate,
      courseDurationMonths,
      gracePeriodMonths,
      moratoriumPaymentOption,
      moratoriumInterestType,
      partialPaymentAmount,
      enableConcession,
      concessionRatePercent: concessionRate,
    });
  }, [
    isEducation,
    amount,
    rate,
    courseDurationMonths,
    gracePeriodMonths,
    moratoriumPaymentOption,
    moratoriumInterestType,
    partialPaymentAmount,
    enableConcession,
    concessionRate,
  ]);

  const educationComparison = useMemo(() => {
    if (!isEducation) return null;
    return calculateEducationComparison(
      {
        principal: amount,
        annualRate: rate,
        courseDurationMonths,
        gracePeriodMonths,
        moratoriumInterestType,
        partialPaymentAmount,
        enableConcession,
        concessionRatePercent: concessionRate,
      },
      tenureMonths,
    );
  }, [
    isEducation,
    amount,
    rate,
    courseDurationMonths,
    gracePeriodMonths,
    moratoriumInterestType,
    partialPaymentAmount,
    enableConcession,
    concessionRate,
    tenureMonths,
  ]);

  const adjustedSummary = useMemo(() => {
    const totalInterest = adjustedSchedule.reduce(
      (sum, row) => sum + row.interest,
      0,
    );
    const today = new Date();
    const monthsPassed = Math.max(0, differenceInMonths(today, startDate));
    const totalMonths = adjustedSchedule.length;
    const remainingMonths = Math.max(0, totalMonths - monthsPassed);

    const repaymentRow =
      adjustedSchedule.find((r) => !r.isMoratorium) || adjustedSchedule[0];
    const emi = repaymentRow?.emi || 0;

    return {
      totalInterest,
      totalPayment: amount + totalInterest,
      months: totalMonths,
      emi,
      monthsPassed,
      remainingMonths,
      piti: emi + monthlyTax + monthlyInsurance,
    };
  }, [adjustedSchedule, amount, startDate, monthlyTax, monthlyInsurance]);

  const originalSummary = useMemo(() => {
    const totalInterest = originalSchedule.reduce(
      (sum, row) => sum + row.interest,
      0,
    );
    const repaymentRow =
      originalSchedule.find((r) => !r.isMoratorium) || originalSchedule[0];
    const emi = repaymentRow?.emi || 0;

    return {
      totalInterest,
      totalPayment: amount + totalInterest,
      months: originalSchedule.length,
      emi,
      piti: emi + monthlyTax + monthlyInsurance,
    };
  }, [originalSchedule, amount, monthlyTax, monthlyInsurance]);

  const savings = {
    interest: originalSummary.totalInterest - adjustedSummary.totalInterest,
    months: originalSummary.months - adjustedSummary.months,
  };

  // Isolate savings contribution from prepayments alone
  const prepaymentOnlySchedule = useMemo(() => {
    if (isEducation) {
      return generateEducationAmortizationSchedule({
        principal: amount,
        annualRate: rate,
        courseDurationMonths,
        gracePeriodMonths,
        moratoriumPaymentOption,
        moratoriumInterestType,
        partialPaymentAmount,
        enableConcession,
        concessionRatePercent: concessionRate,
        repaymentTenureMonths: tenureMonths,
        startDate,
        rateChanges: [],
        prepayments,
        emiStepUpPercent: 0,
      });
    }
    return generateAmortizationSchedule(
      amount,
      rate,
      tenureMonths,
      startDate,
      [],
      prepayments,
      0,
    );
  }, [
    isEducation,
    amount,
    rate,
    courseDurationMonths,
    gracePeriodMonths,
    moratoriumPaymentOption,
    moratoriumInterestType,
    partialPaymentAmount,
    enableConcession,
    concessionRate,
    tenureMonths,
    startDate,
    prepayments,
  ]);
  const prepaymentSavings = useMemo(
    () => ({
      interest:
        originalSummary.totalInterest -
        prepaymentOnlySchedule.reduce((s, r) => s + r.interest, 0),
      months: originalSummary.months - prepaymentOnlySchedule.length,
    }),
    [originalSummary, prepaymentOnlySchedule],
  );

  // Isolate savings contribution from rate changes alone
  const rateChangeOnlySchedule = useMemo(() => {
    if (isEducation) {
      return generateEducationAmortizationSchedule({
        principal: amount,
        annualRate: rate,
        courseDurationMonths,
        gracePeriodMonths,
        moratoriumPaymentOption,
        moratoriumInterestType,
        partialPaymentAmount,
        enableConcession,
        concessionRatePercent: concessionRate,
        repaymentTenureMonths: tenureMonths,
        startDate,
        rateChanges,
        prepayments: [],
        emiStepUpPercent: 0,
      });
    }
    return generateAmortizationSchedule(
      amount,
      rate,
      tenureMonths,
      startDate,
      rateChanges,
      [],
      0,
    );
  }, [
    isEducation,
    amount,
    rate,
    courseDurationMonths,
    gracePeriodMonths,
    moratoriumPaymentOption,
    moratoriumInterestType,
    partialPaymentAmount,
    enableConcession,
    concessionRate,
    tenureMonths,
    startDate,
    rateChanges,
  ]);
  const rateChangeSavings = useMemo(
    () => ({
      interest:
        originalSummary.totalInterest -
        rateChangeOnlySchedule.reduce((s, r) => s + r.interest, 0),
      months: originalSummary.months - rateChangeOnlySchedule.length,
    }),
    [originalSummary, rateChangeOnlySchedule],
  );

  const handleLoanTypeChange = (type: LoanType) => {
    trackClick("click_switch_loan_type", "calculator_loan_type", {
      from_type: loanType,
      to_type: type,
    });
    // Navigate to the SEO URL for that loan type
    const meta = LOAN_TYPE_META[type];
    if (meta) navigate(meta.slug);

    setLoanType(type);
    setAmount(LOAN_DEFAULTS[type].amount);
    setRate(LOAN_DEFAULTS[type].rate);
    setTenure(LOAN_DEFAULTS[type].tenure);
    setTenureUnit("Y");
    setLoanStartDate(format(new Date(), "yyyy-MM-dd"));
    setRateChanges([]);
    setPrepayments([]);
    setEmiStepUpPercent(0);

    if (type === LoanType.EDUCATION) {
      setCourseDurationYears(2);
      setGracePeriodMonths(6);
      setMoratoriumPaymentOption(MoratoriumPaymentOption.NO_PAYMENT);
      setMoratoriumInterestType(MoratoriumInterestType.SIMPLE_INTEREST);
      setPartialPaymentAmount(0);
      setEnableConcession(true);
      setConcessionRate(1.0);
    }
  };

  const exportToPDF = async () => {
    trackClick("click_export_pdf", "calculator_export", {
      format: "pdf",
      loan_type: loanType,
      currency: currency.code,
      principal: amount,
    });
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();

    // Helper to clean currency for PDF (replace ₹ with Rs. since default PDF fonts don't support Unicode ₹)
    const cleanCurrency = (val: string) =>
      currency.symbol === "₹" ? val.replace(/₹/g, "Rs. ") : val;

    doc.setFontSize(20);
    doc.text("EMI Amortization Schedule", 14, 22);
    doc.setFontSize(11);
    doc.text(
      `Loan Amount: ${cleanCurrency(formatCurrencyFull(amount, currency.code, currency.locale))}`,
      14,
      32,
    );
    doc.text(`Interest Rate: ${rate}%`, 14, 38);
    doc.text(
      `Tenure: ${tenure} ${tenureUnit === "Y" ? "Years" : "Months"}`,
      14,
      44,
    );

    const tableData = adjustedSchedule.map((row) => [
      row.isMoratorium ? `${row.month} (M)` : row.month,
      format(row.date, "MMM yyyy"),
      cleanCurrency(
        formatCurrency(
          row.openingBalance,
          currency.code,
          currency.locale,
          currency.useIndianNotation,
        ),
      ),
      cleanCurrency(
        formatCurrency(
          row.emi,
          currency.code,
          currency.locale,
          currency.useIndianNotation,
        ),
      ),
      cleanCurrency(
        formatCurrency(
          row.interest,
          currency.code,
          currency.locale,
          currency.useIndianNotation,
        ),
      ),
      cleanCurrency(
        formatCurrency(
          row.principal,
          currency.code,
          currency.locale,
          currency.useIndianNotation,
        ),
      ),
      row.prepayment > 0
        ? cleanCurrency(
            formatCurrency(
              row.prepayment,
              currency.code,
              currency.locale,
              currency.useIndianNotation,
            ),
          )
        : "-",
      cleanCurrency(
        formatCurrency(
          row.closingBalance,
          currency.code,
          currency.locale,
          currency.useIndianNotation,
        ),
      ),
      `${row.interestRate}%`,
    ]);

    autoTable(doc, {
      head: [
        [
          "No",
          "Date",
          "Opening",
          "EMI",
          "Interest",
          "Principal",
          "Prepay",
          "Closing",
          "Rate",
        ],
      ],
      body: tableData,
      startY: 50,
      theme: "grid",
      styles: { fontSize: 8, font: "helvetica" },
      headStyles: { fillColor: [16, 185, 129] },
    });

    doc.save(`EMI_Schedule_${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const exportToExcel = async () => {
    trackClick("click_export_excel", "calculator_export", {
      format: "excel",
      loan_type: loanType,
      currency: currency.code,
      principal: amount,
    });
    const exceljs = await import("exceljs");
    // Vite dynamic imports sometimes resolve the module object with a default property
    const ExcelJS = exceljs.default || exceljs;
    const { saveAs } = await import("file-saver");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Schedule");

    worksheet.columns = [
      { header: "EMI No", key: "month", width: 10 },
      { header: "Date", key: "date", width: 15 },
      { header: "Opening Balance", key: "opening", width: 20 },
      { header: "EMI", key: "emi", width: 15 },
      { header: "Interest", key: "interest", width: 15 },
      { header: "Principal", key: "principal", width: 15 },
      { header: "Prepayment", key: "prepayment", width: 15 },
      { header: "Closing Balance", key: "closing", width: 20 },
      { header: "Interest Rate", key: "rate", width: 15 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE2E8F0" }, // Tailwind slate-200
    };

    adjustedSchedule.forEach((row) => {
      worksheet.addRow({
        month: row.isMoratorium ? `${row.month} (Moratorium)` : row.month,
        date: format(row.date, "MMM yyyy"),
        opening: row.openingBalance,
        emi: row.emi,
        interest: row.interest,
        principal: row.principal,
        prepayment: row.prepayment,
        closing: row.closingBalance,
        rate: row.interestRate,
      });
    });

    // Format currency columns
    ["C", "D", "E", "F", "G", "H"].forEach((col) => {
      worksheet.getColumn(col).numFmt = `"${currency.symbol}"#,##0.00`;
    });

    worksheet.getColumn("I").numFmt = '0.00"%"';

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `EMI_Schedule_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  const [goalMonths, setGoalMonths] = useState(
    tenure * (tenureUnit === "Y" ? 12 : 1),
  );
  const [goalStartDate, setGoalStartDate] = useState<string>("");
  const [calculatedPrepayment, setCalculatedPrepayment] = useState<
    number | null
  >(null);

  const calculateGoalPrepayment = () => {
    trackClick("click_calculate_goal_prepayment", "calculator_goal", {
      loan_type: loanType,
      target_months: goalMonths,
    });
    let low = 0;
    let high = amount;
    let result = 0;

    // Calculate months elapsed from the loan start date to the goal start date
    // If goalStartDate is earlier than loanStartDate, elapsed is 0 or negative, we treat as 0
    let elapsedMonths = 0;
    if (goalStartDate) {
      const loanStart = parseISO(loanStartDate);
      const goalStart = parseISO(goalStartDate);
      const diff = differenceInMonths(goalStart, loanStart);
      elapsedMonths = Math.max(0, diff);
    }

    // Total goal months from the original start date to hit the user's target time to close
    const totalGoalMonths = elapsedMonths + goalMonths;

    for (let i = 0; i < 20; i++) {
      const mid = (low + high) / 2;
      const testPrepayments: Prepayment[] = [
        ...prepayments,
        {
          id: "goal-test",
          amount: mid,
          startDate: goalStartDate || loanStartDate,
          type: PrepaymentType.RECURRING,
          reduction: PrepaymentReduction.TENURE,
          frequency: 1,
        },
      ];

      const effectiveGoalMonths = isEducation
        ? courseDurationMonths + gracePeriodMonths + totalGoalMonths
        : totalGoalMonths;

      const testSchedule = isEducation
        ? generateEducationAmortizationSchedule({
            principal: amount,
            annualRate: rate,
            courseDurationMonths,
            gracePeriodMonths,
            moratoriumPaymentOption,
            moratoriumInterestType,
            partialPaymentAmount,
            enableConcession,
            concessionRatePercent: concessionRate,
            repaymentTenureMonths: tenureMonths,
            startDate,
            rateChanges,
            prepayments: testPrepayments,
          })
        : generateAmortizationSchedule(
            amount,
            rate,
            tenureMonths,
            startDate,
            rateChanges,
            testPrepayments,
          );

      // We check if the schedule finishes within the total estimated time
      if (testSchedule.length <= effectiveGoalMonths) {
        result = mid;
        high = mid;
      } else {
        low = mid;
      }
    }
    setCalculatedPrepayment(Math.ceil(result));
  };

  const applyGoalPrepayment = () => {
    if (calculatedPrepayment !== null) {
      trackClick("click_apply_goal_prepayment", "calculator_goal", {
        loan_type: loanType,
        applied_prepayment: calculatedPrepayment,
      });
      const newPrepayment: Prepayment = {
        id: Math.random().toString(36).substr(2, 9),
        amount: calculatedPrepayment,
        startDate: goalStartDate || loanStartDate,
        type: PrepaymentType.RECURRING,
        reduction: PrepaymentReduction.TENURE,
        frequency: 1,
      };
      setPrepayments([...prepayments, newPrepayment]);
      setCalculatedPrepayment(null);
    }
  };

  const addRateChange = () => {
    trackClick("click_add_rate_change", "calculator_rate_change", {
      loan_type: loanType,
      current_rate: rate,
    });
    const defaultDate = format(addMonths(startDate, 12), "yyyy-MM-dd");
    const newChange: RateChange = {
      id: Math.random().toString(36).substr(2, 9),
      effectiveDate: defaultDate,
      newRate: rate + 0.5,
      mode: AdjustmentMode.KEEP_TENURE,
    };
    setRateChanges([...rateChanges, newChange]);
  };

  const removeRateChange = (id: string) => {
    trackClick("click_remove_rate_change", "calculator_rate_change", {
      id,
      loan_type: loanType,
    });
    setRateChanges(rateChanges.filter((rc) => rc.id !== id));
  };

  const updateRateChange = (id: string, updates: Partial<RateChange>) => {
    setRateChanges(
      rateChanges.map((rc) => (rc.id === id ? { ...rc, ...updates } : rc)),
    );
  };

  const addPrepayment = () => {
    trackClick("click_add_prepayment", "calculator_prepayment", {
      loan_type: loanType,
      currency: currency.code,
    });
    const defaultDate = format(addMonths(startDate, 12), "yyyy-MM-dd");
    const newPrepayment: Prepayment = {
      id: Math.random().toString(36).substr(2, 9),
      amount: 50000,
      startDate: defaultDate,
      type: PrepaymentType.ONE_TIME,
      reduction: PrepaymentReduction.TENURE,
    };
    setPrepayments([...prepayments, newPrepayment]);
  };

  const removePrepayment = (id: string) => {
    trackClick("click_remove_prepayment", "calculator_prepayment", {
      id,
      loan_type: loanType,
    });
    setPrepayments(prepayments.filter((p) => p.id !== id));
  };

  const updatePrepayment = (id: string, updates: Partial<Prepayment>) => {
    setPrepayments(
      prepayments.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    );
  };

  const pieData = [
    { name: "Principal", value: amount },
    { name: "Interest", value: adjustedSummary.totalInterest },
  ];

  const chartData = useMemo(() => {
    const data: any[] = [];
    const maxMonths = Math.max(
      originalSchedule.length,
      adjustedSchedule.length,
    );

    for (let i = 0; i < maxMonths; i += 12) {
      const yearLabel = getYear(addMonths(startDate, i));
      data.push({
        year: yearLabel.toString(),
        original: originalSchedule[i]?.closingBalance || 0,
        adjusted: adjustedSchedule[i]?.closingBalance || 0,
      });
    }
    return data;
  }, [originalSchedule, adjustedSchedule, startDate]);

  const yearWiseSchedule = useMemo(() => {
    const years: Record<number, AmortizationRow[]> = {};
    adjustedSchedule.forEach((row) => {
      const year = getYear(row.date);
      if (!years[year]) years[year] = [];
      years[year].push(row);
    });
    return years;
  }, [adjustedSchedule]);

  const upfrontConfig = useMemo(() => {
    switch (loanType) {
      case LoanType.CAR:
        return {
          title: "Car Purchase Costs",
          label1: "Road Tax (%)",
          label2: "Insurance/Fees (%)",
          labelDP: "Down Payment",
          summary1: "Road Tax",
          summary2: "Insurance/Fees",
        };
      case LoanType.PERSONAL:
        return {
          title: "Personal Loan Fees",
          label1: "Processing Fee (%)",
          label2: "Documentation (%)",
          labelDP: "Initial Charges",
          summary1: "Processing Fee",
          summary2: "Documentation",
        };
      case LoanType.EDUCATION:
        return {
          title: "Education Loan Upfront Costs & Margin Money",
          label1: "Processing Fee (%)",
          label2: "Administrative & Exam Fees (%)",
          labelDP: "Margin Money / Self-Contribution",
          summary1: "Processing Fee",
          summary2: "Admin Fees",
        };
      case LoanType.HOME:
      default:
        return {
          title: "Stamp Duty & Registration Estimator",
          label1: "Stamp Duty (%)",
          label2: "Registration (%)",
          labelDP: "Down Payment",
          summary1: "Stamp Duty",
          summary2: "Registration",
        };
    }
  }, [loanType]);

  const currentStampDutyRate =
    customStampDutyRate ?? (currency.stampDutyRate || 0);
  const currentRegistrationRate =
    customRegistrationRate ?? (currency.registrationRate || 0);

  const stampDuty =
    loanType === LoanType.CAR
      ? 0
      : loanType === LoanType.PERSONAL || loanType === LoanType.EDUCATION
        ? (customStampDutyRate ?? Math.round(amount * 0.01))
        : (propertyValue * currentStampDutyRate) / 100;

  const registrationFee =
    loanType === LoanType.CAR
      ? (customRegistrationRate ?? Math.round(propertyValue * 0.04))
      : loanType === LoanType.PERSONAL || loanType === LoanType.EDUCATION
        ? (customRegistrationRate ?? 1000)
        : (propertyValue * currentRegistrationRate) / 100;

  const totalUpfront = stampDuty + registrationFee + downPayment;

  // Scenario Studio active tab: 'prepayments' | 'stepup' | 'rates' | 'upfront'
  const [activeStudioTab, setActiveStudioTab] = useState<
    "prepayments" | "stepup" | "rates" | "upfront"
  >("prepayments");

  // Layout mode: 'tabbed' (compact, lower cognitive load) vs 'stacked' (see everything at once)
  const [studioViewMode, setStudioViewMode] = useState<"tabbed" | "stacked">(
    () => {
      try {
        const saved = localStorage.getItem("smart_emi_studio_view_mode");
        return saved === "stacked" ? "stacked" : "tabbed";
      } catch {
        return "tabbed";
      }
    },
  );

  const toggleStudioViewMode = (mode: "tabbed" | "stacked") => {
    setStudioViewMode(mode);
    try {
      localStorage.setItem("smart_emi_studio_view_mode", mode);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start justify-between w-full md:w-auto">
            <div className="flex items-center gap-4">
              <picture>
                <source srcSet="/favicon.webp" type="image/webp" />
                <img
                  src="/favicon-64.png"
                  alt="Smart EMI Planner Logo"
                  width="48"
                  height="48"
                  className="w-12 h-12 rounded-xl shadow-sm border border-slate-200"
                />
              </picture>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  <span>Smart EMI Planner</span>
                  <span className="block text-emerald-600 font-bold text-lg sm:text-xl mt-0.5">
                    {LOAN_TYPE_TITLES[loanType]}
                  </span>
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  Advanced loan simulation with rate changes and prepayments
                </p>
              </div>
            </div>
            <button
              aria-label="Share Calculation"
              onClick={handleShare}
              className="md:hidden p-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-600 hover:text-emerald-600 transition-colors"
              title="Share Calculation"
            >
              {isShared ? (
                <Check className="w-5 h-5 text-emerald-600" />
              ) : (
                <Share2 className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleShare}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-200 transition-all shadow-sm"
            >
              {isShared ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </header>

        <div className="space-y-8">
          {/* Row 1: Parameters & Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Loan Parameters & Goal Optimizer */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-8 self-start">
              <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                    <Calculator className="w-6 h-6 text-emerald-600" />
                    Loan Parameters
                  </h2>

                  {/* Currency Selector */}
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-sm transition-all hover:bg-white hover:border-emerald-200 self-start sm:self-auto">
                    <label
                      htmlFor="currency-selector"
                      className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter ml-1 cursor-pointer"
                    >
                      Currency
                    </label>
                    <select
                      id="currency-selector"
                      aria-label="Currency"
                      value={currencyCode}
                      onChange={(e) => handleCurrencyChange(e.target.value)}
                      className="bg-transparent border-none text-xs font-bold text-emerald-700 outline-none cursor-pointer pr-1"
                    >
                      {sortedCurrencies.map((cc) => (
                        <option key={cc.code} value={cc.code}>
                          {cc.country
                            ? `${cc.country} (${cc.code} ${cc.symbol})`
                            : `${cc.name} (${cc.code} ${cc.symbol})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    <div className="space-y-3 w-full">
                      <div className="flex justify-between">
                        <label
                          htmlFor="loan-amount"
                          className="text-sm font-bold text-slate-600"
                        >
                          Loan Amount
                        </label>
                        <span className="text-sm font-extrabold text-emerald-600">
                          {formatCurrencyFull(
                            amount,
                            currency.code,
                            currency.locale,
                          )}
                        </span>
                      </div>
                      <input
                        id="loan-amount-slider"
                        aria-label="Loan Amount Slider"
                        type="range"
                        min="100000"
                        max={LOAN_DEFAULTS[loanType].maxAmount}
                        step="50000"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center font-bold text-slate-400 leading-none">
                          {currency.symbol}
                        </div>
                        <input
                          type="number"
                          id="loan-amount"
                          aria-label="Loan Amount"
                          value={amount}
                          onChange={(e) => setAmount(parseNumberInput(e))}
                          className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 w-full">
                      <div className="flex justify-between">
                        <label
                          htmlFor="interest-rate"
                          className="text-sm font-bold text-slate-600"
                        >
                          Interest Rate (% p.a.)
                        </label>
                        <span className="text-sm font-extrabold text-emerald-600">
                          {rate}%
                        </span>
                      </div>
                      <input
                        id="interest-rate-slider"
                        aria-label="Interest Rate Slider"
                        type="range"
                        min="1"
                        max="20"
                        step="0.1"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <div className="relative">
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center font-bold text-slate-400">
                          %
                        </div>
                        <input
                          id="interest-rate"
                          type="number"
                          step="0.1"
                          value={rate}
                          onChange={(e) => setRate(parseNumberInput(e))}
                          className="w-full pl-4 pr-9 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 w-full">
                      <div className="flex justify-between items-center">
                        <label
                          htmlFor="loan-tenure"
                          className="text-sm font-bold text-slate-600"
                        >
                          Tenure
                        </label>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                          <button
                            onClick={() => {
                              if (tenureUnit === "M") {
                                setTenureUnit("Y");
                                setTenure(Math.max(1, Math.round(tenure / 12)));
                              }
                            }}
                            className={cn(
                              "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                              tenureUnit === "Y"
                                ? "bg-white shadow-sm text-emerald-600"
                                : "text-slate-500",
                            )}
                          >
                            Yrs
                          </button>
                          <button
                            onClick={() => {
                              if (tenureUnit === "Y") {
                                setTenureUnit("M");
                                setTenure(tenure * 12);
                              }
                            }}
                            className={cn(
                              "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
                              tenureUnit === "M"
                                ? "bg-white shadow-sm text-emerald-600"
                                : "text-slate-500",
                            )}
                          >
                            Mo
                          </button>
                        </div>
                      </div>
                      <input
                        id="loan-tenure-slider"
                        aria-label="Loan Tenure Slider"
                        type="range"
                        min="1"
                        max={
                          tenureUnit === "Y"
                            ? LOAN_DEFAULTS[loanType].maxTenure
                            : LOAN_DEFAULTS[loanType].maxTenure * 12
                        }
                        step="1"
                        value={tenure}
                        onChange={(e) => setTenure(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <div className="relative">
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 font-bold text-slate-400 text-[10px] uppercase">
                          {tenureUnit === "Y" ? "Yrs" : "Mos"}
                        </div>
                        <input
                          id="loan-tenure"
                          type="number"
                          value={tenure}
                          onChange={(e) => setTenure(parseNumberInput(e))}
                          className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label
                        htmlFor="loan-start-date"
                        className="text-sm font-bold text-slate-600 flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Loan Start Date
                      </label>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3 group hover:border-emerald-200 transition-all">
                        <input
                          type="date"
                          id="loan-start-date"
                          aria-label="Loan Start Date"
                          value={loanStartDate}
                          onChange={(e) => setLoanStartDate(e.target.value)}
                          className="bg-transparent border-none text-sm font-medium focus:ring-0 outline-none w-full cursor-pointer"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 italic">
                        Calculations adjust based on this date
                      </p>
                    </div>

                    {loanType === LoanType.HOME && (
                      <>
                        <div className="space-y-3 w-full">
                          <div className="flex justify-between">
                            <label
                              htmlFor="monthly-tax"
                              className="text-sm font-bold text-slate-600"
                            >
                              Monthly Property Tax
                            </label>
                            <span className="text-sm font-extrabold text-indigo-600">
                              {formatCurrencyFull(
                                monthlyTax,
                                currency.code,
                                currency.locale,
                              )}
                            </span>
                          </div>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center font-bold text-slate-400 leading-none">
                              {currency.symbol}
                            </div>
                            <input
                              type="text"
                              inputMode="decimal"
                              id="monthly-tax"
                              value={monthlyTax || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                  setMonthlyTax(parseNumberInput(e));
                                }
                              }}
                              className="w-full pl-6 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                              placeholder="0"
                            />
                          </div>
                        </div>

                        <div className="space-y-3 w-full">
                          <div className="flex justify-between">
                            <label
                              htmlFor="monthly-insurance"
                              className="text-sm font-bold text-slate-600"
                            >
                              Monthly Insurance
                            </label>
                            <span className="text-sm font-extrabold text-indigo-600">
                              {formatCurrencyFull(
                                monthlyInsurance,
                                currency.code,
                                currency.locale,
                              )}
                            </span>
                          </div>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center font-bold text-slate-400 leading-none">
                              {currency.symbol}
                            </div>
                            <input
                              type="text"
                              inputMode="decimal"
                              id="monthly-insurance"
                              value={monthlyInsurance || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                  setMonthlyInsurance(parseNumberInput(e));
                                }
                              }}
                              className="w-full pl-6 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {loanType === LoanType.EDUCATION && (
                      <>
                        <div className="space-y-3 w-full">
                          <div className="flex justify-between">
                            <label
                              htmlFor="course-duration"
                              className="text-sm font-bold text-slate-600 flex items-center gap-1.5"
                            >
                              <GraduationCap className="w-4 h-4 text-emerald-600" />
                              Course Duration
                            </label>
                            <span className="text-sm font-extrabold text-emerald-600">
                              {courseDurationYears} Years (
                              {courseDurationYears * 12} Mo)
                            </span>
                          </div>
                          <input
                            id="course-duration-slider"
                            type="range"
                            aria-label="Course Duration Slider"
                            min="1"
                            max="5"
                            step="1"
                            value={courseDurationYears}
                            onChange={(e) =>
                              setCourseDurationYears(Number(e.target.value))
                            }
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
                            <span>1 Yr</span>
                            <span>2 Yrs</span>
                            <span>3 Yrs</span>
                            <span>4 Yrs</span>
                            <span>5 Yrs</span>
                          </div>
                        </div>

                        <div className="space-y-3 w-full">
                          <div className="flex justify-between">
                            <label
                              htmlFor="grace-period"
                              className="text-sm font-bold text-slate-600 flex items-center gap-1.5"
                            >
                              <Clock className="w-4 h-4 text-emerald-600" />
                              Grace Period (After Course)
                            </label>
                            <span className="text-sm font-extrabold text-emerald-600">
                              {gracePeriodMonths} Months
                            </span>
                          </div>
                          <input
                            id="grace-period-slider"
                            type="range"
                            aria-label="Grace Period Slider"
                            min="0"
                            max="24"
                            step="6"
                            value={gracePeriodMonths}
                            onChange={(e) =>
                              setGracePeriodMonths(Number(e.target.value))
                            }
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
                            <span>0 Mo</span>
                            <span>6 Mo</span>
                            <span>12 Mo</span>
                            <span>18 Mo</span>
                            <span>24 Mo</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* Education Loan Moratorium Configuration */}
              {isEducation && (
                <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-indigo-100 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold shrink-0">
                        <School className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">
                          Moratorium Period Settings
                        </h2>
                        <p className="text-xs text-slate-500">
                          Total Moratorium:{" "}
                          {courseDurationYears * 12 + gracePeriodMonths} Months
                          (
                          {(
                            (courseDurationYears * 12 + gracePeriodMonths) /
                            12
                          ).toFixed(1)}{" "}
                          Years)
                        </p>
                      </div>
                    </div>

                    {/* Interest Accrual Toggle (SI vs CI) */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
                      <button
                        onClick={() => {
                          setMoratoriumInterestType(
                            MoratoriumInterestType.SIMPLE_INTEREST,
                          );
                          setMoratoriumPaymentOption(
                            MoratoriumPaymentOption.NO_PAYMENT,
                          );
                          setPartialPaymentAmount(0);
                        }}
                        className={cn(
                          "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                          moratoriumInterestType ===
                            MoratoriumInterestType.SIMPLE_INTEREST
                            ? "bg-white shadow-sm text-indigo-600"
                            : "text-slate-500 hover:text-slate-700",
                        )}
                        title="RBI / Indian Banks Standard: Simple interest charged during study, capitalized at repayment onset"
                      >
                        Simple Interest (SI)
                      </button>
                      <button
                        onClick={() => {
                          setMoratoriumInterestType(
                            MoratoriumInterestType.COMPOUND_INTEREST,
                          );
                          setMoratoriumPaymentOption(
                            MoratoriumPaymentOption.NO_PAYMENT,
                          );
                          setPartialPaymentAmount(0);
                        }}
                        className={cn(
                          "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                          moratoriumInterestType ===
                            MoratoriumInterestType.COMPOUND_INTEREST
                            ? "bg-white shadow-sm text-indigo-600"
                            : "text-slate-500 hover:text-slate-700",
                        )}
                        title="Private NBFCs / International lenders: Interest compounded monthly during study"
                      >
                        Compound Interest (CI)
                      </button>
                    </div>
                  </div>

                  {/* Country Banking Suggestion & Rule Banner */}
                  <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100/90 flex items-start gap-3.5">
                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl shrink-0 mt-0.5">
                      <Info className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-indigo-950">
                          Banking Suggestion & Guidelines ({currency.name})
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-200/80 text-indigo-800">
                          {currency.code}
                        </span>
                      </div>
                      <p className="text-indigo-800 leading-relaxed">
                        {currency.educationAdvice?.bankingTip ||
                          currency.educationAdvice?.concessionDescription}
                      </p>
                    </div>
                  </div>

                  {/* 3 Repayment Options During Moratorium */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Payment Option During Moratorium
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Option 1: No Payment */}
                      <button
                        type="button"
                        onClick={() =>
                          setMoratoriumPaymentOption(
                            MoratoriumPaymentOption.NO_PAYMENT,
                          )
                        }
                        className={cn(
                          "text-left p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 relative",
                          moratoriumPaymentOption ===
                            MoratoriumPaymentOption.NO_PAYMENT
                            ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                            : "border-slate-200 bg-slate-50/50 hover:border-slate-300",
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-800">
                              No Payment
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                              Full Moratorium
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Pay {currency.symbol}0 during study. Accrued
                            interest is capitalized into your principal when EMI
                            begins.
                          </p>
                        </div>
                        <div className="pt-2 border-t border-slate-200/60 text-xs">
                          <span className="text-slate-400 text-[10px] uppercase font-bold">
                            Capitalized at end:
                          </span>
                          <p className="font-bold text-amber-600 text-sm">
                            +
                            {formatCurrencyFull(
                              educationMoratoriumSummary?.capitalizedInterest ||
                                0,
                              currency.code,
                              currency.locale,
                            )}
                          </p>
                        </div>
                      </button>

                      {/* Option 2: Pay Simple Interest */}
                      <button
                        type="button"
                        onClick={() =>
                          setMoratoriumPaymentOption(
                            MoratoriumPaymentOption.PAY_SIMPLE_INTEREST,
                          )
                        }
                        className={cn(
                          "text-left p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 relative",
                          moratoriumPaymentOption ===
                            MoratoriumPaymentOption.PAY_SIMPLE_INTEREST
                            ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                            : "border-slate-200 bg-slate-50/50 hover:border-slate-300",
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-800">
                              Pay Simple Interest (SI)
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                              Best Savings
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Pay interest monthly while studying. Zero interest
                            added to your principal!
                          </p>
                        </div>
                        <div className="pt-2 border-t border-slate-200/60 text-xs">
                          <span className="text-slate-400 text-[10px] uppercase font-bold">
                            Monthly SI Payment:
                          </span>
                          <p className="font-bold text-emerald-600 text-sm">
                            {formatCurrencyFull(
                              educationMoratoriumSummary?.monthlySimpleInterest ||
                                0,
                              currency.code,
                              currency.locale,
                            )}
                            /mo
                          </p>
                        </div>
                      </button>

                      {/* Option 3: Partial Interest */}
                      <button
                        type="button"
                        onClick={() =>
                          setMoratoriumPaymentOption(
                            MoratoriumPaymentOption.PARTIAL_INTEREST,
                          )
                        }
                        className={cn(
                          "text-left p-4 rounded-2xl border-2 transition-all flex flex-col justify-between gap-3 relative",
                          moratoriumPaymentOption ===
                            MoratoriumPaymentOption.PARTIAL_INTEREST
                            ? "border-indigo-600 bg-indigo-50/50 shadow-sm"
                            : "border-slate-200 bg-slate-50/50 hover:border-slate-300",
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-800">
                              Partial Payment
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                              Custom Budget
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Pay whatever you can monthly. The remainder is
                            capitalized into the loan.
                          </p>
                        </div>
                        <div className="pt-2 border-t border-slate-200/60 text-xs">
                          <span className="text-slate-400 text-[10px] uppercase font-bold">
                            Remaining Capitalized:
                          </span>
                          <p className="font-bold text-indigo-600 text-sm">
                            +
                            {formatCurrencyFull(
                              educationMoratoriumSummary?.capitalizedInterest ||
                                0,
                              currency.code,
                              currency.locale,
                            )}
                          </p>
                        </div>
                      </button>
                    </div>

                    {/* Partial Payment Amount Input */}
                    {moratoriumPaymentOption ===
                      MoratoriumPaymentOption.PARTIAL_INTEREST && (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <label className="text-xs font-bold text-slate-600">
                          Monthly Payment During Moratorium
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                            {currency.symbol}
                          </span>
                          <input
                            type="number"
                            value={partialPaymentAmount}
                            onChange={(e) =>
                              setPartialPaymentAmount(parseNumberInput(e))
                            }
                            placeholder="e.g. 5000"
                            className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Country-Specific Concession Toggle (for Option 2) */}
                    {moratoriumPaymentOption ===
                      MoratoriumPaymentOption.PAY_SIMPLE_INTEREST && (
                      <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-900">
                              {(
                                currency.educationAdvice?.concessionTitle ||
                                "Bank Concession: {concessionRate}% Interest Rate Discount"
                              ).replace(
                                "{concessionRate}",
                                concessionRate.toFixed(2),
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-emerald-700">
                            {currency.educationAdvice?.concessionDescription ||
                              "Most Indian banks (like SBI, BoB, PNB) give a 1.00% p.a. interest discount if simple interest is serviced during the study period."}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 self-start sm:self-auto">
                          {enableConcession && (
                            <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shadow-xs">
                              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-tighter">
                                Rate:
                              </span>
                              <input
                                aria-label="Concession Discount Rate"
                                type="number"
                                step="0.25"
                                min="0.1"
                                max="5"
                                value={concessionRate}
                                onChange={(e) =>
                                  setConcessionRate(parseNumberInput(e))
                                }
                                className="w-12 text-center text-xs font-bold text-emerald-700 bg-transparent outline-none"
                              />
                              <span className="text-[10px] font-bold text-emerald-600">
                                %
                              </span>
                            </div>
                          )}
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={enableConcession}
                              onChange={(e) =>
                                setEnableConcession(e.target.checked)
                              }
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Two-Phase Moratorium & Repayment Timeline */}
              {isEducation && (
                <section className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-3xl text-white space-y-5 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Two-Phase Loan Lifecycle Breakdown
                    </h3>
                    <span className="text-xs text-indigo-200 font-medium px-2.5 py-1 bg-white/10 rounded-full self-start sm:self-auto">
                      Total:{" "}
                      {courseDurationYears * 12 +
                        gracePeriodMonths +
                        tenureMonths}{" "}
                      Months
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Phase 1 Card */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                          Phase 1: Moratorium Period
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
                          {courseDurationYears * 12 + gracePeriodMonths} Months
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-300">
                        <div className="flex justify-between">
                          <span>Monthly Payment:</span>
                          <span className="font-bold text-white">
                            {moratoriumPaymentOption ===
                            MoratoriumPaymentOption.PAY_SIMPLE_INTEREST
                              ? formatCurrencyFull(
                                  educationMoratoriumSummary?.monthlySimpleInterest ||
                                    0,
                                  currency.code,
                                  currency.locale,
                                )
                              : moratoriumPaymentOption ===
                                  MoratoriumPaymentOption.PARTIAL_INTEREST
                                ? formatCurrencyFull(
                                    partialPaymentAmount,
                                    currency.code,
                                    currency.locale,
                                  )
                                : `${currency.symbol}0 (No EMI)`}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>
                            Total Accrued (
                            {moratoriumInterestType ===
                            MoratoriumInterestType.SIMPLE_INTEREST
                              ? "SI"
                              : "CI"}
                            ):
                          </span>
                          <span className="font-bold text-amber-300">
                            {formatCurrencyFull(
                              educationMoratoriumSummary?.totalInterestAccrued ||
                                0,
                              currency.code,
                              currency.locale,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-white/10 font-bold">
                          <span>Capitalized to Loan:</span>
                          <span
                            className={
                              educationMoratoriumSummary?.capitalizedInterest
                                ? "text-amber-400"
                                : "text-emerald-400"
                            }
                          >
                            {educationMoratoriumSummary?.capitalizedInterest
                              ? `+${formatCurrencyFull(
                                  educationMoratoriumSummary.capitalizedInterest,
                                  currency.code,
                                  currency.locale,
                                )}`
                              : `${currency.symbol}0 (Fully Avoided)`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Phase 2 Card */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                          Phase 2: Repayment Period
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300">
                          {tenureMonths} Months ({tenure} Yrs)
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-300">
                        <div className="flex justify-between">
                          <span>Starting Repayment Principal:</span>
                          <span className="font-bold text-white">
                            {formatCurrencyFull(
                              educationMoratoriumSummary?.capitalizedPrincipal ||
                                amount,
                              currency.code,
                              currency.locale,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Effective Repayment Rate:</span>
                          <span className="font-bold text-emerald-300">
                            {educationMoratoriumSummary?.effectiveRepaymentRate}
                            % p.a.
                          </span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-white/10 font-bold">
                          <span>Monthly Repayment EMI:</span>
                          <span className="text-emerald-400 text-sm">
                            {formatCurrencyFull(
                              adjustedSummary.emi,
                              currency.code,
                              currency.locale,
                            )}
                            /mo
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Smart Impact Comparison Card */}
              {isEducation && educationComparison && (
                <section className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 rounded-3xl text-white space-y-4 shadow-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-300" />
                      <h3 className="text-base font-bold text-white">
                        Why Servicing Interest During College Saves You{" "}
                        {currency.useIndianNotation ? "Lakhs" : "Thousands"}
                      </h3>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-extrabold px-2.5 py-1 bg-white/20 rounded-full self-start sm:self-auto">
                      Impact Analysis
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-white/10 rounded-xl">
                      <p className="text-[10px] uppercase font-bold text-emerald-100">
                        Total Interest Saved
                      </p>
                      <p className="text-2xl font-extrabold text-white">
                        {formatCurrencyFull(
                          educationComparison.savings.totalInterestSaved,
                          currency.code,
                          currency.locale,
                        )}
                      </p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl">
                      <p className="text-[10px] uppercase font-bold text-emerald-100">
                        Monthly EMI Reduction
                      </p>
                      <p className="text-2xl font-extrabold text-white">
                        {formatCurrencyFull(
                          educationComparison.savings.monthlyEmiDifference,
                          currency.code,
                          currency.locale,
                        )}
                        /mo
                      </p>
                    </div>
                    <div className="p-3 bg-white/10 rounded-xl">
                      <p className="text-[10px] uppercase font-bold text-emerald-100">
                        Principal Ballooning Avoided
                      </p>
                      <p className="text-2xl font-extrabold text-white">
                        {formatCurrencyFull(
                          educationComparison.savings
                            .capitalizedInterestAvoided,
                          currency.code,
                          currency.locale,
                        )}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-100 leading-relaxed">
                    Paying Simple Interest (~
                    {formatCurrencyFull(
                      educationComparison.paySimpleInterest.monthlySi,
                      currency.code,
                      currency.locale,
                    )}
                    /month) during college keeps your principal at{" "}
                    {formatCurrencyFull(amount, currency.code, currency.locale)}{" "}
                    instead of letting it balloon to{" "}
                    {formatCurrencyFull(
                      educationComparison.noPayment.capitalizedPrincipal,
                      currency.code,
                      currency.locale,
                    )}
                    , saving compounding interest for the next {tenure} years!
                  </p>
                </section>
              )}

              {/* Goal Optimizer Tool */}
              <section
                aria-labelledby="goal-optimizer-title"
                className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    <h2
                      id="goal-optimizer-title"
                      className="text-lg font-semibold text-emerald-900"
                    >
                      Goal Optimizer
                    </h2>
                  </div>
                </div>
                <p className="text-sm text-emerald-700">
                  Calculate required monthly prepayment to close your loan
                  faster. If a Start Date is selected, the required time to
                  close will be measured from that date.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="goal-target-months"
                      className="text-sm font-medium text-emerald-800"
                    >
                      Target Time to Close (Months)
                    </label>
                    <input
                      id="goal-target-months"
                      type="number"
                      aria-label="Target Time to Close in Months"
                      value={goalMonths}
                      onChange={(e) => setGoalMonths(parseNumberInput(e))}
                      className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="goal-start-date"
                      className="text-sm font-medium text-emerald-800"
                    >
                      Start Date (Optional)
                    </label>
                    <input
                      id="goal-start-date"
                      type="date"
                      aria-label="Goal Start Date"
                      value={goalStartDate}
                      onChange={(e) => setGoalStartDate(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                    />
                  </div>
                  <div className="sm:col-span-2 flex items-end">
                    <button
                      onClick={calculateGoalPrepayment}
                      className="w-full py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      Calculate Required Prepayment
                    </button>
                  </div>
                </div>

                {calculatedPrepayment !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                        Required Monthly Prepayment
                      </p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {formatCurrencyFull(
                          calculatedPrepayment,
                          currency.code,
                          currency.locale,
                        )}
                      </p>
                    </div>
                    <button
                      onClick={applyGoalPrepayment}
                      className="px-6 py-2 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-sm hover:bg-emerald-200 transition-colors"
                    >
                      Apply to Planner
                    </button>
                  </motion.div>
                )}
              </section>

              {/* Tax Benefit Section */}
              {loanType === LoanType.HOME && (
                <section
                  aria-labelledby="tax-benefit-title"
                  className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <h2
                      id="tax-benefit-title"
                      className="text-lg font-semibold text-indigo-900"
                    >
                      Tax Benefit Estimator ({currency.name})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currency.taxTips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white rounded-xl border border-indigo-100"
                      >
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                          {tip.title}
                        </p>
                        <p className="text-xl font-bold text-indigo-600">
                          {tip.amount > 0
                            ? formatCurrencyFull(
                                Math.min(
                                  tip.amount,
                                  tip.title.toLowerCase().includes("interest")
                                    ? adjustedSummary.totalInterest /
                                        (adjustedSummary.months / 12)
                                    : amount / (adjustedSummary.months / 12),
                                ),
                                currency.code,
                                currency.locale,
                              )
                            : "Consult Advisor"}
                          {tip.amount > 0 && (
                            <span className="text-[10px] text-slate-400 font-normal ml-1">
                              / year avg
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {tip.limitLabel}
                        </p>
                        <p className="text-[10px] text-indigo-500 mt-1 italic">
                          {tip.description}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-indigo-600/5 p-3 rounded-lg border border-indigo-200/50">
                    <p className="text-xs text-indigo-700 leading-relaxed">
                      <Info className="w-3 h-3 inline mr-1 mb-0.5" />
                      Estimates based on annual averages. Actual benefits depend
                      on local tax laws and individual circumstances.
                    </p>
                  </div>
                </section>
              )}

              {/* Education Loan Tax Benefit Section */}
              {loanType === LoanType.EDUCATION && (
                <section
                  aria-labelledby="education-tax-benefit-title"
                  className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <h2
                      id="education-tax-benefit-title"
                      className="text-lg font-semibold text-indigo-900"
                    >
                      Education Loan Tax & Financial Relief ({currency.name})
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currency.educationAdvice?.taxTips?.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-white rounded-xl border border-indigo-100 space-y-1"
                      >
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                          {tip.title}
                        </p>
                        <p className="text-xl font-bold text-indigo-600">
                          {tip.limitLabel}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {tip.description}
                        </p>
                        {tip.details && (
                          <p className="text-[10px] text-indigo-500 mt-1 italic">
                            {tip.details}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="bg-indigo-600/5 p-3 rounded-lg border border-indigo-200/50">
                    <p className="text-xs text-indigo-700 leading-relaxed">
                      <Info className="w-3 h-3 inline mr-1 mb-0.5" />
                      {currency.code === "INR"
                        ? "Unlike home loans where Section 80C caps principal, Section 80E provides unlimited deductions on actual interest paid for up to 8 consecutive assessment years!"
                        : `Tax deductions, credits, and repayment subsidies depend on personal filing status and degree qualifications in ${currency.name}. Consult a certified financial advisor.`}
                    </p>
                  </div>
                </section>
              )}
            </div>

            {/* Summary & Pie Chart */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Quick Summary
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Monthly EMI
                    </span>
                    <p className="text-xl font-bold text-slate-900 truncate">
                      {formatCurrencyFull(
                        adjustedSummary.emi,
                        currency.code,
                        currency.locale,
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Total Interest
                    </span>
                    <p className="text-xl font-bold text-slate-900 truncate">
                      {formatCurrencyFull(
                        adjustedSummary.totalInterest,
                        currency.code,
                        currency.locale,
                      )}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Already Paid
                    </span>
                    <p className="text-sm font-bold text-slate-700">
                      {adjustedSummary.monthsPassed} Mo
                      <span className="text-[10px] font-normal text-slate-400 ml-1">
                        ({(adjustedSummary.monthsPassed / 12).toFixed(1)} Yrs)
                      </span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Remaining
                    </span>
                    <p className="text-sm font-bold text-emerald-600">
                      {adjustedSummary.remainingMonths} Mo
                      <span className="text-[10px] font-normal text-slate-400 ml-1">
                        ({(adjustedSummary.remainingMonths / 12).toFixed(1)}{" "}
                        Yrs)
                      </span>
                    </p>
                  </div>

                  {/* Combined savings row — only shown when any strategy is active */}
                  {(savings.months > 0 || savings.interest > 0) && (
                    <div className="col-span-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between gap-3">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">
                          Combined Savings
                        </span>
                        <p className="text-sm font-bold text-emerald-700">
                          {formatCurrencyFull(
                            savings.interest,
                            currency.code,
                            currency.locale,
                          )}
                        </p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">
                          Time Saved
                        </span>
                        <p className="text-sm font-bold text-emerald-700">
                          {Math.floor(savings.months / 12)}y{" "}
                          {savings.months % 12}m
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="col-span-2 pt-4 border-t border-slate-100 mt-2 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      Total Payment (Principal + Interest)
                    </span>
                    <p className="text-2xl font-bold text-emerald-600 break-all">
                      {formatCurrencyFull(
                        adjustedSummary.totalPayment,
                        currency.code,
                        currency.locale,
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex-1 min-h-[200px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={5}
                        dataKey="value"
                        labelLine={false}
                        label={({ percent }) =>
                          `${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) =>
                          formatCurrencyFull(
                            value,
                            currency.code,
                            currency.locale,
                          )
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-6 mt-2">
                  {pieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <span className="text-xs text-slate-500">
                        {entry.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-600 p-6 rounded-2xl shadow-lg text-white">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs font-medium opacity-80 uppercase tracking-wider">
                      Total Savings
                    </span>
                    <p className="text-3xl font-bold">
                      {formatCurrencyFull(
                        savings.interest,
                        currency.code,
                        currency.locale,
                      )}
                    </p>
                  </div>
                  <div className="p-2 bg-white/20 rounded-lg">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm opacity-90">
                  <Clock className="w-4 h-4" />
                  <span>
                    Reduced tenure by {Math.floor(savings.months / 12)}y{" "}
                    {savings.months % 12}m
                  </span>
                </div>
              </div>
            </div>

            {/* Row 1 Grid Conclusion */}
          </div>

          {/* Scenario Studio: Structured Tabs to Lower Cognitive Load */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Loan Scenario Studio
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Customize prepayments, rate changes, step-ups, and upfront
                  purchase costs without clutter
                </p>
              </div>

              {/* View Mode & Segmented Tab Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full lg:w-auto">
                {/* Segmented Tab Controls (Active in Tabbed mode) */}
                {studioViewMode === "tabbed" && (
                  <div className="relative flex flex-wrap items-center gap-1 bg-slate-100/90 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setActiveStudioTab("prepayments")}
                      className={cn(
                        "relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-300",
                        activeStudioTab === "prepayments"
                          ? "text-emerald-700"
                          : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50/50",
                      )}
                    >
                      {activeStudioTab === "prepayments" && (
                        <motion.div
                          layoutId="studio-tab-pill"
                          className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/60 -z-10"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Prepayments</span>
                      {prepayments.length > 0 && (
                        <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">
                          {prepayments.length}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStudioTab("stepup")}
                      className={cn(
                        "relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-300",
                        activeStudioTab === "stepup"
                          ? "text-purple-700"
                          : "text-slate-600 hover:text-purple-600 hover:bg-slate-50/50",
                      )}
                    >
                      {activeStudioTab === "stepup" && (
                        <motion.div
                          layoutId="studio-tab-pill"
                          className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/60 -z-10"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                      <Zap className="w-3.5 h-3.5" />
                      <span>Step-Up EMI</span>
                      {emiStepUpPercent > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-purple-100 text-purple-700 text-[10px]">
                          +{emiStepUpPercent}%
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStudioTab("rates")}
                      className={cn(
                        "relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-300",
                        activeStudioTab === "rates"
                          ? "text-amber-700"
                          : "text-slate-600 hover:text-amber-600 hover:bg-slate-50/50",
                      )}
                    >
                      {activeStudioTab === "rates" && (
                        <motion.div
                          layoutId="studio-tab-pill"
                          className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/60 -z-10"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Rate Changes</span>
                      {rateChanges.length > 0 && (
                        <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center">
                          {rateChanges.length}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStudioTab("upfront")}
                      className={cn(
                        "relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-300",
                        activeStudioTab === "upfront"
                          ? "text-indigo-700"
                          : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50/50",
                      )}
                    >
                      {activeStudioTab === "upfront" && (
                        <motion.div
                          layoutId="studio-tab-pill"
                          className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/60 -z-10"
                          transition={{
                            type: "spring",
                            bounce: 0.2,
                            duration: 0.6,
                          }}
                        />
                      )}
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Upfront Costs</span>
                    </button>
                  </div>
                )}

                {/* View Mode Switcher: Tabbed vs Stacked placed at the right end */}
                <div className="relative flex items-center bg-slate-200/80 p-1 rounded-xl sm:ml-auto">
                  <button
                    type="button"
                    onClick={() => toggleStudioViewMode("tabbed")}
                    aria-label="Tabbed View"
                    title="Tabbed View (Low cognitive load)"
                    className={cn(
                      "relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-300",
                      studioViewMode === "tabbed"
                        ? "text-slate-900"
                        : "text-slate-500 hover:text-slate-800",
                    )}
                  >
                    {studioViewMode === "tabbed" && (
                      <motion.div
                        layoutId="studio-view-pill"
                        className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/60 -z-10"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <Layers className="w-3.5 h-3.5" />
                    <span>Tabs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleStudioViewMode("stacked")}
                    aria-label="Stacked View"
                    title="See all tools simultaneously"
                    className={cn(
                      "relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-300",
                      studioViewMode === "stacked"
                        ? "text-slate-900"
                        : "text-slate-500 hover:text-slate-800",
                    )}
                  >
                    {studioViewMode === "stacked" && (
                      <motion.div
                        layoutId="studio-view-pill"
                        className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/60 -z-10"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>All at Once</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Studio Content */}
            <div className="p-4 sm:p-6 bg-slate-50/50">
              <div
                className={cn(
                  studioViewMode === "stacked" ? "space-y-8" : "space-y-0",
                )}
              >
                <div
                  className={cn(
                    studioViewMode === "stacked" ||
                      activeStudioTab === "prepayments"
                      ? "block"
                      : "hidden",
                  )}
                >
                  <section
                    aria-labelledby="prepayment-planner-title"
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h2
                        id="prepayment-planner-title"
                        className="text-lg font-semibold flex items-center gap-2"
                      >
                        <ArrowRight className="w-5 h-5 text-emerald-500" />
                        Prepayment Planner
                      </h2>
                      <button
                        onClick={addPrepayment}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors text-xs font-bold"
                      >
                        <Plus className="w-4 h-4" />
                        Add Prepayment
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {prepayments.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                          <ArrowRight className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-sm italic">
                            No prepayments planned
                          </p>
                        </div>
                      )}
                      <AnimatePresence>
                        {prepayments.map((p) => (
                          <PrepaymentCard
                            key={p.id}
                            prepayment={p}
                            currencySymbol={currency.symbol}
                            onUpdate={updatePrepayment}
                            onRemove={removePrepayment}
                          />
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Prepayment savings summary */}
                    {prepayments.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between px-4 py-3 bg-emerald-50 rounded-xl border border-emerald-100 text-sm"
                      >
                        <div className="space-y-0.5">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Prepayments Impact
                          </p>
                          <p className="font-bold text-base text-emerald-700">
                            Saves{" "}
                            {formatCurrencyFull(
                              prepaymentSavings.interest,
                              currency.code,
                              currency.locale,
                            )}
                          </p>
                        </div>
                        <div className="text-right space-y-0.5">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Tenure Reduced
                          </p>
                          <p className="font-bold text-base text-emerald-700">
                            {Math.floor(prepaymentSavings.months / 12)}y{" "}
                            {prepaymentSavings.months % 12}m
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </section>
                </div>
                <div
                  className={cn(
                    studioViewMode === "stacked" || activeStudioTab === "stepup"
                      ? "block"
                      : "hidden",
                  )}
                >
                  <section
                    aria-labelledby="step-up-title"
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <h2
                            id="step-up-title"
                            className="text-lg font-semibold text-slate-800"
                          >
                            EMI Step-Up Planner
                          </h2>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Simulate annual EMI increases as your income grows —
                            pay off faster
                          </p>
                        </div>
                      </div>
                      {emiStepUpPercent > 0 && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => setEmiStepUpPercent(0)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors text-xs font-bold"
                        >
                          <X className="w-3 h-3" />
                          Disable
                        </motion.button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Left: Controls */}
                      <div className="space-y-5">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label
                              htmlFor="emi-step-up-slider"
                              className="text-sm font-bold text-slate-600"
                            >
                              Annual Step-Up Rate
                            </label>
                            <span
                              className={cn(
                                "text-sm font-extrabold px-2 py-0.5 rounded-md",
                                emiStepUpPercent === 0
                                  ? "text-slate-400 bg-slate-100"
                                  : "text-purple-700 bg-purple-100",
                              )}
                            >
                              {emiStepUpPercent === 0
                                ? "Disabled"
                                : `+${emiStepUpPercent}% / year`}
                            </span>
                          </div>
                          <input
                            id="emi-step-up-slider"
                            type="range"
                            aria-label="EMI Step-Up Percentage Slider"
                            min={0}
                            max={20}
                            step={0.5}
                            value={emiStepUpPercent}
                            onChange={(e) =>
                              setEmiStepUpPercent(Number(e.target.value))
                            }
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          />
                          <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5">
                            <span>0%</span>
                            <span>5%</span>
                            <span>10%</span>
                            <span>15%</span>
                            <span>20%</span>
                          </div>
                        </div>

                        {/* Quick Presets */}
                        <div className="space-y-2">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Quick Presets
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {[0, 5, 7, 10, 15].map((preset) => (
                              <button
                                key={preset}
                                onClick={() => setEmiStepUpPercent(preset)}
                                className={cn(
                                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                                  emiStepUpPercent === preset
                                    ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-200"
                                    : "bg-slate-50 text-slate-600 border-slate-200 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50",
                                )}
                              >
                                {preset === 0 ? "No Step-Up" : `+${preset}%`}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Savings Summary */}
                        {emiStepUpPercent > 0 && (
                          <motion.div
                            key={emiStepUpPercent}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-purple-50 rounded-xl border border-purple-100 space-y-3"
                          >
                            <p className="text-[10px] uppercase font-bold text-purple-600 tracking-wider">
                              Step-Up Impact
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">
                                  Tenure Saved
                                </p>
                                <p className="text-xl font-bold text-purple-700">
                                  {Math.floor(savings.months / 12)}y{" "}
                                  {savings.months % 12}m
                                </p>
                              </div>
                              <div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">
                                  Interest Saved
                                </p>
                                <p className="text-xl font-bold text-purple-700">
                                  {formatCurrencyFull(
                                    savings.interest,
                                    currency.code,
                                    currency.locale,
                                  )}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Right: Year-by-Year EMI Preview */}
                      <div className="space-y-3">
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Year-by-Year EMI Preview
                        </p>
                        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
                          {(() => {
                            const rows: React.ReactNode[] = [];
                            const baseEmi = adjustedSchedule[0]?.emi || 0;
                            const maxYears = Math.ceil(
                              adjustedSchedule.length / 12,
                            );
                            for (let y = 0; y < Math.min(maxYears, 10); y++) {
                              const monthIdx = y * 12;
                              const rowEmi = adjustedSchedule[monthIdx]?.emi;
                              if (rowEmi === undefined) break;
                              const increase = rowEmi - baseEmi;
                              const pct =
                                baseEmi > 0 ? (increase / baseEmi) * 100 : 0;
                              rows.push(
                                <div
                                  key={y}
                                  className={cn(
                                    "flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all",
                                    y === 0
                                      ? "bg-slate-50 border-slate-200"
                                      : "bg-purple-50/60 border-purple-100 hover:border-purple-200",
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <span
                                      className={cn(
                                        "w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold",
                                        y === 0
                                          ? "bg-slate-200 text-slate-600"
                                          : "bg-purple-200 text-purple-700",
                                      )}
                                    >
                                      {y + 1}
                                    </span>
                                    <span className="font-medium text-slate-700">
                                      Year {y + 1}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-slate-800">
                                      {formatCurrency(
                                        rowEmi,
                                        currency.code,
                                        currency.locale,
                                        currency.useIndianNotation,
                                      )}
                                    </p>
                                    {pct > 0 && (
                                      <p className="text-[10px] text-purple-600 font-semibold">
                                        +{pct.toFixed(1)}% from base
                                      </p>
                                    )}
                                  </div>
                                </div>,
                              );
                            }
                            if (emiStepUpPercent === 0) {
                              return (
                                <div className="flex flex-col items-center justify-center py-10 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                                  <Zap className="w-8 h-8 mb-2 opacity-20" />
                                  <p className="text-sm italic">
                                    Enable step-up to see year-wise EMI
                                  </p>
                                </div>
                              );
                            }
                            return rows;
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500 leading-relaxed italic">
                        <Info className="w-3.5 h-3.5 inline mr-1 mb-0.5 text-purple-500" />
                        EMI increases by the step-up rate each year on the loan
                        anniversary. Works alongside prepayments and rate
                        changes to give you the most accurate projection of your
                        repayment strategy.
                      </p>
                    </div>
                  </section>
                </div>
                <div
                  className={cn(
                    studioViewMode === "stacked" || activeStudioTab === "rates"
                      ? "block"
                      : "hidden",
                  )}
                >
                  <section
                    aria-labelledby="rate-simulator-title"
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h2
                        id="rate-simulator-title"
                        className="text-lg font-semibold flex items-center gap-2"
                      >
                        <TrendingUp className="w-5 h-5 text-amber-500" />
                        Rate Change Simulator
                      </h2>
                      <button
                        onClick={addRateChange}
                        className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors text-xs font-bold"
                      >
                        <Plus className="w-4 h-4" />
                        Add Change
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {rateChanges.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                          <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-sm italic">
                            No rate changes simulated
                          </p>
                        </div>
                      )}
                      <AnimatePresence>
                        {rateChanges.map((rc) => (
                          <RateChangeCard
                            key={rc.id}
                            rateChange={rc}
                            onUpdate={updateRateChange}
                            onRemove={removeRateChange}
                          />
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Rate Change savings summary */}
                    {rateChanges.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl border text-sm",
                          rateChangeSavings.interest >= 0
                            ? "bg-amber-50 border-amber-100"
                            : "bg-red-50 border-red-100",
                        )}
                      >
                        <div className="space-y-0.5">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Rate Changes Impact
                          </p>
                          <p
                            className={cn(
                              "font-bold text-base",
                              rateChangeSavings.interest >= 0
                                ? "text-amber-700"
                                : "text-red-600",
                            )}
                          >
                            {rateChangeSavings.interest >= 0
                              ? "Saves "
                              : "Costs "}
                            {formatCurrencyFull(
                              Math.abs(rateChangeSavings.interest),
                              currency.code,
                              currency.locale,
                            )}
                          </p>
                        </div>
                        <div className="text-right space-y-0.5">
                          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            Tenure{" "}
                            {rateChangeSavings.months >= 0
                              ? "Reduced"
                              : "Added"}
                          </p>
                          <p
                            className={cn(
                              "font-bold text-base",
                              rateChangeSavings.months >= 0
                                ? "text-amber-700"
                                : "text-red-600",
                            )}
                          >
                            {Math.floor(
                              Math.abs(rateChangeSavings.months) / 12,
                            )}
                            y {Math.abs(rateChangeSavings.months) % 12}m
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </section>
                </div>
                <div
                  className={cn(
                    studioViewMode === "stacked" ||
                      activeStudioTab === "upfront"
                      ? "block"
                      : "hidden",
                  )}
                >
                  <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-8">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 flex-shrink-0">
                        <Calculator className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900 leading-none">
                          {upfrontConfig.title}
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">
                          {loanType === LoanType.HOME
                            ? "Estimate the upfront costs for your property purchase"
                            : "Estimate your initial out-of-pocket expenses"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        {loanType !== LoanType.PERSONAL && (
                          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                            <div className="flex items-center justify-between mb-2">
                              <label
                                htmlFor="property-or-total-value"
                                className="text-xs font-bold text-slate-500 uppercase tracking-wider"
                              >
                                {loanType === LoanType.HOME
                                  ? "Property Value"
                                  : loanType === LoanType.CAR
                                    ? "On-Road Price"
                                    : "Purchase Price / Total Value"}
                              </label>
                              <Target className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="relative">
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center font-bold text-slate-400 text-lg">
                                {currency.symbol}
                              </div>
                              <input
                                id="property-or-total-value"
                                type="text"
                                inputMode="decimal"
                                aria-label={
                                  loanType === LoanType.HOME
                                    ? "Property Value"
                                    : loanType === LoanType.CAR
                                      ? "On-Road Price"
                                      : "Purchase Price / Total Value"
                                }
                                value={propertyValue || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                    setPropertyValue(parseNumberInput(e));
                                  }
                                }}
                                className="w-full pl-8 pr-4 py-2 bg-transparent border-b-2 border-slate-200 text-2xl font-bold text-slate-900 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                                placeholder="Enter value..."
                              />
                            </div>
                          </div>
                        )}

                        {loanType === LoanType.CAR ? (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                              Insurance Amount
                            </label>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                                {currency.symbol}
                              </div>
                              <input
                                type="text"
                                inputMode="decimal"
                                value={
                                  customRegistrationRate !== null
                                    ? customRegistrationRate
                                    : Math.round(propertyValue * 0.04)
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                    setCustomRegistrationRate(
                                      parseNumberInput(e),
                                    );
                                  }
                                }}
                                className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold"
                              />
                            </div>
                          </div>
                        ) : loanType === LoanType.PERSONAL ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Filing/Processing Charges
                              </label>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                                  {currency.symbol}
                                </div>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={
                                    customStampDutyRate !== null
                                      ? customStampDutyRate
                                      : Math.round(amount * 0.01)
                                  }
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                      setCustomStampDutyRate(
                                        parseNumberInput(e),
                                      );
                                    }
                                  }}
                                  className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold"
                                />
                              </div>
                              <p className="text-[10px] text-slate-500 font-bold">
                                Equivalent to{" "}
                                {(
                                  ((customStampDutyRate !== null
                                    ? customStampDutyRate
                                    : Math.round(amount * 0.01)) /
                                    amount) *
                                  100
                                ).toFixed(2)}
                                % of Loan
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                Documentation Charges
                              </label>
                              <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                                  {currency.symbol}
                                </div>
                                <input
                                  type="text"
                                  inputMode="decimal"
                                  value={
                                    customRegistrationRate !== null
                                      ? customRegistrationRate
                                      : 1000
                                  }
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                      setCustomRegistrationRate(
                                        parseNumberInput(e),
                                      );
                                    }
                                  }}
                                  className="w-full pl-8 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-semibold"
                                />
                              </div>
                              <p className="text-[10px] text-slate-500 font-bold">
                                Equivalent to{" "}
                                {(
                                  ((customRegistrationRate !== null
                                    ? customRegistrationRate
                                    : 1000) /
                                    amount) *
                                  100
                                ).toFixed(2)}
                                % of Loan
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label
                                htmlFor="upfront-duty-rate"
                                className="text-xs font-bold text-slate-500 uppercase tracking-wider"
                              >
                                {upfrontConfig.label1}
                              </label>
                              <input
                                id="upfront-duty-rate"
                                type="text"
                                inputMode="decimal"
                                aria-label={upfrontConfig.label1}
                                value={currentStampDutyRate}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                    setCustomStampDutyRate(parseNumberInput(e));
                                  }
                                }}
                                className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="upfront-reg-rate"
                                className="text-xs font-bold text-slate-500 uppercase tracking-wider"
                              >
                                {upfrontConfig.label2}
                              </label>
                              <input
                                id="upfront-reg-rate"
                                type="text"
                                inputMode="decimal"
                                aria-label={upfrontConfig.label2}
                                value={currentRegistrationRate}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                    setCustomRegistrationRate(
                                      parseNumberInput(e),
                                    );
                                  }
                                }}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-200 self-start">
                        <div className="flex flex-col justify-center">
                          <label
                            htmlFor="upfront-down-payment"
                            className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 cursor-pointer"
                          >
                            {upfrontConfig.labelDP}
                          </label>
                          <div className="relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center font-bold text-slate-400 text-xs">
                              {currency.symbol}
                            </div>
                            <input
                              id="upfront-down-payment"
                              type="text"
                              inputMode="decimal"
                              aria-label={upfrontConfig.labelDP}
                              value={downPayment || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                  setDownPayment(parseNumberInput(e));
                                }
                              }}
                              className="w-full pl-5 pr-2 py-1 bg-transparent border-b border-slate-200 text-lg font-bold text-slate-900 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                            Total Upfront
                          </p>
                          <p className="text-xl font-extrabold text-slate-900 break-all">
                            {formatCurrencyFull(
                              totalUpfront,
                              currency.code,
                              currency.locale,
                            )}
                          </p>
                        </div>
                        <div className="md:col-span-2 pt-4 border-t border-slate-200 mt-2">
                          {loanType !== LoanType.CAR && (
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-500">
                                {upfrontConfig.summary1}
                              </span>
                              <span className="font-bold text-slate-700">
                                {formatCurrencyFull(
                                  stampDuty,
                                  currency.code,
                                  currency.locale,
                                )}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-sm mt-1">
                            <span className="text-slate-500">
                              {upfrontConfig.summary2}
                            </span>
                            <span className="font-bold text-slate-700">
                              {formatCurrencyFull(
                                registrationFee,
                                currency.code,
                                currency.locale,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <p className="text-xs text-slate-500 leading-relaxed italic">
                        <Info className="w-3.5 h-3.5 inline mr-1 mb-0.5 text-indigo-500" />
                        Stamp duty and registration fees are estimates based on
                        standard regional rates ({currency.name}). Actual costs
                        may vary by specific state, city, property type, and
                        ownership status. Consult a local legal expert for
                        precise figures.
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Loan Balance Projection
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                {/* Legend */}
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-slate-300 border-t-2 border-dashed border-slate-300" />
                    <span className="text-slate-400">Original</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-emerald-500" />
                    <span className="text-emerald-500">Adjusted</span>
                  </div>
                </div>
                {/* Collective savings chips */}
                {savings.interest !== 0 && (
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {formatCurrencyFull(
                        savings.interest,
                        currency.code,
                        currency.locale,
                      )}{" "}
                      saved
                    </div>
                    <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.floor(savings.months / 12)}y {savings.months % 12}m
                      faster
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorOrig" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAdj" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    tickFormatter={(value) =>
                      formatCompactCurrency(
                        value,
                        currency.symbol,
                        currency.useIndianNotation,
                        currency.code,
                      )
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) =>
                      formatCurrency(
                        value,
                        currency.code,
                        currency.locale,
                        currency.useIndianNotation,
                      )
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="original"
                    name="Original"
                    stroke="#94a3b8"
                    fillOpacity={1}
                    fill="url(#colorOrig)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <Area
                    type="monotone"
                    dataKey="adjusted"
                    name="Adjusted"
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorAdj)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 4: Amortization Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-500" />
                Detailed Amortization Schedule
              </h2>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={exportToPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Export PDF
                </button>
                <button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  <TableIcon className="w-4 h-4" />
                  Export Excel
                </button>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
                  <Info className="w-3 h-3" />
                  Expand years for monthly view
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50 border-y border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      EMI No
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Opening Bal
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      EMI
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Interest
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Principal
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Prepayment
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Closing Bal
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Rate (%)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(
                    Object.entries(yearWiseSchedule) as [
                      string,
                      AmortizationRow[],
                    ][]
                  ).map(([year, rows]) => {
                    const isExpanded = expandedYears[Number(year)];
                    const yearTotalInterest = rows.reduce(
                      (sum, r) => sum + r.interest,
                      0,
                    );
                    const yearTotalPrincipal = rows.reduce(
                      (sum, r) => sum + r.principal,
                      0,
                    );
                    const yearTotalPrepayment = rows.reduce(
                      (sum, r) => sum + r.prepayment,
                      0,
                    );

                    return (
                      <React.Fragment key={year}>
                        <tr
                          tabIndex={0}
                          role="button"
                          aria-expanded={isExpanded}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setExpandedYears((prev) => ({
                                ...prev,
                                [Number(year)]: !prev[Number(year)],
                              }));
                            }
                          }}
                          onClick={() =>
                            setExpandedYears((prev) => ({
                              ...prev,
                              [Number(year)]: !prev[Number(year)],
                            }))
                          }
                          className="bg-slate-50/50 cursor-pointer hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-inset focus:ring-emerald-500 outline-none"
                        >
                          <td className="px-6 py-4 font-bold text-slate-700 flex items-center gap-2">
                            <div className="p-1 bg-white rounded shadow-sm border border-slate-200">
                              {isExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </div>
                            {year}
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400 italic">
                            Annual Summary
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-700">
                            {formatCurrency(
                              rows[0].openingBalance,
                              currency.code,
                              currency.locale,
                              currency.useIndianNotation,
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-700">
                            {formatCurrency(
                              rows.reduce((sum, r) => sum + r.emi, 0),
                              currency.code,
                              currency.locale,
                              currency.useIndianNotation,
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-amber-600">
                            {formatCurrency(
                              yearTotalInterest,
                              currency.code,
                              currency.locale,
                              currency.useIndianNotation,
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                            {formatCurrency(
                              yearTotalPrincipal,
                              currency.code,
                              currency.locale,
                              currency.useIndianNotation,
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                            {yearTotalPrepayment > 0
                              ? formatCurrency(
                                  yearTotalPrepayment,
                                  currency.code,
                                  currency.locale,
                                  currency.useIndianNotation,
                                )
                              : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-700">
                            {formatCurrency(
                              rows[rows.length - 1].closingBalance,
                              currency.code,
                              currency.locale,
                              currency.useIndianNotation,
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-amber-500">
                            {rows[0].interestRate}%
                          </td>
                        </tr>
                        {isExpanded &&
                          rows.map((row) => (
                            <tr
                              key={row.month}
                              className={cn(
                                "hover:bg-slate-50 transition-colors",
                                row.prepayment > 0 && "bg-emerald-50/30",
                              )}
                            >
                              <td className="px-6 py-3 text-xs text-slate-500">
                                <div className="flex items-center gap-1.5">
                                  <span>{row.month}</span>
                                  {row.isMoratorium && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                      Moratorium
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-3 text-xs text-slate-500">
                                {format(row.date, "MMM yyyy")}
                              </td>
                              <td className="px-6 py-3 text-sm font-medium text-slate-700">
                                {formatCurrency(
                                  row.openingBalance,
                                  currency.code,
                                  currency.locale,
                                  currency.useIndianNotation,
                                )}
                              </td>
                              <td className="px-6 py-3 text-sm font-bold text-slate-900">
                                {formatCurrency(
                                  row.emi,
                                  currency.code,
                                  currency.locale,
                                  currency.useIndianNotation,
                                )}
                              </td>
                              <td className="px-6 py-3 text-sm text-amber-600 font-medium">
                                {formatCurrency(
                                  row.interest,
                                  currency.code,
                                  currency.locale,
                                  currency.useIndianNotation,
                                )}
                              </td>
                              <td className="px-6 py-3 text-sm text-emerald-600 font-medium">
                                {formatCurrency(
                                  row.principal,
                                  currency.code,
                                  currency.locale,
                                  currency.useIndianNotation,
                                )}
                              </td>
                              <td className="px-6 py-3 text-sm text-indigo-600 font-bold">
                                {row.prepayment > 0
                                  ? formatCurrency(
                                      row.prepayment,
                                      currency.code,
                                      currency.locale,
                                      currency.useIndianNotation,
                                    )
                                  : "-"}
                              </td>
                              <td className="px-6 py-3 text-sm font-medium text-slate-700">
                                {formatCurrency(
                                  row.closingBalance,
                                  currency.code,
                                  currency.locale,
                                  currency.useIndianNotation,
                                )}
                              </td>
                              <td className="px-6 py-3 text-sm font-bold text-amber-500">
                                {row.interestRate}%
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Lead Generation Section (The Wall) */}
        {isConsultancyEnabled && (
          <>
            <section className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative border border-white/10">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/finance/1920/1080?blur=10')] opacity-10 bg-cover bg-center" />
              <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center border border-emerald-500/30 mb-2">
                  <Lock className="w-8 h-8 text-emerald-400" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">
                    Want a custom app like this for{" "}
                    <br className="hidden md:block" />
                    <span className="text-emerald-400">your business?</span>
                  </h2>
                  <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto font-medium">
                    Have a specific calculation or feature in mind? We'd love to
                    hear your feedback. Request a new feature or get a custom
                    financial tool built for your business.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <button
                    onClick={() => {
                      trackClick("click_open_lead_modal", "lead_generation", {
                        loan_type: loanType,
                      });
                      setShowLeadModal(true);
                    }}
                    className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-emerald-900/40 hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Award className="w-5 h-5" />
                    Request a Feature
                  </button>
                  <a
                    href="https://omegaalphatech.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all shadow-xl hover:scale-105 active:scale-95 border border-slate-700"
                  >
                    View Our Portfolio
                  </a>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 w-full border-t border-white/10">
                  {[
                    { label: "Custom UI/UX", val: "100%" },
                    { label: "Lead Conversions", val: "3x" },
                    { label: "SEO Optimized", val: "Yes" },
                    { label: "Delivery Time", val: "Fast" },
                  ].map((stat, i) => (
                    <div key={i} className="text-center">
                      <p className="text-2xl font-bold text-white">
                        {stat.val}
                      </p>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Lead Modal */}
            <AnimatePresence>
              {showLeadModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
                  >
                    <button
                      aria-label="Close modal"
                      onClick={() => setShowLeadModal(false)}
                      className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="p-8">
                      <div className="text-center space-y-2 mb-8">
                        <h3 className="text-2xl font-bold text-slate-900">
                          Let's Build Software
                        </h3>
                        <p className="text-slate-500 text-sm">
                          Enter your details and our team will contact you to
                          discuss your custom project.
                        </p>
                      </div>

                      {isLeadSubmitted ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-12 space-y-4"
                        >
                          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                            <Check className="w-8 h-8" />
                          </div>
                          <h4 className="text-xl font-bold text-slate-900">
                            Request Received!
                          </h4>
                          <p className="text-slate-500">
                            Our expert will contact you within 24 hours.
                          </p>
                        </motion.div>
                      ) : (
                        <form onSubmit={handleLeadSubmit} className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase">
                              Full Name
                            </label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                              <input
                                required
                                type="text"
                                placeholder="John Doe"
                                value={leadForm.name}
                                onChange={(e) =>
                                  setLeadForm({
                                    ...leadForm,
                                    name: e.target.value,
                                  })
                                }
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase">
                              Email Address
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                              <input
                                required
                                type="email"
                                placeholder="john@example.com"
                                value={leadForm.email}
                                onChange={(e) =>
                                  setLeadForm({
                                    ...leadForm,
                                    email: e.target.value,
                                  })
                                }
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-400 uppercase">
                              Phone Number
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                              <input
                                required
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={leadForm.phone}
                                onChange={(e) =>
                                  setLeadForm({
                                    ...leadForm,
                                    phone: e.target.value,
                                  })
                                }
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 mt-4"
                          >
                            <Send className="w-4 h-4" />
                            Unlock Roadmap Now
                          </button>
                          <p className="text-[10px] text-center text-slate-400 pt-2">
                            By clicking, you agree to our privacy policy and
                            terms of service.
                          </p>
                        </form>
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* SEO / Educational Content Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
          {loanType === LoanType.EDUCATION ? (
            <>
              <article className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800">
                  How Moratorium Period Works
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  The moratorium period covers your Course Duration plus an
                  additional Grace Period (typically 6 to 12 months after
                  graduation or finding employment). During this phase, you are
                  not required to pay standard EMIs, giving you breathing room
                  while studying.
                </p>
              </article>
              <article className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800">
                  Simple Interest vs Compound Interest
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Under RBI and Indian Banks' Association (IBA) rules, banks
                  charge Simple Interest (SI) during the moratorium. If left
                  unpaid, all accrued interest is capitalized (added to
                  principal) when EMIs start. Servicing SI monthly saves lakhs
                  in compounding and unlocks up to 1% rate concessions!
                </p>
              </article>
              <article className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800">
                  Tax Benefits under Section 80E
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Under Section 80E of the Income Tax Act, you can claim a 100%
                  tax deduction on the entire interest amount paid on higher
                  education loans with NO upper limit for up to 8 continuous
                  years. In the US, taxpayers can deduct up to $2,500/year on
                  student loan interest paid.
                </p>
              </article>
            </>
          ) : (
            <>
              <article className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800">
                  What is an EMI?
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Equated Monthly Installment (EMI) is a fixed payment amount
                  made by a borrower to a lender at a specified date each
                  calendar month. EMIs are applied to both interest and
                  principal each month, so that over a specified number of
                  years, the loan is paid off in full.
                </p>
              </article>
              <article className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800">
                  Benefits of Prepayment
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Making prepayments on your loan can significantly reduce your
                  total interest burden and shorten your loan tenure. Even
                  small, regular prepayments can save you lakhs of rupees in
                  interest over the long term, especially in the early years of
                  a home loan.
                </p>
              </article>
              <article className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800">
                  Floating vs Fixed Rates
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Floating interest rates change based on market conditions
                  (like the RBI Repo Rate), while fixed rates remain constant.
                  Our calculator allows you to simulate floating rate hikes to
                  see how they impact your monthly budget and total loan cost.
                </p>
              </article>
            </>
          )}
        </section>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
          <p>
            © {new Date().getFullYear()} Smart EMI Planner. All calculations are
            estimates.
          </p>
        </footer>

        <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
      </div>
    </div>
  );
}
