import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CookieConsentBanner, { isEUTimezone } from "./CookieConsentBanner";
import { COOKIE_CONSENT_KEY } from "../lib/analytics";

describe("CookieConsentBanner Component & EU Timezone Check", () => {
  beforeEach(() => {
    localStorage.clear();
    window.gtag = vi.fn();
  });

  describe("isEUTimezone()", () => {
    it("identifies European/UK timezones correctly without IP", () => {
      const originalDateTimeFormat = Intl.DateTimeFormat;

      // Mock Paris timezone
      vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
        () =>
          ({
            resolvedOptions: () => ({ timeZone: "Europe/Paris" }),
          }) as unknown as Intl.DateTimeFormat,
      );
      expect(isEUTimezone()).toBe(true);

      // Mock London timezone
      vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
        () =>
          ({
            resolvedOptions: () => ({ timeZone: "Europe/London" }),
          }) as unknown as Intl.DateTimeFormat,
      );
      expect(isEUTimezone()).toBe(true);

      // Mock New York (US) timezone
      vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
        () =>
          ({
            resolvedOptions: () => ({ timeZone: "America/New_York" }),
          }) as unknown as Intl.DateTimeFormat,
      );
      expect(isEUTimezone()).toBe(false);

      // Mock Asia/Kolkata (India) timezone
      vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
        () =>
          ({
            resolvedOptions: () => ({ timeZone: "Asia/Kolkata" }),
          }) as unknown as Intl.DateTimeFormat,
      );
      expect(isEUTimezone()).toBe(false);

      Intl.DateTimeFormat = originalDateTimeFormat;
    });
  });

  it("renders when user is in EU timezone and no consent given", () => {
    render(
      <MemoryRouter>
        <CookieConsentBanner forceShowForTesting={true} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("region", { name: /cookie and privacy consent/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /privacy policy/i }),
    ).toHaveAttribute("href", "/privacy-policy");
    expect(screen.getByRole("button", { name: /deny/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /required only/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /accept all/i }),
    ).toBeInTheDocument();
  });

  it("does not render when user is outside EU timezone", () => {
    const originalDateTimeFormat = Intl.DateTimeFormat;
    vi.spyOn(Intl, "DateTimeFormat").mockImplementation(
      () =>
        ({
          resolvedOptions: () => ({ timeZone: "America/Chicago" }),
        }) as unknown as Intl.DateTimeFormat,
    );

    render(
      <MemoryRouter>
        <CookieConsentBanner />
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole("region", { name: /cookie and privacy consent/i }),
    ).not.toBeInTheDocument();

    Intl.DateTimeFormat = originalDateTimeFormat;
  });

  it("does not render when consent is already set in localStorage even in EU", () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "necessary");

    render(
      <MemoryRouter>
        <CookieConsentBanner forceShowForTesting={true} />
      </MemoryRouter>,
    );

    expect(
      screen.queryByRole("region", { name: /cookie and privacy consent/i }),
    ).not.toBeInTheDocument();
  });

  it("sets 'all' in localStorage and updates gtag consent on Accept All", () => {
    const onConsentChange = vi.fn();
    render(
      <MemoryRouter>
        <CookieConsentBanner
          forceShowForTesting={true}
          onConsentChange={onConsentChange}
        />
      </MemoryRouter>,
    );

    const acceptAllBtn = screen.getByRole("button", { name: /accept all/i });
    fireEvent.click(acceptAllBtn);

    expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toBe("all");
    expect(window.gtag).toHaveBeenCalledWith(
      "consent",
      "update",
      expect.objectContaining({
        analytics_storage: "granted",
      }),
    );
    expect(onConsentChange).toHaveBeenCalledWith("all");
    expect(
      screen.queryByRole("region", { name: /cookie and privacy consent/i }),
    ).not.toBeInTheDocument();
  });

  it("sets 'necessary' in localStorage and denies analytics_storage on Required Only", () => {
    const onConsentChange = vi.fn();
    render(
      <MemoryRouter>
        <CookieConsentBanner
          forceShowForTesting={true}
          onConsentChange={onConsentChange}
        />
      </MemoryRouter>,
    );

    const requiredBtn = screen.getByRole("button", {
      name: /required only/i,
    });
    fireEvent.click(requiredBtn);

    expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toBe("necessary");
    expect(window.gtag).toHaveBeenCalledWith(
      "consent",
      "update",
      expect.objectContaining({
        analytics_storage: "denied",
        functionality_storage: "granted",
      }),
    );
    expect(onConsentChange).toHaveBeenCalledWith("necessary");
    expect(
      screen.queryByRole("region", { name: /cookie and privacy consent/i }),
    ).not.toBeInTheDocument();
  });

  it("sets 'none' in localStorage and denies analytics_storage on Deny", () => {
    const onConsentChange = vi.fn();
    render(
      <MemoryRouter>
        <CookieConsentBanner
          forceShowForTesting={true}
          onConsentChange={onConsentChange}
        />
      </MemoryRouter>,
    );

    const denyBtn = screen.getByRole("button", { name: /deny/i });
    fireEvent.click(denyBtn);

    expect(localStorage.getItem(COOKIE_CONSENT_KEY)).toBe("none");
    expect(window.gtag).toHaveBeenCalledWith(
      "consent",
      "update",
      expect.objectContaining({
        analytics_storage: "denied",
      }),
    );
    expect(onConsentChange).toHaveBeenCalledWith("none");
    expect(
      screen.queryByRole("region", { name: /cookie and privacy consent/i }),
    ).not.toBeInTheDocument();
  });
});
