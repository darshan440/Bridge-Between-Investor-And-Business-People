import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";

// Removed invalid import of CallableContext

// Set custom claims for user role
export const setUserRole = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    // Check if the user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to set role.",
      );
    }

    const { uid, role } = data;

    // Validate role
    const validRoles = [
      "user",
      "business_person",
      "investor",
      "banker",
      "business_advisor",
    ];

    if (!validRoles.includes(role)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid role specified.",
      );
    }

    // Only allow users to set their own role during registration
    if (context.auth.uid !== uid) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Users can only set their own role.",
      );
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
      throw new functions.https.HttpsError(
        "internal",
        "Failed to set user role.",
      );
    }
  },
);

// Trigger when a new user is created
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  try {
    // Create user document in Firestore if it doesn't exist
    const userDoc = admin.firestore().collection("users").doc(user.uid);
    const userSnapshot = await userDoc.get();

    if (!userSnapshot.exists) {
      await userDoc.set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || "",
        photoURL: user.photoURL || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
        emailVerified: user.emailVerified,
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
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
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Log user creation
    await admin
      .firestore()
      .collection("logs")
      .add({
        userId: user.uid,
        action: "USER_CREATED_BY_AUTH",
        data: {
          email: user.email,
          provider: user.providerData?.[0]?.providerId ?? "email",
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

    console.log(`New user created: ${user.uid}`);
  } catch (error) {
    console.error("Error in onUserCreated:", error);
  }
});

// Delete user data when user account is deleted
export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  try {
    const batch = admin.firestore().batch();

    // Delete user document
    const userRef = admin.firestore().collection("users").doc(user.uid);
    batch.delete(userRef);

    // Delete user's business ideas
    const businessIdeasQuery = await admin
      .firestore()
      .collection("businessIdeas")
      .where("userId", "==", user.uid)
      .get();

    businessIdeasQuery.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete user's investment proposals
    const proposalsQuery = await admin
      .firestore()
      .collection("investmentProposals")
      .where("investorId", "==", user.uid)
      .get();

    proposalsQuery.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete user's queries
    const queriesQuery = await admin
      .firestore()
      .collection("queries")
      .where("userId", "==", user.uid)
      .get();

    queriesQuery.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete user's responses
    const responsesQuery = await admin
      .firestore()
      .collection("responses")
      .where("advisorId", "==", user.uid)
      .get();

    responsesQuery.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete user's notifications
    const notificationsQuery = await admin
      .firestore()
      .collection("notifications")
      .where("userId", "==", user.uid)
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
        userId: user.uid,
        action: "USER_DELETED",
        data: {
          email: user.email,
          deletedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

    console.log(`User data deleted for: ${user.uid}`);
  } catch (error) {
    console.error("Error in onUserDeleted:", error);
  }
});

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
      url: "http://localhost:8080/auth?verified=true",
      handleCodeInApp: true,
    };

    const link = await admin
      .auth()
      .generateEmailVerificationLink(
        context.auth?.token?.email || "",
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
