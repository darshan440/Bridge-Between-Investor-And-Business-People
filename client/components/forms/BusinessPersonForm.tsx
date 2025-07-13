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

interface BusinessPersonFormProps {
  profileData: any;
  setProfileData: (data: any) => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}

export function BusinessPersonForm({
  profileData,
  setProfileData,
  onSubmit,
  loading,
}: BusinessPersonFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const businessCategories = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "E-commerce",
    "Food & Beverage",
    "Real Estate",
    "Agriculture",
    "Manufacturing",
    "Services",
    "Consulting",
    "Others",
  ];

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
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

    if (!profileData.companyName?.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!profileData.businessCategory) {
      newErrors.businessCategory = "Business category is required";
    }

    if (!profileData.briefDescription?.trim()) {
      newErrors.briefDescription = "Brief description is required";
    } else if (profileData.briefDescription.length < 50) {
      newErrors.briefDescription =
        "Description should be at least 50 characters";
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
        <Label htmlFor="companyName">Company Name *</Label>
        <Input
          id="companyName"
          placeholder="Your company or business name"
          value={profileData.companyName || ""}
          onChange={(e) => handleInputChange("companyName", e.target.value)}
          className={errors.companyName ? "border-red-500" : ""}
        />
        {errors.companyName && (
          <span className="text-sm text-red-500">{errors.companyName}</span>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessCategory">Business Category *</Label>
        <Select
          value={profileData.businessCategory || ""}
          onValueChange={(value) =>
            handleInputChange("businessCategory", value)
          }
        >
          <SelectTrigger
            className={errors.businessCategory ? "border-red-500" : ""}
          >
            <SelectValue placeholder="Select your business category" />
          </SelectTrigger>
          <SelectContent>
            {businessCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.businessCategory && (
          <span className="text-sm text-red-500">
            {errors.businessCategory}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="briefDescription">Brief Description *</Label>
        <Textarea
          id="briefDescription"
          placeholder="Describe your business, your role, and what you're looking for (minimum 50 characters)"
          value={profileData.briefDescription || ""}
          onChange={(e) =>
            handleInputChange("briefDescription", e.target.value)
          }
          rows={4}
          className={errors.briefDescription ? "border-red-500" : ""}
        />
        <div className="flex justify-between text-sm">
          {errors.briefDescription ? (
            <span className="text-red-500">{errors.briefDescription}</span>
          ) : (
            <span className="text-gray-500">
              {profileData.briefDescription?.length || 0}/50 characters minimum
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="yearsOfExperience">Years of Experience</Label>
        <Input
          id="yearsOfExperience"
          type="number"
          min="0"
          max="50"
          placeholder="Years in business"
          value={profileData.yearsOfExperience || ""}
          onChange={(e) =>
            handleInputChange("yearsOfExperience", e.target.value)
          }
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Company Website</Label>
        <Input
          id="website"
          type="url"
          placeholder="https://yourcompany.com"
          value={profileData.website || ""}
          onChange={(e) => handleInputChange("website", e.target.value)}
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
