import { Notifications } from "@/components/Notifications";
import { RoleChangeModal } from "@/components/RoleChangeModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UserDashboard } from "@/components/UserDashboard";
import { getCurrentUserProfile, isProfileCompletionRequired } from "@/lib/auth";
import { db } from "@/lib/firebase";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import {
  AlertCircle,
  BarChart3,
  Building,
  CheckCircle,
  DollarSign,
  FileText,
  Lightbulb,
  LogOut,
  Menu,
  MessageSquare,
  Settings,
  Target,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
type BusinessIdea = {
  id: string;
  title: string;
  category: string;
  description: string;
  budget: string;
  timeline: string;
  views: number;
  interested: number;
  status: string;
  featured: boolean;
  createdAt: any;
  updatedAt: any;
  [key: string]: any; // fallback for extra fields like `tags`, `teamInfo`, etc.
};
interface InvestmentProposal {
  id: string;
  businessIdeaId: string;
  investorId: string;
  investorName: string;
  investorEmail: string;
  message: string;
  amount: number;
  status: "active" | "panding" | "rejected";
  createdAt: any;
  [key: string]: any;
}
interface Solution {
  id: string;
  queryId: string;
  advisorId: string;
  solution: string;
  helpful: number;
  createdAt: any;
  [key: string]: any;
}
interface LoanScheme {
  id: string;
  schemeName: string;
  loanType: string;
  minAmount: string;
  maxAmount: string;
  interestRate: string;
  tenure: string;
  description: string;
  eligibility: string;
  features: string[];
  collateralRequired: boolean;
  processingFee: string;
  processingTime: string;
  userId: string;
  applications: number;
  createdAt: any;
  [key: string]: any;
}

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
        label: "My Investments",
        icon: DollarSign,
        href: "/my-investments",
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
  admin: {
    title: "Admin Dashboard",
    icon: Settings,
    menuItems: [
      { label: "Manage Users", icon: Users, href: "/admin/users" },
      { label: "View Analytics", icon: BarChart3, href: "/admin/analytics" },
      { label: "Approval Queue", icon: CheckCircle, href: "/admin/approvals" },
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
  const [dashboardData, setDashboardData] = useState<any>({});
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    
    if (userProfile?.uid) {
      setupRealTimeData();
    }
  }, [userProfile, role]);

  const setupRealTimeData = () => {
    if (!userProfile?.uid) return;

    const unsubscribers: (() => void)[] = [];

    // Setup real-time listeners based on role
    switch (role) {
      case "business_person":
        setupBusinessPersonData(unsubscribers);
        break;
      case "investor":
        setupInvestorData(unsubscribers);
        break;
      case "business_advisor":
        setupAdvisorData(unsubscribers);
        break;
      case "banker":
        setupBankerData(unsubscribers);
        break;
      case "admin":
        setupAdminData(unsubscribers);
        break;
      default:
        setLoading(false);
    }

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  };

  const setupBusinessPersonData = (unsubscribers: (() => void)[]) => {
    const businessIdeasRef = collection(db, "businessIdeas");
    const businessIdeasQuery = query(
      businessIdeasRef,
      where("userId", "==", userProfile.uid),
      orderBy("createdAt", "desc"),
      limit(5),
    );

    const unsubscribeIdeas = onSnapshot(businessIdeasQuery, (snapshot) => {
      const ideas = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BusinessIdea[];
      
      // Still query proposals even if ideas is empty (user might have proposals)
      const proposalsRef = collection(db, "investmentProposals");
      const proposalsQuery = query(
        proposalsRef,
        where("businessIdeaUserId", "==", userProfile.uid),
        orderBy("createdAt", "desc"),
        limit(5),
      );

      const unsubscribeProposals = onSnapshot(
        proposalsQuery,
        (proposalsSnapshot) => {
          const proposals = proposalsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

         
          setDashboardData({
            businessIdeas: ideas,
            proposals,
            stats: {
              totalIdeas: ideas.length,
              totalProposals: proposals.length,
              totalViews: ideas.reduce(
                (sum, idea) => sum + (idea.views || 0),
                0,
              ),
              totalInterested: ideas.reduce(
                (sum, idea) => sum + (idea.interested || 0),
                0,
              ),
            },
          });

          setLoading(false);
        },
      );

      unsubscribers.push(unsubscribeProposals);
    });

    unsubscribers.push(unsubscribeIdeas);
  };

  const setupInvestorData = (unsubscribers: (() => void)[]) => {
    // Listen to investor's proposals and portfolio
    const investmentsRef = collection(db, "investments");
    const investmentsQuery = query(
      investmentsRef,
      where("investorId", "==", userProfile.uid),
      orderBy("createdAt", "desc"),
      limit(5),
    );

    const unsubscribeInvestments = onSnapshot(investmentsQuery, (snapshot) => {
      const investments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as InvestmentProposal[];

      // Calculate portfolio metrics
      const totalInvested = investments.reduce(
        (sum, inv) => sum + (inv.amount || 0),
        0,
      );
      const totalValue = investments.reduce(
        (sum, inv) => sum + (inv.currentValue || inv.amount || 0),
        0,
      );
      const roi =
        totalInvested > 0
          ? ((totalValue - totalInvested) / totalInvested) * 100
          : 0;

      setDashboardData({
        investments,
        portfolio: {
          totalInvested,
          totalValue,
          roi,
          activeInvestments: investments.filter(
            (inv) => inv.status === "active",
          ).length,
        },
        stats: {
          totalInvestments: investments.length,
          totalAmount: totalInvested,
          averageROI: roi,
          bestPerforming: investments[0]?.businessIdeaTitle || "None",
        },
      });
      setLoading(false);
    });

    unsubscribers.push(unsubscribeInvestments);
  };

  const setupAdvisorData = (unsubscribers: (() => void)[]) => {
    // Listen to queries and solutions
    const queriesRef = collection(db, "queries");
    const queriesQuery = query(
      queriesRef,
      where("status", "==", "open"),
      orderBy("createdAt", "desc"),
      limit(5),
    );

    const unsubscribeQueries = onSnapshot(queriesQuery, (snapshot) => {
      const queries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get advisor's solutions
      const solutionsRef = collection(db, "solutions");
      const solutionsQuery = query(
        solutionsRef,
        where("advisorId", "==", userProfile.uid),
        orderBy("createdAt", "desc"),
        limit(5),
      );

      const unsubscribeSolutions = onSnapshot(
        solutionsQuery,
        (solutionsSnapshot) => {
          const solutions = solutionsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Solution[];

          setDashboardData({
            openQueries: queries,
            mySolutions: solutions,
            stats: {
              totalSolutions: solutions.length,
              totalQueries: queries.length,
              helpfulVotes: solutions.reduce(
                (sum, sol) => sum + (sol.helpful || 0),
                0,
              ),
              averageRating: 4.5, // This would be calculated from actual ratings
            },
          });
          setLoading(false);
        },
      );

      unsubscribers.push(unsubscribeSolutions);
    });

    unsubscribers.push(unsubscribeQueries);
  };

  const setupBankerData = (unsubscribers: (() => void)[]) => {
    // Listen to loan schemes and applications
    const loanSchemesRef = collection(db, "loanSchemes");
    const loanSchemesQuery = query(
      loanSchemesRef,
      where("userId", "==", userProfile.uid),
      orderBy("createdAt", "desc"),
      limit(5),
    );

    const unsubscribeSchemes = onSnapshot(loanSchemesQuery, (snapshot) => {
      const schemes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LoanScheme[];

      setDashboardData({
        loanSchemes: schemes,
        stats: {
          totalSchemes: schemes.length,
          totalApplications: schemes.reduce(
            (sum, scheme) => sum + (scheme.applications || 0),
            0,
          ),
          approvalRate: 75, // This would be calculated from actual data
          averageAmount: schemes.length > 0 ? 5000000 : 0, // Average loan amount
        },
      });
      setLoading(false);
    });

    unsubscribers.push(unsubscribeSchemes);
  };

  const setupAdminData = (unsubscribers: (() => void)[]) => {
    // Admin sees aggregated data
    const usersRef = collection(db, "users");
    const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
      const users = snapshot.docs.map((doc) => doc.data());
      const usersByRole = users.reduce(
        (acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

      setDashboardData({
        totalUsers: users.length,
        usersByRole,
        stats: {
          totalBusinessIdeas: 0, // These would be  from actual collections
          totalInvestments: 0,
          totalQueries: 0,
          platformActivity: 85, // Activity percentage
        },
      });
      setLoading(false);
    });

    unsubscribers.push(unsubscribeUsers);
  };

  const config =
    roleConfigs[role as keyof typeof roleConfigs] || roleConfigs.user;
  const IconComponent = config.icon;

  const formatRoleName = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    localStorage.setItem("userRole", newRole);
    setShowRoleModal(false);
    window.location.reload(); // Reload to update dashboard data
  };

  const renderRoleSpecificContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    switch (role) {
      case "business_person":
        return renderBusinessPersonDashboard();
      case "investor":
        return renderInvestorDashboard();
      case "business_advisor":
        return renderAdvisorDashboard();
      case "banker":
        return renderBankerDashboard();
      case "admin":
        return renderAdminDashboard();
      default:
        return <UserDashboard onRoleChanged={handleRoleChange} />;
    }
  };

  const renderBusinessPersonDashboard = () => (
    <div className="space-y-6">
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Lightbulb className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Ideas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats?.totalIdeas || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Proposals</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats?.totalProposals || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats?.totalViews || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Interested</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats?.totalInterested || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Recent Business Ideas */}
      <Card>
        <CardHeader>
          <CardTitle>Your Business Ideas</CardTitle>
          <CardDescription>
            Your latest posted business ideas and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <ClipLoader color="#4F46E5" size={50} />
              <p className="mt-2 text-sm text-gray-600">
                Loading your dashboard...
              </p>
            </div>
          ) : dashboardData.businessIdeas?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.businessIdeas.map((idea: any) => (
                <div
                  key={idea.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{idea.title}</h4>
                    <p className="text-sm text-gray-600 truncate">
                      {idea.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="secondary">{idea.category}</Badge>
                      <span className="text-xs text-gray-500">
                        {idea.views || 0} views
                      </span>
                      <span className="text-xs text-gray-500">
                        {idea.interested || 0} interested
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            // 👇 No data fallback
            <div className="text-center py-8">
              <Lightbulb className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No business ideas yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by posting your first business idea.
              </p>
              <div className="mt-6">
                <Link to="/post-idea">
                  <Button>
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Post Your First Idea
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderInvestorDashboard = () => (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Invested
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData.portfolio?.totalInvested || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Portfolio Value
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData.portfolio?.totalValue || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">ROI</p>
                <p
                  className={`text-2xl font-bold ${(dashboardData.portfolio?.roi || 0) >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {(dashboardData.portfolio?.roi || 0).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Investments
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.portfolio?.activeInvestments || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Investments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Investments</CardTitle>
          <CardDescription>
            Your latest investment activities and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData.investments?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.investments.map((investment: any) => (
                <div
                  key={investment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {investment.businessIdeaTitle}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatCurrency(investment.amount)} invested
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge
                        variant={
                          investment.status === "active"
                            ? "default"
                            : "secondary"
                        }
                        className={
                          investment.status === "active" ? "bg-green-600" : ""
                        }
                      >
                        {investment.status}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {investment.category}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(
                        investment.currentValue || investment.amount,
                      )}
                    </p>
                    <p
                      className={`text-sm ${(investment.currentValue || investment.amount) >= investment.amount ? "text-green-600" : "text-red-600"}`}
                    >
                      {(
                        (((investment.currentValue || investment.amount) -
                          investment.amount) /
                          investment.amount) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No investments yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Start investing in promising business ideas.
              </p>
              <div className="mt-6">
                <Link to="/view-proposals">
                  <Button>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Explore Opportunities
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderAdvisorDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Solutions Posted
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats?.totalSolutions || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Open Queries
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats?.totalQueries || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Helpful Votes
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats?.helpfulVotes || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(dashboardData.stats?.averageRating || 0).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Open Queries */}
      <Card>
        <CardHeader>
          <CardTitle>Open Business Queries</CardTitle>
          <CardDescription>Help businesses with your expertise</CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData.openQueries?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.openQueries.map((query: any) => (
                <div
                  key={query.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{query.title}</h4>
                    <p className="text-sm text-gray-600 truncate">
                      {query.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge
                        variant={
                          query.priority === "High"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {query.priority} Priority
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {query.category}
                      </span>
                    </div>
                  </div>
                  <Button size="sm">Answer Query</Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No open queries
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Check back later for new queries to answer.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderBankerDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Loan Schemes
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats?.totalSchemes || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Applications
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats?.totalApplications || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Approval Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats?.approvalRate || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(dashboardData.stats?.averageAmount || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loan Schemes */}
      <Card>
        <CardHeader>
          <CardTitle>Your Loan Schemes</CardTitle>
          <CardDescription>
            Manage your active loan schemes and applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dashboardData.loanSchemes?.length > 0 ? (
            <div className="space-y-4">
              {dashboardData.loanSchemes.map((scheme: any) => (
                <div
                  key={scheme.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{scheme.schemeName}</h4>
                    <p className="text-sm text-gray-600">
                      {scheme.loanType} • {scheme.interestRate} interest
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="default" className="bg-green-600">
                        Active
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {scheme.applications || 0} applications
                      </span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    Manage
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No loan schemes yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first loan scheme to help businesses.
              </p>
              <div className="mt-6">
                <Link to="/post-loan-schemes">
                  <Button>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Post Loan Scheme
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.totalUsers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Lightbulb className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Business Ideas
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats?.totalBusinessIdeas || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Investments</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats?.totalInvestments || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Activity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dashboardData.stats?.platformActivity || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>User Distribution by Role</CardTitle>
          <CardDescription>
            Overview of platform users across different roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(dashboardData.usersByRole || {}).map(
              ([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">{formatRoleName(role)}</Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-32">
                      <Progress
                        value={
                          ((count as number) / dashboardData.totalUsers) * 100
                        }
                        className="w-full"
                      />
                    </div>
                    <span className="text-sm font-medium w-8">
                      {count as number}
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
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

            {/* Profile Link */}
            <Link
              to="/profile"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <User className="w-5 h-5" />
              <span>My Profile</span>
            </Link>

            {/* Role Change Button */}
            {role !== "banker" && role !== "admin" && (
              <button
                onClick={() => setShowRoleModal(true)}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Change Role</span>
              </button>
            )}
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
            <Notifications />
          </div>
        </div>

        {/* Desktop header with notifications */}
        <div className="hidden lg:block bg-white shadow-sm border-b">
          <div className="flex items-center justify-between h-16 px-8">
            <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
            <Notifications />
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
        <div className="p-6">{renderRoleSpecificContent()}</div>
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
