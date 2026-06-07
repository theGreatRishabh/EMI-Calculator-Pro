import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Calculator from "./Calculator";

// Mock recharts fully to avoid layout warnings and elements in jsdom
vi.mock("recharts", () => {
  return {
    ResponsiveContainer: ({ children }: any) => (
      <div data-testid="chart-container">{children}</div>
    ),
    PieChart: ({ children }: any) => (
      <div data-testid="pie-chart">{children}</div>
    ),
    Pie: ({ children, label }: any) => {
      if (typeof label === "function") {
        label({ percent: 0.45 });
      }
      return <div data-testid="pie">{children}</div>;
    },
    Cell: () => <div data-testid="cell" />,
    Tooltip: ({ formatter }: any) => {
      if (typeof formatter === "function") {
        formatter(125000);
      }
      return <div data-testid="tooltip" />;
    },
    AreaChart: ({ children }: any) => (
      <div data-testid="area-chart">{children}</div>
    ),
    Area: () => <div data-testid="area" />,
    XAxis: () => <div data-testid="xaxis" />,
    YAxis: ({ tickFormatter }: any) => {
      if (typeof tickFormatter === "function") {
        tickFormatter(500000);
      }
      return <div data-testid="yaxis" />;
    },
    CartesianGrid: () => <div data-testid="cartesiangrid" />,
    Legend: () => <div data-testid="legend" />,
  };
});

// Mock framer-motion to render elements synchronously without animation delays
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => (
      <section {...props}>{children}</section>
    ),
    button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock jspdf and jspdf-autotable
const mockSave = vi.fn();
const mockText = vi.fn();
const mockSetFontSize = vi.fn();

vi.mock("jspdf", () => {
  return {
    jsPDF: class {
      text = mockText;
      setFontSize = mockSetFontSize;
      save = mockSave;
    },
  };
});

vi.mock("jspdf-autotable", () => {
  return {
    default: vi.fn(),
  };
});

// Mock exceljs and file-saver
const mockWriteBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(10));
const mockAddRow = vi.fn();
const mockGetRow = vi.fn().mockImplementation(() => ({
  font: {},
  fill: {},
}));
const mockGetColumn = vi.fn().mockImplementation(() => ({
  numFmt: "",
}));

vi.mock("exceljs", () => {
  class Workbook {
    addWorksheet = vi.fn().mockImplementation(() => {
      return {
        columns: [],
        addRow: mockAddRow,
        getRow: mockGetRow,
        getColumn: mockGetColumn,
      };
    });
    xlsx = {
      writeBuffer: mockWriteBuffer,
    };
  }

  const mockModule = {
    Workbook,
  };

  return {
    ...mockModule,
    default: mockModule,
  };
});

const mockSaveAs = vi.fn();
vi.mock("file-saver", () => {
  return {
    saveAs: mockSaveAs,
  };
});

