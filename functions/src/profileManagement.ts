import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

import { CompleteProfileData } from "./types";

import * as functions from "firebase-functions"; // 1st Gen
const db = getFirestore();

export const completeUserProfile = functions.https.onCall(async (request) => {
  try {
    if (!request.auth?.uid) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated",
      );
    }

    const { profileData }: { profileData: CompleteProfileData } = request.data;
    const userId = request.auth.uid;

    if (!profileData) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Profile data is required",
      );
    }

    // Validate required fields
    if (!profileData.fullName?.trim()) {
      throw new functions.https.HttpsError("invalid-argument", "Full name is required");
    }

    if (!profileData.mobileNumber?.trim()) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Mobile number is required",
      );
    }

    // Validate mobile number format
    const mobileRegex = /^\+?[\d\s-()]{10,}$/;
    if (!mobileRegex.test(profileData.mobileNumber)) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Invalid mobile number format",
      );
    }

    // Get current user profile
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      throw new functions.https.HttpsError("not-found", "User profile not found");
    }

    const currentProfile = userDoc.data();

    // Check if role requires profile completion
    const rolesRequiringCompletion = [
      "business_person",
      "investor",
      "banker",
      "business_advisor",
    ];
    if (!rolesRequiringCompletion.includes(currentProfile?.role)) {
      throw new functions.https.HttpsError(
        "failed-precondition",
        "Profile completion not required for this role",
      );
    }

    // Update user profile
    await userRef.update({
      displayName: profileData.fullName,
      isComplete: true,
      profile: {
        ...currentProfile?.profile,
        ...profileData,
        isComplete: true,
      },
      updatedAt: new Date(),
    });

    // Update Firebase Auth display name
    try {
      await getAuth().updateUser(userId, {
        displayName: profileData.fullName,
      });
    } catch (authError) {
      console.warn("Failed to update Auth display name:", authError);
      // Don't fail the entire operation for auth update failure
    }

    // Log profile completion
    await db.collection("logs").add({
      userId,
      action: "PROFILE_COMPLETED",
      data: {
        role: currentProfile?.role,
        completedAt: new Date().toISOString(),
      },
      timestamp: new Date(),
    });

    return {
      success: true,
      message: "Profile completed successfully",
    };
  } catch (error) {
    console.error("Profile completion error:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError("internal", "Failed to complete profile");
  }
});

// Get user profile completion status
export const getProfileCompletionStatus = functions.https.onCall(
  { cors: true },
  async (request) => {
    try {
      // Verify authentication
      if (!request.auth?.uid) {
        throw new functions.https.HttpsError(
          "unauthenticated",
          "User must be authenticated",
        );
      }

      const userId = request.auth.uid;

      // Get user profile
      const userDoc = await db.collection("users").doc(userId).get();

      if (!userDoc.exists) {
        throw new functions.https.HttpsError("not-found", "User profile not found");
      }

      const profile = userDoc.data();
      const rolesRequiringCompletion = [
        "business_person",
        "investor",
        "banker",
        "business_advisor",
      ];

      return {
        isComplete: profile?.isComplete === true,
        requiresCompletion: rolesRequiringCompletion.includes(profile?.role),
        role: profile?.role,
        profile: profile?.profile || {},
      };
    } catch (error) {
      console.error("Get profile status error:", error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError("internal", "Failed to get profile status");
    }
  },
);

// Validate profile data based on role
export const validateProfileData = (
  role: string,
  data: CompleteProfileData,
): string[] => {
  const errors: string[] = [];

  // Common validations
  if (!data.fullName?.trim()) {
    errors.push("Full name is required");
  }

  if (!data.mobileNumber?.trim()) {
    errors.push("Mobile number is required");
  } else if (!/^\+?[\d\s-()]{10,}$/.test(data.mobileNumber)) {
    errors.push("Invalid mobile number format");
  }

  // Role-specific validations
  switch (role) {
    case "business_person":
      if (!data.companyName?.trim()) {
        errors.push("Company name is required");
      }
      if (!data.businessCategory) {
        errors.push("Business category is required");
      }
      if (!data.briefDescription?.trim()) {
        errors.push("Brief description is required");
      } else if (data.briefDescription.length < 50) {
        errors.push("Description should be at least 50 characters");
      }
      break;

    case "investor":
      if (!data.investmentBudget) {
        errors.push("Investment budget is required");
      }
      if (!data.preferredSectors || data.preferredSectors.length === 0) {
        errors.push("At least one preferred sector is required");
      }
      if (!data.investmentExperience?.trim()) {
        errors.push("Investment experience is required");
      }
      break;

    case "banker":
    case "business_advisor":
      if (!data.institutionName?.trim()) {
        errors.push("Institution name is required");
      }
      if (!data.designation) {
        errors.push("Designation is required");
      }
      if (!data.experienceYears) {
        errors.push("Experience is required");
      }
      if (!data.areaOfExpertise || data.areaOfExpertise.length === 0) {
        errors.push("At least one area of expertise is required");
      }
      if (!data.professionalSummary?.trim()) {
        errors.push("Professional summary is required");
      } else if (data.professionalSummary.length < 100) {
        errors.push("Professional summary should be at least 100 characters");
      }
      break;
  }

  return errors;
};
