import * as admin from "firebase-admin";

import * as functions from "firebase-functions/v1";

// Initialize Firebase Admin SDK
admin.initializeApp();

// Import function modules
import { onCall } from "firebase-functions/v2/https";
import { generateRiskAssessment, updatePortfolioMetrics } from "./analytics";
import { setUserRole } from "./auth";
import {
  acceptInvestmentProposal,
  createInvestmentProposal,
  getMyInvestments,
  getMyProposals,
} from "./investments";
import { createLoanProposal } from "./loanProposals";
import {
  completeUserProfile,
  getProfileCompletionStatus,
} from "./profileManagement";
import {
  approveRoleChange,
  changeUserRole,
  getAvailableRoles,
} from "./roleManagement";
import {
  onAdvisorSuggestionCreated,
  onBusinessIdeaCreated,
  onInvestmentProposalCreated,
  onLoanSchemeCreated,
  onQueryCreated,
  onResponseCreated,
} from "./triggers";
// Authentication functions
export { setUserRole };

// Role management functions
export { approveRoleChange, changeUserRole, getAvailableRoles };

// Profile management functions
export { completeUserProfile, getProfileCompletionStatus };

// Posts management functions
export {
  getBusinessIdeas,
  getLoanSchemes,
  postBusinessIdea,
  postLoanScheme,
  postSolution,
} from "./posts";

export { createLoanProposal };
// Firestore trigger functions
export {
  onAdvisorSuggestionCreated,
  onBusinessIdeaCreated,
  onInvestmentProposalCreated,
  onLoanSchemeCreated,
  onQueryCreated,
  onResponseCreated,
};

// Notification functions
export {
  cleanupOldNotifications,
  getUserNotifications,
  markNotificationAsRead,
  sendBulkNotifications,
  sendNotification,
} from "./notifications";

// Analytics and automation functions
export { generateRiskAssessment, updatePortfolioMetrics };

// Investment functions
export {
  acceptInvestmentProposal,
  createInvestmentProposal,
  getMyInvestments,
  getMyProposals,
};

import { onSchedule } from "firebase-functions/v2/scheduler";

export const dailyCleanup = onSchedule(
  {
    schedule: "0 2 * * *",
    timeZone: "Asia/Kolkata",
  },
  async (event) => {
    console.log("Running daily cleanup");
    // Run cleanup directly here
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);

      const batch = admin.firestore().batch();
      const oldNotifications = await admin
        .firestore()
        .collection("notifications")
        .where("createdAt", "<", cutoffDate)
        .limit(500)
        .get();

      oldNotifications.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(`Deleted ${oldNotifications.size} old notifications`);

      // Log cleanup
      await admin
        .firestore()
        .collection("logs")
        .add({
          userId: "system",
          action: "NOTIFICATIONS_CLEANUP",
          data: {
            deletedCount: oldNotifications.size,
            cutoffDate: cutoffDate.toISOString(),
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error("Error cleaning up notifications:", error);
    }
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
