import * as admin from "firebase-admin";
import {
  onDocumentCreated,
  onDocumentUpdated,
} from "firebase-functions/v2/firestore";

// Trigger when a new business idea is created
export const onBusinessIdeaCreated = onDocumentCreated(
  "businessIdeas/{ideaId}",
  async (event) => {
    const snap = event.data;
    if (!snap) return;
    const ideaData = snap.data();
    const ideaId = event.params.ideaId;

    try {
      // Send notifications to all investors
      const investorsQuery = await admin
        .firestore()
        .collection("users")
        .where("role", "==", "investor")
        .get();

      const notifications: Array<Record<string, unknown>> = [];

      investorsQuery.docs.forEach((investorDoc) => {
        notifications.push({
          userId: investorDoc.id,
          title: "New Business Proposal",
          body: `Check out the new business idea: "${ideaData.title}"`,
          type: "NEW_BUSINESS_PROPOSAL",
          data: {
            ideaId: ideaId,
            ideaTitle: ideaData.title,
            category: ideaData.category,
            budget: ideaData.budget,
          },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      // Batch write notifications
      if (notifications.length > 0) {
        const batch = admin.firestore().batch();
        notifications.forEach((notification) => {
          const notificationRef = admin
            .firestore()
            .collection("notifications")
            .doc();
          batch.set(notificationRef, notification);
        });
        await batch.commit();
      }

      // Send FCM push notifications (if you have user tokens stored)
      const fcmPayload = {
        notification: {
          title: "New Business Proposal",
          body: `"${ideaData.title}" is looking for investment`,
          icon: "/icon-192x192.png",
        },
        data: {
          type: "NEW_BUSINESS_PROPOSAL",
          ideaId: ideaId,
          click_action: "/view-proposals",
        },
      };

      // Get FCM tokens for investors (you would store these in user profiles)
      const fcmTokensQuery = await admin
        .firestore()
        .collection("users")
        .where("role", "==", "investor")
        .where("fcmToken", "!=", null)
        .get();

      const fcmTokens = fcmTokensQuery.docs
        .map((doc) => doc.data().fcmToken)
        .filter((token) => token);

      if (fcmTokens.length > 0) {
        await admin.messaging().sendToDevice(fcmTokens, fcmPayload);
      }

      // Log the event
      await admin
        .firestore()
        .collection("logs")
        .add({
          userId: ideaData.userId,
          action: "BUSINESS_IDEA_PUBLISHED",
          data: {
            ideaId: ideaId,
            title: ideaData.title,
            category: ideaData.category,
            notificationsSent: notifications.length,
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(
        `Business idea created: ${ideaId}, notifications sent: ${notifications.length}`,
      );
    } catch (error) {
      console.error("Error in onBusinessIdeaCreated:", error);
    }
  },
);

// Trigger when a new investment proposal is created
export const onInvestmentProposalCreated = onDocumentCreated(
  "investmentProposals/{proposalId}",
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const proposalData = snap.data();
    const proposalId = event.params.proposalId;

    try {
      // Get the business idea to find the owner
      const businessIdeaDoc = await admin
        .firestore()
        .collection("businessIdeas")
        .doc(proposalData.businessIdeaId)
        .get();

      if (!businessIdeaDoc.exists) {
        console.error("Business idea not found:", proposalData.businessIdeaId);
        return;
      }

      const businessIdeaData = businessIdeaDoc.data();
      if (!businessIdeaData) {
        console.error(
          "Business idea data not found:",
          proposalData.businessIdeaId,
        );
        return;
      }
      const businessIdea = businessIdeaData;

      // Send notification to business idea owner
      await admin
        .firestore()
        .collection("notifications")
        .add({
          userId: businessIdea.userId,
          title: "New Investment Proposal",
          body: `You received an investment proposal of ₹${proposalData.amount.toLocaleString()} for "${businessIdea.title}"`,
          type: "NEW_INVESTMENT_PROPOSAL",
          data: {
            proposalId: proposalId,
            businessIdeaId: proposalData.businessIdeaId,
            amount: proposalData.amount,
            investorId: proposalData.investorId,
            businessTitle: businessIdea.title,
          },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      // Update business idea interested count
      await admin
        .firestore()
        .collection("businessIdeas")
        .doc(proposalData.businessIdeaId)
        .update({
          interested: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      // Log the event
      await admin
        .firestore()
        .collection("logs")
        .add({
          userId: proposalData.investorId,
          action: "INVESTMENT_PROPOSAL_CREATED",
          data: {
            proposalId: proposalId,
            businessIdeaId: proposalData.businessIdeaId,
            amount: proposalData.amount,
            targetUserId: businessIdea.userId,
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(`Investment proposal created: ${proposalId}`);
    } catch (error) {
      console.error("Error in onInvestmentProposalCreated:", error);
    }
  },
);

// Trigger when a new query is created
export const onQueryCreated = onDocumentCreated(
  "queries/{queryId}",
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const queryData = snap.data();
    const queryId = event.params.queryId;

    try {
      // Send notifications to all business advisors
      const advisorsQuery = await admin
        .firestore()
        .collection("users")
        .where("role", "==", "business_advisor")
        .get();

      const notifications: Array<Record<string, unknown>> = [];

      advisorsQuery.docs.forEach((advisorDoc) => {
        notifications.push({
          userId: advisorDoc.id,
          title: "New Business Query",
          body: `A new question needs your expertise: "${queryData.title}"`,
          type: "NEW_QUERY",
          data: {
            queryId: queryId,
            queryTitle: queryData.title,
            category: queryData.category,
            priority: queryData.priority,
            askedBy: queryData.userId,
          },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      // Batch write notifications
      if (notifications.length > 0) {
        const batch = admin.firestore().batch();
        notifications.forEach((notification) => {
          const notificationRef = admin
            .firestore()
            .collection("notifications")
            .doc();
          batch.set(notificationRef, notification);
        });
        await batch.commit();
      }

      // Log the event
      await admin
        .firestore()
        .collection("logs")
        .add({
          userId: queryData.userId,
          action: "QUERY_CREATED",
          data: {
            queryId: queryId,
            title: queryData.title,
            category: queryData.category,
            priority: queryData.priority,
            advisorsNotified: notifications.length,
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(
        `Query created: ${queryId}, advisors notified: ${notifications.length}`,
      );
    } catch (error) {
      console.error("Error in onQueryCreated:", error);
    }
  },
);

// Trigger when a new response is created
export const onResponseCreated = onDocumentCreated(
  "responses/{responseId}",
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const responseData = snap.data();
    const responseId = event.params.responseId;

    try {
      // Get the query to find the original asker
      const queryDoc = await admin
        .firestore()
        .collection("queries")
        .doc(responseData.queryId)
        .get();

      if (!queryDoc.exists) {
        console.error("Query not found:", responseData.queryId);
        return;
      }

      const queryData = queryDoc.data();
      if (!queryData) {
        console.error("Query data not found:", responseData.queryId);
        return;
      }
      const query = queryData;

      // Send notification to query owner
      await admin
        .firestore()
        .collection("notifications")
        .add({
          userId: query.userId,
          title: "Query Answered",
          body: `Your question "${query.title}" has received a new response`,
          type: "NEW_RESPONSE",
          data: {
            responseId: responseId,
            queryId: responseData.queryId,
            queryTitle: query.title,
            advisorId: responseData.advisorId,
          },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      // Log the event
      await admin
        .firestore()
        .collection("logs")
        .add({
          userId: responseData.advisorId,
          action: "RESPONSE_CREATED",
          data: {
            responseId: responseId,
            queryId: responseData.queryId,
            queryTitle: query.title,
            targetUserId: query.userId,
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(`Response created: ${responseId}`);
    } catch (error) {
      console.error("Error in onResponseCreated:", error);
    }
  },
);

// Trigger when a new advisor suggestion is created
export const onAdvisorSuggestionCreated = onDocumentCreated(
  "advisorSuggestions/{suggestionId}",
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const suggestionData = snap.data();
    const suggestionId = event.params.suggestionId;

    try {
      // Determine who to notify based on target user or general audience
      let targetUserIds: string[] = [];

      if (suggestionData.targetUserId) {
        // Specific user suggestion
        targetUserIds = [suggestionData.targetUserId];
      } else {
        // General suggestion - notify all business persons
        const businessPersonsQuery = await admin
          .firestore()
          .collection("users")
          .where("role", "==", "business_person")
          .get();

        targetUserIds = businessPersonsQuery.docs.map((doc) => doc.id);
      }

      const notifications: Array<Record<string, unknown>> = [];

      targetUserIds.forEach((userId) => {
        notifications.push({
          userId: userId,
          title: "New Expert Advice",
          body: `New expert tip available: "${suggestionData.title}"`,
          type: "NEW_ADVISOR_TIP",
          data: {
            suggestionId: suggestionId,
            suggestionTitle: suggestionData.title,
            category: suggestionData.category,
            advisorId: suggestionData.advisorId,
            priority: suggestionData.priority,
          },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      // Batch write notifications
      if (notifications.length > 0) {
        const batch = admin.firestore().batch();
        notifications.forEach((notification) => {
          const notificationRef = admin
            .firestore()
            .collection("notifications")
            .doc();
          batch.set(notificationRef, notification);
        });
        await batch.commit();
      }

      // Log the event
      await admin
        .firestore()
        .collection("logs")
        .add({
          userId: suggestionData.advisorId,
          action: "ADVISOR_SUGGESTION_CREATED",
          data: {
            suggestionId: suggestionId,
            title: suggestionData.title,
            category: suggestionData.category,
            targetUserId: suggestionData.targetUserId || "general",
            notificationsSent: notifications.length,
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(
        `Advisor suggestion created: ${suggestionId}, notifications sent: ${notifications.length}`,
      );
    } catch (error) {
      console.error("Error in onAdvisorSuggestionCreated:", error);
    }
  },
);

// Trigger when a new loan scheme is created
export const onLoanSchemeCreated = onDocumentCreated(
  "loanSchemes/{schemeId}",
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const schemeData = snap.data();
    const schemeId = event.params.schemeId;

    try {
      // Send notifications to all business persons and investors
      const usersQuery = await admin
        .firestore()
        .collection("users")
        .where("role", "in", ["business_person", "investor"])
        .get();

      const notifications: Array<Record<string, unknown>> = [];

      usersQuery.docs.forEach((userDoc) => {
        notifications.push({
          userId: userDoc.id,
          title: "New Loan Scheme Available",
          body: `${schemeData.bankName} launched "${schemeData.schemeName}" - ${schemeData.minAmount} to ${schemeData.maxAmount}`,
          type: "NEW_LOAN_SCHEME",
          data: {
            schemeId: schemeId,
            schemeName: schemeData.schemeName,
            bankName: schemeData.bankName,
            schemeType: schemeData.schemeType,
            minAmount: schemeData.minAmount,
            maxAmount: schemeData.maxAmount,
          },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });

      // Batch write notifications
      if (notifications.length > 0) {
        const batch = admin.firestore().batch();
        notifications.forEach((notification) => {
          const notificationRef = admin
            .firestore()
            .collection("notifications")
            .doc();
          batch.set(notificationRef, notification);
        });
        await batch.commit();
      }

      // Log the event
      await admin
        .firestore()
        .collection("logs")
        .add({
          userId: schemeData.bankerId,
          action: "LOAN_SCHEME_CREATED",
          data: {
            schemeId: schemeId,
            schemeName: schemeData.schemeName,
            bankName: schemeData.bankName,
            schemeType: schemeData.schemeType,
            notificationsSent: notifications.length,
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(
        `Loan scheme created: ${schemeId}, notifications sent: ${notifications.length}`,
      );
    } catch (error) {
      console.error("Error in onLoanSchemeCreated:", error);
    }
  },
);

// Trigger when an investment proposal status is updated
export const onInvestmentProposalUpdated = onDocumentUpdated(
  "investmentProposals/{proposalId}",
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    const proposalId = event.params.proposalId;

    // Only trigger if status changed
    if (before.status === after.status) {
      return;
    }

    try {
      // Get the business idea to find relevant parties
      const businessIdeaDoc = await admin
        .firestore()
        .collection("businessIdeas")
        .doc(after.businessIdeaId)
        .get();

      if (!businessIdeaDoc.exists) {
        console.error("Business idea not found:", after.businessIdeaId);
        return;
      }

      const businessIdeaData = businessIdeaDoc.data();
      if (!businessIdeaData) {
        console.error("Business idea data not found:", after.businessIdeaId);
        return;
      }
      const businessIdea = businessIdeaData;

      // Send notification to investor about status change
      await admin
        .firestore()
        .collection("notifications")
        .add({
          userId: after.investorId,
          title: "Proposal Status Update",
          body: `Your proposal for "${businessIdea.title}" has been ${after.status}`,
          type: "PROPOSAL_STATUS_UPDATE",
          data: {
            proposalId: proposalId,
            businessIdeaId: after.businessIdeaId,
            businessTitle: businessIdea.title,
            status: after.status,
            amount: after.amount,
          },
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      // If accepted, add to investor's portfolio
      if (after.status === "accepted") {
        const portfolioRef = admin
          .firestore()
          .collection("portfolios")
          .doc(after.investorId);

        const portfolioDoc = await portfolioRef.get();

        const investment = {
          businessIdeaId: after.businessIdeaId,
          amount: after.amount,
          equity: after.equity || 0,
          dateInvested: admin.firestore.FieldValue.serverTimestamp(),
          status: "active",
          currentValue: after.amount, // Initial value
        };

        if (portfolioDoc.exists) {
          await portfolioRef.update({
            investments: admin.firestore.FieldValue.arrayUnion(investment),
            totalInvested: admin.firestore.FieldValue.increment(after.amount),
            totalValue: admin.firestore.FieldValue.increment(after.amount),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } else {
          await portfolioRef.set({
            investorId: after.investorId,
            investments: [investment],
            totalInvested: after.amount,
            totalValue: after.amount,
            roi: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      // Log the event
      await admin
        .firestore()
        .collection("logs")
        .add({
          userId: after.investorId,
          action: "INVESTMENT_PROPOSAL_STATUS_UPDATED",
          data: {
            proposalId: proposalId,
            businessIdeaId: after.businessIdeaId,
            oldStatus: before.status,
            newStatus: after.status,
            amount: after.amount,
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(
        `Investment proposal ${proposalId} status changed: ${before.status} -> ${after.status}`,
      );
    } catch (error) {
      console.error("Error in onInvestmentProposalUpdated:", error);
    }
  },
);
