import * as admin from "firebase-admin";

import * as functions from "firebase-functions/v1";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Import function modules
import { setUserRole } from "./auth";
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
export { setUserRole };

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

export const dailyCleanup = functions.pubsub
  .schedule("0 2 * * *") // Run daily at 2 AM
  .timeZone("Asia/Kolkata")
  .onRun(async (context) => {
    console.log("Running daily cleanup");
    await cleanupOldNotifications();
    return null;
  });
  

// HTTP functions for external integrations
export const webhookHandler = functions.https.onRequest(async (req, res) => {
  // Handle webhooks from external services
  const { body } = req;

  // Verify webhook signature (implement based on service)
  // const isValid = verifyWebhookSignature(body, headers);
  // if (!isValid) {
  //   res.status(401).send('Unauthorized');
  //   return;
  // }

  try {
    // Process webhook data
    console.log("Webhook received:", data);

    // Handle different webhook types
    switch (body.type) {
    case "payment_success":
      await handlePaymentSuccess(body.data);
      break;
    case "investment_milestone":
      await handleInvestmentMilestone(body.data);
      break;
    default:
      console.log("Unknown webhook type:", body.type);
    }

    return { success: true };
  } catch (error) {
    console.error("Webhook error:", error);
    throw error;
  }
});

// Health check endpoint
export const healthCheck = onCall(async (_request) => {
  return {
    status: "healthy",
    timestamp: admin.firestore.Timestamp.now().toDate().toISOString(),
    version: "1.0.0",
  };
});

// Helper functions
async function handlePaymentSuccess(data: Record<string, unknown>) {
  // Handle successful payment notifications
  console.log("Payment success:", data);
  // Update investment status, send notifications, etc.
}

async function handleInvestmentMilestone(data: Record<string, unknown>) {
  // Handle investment milestone updates
  console.log("Investment milestone:", data);
  // Update portfolio metrics, send notifications, etc.
}
