import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  GraduationCap,
  Globe2,
  Calculator,
  Search,
  X,
  Share2,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

interface FaqItem {
  id: string;
  category:
    | "Calculations"
    | "Education Loans"
    | "International Markets"
    | "Features & Sharing";
  question: string;
  answer: React.ReactNode;
}

export default function FAQ() {
  useDocumentMeta({
    title: "FAQ | Smart EMI Planner",
    description:
      "Frequently Asked Questions about Smart EMI Planner calculator features, math formulas, prepayments, moratorium simulation, and international currency tools.",
  });

  const faqs: FaqItem[] = [
    // --- Calculations & Math ---
    {
      id: "emi-formula",
      category: "Calculations",
      question: "What is an EMI and how is it calculated?",
      answer: (
        <div className="space-y-3">
          <p>
            An <strong>Equated Monthly Installment (EMI)</strong> is simply the
            fixed payment you make to your bank or lender on the same day every
            month until your loan is fully paid off.
          </p>
          <p>Every installment is split into two parts:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Principal:</strong> The actual money you borrowed that
              goes toward clearing your debt.
            </li>
            <li>
              <strong>Interest:</strong> The lender's fee for borrowing that
              money, calculated on whatever loan balance you still owe.
            </li>
          </ul>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-900 mt-2">
            <p className="font-semibold mb-1">
              💡 How to calculate your EMI on this site:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-xs text-emerald-800">
              <li>
                Select your loan type (Home, Car, Personal, or Education) using
                the top tabs.
              </li>
              <li>
                Enter your <strong>Loan Amount</strong> using the slider or type
                the amount directly into the input box.
              </li>
              <li>
                Adjust your <strong>Interest Rate (%)</strong> and{" "}
                <strong>Loan Tenure</strong> (years or months).
              </li>
              <li>
                Your monthly payment and complete interest breakdown update
                automatically on the right!
              </li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: "prepayment-benefits",
      category: "Calculations",
      question: "What are the benefits of making loan prepayments?",
      answer: (
        <div className="space-y-3">
          <p>
            A <strong>prepayment</strong> simply means paying extra money
            directly toward your loan whenever you have spare cash—like a
            year-end bonus, tax refund, or savings.
          </p>
          <p>
            Because banks charge interest on your remaining loan balance, every
            extra dollar or rupee you pay immediately cuts down that balance.
            That stops future interest from building up and can save you
            thousands or lakhs over the life of your loan!
          </p>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-900 mt-2">
            <p className="font-semibold mb-1">
              💡 How to test prepayments in the calculator:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-xs text-emerald-800">
              <li>
                Scroll down to the <strong>Prepayments & Extra Payments</strong>{" "}
                card.
              </li>
              <li>
                Click <strong>+ Add Prepayment</strong>.
              </li>
              <li>
                Choose <strong>One-Time</strong> (for a lump sum) or{" "}
                <strong>Recurring</strong> (e.g., extra every month or year).
              </li>
              <li>
                Pick your goal:
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  <li>
                    <strong>Reduce Tenure (Recommended):</strong> Keeps your
                    monthly payment the same, but cuts months or years off your
                    loan for maximum interest savings.
                  </li>
                  <li>
                    <strong>Keep Tenure Same:</strong> Keeps your loan end date
                    the same, but lowers your future monthly payment to ease
                    your monthly budget.
                  </li>
                </ul>
              </li>
              <li>
                Look at the green <strong>Interest Saved</strong> counter to see
                your exact savings!
              </li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: "rate-hikes-impact",
      category: "Calculations",
      question:
        "How do interest rate hikes affect my loan tenure and interest?",
      answer: (
        <div className="space-y-3">
          <p>
            If you have a floating or variable-rate loan, your interest rate
            changes whenever central banks update benchmark rates.
          </p>
          <p>
            Most banks don't raise your monthly EMI right away so you don't face
            sudden payment shock. Instead, they quietly{" "}
            <strong>add extra months or years to your loan</strong> behind the
            scenes. This means you could end up paying for a 20-year loan for 24
            years without realizing it!
          </p>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-900 mt-2">
            <p className="font-semibold mb-1">
              💡 How to test rate changes in the calculator:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-xs text-emerald-800">
              <li>
                Scroll to the <strong>Interest Rate Changes</strong> section.
              </li>
              <li>
                Click <strong>+ Add Rate Change</strong>.
              </li>
              <li>
                Enter the month or year when you expect the rate to go up (or
                down), and type the new rate.
              </li>
              <li>
                The calculator will immediately show you how many extra months
                get added and how much more interest you'll owe.
              </li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: "step-up-emi",
      category: "Calculations",
      question: "What is a 'Step-up EMI' and how does it help save interest?",
      answer: (
        <div className="space-y-3">
          <p>
            As your career grows, your salary or business earnings usually
            increase each year. A <strong>Step-up EMI</strong> means you plan to
            increase your monthly loan payment by a small, manageable percentage
            (like 5% or 10%) every year to match your salary hikes.
          </p>
          <p>
            Because your standard EMI already covers the required interest, 100%
            of this extra increase goes straight toward wiping out your loan
            balance. Stepping up your payment by just 5% a year can help you
            clear a 20-year loan in just 12 to 13 years!
          </p>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-900 mt-2">
            <p className="font-semibold mb-1">
              💡 How to use Step-up EMI in the calculator:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-xs text-emerald-800">
              <li>
                Find the <strong>Step-up EMI</strong> toggle under Loan Options.
              </li>
              <li>
                Turn it on and choose your annual percentage increase (e.g., 5%
                or 10%).
              </li>
              <li>
                Check the repayment schedule chart to see how many years you
                shave off your loan!
              </li>
            </ol>
          </div>
        </div>
      ),
    },

    // --- Education Loans & Moratorium ---
    {
      id: "education-moratorium",
      category: "Education Loans",
      question: "How does an Education Loan Moratorium Period work?",
      answer: (
        <div className="space-y-3">
          <p>
            An <strong>Education Loan Moratorium Period</strong> (often called a
            study break or grace period) is a payment holiday where you don't
            have to start paying full monthly EMIs while you are still studying.
          </p>
          <p>It is made up of two parts:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Course Duration:</strong> The years you are actively
              studying in college (e.g., 2 years for a Master's degree, 4 years
              for Undergrad).
            </li>
            <li>
              <strong>Grace Period:</strong> An extra buffer after graduation
              (typically 6 to 12 months) so you have time to find a job before
              full loan payments begin.
            </li>
          </ul>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-900 mt-2">
            <p className="font-semibold mb-1">
              💡 How to simulate an education loan:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-xs text-emerald-800">
              <li>
                Click the <strong>Education Loan</strong> tab at the top.
              </li>
              <li>
                Set your <strong>Course Duration</strong> and{" "}
                <strong>Grace Period</strong> using the sliders.
              </li>
              <li>
                Choose whether you want to pay simple interest during college or
                defer everything.
              </li>
              <li>
                Read our complete guide on{" "}
                <Link
                  to="/blog/education-loan-moratorium-tax-guide"
                  className="text-emerald-700 font-bold underline inline-flex items-center gap-1"
                >
                  Education Loan Moratorium & Tax Benefits{" "}
                  <BookOpen className="w-3 h-3 inline" />
                </Link>{" "}
                to learn how to avoid common interest traps.
              </li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: "simple-vs-compound",
      category: "Education Loans",
      question:
        "What is the difference between Simple Interest (SI) and Compound Interest during the study period?",
      answer: (
        <div className="space-y-3">
          <p>
            Even though you aren't required to pay full EMIs while studying, the
            bank still calculates interest from day one. What happens to that
            interest depends on what you do during college:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Pay Simple Interest (Recommended):</strong> You pay only
              the small monthly interest while studying. This keeps your loan
              from growing, so when you graduate, your loan balance is still
              just the amount you borrowed.
            </li>
            <li>
              <strong>No Payment (Interest Capitalization):</strong> If you pay
              zero while in school, the bank adds all that accumulated interest
              on top of your loan amount when you graduate. You end up paying
              interest on interest!
            </li>
            <li>
              <strong>Partial Payment:</strong> You can pay whatever modest
              amount fits your student budget (even $50 or ₹2,000 a month) to
              keep interest in check.
            </li>
          </ul>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-900 mt-2">
            <p className="font-semibold mb-1">
              💡 How to compare these options:
            </p>
            <p className="text-xs text-emerald-800">
              In the Education Loan calculator under{" "}
              <strong>Moratorium Payment Option</strong>, switch between{" "}
              <strong>Pay Simple Interest</strong>, <strong>No Payment</strong>,
              and <strong>Partial Payment</strong> to see how each choice
              changes your future monthly EMI.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "bank-concession",
      category: "Education Loans",
      question:
        "What is the interest rate concession offered by banks on education loans?",
      answer: (
        <div className="space-y-3">
          <p>
            Many banks and lenders give borrowers an interest rate discount
            (usually <strong>0.25% to 1.00% off</strong>) if you service the
            simple interest monthly during college or set up auto-pay. Many
            banks also provide special discounts for women students.
          </p>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-900 mt-2">
            <p className="font-semibold mb-1">💡 How to apply this discount:</p>
            <p className="text-xs text-emerald-800">
              Check the <strong>"Bank Concession"</strong> box in the Education
              Loan calculator. The calculator will immediately apply the
              discount and show you your lower monthly installment and total
              savings.
            </p>
          </div>
        </div>
      ),
    },

    // --- International Markets ---
    {
      id: "international-currencies",
      category: "International Markets",
      question:
        "Does Smart EMI Planner support international loans across the USA, UK, Europe, Australia, and India?",
      answer: (
        <div className="space-y-3">
          <p>
            Yes! Smart EMI Planner works seamlessly whether you are planning a
            mortgage in the US or UK, a home loan in India, or financing in
            Europe or Australia.
          </p>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-900 mt-2">
            <p className="font-semibold mb-1">
              💡 How to switch currency and country:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-xs text-emerald-800">
              <li>
                Click the <strong>Currency</strong> dropdown in the Loan
                Parameters card.
              </li>
              <li>
                Choose your region:
                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                  <li>
                    <strong>India, New Delhi (INR ₹):</strong> Formatted in
                    Lakhs (L) and Crores (Cr).
                  </li>
                  <li>
                    <strong>USA, Washington D.C. (USD $):</strong> Formatted in
                    Thousands ($K) and Millions ($M).
                  </li>
                  <li>
                    <strong>UK, London (GBP £):</strong> Formatted with British
                    Pound (£) standards.
                  </li>
                  <li>
                    <strong>Europe, Berlin (EUR €):</strong> Formatted with Euro
                    (€) standards.
                  </li>
                  <li>
                    <strong>Australia, Canberra (AUD A$):</strong> Formatted
                    with Australian Dollar (A$) standards.
                  </li>
                  <li>
                    <strong>Canada, Ottawa (CAD C$):</strong> Formatted with
                    Canadian Dollar (C$) standards.
                  </li>
                  <li>
                    <strong>Denmark, Copenhagen (DKK kr):</strong> Formatted with
                    Danish Krone (kr) and regional Fradrag rules.
                  </li>
                  <li>
                    <strong>South Africa, Pretoria (ZAR R):</strong> Formatted with
                    South African Rand (R) and SARS tax guidelines.
                  </li>
                  <li>
                    <strong>Brazil, Brasília (BRL R$):</strong> Formatted with
                    Brazilian Real (R$) and FGTS/SFH regulations.
                  </li>
                  <li>
                    <strong>China, Beijing (CNY ¥):</strong> Formatted with
                    Chinese Yuan (¥) and special IIT deductions.
                  </li>
                </ul>
              </li>
              <li>
                All numbers, upfront costs, and charts update immediately
                without losing what you typed!
              </li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: "upfront-costs-calc",
      category: "International Markets",
      question: "How does the Upfront Costs & Down Payment estimator work?",
      answer: (
        <div className="space-y-3">
          <p>
            When buying a home or car, taking out a loan is only one part of the
            equation. You also need cash ready on day one for down payments,
            registration, stamp duty, or processing fees.
          </p>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-900 mt-2">
            <p className="font-semibold mb-1">
              💡 How to use the upfront costs estimator:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-xs text-emerald-800">
              <li>
                Scroll down to the <strong>Upfront Costs Estimator</strong>{" "}
                card.
              </li>
              <li>Enter your total property or vehicle purchase price.</li>
              <li>
                Adjust the down payment percentage slider to what you can
                comfortably pay.
              </li>
              <li>
                The tool calculates the exact cash you need in hand on day one
                before the bank finances the rest!
              </li>
            </ol>
          </div>
        </div>
      ),
    },

    // --- Features, Sharing & Feedback ---
    {
      id: "smart-emi-planner",
      category: "Features & Sharing",
      question: "How does the 'Smart EMI Planner' optimize my loan?",
      answer: (
        <div className="space-y-3">
          <p>
            Standard bank calculators only tell you one thing: your monthly EMI.{" "}
            <strong>Smart EMI Planner</strong> is an all-in-one simulator that
            helps you test "what-if" scenarios to pay off your loan faster and
            save real money:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              See what happens if you pay a lump sum using your annual work
              bonus.
            </li>
            <li>
              Simulate how adding just 5% or 10% more to your EMI each year
              saves years of debt.
            </li>
            <li>
              Test what happens to your budget if interest rates rise in the
              future.
            </li>
            <li>
              Compare paying simple interest during college versus letting
              interest pile up.
            </li>
          </ul>
          <p className="text-xs text-slate-500">
            Experiment with the sliders and toggles to find the easiest, most
            affordable repayment plan for your budget.
          </p>
        </div>
      ),
    },
    {
      id: "share-calculation",
      category: "Features & Sharing",
      question: "How does the 'Share Calculation' feature work?",
      answer: (
        <div className="space-y-3">
          <p>
            Want to share your loan calculation with your spouse, co-borrower,
            financial advisor, or bank manager? You don't need to take
            screenshots or write down numbers.
          </p>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-sm text-emerald-900 mt-2">
            <p className="font-semibold mb-1">
              💡 How to share your calculation:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-xs text-emerald-800">
              <li>
                Customize your loan parameters, prepayments, or education loan
                options.
              </li>
              <li>
                Click the <strong>Share</strong> button (with the share icon) at
                the top right of the calculator.
              </li>
              <li>A direct link is copied to your clipboard.</li>
              <li>
                When anyone opens that link, the exact same numbers,
                prepayments, and charts open on their screen—no account or login
                required!
              </li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: "data-safety",
      category: "Features & Sharing",
      question: "Is my financial data safe on this website?",
      answer: (
        <div className="space-y-3">
          <p>
            <strong>Yes, 100%!</strong> All calculations happen entirely inside
            your web browser on your device.
          </p>
          <p>
            We do not ask for your name, phone number, email address, or banking
            credentials. None of your numbers or calculations are ever uploaded
            to or stored on any server. Your financial planning stays completely
            private.
          </p>
        </div>
      ),
    },
    {
      id: "feedback-and-bug-report",
      category: "Features & Sharing",
      question: "How can I request a new feature or report a bug?",
      answer: (
        <div className="space-y-3">
          <p>
            We build and update Smart EMI Planner based on what our users need!
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Have a feature idea?</strong> If you want support for a
              new country, a specific loan type, or new chart tools, we'd love
              to add it.
            </li>
            <li>
              <strong>Found a bug?</strong> If something looks misaligned on
              your phone or a number looks off, let us know and we'll fix it
              right away.
            </li>
          </ul>
          <p>
            You can reach out anytime by clicking the{" "}
            <strong>Request a Feature</strong> button in the navigation bar or
            by visiting our{" "}
            <a
              href="https://www.omegaalphatech.com/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 font-bold hover:underline"
            >
              Contact & Feedback Portal
            </a>
            .
          </p>
        </div>
      ),
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const categories = [
    "All",
    "Calculations",
    "Education Loans",
    "International Markets",
    "Features & Sharing",
  ];

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return faqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === "All" || faq.category === selectedCategory;
      const matchesQuery =
        !query ||
        faq.question.toLowerCase().includes(query) ||
        (typeof faq.answer === "string" &&
          faq.answer.toLowerCase().includes(query));
      return matchesCategory && matchesQuery;
    });
  }, [faqs, selectedCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6">
      <Link
        to="/home-loan"
        className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Calculator
      </Link>

      <div className="bg-white p-6 sm:p-12 rounded-3xl shadow-sm border border-slate-200/80 space-y-8">
        <header className="pb-6 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Frequently Asked Questions (FAQ)
            </h1>
          </div>
          <p className="text-slate-500 max-w-2xl text-sm sm:text-base leading-relaxed">
            Everything you need to know about our calculator features,
            mathematical formulas, prepayments, education moratorium
            simulations, and multi-currency tools.
          </p>

          {/* Search & Category Filter */}
          <div className="mt-8 space-y-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                aria-label="Search FAQs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQs by feature, formula, or keyword (e.g. 'Moratorium', 'Prepayment', 'Share', 'Formula')..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear FAQ search"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
              <span className="text-slate-400 uppercase tracking-wider text-[11px] mr-1 hidden sm:inline">
                Topic:
              </span>
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full transition-all text-nowrap cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                    }`}
                  >
                    {cat === "Education Loans" && (
                      <GraduationCap className="w-3.5 h-3.5" />
                    )}
                    {cat === "International Markets" && (
                      <Globe2 className="w-3.5 h-3.5" />
                    )}
                    {cat === "Calculations" && (
                      <Calculator className="w-3.5 h-3.5" />
                    )}
                    {cat === "Features & Sharing" && (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* FAQs Accordion */}
        <div className="space-y-4">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-3">
              <p className="text-slate-700 font-bold">No questions found</p>
              <p className="text-xs text-slate-500">
                No FAQs match your search query "{searchQuery}". Try different
                keywords.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = activeId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`border rounded-2xl transition-all duration-300 ${
                    isOpen
                      ? "border-emerald-500/30 bg-slate-50/30"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-800 hover:text-emerald-700 transition-colors gap-4"
                  >
                    <span className="text-base sm:text-lg leading-snug">
                      {faq.question}
                    </span>
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
            })
          )}
        </div>
      </div>
    </div>
  );
}
