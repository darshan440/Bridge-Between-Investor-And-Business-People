import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PostIdea from "./pages/PostIdea";
import ViewProposals from "./pages/ViewProposals";
import PostSolution from "./pages/PostSolution";
import QueryPanel from "./pages/QueryPanel";
import PostLoanSchemes from "./pages/PostLoanSchemes";
import ViewAdvisorSuggestions from "./pages/ViewAdvisorSuggestions";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              {/* Business Person Routes */}
              <Route path="/post-idea" element={<PostIdea />} />
              <Route
                path="/advisor-suggestions"
                element={<ViewAdvisorSuggestions />}
              />
              <Route path="/query-panel" element={<QueryPanel />} />
              {/* Investor Routes */}
              <Route path="/view-proposals" element={<ViewProposals />} />
              <Route path="/post-investment" element={<Dashboard />} />
              <Route path="/portfolio" element={<Dashboard />} />
              {/* Business Advisor Routes */}
              <Route path="/post-advice" element={<Dashboard />} />
              <Route path="/view-queries" element={<Dashboard />} />
              <Route path="/post-solution" element={<PostSolution />} />
              {/* Banker Routes */}
              <Route path="/post-loan-schemes" element={<PostLoanSchemes />} />
              <Route path="/view-loan-proposals" element={<Dashboard />} />
              <Route path="/risk-assessment" element={<Dashboard />} />
              {/* User Routes */}
              <Route path="/browse" element={<Dashboard />} />
              <Route path="/categories" element={<Dashboard />} />
              <Route path="/help" element={<Dashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

// Initialize Firebase messaging for push notifications
const initializeApp = async () => {
  try {
    // Import messaging initialization
    const { initializeMessaging } = await import("@/lib/messaging");

    // Initialize messaging when user is authenticated
    const { auth, isFirebaseEnabled } = await import("@/lib/firebase");

    if (!isFirebaseEnabled || !auth) {
      console.log("Firebase not configured, skipping messaging initialization");
      return;
    }

    auth.onAuthStateChanged((user) => {
      if (user) {
        initializeMessaging(user.uid).catch((error) => {
          console.warn("Failed to initialize messaging:", error);
        });
      }
    });
  } catch (error) {
    console.error("Error initializing app:", error);
    // Don't throw the error, just log it
  }
};

// Handle global errors
window.addEventListener("error", (event) => {
  // Filter out third-party script errors and development tool errors
  if (
    event.filename?.includes("fullstory.com") ||
    event.filename?.includes("@vite/client") ||
    event.message?.includes("frame")
  ) {
    console.warn("Suppressed external error:", event.message);
    event.preventDefault();
    return false;
  }
});

window.addEventListener("unhandledrejection", (event) => {
  // Handle unhandled promise rejections
  console.error("Unhandled promise rejection:", event.reason);

  // Prevent default handling for specific errors
  if (event.reason?.message?.includes("network-request-failed")) {
    console.warn(
      "Network error suppressed - likely Firebase configuration issue",
    );
    event.preventDefault();
  }
});

// Initialize the app
initializeApp();

createRoot(document.getElementById("root")!).render(<App />);
