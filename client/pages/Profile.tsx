import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Camera,
  User,
  Mail,
  Phone,
  Building,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentUserProfile, updateUserProfile } from "@/lib/auth";
import { UserProfile } from "@/lib/auth";
import { ImageCropper } from "@/components/ImageCropper";
import { RoleChangeModal } from "@/components/RoleChangeModal";

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    mobileNumber: "",
    companyName: "",
    institutionName: "",
    designation: "",
    website: "",
    linkedIn: "",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const userProfile = await getCurrentUserProfile();
      if (!userProfile) {
        navigate("/auth");
        return;
      }
      setProfile(userProfile);
      setFormData({
        displayName: userProfile.displayName || "",
        bio: userProfile.profile?.bio || "",
        mobileNumber: userProfile.profile?.mobileNumber || "",
        companyName: userProfile.profile?.companyName || "",
        institutionName: userProfile.profile?.institutionName || "",
        designation: userProfile.profile?.designation || "",
        website: userProfile.profile?.website || "",
        linkedIn: userProfile.profile?.linkedIn || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateUserProfile({
        displayName: formData.displayName,
        profile: {
          ...profile?.profile,
          bio: formData.bio,
          mobileNumber: formData.mobileNumber,
          companyName: formData.companyName,
          institutionName: formData.institutionName,
          designation: formData.designation,
          website: formData.website,
          linkedIn: formData.linkedIn,
        },
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        className: "bg-green-50 border-green-200",
      });

      setEditing(false);
      await loadProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please select a valid image file (JPG, PNG, SVG).",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageCropped = async (croppedImageDataUrl: string) => {
    setUploading(true);
    setShowCropper(false);

    try {
      // Convert data URL to file
      const response = await fetch(croppedImageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], "profile-image.jpg", {
        type: "image/jpeg",
      });

      // Upload to Firebase Storage
      const { uploadProfileImage } = await import("@/lib/auth");
      const photoURL = await uploadProfileImage(file);

      toast({
        title: "Photo Updated",
        description: "Your profile photo has been successfully updated.",
        className: "bg-green-50 border-green-200",
      });

      await loadProfile();
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "business_person":
        return "Business Person";
      case "business_advisor":
        return "Business Advisor";
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "business_person":
        return "bg-blue-100 text-blue-800";
      case "investor":
        return "bg-green-100 text-green-800";
      case "banker":
        return "bg-purple-100 text-purple-800";
      case "business_advisor":
        return "bg-orange-100 text-orange-800";
      case "admin":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canChangeRole = profile?.role !== "banker" && profile?.role !== "admin";

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
                My Profile
              </h1>
            </div>
            <div></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Photo & Basic Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="text-center">
                <div className="relative mx-auto w-32 h-32 mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                    {profile.photoURL ? (
                      <img
                        src={profile.photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0">
                    <input
                      type="file"
                      id="photo-upload"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                      {uploading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Camera className="w-5 h-5" />
                      )}
                    </label>
                  </div>
                </div>
                <CardTitle>{profile.displayName}</CardTitle>
                <CardDescription className="flex items-center justify-center space-x-2">
                  <Badge className={getRoleBadgeColor(profile.role)}>
                    {getRoleLabel(profile.role)}
                  </Badge>
                  {canChangeRole && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowRoleModal(true)}
                      className="text-xs"
                    >
                      Change Role
                    </Button>
                  )}
                </CardDescription>
                {!canChangeRole && profile.role === "banker" && (
                  <p className="text-sm text-gray-500 mt-2">
                    No role changes are available for your current role. Contact
                    admin.
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{profile.email}</span>
                </div>
                {formData.mobileNumber && (
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>{formData.mobileNumber}</span>
                  </div>
                )}
                {(formData.companyName || formData.institutionName) && (
                  <div className="flex items-center space-x-3 text-sm">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span>
                      {formData.companyName || formData.institutionName}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Profile Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Overall Progress</span>
                    <span className="text-sm font-medium">
                      {profile.isComplete ? "100%" : "80%"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: profile.isComplete ? "100%" : "80%" }}
                    ></div>
                  </div>
                  {!profile.isComplete && (
                    <p className="text-xs text-gray-500">
                      Complete your profile to unlock all features
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and preferences
                  </CardDescription>
                </div>
                <Button
                  variant={editing ? "outline" : "default"}
                  onClick={() => {
                    if (editing) {
                      setEditing(false);
                      // Reset form to original values
                      setFormData({
                        displayName: profile.displayName || "",
                        bio: profile.profile?.bio || "",
                        mobileNumber: profile.profile?.mobileNumber || "",
                        companyName: profile.profile?.companyName || "",
                        institutionName: profile.profile?.institutionName || "",
                        designation: profile.profile?.designation || "",
                        website: profile.profile?.website || "",
                        linkedIn: profile.profile?.linkedIn || "",
                      });
                    } else {
                      setEditing(true);
                    }
                  }}
                >
                  {editing ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Full Name</Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) =>
                        handleInputChange("displayName", e.target.value)
                      }
                      disabled={!editing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobileNumber">Mobile Number</Label>
                    <Input
                      id="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={(e) =>
                        handleInputChange("mobileNumber", e.target.value)
                      }
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    disabled={!editing}
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Role-specific fields */}
                {(profile.role === "business_person" ||
                  profile.role === "investor") && (
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) =>
                        handleInputChange("companyName", e.target.value)
                      }
                      disabled={!editing}
                    />
                  </div>
                )}

                {(profile.role === "banker" ||
                  profile.role === "business_advisor") && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="institutionName">
                        {profile.role === "banker"
                          ? "Bank Name"
                          : "Institution Name"}
                      </Label>
                      <Input
                        id="institutionName"
                        value={formData.institutionName}
                        onChange={(e) =>
                          handleInputChange("institutionName", e.target.value)
                        }
                        disabled={!editing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="designation">Designation</Label>
                      <Input
                        id="designation"
                        value={formData.designation}
                        onChange={(e) =>
                          handleInputChange("designation", e.target.value)
                        }
                        disabled={!editing}
                      />
                    </div>
                  </>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website}
                      onChange={(e) =>
                        handleInputChange("website", e.target.value)
                      }
                      disabled={!editing}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedIn">LinkedIn Profile</Label>
                    <Input
                      id="linkedIn"
                      type="url"
                      value={formData.linkedIn}
                      onChange={(e) =>
                        handleInputChange("linkedIn", e.target.value)
                      }
                      disabled={!editing}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                </div>

                {editing && (
                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && selectedImage && (
        <ImageCropper
          imageSrc={selectedImage}
          onCropComplete={handleImageCropped}
          onCancel={() => {
            setShowCropper(false);
            setSelectedImage(null);
          }}
        />
      )}

      {/* Role Change Modal */}
      <RoleChangeModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onRoleChanged={async () => {
          setShowRoleModal(false);
          await loadProfile();
        }}
      />
    </div>
  );
}
