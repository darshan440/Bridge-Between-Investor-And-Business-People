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

interface InvestorFormProps {
  profileData: any;
  setProfileData: (data: any) => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}

export function InvestorForm({
  profileData,
  setProfileData,
  onSubmit,
  loading,
}: InvestorFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const investmentBudgets = [
    "₹1-5 Lakhs",
    "₹5-10 Lakhs",
    "₹10-25 Lakhs",
    "₹25-50 Lakhs",
    "₹50 Lakhs - 1 Crore",
    "₹1-5 Crores",
    "₹5+ Crores",
  ];

  const preferredSectors = [
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
    "Clean Energy",
    "Automotive",
  ];

  const investmentStages = [
    "Seed Stage",
    "Pre-Series A",
    "Series A",
    "Series B+",
    "Growth Stage",
    "Pre-IPO",
  ];

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSectorChange = (sector: string, checked: boolean) => {
    const currentSectors = profileData.preferredSectors || [];
    if (checked) {
      setProfileData((prev: any) => ({
        ...prev,
        preferredSectors: [...currentSectors, sector],
      }));
    } else {
      setProfileData((prev: any) => ({
        ...prev,
        preferredSectors: currentSectors.filter((s: string) => s !== sector),
      }));
    }
  };

  const handleStageChange = (stage: string, checked: boolean) => {
    const currentStages = profileData.preferredStages || [];
    if (checked) {
      setProfileData((prev: any) => ({
        ...prev,
        preferredStages: [...currentStages, stage],
      }));
    } else {
      setProfileData((prev: any) => ({
        ...prev,
        preferredStages: currentStages.filter((s: string) => s !== stage),
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

    if (!profileData.investmentBudget) {
      newErrors.investmentBudget = "Investment budget is required";
    }

    if (
      !profileData.preferredSectors ||
      profileData.preferredSectors.length === 0
    ) {
      newErrors.preferredSectors =
        "Please select at least one preferred sector";
    }

    if (!profileData.investmentExperience?.trim()) {
      newErrors.investmentExperience = "Investment experience is required";
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
        <Label htmlFor="investmentBudget">Investment Budget *</Label>
        <Select
          value={profileData.investmentBudget || ""}
          onValueChange={(value) =>
            handleInputChange("investmentBudget", value)
          }
        >
          <SelectTrigger
            className={errors.investmentBudget ? "border-red-500" : ""}
          >
            <SelectValue placeholder="Select your investment budget range" />
          </SelectTrigger>
          <SelectContent>
            {investmentBudgets.map((budget) => (
              <SelectItem key={budget} value={budget}>
                {budget}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.investmentBudget && (
          <span className="text-sm text-red-500">
            {errors.investmentBudget}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <Label>Preferred Sectors *</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {preferredSectors.map((sector) => (
            <div key={sector} className="flex items-center space-x-2">
              <Checkbox
                id={`sector-${sector}`}
                checked={(profileData.preferredSectors || []).includes(sector)}
                onCheckedChange={(checked) =>
                  handleSectorChange(sector, !!checked)
                }
              />
              <Label htmlFor={`sector-${sector}`} className="text-sm">
                {sector}
              </Label>
            </div>
          ))}
        </div>
        {errors.preferredSectors && (
          <span className="text-sm text-red-500">
            {errors.preferredSectors}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <Label>Preferred Investment Stages</Label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {investmentStages.map((stage) => (
            <div key={stage} className="flex items-center space-x-2">
              <Checkbox
                id={`stage-${stage}`}
                checked={(profileData.preferredStages || []).includes(stage)}
                onCheckedChange={(checked) =>
                  handleStageChange(stage, !!checked)
                }
              />
              <Label htmlFor={`stage-${stage}`} className="text-sm">
                {stage}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="investmentExperience">Investment Experience *</Label>
        <Textarea
          id="investmentExperience"
          placeholder="Describe your investment background, previous investments, and what you look for in opportunities"
          value={profileData.investmentExperience || ""}
          onChange={(e) =>
            handleInputChange("investmentExperience", e.target.value)
          }
          rows={4}
          className={errors.investmentExperience ? "border-red-500" : ""}
        />
        {errors.investmentExperience && (
          <span className="text-sm text-red-500">
            {errors.investmentExperience}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="investmentCriteria">Investment Criteria</Label>
        <Textarea
          id="investmentCriteria"
          placeholder="What specific criteria do you use when evaluating investment opportunities?"
          value={profileData.investmentCriteria || ""}
          onChange={(e) =>
            handleInputChange("investmentCriteria", e.target.value)
          }
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