describe("Calculator Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    process.env.VITE_ENABLE_CONSULTANCY = "false";
    (import.meta as any).env.VITE_ENABLE_CONSULTANCY = "false";
  });

  it("renders with default values for HOME loan type", () => {
    render(
      <MemoryRouter>
        <Calculator initialLoanType="HOME" />
      </MemoryRouter>,
    );

    // Verify inputs display default values (50,000,000 amount, 8.5% rate, 20 years tenure)
    const amountInput = screen.getByLabelText(
      "Loan Amount",
    ) as HTMLInputElement;
    expect(amountInput.value).toBe("5000000");

    const rateInput = screen.getByLabelText(
      "Interest Rate (% p.a.)",
    ) as HTMLInputElement;
    expect(rateInput.value).toBe("8.5");

    const tenureInput = screen.getByLabelText("Tenure") as HTMLInputElement;
    expect(tenureInput.value).toBe("20");

    // Check that EMI and details are calculated
    expect(screen.getByText("Monthly EMI")).toBeInTheDocument();
    expect(screen.getByText("Total Interest")).toBeInTheDocument();
  });

  it("recalculates Monthly EMI correctly when inputs are modified", () => {
    render(
      <MemoryRouter>
        <Calculator initialLoanType="HOME" />
      </MemoryRouter>,
    );

    const amountInput = screen.getByLabelText(
      "Loan Amount",
    ) as HTMLInputElement;
    const rateInput = screen.getByLabelText(
      "Interest Rate (% p.a.)",
    ) as HTMLInputElement;
    const tenureInput = screen.getByLabelText("Tenure") as HTMLInputElement;

    // Simulate changing values: Amount = 100,000, Rate = 10%, Tenure = 1 year
    fireEvent.change(amountInput, { target: { value: "100000" } });
    fireEvent.change(rateInput, { target: { value: "10" } });
    fireEvent.change(tenureInput, { target: { value: "1" } });

    // Verify the inputs updated in the DOM
    expect(amountInput.value).toBe("100000");
    expect(rateInput.value).toBe("10");
    expect(tenureInput.value).toBe("1");

    // 100k principal, 10% rate, 1 year tenure:
    // EMI is 8,791.59. With formatting it rounds to ₹8,792.
    // Verify that the UI updates and shows the calculated EMI
    expect(screen.getByText("₹8,792")).toBeInTheDocument();
  });

  it("renders default values for CAR loan type", () => {
    render(
      <MemoryRouter>
        <Calculator initialLoanType="CAR" />
      </MemoryRouter>,
    );

    const amountInput = screen.getByLabelText(
      "Loan Amount",
    ) as HTMLInputElement;
    expect(amountInput.value).toBe("1000000");

    const rateInput = screen.getByLabelText(
      "Interest Rate (% p.a.)",
    ) as HTMLInputElement;
    expect(rateInput.value).toBe("9.5");

    const tenureInput = screen.getByLabelText("Tenure") as HTMLInputElement;
    expect(tenureInput.value).toBe("5");
  });

  it("renders default values for PERSONAL loan type", () => {
    render(
      <MemoryRouter>
        <Calculator initialLoanType="PERSONAL" />
      </MemoryRouter>,
    );

    const amountInput = screen.getByLabelText(
      "Loan Amount",
    ) as HTMLInputElement;
    expect(amountInput.value).toBe("500000");

    const rateInput = screen.getByLabelText(
      "Interest Rate (% p.a.)",
    ) as HTMLInputElement;
    expect(rateInput.value).toBe("12");

    const tenureInput = screen.getByLabelText("Tenure") as HTMLInputElement;
    expect(tenureInput.value).toBe("3");
  });

  it("calculates and applies a goal prepayment from Goal Optimizer", () => {
    render(
      <MemoryRouter>
        <Calculator initialLoanType="HOME" />
      </MemoryRouter>,
    );

    // Default target months is 240. Let's change target months to 180 (15 years)
    const goalInput = screen.getByDisplayValue("240") as HTMLInputElement;
    fireEvent.change(goalInput, { target: { value: "180" } });
    expect(goalInput.value).toBe("180");

    // Click "Calculate Required Prepayment"
    const calcBtn = screen.getByRole("button", {
      name: /Calculate Required Prepayment/i,
    });
    fireEvent.click(calcBtn);

    // Verify that required monthly prepayment is shown (should render the result block)
    expect(screen.getByText("Required Monthly Prepayment")).toBeInTheDocument();

    // Click "Apply to Planner"
    const applyBtn = screen.getByRole("button", { name: /Apply to Planner/i });
    fireEvent.click(applyBtn);

    // It should have added the prepayment to the Prepayment Planner
    expect(screen.getByText("Prepayments Impact")).toBeInTheDocument();
  });

  it("allows adding a prepayment and a rate change manually", () => {
    render(
      <MemoryRouter>
        <Calculator initialLoanType="HOME" />
      </MemoryRouter>,
    );

    // Click "Add Prepayment"
    const addPrepayBtn = screen.getByRole("button", {
      name: /Add Prepayment/i,
    });
    fireEvent.click(addPrepayBtn);

    // Verify card is added
    expect(screen.getByText("Prepayments Impact")).toBeInTheDocument();

    // Click "Add Change" under Rate Change Simulator
    const addRateBtn = screen.getByRole("button", { name: /Add Change/i });
    fireEvent.click(addRateBtn);

    // Verify card is added
    expect(screen.getByText("Rate Changes Impact")).toBeInTheDocument();
  });

  it("handles Step-Up percentage updates and currency conversion", () => {
    render(
      <MemoryRouter>
        <Calculator initialLoanType="HOME" />
      </MemoryRouter>,
    );

    // 1. Step-Up
    const stepUpSlider = document.getElementById(
      "emi-step-up-slider",
    ) as HTMLInputElement;
    fireEvent.change(stepUpSlider, { target: { value: "5" } });
    expect(stepUpSlider.value).toBe("5");

    // 2. Currency Selector
    const currencySelect = screen.getByRole("combobox") as HTMLSelectElement;
    fireEvent.change(currencySelect, { target: { value: "USD" } });
    expect(currencySelect.value).toBe("USD");

    // Check that tax tips heading has updated to reflect USD currency (which maps to USA (Washington D.C.))
    expect(
      screen.getByText(/Tax Benefit Estimator \(USA \(Washington D.C.\)\)/i),
    ).toBeInTheDocument();
  });

  it("supports expanding year rows in the amortization schedule table", () => {
    render(
      <MemoryRouter>
        <Calculator initialLoanType="HOME" />
      </MemoryRouter>,
    );

    // Find the toggle button representing the annual summary rows
    const expandButtons = screen.getAllByRole("button", {
      name: /Annual Summary/i,
    });
    expect(expandButtons.length).toBeGreaterThan(0);

    // Click to expand the first year's rows
    fireEvent.click(expandButtons[0]);

    // Check that month 1 row in the detailed schedule table becomes visible
    expect(expandButtons[0].getAttribute("aria-expanded")).toBe("true");

    // Trigger keydown Enter to collapse it back
    fireEvent.keyDown(expandButtons[0], { key: "Enter", code: "Enter" });
    expect(expandButtons[0].getAttribute("aria-expanded")).toBe("false");
  });

  it("triggers PDF and Excel report downloads successfully", async () => {
    render(
      <MemoryRouter>
        <Calculator initialLoanType="HOME" />
      </MemoryRouter>,
    );

    // Click Export PDF button
    const pdfBtn = screen.getByRole("button", { name: /Export PDF/i });
    fireEvent.click(pdfBtn);

    // Wait for the dynamic import and save call
    await waitFor(() => {
      expect(mockSave).toHaveBeenCalled();
    });

    // Click Export Excel button
    const excelBtn = screen.getByRole("button", { name: /Export Excel/i });
    fireEvent.click(excelBtn);

    // Wait for the Excel writing to call saveAs
    await waitFor(() => {
      expect(mockSaveAs).toHaveBeenCalled();
    });
  });

  it("opens, submits, and closes the Lead Modal when consultancy is enabled", async () => {
    // Enable consultancy env
    process.env.VITE_ENABLE_CONSULTANCY = "true";

    render(
      <MemoryRouter>
        <Calculator initialLoanType="HOME" />
      </MemoryRouter>,
    );

    // Verify consultancy section renders "Request a Feature" button
    const requestFeatureBtn = screen.getByRole("button", {
      name: /Request a Feature/i,
    });
    expect(requestFeatureBtn).toBeInTheDocument();

    // The modal should not be visible initially
    expect(screen.queryByText("Let's Build Software")).not.toBeInTheDocument();

    // Click to open the modal
    fireEvent.click(requestFeatureBtn);

    // Verify modal is open
    expect(screen.getByText("Let's Build Software")).toBeInTheDocument();

    // Fill in the form
    const nameInput = screen.getByPlaceholderText("John Doe");
    const emailInput = screen.getByPlaceholderText("john@example.com");
    const phoneInput = screen.getByPlaceholderText("+91 98765 43210");

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(phoneInput, { target: { value: "+1 555 12345" } });

    // Submit form
    const submitBtn = screen.getByRole("button", {
      name: /Unlock Roadmap Now/i,
    });
    fireEvent.submit(submitBtn);

    // Verify it captures lead and displays success view
    expect(screen.getByText("Request Received!")).toBeInTheDocument();

    // Close the modal
    const closeBtn = screen.getByRole("button", { name: /Close modal/i });
    fireEvent.click(closeBtn);

    // Verify modal is closed
    await waitFor(() => {
      expect(
        screen.queryByText("Let's Build Software"),
      ).not.toBeInTheDocument();
    });
  });

  it("supports customizing upfront charges and down payment", () => {
    render(
      <MemoryRouter>
        <Calculator initialLoanType="HOME" />
      </MemoryRouter>,
    );

    // Find custom stamp duty rate input (default display value "6")
    const stampInput = screen.getByDisplayValue("6") as HTMLInputElement;
    fireEvent.change(stampInput, { target: { value: "5.5" } });
    expect(stampInput.value).toBe("5.5");

    // Find the down payment input (its placeholder is "0" and it doesn't have an ID)
    const inputs0 = screen.getAllByPlaceholderText("0") as HTMLInputElement[];
    const dpInput = inputs0.find(
      (input) => input.id !== "monthly-tax" && input.id !== "monthly-insurance",
    );
    expect(dpInput).toBeDefined();

    fireEvent.change(dpInput!, { target: { value: "800000" } });
    expect(dpInput!.value).toBe("800000");
  });

  it("initializes state from URL query parameters correctly", () => {
    const rateChangesBase64 = btoa(
      JSON.stringify([
        {
          id: "rc1",
          effectiveDate: "2026-08-01",
          newRate: 9.0,
          mode: "KEEP_EMI",
        },
      ]),
    );
    const prepaymentsBase64 = btoa(
      JSON.stringify([
        {
          id: "pp1",
          amount: 100000,
          startDate: "2026-09-01",
          type: "ONE_TIME",
          reduction: "TENURE",
        },
      ]),
    );
    const url = `http://localhost/?type=CAR&amt=1200000&rate=9.5&ten=4&unit=Y&start=2026-07-01&tax=100&ins=200&dp=300000&pval=1500000&sdr=5.0&regr=1.0&emiSU=2&curr=USD&rc=${rateChangesBase64}&pp=${prepaymentsBase64}`;

    vi.stubGlobal("location", new URL(url));

    render(
      <MemoryRouter>
        <Calculator initialLoanType="HOME" />
      </MemoryRouter>,
    );

    const amountInput = screen.getByLabelText(
      "Loan Amount",
    ) as HTMLInputElement;
    expect(amountInput.value).toBe("1200000");

    const rateInput = screen.getByLabelText(
      "Interest Rate (% p.a.)",
    ) as HTMLInputElement;
    expect(rateInput.value).toBe("9.5");

    const tenureInput = screen.getByLabelText("Tenure") as HTMLInputElement;
    expect(tenureInput.value).toBe("4");

    const currencySelect = document.querySelector(
      "select[class*='text-emerald-700']",
    ) as HTMLSelectElement;
    expect(currencySelect.value).toBe("USD");

    vi.unstubAllGlobals();
  });

  it("handles malformed base64 parameters in URL and falls back", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "location",
      new URL(
        "http://localhost/?type=HOME&rc=invalid-base-64&pp=invalid-base-64",
      ),
    );

    render(
      <MemoryRouter>
        <Calculator initialLoanType="HOME" />
      </MemoryRouter>,
    );

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
    vi.unstubAllGlobals();
  });

  it("initializes state from LocalStorage when URL search params are empty", () => {
    const localState = {
      loanType: "HOME",
      amount: 4500000,
      rate: 7.2,
      tenure: 15,
      tenureUnit: "Y",
      loanStartDate: "2026-08-01",
      monthlyTax: 150,
      monthlyInsurance: 250,
      downPayment: 500000,
      propertyValue: 5000000,
      customStampDutyRate: 4.5,
      customRegistrationRate: 0.5,
      currencyCode: "EUR",
      rateChanges: [
        {
          id: "lrc1",
          effectiveDate: "2026-12-01",
          newRate: 7.5,
          mode: "KEEP_TENURE",
        },
      ],
      prepayments: [
        {
          id: "lpp1",
          amount: 20000,
          startDate: "2027-01-01",
          type: "RECURRING",
          reduction: "EMI",
          frequency: 12,
        },
      ],
      emiStepUpPercent: 3,
    };
    localStorage.setItem("emi_calculator_state", JSON.stringify(localState));
    vi.stubGlobal("location", new URL("http://localhost/"));

    render(
      <MemoryRouter>
        <Calculator initialLoanType="HOME" />
      </MemoryRouter>,
    );

    const amountInput = screen.getByLabelText(
      "Loan Amount",
    ) as HTMLInputElement;
    expect(amountInput.value).toBe("4500000");

    const rateInput = screen.getByLabelText(
      "Interest Rate (% p.a.)",
    ) as HTMLInputElement;
    expect(rateInput.value).toBe("7.2");

    const currencySelect = document.querySelector(
      "select[class*='text-emerald-700']",
    ) as HTMLSelectElement;
    expect(currencySelect.value).toBe("EUR");

    vi.unstubAllGlobals();
  });

  it("allows updating and removing rate change cards", async () => {
    render(
      <MemoryRouter>
        <Calculator initialLoanType="HOME" />
      </MemoryRouter>,
    );

    const addRateBtn = screen.getByRole("button", { name: /Add Change/i });
    fireEvent.click(addRateBtn);

    const dateInput = document.querySelector(
      "input[id^='rate-date-']",
    ) as HTMLInputElement;
    const newRateInput = document.querySelector(
      "input[id^='rate-input-']",
    ) as HTMLInputElement;
    const modeSelect = document.querySelector(
      "[class*='hover:border-amber-200'] select",
    ) as HTMLSelectElement;

    fireEvent.change(dateInput, { target: { value: "2027-06-01" } });
    fireEvent.blur(dateInput);
    expect(dateInput.value).toBe("2027-06-01");

    fireEvent.change(newRateInput, { target: { value: "9.2" } });
    fireEvent.blur(newRateInput);
    expect(newRateInput.value).toBe("9.2");

    fireEvent.change(newRateInput, { target: { value: "" } });
    fireEvent.blur(newRateInput);
    expect(newRateInput.value).toBe("0");

    fireEvent.change(modeSelect, { target: { value: "KEEP_EMI" } });
    fireEvent.blur(modeSelect);
    expect(modeSelect.value).toBe("KEEP_EMI");

    const removeBtn = screen.getByRole("button", {
      name: "Remove rate change",
    });
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(
        document.querySelector("input[id^='rate-input-']"),
      ).not.toBeInTheDocument();
    });
  });

  it("allows updating, removing, and switching prepayment card fields", async () => {
    render(
      <MemoryRouter>
        <Calculator initialLoanType="HOME" />
      </MemoryRouter>,
    );

    const addPrepayBtn = screen.getByRole("button", {
      name: /Add Prepayment/i,
    });
    fireEvent.click(addPrepayBtn);

    const amountInput = document.querySelector(
      "input[id^='prepay-amount-']",
    ) as HTMLInputElement;
    const startDateInput = document.querySelector(
      "input[id^='prepay-date-']",
    ) as HTMLInputElement;
    const typeSelect = document.querySelector(
      "select[id^='prepay-type-']",
    ) as HTMLSelectElement;
    const reductionSelect = document.querySelector(
      "select[id^='prepay-reduction-']",
    ) as HTMLSelectElement;

    // Change amount and click Apply Changes manually
    fireEvent.change(amountInput, { target: { value: "75000" } });
    const applyChangesBtn = screen.getByRole("button", {
      name: "Apply Changes",
    });
    fireEvent.click(applyChangesBtn);
    expect(amountInput.value).toBe("75000");

    fireEvent.change(startDateInput, { target: { value: "2027-08-01" } });
    fireEvent.blur(startDateInput);
    expect(startDateInput.value).toBe("2027-08-01");

    fireEvent.change(reductionSelect, { target: { value: "EMI" } });
    fireEvent.blur(reductionSelect);
    expect(reductionSelect.value).toBe("EMI");

    fireEvent.change(typeSelect, { target: { value: "RECURRING" } });
    fireEvent.blur(typeSelect);
    expect(typeSelect.value).toBe("RECURRING");

    const freqInput = document.querySelector(
      "input[id^='prepay-frequency-']",
    ) as HTMLInputElement;
    fireEvent.change(freqInput, { target: { value: "6" } });
    fireEvent.blur(freqInput);
    expect(freqInput.value).toBe("6");

    const removeBtn = screen.getByRole("button", { name: "Remove prepayment" });
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(
        document.querySelector("input[id^='prepay-amount-']"),
      ).not.toBeInTheDocument();
    });
  }, 15000);

  it("calculates prepayment in Goal Optimizer with a specified start date", () => {
    render(
      <MemoryRouter>
        <Calculator initialLoanType="HOME" />
      </MemoryRouter>,
    );

    const goalInput = screen.getByDisplayValue("240") as HTMLInputElement;
    fireEvent.change(goalInput, { target: { value: "120" } });

    const inputs = document.querySelectorAll("input[type='date']");
    expect(inputs.length).toBe(2);
    const goalStartDateInput = inputs[1] as HTMLInputElement;

    const loanStartDateInput = inputs[0] as HTMLInputElement;
    fireEvent.change(loanStartDateInput, { target: { value: "2026-06-07" } });

    fireEvent.change(goalStartDateInput, { target: { value: "2027-06-07" } });
    expect(goalStartDateInput.value).toBe("2027-06-07");

    const calcBtn = screen.getByRole("button", {
      name: /Calculate Required Prepayment/i,
    });
    fireEvent.click(calcBtn);

    expect(screen.getByText("Required Monthly Prepayment")).toBeInTheDocument();
  });

  it("supports Step-Up presets and disabling Step-Up", () => {
    render(
      <MemoryRouter>
        <Calculator initialLoanType="HOME" />
      </MemoryRouter>,
    );

    const presetBtn = screen.getByRole("button", { name: "+10%" });
    fireEvent.click(presetBtn);

    const stepUpSlider = document.getElementById(
      "emi-step-up-slider",
    ) as HTMLInputElement;
    expect(stepUpSlider.value).toBe("10");

    const disableBtn = screen.getByRole("button", { name: /Disable/i });
    fireEvent.click(disableBtn);

    expect(stepUpSlider.value).toBe("0");
  });

  it("supports switching tenure units and slider changes", () => {
    render(
      <MemoryRouter>
        <Calculator initialLoanType="HOME" />
      </MemoryRouter>,
    );

    const mosBtn = screen.getByRole("button", { name: "Mo" });
    fireEvent.click(mosBtn);

    const tenureInput = screen.getByLabelText("Tenure") as HTMLInputElement;
    expect(tenureInput.value).toBe("240");

    const yrsBtn = screen.getByRole("button", { name: "Yrs" });
    fireEvent.click(yrsBtn);
    expect(tenureInput.value).toBe("20");

    const amountSlider = screen.getByLabelText(
      "Loan Amount Slider",
    ) as HTMLInputElement;
    fireEvent.change(amountSlider, { target: { value: "3000000" } });
    expect(amountSlider.value).toBe("3000000");

    const rateSlider = screen.getByLabelText(
      "Interest Rate Slider",
    ) as HTMLInputElement;
    fireEvent.change(rateSlider, { target: { value: "7.5" } });
    expect(rateSlider.value).toBe("7.5");

    const tenureSlider = screen.getByLabelText(
      "Loan Tenure Slider",
    ) as HTMLInputElement;
    fireEvent.change(tenureSlider, { target: { value: "15" } });
    expect(tenureSlider.value).toBe("15");
  }, 15000);

  it("renders and validates upfront cost inputs for CAR loan type", () => {
    render(
      <MemoryRouter>
        <Calculator initialLoanType="CAR" />
      </MemoryRouter>,
    );

    const onRoadInput = screen.getByPlaceholderText(
      "Enter value...",
    ) as HTMLInputElement;
    fireEvent.change(onRoadInput, { target: { value: "1200000" } });
    expect(onRoadInput.value).toBe("1200000");

    const upfrontInputs = document.querySelectorAll(
      "input[inputMode='decimal']",
    );
    const insuranceInput = upfrontInputs[1] as HTMLInputElement;
    fireEvent.change(insuranceInput, { target: { value: "45000" } });
    expect(insuranceInput.value).toBe("45000");

    const tenureSlider = screen.getByLabelText(
      "Loan Tenure Slider",
    ) as HTMLInputElement;
    fireEvent.change(tenureSlider, { target: { value: "1" } });
  });

  it("renders and validates upfront cost inputs for PERSONAL loan type", () => {
    render(
      <MemoryRouter>
        <Calculator initialLoanType="PERSONAL" />
      </MemoryRouter>,
    );

    const upfrontInputs = document.querySelectorAll(
      "input[inputMode='decimal']",
    );
    const filingInput = upfrontInputs[0] as HTMLInputElement;
    fireEvent.change(filingInput, { target: { value: "4000" } });
    expect(filingInput.value).toBe("4000");

    const docInput = upfrontInputs[1] as HTMLInputElement;
    fireEvent.change(docInput, { target: { value: "1200" } });
    expect(docInput.value).toBe("1200");
  });

  it("supports copying the share URL and resets copied state after timeout", async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: mockWriteText,
      },
    });

    render(
      <MemoryRouter>
        <Calculator initialLoanType="HOME" />
      </MemoryRouter>,
    );

    const shareBtn = screen.getByRole("button", { name: /^Share$/ });
    fireEvent.click(shareBtn);

    expect(mockWriteText).toHaveBeenCalled();
    expect(screen.getByText("Copied!")).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
      },
      { timeout: 3500 },
    );
  });

  it("automatically closes lead modal after successful submission", async () => {
    process.env.VITE_ENABLE_CONSULTANCY = "true";

    render(
      <MemoryRouter>
        <Calculator initialLoanType="HOME" />
      </MemoryRouter>,
    );

    const requestFeatureBtn = screen.getByRole("button", {
      name: /Request a Feature/i,
    });
    fireEvent.click(requestFeatureBtn);

    const nameInput = screen.getByPlaceholderText("John Doe");
    const emailInput = screen.getByPlaceholderText("john@example.com");
    const phoneInput = screen.getByPlaceholderText("+91 98765 43210");

    fireEvent.change(nameInput, { target: { value: "Test User" } });
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(phoneInput, { target: { value: "+1 555 12345" } });

    const submitBtn = screen.getByRole("button", {
      name: /Unlock Roadmap Now/i,
    });
    fireEvent.click(submitBtn);

    expect(screen.getByText("Request Received!")).toBeInTheDocument();

    await waitFor(
      () => {
        expect(
          screen.queryByText("Let's Build Software"),
        ).not.toBeInTheDocument();
      },
      { timeout: 3500 },
    );
  });
});
