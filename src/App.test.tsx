import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

describe("App Component & Navigation", () => {
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
    const calcLink = screen.getByText("Calculator").closest("a");
    const blogLink = screen.getByText("Learn & Blog").closest("a");
    
    // The explicitly active one has 'text-emerald-700'
    expect(calcLink?.className).toContain("text-emerald-700");
    // The inactive one has 'text-slate-600'
    expect(blogLink?.className).toContain("text-slate-600");
  });

  it("correctly sets active state when routed to the blog", () => {
    render(
      <MemoryRouter initialEntries={["/blog"]}>
        <App />
      </MemoryRouter>,
    );

    const calcLink = screen.getByText("Calculator").closest("a");
    const blogLink = screen.getByText("Learn & Blog").closest("a");
    
    // Now the Blog should have the active text-emerald-700 style
    expect(blogLink?.className).toContain("text-emerald-700");
    // And Calculator becomes inactive
    expect(calcLink?.className).toContain("text-slate-600");
  });
});
