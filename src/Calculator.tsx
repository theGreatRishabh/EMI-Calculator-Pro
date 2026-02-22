import React, { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  format,
  addMonths,
  parseISO,
  getYear,
  differenceInMonths,
} from "date-fns";
import { cn, formatCurrency, formatCurrencyFull } from "./lib/utils";
import {
  LoanType,
  AdjustmentMode,
  PrepaymentType,
  PrepaymentReduction,
  RateChange,
  Prepayment,
  AmortizationRow,
} from "./types";
import {
  LOAN_DEFAULTS,
  calculateEMI,
  generateAmortizationSchedule,
} from "./loanLogic";

const COLORS = ["#10b981", "#f59e0b"];

const parseNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
  let val = e.target.value;
  if (val === "") return 0;
  if (/^0[0-9]/.test(val)) {
    val = val.replace(/^0+(?=[0-9])/, "");
    // Force DOM update to fix React's number sync issue
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
        className="absolute -top-2 -right-2 p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-full shadow-sm border border-slate-200 opacity-0 group-hover:opacity-100 transition-all z-10"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            Effective Date
          </label>
          <input
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
          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            New Rate (%)
          </label>
          <div className="relative">
            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
            <input
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
  onUpdate: (id: string, updates: Partial<Prepayment>) => void;
  onRemove: (id: string) => void;
}

