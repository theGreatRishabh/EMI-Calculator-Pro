import React, { Suspense, lazy } from "react";
import {
  Routes,
  Route,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Calculator from "./Calculator";

// Lazy-load non-critical routes to optimize initial bundle, reduce TBT & unused JS
const BlogList = lazy(() => import("./pages/BlogList"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const FAQ = lazy(() => import("./pages/FAQ"));
import {
  BookOpen,
  Calculator as CalcIcon,
  Home,
  Car,
  User,
  GraduationCap,
  Maximize2,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "./lib/utils";
import ExtensionPopup from "./components/ExtensionPopup";
import { trackPageView, trackClick } from "./lib/analytics";

const LOAN_ROUTES = [
  { path: "/home-loan", label: "Home", icon: Home, type: "HOME" },
  { path: "/car-loan", label: "Car", icon: Car, type: "CAR" },
  { path: "/personal-loan", label: "Personal", icon: User, type: "PERSONAL" },
  {
    path: "/education-loan",
    label: "Education",
    icon: GraduationCap,
    type: "EDUCATION",
  },
];

function GlobalHeader() {
  const location = useLocation();
  const isBlog = location.pathname.startsWith("/blog");
  const isCalc = !isBlog;

  // Detect which loan route is active
  const activeLoanRoute =
    LOAN_ROUTES.find((r) => location.pathname === r.path) ?? LOAN_ROUTES[0]; // default highlight to Home Loan on "/"

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 py-3 sm:px-6 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          to="/home-loan"
          aria-label="Smart EMI Planner Home"
          className="flex items-center gap-3 group"
        >
          <img
            src="/favicon.png"
            alt="Smart EMI Planner Logo"
            width="32"
            height="32"
            className="w-8 h-8 rounded-lg shadow-sm border border-slate-100 group-hover:shadow-md transition-shadow"
          />
          <span className="font-bold text-slate-800 text-lg hidden sm:block tracking-tight">
            Smart EMI Planner
          </span>
        </Link>
        <nav className="relative flex items-center gap-1 sm:gap-2 bg-slate-100/80 p-1 rounded-xl">
          {/* Loan type pills */}
          {LOAN_ROUTES.map((route) => {
            const isActive =
              location.pathname === route.path ||
              (location.pathname === "/" && route.type === "HOME");
            const Icon = route.icon;
            return (
              <Link
                key={route.path}
                to={route.path}
                aria-label={`${route.label} Loan Calculator`}
                onClick={() =>
                  trackClick("click_nav_loan_tab", "navigation", {
                    target_path: route.path,
                    loan_type: route.type,
                  })
                }
                className={cn(
                  "relative z-10 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-300",
                  isActive
                    ? "text-emerald-700"
                    : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50/50",
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
            aria-label="Insights Blog"
            onClick={() =>
              trackClick("click_nav_blog", "navigation", {
                target_path: "/blog",
              })
            }
            className={cn(
              "relative z-10 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-300",
              isBlog
                ? "text-emerald-700"
                : "text-slate-600 hover:text-emerald-600 hover:bg-slate-50/50",
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

          {typeof window !== "undefined" &&
            (window.location.protocol === "chrome-extension:" ||
              window.location.protocol === "ms-browser-extension:") && (
              <button
                type="button"
                onClick={() => {
                  trackClick("click_open_full_tab", "extension");
                  window.open(window.location.href, "_blank");
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:text-emerald-700 hover:bg-slate-50 transition-colors ml-1 cursor-pointer"
                title="Open in Full Tab"
                aria-label="Open in Full Tab"
              >
                <Maximize2 className="w-4 h-4" />
                <span className="hidden md:inline">Full Tab</span>
              </button>
            )}

          <a
            href="https://www.omegaalphatech.com/contact"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackClick("click_nav_request_feature", "navigation")
            }
            className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 text-white hover:bg-slate-800 rounded-lg text-sm font-bold shadow-sm transition-all ml-2"
          >
            Request a Feature
          </a>
        </nav>
      </div>
    </header>
  );
}

export function ScrollToTop() {
  const { pathname, search } = useLocation();

  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      typeof window.scrollTo === "function"
    ) {
      window.scrollTo(0, 0);
    }
    trackPageView(pathname + search);
  }, [pathname, search]);

  return null;
}

export default function App() {
  const isExtension =
    typeof window !== "undefined" &&
    (window.location.protocol === "chrome-extension:" ||
      window.location.protocol === "ms-browser-extension:");

  const isSmallWindow =
    typeof window !== "undefined" && window.innerWidth <= 550;
  const isExplicitFull =
    typeof window !== "undefined" &&
    (window.location.search.includes("view=full") ||
      window.location.hash.includes("view=full"));
  const isExplicitMini =
    typeof window !== "undefined" &&
    (window.location.hash.includes("/popup") ||
      window.location.search.includes("view=mini"));

  const [forceFullView, setForceFullView] = React.useState(false);

  const showMiniView =
    (isExtension && isSmallWindow && !isExplicitFull && !forceFullView) ||
    isExplicitMini;

  if (showMiniView) {
    return <ExtensionPopup onOpenFullApp={() => setForceFullView(true)} />;
  }

  const handleScrollToTop = () => {
    if (
      typeof window !== "undefined" &&
      typeof window.scrollTo === "function"
    ) {
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <ScrollToTop />
      <GlobalHeader />
      <main className="flex-1 pb-16">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[40vh]">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          }
        >
          <Routes>
            {/* Loan-type specific SEO URLs */}
            <Route
              path="/home-loan"
              element={<Calculator key="HOME" initialLoanType="HOME" />}
            />
            <Route
              path="/car-loan"
              element={<Calculator key="CAR" initialLoanType="CAR" />}
            />
            <Route
              path="/personal-loan"
              element={<Calculator key="PERSONAL" initialLoanType="PERSONAL" />}
            />
            <Route
              path="/education-loan"
              element={
                <Calculator key="EDUCATION" initialLoanType="EDUCATION" />
              }
            />
            {/* Legacy root — redirects to /home-loan via Calculator default */}
            <Route path="/" element={<Calculator initialLoanType="HOME" />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="/faq" element={<FAQ />} />
            <Route
              path="/popup"
              element={
                <ExtensionPopup onOpenFullApp={() => setForceFullView(true)} />
              }
            />
          </Routes>
        </Suspense>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link
              to="/home-loan"
              aria-label="Smart EMI Planner Home"
              onClick={handleScrollToTop}
              className="flex items-center gap-2 group w-fit"
            >
              <img
                src="/favicon.png"
                alt="Smart EMI Planner Logo"
                width="24"
                height="24"
                className="w-6 h-6 rounded"
              />
              <span className="font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
                Smart EMI Planner
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Advanced loan amortization calculators and planners. Simulate rate
              hikes, prepayments, and annual step-ups to save on interest.
            </p>
          </div>

          {/* Calculators Column */}
          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">
              Calculators
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/home-loan"
                  onClick={handleScrollToTop}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home Loan Calculator
                </Link>
              </li>
              <li>
                <Link
                  to="/car-loan"
                  onClick={handleScrollToTop}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Car Loan Calculator
                </Link>
              </li>
              <li>
                <Link
                  to="/personal-loan"
                  onClick={handleScrollToTop}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Personal Loan Calculator
                </Link>
              </li>
              <li>
                <Link
                  to="/education-loan"
                  onClick={handleScrollToTop}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Education Loan Calculator
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/blog"
                  onClick={handleScrollToTop}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Insights Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  onClick={handleScrollToTop}
                  className="hover:text-emerald-400 transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <a
                  href="https://www.omegaalphatech.com/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Request a Feature
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/privacy-policy"
                  onClick={handleScrollToTop}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/disclaimer"
                  onClick={handleScrollToTop}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Disclaimer
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-of-use"
                  onClick={handleScrollToTop}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 text-center text-xs space-y-2">
          <p>
            &copy; {new Date().getFullYear()} Smart EMI Planner. All rights
            reserved.
          </p>
          <p>
            Built with ❤️ by{" "}
            <a
              href="https://omegaalphatech.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
            >
              OmegaAlphaTech
            </a>
            . We build high-performance custom financial web applications.
          </p>
        </div>
      </footer>
    </div>
  );
}
