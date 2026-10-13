import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import App from "./App.tsx";
import "./index.css";
import { initAnalytics } from "./lib/analytics";

const isExtension =
  typeof window !== "undefined" &&
  (window.location.protocol === "chrome-extension:" ||
    window.location.protocol === "ms-browser-extension:");

if (isExtension && typeof document !== "undefined") {
  document.documentElement.classList.add("is-extension");
} else {
  initAnalytics();
}

const Router = isExtension ? HashRouter : BrowserRouter;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <App />
      {!isExtension && <Analytics />}
    </Router>
  </StrictMode>,
);
