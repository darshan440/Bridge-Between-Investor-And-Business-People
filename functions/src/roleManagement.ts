import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import { ChangeUserRoleData } from "./types";
import * as roleConfig from "./roles.json";

// Change user role with strict validation
export const changeUserRole = onCall<ChangeUserRoleData>(async (request) => {
  // Check if the user is authenticated
  if (!request.auth) {
    throw new Error("User must be authenticated to change role.");
  }

  const { newRole } = request.data;
  const userId = request.auth.uid;

  try {
    // Get current user profile
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      throw new Error("User profile not found.");
    }

    const userData = userDoc.data();
    const currentRole = userData?.role || "user";

    // Validate role change using the matrix
    const allowedRoles =
      roleConfig.roleMatrix[
        currentRole as keyof typeof roleConfig.roleMatrix
      ] || [];

    if (!allowedRoles.includes(newRole)) {
      throw new Error(
        `Role change from ${currentRole} to ${newRole} is not allowed. Allowed transitions: ${allowedRoles.join(", ")}`,
      );
    }

    // Prevent users from setting restricted roles
    if (roleConfig.restrictedRoles.includes(newRole)) {
      throw new Error(
        `Cannot change to restricted role: ${newRole}. This role requires administrative approval.`,
      );
    }

    // Validate role exists
    const validRoles = Object.keys(roleConfig.roleDescriptions);
    if (!validRoles.includes(newRole)) {
      throw new Error("Invalid role specified.");
    }

    // Update Firestore document
    await admin.firestore().collection("users").doc(userId).update({
      role: newRole,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      roleChangedAt: admin.firestore.FieldValue.serverTimestamp(),
      previousRole: currentRole,
    });

    // Update Firebase Auth custom claims
    await admin.auth().setCustomUserClaims(userId, {
      role: newRole,
      roleChangedAt: Date.now(),
    });

    // Log the role change
    await admin
      .firestore()
      .collection("logs")
      .add({
        userId: userId,
        action: "ROLE_CHANGED",
        data: {
          previousRole: currentRole,
          newRole: newRole,
          changeReason: "user_initiated",
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Create notification for user
    await admin
      .firestore()
      .collection("notifications")
      .add({
        userId: userId,
        title: "Role Changed Successfully",
        body: `Your role has been changed from ${currentRole.replace("_", " ")} to ${newRole.replace("_", " ")}.`,
        type: "ROLE_UPDATE",
        data: {
          previousRole: currentRole,
          newRole: newRole,
        },
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return {
      success: true,
      previousRole: currentRole,
      newRole: newRole,
      message: `Role successfully changed from ${currentRole} to ${newRole}`,
    };
  } catch (error) {
    console.error("Error changing user role:", error);

    // Log the failed attempt
    await admin
      .firestore()
      .collection("logs")
      .add({
        userId: userId,
        action: "ROLE_CHANGE_FAILED",
        data: {
          attemptedRole: newRole,
          error: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

    throw error;
  }
});

// Get available role changes for current user
export const getAvailableRoles = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated.");
  }

  const userId = request.auth.uid;

  try {
    // Get current user role
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(userId)
      .get();

    if (!userDoc.exists) {
      throw new Error("User profile not found.");
    }

    const userData = userDoc.data();
    const currentRole = userData?.role || "user";

    // Get allowed role transitions
    const allowedRoles =
      roleConfig.roleMatrix[
        currentRole as keyof typeof roleConfig.roleMatrix
      ] || [];

    // Add role descriptions for each allowed role
    const availableRoles = allowedRoles.map((role) => ({
      role,
      description:
        roleConfig.roleDescriptions[
          role as keyof typeof roleConfig.roleDescriptions
        ],
      requiresApproval:
        roleConfig.approvalRequired[
          role as keyof typeof roleConfig.approvalRequired
        ] || false,
    }));

    return {
      currentRole,
      currentRoleDescription:
        roleConfig.roleDescriptions[
          currentRole as keyof typeof roleConfig.roleDescriptions
        ],
      availableRoles,
    };
  } catch (error) {
    console.error("Error getting available roles:", error);
    throw error;
  }
});

// Admin function to approve role changes (if needed in future)
export const approveRoleChange = onCall(async (request) => {
  if (!request.auth || request.auth.token?.role !== "admin") {
    throw new Error("Only administrators can approve role changes.");
  }

  const { userId, newRole, approved } = request.data;

  try {
    if (approved) {
      // Process the approved role change
      await admin.firestore().collection("users").doc(userId).update({
        role: newRole,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        roleApprovedAt: admin.firestore.FieldValue.serverTimestamp(),
        roleApprovedBy: request.auth.uid,
      });

      await admin.auth().setCustomUserClaims(userId, {
        role: newRole,
        roleApprovedAt: Date.now(),
      });

      // Log approval
      await admin
        .firestore()
        .collection("logs")
        .add({
          userId: request.auth.uid,
          action: "ROLE_CHANGE_APPROVED",
          data: {
            targetUserId: userId,
            newRole: newRole,
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
    } else {
      // Log rejection
      await admin
        .firestore()
        .collection("logs")
        .add({
          userId: request.auth.uid,
          action: "ROLE_CHANGE_REJECTED",
          data: {
            targetUserId: userId,
            requestedRole: newRole,
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
    }

    return { success: true, approved };
  } catch (error) {
    console.error("Error processing role change approval:", error);
    throw error;
  }
});
