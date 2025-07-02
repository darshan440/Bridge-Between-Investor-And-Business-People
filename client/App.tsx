import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Placeholder routes for future implementation */}
          <Route path="/post-idea" element={<Dashboard />} />
          <Route path="/view-proposals" element={<Dashboard />} />
          <Route path="/post-solution" element={<Dashboard />} />
          <Route path="/query-panel" element={<Dashboard />} />
          <Route path="/advisor-suggestions" element={<Dashboard />} />
          <Route path="/post-investment" element={<Dashboard />} />
          <Route path="/portfolio" element={<Dashboard />} />
          <Route path="/post-advice" element={<Dashboard />} />
          <Route path="/view-queries" element={<Dashboard />} />
          <Route path="/post-loan-schemes" element={<Dashboard />} />
          <Route path="/view-loan-proposals" element={<Dashboard />} />
          <Route path="/risk-assessment" element={<Dashboard />} />
          <Route path="/browse" element={<Dashboard />} />
          <Route path="/categories" element={<Dashboard />} />
          <Route path="/help" element={<Dashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
