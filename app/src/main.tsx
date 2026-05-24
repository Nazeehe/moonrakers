import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import { AppShell } from "@/components/Layout/AppShell";
import { HomePage } from "@/pages/HomePage";
import { ArmoryCategoryPage } from "@/pages/ArmoryCategoryPage";
import { CardBrowserPage } from "@/pages/CardBrowserPage";
import { DispatchSetupPage } from "@/pages/DispatchSetupPage";
import { NegotiationPage } from "@/pages/NegotiationPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/armory" element={<ArmoryCategoryPage />} />
          <Route path="/armory/:category" element={<CardBrowserPage />} />
          <Route path="/dispatch" element={<DispatchSetupPage />} />
          <Route path="/negotiation" element={<NegotiationPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);

