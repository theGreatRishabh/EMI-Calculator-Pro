import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HelpCircle, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

interface FaqItem {
  question: string;
  answer: React.ReactNode;
}

export default function FAQ() {
  useDocumentMeta({
    title: "FAQ | Smart EMI Planner",
    description: "Got questions about home loans, car loans, prepayments, interest rate hikes, or EMIs? Read our FAQ for answers.",
  });

  const faqs: FaqItem[] = [
    {
      question: "What is an EMI and how is it calculated?",
      answer: (
        <div className="space-y-3">
          <p>
            An <strong>Equated Monthly Installment (EMI)</strong> is a fixed payment amount made by a borrower
            to a lender at a specified date each calendar month. EMIs consist of both principal and interest components.
          </p>
          <p>
            The standard formula for calculating EMI is:
          </p>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 font-mono text-xs text-slate-800 text-center">
            EMI = [P x R x (1+R)^N] / [(1+R)^N - 1]
          </div>
          <p>
            Where:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>P:</strong> Principal Loan Amount</li>
            <li><strong>R:</strong> Monthly Interest Rate (Annual Rate / 12 / 100)</li>
            <li><strong>N:</strong> Number of monthly installments (Tenure in Years x 12)</li>
          </ul>
        </div>
      ),
    },
    {
      question: "What are the benefits of making loan prepayments?",
      answer: (
        <div className="space-y-3">
          <p>
            Prepayments involve paying extra money towards your principal loan amount over and above your regular EMIs.
            Since interest is calculated on the remaining principal balance, prepayments immediately reduce the principal,
            saving you substantial interest costs over the life of the loan.
          </p>
          <p>
            You can choose to either:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Keep tenure same:</strong> Your monthly EMI will drop, giving you more monthly cash flow.</li>
            <li><strong>Reduce tenure (Recommended):</strong> Your monthly EMI remains the same, but the loan tenure is cut short, saving you the maximum amount of interest. Our calculator automatically assumes tenure reduction for maximum savings.</li>
          </ul>
        </div>
      ),
    },
    {
      question: "How do interest rate hikes affect my loan tenure and interest?",
      answer: (
        <div className="space-y-3">
          <p>
            For floating-rate loans (common in Home Loans), when the central bank hikes interest rates, banks adjust your loan.
            By default, banks usually **increase the tenure** rather than increasing the monthly EMI, so that you don't feel
            immediate monthly cash flow stress.
          </p>
          <p>
            However, this quiet extension can add years to your loan and cost you millions in extra interest. Our calculator
            allows you to simulate past or future interest rate changes to see the exact impact on your loan summary and graph.
          </p>
        </div>
      ),
    },
    {
      question: "What is a 'Step-up EMI' and how does it help save interest?",
      answer: (
        <div className="space-y-3">
          <p>
            A <strong>Step-up EMI</strong> is a strategy where you voluntarily increase your monthly EMI by a small percentage
            (e.g., 5% or 10%) every year. This is highly effective because:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>It matches your annual salary hikes or business revenue growth.</li>
            <li>The extra amount goes directly towards principal repayment, compounding your savings.</li>
            <li>Increasing your EMI by just 5% every year can reduce a 20-year home loan to around 12-13 years!</li>
          </ul>
        </div>
      ),
    },
    {
      question: "How does the 'Smart EMI Planner' optimize my loan?",
      answer: (
        <div className="space-y-3">
          <p>
            Unlike traditional calculators that only show you static values, our **Smart EMI Planner** simulates real-world
            loan journeys. It lets you test complex combinations of:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Multiple one-off prepayments (like using your annual bonus or tax refund).</li>
            <li>Recurring monthly, quarterly, or yearly prepayments.</li>
            <li>Interest rate changes over time.</li>
            <li>Voluntary annual EMI step-ups.</li>
          </ul>
          <p>
            It aggregates all these parameters into a side-by-side comparison chart, showing you exactly how much money and how
            many years you've saved.
          </p>
        </div>
      ),
    },
    {
      question: "Does prepaying a loan have penalty fees?",
      answer: (
        <div className="space-y-3">
          <p>
            In India, the Reserve Bank of India (RBI) has mandated that banks and NBFCs cannot charge foreclosure or prepayment
            penalties on **floating-rate retail loans** (which includes home loans).
          </p>
          <p>
            For **fixed-rate loans** (often personal loans or car loans), lenders might charge a prepayment penalty (usually 2% to 4%
            of the prepaid amount). Be sure to check your loan agreement details.
          </p>
        </div>
      ),
    },
    {
      question: "Is my financial data safe on this website?",
      answer: (
        <div className="space-y-3">
          <p>
            Yes, 100%! All calculations are performed directly on your local device using client-side JavaScript.
            We do not store, log, or transmit any of your personal financial details to our servers. Your data never leaves your computer.
          </p>
        </div>
      ),
    },
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6">
      <Link
        to="/home-loan"
        className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Calculator
      </Link>

      <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-slate-200/80">
        <header className="mb-10 pb-8 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Frequently Asked Questions (FAQ)
            </h1>
          </div>
          <p className="text-slate-500 max-w-2xl">
            Have questions about loans, EMIs, prepayments, or how our calculator works? Find answers below.
          </p>
        </header>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <div
                key={index}
                className={`border rounded-2xl transition-all duration-300 ${
                  isOpen ? "border-emerald-500/30 bg-slate-50/30" : "border-slate-200 bg-white"
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 hover:text-emerald-700 transition-colors"
                >
                  <span className="text-base sm:text-lg">{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="p-5 pt-0 border-t border-slate-100 text-slate-600 leading-relaxed text-sm font-medium">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
