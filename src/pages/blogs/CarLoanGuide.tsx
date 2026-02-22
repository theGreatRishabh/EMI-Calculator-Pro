import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";

export default function CarLoanGuide() {
  useDocumentMeta({
    title: "Car Loan Prepayment: When Does It Make Sense?",
    description:
      "Is it worth paying off your car loan early? We break down the math behind car loan prepayments and how to maximize your savings.",
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
            Auto Loans
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> February 15, 2026
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> 4 min read
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
          Car Loan Prepayment: When Does It Make Sense?
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          Car loans come with higher interest rates compared to home loans, yet
          the vehicles depreciate quickly. Is it always a good idea to pay off
          the loan early? Let's analyze.
        </p>
      </header>

      <div className="prose prose-slate prose-lg max-w-none text-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">
          The Truth About Car Depreciation
        </h2>
        <p className="mb-6">
          Unlike a house, which normally appreciates in value over time, a car
          depreciates rapidly. As soon as you drive a new car off the lot, it
          loses around 10% of its value. By the end of the first year, it may
          have lost 20%, and after five years, it could be worth only 40% of
          what you paid for it.
        </p>
        <p className="mb-6">
          If you take a 7-year car loan, you might eventually owe more than the
          car is worth (being "underwater" on your loan). This makes fast
          repayment highly desirable.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">
          Should You Prepay Your Car Loan?
        </h2>
        <p className="mb-4">
          The quick answer is: <strong>Usually, yes.</strong> Because auto loans
          have relatively high interest rates (often 8% to 15%), prepaying
          yields a guaranteed "return" equal to that interest rate.
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>
            <strong>Higher Interest Relief:</strong> Auto loans aren't
            tax-deductible (unless for business), so there's no reason to hold
            onto the debt.
          </li>
          <li>
            <strong>Better Cash Flow:</strong> Eliminating a car payment frees
            up hundreds of dollars/rupees per month.
          </li>
          <li>
            <strong>Avoiding Negative Equity:</strong> By paying down the
            principal quickly, you ensure you can always sell the car for more
            than you owe.
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">
          Beware of Prepayment Penalties
        </h2>
        <p className="mb-6">
          Before you write a large check to your lender, check your loan
          agreement for a prepayment penalty or an early closure fee. Some banks
          charge 1% to 3% of the outstanding loan amount if you pay it off early
          within the first year or two.
        </p>
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl mb-8">
          <strong className="text-amber-800 block mb-2">
            ⚠️ Warning: Rule of 78
          </strong>
          <span className="text-amber-900">
            Some older or private loans use the "Rule of 78," front-loading the
            interest so heavily that prepaying in the later years offers almost
            no savings. Always ask your bank if interest is calculated on a
            daily/monthly reducing balance.
          </span>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">
          When NOT to Prepay?
        </h2>
        <p className="mb-6">
          If you secured a promotional 0% or extremely low interest rate (e.g.,
          2% to 4%) from the manufacturer, there is no financial benefit to
          paying the loan off early. You are better off investing that extra
          cash into a high-yield savings account or the stock market, where it
          can earn 5%+ returns.
        </p>

        <hr className="my-10 border-slate-200" />

        <h3 className="text-xl font-bold text-slate-900 mb-4">
          Calculate Your Savings
        </h3>
        <p className="mb-8">
          Wondering how much you could save by adding just ₹5,000 extra to your
          car EMI every month? Stop guessing and use a dedicated tool.
        </p>

        <div className="mt-8 text-center bg-slate-50 p-8 rounded-2xl border border-slate-200">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Calculate Auto Loan Prepayment
          </Link>
        </div>
      </div>
    </article>
  );
}
