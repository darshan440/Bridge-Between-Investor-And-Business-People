import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building,
  User,
  TrendingUp,
  Lightbulb,
  MessageSquare,
  DollarSign,
  FileText,
  Users,
  LogOut,
  Menu,
  X,
  Settings,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { UserDashboard } from "@/components/UserDashboard";
import { RoleChangeModal } from "@/components/RoleChangeModal";
import { getCurrentUserProfile, isProfileCompletionRequired } from "@/lib/auth";

const roleConfigs = {
  business_person: {
    title: "Business Dashboard",
    icon: Lightbulb,
    menuItems: [
      { label: "Post Business Idea", icon: Lightbulb, href: "/post-idea" },
      {
        label: "View Advisor Suggestions",
        icon: MessageSquare,
        href: "/advisor-suggestions",
      },
      { label: "Query Panel", icon: FileText, href: "/query-panel" },
    ],
  },
  investor: {
    title: "Investor Dashboard",
    icon: TrendingUp,
    menuItems: [
      {
        label: "View Business Ideas",
        icon: Lightbulb,
        href: "/view-proposals",
      },
      {
        label: "Post Investment Proposal",
        icon: DollarSign,
        href: "/post-investment",
      },
      { label: "Portfolio Tracking", icon: TrendingUp, href: "/portfolio" },
    ],
  },
  business_advisor: {
    title: "Advisor Dashboard",
    icon: MessageSquare,
    menuItems: [
      { label: "Post Tips/Advice", icon: MessageSquare, href: "/post-advice" },
      { label: "View Business Queries", icon: FileText, href: "/view-queries" },
      { label: "Post Solutions", icon: Users, href: "/post-solution" },
    ],
  },
  banker: {
    title: "Banking Dashboard",
    icon: DollarSign,
    menuItems: [
      {
        label: "Post Loan Schemes",
        icon: DollarSign,
        href: "/post-loan-schemes",
      },
      { label: "View Proposals", icon: FileText, href: "/view-loan-proposals" },
      { label: "Risk Assessment", icon: TrendingUp, href: "/risk-assessment" },
    ],
  },
  user: {
    title: "User Dashboard",
    icon: User,
    menuItems: [
      { label: "Browse Opportunities", icon: TrendingUp, href: "/browse" },
      { label: "View Categories", icon: Building, href: "/categories" },
      { label: "Help Center", icon: MessageSquare, href: "/help" },
    ],
  },
};

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Get role from navigation state or localStorage
    const userRole =
      location.state?.role || localStorage.getItem("userRole") || "user";
    setRole(userRole);
    if (userRole) {
      localStorage.setItem("userRole", userRole);
    }
  }, [location.state]);

  useEffect(() => {
    const checkProfileCompletion = async () => {
      try {
        const profile = await getCurrentUserProfile();
        setUserProfile(profile);

        if (profile && isProfileCompletionRequired(profile.role)) {
          setProfileIncomplete(!profile.isComplete);
        }
      } catch (error) {
        console.error("Error checking profile completion:", error);
      }
    };

    checkProfileCompletion();
  }, []);

  const config =
    roleConfigs[role as keyof typeof roleConfigs] || roleConfigs.user;
  const IconComponent = config.icon;

  const formatRoleName = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    localStorage.setItem("userRole", newRole);
    setShowRoleModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-blue-600 text-white">
          <div className="flex items-center space-x-2">
            <Building className="w-6 h-6" />
            <span className="font-bold">InvestBridge</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <IconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                {formatRoleName(role)}
              </h2>
              <p className="text-sm text-gray-500">Welcome back!</p>
            </div>
          </div>

          <nav className="space-y-2">
            {config.menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Role Change Button */}
            <button
              onClick={() => setShowRoleModal(true)}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Change Role</span>
            </button>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <Link to="/">
            <Button variant="outline" className="w-full justify-start">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-semibold text-gray-900">{config.title}</h1>
            <div></div>
          </div>
        </div>

        {/* Profile Completion Banner */}
        {profileIncomplete && userProfile && (
          <div className="p-4 border-b bg-amber-50">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-amber-800">
                    Complete your profile to unlock full access
                  </span>
                  <p className="text-amber-700 text-sm mt-1">
                    Your contact information will be visible in your posts,
                    helping others connect with you directly.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => navigate("/complete-profile")}
                  className="ml-4 bg-amber-600 hover:bg-amber-700"
                >
                  Complete Profile
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Dashboard content */}
        <div className="p-6">
          {role === "user" ? (
            <UserDashboard onRoleChanged={handleRoleChange} />
          ) : (
            <div>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {config.title}
                </h1>
                <p className="text-gray-600">
                  Manage your {role.replace("_", " ")} activities and grow your
                  network
                </p>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {config.menuItems.slice(0, 3).map((item, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <Link to={item.href}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <item.icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <CardTitle className="text-lg">
                            {item.label}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>
                          {index === 0 &&
                            role === "business_person" &&
                            "Share your innovative business ideas with potential investors"}
                          {index === 1 &&
                            role === "business_person" &&
                            "Get expert advice from experienced business advisors"}
                          {index === 0 &&
                            role === "investor" &&
                            "Discover promising business opportunities to invest in"}
                          {index === 1 &&
                            role === "investor" &&
                            "Create and share your investment proposals"}
                          {index === 0 &&
                            role === "business_advisor" &&
                            "Share valuable insights and tips with entrepreneurs"}
                          {index === 1 &&
                            role === "business_advisor" &&
                            "Review and respond to business queries"}
                          {index === 0 &&
                            role === "banker" &&
                            "Create and manage loan schemes for businesses"}
                          {index === 1 &&
                            role === "banker" &&
                            "Review loan applications and proposals"}
                        </CardDescription>
                      </CardContent>
                    </Link>
                  </Card>
                ))}
              </div>

              {/* Placeholder Notice */}
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900">
                    Dashboard Under Development
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-blue-800">
                    This is a placeholder dashboard. Full functionality
                    including forms, data visualization, and interactive
                    features will be implemented in the next phase of
                    development.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Role Change Modal */}
      <RoleChangeModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onRoleChanged={handleRoleChange}
      />
    </div>
  );
}
