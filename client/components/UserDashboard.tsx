import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Lightbulb,
  MessageSquare,
  Building,
  ArrowRight,
  Users,
  DollarSign,
  Star,
  Shield,
  Zap,
} from "lucide-react";
import { RoleChangeModal } from "./RoleChangeModal";
import { WelcomeBanner } from "./WelcomeBanner";

interface UserDashboardProps {
  onRoleChanged: (newRole: string) => void;
}

const roleUpgradeOptions = [
  {
    role: "investor",
    title: "Become an Investor",
    description: "Discover and invest in promising business opportunities",
    icon: TrendingUp,
    color: "from-green-500 to-emerald-600",
    benefits: [
      "Access to exclusive investment opportunities",
      "Portfolio tracking and analytics",
      "Direct communication with entrepreneurs",
      "Investment risk assessment tools",
    ],
    features: [
      "Browse business ideas",
      "Make investment proposals",
      "Track your investments",
      "Get ROI analytics",
    ],
  },
  {
    role: "business_person",
    title: "Become an Entrepreneur",
    description: "Share your business ideas and attract potential investors",
    icon: Lightbulb,
    color: "from-blue-500 to-cyan-600",
    benefits: [
      "Post unlimited business ideas",
      "Connect with interested investors",
      "Get expert advice from advisors",
      "Access funding opportunities",
    ],
    features: [
      "Post business ideas",
      "Receive investment proposals",
      "Get advisor suggestions",
      "Manage investor relations",
    ],
  },
  {
    role: "business_advisor",
    title: "Become a Business Advisor",
    description: "Share your expertise and help entrepreneurs succeed",
    icon: MessageSquare,
    color: "from-purple-500 to-violet-600",
    benefits: [
      "Share your expertise with entrepreneurs",
      "Build your professional reputation",
      "Network with industry professionals",
      "Monetize your knowledge and experience",
    ],
    features: [
      "Provide expert advice",
      "Answer business queries",
      "Post tips and insights",
      "Mentor entrepreneurs",
    ],
  },
];

const generalFeatures = [
  {
    title: "Browse Opportunities",
    description: "Explore various investment and business opportunities",
    icon: Building,
    href: "/browse",
  },
  {
    title: "Community Forum",
    description: "Connect with other users and share insights",
    icon: Users,
    href: "/community",
  },
  {
    title: "Learn & Resources",
    description: "Access educational content and business resources",
    icon: Star,
    href: "/resources",
  },
  {
    title: "Help & Support",
    description: "Get help and support for using the platform",
    icon: Shield,
    href: "/help",
  },
];

export function UserDashboard({ onRoleChanged }: UserDashboardProps) {
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleRoleChange = (newRole: string) => {
    onRoleChanged(newRole);
    setShowRoleModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <WelcomeBanner onUpgradeRole={() => setShowRoleModal(true)} />

      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to InvestBridge
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          You're currently browsing as a general user. Upgrade your role to
          unlock powerful features and connect with investors, entrepreneurs,
          and advisors.
        </p>
      </div>

      {/* Role Upgrade Banner */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-100 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center text-blue-900">
                <Zap className="w-5 h-5 mr-2" />
                Unlock Your Potential
              </CardTitle>
              <CardDescription className="text-blue-700">
                Choose a specialized role to access advanced features and
                opportunities
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowRoleModal(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Change Role
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Role Upgrade Options */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Path</h2>
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
          {roleUpgradeOptions.map((option) => (
            <Card
              key={option.role}
              className="relative overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${option.color}`}
              />
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center`}
                  >
                    <option.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                  </div>
                </div>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Key Benefits:
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {option.benefits.slice(0, 2).map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {option.features.slice(0, 3).map((feature, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  onClick={() => setShowRoleModal(true)}
                  className="w-full mt-4"
                  variant="outline"
                >
                  Upgrade to {option.title.split(" ")[2]}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* General Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Available Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {generalFeatures.map((feature, index) => (
            <Link key={index} to={feature.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started Section */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            New to InvestBridge? Here's how to make the most of our platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">For Entrepreneurs:</h4>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Upgrade to "Business Person" role</li>
                <li>Post your business idea with detailed information</li>
                <li>Connect with interested investors</li>
                <li>Get expert advice from business advisors</li>
              </ol>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">For Investors:</h4>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
                <li>Upgrade to "Investor" role</li>
                <li>Browse business opportunities</li>
                <li>Make investment proposals</li>
                <li>Track your portfolio performance</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Statistics */}
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">1,234</div>
              <div className="text-sm text-gray-600">Business Ideas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">567</div>
              <div className="text-sm text-gray-600">Active Investors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">890</div>
              <div className="text-sm text-gray-600">Successful Matches</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">₹2.5Cr</div>
              <div className="text-sm text-gray-600">Total Funding</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Change Modal */}
      <RoleChangeModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onRoleChanged={handleRoleChange}
      />
    </div>
  );
}

export default UserDashboard;
