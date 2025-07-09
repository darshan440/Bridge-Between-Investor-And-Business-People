import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import { SendNotificationData, SendBulkNotificationsData } from "./types";

// Send individual notification
export const sendNotification = onCall<SendNotificationData>(
  async (request) => {
    if (!request.auth) {
      throw new Error("User must be authenticated to send notifications.");
    }

    const { userId, title, body, type, data: notificationData } = request.data;

    try {
      // Create notification document
      const notificationRef = await admin
        .firestore()
        .collection("notifications")
        .add({
          userId,
          title,
          body,
          type: type || "GENERAL",
          data: notificationData || {},
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      // Get user's FCM token if available
      const userDoc = await admin
        .firestore()
        .collection("users")
        .doc(userId)
        .get();

      if (userDoc.exists) {
        const userData = userDoc.data()!;
        const fcmToken = userData.fcmToken;

        if (fcmToken) {
          // Send FCM push notification
          const message = {
            token: fcmToken,
            notification: {
              title,
              body,
            },
            data: {
              type: type || "GENERAL",
              notificationId: notificationRef.id,
              ...(notificationData || {}),
            },
            webpush: {
              fcmOptions: {
                link: getNotificationUrl(type || "GENERAL", notificationData),
              },
            },
          };

          await admin.messaging().send(message);
        }
      }

      // Log notification sent
      await admin
        .firestore()
        .collection("logs")
        .add({
          userId: request.auth.uid,
          action: "NOTIFICATION_SENT",
          data: {
            targetUserId: userId,
            notificationId: notificationRef.id,
            type,
            title,
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

      return { success: true, notificationId: notificationRef.id };
    } catch (error) {
      console.error("Error sending notification:", error);
      throw new Error("Failed to send notification.");
    }
  },
);

// Send bulk notifications
export const sendBulkNotifications = onCall<SendBulkNotificationsData>(
  async (request) => {
    if (!request.auth) {
      throw new Error("User must be authenticated to send bulk notifications.");
    }

    const { userIds, title, body, type, data: notificationData } = request.data;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new Error("userIds must be a non-empty array.");
    }

    try {
      const batch = admin.firestore().batch();
      const notifications: any[] = [];

      // Create notification documents
      userIds.forEach((userId) => {
        const notificationRef = admin
          .firestore()
          .collection("notifications")
          .doc();
        const notification = {
          userId,
          title,
          body,
          type: type || "GENERAL",
          data: notificationData || {},
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        batch.set(notificationRef, notification);
        notifications.push({ id: notificationRef.id, ...notification });
      });

      await batch.commit();

      // Get FCM tokens for users
      const userDocs = await admin
        .firestore()
        .collection("users")
        .where(admin.firestore.FieldPath.documentId(), "in", userIds)
        .get();

      const fcmTokens: string[] = [];
      userDocs.docs.forEach((doc) => {
        const userData = doc.data();
        if (userData.fcmToken) {
          fcmTokens.push(userData.fcmToken);
        }
      });

      // Send FCM push notifications
      if (fcmTokens.length > 0) {
        const message = {
          notification: {
            title,
            body,
          },
          data: {
            type: type || "GENERAL",
            ...(notificationData || {}),
          },
          webpush: {
            fcmOptions: {
              link: getNotificationUrl(type || "GENERAL", notificationData),
            },
          },
          tokens: fcmTokens,
        };

        await admin.messaging().sendMulticast(message);
      }

      // Log bulk notification sent
      await admin
        .firestore()
        .collection("logs")
        .add({
          userId: request.auth.uid,
          action: "BULK_NOTIFICATION_SENT",
          data: {
            targetUserCount: userIds.length,
            type,
            title,
            fcmTokensSent: fcmTokens.length,
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

      return {
        success: true,
        notificationsSent: notifications.length,
        fcmTokensSent: fcmTokens.length,
      };
    } catch (error) {
      console.error("Error sending bulk notifications:", error);
      throw new Error("Failed to send bulk notifications.");
    }
  },
);

// Clean up old notifications (scheduled function)
export const cleanupOldNotifications = async (): Promise<void> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // Delete notifications older than 30 days

    const oldNotificationsQuery = await admin
      .firestore()
      .collection("notifications")
      .where("createdAt", "<", admin.firestore.Timestamp.fromDate(cutoffDate))
      .limit(500) // Process in batches
      .get();

    if (oldNotificationsQuery.empty) {
      console.log("No old notifications to clean up");
      return;
    }

    const batch = admin.firestore().batch();
    oldNotificationsQuery.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    console.log(
      `Cleaned up ${oldNotificationsQuery.docs.length} old notifications`,
    );

    // Log cleanup
    await admin
      .firestore()
      .collection("logs")
      .add({
        userId: "system",
        action: "NOTIFICATIONS_CLEANUP",
        data: {
          deletedCount: oldNotificationsQuery.docs.length,
          cutoffDate: cutoffDate.toISOString(),
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error("Error cleaning up old notifications:", error);
  }
};

// Subscribe to topic for targeted notifications
export const subscribeToTopic = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated.");
  }

  const { token, topic } = request.data;

  // Validate topic
  const validTopics = [
    "all_users",
    "investors",
    "business_persons",
    "advisors",
    "bankers",
    "new_proposals",
    "funding_opportunities",
  ];

  if (!validTopics.includes(topic)) {
    throw new Error("Invalid topic specified.");
  }

  try {
    await admin.messaging().subscribeToTopic([token], topic);

    // Log subscription
    await admin
      .firestore()
      .collection("logs")
      .add({
        userId: request.auth.uid,
        action: "TOPIC_SUBSCRIBED",
        data: { topic, token: token.substring(0, 20) + "..." },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

    return { success: true, topic };
  } catch (error) {
    console.error("Error subscribing to topic:", error);
    throw new Error("Failed to subscribe to topic.");
  }
});

// Unsubscribe from topic
export const unsubscribeFromTopic = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated.");
  }

  const { token, topic } = request.data;

  try {
    await admin.messaging().unsubscribeFromTopic([token], topic);

    // Log unsubscription
    await admin
      .firestore()
      .collection("logs")
      .add({
        userId: request.auth.uid,
        action: "TOPIC_UNSUBSCRIBED",
        data: { topic, token: token.substring(0, 20) + "..." },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

    return { success: true, topic };
  } catch (error) {
    console.error("Error unsubscribing from topic:", error);
    throw new Error("Failed to unsubscribe from topic.");
  }
});

// Send topic notification
export const sendTopicNotification = onCall(async (request) => {
  // Check if user has admin privileges
  if (!request.auth || request.auth.token?.role !== "admin") {
    throw new Error("Only admins can send topic notifications.");
  }

  const { topic, title, body, data: notificationData } = request.data;

  try {
    const message = {
      topic,
      notification: {
        title,
        body,
      },
      data: notificationData || {},
      webpush: {
        fcmOptions: {
          link: getNotificationUrl("SYSTEM_NOTIFICATION", notificationData),
        },
      },
    };

    const response = await admin.messaging().send(message);

    // Log topic notification
    await admin
      .firestore()
      .collection("logs")
      .add({
        userId: request.auth.uid,
        action: "TOPIC_NOTIFICATION_SENT",
        data: {
          topic,
          title,
          messageId: response,
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

    return { success: true, messageId: response };
  } catch (error) {
    console.error("Error sending topic notification:", error);
    throw new Error("Failed to send topic notification.");
  }
});

// Helper function to generate notification URLs
function getNotificationUrl(
  type: string,
  data: Record<string, any> = {},
): string {
  const baseUrl = "https://localhost:8080";

  switch (type) {
    case "NEW_BUSINESS_PROPOSAL":
      return `${baseUrl}/view-proposals`;
    case "NEW_INVESTMENT_PROPOSAL":
      return `${baseUrl}/dashboard`;
    case "NEW_QUERY":
      return `${baseUrl}/view-queries`;
    case "NEW_RESPONSE":
      return `${baseUrl}/query-panel`;
    case "NEW_ADVISOR_TIP":
      return `${baseUrl}/advisor-suggestions`;
    case "PROPOSAL_STATUS_UPDATE":
      return `${baseUrl}/portfolio`;
    default:
      return `${baseUrl}/dashboard`;
  }
}

// Get notification statistics
export const getNotificationStats = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated.");
  }

  try {
    const userId = request.auth.uid;

    // Get total notifications
    const totalQuery = await admin
      .firestore()
      .collection("notifications")
      .where("userId", "==", userId)
      .get();

    // Get unread notifications
    const unreadQuery = await admin
      .firestore()
      .collection("notifications")
      .where("userId", "==", userId)
      .where("read", "==", false)
      .get();

    // Get notifications by type
    const notificationsByType: Record<string, number> = {};
    totalQuery.docs.forEach((doc) => {
      const data = doc.data();
      const type = data.type || "UNKNOWN";
      notificationsByType[type] = (notificationsByType[type] || 0) + 1;
    });

    return {
      total: totalQuery.size,
      unread: unreadQuery.size,
      read: totalQuery.size - unreadQuery.size,
      byType: notificationsByType,
    };
  } catch (error) {
    console.error("Error getting notification stats:", error);
    throw new Error("Failed to get notification statistics.");
  }
});
