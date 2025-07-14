import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
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
        const userData = userDoc.data();
        if (!userData) {
          console.log("User data not found for notification");
          return { success: false, error: "User data not found" };
        }
        const fcmToken = userData.fcmToken;

        if (fcmToken) {
          // Send push notification
          const message = {
            token: fcmToken,
            notification: {
              title,
              body,
            },
            data: {
              type: type || "GENERAL",
              notificationId: notificationRef.id,
              ...notificationData,
            },
          };

          try {
            await admin.messaging().send(message);
            console.log("Push notification sent successfully");
          } catch (error) {
            console.error("Error sending push notification:", error);
            // Don't fail the function if push notification fails
          }
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
            recipientId: userId,
            notificationId: notificationRef.id,
            type: type || "GENERAL",
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

      return {
        success: true,
        notificationId: notificationRef.id,
      };
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
      throw new Error("User must be authenticated.");
    }

    const { userIds, title, body, type, data: notificationData } = request.data;

    if (!userIds || userIds.length === 0) {
      throw new Error("User IDs are required.");
    }

    try {
      const batch = admin.firestore().batch();
      const notificationIds: string[] = [];

      // Create notification documents for each user
      for (const userId of userIds) {
        const notificationRef = admin
          .firestore()
          .collection("notifications")
          .doc();

        batch.set(notificationRef, {
          userId,
          title,
          body,
          type: type || "GENERAL",
          data: notificationData || {},
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        notificationIds.push(notificationRef.id);
      }

      // Commit batch write
      await batch.commit();

      // Send push notifications in parallel
      const pushPromises = userIds.map(async (userId) => {
        try {
          const userDoc = await admin
            .firestore()
            .collection("users")
            .doc(userId)
            .get();

          if (userDoc.exists) {
            const userData = userDoc.data();
            const fcmToken = userData?.fcmToken;

            if (fcmToken) {
              const message = {
                token: fcmToken,
                notification: {
                  title,
                  body,
                },
                data: {
                  type: type || "GENERAL",
                  ...notificationData,
                },
              };

              await admin.messaging().send(message);
              console.log(`Push notification sent to user: ${userId}`);
            }
          }
        } catch (error) {
          console.error(`Error sending push to user ${userId}:`, error);
          // Continue with other users even if one fails
        }
      });

      await Promise.allSettled(pushPromises);

      // Log bulk notification sent
      await admin
        .firestore()
        .collection("logs")
        .add({
          userId: request.auth.uid,
          action: "BULK_NOTIFICATIONS_SENT",
          data: {
            recipientCount: userIds.length,
            type: type || "GENERAL",
            notificationIds,
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

      return {
        success: true,
        sentCount: userIds.length,
        notificationIds,
      };
    } catch (error) {
      console.error("Error sending bulk notifications:", error);
      throw new Error("Failed to send bulk notifications.");
    }
  },
);

// Clean up old notifications (scheduled function)
export const cleanupOldNotifications = onSchedule(
  "0 2 * * *", // Run daily at 2 AM
  async () => {
    try {
      // Delete notifications older than 30 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30);

      const batch = admin.firestore().batch();
      const oldNotifications = await admin
        .firestore()
        .collection("notifications")
        .where("createdAt", "<", cutoffDate)
        .limit(500) // Process in batches to avoid timeout
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

// Mark notification as read
export const markNotificationAsRead = onCall<{ notificationId: string }>(
  async (request) => {
    if (!request.auth) {
      throw new Error("User must be authenticated.");
    }

    const { notificationId } = request.data;

    if (!notificationId) {
      throw new Error("Notification ID is required.");
    }

    try {
      // Update notification
      await admin
        .firestore()
        .collection("notifications")
        .doc(notificationId)
        .update({
          read: true,
          readAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      return { success: true };
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw new Error("Failed to mark notification as read.");
    }
  },
);

// Get user notifications
export const getUserNotifications = onCall<{
  limit?: number;
  lastVisible?: string;
}>(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated.");
  }

  const { limit = 20, lastVisible } = request.data;
  const userId = request.auth.uid;

  try {
    let query = admin
      .firestore()
      .collection("notifications")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (lastVisible) {
      const lastDoc = await admin
        .firestore()
        .collection("notifications")
        .doc(lastVisible)
        .get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    const notifications = await query.get();

    return {
      notifications: notifications.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
      hasMore: notifications.size === limit,
      lastVisible:
        notifications.docs.length > 0
          ? notifications.docs[notifications.docs.length - 1].id
          : null,
    };
  } catch (error) {
    console.error("Error getting user notifications:", error);
    throw new Error("Failed to get notifications.");
  }
});
