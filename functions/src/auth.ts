import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import {
  beforeUserCreated,
  beforeUserSignedIn,
} from "firebase-functions/v2/identity";

// Set custom claims for user role
export const setUserRole = onCall(async (request) => {
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
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, role };
  } catch (error) {
    console.error("Error setting user role:", error);
    throw new Error("Failed to set user role.");
  }
});

// Note: User creation triggers are handled in client-side code for v2

// Note: User deletion cleanup is handled separately

// Function to promote user to admin (called by existing admin)
export const promoteToAdmin = onCall(async (request) => {
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
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
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
      url: `http://localhost:8080/auth?verified=true`,
      handleCodeInApp: true,
    };

    const link = await admin
      .auth()
      .generateEmailVerificationLink(
        request.auth.token?.email || request.auth.uid,
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