function PrepaymentCard({
  prepayment,
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
        className="absolute -top-2 -right-2 p-1.5 bg-white text-slate-400 hover:text-red-500 rounded-full shadow-sm border border-slate-200 opacity-0 group-hover:opacity-100 transition-all z-10"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            Amount (₹)
          </label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
            <input
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
          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            Start Date
          </label>
          <input
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
          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            Type
          </label>
          <select
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
          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            Reduce
          </label>
          <select
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
          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            Frequency (Months)
          </label>
          <input
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

export default function App() {
  const [loanType, setLoanType] = useState<LoanType>(LoanType.HOME);
  const [amount, setAmount] = useState(LOAN_DEFAULTS[LoanType.HOME].amount);
  const [rate, setRate] = useState(LOAN_DEFAULTS[LoanType.HOME].rate);
  const [tenure, setTenure] = useState(LOAN_DEFAULTS[LoanType.HOME].tenure);
  const [tenureUnit, setTenureUnit] = useState<"Y" | "M">("Y");
  const [loanStartDate, setLoanStartDate] = useState(
    format(new Date(), "yyyy-MM-dd"),
  );

  const [rateChanges, setRateChanges] = useState<RateChange[]>([]);
  const [prepayments, setPrepayments] = useState<Prepayment[]>([]);

  const [expandedYears, setExpandedYears] = useState<Record<number, boolean>>(
    {},
  );

  // URL State Persistence
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const type = params.get("type") as LoanType;
    const amt = params.get("amt");
    const r = params.get("rate");
    const ten = params.get("ten");
    const unit = params.get("unit") as "Y" | "M";
    const start = params.get("start");
    const rc = params.get("rc");
    const pp = params.get("pp");

    if (type && Object.values(LoanType).includes(type)) setLoanType(type);
    if (amt) setAmount(Number(amt));
    if (r) setRate(Number(r));
    if (ten) setTenure(Number(ten));
    if (unit) setTenureUnit(unit);
    if (start) setLoanStartDate(start);

    if (rc) {
      try {
        setRateChanges(JSON.parse(atob(rc)));
      } catch (e) {
        console.error("Failed to parse shared rate changes", e);
      }
    }
    if (pp) {
      try {
        setPrepayments(JSON.parse(atob(pp)));
      } catch (e) {
        console.error("Failed to parse shared prepayments", e);
      }
    }
  }, []);

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
    (import.meta as any).env.VITE_ENABLE_CONSULTANCY === "true";

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd send this to your backend or CRM
    console.log("Lead captured:", leadForm);
    setIsLeadSubmitted(true);
    setTimeout(() => {
      setShowLeadModal(false);
      setIsLeadSubmitted(false);
    }, 2000);
  };

  const handleShare = () => {
    const params = new URLSearchParams({
      type: loanType,
      amt: amount.toString(),
      rate: rate.toString(),
      ten: tenure.toString(),
      unit: tenureUnit,
      start: loanStartDate,
      rc: btoa(JSON.stringify(rateChanges)),
      pp: btoa(JSON.stringify(prepayments)),
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

  const originalSchedule = useMemo(
    () => generateAmortizationSchedule(amount, rate, tenureMonths, startDate),
    [amount, rate, tenureMonths, startDate],
  );

  const adjustedSchedule = useMemo(
    () =>
      generateAmortizationSchedule(
        amount,
        rate,
        tenureMonths,
        startDate,
        rateChanges,
        prepayments,
      ),
    [amount, rate, tenureMonths, startDate, rateChanges, prepayments],
  );

  const originalSummary = useMemo(() => {
    const totalInterest = originalSchedule.reduce(
      (sum, row) => sum + row.interest,
      0,
    );
    return {
      totalInterest,
      totalPayment: amount + totalInterest,
      months: originalSchedule.length,
      emi: originalSchedule[0]?.emi || 0,
    };
  }, [originalSchedule, amount]);

  const adjustedSummary = useMemo(() => {
    const totalInterest = adjustedSchedule.reduce(
      (sum, row) => sum + row.interest,
      0,
    );
    const today = new Date();
    const monthsPassed = Math.max(0, differenceInMonths(today, startDate));
    const totalMonths = adjustedSchedule.length;
    const remainingMonths = Math.max(0, totalMonths - monthsPassed);

    return {
      totalInterest,
      totalPayment: amount + totalInterest,
      months: totalMonths,
      emi: adjustedSchedule[0]?.emi || 0,
      monthsPassed,
      remainingMonths,
    };
  }, [adjustedSchedule, amount, startDate]);

  const savings = {
    interest: originalSummary.totalInterest - adjustedSummary.totalInterest,
    months: originalSummary.months - adjustedSummary.months,
  };

  const handleLoanTypeChange = (type: LoanType) => {
    setLoanType(type);
    setAmount(LOAN_DEFAULTS[type].amount);
    setRate(LOAN_DEFAULTS[type].rate);
    setTenure(LOAN_DEFAULTS[type].tenure);
    setTenureUnit("Y");
    setLoanStartDate(format(new Date(), "yyyy-MM-dd"));
    setRateChanges([]);
    setPrepayments([]);
  };

  const exportToPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();

    // Helper to clean currency for PDF (replace ₹ with Rs. since default PDF fonts don't support Unicode ₹)
    const cleanCurrency = (val: string) => val.replace(/₹/g, "Rs. ");

    doc.setFontSize(20);
    doc.text("EMI Amortization Schedule", 14, 22);
    doc.setFontSize(11);
    doc.text(
      `Loan Amount: ${cleanCurrency(formatCurrencyFull(amount))}`,
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
      row.month,
      format(row.date, "MMM yyyy"),
      cleanCurrency(formatCurrency(row.openingBalance)),
      cleanCurrency(formatCurrency(row.emi)),
      cleanCurrency(formatCurrency(row.interest)),
      cleanCurrency(formatCurrency(row.principal)),
      row.prepayment > 0 ? cleanCurrency(formatCurrency(row.prepayment)) : "-",
      cleanCurrency(formatCurrency(row.closingBalance)),
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
    const XLSX = await import("xlsx");
    const data = adjustedSchedule.map((row) => ({
      "EMI No": row.month,
      Date: format(row.date, "MMM yyyy"),
      "Opening Balance": row.openingBalance,
      EMI: row.emi,
      Interest: row.interest,
      Principal: row.principal,
      Prepayment: row.prepayment,
      "Closing Balance": row.closingBalance,
      "Interest Rate": row.interestRate,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Schedule");
    XLSX.writeFile(wb, `EMI_Schedule_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  const [goalMonths, setGoalMonths] = useState(
    tenure * (tenureUnit === "Y" ? 12 : 1),
  );
  const [goalStartDate, setGoalStartDate] = useState<string>("");
  const [calculatedPrepayment, setCalculatedPrepayment] = useState<
    number | null
  >(null);

  const calculateGoalPrepayment = () => {
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

      const testSchedule = generateAmortizationSchedule(
        amount,
        rate,
        tenureMonths,
        startDate,
        rateChanges,
        testPrepayments,
      );

      // We check if the schedule finishes within the total estimated time
      if (testSchedule.length <= totalGoalMonths) {
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
    setRateChanges(rateChanges.filter((rc) => rc.id !== id));
  };

  const updateRateChange = (id: string, updates: Partial<RateChange>) => {
    setRateChanges(
      rateChanges.map((rc) => (rc.id === id ? { ...rc, ...updates } : rc)),
    );
  };

  const addPrepayment = () => {
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start justify-between w-full md:w-auto">
            <div className="flex items-center gap-4">
              <img
                src="/favicon.png"
                alt="Smart EMI Planner Logo"
                className="w-12 h-12 rounded-xl shadow-sm border border-slate-200"
              />
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  Smart EMI Calculator
                </h1>
                <p className="text-slate-500">
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
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              {Object.values(LoanType).map((type) => (
                <button
                  key={type}
                  onClick={() => handleLoanTypeChange(type)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    loanType === type
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {type.charAt(0) + type.slice(1).toLowerCase()} Loan
                </button>
              ))}
            </div>

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
              <section className="bg-white p-8 rounded-3xl shadow-sm border-[6px] border-slate-200">
                <h2 className="text-xl font-bold flex items-center gap-2 mb-8 text-slate-800">
                  <Calculator className="w-6 h-6 text-emerald-600" />
                  Loan Parameters
                </h2>

                <div className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    <div className="space-y-3 w-full">
                      <div className="flex justify-between">
                        <label className="text-sm font-bold text-slate-600">
                          Loan Amount
                        </label>
                        <span className="text-sm font-extrabold text-emerald-600">
                          {formatCurrencyFull(amount)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="100000"
                        max={LOAN_DEFAULTS[loanType].maxAmount}
                        step="50000"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
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
                        <label className="text-sm font-bold text-slate-600">
                          Interest Rate (% p.a.)
                        </label>
                        <span className="text-sm font-extrabold text-emerald-600">
                          {rate}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="0.05"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <div className="relative">
                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="number"
                          id="interest-rate"
                          aria-label="Interest Rate"
                          value={rate}
                          step="0.05"
                          onChange={(e) => setRate(parseNumberInput(e))}
                          className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 w-full">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-slate-600">
                          Tenure
                        </label>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                          <button
                            onClick={() => setTenureUnit("Y")}
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
                            onClick={() => setTenureUnit("M")}
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
                        type="range"
                        min="1"
                        max={
                          tenureUnit === "Y"
                            ? LOAN_DEFAULTS[loanType].maxTenure
                            : LOAN_DEFAULTS[loanType].maxTenure * 12
                        }
                        value={tenure}
                        onChange={(e) => setTenure(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="number"
                          id="loan-tenure"
                          aria-label="Loan Tenure"
                          value={tenure}
                          onChange={(e) => setTenure(parseNumberInput(e))}
                          className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
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
                  </div>
                </div>
              </section>

              {/* Goal Optimizer Tool */}
              <section className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-semibold text-emerald-900">
                    Goal Optimizer
                  </h2>
                </div>
                <p className="text-sm text-emerald-700">
                  Calculate required monthly prepayment to close your loan
                  faster. If a Start Date is selected, the required time to
                  close will be measured from that date.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-emerald-800">
                      Target Time to Close (Months)
                    </label>
                    <input
                      type="number"
                      value={goalMonths}
                      onChange={(e) => setGoalMonths(parseNumberInput(e))}
                      className="w-full px-4 py-2 bg-white border border-emerald-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-emerald-800">
                      Start Date (Optional)
                    </label>
                    <input
                      type="date"
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
                        {formatCurrencyFull(calculatedPrepayment)}
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
                <section className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-indigo-900">
                      Tax Benefit Estimator (India)
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-xl border border-indigo-100">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                        Section 24(b) - Interest
                      </p>
                      <p className="text-xl font-bold text-indigo-600">
                        {formatCurrencyFull(
                          Math.min(
                            200000,
                            adjustedSummary.totalInterest /
                              (adjustedSummary.months / 12),
                          ),
                        )}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          / year avg
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Deduction limit: ₹2,00,000
                      </p>
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-indigo-100">
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                        Section 80C - Principal
                      </p>
                      <p className="text-xl font-bold text-indigo-600">
                        {formatCurrencyFull(
                          Math.min(
                            150000,
                            amount / (adjustedSummary.months / 12),
                          ),
                        )}
                        <span className="text-[10px] text-slate-400 font-normal ml-1">
                          / year avg
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Deduction limit: ₹1,50,000
                      </p>
                    </div>
                  </div>
                  <div className="bg-indigo-600/5 p-3 rounded-lg border border-indigo-200/50">
                    <p className="text-xs text-indigo-700 leading-relaxed">
                      <Info className="w-3 h-3 inline mr-1 mb-0.5" />
                      Estimates based on annual averages. Actual benefits depend
                      on your tax slab and other investments.
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
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      Monthly EMI
                    </span>
                    <p className="text-lg font-bold text-slate-900 truncate">
                      {formatCurrencyFull(adjustedSummary.emi)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      Total Interest
                    </span>
                    <p className="text-lg font-bold text-slate-900 truncate">
                      {formatCurrencyFull(adjustedSummary.totalInterest)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
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
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
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
                  <div className="col-span-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      Total Payment (Principal + Interest)
                    </span>
                    <p className="text-xl font-bold text-emerald-600 truncate">
                      {formatCurrencyFull(adjustedSummary.totalPayment)}
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
                        formatter={(value: number) => formatCurrencyFull(value)}
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
                      {formatCurrencyFull(savings.interest)}
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
          </div>

          {/* Row 2: Advanced Tools */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Rate Change Simulator */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
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
                    <p className="text-sm italic">No rate changes simulated</p>
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
            </section>

            {/* Prepayment Planner */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
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
                    <p className="text-sm italic">No prepayments planned</p>
                  </div>
                )}
                <AnimatePresence>
                  {prepayments.map((p) => (
                    <PrepaymentCard
                      key={p.id}
                      prepayment={p}
                      onUpdate={updatePrepayment}
                      onRemove={removePrepayment}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </div>

          {/* Row 3: Balance Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Loan Balance Projection
              </h3>
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
                    tickFormatter={(value) => `₹${value / 100000}L`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
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
                            {formatCurrency(rows[0].openingBalance)}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-700">
                            {formatCurrency(
                              rows.reduce((sum, r) => sum + r.emi, 0),
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-amber-600">
                            {formatCurrency(yearTotalInterest)}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                            {formatCurrency(yearTotalPrincipal)}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                            {yearTotalPrepayment > 0
                              ? formatCurrency(yearTotalPrepayment)
                              : "-"}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-700">
                            {formatCurrency(
                              rows[rows.length - 1].closingBalance,
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
                                {row.month}
                              </td>
                              <td className="px-6 py-3 text-xs text-slate-500">
                                {format(row.date, "MMM yyyy")}
                              </td>
                              <td className="px-6 py-3 text-xs text-slate-500">
                                {formatCurrencyFull(row.openingBalance)}
                              </td>
                              <td className="px-6 py-3 text-xs font-medium text-slate-700">
                                {formatCurrencyFull(row.emi)}
                              </td>
                              <td className="px-6 py-3 text-xs text-amber-600">
                                {formatCurrencyFull(row.interest)}
                              </td>
                              <td className="px-6 py-3 text-xs text-emerald-600">
                                {formatCurrencyFull(row.principal)}
                              </td>
                              <td className="px-6 py-3 text-xs font-bold text-indigo-600">
                                {row.prepayment > 0
                                  ? formatCurrencyFull(row.prepayment)
                                  : "-"}
                              </td>
                              <td className="px-6 py-3 text-xs font-medium text-slate-700">
                                {formatCurrencyFull(row.closingBalance)}
                              </td>
                              <td className="px-6 py-3 text-xs font-bold text-amber-500">
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
                    Calculators are the ultimate lead magnets. Let our
                    specialized tech agency build a high-performance, branded
                    financial tool to capture leads for your real estate, auto,
                    or finance business.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4 pt-4">
                  <button
                    onClick={() => setShowLeadModal(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-emerald-900/40 hover:scale-105 active:scale-95"
                  >
                    <Award className="w-5 h-5" />
                    Hire Our Tech Agency
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
          <article className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800">
              What is an EMI?
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Equated Monthly Installment (EMI) is a fixed payment amount made
              by a borrower to a lender at a specified date each calendar month.
              EMIs are applied to both interest and principal each month, so
              that over a specified number of years, the loan is paid off in
              full.
            </p>
          </article>
          <article className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800">
              Benefits of Prepayment
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Making prepayments on your loan can significantly reduce your
              total interest burden and shorten your loan tenure. Even small,
              regular prepayments can save you lakhs of rupees in interest over
              the long term, especially in the early years of a home loan.
            </p>
          </article>
          <article className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800">
              Floating vs Fixed Rates
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Floating interest rates change based on market conditions (like
              the RBI Repo Rate), while fixed rates remain constant. Our
              calculator allows you to simulate floating rate hikes to see how
              they impact your monthly budget and total loan cost.
            </p>
          </article>
        </section>
      </div>

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
  );
}
