import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UserRole } from "@/lib/firebase";

interface BankerAdvisorFormProps {
  profileData: any;
  setProfileData: (data: any) => void;
  onSubmit: (data: any) => void;
  loading: boolean;
  role: UserRole;
}

export function BankerAdvisorForm({
  profileData,
  setProfileData,
  onSubmit,
  loading,
  role,
}: BankerAdvisorFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const designations = {
    banker: [
      "Relationship Manager",
      "Branch Manager",
      "Credit Manager",
      "Business Development Manager",
      "Senior Manager",
      "Assistant Vice President",
      "Vice President",
      "Regional Head",
      "General Manager",
      "Chief Manager",
    ],
    business_advisor: [
      "Business Consultant",
      "Strategy Advisor",
      "Financial Advisor",
      "Operations Consultant",
      "Marketing Advisor",
      "Technology Consultant",
      "Legal Advisor",
      "HR Consultant",
      "Management Consultant",
      "Industry Expert",
    ],
  };

  const bankerExpertise = [
    "Business Loans",
    "Personal Loans",
    "Home Loans",
    "Vehicle Loans",
    "Trade Finance",
    "Working Capital",
    "Letter of Credit",
    "Investment Banking",
    "Risk Assessment",
    "Credit Analysis",
    "Foreign Exchange",
    "Digital Banking",
  ];

  const advisorExpertise = [
    "Business Strategy",
    "Financial Planning",
    "Operations Management",
    "Marketing & Sales",
    "Technology Implementation",
    "Legal Compliance",
    "Human Resources",
    "Risk Management",
    "Mergers & Acquisitions",
    "International Business",
    "Digital Transformation",
    "Startup Mentoring",
  ];

  const experienceRanges = [
    "1-3 years",
    "3-5 years",
    "5-10 years",
    "10-15 years",
    "15-20 years",
    "20+ years",
  ];

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleExpertiseChange = (expertise: string, checked: boolean) => {
    const currentExpertise = profileData.areaOfExpertise || [];
    if (checked) {
      setProfileData((prev: any) => ({
        ...prev,
        areaOfExpertise: [...currentExpertise, expertise],
      }));
    } else {
      setProfileData((prev: any) => ({
        ...prev,
        areaOfExpertise: currentExpertise.filter(
          (e: string) => e !== expertise,
        ),
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!profileData.fullName?.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!profileData.mobileNumber?.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\+?[\d\s-()]{10,}$/.test(profileData.mobileNumber)) {
      newErrors.mobileNumber = "Please enter a valid mobile number";
    }

    if (!profileData.institutionName?.trim()) {
      newErrors.institutionName =
        role === "banker"
          ? "Bank name is required"
          : "Institution name is required";
    }

    if (!profileData.designation) {
      newErrors.designation = "Designation is required";
    }

    if (!profileData.experienceYears) {
      newErrors.experienceYears = "Experience is required";
    }

    if (
      !profileData.areaOfExpertise ||
      profileData.areaOfExpertise.length === 0
    ) {
      newErrors.areaOfExpertise =
        "Please select at least one area of expertise";
    }

    if (!profileData.professionalSummary?.trim()) {
      newErrors.professionalSummary = "Professional summary is required";
    } else if (profileData.professionalSummary.length < 100) {
      newErrors.professionalSummary =
        "Professional summary should be at least 100 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(profileData);
    }
  };

  const expertiseOptions =
    role === "banker" ? bankerExpertise : advisorExpertise;
  const designationOptions =
    role === "banker" ? designations.banker : designations.business_advisor;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            placeholder="Enter your full name"
            value={profileData.fullName || ""}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            className={errors.fullName ? "border-red-500" : ""}
          />
          {errors.fullName && (
            <span className="text-sm text-red-500">{errors.fullName}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobileNumber">Mobile Number *</Label>
          <Input
            id="mobileNumber"
            placeholder="+91 9876543210"
            value={profileData.mobileNumber || ""}
            onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
            className={errors.mobileNumber ? "border-red-500" : ""}
          />
          {errors.mobileNumber && (
            <span className="text-sm text-red-500">{errors.mobileNumber}</span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="institutionName">
          {role === "banker"
            ? "Bank/Financial Institution Name *"
            : "Institution/Company Name *"}
        </Label>
        <Input
          id="institutionName"
          placeholder={
            role === "banker"
              ? "e.g., State Bank of India"
              : "e.g., ABC Consulting Pvt Ltd"
          }
          value={profileData.institutionName || ""}
          onChange={(e) => handleInputChange("institutionName", e.target.value)}
          className={errors.institutionName ? "border-red-500" : ""}
        />
        {errors.institutionName && (
          <span className="text-sm text-red-500">{errors.institutionName}</span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="designation">Designation *</Label>
          <Select
            value={profileData.designation || ""}
            onValueChange={(value) => handleInputChange("designation", value)}
          >
            <SelectTrigger
              className={errors.designation ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select your designation" />
            </SelectTrigger>
            <SelectContent>
              {designationOptions.map((designation) => (
                <SelectItem key={designation} value={designation}>
                  {designation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.designation && (
            <span className="text-sm text-red-500">{errors.designation}</span>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="experienceYears">Years of Experience *</Label>
          <Select
            value={profileData.experienceYears || ""}
            onValueChange={(value) =>
              handleInputChange("experienceYears", value)
            }
          >
            <SelectTrigger
              className={errors.experienceYears ? "border-red-500" : ""}
            >
              <SelectValue placeholder="Select experience range" />
            </SelectTrigger>
            <SelectContent>
              {experienceRanges.map((range) => (
                <SelectItem key={range} value={range}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.experienceYears && (
            <span className="text-sm text-red-500">
              {errors.experienceYears}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Area of Expertise *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {expertiseOptions.map((expertise) => (
            <div key={expertise} className="flex items-center space-x-2">
              <Checkbox
                id={`expertise-${expertise}`}
                checked={(profileData.areaOfExpertise || []).includes(
                  expertise,
                )}
                onCheckedChange={(checked) =>
                  handleExpertiseChange(expertise, !!checked)
                }
              />
              <Label htmlFor={`expertise-${expertise}`} className="text-sm">
                {expertise}
              </Label>
            </div>
          ))}
        </div>
        {errors.areaOfExpertise && (
          <span className="text-sm text-red-500">{errors.areaOfExpertise}</span>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="professionalSummary">Professional Summary *</Label>
        <Textarea
          id="professionalSummary"
          placeholder={`Describe your professional background, key achievements, and how you can help ${role === "banker" ? "businesses with financial solutions" : "businesses with strategic guidance"} (minimum 100 characters)`}
          value={profileData.professionalSummary || ""}
          onChange={(e) =>
            handleInputChange("professionalSummary", e.target.value)
          }
          rows={5}
          className={errors.professionalSummary ? "border-red-500" : ""}
        />
        <div className="flex justify-between text-sm">
          {errors.professionalSummary ? (
            <span className="text-red-500">{errors.professionalSummary}</span>
          ) : (
            <span className="text-gray-500">
              {profileData.professionalSummary?.length || 0}/100 characters
              minimum
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="qualifications">Qualifications & Certifications</Label>
        <Textarea
          id="qualifications"
          placeholder="List your relevant qualifications, certifications, and educational background"
          value={profileData.qualifications || ""}
          onChange={(e) => handleInputChange("qualifications", e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedIn">LinkedIn Profile</Label>
        <Input
          id="linkedIn"
          type="url"
          placeholder="https://linkedin.com/in/yourprofile"
          value={profileData.linkedIn || ""}
          onChange={(e) => handleInputChange("linkedIn", e.target.value)}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Completing Profile..." : "Complete Profile"}
        </Button>
      </div>
    </form>
  );
}
