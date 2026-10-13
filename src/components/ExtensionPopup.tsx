import React, { useState, useEffect, useMemo } from "react";
import {
  Home,
  Car,
  User,
  GraduationCap,
  ExternalLink,
  Copy,
  Check,
  TrendingDown,
  PieChart as PieIcon,
} from "lucide-react";
import { LoanType } from "../types";
import { calculateEMI, LOAN_DEFAULTS } from "../loanLogic";
import countryConfigs from "../countryConfigs.json";
import { formatCurrencyFull, cn } from "../lib/utils";

const CURRENCIES = Object.values(countryConfigs).sort((a, b) =>
  (a.country || a.name).localeCompare(b.country || b.name),
);

interface ExtensionPopupProps {
  onOpenFullApp?: () => void;
}

export default function ExtensionPopup({ onOpenFullApp }: ExtensionPopupProps) {
  const [loanType, setLoanType] = useState<LoanType>(LoanType.HOME);
  const [copied, setCopied] = useState(false);

  // Initialize currency from localStorage or default to INR
  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("user_selected_currency");
      if (saved && (countryConfigs as any)[saved]) {
        return saved;
      }
    } catch (e) {}
    return "INR";
  });

  const currency = (countryConfigs as any)[currencyCode] || (countryConfigs as any).INR;

  const currentDefaults = LOAN_DEFAULTS[loanType];
  const [amount, setAmount] = useState<number>(currentDefaults.amount);
  const [rate, setRate] = useState<number>(currentDefaults.rate);
  const [tenureYears, setTenureYears] = useState<number>(currentDefaults.tenure);

  // When loan type changes, update inputs to recommended defaults
  const handleLoanTypeChange = (type: LoanType) => {
    setLoanType(type);
    const def = LOAN_DEFAULTS[type];
    setAmount(def.amount);
    setRate(def.rate);
    setTenureYears(def.tenure);
  };

  const handleCurrencyChange = (newCode: string) => {
    setCurrencyCode(newCode);
    try {
      localStorage.setItem("user_selected_currency", newCode);
    } catch (e) {}
  };

  // Calculations
  const emi = useMemo(() => {
    return Math.round(calculateEMI(amount, rate, tenureYears * 12));
  }, [amount, rate, tenureYears]);

  const totalPayable = useMemo(() => {
    return Math.round(emi * tenureYears * 12);
  }, [emi, tenureYears]);

  const totalInterest = useMemo(() => {
    return Math.max(0, totalPayable - amount);
  }, [totalPayable, amount]);

  const interestRatio = useMemo(() => {
    if (totalPayable <= 0) return 0;
    return Math.round((totalInterest / totalPayable) * 100);
  }, [totalInterest, totalPayable]);

  const handleCopy = () => {
    const text = `Monthly EMI: ${formatCurrencyFull(emi, currency.code, currency.locale)} | Loan: ${formatCurrencyFull(amount, currency.code, currency.locale)} at ${rate}% for ${tenureYears} yrs`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenFull = () => {
    if (onOpenFullApp) {
      onOpenFullApp();
      return;
    }
    // Launch full app in standalone tab with current parameters
    const path = `/#/${loanType.toLowerCase()}-loan`;
    try {
      const chromeApi =
        typeof window !== "undefined" ? (window as any).chrome : undefined;
      if (chromeApi?.runtime?.getURL) {
        window.open(chromeApi.runtime.getURL(`index.html${path}`), "_blank");
        return;
      }
    } catch (e) {}
    window.open(path, "_blank");
  };

  return (
    <div className="w-[420px] max-w-full bg-slate-50 text-slate-900 font-sans p-4 flex flex-col gap-3.5 select-none shadow-xl border border-slate-200">
      {/* Top Bar: Brand, Currency Picker, Full App Launcher */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <img
            src="/favicon.png"
            alt="Smart EMI Logo"
            className="w-6 h-6 rounded-md shadow-xs border border-slate-100"
          />
          <span className="font-extrabold text-slate-800 text-sm tracking-tight">
            Smart EMI Planner
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Currency Dropdown */}
          <select
            aria-label="Currency"
            value={currencyCode}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="text-xs font-bold text-emerald-800 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none shadow-2xs hover:border-emerald-500 cursor-pointer transition-colors"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.country || c.name} ({c.symbol})
              </option>
            ))}
          </select>

          {/* Expand to Full Tab */}
          <button
            type="button"
            onClick={handleOpenFull}
            title="Open Full Dashboard in New Tab"
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-900 text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Full App</span>
          </button>
        </div>
      </div>

      {/* Loan Type Segmented Selector */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-slate-200/70 rounded-xl text-xs font-bold">
        {[
          { type: LoanType.HOME, label: "Home", icon: Home },
          { type: LoanType.CAR, label: "Car", icon: Car },
          { type: LoanType.PERSONAL, label: "Personal", icon: User },
          { type: LoanType.EDUCATION, label: "Edu", icon: GraduationCap },
        ].map((item) => {
          const isActive = loanType === item.type;
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => handleLoanTypeChange(item.type)}
              className={cn(
                "flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer",
                isActive
                  ? "bg-white text-emerald-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Hero EMI Result Banner */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-md relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-100 uppercase tracking-wider">
              Monthly Installment (EMI)
            </span>
            <div className="text-2xl font-black tracking-tight mt-0.5">
              {formatCurrencyFull(emi, currency.code, currency.locale)}
              <span className="text-xs font-normal text-emerald-100 ml-1">/ month</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all backdrop-blur-xs cursor-pointer"
            title="Copy EMI summary"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-200" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Breakdown Badges */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-emerald-500/50 text-xs">
          <div>
            <span className="text-[10px] text-emerald-100 block">Total Interest ({interestRatio}%)</span>
            <span className="font-bold">
              {formatCurrencyFull(totalInterest, currency.code, currency.locale)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-100 block">Total Amount Payable</span>
            <span className="font-bold">
              {formatCurrencyFull(totalPayable, currency.code, currency.locale)}
            </span>
          </div>
        </div>
      </div>

      {/* Input Sliders */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-3.5 shadow-2xs">
        {/* Loan Amount */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-bold text-slate-600">Loan Amount</span>
            <span className="font-extrabold text-emerald-700">
              {formatCurrencyFull(amount, currency.code, currency.locale)}
            </span>
          </div>
          <input
            type="range"
            min={100000}
            max={currentDefaults.maxAmount}
            step={loanType === LoanType.HOME ? 50000 : 10000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
        </div>

        {/* Interest Rate */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-bold text-slate-600">Interest Rate (% p.a.)</span>
            <span className="font-extrabold text-emerald-700">{rate.toFixed(2)}%</span>
          </div>
          <input
            type="range"
            min={4}
            max={22}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
        </div>

        {/* Tenure */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-bold text-slate-600">Tenure</span>
            <span className="font-extrabold text-emerald-700">
              {tenureYears} {tenureYears === 1 ? "Year" : "Years"} ({tenureYears * 12} mos)
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={currentDefaults.maxTenure}
            step={1}
            value={tenureYears}
            onChange={(e) => setTenureYears(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
          />
        </div>
      </div>

      {/* Bottom CTA Button */}
      <button
        type="button"
        onClick={handleOpenFull}
        className="w-full py-2.5 px-4 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer group"
      >
        <PieIcon className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white transition-colors" />
        <span>Open Prepayments & Amortization Schedule ↗</span>
      </button>
    </div>
  );
}
