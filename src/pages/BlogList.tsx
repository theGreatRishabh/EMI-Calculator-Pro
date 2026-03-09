import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Calendar, Clock, ArrowRight } from "lucide-react";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import blogPosts from "../blogMeta.json";

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

      {blogPosts.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
          <p className="text-slate-500">
            No blog posts found. Add markdown files to{" "}
            <code>public/content/blogs</code>.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {[...blogPosts]
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            )
            .map((post) => (
              <article
                key={post.slug}
                className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-200 transition-all group"
              >
                <div className="flex items-center flex-wrap gap-4 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
                  <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    {post.category || "Insights"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.date || new Date().toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime || "5 min read"}
                  </span>
                </div>

                <Link to={`/blog/${post.slug}`} className="block">
                  <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-slate-600 mb-6 leading-relaxed font-medium">
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700">
                    Read Article <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </article>
            ))}
        </div>
      )}
    </div>
  );
}
