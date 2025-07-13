import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  IdTokenResult,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import {
  auth,
  db,
  storage,
  functions,
  COLLECTIONS,
  USER_ROLES,
  UserRole,
  isFirebaseEnabled,
} from "./firebase";
import { logUserAction } from "./logging";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  createdAt: any;
  updatedAt: any;
  isActive: boolean;
  isComplete?: boolean;
  profile?: {
    fullName?: string;
    mobileNumber?: string;
    companyName?: string;
    institutionName?: string;
    designation?: string;
    businessCategory?: string;
    briefDescription?: string;
    investmentBudget?: string;
    preferredSectors?: string[];
    preferredStages?: string[];
    investmentExperience?: string;
    investmentCriteria?: string;
    areaOfExpertise?: string[];
    professionalSummary?: string;
    qualifications?: string;
    yearsOfExperience?: string;
    experienceYears?: string;
    website?: string;
    linkedIn?: string;
    isComplete?: boolean;
    // Legacy fields for backward compatibility
    company?: string;
    location?: string;
    bio?: string;
    expertise?: string[];
    experience?: number;
    investmentRange?: {
      min: number;
      max: number;
    };
  };
}
const getIP = async () => {
  const res = await fetch("https://api64.ipify.org?format=json");
  const data = await res.json();
  return data.ip;
};

// Custom hook for authentication state
export const useAuthState = () => {
  return new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Register new user with role
export const registerUser = async (
  email: string,
  password: string,
  displayName: string,
  role: UserRole,
): Promise<UserProfile> => {
  if (!isFirebaseEnabled || !auth || !db) {
    throw new Error(
      "Firebase is not properly configured. Please check your environment variables.",
    );
  }

  try {
    // Create user account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Update user profile
    await updateProfile(user, { displayName });

    // Set custom claims for role-based access
    const setUserRole = httpsCallable(functions, "setUserRole");
    await setUserRole({ uid: user.uid, role });

    // Create user document in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName,
      role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
    };

    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userProfile);
    const ip = await getIP();

    // Log user registration
    await logUserAction(user.uid, "USER_REGISTERED", { role, email }, { ip });

    return userProfile;
  } catch (error: any) {
    console.error("Registration error:", error);

    throw new Error(error.message || "Registration failed");
  }
};

// Sign in user
export const signInUser = async (
  email: string,
  password: string,
): Promise<UserProfile> => {
  if (!isFirebaseEnabled || !auth || !db) {
    throw new Error(
      "Firebase is not properly configured. Please check your environment variables.",
    );
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));

    if (!userDoc.exists()) {
      throw new Error("User profile not found");
    }

    const userProfile = userDoc.data() as UserProfile;

    // Update last login
    await updateDoc(doc(db, COLLECTIONS.USERS, user.uid), {
      lastLoginAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Log user sign in
    await logUserAction(user.uid, "USER_SIGNED_IN", { email });

    return userProfile;
  } catch (error: any) {
    console.error("Sign in error:", error);

    if (error.code === "auth/user-not-found") {
      // Signal to the component that this is a "user not found" case
      throw new Error("USER_NOT_FOUND");
    }

    throw new Error(error.message || "Sign in failed");
  }
};

// Sign out user
export const signOutUser = async (): Promise<void> => {
  if (!auth) {
    throw new Error("Firebase auth is not available");
  }

  try {
    const user = auth.currentUser;
    if (user) {
      await logUserAction(user.uid, "USER_SIGNED_OUT", {});
    }
    await signOut(auth);
  } catch (error: any) {
    console.error("Sign out error:", error);
    throw new Error(error.message || "Sign out failed");
  }
};

