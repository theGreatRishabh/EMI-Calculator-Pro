import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Calendar, Clock, ArrowRight } from "lucide-react";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const BLOG_POSTS = [
  {
    slug: "home-loan-emi-guide",
    title: "How to Plan Your Home Loan EMI: A Complete Guide",
    excerpt:
      "Discover the smart way to plan your home loan. Learn how tenure, interest rates, and prepayments affect your overall interest outgo.",
    date: "February 22, 2026",
    readTime: "5 min read",
    category: "Home Loans",
  },
  {
    slug: "car-loan-prepayment-savings",
    title: "Car Loan Prepayment: When Does It Make Sense?",
    excerpt:
      "Is it worth paying off your car loan early? We break down the math behind car loan prepayments and how to maximize your savings.",
    date: "February 15, 2026",
    readTime: "4 min read",
    category: "Auto Loans",
  },
  {
    slug: "smart-emi-prepayment-strategies",
    title: "Smart EMI Prepayment Strategies to Save Millions",
    excerpt:
      "Small, strategic prepayments can shave years off your loan tenure. Learn the 5% rule and other proven strategies for faster debt freedom.",
    date: "February 10, 2026",
    readTime: "6 min read",
    category: "Financial Planning",
  },
];

export default function BlogList() {
  useDocumentMeta({
    title: "EMI & Loan Management Blog | Smart EMI Planner",
    description:
      "Read our latest guides, tips, and strategies for managing your Home Loans, Car Loans, and Personal Loans effectively. Learn how to save money on interest.",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4 flex items-center justify-center gap-3">
          <BookOpen className="w-8 h-8 text-emerald-600" />
          Smart Loan Insights
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Expert advice, mathematical breakdowns, and actionable strategies to
          help you navigate loans and save money on interest.
        </p>
      </div>

      <div className="space-y-8">
        {BLOG_POSTS.map((post) => (
          <article
            key={post.slug}
            className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-200 transition-all group"
          >
            <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
              <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                {post.category}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {post.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime}
              </span>
            </div>

            <Link to={`/blog/${post.slug}`} className="block">
              <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">
                {post.title}
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {post.excerpt}
              </p>
              <span className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700">
                Read Article <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
