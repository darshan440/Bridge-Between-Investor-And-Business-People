import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { COLLECTIONS, db } from "./firebase";

export interface LogEntry {
  userId: string;
  action: string;
  data: Record<string, any>;
  timestamp: any;
  userAgent?: string;
  ip?: string;
  sessionId?: string;
}

// Supported log actions
export type LogAction =
  | "USER_REGISTERED"
  | "USER_SIGNED_IN"
  | "USER_SIGNED_OUT"
  | "PROFILE_UPDATED"
  | "PROFILE_IMAGE_UPLOADED"
  | "BUSINESS_IDEA_CREATED"
  | "BUSINESS_IDEA_UPDATED"
  | "BUSINESS_IDEA_VIEWED"
  | "INVESTMENT_PROPOSAL_CREATED"
  | "INVESTMENT_PROPOSAL_STATUS_UPDATED"
  | "QUERY_CREATED"
  | "QUERY_VIEWED"
  | "RESPONSE_CREATED"
  | "ROLE_CHANGED_CLIENT"
  | "ADVISOR_SUGGESTION_CREATED"
  | "ADVISOR_SUGGESTION_VIEWED"
  | "LOAN_SCHEME_CREATED"
  | "LOAN_SCHEME_VIEWED"
  | "NOTIFICATION_SENT"
  | "NOTIFICATION_TOKEN_UPDATED"
  | "SEARCH_PERFORMED"
  | "ERROR_OCCURRED";

// Log user action to Firestore
export const logUserAction = async (
  userId: string,
  action: LogAction,
  data: Record<string, any> = {},
  additionalInfo?: {
    userAgent?: string;
    ip?: string;
    sessionId?: string;
  },
): Promise<void> => {
  try {
    const logEntry: Omit<LogEntry, "id"> = {
      userId,
      action,
      data,
      timestamp: serverTimestamp(),
      userAgent: additionalInfo?.userAgent || navigator?.userAgent,
      ip: additionalInfo?.ip,
      sessionId: additionalInfo?.sessionId || generateSessionId(),
    };

    await addDoc(collection(db, COLLECTIONS.LOGS), logEntry);
  } catch (error) {
    console.error("Error logging user action:", error);
    // Don't throw error to avoid breaking the main functionality
  }
};

// Generate a simple session ID
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Log error with context
export const logError = async (
  userId: string | null,
  error: Error,
  context: Record<string, any> = {},
): Promise<void> => {
  try {
    await logUserAction(userId || "anonymous", "ERROR_OCCURRED", {
      errorMessage: error.message,
      errorStack: error.stack,
      context,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });
  } catch (logError) {
    console.error("Error logging error:", logError);
  }
};

// Log search action
export const logSearch = async (
  userId: string,
  searchTerm: string,
  filters: Record<string, any> = {},
  resultCount: number = 0,
): Promise<void> => {
  await logUserAction(userId, "SEARCH_PERFORMED", {
    searchTerm,
    filters,
    resultCount,
    timestamp: new Date().toISOString(),
  });
};

// Log page view
export const logPageView = async (
  userId: string | null,
  page: string,
  additionalData: Record<string, any> = {},
): Promise<void> => {
  if (userId) {
    await logUserAction(userId, "BUSINESS_IDEA_VIEWED", {
      page,
      url: window.location.href,
      ...additionalData,
    });
  }
};

// Batch logging for multiple actions
export const logBatchActions = async (
  actions: Array<{
    userId: string;
    action: LogAction;
    data: Record<string, any>;
  }>,
): Promise<void> => {
  try {
    const promises = actions.map(({ userId, action, data }) =>
      logUserAction(userId, action, data),
    );

    await Promise.all(promises);
  } catch (error) {
    console.error("Error batch logging actions:", error);
  }
};

// Analytics helper functions
export const analytics = {
  // Track user engagement
  trackEngagement: async (
    userId: string,
    eventType: "click" | "view" | "interaction",
    elementType: string,
    elementId?: string,
  ) => {
    await logUserAction(userId, "BUSINESS_IDEA_VIEWED", {
      eventType,
      elementType,
      elementId,
      timestamp: new Date().toISOString(),
    });
  },

  // Track conversion events
  trackConversion: async (
    userId: string,
    conversionType:
      | "idea_posted"
      | "investment_made"
      | "query_asked"
      | "response_given",
    value?: number,
  ) => {
    await logUserAction(userId, "BUSINESS_IDEA_CREATED", {
      conversionType,
      value,
      timestamp: new Date().toISOString(),
    });
  },

  // Track performance metrics
  trackPerformance: async (
    userId: string,
    metric: string,
    value: number,
    unit: string,
  ) => {
    await logUserAction(userId, "BUSINESS_IDEA_VIEWED", {
      metric,
      value,
      unit,
      timestamp: new Date().toISOString(),
    });
  },
};
