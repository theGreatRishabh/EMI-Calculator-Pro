import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

describe("App Component", () => {
  it("renders without crashing", () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
    const headings = screen.getAllByText(/Smart EMI Calculator/i);
    expect(headings.length).toBeGreaterThan(0);
  });
});
