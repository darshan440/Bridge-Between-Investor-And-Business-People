import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  Mail,
  User,
  Building,
  TrendingUp,
  Briefcase,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { UserRole } from "@/lib/firebase";

interface ContactInfo {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  mobileNumber?: string;
  companyName?: string;
  institutionName?: string;
  designation?: string;
  isComplete?: boolean;
}

interface ContactCardProps {
  authorInfo: ContactInfo;
  className?: string;
  variant?: "card" | "inline" | "minimal";
}

export function ContactCard({
  authorInfo,
  className = "",
  variant = "card",
}: ContactCardProps) {
  // Don't show contact card if profile is not complete
  if (!authorInfo.isComplete) {
    return null;
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "business_person":
        return Building;
      case "investor":
        return TrendingUp;
      case "banker":
        return Briefcase;
      case "business_advisor":
        return MessageCircle;
      default:
        return User;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "business_person":
        return "Business Person";
      case "investor":
        return "Investor";
      case "banker":
        return "Banking Professional";
      case "business_advisor":
        return "Business Advisor";
      default:
        return "User";
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "business_person":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "investor":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "banker":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "business_advisor":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const RoleIcon = getRoleIcon(authorInfo.role);

  if (variant === "minimal") {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div className="flex items-center space-x-2">
          <RoleIcon className="w-4 h-4 text-gray-600" />
          <span className="font-medium text-sm">{authorInfo.fullName}</span>
          <Badge
            variant="secondary"
            className={`text-xs ${getRoleBadgeColor(authorInfo.role)}`}
          >
            {getRoleLabel(authorInfo.role)}
          </Badge>
        </div>
        {authorInfo.mobileNumber && (
          <a
            href={`tel:${authorInfo.mobileNumber}`}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            <Phone className="w-4 h-4 inline mr-1" />
            Call
          </a>
        )}
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <div
        className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg border ${className}`}
      >
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <RoleIcon className="w-5 h-5 text-gray-600" />
            <div>
              <div className="font-semibold text-gray-900">
                {authorInfo.fullName}
              </div>
              <div className="flex items-center space-x-2">
                <Badge
                  variant="secondary"
                  className={`text-xs ${getRoleBadgeColor(authorInfo.role)}`}
                >
                  {getRoleLabel(authorInfo.role)}
                </Badge>
                {(authorInfo.companyName || authorInfo.institutionName) && (
                  <span className="text-sm text-gray-600">
                    at {authorInfo.companyName || authorInfo.institutionName}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {authorInfo.mobileNumber && (
            <Button size="sm" variant="outline" asChild>
              <a href={`tel:${authorInfo.mobileNumber}`}>
                <Phone className="w-4 h-4 mr-1" />
                Call
              </a>
            </Button>
          )}
          <Button size="sm" variant="outline" asChild>
            <a href={`mailto:${authorInfo.email}`}>
              <Mail className="w-4 h-4 mr-1" />
              Email
            </a>
          </Button>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <RoleIcon className="w-5 h-5 text-blue-600" />
          <span>Contact Author</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900">
              {authorInfo.fullName}
            </span>
            <Badge
              variant="secondary"
              className={getRoleBadgeColor(authorInfo.role)}
            >
              {getRoleLabel(authorInfo.role)}
            </Badge>
          </div>

          {(authorInfo.companyName || authorInfo.institutionName) && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Building className="w-4 h-4" />
              <span>
                {authorInfo.designation && `${authorInfo.designation} at `}
                {authorInfo.companyName || authorInfo.institutionName}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="w-4 h-4 text-gray-500" />
            <a
              href={`mailto:${authorInfo.email}`}
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              {authorInfo.email}
            </a>
          </div>

          {authorInfo.mobileNumber && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="w-4 h-4 text-gray-500" />
              <a
                href={`tel:${authorInfo.mobileNumber}`}
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                {authorInfo.mobileNumber}
              </a>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-2 pt-2">
          <Button size="sm" className="w-full" asChild>
            <a href={`mailto:${authorInfo.email}`}>
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </a>
          </Button>

          {authorInfo.mobileNumber && (
            <Button size="sm" variant="outline" className="w-full" asChild>
              <a href={`tel:${authorInfo.mobileNumber}`}>
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </a>
            </Button>
          )}
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500 text-center">
            Contact information is shared with permission for business
            collaboration
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to extract contact info from user profile
export function extractContactInfo(userProfile: any): ContactInfo | null {
  if (!userProfile || !userProfile.isComplete) {
    return null;
  }

  return {
    uid: userProfile.uid,
    fullName: userProfile.profile?.fullName || userProfile.displayName,
    email: userProfile.email,
    role: userProfile.role,
    mobileNumber: userProfile.profile?.mobileNumber,
    companyName: userProfile.profile?.companyName,
    institutionName: userProfile.profile?.institutionName,
    designation: userProfile.profile?.designation,
    isComplete: userProfile.isComplete,
  };
}
