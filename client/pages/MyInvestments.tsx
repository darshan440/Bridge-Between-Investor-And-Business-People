import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  MessageSquare,
  BarChart3,
  Target,
  Calendar,
  Building,
} from "lucide-react";
// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";

interface Investment {
  id: string;
  businessIdeaId: string;
  businessIdeaTitle: string;
  businessIdeaCategory: string;
  amount: number;
  currentValue: number;
  investmentDate: any;
  status: "active" | "completed" | "pending";
  roi: number;
  businessPersonName: string;
  description: string;
  milestones: any[];
  updatedAt: any;
}

interface PortfolioMetrics {
  totalInvested: number;
  totalCurrentValue: number;
  totalROI: number;
  activeInvestments: number;
  completedInvestments: number;
  bestPerforming: Investment | null;
  worstPerforming: Investment | null;
}

const MyInvestments: React.FC = () => {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalInvested: 0,
    totalCurrentValue: 0,
    totalROI: 0,
    activeInvestments: 0,
    completedInvestments: 0,
    bestPerforming: null,
    worstPerforming: null,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user?.uid) return;

    const investmentsRef = collection(db, "investments");
    const investmentsQuery = query(
      investmentsRef,
      where("investorId", "==", user.uid),
      orderBy("investmentDate", "desc"),
    );

    const unsubscribe = onSnapshot(investmentsQuery, (snapshot) => {
      const investmentsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Investment[];

      setInvestments(investmentsList);
      calculateMetrics(investmentsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const calculateMetrics = (investmentsList: Investment[]) => {
    const totalInvested = investmentsList.reduce(
      (sum, inv) => sum + inv.amount,
      0,
    );
    const totalCurrentValue = investmentsList.reduce(
      (sum, inv) => sum + (inv.currentValue || inv.amount),
      0,
    );
    const totalROI =
      totalInvested > 0
        ? ((totalCurrentValue - totalInvested) / totalInvested) * 100
        : 0;

    const activeInvestments = investmentsList.filter(
      (inv) => inv.status === "active",
    ).length;
    const completedInvestments = investmentsList.filter(
      (inv) => inv.status === "completed",
    ).length;

    // Find best and worst performing investments
    const sortedByROI = [...investmentsList].sort((a, b) => b.roi - a.roi);
    const bestPerforming = sortedByROI[0] || null;
    const worstPerforming = sortedByROI[sortedByROI.length - 1] || null;

    setMetrics({
      totalInvested,
      totalCurrentValue,
      totalROI,
      activeInvestments,
      completedInvestments,
      bestPerforming,
      worstPerforming,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getROIColor = (roi: number) => {
    return roi >= 0 ? "text-green-600" : "text-red-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Loading your investments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                My Investments
              </h1>
              <p className="text-gray-600">
                Track and manage your investment portfolio
              </p>
            </div>
          </div>
        </div>

        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Invested
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(metrics.totalInvested)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Current Value
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(metrics.totalCurrentValue)}
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
                  <p className="text-sm font-medium text-gray-600">Total ROI</p>
                  <p
                    className={`text-2xl font-bold ${getROIColor(metrics.totalROI)}`}
                  >
                    {metrics.totalROI.toFixed(1)}%
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
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metrics.activeInvestments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="active">Active Investments</TabsTrigger>
            <TabsTrigger value="history">Investment History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {investments.length > 0 ? (
              <>
                {/* Performance Highlights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {metrics.bestPerforming && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-green-600">
                          <TrendingUp className="h-5 w-5 mr-2" />
                          Best Performing
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <h4 className="font-semibold">
                          {metrics.bestPerforming.businessIdeaTitle}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {metrics.bestPerforming.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">
                            ROI: {metrics.bestPerforming.roi.toFixed(1)}%
                          </span>
                          <Badge className="bg-green-100 text-green-800">
                            {formatCurrency(
                              metrics.bestPerforming.currentValue,
                            )}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {metrics.worstPerforming && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-orange-600">
                          <TrendingDown className="h-5 w-5 mr-2" />
                          Needs Attention
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <h4 className="font-semibold">
                          {metrics.worstPerforming.businessIdeaTitle}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {metrics.worstPerforming.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">
                            ROI: {metrics.worstPerforming.roi.toFixed(1)}%
                          </span>
                          <Badge className="bg-orange-100 text-orange-800">
                            {formatCurrency(
                              metrics.worstPerforming.currentValue,
                            )}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Recent Investments */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Investments</CardTitle>
                    <CardDescription>
                      Your latest investment activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {investments.slice(0, 5).map((investment) => (
                        <div
                          key={investment.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium">
                              {investment.businessIdeaTitle}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {investment.businessPersonName}
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <Badge variant="secondary">
                                {investment.businessIdeaCategory}
                              </Badge>
                              <Badge
                                className={getStatusColor(investment.status)}
                              >
                                {investment.status}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {formatDate(investment.investmentDate)}
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-medium">
                              {formatCurrency(investment.currentValue)}
                            </p>
                            <p
                              className={`text-sm ${getROIColor(investment.roi)}`}
                            >
                              {investment.roi.toFixed(1)}% ROI
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-16">
                  <Building className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Investments Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start building your portfolio by investing in promising
                    business ideas.
                  </p>
                  <Link to="/view-proposals">
                    <Button>
                      <Eye className="mr-2 h-4 w-4" />
                      Explore Investment Opportunities
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Active Investments Tab */}
          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>Active Investments</CardTitle>
                <CardDescription>
                  Monitor your ongoing investments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {investments.filter((inv) => inv.status === "active").length >
                0 ? (
                  <div className="space-y-4">
                    {investments
                      .filter((inv) => inv.status === "active")
                      .map((investment) => (
                        <div
                          key={investment.id}
                          className="p-6 border rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-lg font-semibold">
                                {investment.businessIdeaTitle}
                              </h4>
                              <p className="text-gray-600">
                                by {investment.businessPersonName}
                              </p>
                            </div>
                            <Badge
                              className={getStatusColor(investment.status)}
                            >
                              {investment.status}
                            </Badge>
                          </div>

                          <p className="text-gray-700 mb-4">
                            {investment.description}
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">Invested</p>
                              <p className="font-semibold">
                                {formatCurrency(investment.amount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                Current Value
                              </p>
                              <p className="font-semibold">
                                {formatCurrency(investment.currentValue)}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">ROI</p>
                              <p
                                className={`font-semibold ${getROIColor(investment.roi)}`}
                              >
                                {investment.roi.toFixed(1)}%
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Date</p>
                              <p className="font-semibold">
                                {formatDate(investment.investmentDate)}
                              </p>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button size="sm" variant="outline">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Contact Business
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">
                      No Active Investments
                    </h3>
                    <p className="text-gray-600">
                      Your active investments will appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investment History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Investment History</CardTitle>
                <CardDescription>
                  Complete record of all your investments
                </CardDescription>
              </CardHeader>
              <CardContent>
                {investments.length > 0 ? (
                  <div className="space-y-4">
                    {investments.map((investment) => (
                      <div
                        key={investment.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {investment.businessIdeaTitle}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {investment.businessPersonName}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <Badge variant="secondary">
                              {investment.businessIdeaCategory}
                            </Badge>
                            <Badge
                              className={getStatusColor(investment.status)}
                            >
                              {investment.status}
                            </Badge>
                            <span className="text-xs text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatDate(investment.investmentDate)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-medium">
                            {formatCurrency(investment.amount)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Current: {formatCurrency(investment.currentValue)}
                          </p>
                          <p
                            className={`text-sm ${getROIColor(investment.roi)}`}
                          >
                            {investment.roi.toFixed(1)}% ROI
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">
                      No Investment History
                    </h3>
                    <p className="text-gray-600">
                      Your investment history will appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyInvestments;
