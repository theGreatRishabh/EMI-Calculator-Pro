import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

describe("App Component & Navigation", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  it("renders the calculator route by default with active Calculator tab", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    // Component renders
    const headings = screen.getAllByText(/Smart EMI Planner/i);
    expect(headings.length).toBeGreaterThan(0);

    // Verify correct styling based on Framer Motion layout state
    const homeLink = screen.getByText("Home").closest("a");
    const blogLink = screen.getByText("Blog").closest("a");

    // The explicitly active one has 'text-emerald-700'
    expect(homeLink?.className).toContain("text-emerald-700");
    // The inactive one has 'text-slate-600'
    expect(blogLink?.className).toContain("text-slate-600");
  });

  it("correctly sets active state when routed to the blog", () => {
    render(
      <MemoryRouter initialEntries={["/blog"]}>
        <App />
      </MemoryRouter>,
    );

    const homeLink = screen.getByText("Home").closest("a");
    const blogLink = screen.getByText("Blog").closest("a");

    // Now the Blog should have the active text-emerald-700 style
    expect(blogLink?.className).toContain("text-emerald-700");
    // And Home becomes inactive
    expect(homeLink?.className).toContain("text-slate-600");
  });

  it("correctly sets active state when routed to education loan", () => {
    render(
      <MemoryRouter initialEntries={["/education-loan"]}>
        <App />
      </MemoryRouter>,
    );

    const educationLink = screen.getByText("Education").closest("a");
    expect(educationLink?.className).toContain("text-emerald-700");
  });

  it("renders the Education Loan Calculator link in the footer calculators list", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    const footers = screen.getAllByRole("contentinfo");
    const appFooter = footers[footers.length - 1];
    const footerEduLink = within(appFooter).getByRole("link", {
      name: "Education Loan Calculator",
    });
    expect(footerEduLink).toBeInTheDocument();
    expect(footerEduLink).toHaveAttribute("href", "/education-loan");
  });

  it("scrolls to top when clicking footer links like FAQ", () => {
    const scrollToMock = vi.fn();
    window.scrollTo = scrollToMock;

    render(
      <MemoryRouter initialEntries={["/home-loan"]}>
        <App />
      </MemoryRouter>,
    );

    scrollToMock.mockClear();

    const faqFooterLink = screen.getByRole("link", { name: "FAQ" });
    fireEvent.click(faqFooterLink);

    expect(scrollToMock).toHaveBeenCalledWith(0, 0);
  });

  it("renders ExtensionPopup when routed to /popup", () => {
    render(
      <MemoryRouter initialEntries={["/popup"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText("Monthly Installment (EMI)")).toBeInTheDocument();
    expect(screen.getByText("Full App")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Open Prepayments & Amortization Schedule/i,
      }),
    ).toBeInTheDocument();
  });
});
