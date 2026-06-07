import React from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Database, ArrowLeft } from "lucide-react";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function PrivacyPolicy() {
  useDocumentMeta({
    title: "Privacy Policy | Smart EMI Planner",
    description: "Read our privacy policy. Learn how we handle your data securely and why all calculations are performed locally in your browser.",
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
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Privacy Policy
            </h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            Last Updated: June 7, 2026
          </p>
        </header>

        <div className="prose prose-slate prose-emerald max-w-none text-slate-600 space-y-8 font-medium">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              1. 100% Client-Side Calculations (Zero Data Collection)
            </h2>
            <p className="leading-relaxed">
              At <strong>Smart EMI Planner</strong>, we value your privacy above everything else.
              We believe your financial planning is your personal business. Consequently, all
              loan calculations, prepayment simulations, interest rate changes, and optimizations
              are processed <strong>entirely inside your web browser</strong> using client-side JavaScript.
            </p>
            <p className="leading-relaxed">
              None of the financial inputs you enter (such as your loan amount, interest rate,
              property value, or tenure) are transmitted to or stored on our servers.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              2. Local Storage and Sharing Features
            </h2>
            <p className="leading-relaxed">
              To improve your user experience, we utilize:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Browser Local Storage:</strong> The calculator saves your latest inputs locally in
                your own browser's storage (`localStorage`) so that when you reload the page, you don't
                have to re-enter your parameters. You can clear this data at any time by clearing your
                browser's cache.
              </li>
              <li>
                <strong>Share URL Generation:</strong> When you click the "Share" button, the app encodes your
                current inputs directly into the URL query parameters. This allows you to copy and share the link
                or bookmark it to return to your calculations. We do not store these shared links on our backend.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              3. Analytics & Third-Party Cookies
            </h2>
            <p className="leading-relaxed">
              We may use privacy-centric website analytics (such as Google Analytics) to monitor website traffic,
              page load speeds, and user interactions to help improve our tools. These services collect anonymous
              aggregate data like browser types, screen resolutions, and general geographic locations. They do not
              access or capture any values you enter in the calculator.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              4. External Links
            </h2>
            <p className="leading-relaxed">
              Our website contains links to other websites (for example, our development company
              OmegaAlphaTech's site). We are not responsible for the privacy practices or content
              of external websites. We encourage you to read the privacy policies of any site you visit.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              5. Updates to this Policy
            </h2>
            <p className="leading-relaxed">
              We may update our Privacy Policy from time to time. Any changes will be posted on this page with the
              updated revision date.
            </p>
          </section>

          <section className="space-y-4 pt-6 border-t border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">
              Contact Us
            </h2>
            <p className="leading-relaxed">
              If you have any questions or feedback about our privacy practices, feel free to contact us through
              our parent agency website at{" "}
              <a
                href="https://www.omegaalphatech.com/contact"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 font-bold"
              >
                OmegaAlphaTech Contact
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
