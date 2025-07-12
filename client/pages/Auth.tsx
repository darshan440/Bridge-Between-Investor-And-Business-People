import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, signInUser } from "@/lib/auth";
import { USER_ROLES, UserRole, isFirebaseEnabled } from "@/lib/firebase";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Sign in existing user
        const userProfile = await signInUser(formData.email, formData.password);
        console.log("User signed in:", userProfile);
        navigate("/dashboard", { state: { role: userProfile.role } });
      } else {
        // Register new user
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
        navigate("/dashboard", { state: { role: userProfile.role } });
      }
    } catch (error: any) {
      console.error("Authentication error:", error);

      // Handle specific Firebase auth errors
      if (error.code === "auth/email-already-in-use") {
        setIsLogin(true);
        setError(
          "Email already registered. Switched to login mode. Please try logging in.",
        );
      } else if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        setError("Invalid email or password. Please check your credentials.");
      } else if (error.code === "auth/user-not-found") {
        setIsLogin(false);
        setError("Account not found. Switched to registration mode.");
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters long.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError(error.message || "Authentication failed. Please try again.");
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
                <Label htmlFor="role">I am a... *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    handleInputChange("role", value as UserRole)
                  }
                  required
                  disabled={loading}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={USER_ROLES.USER}>User</SelectItem>
                    <SelectItem value={USER_ROLES.BUSINESS_PERSON}>
                      Business Person
                    </SelectItem>
                    <SelectItem value={USER_ROLES.INVESTOR}>
                      Investor
                    </SelectItem>
                    <SelectItem value={USER_ROLES.BANKER}>Banker</SelectItem>
                    <SelectItem value={USER_ROLES.BUSINESS_ADVISOR}>
                      Business Advisor
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                  onClick={() => {
                    // TODO: Implement forgot password
                    alert("Forgot password functionality coming soon!");
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
