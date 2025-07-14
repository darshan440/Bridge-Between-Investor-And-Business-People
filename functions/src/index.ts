import * as admin from "firebase-admin";

import * as functions from "firebase-functions/v1";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Import function modules
import { setUserRole } from "./auth";
import {
  changeUserRole,
  getAvailableRoles,
  approveRoleChange,
} from "./roleManagement";
import {
  completeUserProfile,
  getProfileCompletionStatus,
} from "./profileManagement";
import {
  postBusinessIdea,
  postLoanScheme,
  postSolution,
  getBusinessIdeas,
  getLoanSchemes,
} from "./posts";
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
import { onCall } from "firebase-functions/https";

// Authentication functions
export { setUserRole };

// Role management functions
export { changeUserRole, getAvailableRoles, approveRoleChange };

// Profile management functions
export { completeUserProfile, getProfileCompletionStatus };

// Posts management functions
export {
  postBusinessIdea,
  postLoanScheme,
  postSolution,
  getBusinessIdeas,
  getLoanSchemes,
} from "./posts";

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

import { onSchedule } from "firebase-functions/v2/scheduler";

export const dailyCleanup = onSchedule(
  {
    schedule: "0 2 * * *",
    timeZone: "Asia/Kolkata",
  },
  async () => {
    console.log("Running daily cleanup");
    // Import cleanupOldNotifications here to avoid circular dependency
    const { cleanupOldNotifications } = await import("./notifications");
    await cleanupOldNotifications();
  },
);

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
    console.log("Webhook received:", body);

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

    res.status(200).send({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).send({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
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
