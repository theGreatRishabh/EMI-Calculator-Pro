import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsOfUse from "./TermsOfUse";
import Disclaimer from "./Disclaimer";

describe("Static Pages Rendering", () => {
  describe("PrivacyPolicy Component", () => {
    it("renders Privacy Policy heading and sections", () => {
      render(
        <MemoryRouter>
          <PrivacyPolicy />
        </MemoryRouter>,
      );

      // Verify the main heading
      const heading = screen.getByRole("heading", {
        name: /Privacy Policy/i,
        level: 1,
      });
      expect(heading).toBeInTheDocument();

      // Verify some content sections
      expect(
        screen.getByText(
          /1. 100% Client-Side Calculations \(Zero Data Collection\)/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/None of the financial inputs you enter/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/2. Local Storage and Sharing Features/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/3. Analytics & Third-Party Cookies/i),
      ).toBeInTheDocument();
    });
  });

  describe("TermsOfUse Component", () => {
    it("renders Terms of Use heading and sections", () => {
      render(
        <MemoryRouter>
          <TermsOfUse />
        </MemoryRouter>,
      );

      // Verify the main heading
      const heading = screen.getByRole("heading", {
        name: /Terms of Use/i,
        level: 1,
      });
      expect(heading).toBeInTheDocument();

      // Verify some content sections
      expect(screen.getByText(/1. Acceptance of Terms/i)).toBeInTheDocument();
      expect(
        screen.getByText(/2. Permitted Use & Restrictions/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/3. Intellectual Property Rights/i),
      ).toBeInTheDocument();
    });
  });

  describe("Disclaimer Component", () => {
    it("renders Disclaimer heading and sections", () => {
      render(
        <MemoryRouter>
          <Disclaimer />
        </MemoryRouter>,
      );

      // Verify the main heading
      const heading = screen.getByRole("heading", {
        name: /Disclaimer/i,
        level: 1,
      });
      expect(heading).toBeInTheDocument();

      // Verify some content sections
      expect(
        screen.getByText(/1. Informational & Educational Purposes Only/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Not Professional Financial Advice/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/No Warranties/i)).toBeInTheDocument();
    });
  });
});
