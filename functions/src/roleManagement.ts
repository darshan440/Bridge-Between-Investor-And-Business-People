import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import { ChangeUserRoleData } from "./types";

// CORS configuration for all environments
const corsOptions = {
  cors: true, // Allow all origins temporarily for testing
};

// Role configuration - ideally this would be loaded from Firestore or a config service
const roleConfig = {
  roleMatrix: {
    user: ["investor", "business_person", "business_advisor", "banker"],
    investor: ["user", "business_person", "business_advisor", "banker"],
    business_person: ["user", "investor", "business_advisor", "banker"],
    business_advisor: ["user", "investor", "business_person", "banker"],
    banker: ["user", "business_person", "investor", "business_advisor"],
    admin: [],
  },
  roleDescriptions: {
    user: "General user with browsing privileges",
    investor: "Can invest in business ideas and manage portfolio",
    business_person: "Can post business ideas and seek investments",
    business_advisor: "Can provide expert advice and guidance",
    banker: "Can create loan schemes and assess risks",
    admin: "Full system administration privileges",
  },
  restrictedRoles: ["banker", "admin"],
  approvalRequired: {
    business_advisor: false,
  },
};

// Change user role with strict validation
export const changeUserRole = onCall<ChangeUserRoleData>(
  corsOptions,
  async (request) => {
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
        (roleConfig.roleMatrix as Record<string, string[]>)[currentRole] || [];

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
  },
);

// Get available role changes for current user
export const getAvailableRoles = onCall(corsOptions, async (request) => {
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
      (roleConfig.roleMatrix as Record<string, string[]>)[currentRole] || [];

    // Add role descriptions for each allowed role
    const availableRoles = allowedRoles.map((role: string) => ({
      role,
      description:
        (roleConfig.roleDescriptions as Record<string, string>)[role] || "",
      requiresApproval:
        (roleConfig.approvalRequired as Record<string, boolean>)[role] || false,
    }));

    return {
      currentRole,
      currentRoleDescription:
        (roleConfig.roleDescriptions as Record<string, string>)[currentRole] ||
        "",
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
