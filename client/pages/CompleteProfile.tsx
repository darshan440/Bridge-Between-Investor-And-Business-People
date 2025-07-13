import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentUserProfile, updateUserProfile } from "@/lib/auth";
import { UserRole } from "@/lib/firebase";
import { BusinessPersonForm } from "@/components/forms/BusinessPersonForm";
import { InvestorForm } from "@/components/forms/InvestorForm";
import { BankerAdvisorForm } from "@/components/forms/BankerAdvisorForm";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, CheckCircle, User } from "lucide-react";
import { Link } from "react-router-dom";

interface CompleteProfileData {
  fullName: string;
  mobileNumber: string;
  [key: string]: any;
}

export default function CompleteProfile() {
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [profileData, setProfileData] = useState<CompleteProfileData>({
    fullName: "",
    mobileNumber: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getCurrentUserProfile();
        if (!profile) {
          navigate("/auth");
          return;
        }

        setUserRole(profile.role);

        // If profile is already complete, redirect to dashboard
        if (profile.isComplete) {
          navigate("/dashboard");
          return;
        }

        // Pre-populate with existing data
        setProfileData({
          fullName: profile.displayName || "",
          mobileNumber: profile.profile?.mobileNumber || "",
          ...profile.profile,
        });
      } catch (error) {
        console.error("Error loading profile:", error);
        navigate("/auth");
      }
    };

    loadUserProfile();
  }, [navigate]);

  const handleSubmit = async (formData: CompleteProfileData) => {
    setLoading(true);
    try {
      // Update user profile with form data and mark as complete
      await updateUserProfile({
        displayName: formData.fullName,
        profile: {
          ...formData,
          isComplete: true,
        },
        isComplete: true,
      });

      toast({
        title: "Profile completed successfully!",
        description: "Your profile is now visible to other users.",
        className: "bg-green-50 border-green-200",
      });

      // Redirect to dashboard after successful completion
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Profile completion error:", error);
      toast({
        title: "Error completing profile",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!userRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Users and admins don't need profile completion
  if (userRole === "user" || userRole === "admin") {
    navigate("/dashboard");
    return null;
  }

  const getRoleTitle = (role: UserRole) => {
    switch (role) {
      case "business_person":
        return "Business Person Profile";
      case "investor":
        return "Investor Profile";
      case "banker":
        return "Banking Professional Profile";
      case "business_advisor":
        return "Business Advisor Profile";
      default:
        return "Complete Your Profile";
    }
  };

  const getRoleDescription = (role: UserRole) => {
    switch (role) {
      case "business_person":
        return "Help investors and advisors understand your business background and current ventures.";
      case "investor":
        return "Share your investment preferences and experience to connect with relevant opportunities.";
      case "banker":
        return "Showcase your banking expertise and the financial products you can offer.";
      case "business_advisor":
        return "Highlight your advisory experience and areas of expertise to attract businesses seeking guidance.";
      default:
        return "Complete your profile to access all platform features.";
    }
  };

  const renderRoleForm = () => {
    const commonProps = {
      profileData,
      setProfileData,
      onSubmit: handleSubmit,
      loading,
    };

    switch (userRole) {
      case "business_person":
        return <BusinessPersonForm {...commonProps} />;
      case "investor":
        return <InvestorForm {...commonProps} />;
      case "banker":
      case "business_advisor":
        return <BankerAdvisorForm {...commonProps} role={userRole} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Complete Profile
              </h1>
            </div>
            <div></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">Almost Done!</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getRoleTitle(userRole)}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {getRoleDescription(userRole)}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Complete your profile to unlock full platform access and
                  connect with other users
                </CardDescription>
              </CardHeader>
              <CardContent>{renderRoleForm()}</CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Why Complete Your Profile?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Better Connections
                  </h4>
                  <p className="text-sm text-blue-800">
                    Help others understand your background and expertise for
                    more meaningful collaborations.
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">
                    Direct Communication
                  </h4>
                  <p className="text-sm text-green-800">
                    Your contact information will be visible in your posts,
                    making it easier for interested parties to reach you.
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">
                    Trust & Credibility
                  </h4>
                  <p className="text-sm text-purple-800">
                    A complete profile builds trust and increases your chances
                    of successful partnerships.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy Notice</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>
                  • Only your name, role, and contact info will be shown in your
                  posts
                </p>
                <p>
                  • Other profile details remain private unless you choose to
                  share them
                </p>
                <p>• You can update your profile anytime from your dashboard</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
