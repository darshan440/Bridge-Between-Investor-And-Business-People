import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { getCurrentUserProfile, UserProfile } from "./auth";

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          // Get user profile from Firestore
          const profile = await getCurrentUserProfile();
          setUserProfile(profile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    const { signOutUser } = await import("./auth");
    await signOutUser();
    setCurrentUser(null);
    setUserProfile(null);
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Higher-order component for protected routes
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
) => {
  return function AuthenticatedComponent(props: P) {
    const { currentUser, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!currentUser) {
      // Redirect to auth page
      window.location.href = "/auth";
      return null;
    }

    return <Component {...props} />;
  };
};

// Hook for role-based access control
export const useRole = () => {
  const { userProfile } = useAuth();
  return userProfile?.role || null;
};

// Hook to check if user has specific role
export const useHasRole = (requiredRole: string) => {
  const role = useRole();
  return role === requiredRole;
};

// Hook to check if user has any of the specified roles
export const useHasAnyRole = (roles: string[]) => {
  const role = useRole();
  return role ? roles.includes(role) : false;
};
