import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import {
  onDocumentCreated,
  onDocumentDeleted,
} from "firebase-functions/v2/firestore";
import {
  beforeUserCreated,
  beforeUserSignedIn,
} from "firebase-functions/v2/identity";
import { SetUserRoleData, PromoteToAdminData } from "./types";
import { FieldValue } from "firebase-admin/firestore";

// CORS configuration for all environments
const corsOptions = {
  cors: true, // Allow all origins temporarily for testing
};

// Set custom claims for user role
export const setUserRole = onCall<SetUserRoleData>(
  corsOptions,
  async (request) => {
    // Check if the user is authenticated
    if (!request.auth) {
      throw new Error("User must be authenticated to set role.");
    }

    const { uid, role } = request.data;

    // Validate role
    const validRoles = [
      "user",
      "business_person",
      "investor",
      "banker",
      "business_advisor",
    ];

    if (!validRoles.includes(role)) {
      throw new Error("Invalid role specified.");
    }

    // Only allow users to set their own role during registration
    if (request.auth.uid !== uid) {
      throw new Error("Users can only set their own role.");
    }

    try {
      // Set custom claims
      await admin.auth().setCustomUserClaims(uid, { role });

      // Log the role assignment
      await admin.firestore().collection("logs").add({
        userId: uid,
        action: "ROLE_ASSIGNED",
        data: { role },
        timestamp: FieldValue.serverTimestamp(),
      });

      return { success: true, role };
    } catch (error) {
      console.error("Error setting user role:", error);
      throw new Error("Failed to set user role.");
    }
  },
);

// Trigger when a new user is created
export const onUserCreated = beforeUserCreated(async (event) => {
  const user = event.data;

  if (!user) {
    console.error("No user data in event");
    return;
  }

  try {
    // Create user document in Firestore if it doesn't exist
    const userDoc = admin.firestore().collection("users").doc(user.uid);
    const userSnapshot = await userDoc.get();

    if (!userSnapshot.exists) {
      await userDoc.set({
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        isActive: true,
        emailVerified: user.emailVerified || false,
        lastLoginAt: FieldValue.serverTimestamp(),
      });
    }

    // Send welcome notification
    await admin
      .firestore()
      .collection("notifications")
      .add({
        userId: user.uid,
        title: "Welcome to InvestBridge!",
        body: "Complete your profile to get started with connecting investors and entrepreneurs.",
        type: "SYSTEM_NOTIFICATION",
        data: {
          action: "COMPLETE_PROFILE",
          priority: "high",
        },
        read: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

    // Log user creation
    await admin
      .firestore()
      .collection("logs")
      .add({
        userId: user.uid,
        action: "USER_CREATED_BY_AUTH",
        data: {
          email: user.email || "",
          provider: user.providerData?.[0]?.providerId ?? "email",
        },
        timestamp: FieldValue.serverTimestamp(),
      });

    console.log(`New user created: ${user.uid}`);
  } catch (error) {
    console.error("Error in onUserCreated:", error);
  }
});

// Delete user data when user account is deleted
export const onUserDeleted = onDocumentDeleted(
  "users/{userId}",
  async (event) => {
    const userId = event.params.userId;

    try {
      const batch = admin.firestore().batch();

      // Delete user's business ideas
      const businessIdeasQuery = await admin
        .firestore()
        .collection("businessIdeas")
        .where("userId", "==", userId)
        .get();

      businessIdeasQuery.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete user's investment proposals
      const proposalsQuery = await admin
        .firestore()
        .collection("investmentProposals")
        .where("investorId", "==", userId)
        .get();

      proposalsQuery.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete user's queries
      const queriesQuery = await admin
        .firestore()
        .collection("queries")
        .where("userId", "==", userId)
        .get();

      queriesQuery.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete user's responses
      const responsesQuery = await admin
        .firestore()
        .collection("responses")
        .where("advisorId", "==", userId)
        .get();

      responsesQuery.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete user's notifications
      const notificationsQuery = await admin
        .firestore()
        .collection("notifications")
        .where("userId", "==", userId)
        .get();

      notificationsQuery.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Commit all deletions
      await batch.commit();

      // Log user deletion
      await admin
        .firestore()
        .collection("logs")
        .add({
          userId: userId,
          action: "USER_DELETED",
          data: {
            deletedAt: FieldValue.serverTimestamp(),
          },
          timestamp: FieldValue.serverTimestamp(),
        });

      console.log(`User data deleted for: ${userId}`);
    } catch (error) {
      console.error("Error in onUserDeleted:", error);
    }
  },
);

// Function to promote user to admin (called by existing admin)
export const promoteToAdmin = onCall<PromoteToAdminData>(async (request) => {
  // Check if the caller is an admin
  if (!request.auth || request.auth.token?.role !== "admin") {
    throw new Error("Only admins can promote users.");
  }

  const { uid } = request.data;

  try {
    await admin.auth().setCustomUserClaims(uid, { role: "admin" });

    // Log the promotion
    await admin
      .firestore()
      .collection("logs")
      .add({
        userId: request.auth.uid,
        action: "USER_PROMOTED_TO_ADMIN",
        data: { promotedUserId: uid },
        timestamp: FieldValue.serverTimestamp(),
      });

    return { success: true };
  } catch (error) {
    console.error("Error promoting user to admin:", error);
    throw new Error("Failed to promote user to admin.");
  }
});

// Function to verify user email
export const verifyUserEmail = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated.");
  }

  try {
    const actionCodeSettings = {
      url: "http://localhost:8080/auth?verified=true",
      handleCodeInApp: true,
    };

    const link = await admin
      .auth()
      .generateEmailVerificationLink(
        request.auth?.token?.email || "",
        actionCodeSettings,
      );

    // Here you would send the email via your email service
    // For now, we'll just return the link
    return { verificationLink: link };
  } catch (error) {
    console.error("Error generating verification link:", error);
    throw new Error("Failed to generate verification link.");
  }
});
