import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Calculator from "./Calculator";
import BlogList from "./pages/BlogList";
import BlogPost from "./pages/BlogPost";
import { BookOpen, Calculator as CalcIcon } from "lucide-react";
import { cn } from "./lib/utils";

function GlobalHeader() {
  const location = useLocation();
  const isCalc = location.pathname === "/";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3 sm:px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/favicon.png"
            alt="Smart EMI Planner Logo"
            className="w-8 h-8 rounded-lg shadow-sm border border-slate-100 group-hover:shadow-md transition-shadow"
          />
          <span className="font-bold text-slate-800 text-lg hidden sm:block tracking-tight">
            Smart EMI Planner
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2 bg-slate-100/50 p-1 rounded-xl">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
              isCalc
                ? "bg-white text-emerald-700 shadow-sm border border-slate-200/60"
                : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50",
            )}
          >
            <CalcIcon className="w-4 h-4" />
            Calculator
          </Link>
          <Link
            to="/blog"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
              !isCalc
                ? "bg-white text-emerald-700 shadow-sm border border-slate-200/60"
                : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50",
            )}
          >
            <BookOpen className="w-4 h-4" />
            Learn & Blog
          </Link>
          <a
            href="https://omegaalphatech.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 text-white hover:bg-slate-800 rounded-lg text-sm font-bold shadow-sm transition-all ml-2"
          >
            Hire Our Tech Agency
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
          <Route path="/" element={<Calculator />} />
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
