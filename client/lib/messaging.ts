import { getToken, onMessage, MessagePayload } from "firebase/messaging";
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { messaging, db, COLLECTIONS } from "./firebase";
import { logUserAction } from "./logging";

export interface NotificationData {
  id?: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  read: boolean;
  createdAt: any;
  updatedAt: any;
}

export type NotificationType =
  | "NEW_BUSINESS_PROPOSAL"
  | "NEW_INVESTMENT_PROPOSAL"
  | "NEW_QUERY"
  | "NEW_RESPONSE"
  | "NEW_ADVISOR_TIP"
  | "PROPOSAL_STATUS_UPDATE"
  | "SYSTEM_NOTIFICATION";

// Request notification permission and get FCM token (must be called in response to user gesture)
export const requestNotificationPermission = async (): Promise<
  string | null
> => {
  try {
    if (!messaging) {
      console.log("Messaging not supported in this environment");
      return null;
    }

    // Check current permission status first
    if (Notification.permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || "your-vapid-key",
      });
      return token;
    }

    // Only request permission if not already denied
    if (Notification.permission === "denied") {
      console.log("Notification permission previously denied");
      return null;
    }

    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || "your-vapid-key",
      });

      console.log("FCM Token:", token);
      return token;
    } else {
      console.log("Notification permission denied");
      return null;
    }
  } catch (error) {
    console.error("Error getting notification permission:", error);
    return null;
  }
};

// Listen for foreground messages
export const onForegroundMessage = (
  callback: (payload: MessagePayload) => void,
) => {
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);
    callback(payload);

    // Show browser notification if permission granted
    if (Notification.permission === "granted" && payload.notification) {
      new Notification(payload.notification.title || "InvestBridge", {
        body: payload.notification.body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: payload.data?.type || "general",
      });
    }
  });
};

// Send notification (to be called from Cloud Functions)
export const createNotification = async (
  userId: string,
  title: string,
  body: string,
  type: NotificationType,
  data?: Record<string, any>,
): Promise<string> => {
  try {
    const notification: Omit<NotificationData, "id"> = {
      userId,
      title,
      body,
      type,
      data: data || {},
      read: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      notification,
    );

    // Log notification creation
    await logUserAction(userId, "NOTIFICATION_SENT", {
      notificationId: docRef.id,
      type,
      title,
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

// Get user notifications
export const getUserNotifications = async (
  userId: string,
  limit: number = 20,
): Promise<NotificationData[]> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where("userId", "==", userId),
    );

    const querySnapshot = await getDocs(q);
    const notifications = querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as NotificationData,
    );

    // Sort by creation date (newest first)
    return notifications
      .sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      })
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting user notifications:", error);
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (
  notificationId: string,
): Promise<void> => {
  try {
    await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), {
      read: true,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (
  userId: string,
): Promise<void> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where("userId", "==", userId),
      where("read", "==", false),
    );

    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map((doc) =>
      updateDoc(doc.ref, {
        read: true,
        updatedAt: serverTimestamp(),
      }),
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (
  userId: string,
): Promise<number> => {
  try {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where("userId", "==", userId),
      where("read", "==", false),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    return 0;
  }
};

// Notification templates for different types
export const notificationTemplates = {
  newBusinessProposal: (businessTitle: string) => ({
    title: "New Business Proposal",
    body: `Check out the new business idea: "${businessTitle}"`,
  }),

  newInvestmentProposal: (amount: number, businessTitle: string) => ({
    title: "New Investment Proposal",
    body: `You received an investment proposal of ₹${amount.toLocaleString()} for "${businessTitle}"`,
  }),

  newQuery: (queryTitle: string) => ({
    title: "New Business Query",
    body: `A new question needs your expertise: "${queryTitle}"`,
  }),

  newResponse: (queryTitle: string) => ({
    title: "Query Answered",
    body: `Your question "${queryTitle}" has received a new response`,
  }),

  newAdvisorTip: (tipTitle: string) => ({
    title: "New Expert Advice",
    body: `New expert tip available: "${tipTitle}"`,
  }),

  proposalStatusUpdate: (status: string, businessTitle: string) => ({
    title: "Proposal Status Update",
    body: `Your proposal for "${businessTitle}" has been ${status}`,
  }),
};

// Helper function to send notifications for specific events
export const sendEventNotification = async (
  event: NotificationType,
  targetUserId: string,
  eventData: Record<string, any>,
): Promise<void> => {
  let title = "";
  let body = "";

  switch (event) {
    case "NEW_BUSINESS_PROPOSAL":
      ({ title, body } = notificationTemplates.newBusinessProposal(
        eventData.businessTitle,
      ));
      break;
    case "NEW_INVESTMENT_PROPOSAL":
      ({ title, body } = notificationTemplates.newInvestmentProposal(
        eventData.amount,
        eventData.businessTitle,
      ));
      break;
    case "NEW_QUERY":
      ({ title, body } = notificationTemplates.newQuery(eventData.queryTitle));
      break;
    case "NEW_RESPONSE":
      ({ title, body } = notificationTemplates.newResponse(
        eventData.queryTitle,
      ));
      break;
    case "NEW_ADVISOR_TIP":
      ({ title, body } = notificationTemplates.newAdvisorTip(
        eventData.tipTitle,
      ));
      break;
    case "PROPOSAL_STATUS_UPDATE":
      ({ title, body } = notificationTemplates.proposalStatusUpdate(
        eventData.status,
        eventData.businessTitle,
      ));
      break;
    default:
      title = "InvestBridge Update";
      body = "You have a new update";
  }

  await createNotification(targetUserId, title, body, event, eventData);
};

// Initialize FCM in the app (without requesting permission automatically)
export const initializeMessaging = async (userId: string): Promise<void> => {
  try {
    // Check if permission is already granted and get token
    if (Notification.permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || "your-vapid-key",
      });

      if (token && userId) {
        // Store token in user profile (this would be done via Cloud Function)
        await logUserAction(userId, "NOTIFICATION_TOKEN_UPDATED", {
          action: "FCM_TOKEN_GENERATED",
          token: token.substring(0, 20) + "...", // Log partial token for privacy
        });
      }
    }

    // Set up foreground message listener
    onForegroundMessage((payload) => {
      console.log("Received foreground message:", payload);

      // You can dispatch this to your state management or show a toast notification
      if (payload.notification) {
        // Example: Show a toast notification
        const event = new CustomEvent("notification", {
          detail: {
            title: payload.notification.title,
            body: payload.notification.body,
            type: payload.data?.type || "general",
          },
        });
        window.dispatchEvent(event);
      }
    });
  } catch (error) {
    console.error("Error initializing messaging:", error);
  }
};
