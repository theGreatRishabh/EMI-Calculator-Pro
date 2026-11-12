import React, { useState, useEffect } from "react";
import { Cookie, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getStoredCookieConsent,
  updateCookieConsent,
  type CookieConsentChoice,
} from "../lib/analytics";

interface CookieConsentBannerProps {
  onConsentChange?: (choice: CookieConsentChoice) => void;
  /** Optional override for testing */
  forceShowForTesting?: boolean;
}

/**
 * EU, EEA, UK, and Swiss timezones without looking up user IP.
 * Uses browser's native Intl.DateTimeFormat().resolvedOptions().timeZone.
 */
const EU_EEA_UK_TIMEZONES = new Set([
  "Europe/Amsterdam",
  "Europe/Andorra",
  "Europe/Athens",
  "Europe/Belgrade",
  "Europe/Berlin",
  "Europe/Bratislava",
  "Europe/Brussels",
  "Europe/Bucharest",
  "Europe/Budapest",
  "Europe/Busingen",
  "Europe/Chisinau",
  "Europe/Copenhagen",
  "Europe/Dublin",
  "Europe/Gibraltar",
  "Europe/Guernsey",
  "Europe/Helsinki",
  "Europe/Isle_of_Man",
  "Europe/Jersey",
  "Europe/Kyiv",
  "Europe/Kiev",
  "Europe/Lisbon",
  "Europe/Ljubljana",
  "Europe/London",
  "Europe/Luxembourg",
  "Europe/Madrid",
  "Europe/Malta",
  "Europe/Mariehamn",
  "Europe/Monaco",
  "Europe/Oslo",
  "Europe/Paris",
  "Europe/Podgorica",
  "Europe/Prague",
  "Europe/Riga",
  "Europe/Rome",
  "Europe/San_Marino",
  "Europe/Sarajevo",
  "Europe/Skopje",
  "Europe/Sofia",
  "Europe/Stockholm",
  "Europe/Tallinn",
  "Europe/Tirane",
  "Europe/Vaduz",
  "Europe/Vatican",
  "Europe/Vienna",
  "Europe/Vilnius",
  "Europe/Warsaw",
  "Europe/Zagreb",
  "Europe/Zurich",
  "Atlantic/Reykjavik",
  "Atlantic/Canary",
  "Atlantic/Faeroe",
  "Atlantic/Faroe",
  "Atlantic/Madeira",
  "Atlantic/Azores",
]);

/**
 * Checks whether the browser's configured timezone indicates an EU/EEA/UK/Swiss location.
 * Completely client-side, zero IP lookup, zero network requests.
 */
export function isEUTimezone(): boolean {
  if (typeof Intl === "undefined" || !Intl.DateTimeFormat) {
    return false;
  }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return false;
    if (EU_EEA_UK_TIMEZONES.has(tz)) return true;
    if (tz.startsWith("Europe/")) return true;
    return false;
  } catch {
    return false;
  }
}

export default function CookieConsentBanner({
  onConsentChange,
  forceShowForTesting,
}: CookieConsentBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. If user already made a choice, don't show
    const existing = getStoredCookieConsent();
    if (existing) {
      return;
    }

    // 2. Check if user is in EU/EEA/UK timezone without checking IP
    const inEU = forceShowForTesting || isEUTimezone();
    if (inEU) {
      setIsVisible(true);
    }

    const handleUpdate = () => {
      setIsVisible(false);
    };

    window.addEventListener("cookie_consent_updated", handleUpdate);
    return () => {
      window.removeEventListener("cookie_consent_updated", handleUpdate);
    };
  }, [forceShowForTesting]);

  const handleChoice = (choice: CookieConsentChoice) => {
    updateCookieConsent(choice);
    setIsVisible(false);
    if (onConsentChange) {
      onConsentChange(choice);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      aria-label="Cookie and Privacy Consent"
      role="region"
      className="fixed bottom-4 left-4 z-50 w-[calc(100vw-2rem)] max-w-sm sm:max-w-md p-4 bg-slate-900/95 backdrop-blur-md text-white border border-slate-800 rounded-2xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
    >
      <div className="flex flex-col gap-3">
        {/* Header & Body */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0 mt-0.5">
            <Cookie className="w-4 h-4" aria-hidden="true" />
          </div>
          <div className="space-y-1 text-xs text-slate-300 leading-relaxed">
            <p className="font-semibold text-white flex items-center gap-1.5 text-xs sm:text-sm">
              <span>Cookie & Privacy Choices</span>
              <ShieldCheck
                className="w-3.5 h-3.5 text-emerald-400 inline"
                aria-hidden="true"
              />
            </p>
            <p className="text-slate-300 text-[11px] sm:text-xs">
              We use necessary local storage for calculator functions and
              optional analytics cookies to measure usage.
            </p>
            <p className="text-[11px] text-slate-400">
              Read our{" "}
              <Link
                to="/privacy-policy"
                className="text-emerald-400 hover:text-emerald-300 underline font-medium focus:outline-none focus:ring-1 focus:ring-emerald-400 rounded"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
          {/* Deny / Reject All */}
          <button
            type="button"
            onClick={() => handleChoice("none")}
            className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors focus:outline-none focus:ring-1 focus:ring-slate-500"
          >
            Deny
          </button>

          {/* Accept Only Required */}
          <button
            type="button"
            onClick={() => handleChoice("necessary")}
            className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            Required Only
          </button>

          {/* Accept All */}
          <button
            type="button"
            onClick={() => handleChoice("all")}
            className="flex-1 py-1.5 px-2.5 rounded-lg text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-emerald-400"
          >
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
}
