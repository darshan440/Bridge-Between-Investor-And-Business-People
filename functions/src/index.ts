import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Import function modules
import { setUserRole, onUserCreated } from "./auth";
import {
  onBusinessIdeaCreated,
  onInvestmentProposalCreated,
  onQueryCreated,
  onResponseCreated,
  onAdvisorSuggestionCreated,
  onLoanSchemeCreated,
} from "./triggers";
import {
  sendNotification,
  sendBulkNotifications,
  cleanupOldNotifications,
} from "./notifications";
import { generateRiskAssessment, updatePortfolioMetrics } from "./analytics";

// Authentication functions
export { setUserRole, onUserCreated };

// Firestore trigger functions
export {
  onBusinessIdeaCreated,
  onInvestmentProposalCreated,
  onQueryCreated,
  onResponseCreated,
  onAdvisorSuggestionCreated,
  onLoanSchemeCreated,
};

// Notification functions
export { sendNotification, sendBulkNotifications };

// Analytics and automation functions
export { generateRiskAssessment, updatePortfolioMetrics };

// Scheduled functions
export const dailyCleanup = onSchedule("0 2 * * *", async (event) => {
  console.log("Running daily cleanup");
  await cleanupOldNotifications();
  return null;
});

// HTTP functions for external integrations
export const webhookHandler = onCall(async (request) => {
  const { data } = request;
  try {
    // Process webhook data
    console.log("Webhook received:", data);

    // Handle different webhook types
    switch (data.type) {
      case "payment_success":
        await handlePaymentSuccess(data.data);
        break;
      case "investment_milestone":
        await handleInvestmentMilestone(data.data);
        break;
      default:
        console.log("Unknown webhook type:", data.type);
    }

    return { success: true };
  } catch (error) {
    console.error("Webhook error:", error);
    throw error;
  }
});

// Health check endpoint
export const healthCheck = onCall(async (request) => {
  return {
    status: "healthy",
    timestamp: admin.firestore.Timestamp.now().toDate().toISOString(),
    version: "1.0.0",
  };
});

// Helper functions
async function handlePaymentSuccess(data: any) {
  // Handle successful payment notifications
  console.log("Payment success:", data);
  // Update investment status, send notifications, etc.
}

async function handleInvestmentMilestone(data: any) {
  // Handle investment milestone updates
  console.log("Investment milestone:", data);
  // Update portfolio metrics, send notifications, etc.
}
