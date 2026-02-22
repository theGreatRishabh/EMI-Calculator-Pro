import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";

export default function HomeLoanGuide() {
  useDocumentMeta({
    title: "How to Plan Your Home Loan EMI: A Complete Guide",
    description:
      "Learn the smart way to plan your home loan. Understand how tenure, interest rates, and prepayments affect your overall interest outgo and save lakhs.",
  });

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 sm:px-6 bg-white min-h-screen">
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all articles
      </Link>

      <header className="mb-12">
        <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
          <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            Home Loans
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> February 22, 2026
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> 5 min read
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
          How to Plan Your Home Loan EMI: A Complete Guide
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          A home loan is often the largest financial commitment you will make.
          This guide breaks down exactly what you need to know to minimize your
          interest burden.
        </p>
      </header>

      <div className="prose prose-slate prose-lg max-w-none text-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">
          1. Understand the True Cost of Your Loan
        </h2>
        <p className="mb-6">
          When you borrow ₹50,000,000 for 20 years at a 9% interest rate, you
          don't just pay back the principal. By the end of the tenure, you will
          have paid nearly as much—or more—in interest as the original loan
          amount. Your total repayment might exceed ₹10,000,000.
        </p>
        <p className="mb-6">
          Understanding the Amortization Schedule (how your payments are split
          between principal and interest over time) is the first step in
          planning.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">
          2. The Impact of Loan Tenure
        </h2>
        <p className="mb-4">
          Many borrowers opt for a longer tenure (e.g., 25 or 30 years) to
          reduce their monthly EMI burden. While this makes the monthly budget
          easier to manage, it drastically increases the total interest paid.
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>
            <strong>Short Tenure:</strong> Higher EMI, much lower total
            interest.
          </li>
          <li>
            <strong>Long Tenure:</strong> Lower EMI, much higher total interest.
          </li>
        </ul>
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl mb-8">
          <strong className="text-emerald-800 block mb-2">💡 Pro Tip:</strong>
          <span className="text-emerald-700">
            Always choose the shortest tenure you can comfortably afford without
            compromising your emergency fund or daily expenses.
          </span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">
          3. The Power of Prepayments
        </h2>
        <p className="mb-6">
          The secret to beating a home loan is regular prepayments. Making just
          one extra EMI payment per year can shave off roughly 3-4 years from a
          20-year loan tenure. Because interest is charged on the outstanding
          principal balance every month, any amount paid extra goes directly to
          reducing the principal.
        </p>
        <p className="mb-6">
          You can use our{" "}
          <Link to="/" className="text-emerald-600 font-bold underline">
            Smart EMI Planner
          </Link>{" "}
          to simulate how periodic prepayments will drop your tenure and save
          you money.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">
          4. Floating vs. Fixed Interest Rates
        </h2>
        <p className="mb-6">
          In a high-interest-rate environment, locking into a fixed rate might
          seem attractive. However, historically in many regions, floating rates
          end up being cheaper over a 15-20 year horizon. When repo rates fall,
          your EMI or tenure will drop automatically.
        </p>

        <hr className="my-10 border-slate-200" />

        <h3 className="text-xl font-bold text-slate-900 mb-4">Conclusion</h3>
        <p className="mb-8">
          Planning your Home Loan EMI isn't a one-time setup; it's an ongoing
          process. Review your interest rates yearly, prepay your bonuses, and
          continually track your amortization schedule. Try running your numbers
          on our calculator today!
        </p>

        <div className="mt-8 text-center bg-slate-50 p-8 rounded-2xl border border-slate-200">
          <h4 className="text-lg font-bold text-slate-900 mb-2">
            Ready to plan your loan?
          </h4>
          <p className="text-slate-600 mb-6">
            Use our free Smart EMI Planner to visualize your savings.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Open Calculator
          </Link>
        </div>
      </div>
    </article>
  );
}