// Get current user profile
export const getCurrentUserProfile = async (): Promise<UserProfile | null> => {
  if (!auth) return null;

  const user = auth.currentUser;
  if (!user) return null;

  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, user.uid));
    if (!userDoc.exists()) return null;

    return userDoc.data() as UserProfile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (
  updates: Partial<UserProfile>,
): Promise<void> => {
  if (!auth || !db) throw new Error("Firebase is not available");

  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  try {
    const userRef = doc(db, COLLECTIONS.USERS, user.uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    // Log profile update
    await logUserAction(user.uid, "PROFILE_UPDATED", updates);
  } catch (error: any) {
    console.error("Profile update error:", error);
    throw new Error(error.message || "Profile update failed");
  }
};

// Upload profile image
export const uploadProfileImage = async (file: File): Promise<string> => {
  if (!auth || !storage) throw new Error("Firebase is not available");

  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  try {
    const imageRef = ref(
      storage,
      `profile-images/${user.uid}/${Date.now()}_${file.name}`,
    );
    const snapshot = await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Update user profile with new photo URL
    await updateProfile(user, { photoURL: downloadURL });
    await updateUserProfile({ photoURL: downloadURL });

    // Log image upload
    await logUserAction(user.uid, "PROFILE_IMAGE_UPLOADED", {
      imageUrl: downloadURL,
    });

    return downloadURL;
  } catch (error: any) {
    console.error("Image upload error:", error);
    throw new Error(error.message || "Image upload failed");
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error("Password reset error:", error);
    throw new Error(error.message || "Password reset failed");
  }
};

// Get user role from custom claims
export const getUserRole = async (): Promise<UserRole | null> => {
  if (!auth) return null;

  const user = auth.currentUser;
  if (!user) return null;

  try {
    const idTokenResult: IdTokenResult = await user.getIdTokenResult();
    return (idTokenResult.claims.role as UserRole) || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};

// Check if user has specific role
export const hasRole = async (requiredRole: UserRole): Promise<boolean> => {
  const userRole = await getUserRole();
  return userRole === requiredRole;
};

// Change user role
export const changeUserRole = async (
  newRole: UserRole,
): Promise<{ success: boolean; message: string; newRole: string }> => {
  if (!auth?.currentUser || !functions) {
    throw new Error("User not authenticated or Firebase not available");
  }

  try {
    const changeRole = httpsCallable(functions, "changeUserRole");
    const result = await changeRole({ newRole });

    const data = result.data as {
      success: boolean;
      message: string;
      newRole: string;
    };

    if (data.success) {
      // Force token refresh to get updated custom claims
      await auth.currentUser.getIdToken(true);

      // Log the role change
      await logUserAction(auth.currentUser.uid, "ROLE_CHANGED_CLIENT", {
        newRole: data.newRole,
        timestamp: new Date().toISOString(),
      });
    }

    return data;
  } catch (error) {
    console.error("Error changing user role:", error);
    throw error;
  }
};

// Get available roles for current user
export const getAvailableRoles = async (): Promise<{
  currentRole: string;
  currentRoleDescription: string;
  availableRoles: Array<{
    role: string;
    description: string;
    requiresApproval: boolean;
  }>;
}> => {
  if (!auth?.currentUser || !functions) {
    throw new Error("User not authenticated or Firebase not available");
  }

  try {
    const getAvailable = httpsCallable(functions, "getAvailableRoles");
    const result = await getAvailable();

    return result.data as {
      currentRole: string;
      currentRoleDescription: string;
      availableRoles: Array<{
        role: string;
        description: string;
        requiresApproval: boolean;
      }>;
    };
  } catch (error) {
    console.error("Error getting available roles:", error);
    throw error;
  }
};

// Check if user has any of the specified roles
export const hasAnyRole = async (roles: UserRole[]): Promise<boolean> => {
  const userRole = await getUserRole();
  return userRole ? roles.includes(userRole) : false;
};

// Check if profile completion is required for user role
export const isProfileCompletionRequired = (role: UserRole): boolean => {
  const rolesRequiringCompletion: UserRole[] = [
    "business_person",
    "investor",
    "banker",
    "business_advisor",
  ];
  return rolesRequiringCompletion.includes(role);
};

// Check if current user profile is complete
export const isCurrentUserProfileComplete = async (): Promise<boolean> => {
  const profile = await getCurrentUserProfile();
  if (!profile) return false;

  // Users and admins don't need profile completion
  if (!isProfileCompletionRequired(profile.role)) {
    return true;
  }

  return profile.isComplete === true;
};

// Complete user profile with role-specific data
export const completeUserProfile = async (profileData: any): Promise<void> => {
  if (!auth || !db) throw new Error("Firebase is not available");

  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  try {
    const userRef = doc(db, COLLECTIONS.USERS, user.uid);

    // Update user profile with completion data
    await updateDoc(userRef, {
      displayName: profileData.fullName,
      isComplete: true,
      profile: {
        ...profileData,
        isComplete: true,
      },
      updatedAt: serverTimestamp(),
    });

    // Also update Firebase Auth display name
    if (profileData.fullName) {
      await updateProfile(user, { displayName: profileData.fullName });
    }

    // Log profile completion
    await logUserAction(user.uid, "PROFILE_COMPLETED", {
      role: (await getUserRole()) || "unknown",
      completedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Profile completion error:", error);
    throw new Error(error.message || "Profile completion failed");
  }
};
