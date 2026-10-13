import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import FAQ from "./FAQ";

// Mock framer-motion to render elements synchronously without animation delays
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe("FAQ Component", () => {
  it("renders the FAQ component with headings and questions", () => {
    render(
      <MemoryRouter>
        <FAQ />
      </MemoryRouter>,
    );

    // Verify main heading
    expect(
      screen.getByRole("heading", {
        name: /Frequently Asked Questions/i,
        level: 1,
      }),
    ).toBeInTheDocument();

    // Verify some FAQ questions are present
    expect(
      screen.getByText("What is an EMI and how is it calculated?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("What are the benefits of making loan prepayments?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "How do interest rate hikes affect my loan tenure and interest?",
      ),
    ).toBeInTheDocument();
  });

  it("toggles the display of answers when clicking on questions", () => {
    render(
      <MemoryRouter>
        <FAQ />
      </MemoryRouter>,
    );

    const questionText = "What is an EMI and how is it calculated?";

    // The answer content should not be in the document initially
    expect(
      screen.queryByText(/Equated Monthly Installment/i),
    ).not.toBeInTheDocument();

    // Click the question button
    const questionButton = screen.getByText(questionText);
    fireEvent.click(questionButton);

    // The answer content should now be in the document
    expect(
      screen.getByText(/Equated Monthly Installment/i),
    ).toBeInTheDocument();

    // Click it again to close
    fireEvent.click(questionButton);

    // The answer content should be removed immediately thanks to the mock
    expect(
      screen.queryByText(/Equated Monthly Installment/i),
    ).not.toBeInTheDocument();
  });

  it("renders and filters Education Loan and International Market FAQs", () => {
    render(
      <MemoryRouter>
        <FAQ />
      </MemoryRouter>,
    );

    // Education Loan FAQ is present
    expect(
      screen.getByText("How does an Education Loan Moratorium Period work?"),
    ).toBeInTheDocument();

    // International Markets FAQ is present
    expect(
      screen.getByText(
        "Does Smart EMI Planner support international loans across the USA, UK, Europe, Australia, and India?",
      ),
    ).toBeInTheDocument();

    // Test category filter button for Education Loans
    const eduFilterBtn = screen.getByRole("button", {
      name: /^Education Loans$/i,
    });
    fireEvent.click(eduFilterBtn);

    expect(
      screen.getByText("How does an Education Loan Moratorium Period work?"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("What is an EMI and how is it calculated?"),
    ).not.toBeInTheDocument();

    // Test FAQ Search
    const searchInput = screen.getByLabelText("Search FAQs");
    fireEvent.change(searchInput, { target: { value: "Concession" } });
    expect(
      screen.getByText(
        "What is the interest rate concession offered by banks on education loans?",
      ),
    ).toBeInTheDocument();
  });

  it("renders Share Calculation and Bug/Feature Request FAQs", () => {
    render(
      <MemoryRouter>
        <FAQ />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("How does the 'Share Calculation' feature work?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("How can I request a new feature or report a bug?"),
    ).toBeInTheDocument();
  });
});
