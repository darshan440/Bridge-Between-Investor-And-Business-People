import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  registerUser,
  resetPassword,
  signInUser,
  changeUserRole,
  isProfileCompletionRequired,
} from "@/lib/auth";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { USER_ROLES, UserRole, isFirebaseEnabled } from "@/lib/firebase";
import { ArrowLeft, Building, Loader2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "" as UserRole,
  });
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Create/update user profile in Firestore
      const { setDoc, doc } = await import("firebase/firestore");
      const { db, serverTimestamp } = await import("@/lib/firebase");

      await setDoc(
        doc(db, "users", user.uid),
        {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: formData.role || "user",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          isActive: true,
        },
        { merge: true },
      );

      // Set user role if specified
      if (formData.role) {
        const { setUserRole } = await import("@/lib/auth");
        await setUserRole(user.uid, formData.role);
      }

      const finalRole = formData.role || "user";

      // Check if profile completion is required
      if (isProfileCompletionRequired(finalRole as any)) {
        navigate("/complete-profile", { state: { role: finalRole } });
      } else {
        navigate("/dashboard", { state: { role: finalRole } });
      }
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      setError(error.message || "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Sign in existing user
        const userProfile = await signInUser(formData.email, formData.password);
        console.log("User signed in:", userProfile);

        // Handle role selection during login
        let finalRole = userProfile.role;

        if (formData.role && formData.role !== userProfile.role) {
          // Validate role change is allowed
          const allowedRoles = [
            "user",
            "business_person",
            "investor",
            "business_advisor",
            "banker",
          ];
          const restrictedRoles = ["admin"];

          if (restrictedRoles.includes(formData.role)) {
            setError(
              `❌ You cannot log in as ${formData.role}. That role is restricted to verified staff. Please contact admin.`,
            );
            setLoading(false);
            return;
          }

          if (allowedRoles.includes(formData.role)) {
            try {
              // Change role using the role management function
              const roleChangeResult = await changeUserRole(formData.role);
              if (roleChangeResult.success) {
                finalRole = roleChangeResult.newRole;
                console.log("Role changed during login:", finalRole);
              }
            } catch (roleError: any) {
              console.error("Role change error:", roleError);
              setError(`Role change failed: ${roleError.message}`);
              setLoading(false);
              return;
            }
          }
        }

        // Check if profile completion is required
        if (
          isProfileCompletionRequired(finalRole as any) &&
          !userProfile.isComplete
        ) {
          navigate("/complete-profile", { state: { role: finalRole } });
        } else {
          navigate("/dashboard", { state: { role: finalRole } });
        }
      } else {
        // Sign up new user
        if (!formData.name || !formData.role) {
          setError("Please fill in all required fields");
          return;
        }

        const userProfile = await registerUser(
          formData.email,
          formData.password,
          formData.name,
          formData.role,
        );
        console.log("User registered:", userProfile);

        // Check if profile completion is required for new user
        if (isProfileCompletionRequired(userProfile.role)) {
          navigate("/complete-profile", { state: { role: userProfile.role } });
        } else {
          navigate("/dashboard", { state: { role: userProfile.role } });
        }
      }
    } catch (error: any) {
      // If login failed because user doesn't exist
      if (error.message.includes("USER_NOT_FOUND")) {
        setTimeout(() => {
          setIsLogin(false); // switch to signup form
          setError("User not found. Please sign up.");
        }, 100);
        return;
      }
      if (error.code === "auth/wrong-password") {
        setError("Wrong password. Please try again.");
      } else if (error.code === "auth/email-already-in-use") {
        setError("Email already registered. Redirecting to login...");
        setTimeout(() => setIsLogin(true), 1500);
      } else {
        console.error("Authentication error:", error);

        // Handle specific Firebase auth errors with user-friendly messages
        const friendlyErrorMessages: Record<string, string> = {
          "auth/email-already-in-use":
            "This email is already registered. Please try logging in instead.",
          "auth/invalid-credential":
            "The email or password you entered is incorrect. Please check and try again.",
          "auth/wrong-password":
            "The password you entered is incorrect. Please try again or reset your password.",
          "auth/user-not-found":
            "No account found with this email. Please check the email or create a new account.",
          "auth/weak-password":
            "Password must be at least 6 characters long. Please choose a stronger password.",
          "auth/invalid-email":
            "Please enter a valid email address (e.g., name@example.com).",
          "auth/too-many-requests":
            "Too many failed login attempts. Please wait a few minutes before trying again.",
          "auth/user-disabled":
            "This account has been disabled. Please contact support for assistance.",
          "auth/operation-not-allowed":
            "This sign-in method is not enabled. Please contact support.",
          "auth/network-request-failed":
            "Network error. Please check your internet connection and try again.",
          "auth/popup-closed-by-user":
            "Sign-in was cancelled. Please try again.",
          "auth/cancelled-popup-request":
            "Only one sign-in popup can be open at a time.",
          "auth/popup-blocked":
            "Popup was blocked by your browser. Please allow popups for this site.",
          internal: "A server error occurred. Please try again later.",
          "permission-denied":
            "You don't have permission to perform this action.",
          "not-found": "The requested resource was not found.",
          unauthenticated: "Please log in to continue.",
        };

        const userFriendlyMessage =
          friendlyErrorMessages[error.code] ||
          friendlyErrorMessages[error.message] ||
          `Something went wrong: ${error.message || "Please try again."}`;

        if (error.code === "auth/email-already-in-use") {
          setIsLogin(true);
        } else if (error.code === "auth/user-not-found") {
          setIsLogin(false);
        }

        setError(userFriendlyMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const isFormValid = () => {
    if (!formData.email || !formData.password || !formData.role) return false;
    if (!isLogin && !formData.name) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">InvestBridge</h1>
          </div>
          <p className="text-gray-600">
            {isLogin
              ? "Welcome back to your investment journey"
              : "Start your investment journey today"}
          </p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">
              {isLogin ? "Sign In" : "Create Account"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Access your dashboard and investment portfolio"
                : "Join our community of investors and entrepreneurs"}
            </CardDescription>

            {/* Mode Switch Helper */}
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                {isLogin
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                >
                  {isLogin ? "Sign Up" : "Login"}
                </button>
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {!isFirebaseEnabled && (
              <Alert className="mb-6 border-yellow-200 bg-yellow-50">
                <AlertDescription className="text-yellow-800">
                  ⚠️ Firebase is not configured. Please set up your environment
                  variables to enable authentication.
                  <br />
                  <span className="text-sm">
                    Copy .env.example to .env and add your Firebase
                    configuration.
                  </span>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    autoComplete="current-name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required={!isLogin}
                    className="h-11"
                    disabled={loading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="current-email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="h-11"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  required
                  className="h-11"
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">
                  {isLogin ? "Login as... (optional)" : "I am a... *"}
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    handleInputChange("role", value as UserRole)
                  }
                  required={!isLogin}
                  disabled={loading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue
                      placeholder={
                        isLogin ? "Select role (optional)" : "Select your role"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={USER_ROLES.USER}>User</SelectItem>
                    <SelectItem value={USER_ROLES.BUSINESS_PERSON}>
                      Business Person
                    </SelectItem>
                    <SelectItem value={USER_ROLES.INVESTOR}>
                      Investor
                    </SelectItem>
                    <SelectItem value={USER_ROLES.BUSINESS_ADVISOR}>
                      Business Advisor
                    </SelectItem>
                    <SelectItem value={USER_ROLES.BANKER}>Banker</SelectItem>
                  </SelectContent>
                </Select>
                {isLogin && formData.role && (
                  <p className="text-xs text-blue-600">
                    You'll be logged in with {formData.role.replace("_", " ")}{" "}
                    privileges
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={!isFormValid() || loading || !isFirebaseEnabled}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isLogin ? "Signing In..." : "Creating Account..."}
                  </>
                ) : (
                  <>{isLogin ? "Sign In" : "Create Account"}</>
                )}
              </Button>
            </form>

            {/* Google Sign-in */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11"
              disabled={loading || !isFirebaseEnabled}
              onClick={handleGoogleSignIn}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>

            {/* Toggle between login/register */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setFormData({
                    name: "",
                    email: "",
                    password: "",
                    role: "" as UserRole,
                  });
                }}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                disabled={loading}
              >
                {isLogin
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>

            {/* Forgot password for login */}
            {isLogin && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
                  disabled={loading}
                  onClick={async () => {
                    if (!formData.email) {
                      setError("Please enter your email first.");
                      return;
                    }

                    try {
                      await resetPassword(formData.email);
                      alert(
                        "Password reset email sent. Please check your inbox.",
                      );
                    } catch (err: any) {
                      console.error("Reset error:", err);
                      setError(err.message || "Failed to send reset email.");
                    }
                  }}
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security notice */}
        <div className="mt-6 text-center text-sm text-gray-500">
          🔐 Protected by Firebase Authentication with industry-standard
          encryption
        </div>
      </div>
    </div>
  );
}
