import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { useDocumentMeta } from "../../hooks/useDocumentMeta";

export default function PrepaymentStrategy() {
  useDocumentMeta({
    title: "Smart EMI Prepayment Strategies to Save Millions",
    description:
      "Small, strategic prepayments can shave years off your loan tenure. Learn the 5% rule and other proven strategies for faster debt freedom.",
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
            Financial Planning
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> February 10, 2026
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> 6 min read
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
          Smart EMI Prepayment Strategies to Save Millions
        </h1>
        <p className="text-xl text-slate-600 leading-relaxed">
          Prepaying a loan isn't just about dumping cash whenever you have it;
          it's a strategic math problem. Doing it right can save you decades of
          debt. Let's look at the optimal strategies.
        </p>
      </header>

      <div className="prose prose-slate prose-lg max-w-none text-slate-700">
        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">
          The Compounding Nature of Debt
        </h2>
        <p className="mb-6">
          Just as compound interest works <em>for</em> you in investing, it
          works <em>against</em> you in borrowing. In the early years of a
          20-year or 30-year loan, up to 80% of your EMI goes entirely toward
          paying the interest. Your principal barely moves.
        </p>
        <p className="mb-6">
          This makes the first 5 years of a loan the most critical timeframe.
          Any principal you can knock out early halts decades of compounding
          interest forming on that amount.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">
          Strategy 1: The One Extra EMI Rule
        </h2>
        <p className="mb-4">
          This is the simplest and most famous strategy. Instead of paying 12
          EMIs a year, configure your budget to pay 13.
        </p>
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>
            <strong>How to do it:</strong> Divide your monthly EMI by 12, and
            add that amount to every monthly payment. Alternatively, take your
            annual bonus and make a lump sum payment equivalent to one EMI.
          </li>
          <li>
            <strong>The Impact:</strong> For a 20-year home loan at 9%, making
            just one extra EMI per year can drop your total tenure to under 16
            years.
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">
          Strategy 2: The 5% Annual Increase
        </h2>
        <p className="mb-6">
          Assuming your salary will increase annually to beat inflation, your
          EMI should increase as well. If you increase your EMI payout by just
          5% every year, the results are staggering.
        </p>
        <p className="mb-6">
          If your EMI is ₹50,000 this year, bump it up to ₹52,500 next year (a
          simple ₹2,500 increase). A 20-year loan will be cleared in just over
          12 years if you consistently apply a 5% step-up.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">
          Strategy 3: Bonus Dumping
        </h2>
        <p className="mb-6">
          If your job yields an annual performance bonus or stock payout, commit
          to putting 50% of the net bonus toward your loan principal immediately
          upon receiving it. Let the remaining 50% go toward your lifestyle or
          investments.
        </p>

        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl mb-8">
          <strong className="text-emerald-800 block mb-2">
            🎯 Reduce Tenure vs. Reduce EMI?
          </strong>
          <span className="text-emerald-700">
            When you make a prepayment, your bank will usually offer two
            options: lower your monthly EMI, or shorten your loan tenure.{" "}
            <strong>Always choose to shorten the tenure</strong> if you want to
            save the most interest. Lowering the EMI feels nice monthly, but
            strings the interest out over a longer period.
          </span>
        </div>

        <hr className="my-10 border-slate-200" />

        <h3 className="text-xl font-bold text-slate-900 mb-4">
          Simulate Your Strategy
        </h3>
        <p className="mb-8">
          Every loan is different. Use our advanced calculator to stack these
          strategies together. You can add one-time annual bonuses and recurring
          step-up prepayments into our <strong>Smart EMI Planner</strong> to see
          your exact payoff date.
        </p>

        <div className="mt-8 text-center bg-slate-50 p-8 rounded-2xl border border-slate-200">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Open Advanced Planner
          </Link>
        </div>
      </div>
    </article>
  );
}
