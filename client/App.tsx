import "./global.css";

import ErrorBoundary from "@/components/ErrorBoundary";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";

// Extend HTMLElement to include _reactRootContainer property
declare global {
  interface HTMLElement {
    _reactRootContainer?: any;
  }
}

import Browse from "./pages/Browse";
import Categories from "./pages/Categories";
import CompleteProfile from "./pages/CompleteProfile";
import Help from "./pages/Help";
import MyInvestments from "./pages/MyInvestments";
import PostIdea from "./pages/PostIdea";
import PostLoanSchemes from "./pages/PostLoanSchemes";
import PostSolution from "./pages/PostSolution";
import Profile from "./pages/Profile";
import QueryPanel from "./pages/QueryPanel";
import ViewAdvisorSuggestions from "./pages/ViewAdvisorSuggestions";
import ViewProposals from "./pages/ViewProposals";

import NotFound from "./pages/NotFound";
import PostAdvice from "./pages/PostAdvice";
import ViewIdeaDetails from "./pages/ViewIdeaDetails";
import ViewQueries from "./pages/ViewQueries";

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
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/complete-profile" element={<CompleteProfile />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              {/* Business Person Routes */}
              <Route path="/post-idea" element={<PostIdea />} />
              <Route path="/idea/:id" element={<ViewIdeaDetails />} />
              <Route
                path="/advisor-suggestions"
                element={<ViewAdvisorSuggestions />}
              />
              <Route path="/query-panel" element={<QueryPanel />} />
              {/* Investor Routes */}
              <Route path="/view-proposals" element={<ViewProposals />} />

              <Route path="/portfolio" element={<MyInvestments />} />
              {/* Business Advisor Routes */}
              <Route path="/post-advice" element={<PostAdvice />} />
              <Route path="/view-queries" element={<ViewQueries />} />
              <Route path="/post-solution" element={<PostSolution />} />
              {/* Banker Routes */}
              <Route path="/post-loan-schemes" element={<PostLoanSchemes />} />
              <Route path="/view-loan-proposals" element={<Dashboard />} />
              <Route path="/risk-assessment" element={<Dashboard />} />
              {/* User Routes */}
              <Route path="/browse" element={<Browse />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/help" element={<Help />} />
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

// Prevent multiple root creation during hot reload
const container = document.getElementById("root");

if (!container) {
  throw new Error(
    "Root container not found. Make sure you have a div with id='root' in your HTML.",
  );
}

let root: any;

// Check if root already exists (for hot reload scenarios)
if (!container._reactRootContainer) {
  try {
    root = createRoot(container);
    container._reactRootContainer = root;
    console.log("✅ React root created successfully");
  } catch (error) {
    console.error("❌ Error creating React root:", error);
    throw error;
  }
} else {
  root = container._reactRootContainer;
  console.log("♻️ Reusing existing React root");
}

// Render the app
try {
  root.render(<App />);
} catch (error) {
  console.error("❌ Error rendering App:", error);
  throw error;
}

// Hot reload cleanup for development
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    if (container._reactRootContainer) {
      console.log("🔄 Cleaning up React root for hot reload");
      try {
        container._reactRootContainer.unmount();
      } catch (error) {
        console.warn("Warning during root cleanup:", error);
      }
      delete container._reactRootContainer;
    }
  });
}
