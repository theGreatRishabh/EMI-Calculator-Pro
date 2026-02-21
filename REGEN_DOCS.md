# EMI Calculator Pro - Project Documentation

This folder contains the complete documentation for the **EMI Calculator Pro** application, including product requirements, technical specifications, and prompts for regeneration in Next.js.

## Files Included:
1. **PRD.md**: Product Requirements Document detailing features, user stories, and UI/UX goals.
2. **TRD.md**: Technical Requirements Document detailing the architecture, data models, and Next.js implementation strategy.
3. **REGEN_PROMPT.md**: A master prompt designed for LLMs to regenerate this exact application in a Next.js environment.

---

## 1. Product Requirements Document (PRD)

### **Project Overview**
EMI Calculator Pro is a high-end financial simulation tool designed for users to model complex loan scenarios. Unlike basic calculators, it handles dynamic variables like interest rate fluctuations and multiple prepayment strategies.

### **Core Features**
- **Dynamic Loan Types**: Presets for Home, Car, and Personal loans with custom limits.
- **Advanced Simulation**:
  - **Rate Changes**: Model floating interest rate scenarios (e.g., repo rate hikes).
  - **Prepayments**: Support for one-time and recurring prepayments with "Reduce Tenure" or "Reduce EMI" logic.
- **Goal Optimizer**: A reverse-calculation tool that tells users exactly how much extra they need to pay monthly to close a loan by a target date.
- **Tax Benefit Estimator**: India-specific tax savings estimates under Section 24(b) and 80C.
- **Visual Analytics**:
  - Principal vs Interest breakdown (Pie Chart).
  - Loan balance projection (Area Chart).
- **Data Portability**:
  - Export to PDF (formatted for readability).
  - Export to Excel (raw data for further analysis).
  - **Deep Linking**: Share specific scenarios via URL (encodes all rate changes and prepayments).

---

## 2. Technical Requirements Document (TRD)

### **Tech Stack (Next.js Target)**
- **Framework**: Next.js 14/15 (App Router).
- **Styling**: Tailwind CSS.
- **Components**: Lucide React (Icons), Framer Motion (Animations).
- **Charts**: Recharts.
- **Utilities**: date-fns (Date logic), clsx/tailwind-merge.
- **Exports**: jsPDF, jspdf-autotable, xlsx.

### **Data Models**
```typescript
enum LoanType { HOME, CAR, PERSONAL }
enum AdjustmentMode { KEEP_EMI, KEEP_TENURE }
enum PrepaymentType { ONE_TIME, RECURRING }
enum PrepaymentReduction { EMI, TENURE }

interface RateChange {
  id: string;
  effectiveDate: string;
  newRate: number;
  mode: AdjustmentMode;
}

interface Prepayment {
  id: string;
  amount: number;
  startDate: string;
  type: PrepaymentType;
  reduction: PrepaymentReduction;
  frequency?: number; // for recurring
}
```

### **Next.js Implementation Strategy**
1. **State Management**: Use `useState` and `useMemo` for the heavy amortization calculations.
2. **URL Sync**: Use `useSearchParams` and `useRouter` from `next/navigation` to synchronize the UI state with the URL for sharing.
3. **Client Components**: The calculator is highly interactive; the main page should be a `'use client'` component.
4. **Server Components**: Use for the initial page shell and SEO metadata.

---

## 3. Regeneration Prompt (Next.js)

**Prompt Title**: "Build a Professional EMI Calculator Pro in Next.js"

**Prompt Body**:
> Act as a senior full-stack engineer. Build a high-end EMI Calculator application using **Next.js (App Router)**, **Tailwind CSS**, and **TypeScript**.
>
> **Core Requirements**:
> 1. **Calculation Engine**: Implement a robust amortization logic that supports:
>    - Initial Principal, Rate, and Tenure (Years/Months).
>    - **Rate Changes**: A list of objects `{ date, newRate, mode: 'KEEP_EMI' | 'KEEP_TENURE' }`.
>    - **Prepayments**: A list of objects `{ date, amount, type: 'ONE_TIME' | 'RECURRING', reduction: 'EMI' | 'TENURE' }`.
> 2. **UI/UX**:
>    - Use a "Mission Control" dashboard aesthetic.
>    - Left Column: Loan Parameters (Sliders + Inputs) and a "Goal Optimizer" tool.
>    - Right Column: Quick Summary (EMI, Total Interest, Total Payment, Progress Tracking) and Pie/Area charts.
>    - Bottom: Expandable Amortization Table (Yearly summary with monthly drill-down).
> 3. **Features**:
>    - **Goal Optimizer**: Binary search algorithm to find required monthly prepayment for a target closure month.
>    - **Tax Benefits**: India-specific estimates for Sec 24b (Interest) and 80C (Principal).
>    - **Sharing**: Sync all state (including arrays) to the URL using Base64 encoding for deep links.
>    - **Exports**: Buttons for PDF (using jsPDF) and Excel (using xlsx).
> 4. **Libraries**: Use `recharts`, `lucide-react`, `date-fns`, `framer-motion`, `jspdf`, and `xlsx`.
>
> **Specific Logic Note**: When a rate change occurs with 'KEEP_EMI', the tenure must extend/shrink. When 'KEEP_TENURE' is selected, the EMI must be recalculated based on the remaining balance and remaining months.
