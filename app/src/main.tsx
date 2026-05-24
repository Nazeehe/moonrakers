import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import { AppShell } from "@/components/Layout/AppShell";
import { HomePage } from "@/pages/HomePage";
import { ArmoryCategoryPage } from "@/pages/ArmoryCategoryPage";
import { CardBrowserPage } from "@/pages/CardBrowserPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/armory" element={<ArmoryCategoryPage />} />
          <Route path="/armory/:category" element={<CardBrowserPage />} />
          <Route path="/dispatch" element={<ComingSoon name="Dispatch Setup" />} />
          <Route path="/negotiation" element={<ComingSoon name="Negotiation" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

function ComingSoon({ name }: { name: string }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <div className="mr-label text-mr-gold mb-2">// MODULE PENDING</div>
      <h2 className="mr-title text-3xl mb-3">{name}</h2>
      <p className="text-mr-text-muted">This subsystem hasn't been wired up yet. Stay tuned.</p>
    </div>
  );
}
