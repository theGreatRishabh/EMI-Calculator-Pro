import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App Component", () => {
  it("renders without crashing", () => {
    render(<App />);
    const headings = screen.getAllByText(/EMI Calculator/i);
    expect(headings.length).toBeGreaterThan(0);
  });
});
