import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";

const db = admin.firestore();

// Send notification to a specific user
export const sendNotification = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated.");
  }

  const { userId, title, body, type, data } = request.data;

  try {
    await db.collection("notifications").add({
      userId,
      title,
      body,
      type,
      data: data || {},
      read: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true, message: "Notification sent successfully!" };
  } catch (error) {
    console.error("Error sending notification:", error);
    throw new Error("Failed to send notification.");
  }
});

// Send bulk notifications
export const sendBulkNotifications = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated.");
  }

  const { userIds, title, body, type, data } = request.data;

  try {
    const batch = db.batch();
    const notificationsRef = db.collection("notifications");

    userIds.forEach((userId: string) => {
      const docRef = notificationsRef.doc();
      batch.set(docRef, {
        userId,
        title,
        body,
        type,
        data: data || {},
        read: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    return { 
      success: true, 
      message: `Bulk notifications sent to ${userIds.length} users!` 
    };
  } catch (error) {
    console.error("Error sending bulk notifications:", error);
    throw new Error("Failed to send bulk notifications.");
  }
});

// Get user notifications
export const getUserNotifications = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated.");
  }

  const { limit = 20, lastVisible } = request.data;

  try {
    let query = db
      .collection("notifications")
      .where("userId", "==", request.auth.uid)
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (lastVisible) {
      const lastDoc = await db.collection("notifications").doc(lastVisible).get();
      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      notifications,
      hasMore: snapshot.docs.length === limit,
      lastVisible: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1].id : null,
    };
  } catch (error) {
    console.error("Error getting notifications:", error);
    throw new Error("Failed to get notifications.");
  }
});

// Mark notification as read
export const markNotificationAsRead = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated.");
  }

  const { notificationId } = request.data;

  try {
    await db.collection("notifications").doc(notificationId).update({
      read: true,
      readAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true, message: "Notification marked as read!" };
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw new Error("Failed to mark notification as read.");
  }
});

// Clean up old notifications (called by scheduler)
export const cleanupOldNotifications = onCall(async (request) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days old

    const batch = db.batch();
    const oldNotifications = await db
      .collection("notifications")
      .where("createdAt", "<", cutoffDate)
      .limit(500)
      .get();

    oldNotifications.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log(`Deleted ${oldNotifications.size} old notifications`);

    return {
      success: true,
      deletedCount: oldNotifications.size,
      message: "Old notifications cleaned up successfully!",
    };
  } catch (error) {
    console.error("Error cleaning up notifications:", error);
    throw new Error("Failed to clean up notifications.");
  }
});

// Notify investors about new business idea
export const notifyInvestorsAboutNewIdea = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated.");
  }

  const { businessIdeaId, title, category, authorName } = request.data;

  try {
    // Get all investors
    const investorsQuery = await db
      .collection("users")
      .where("role", "==", "investor")
      .get();

    const investorIds = investorsQuery.docs.map((doc) => doc.id);

    if (investorIds.length > 0) {
      // Send bulk notification to investors
      const batch = db.batch();
      const notificationsRef = db.collection("notifications");

      investorIds.forEach((investorId) => {
        const docRef = notificationsRef.doc();
        batch.set(docRef, {
          userId: investorId,
          title: "New Business Idea Posted",
          body: `${authorName} posted a new business idea in ${category}: "${title}"`,
          type: "NEW_BUSINESS_IDEA",
          data: {
            businessIdeaId,
            category,
            authorName,
          },
          read: false,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();

      console.log(`Notified ${investorIds.length} investors about new business idea`);

      return {
        success: true,
        notifiedCount: investorIds.length,
        message: `Notified ${investorIds.length} investors about the new business idea!`,
      };
    }

    return {
      success: true,
      notifiedCount: 0,
      message: "No investors to notify.",
    };
  } catch (error) {
    console.error("Error notifying investors:", error);
    throw new Error("Failed to notify investors.");
  }
});

// Notify business person about investment
export const notifyBusinessPersonAboutInvestment = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated.");
  }

  const { 
    businessPersonId, 
    businessIdeaId, 
    businessIdeaTitle, 
    investorName, 
    amount 
  } = request.data;

  try {
    await db.collection("notifications").add({
      userId: businessPersonId,
      title: "New Investment Received",
      body: `${investorName} has invested ₹${amount.toLocaleString('en-IN')} in your business idea: "${businessIdeaTitle}"`,
      type: "INVESTMENT_RECEIVED",
      data: {
        businessIdeaId,
        investorId: request.auth.uid,
        investorName,
        amount,
      },
      read: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: "Business person notified about investment!",
    };
  } catch (error) {
    console.error("Error notifying business person:", error);
    throw new Error("Failed to notify business person.");
  }
});

// Notify advisor about new query
export const notifyAdvisorsAboutNewQuery = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated.");
  }

  const { queryId, title, category, authorName } = request.data;

  try {
    // Get all business advisors
    const advisorsQuery = await db
      .collection("users")
      .where("role", "==", "business_advisor")
      .get();

    const advisorIds = advisorsQuery.docs.map((doc) => doc.id);

    if (advisorIds.length > 0) {
      // Send bulk notification to advisors
      const batch = db.batch();
      const notificationsRef = db.collection("notifications");

      advisorIds.forEach((advisorId) => {
        const docRef = notificationsRef.doc();
        batch.set(docRef, {
          userId: advisorId,
          title: "New Business Query Posted",
          body: `${authorName} posted a new query in ${category}: "${title}"`,
          type: "NEW_QUERY",
          data: {
            queryId,
            category,
            authorName,
          },
          read: false,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();

      console.log(`Notified ${advisorIds.length} advisors about new query`);

      return {
        success: true,
        notifiedCount: advisorIds.length,
        message: `Notified ${advisorIds.length} advisors about the new query!`,
      };
    }

    return {
      success: true,
      notifiedCount: 0,
      message: "No advisors to notify.",
    };
  } catch (error) {
    console.error("Error notifying advisors:", error);
    throw new Error("Failed to notify advisors.");
  }
});
