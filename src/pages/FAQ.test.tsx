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
});
