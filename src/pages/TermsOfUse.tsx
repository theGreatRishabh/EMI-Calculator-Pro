import React from "react";
import { Link } from "react-router-dom";
import { FileCheck, Scale, Globe, ArrowLeft } from "lucide-react";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function TermsOfUse() {
  useDocumentMeta({
    title: "Terms of Use | Smart EMI Planner",
    description:
      "Read our terms of use. Learn about the rules, usage guidelines, and intellectual property rights governing Smart EMI Planner.",
  });

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
              <FileCheck className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Terms of Use
            </h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            Last Updated: June 7, 2026
          </p>
        </header>

        <div className="prose prose-slate prose-emerald max-w-none text-slate-600 space-y-8 font-medium">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              1. Acceptance of Terms
            </h2>
            <p className="leading-relaxed">
              By accessing and using the website{" "}
              <strong>Smart EMI Planner</strong> (available at
              `smartemiplanner.com`), you agree to comply with and be bound by
              these Terms of Use. If you do not agree to these terms, please
              refrain from using our website.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" />
              2. Permitted Use & Restrictions
            </h2>
            <p className="leading-relaxed">
              You are granted a personal, non-exclusive, non-transferable,
              revocable license to access and use our loan calculators for
              personal, non-commercial purposes.
            </p>
            <p className="leading-relaxed">You agree **NOT** to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the website for any illegal or unauthorized purpose.</li>
              <li>
                Scrape, crawl, or harvest data from the calculator pages using
                automated scripts.
              </li>
              <li>
                Attempt to disrupt or compromise the website's performance,
                layout, or security.
              </li>
              <li>
                Rebrand, frame, or sell the calculator tools as your own
                products without explicit written permission from
                OmegaAlphaTech.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              3. Intellectual Property Rights
            </h2>
            <p className="leading-relaxed">
              The proprietary loan optimization algorithms, layout designs, user
              interface graphics, codebases, custom sitemaps, and contents
              (including text and blog posts) are the intellectual property of
              **Smart EMI Planner** and its developers. You may not copy or
              redistribute any part of our design or code without permission.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              4. Limitation of Liability
            </h2>
            <p className="leading-relaxed">
              To the fullest extent permitted by law, Smart EMI Planner and its
              creators (OmegaAlphaTech) will not be liable for any direct,
              indirect, incidental, special, consequential, or punitive damages,
              including loss of profits, data, or money, resulting from your use
              of or inability to use the calculators or information on this
              website.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Governing Law</h2>
            <p className="leading-relaxed">
              These terms are governed by and construed in accordance with the
              laws of India. Any disputes arising out of the use of this website
              will be subject to the exclusive jurisdiction of the courts
              located in New Delhi, India.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
