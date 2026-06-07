import React from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import Calculator from "./Calculator";
import BlogList from "./pages/BlogList";
import BlogPost from "./pages/BlogPost";
import { BookOpen, Calculator as CalcIcon, Home, Car, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "./lib/utils";

const LOAN_ROUTES = [
  { path: "/home-loan", label: "Home", icon: Home, type: "HOME" },
  { path: "/car-loan",  label: "Car",  icon: Car,  type: "CAR" },
  { path: "/personal-loan", label: "Personal", icon: User, type: "PERSONAL" },
];

function GlobalHeader() {
  const location = useLocation();
  const isBlog = location.pathname.startsWith("/blog");
  const isCalc = !isBlog;

  // Detect which loan route is active
  const activeLoanRoute = LOAN_ROUTES.find(r => location.pathname === r.path)
    ?? LOAN_ROUTES[0]; // default highlight to Home Loan on "/"

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3 sm:px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/home-loan" className="flex items-center gap-3 group">
          <img
            src="/favicon.png"
            alt="Smart EMI Planner Logo"
            className="w-8 h-8 rounded-lg shadow-sm border border-slate-100 group-hover:shadow-md transition-shadow"
          />
          <span className="font-bold text-slate-800 text-lg hidden sm:block tracking-tight">
            Smart EMI Planner
          </span>
        </Link>
        <nav className="relative flex items-center gap-1 sm:gap-2 bg-slate-100/80 p-1 rounded-xl">
          {/* Loan type pills */}
          {LOAN_ROUTES.map((route) => {
            const isActive = location.pathname === route.path
              || (location.pathname === "/" && route.type === "HOME");
            const Icon = route.icon;
            return (
              <Link
                key={route.path}
                to={route.path}
                className={cn(
                  "relative z-10 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-300",
                  isActive ? "text-emerald-700" : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/60 -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{route.label}</span>
              </Link>
            );
          })}

          {/* Blog pill */}
          <Link
            to="/blog"
            className={cn(
              "relative z-10 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-300",
              isBlog ? "text-emerald-700" : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50/50"
            )}
          >
            {isBlog && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/60 -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Blog</span>
          </Link>

          <a
            href="https://www.omegaalphatech.com/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 text-white hover:bg-slate-800 rounded-lg text-sm font-bold shadow-sm transition-all ml-2"
          >
            Request a Feature
          </a>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <GlobalHeader />
      <main className="flex-1 pb-16">
        <Routes>
          {/* Loan-type specific SEO URLs */}
          <Route path="/home-loan" element={<Calculator key="HOME" initialLoanType="HOME" />} />
          <Route path="/car-loan"  element={<Calculator key="CAR" initialLoanType="CAR" />} />
          <Route path="/personal-loan" element={<Calculator key="PERSONAL" initialLoanType="PERSONAL" />} />
          {/* Legacy root — redirects to /home-loan via Calculator default */}
          <Route path="/" element={<Calculator initialLoanType="HOME" />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-4 text-center text-xs font-medium border-t border-slate-800 sticky bottom-0 z-40">
        Built with ❤️ by{" "}
        <a
          href="https://omegaalphatech.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
        >
          OmegaAlphaTech
        </a>
        . Need a custom financial app for your business? We build
        high-performance web tools.
      </footer>
    </div>
  );
}
