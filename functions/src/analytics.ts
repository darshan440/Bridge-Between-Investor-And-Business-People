import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import {
  BusinessIdea,
  Investment,
  PlatformAnalytics,
  Portfolio,
  RiskFactor,
  UserProfile,
  GenerateRiskAssessmentData,
  UpdatePortfolioMetricsData,
} from "./types";

// Generate risk assessment for a business idea
export const generateRiskAssessment = onCall<GenerateRiskAssessmentData>(
  async (request) => {
    // Check if user is a banker
    if (!request.auth || request.auth.token?.role !== "banker") {
      throw new Error("Only bankers can generate risk assessments.");
    }

    const { businessIdeaId } = request.data;

    try {
      // Get business idea details
      const businessIdeaDoc = await admin
        .firestore()
        .collection("businessIdeas")
        .doc(businessIdeaId)
        .get();

      if (!businessIdeaDoc.exists) {
        throw new Error("Business idea not found.");
      }

      const businessIdea = businessIdeaDoc.data() as BusinessIdea;

      // Get user profile for additional context
      const userDoc = await admin
        .firestore()
        .collection("users")
        .doc(businessIdea.userId)
        .get();

      const userProfile = userDoc.exists
        ? (userDoc.data() as UserProfile)
        : ({} as UserProfile);

      // Calculate risk assessment based on various factors
      const riskAssessment = calculateRiskScore(businessIdea, userProfile);

      // Store risk assessment
      const assessmentRef = await admin
        .firestore()
        .collection("riskAssessments")
        .add({
          businessIdeaId,
          targetUserId: businessIdea.userId,
          assessorId: request.auth.uid,
          riskScore: riskAssessment.score,
          riskLevel: riskAssessment.level,
          factors: riskAssessment.factors,
          recommendations: riskAssessment.recommendations,
          assessmentDate: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      // Log risk assessment generation
      await admin
        .firestore()
        .collection("logs")
        .add({
          userId: request.auth.uid,
          action: "RISK_ASSESSMENT_GENERATED",
          data: {
            businessIdeaId,
            assessmentId: assessmentRef.id,
            riskScore: riskAssessment.score,
            riskLevel: riskAssessment.level,
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

      return {
        success: true,
        assessmentId: assessmentRef.id,
        riskScore: riskAssessment.score,
        riskLevel: riskAssessment.level,
        recommendations: riskAssessment.recommendations,
      };
    } catch (error) {
      console.error("Error generating risk assessment:", error);
      throw new Error("Failed to generate risk assessment.");
    }
  },
);

// Calculate risk score based on business idea and user profile
function calculateRiskScore(
  businessIdea: BusinessIdea,
  userProfile: UserProfile,
): {
  score: number;
  level: string;
  factors: Record<string, RiskFactor>;
  recommendations: string[];
} {
  const factors: Record<string, RiskFactor> = {};
  let totalScore = 0;
  const recommendations: string[] = [];

  // Market factor (20% weight)
  const marketScore = evaluateMarketRisk(businessIdea);
  factors.market = { score: marketScore, details: {} };
  totalScore += marketScore * 0.2;

  // Team factor (25% weight)
  const teamScore = evaluateTeamRisk(businessIdea, userProfile);
  factors.team = { score: teamScore, details: {} };
  totalScore += teamScore * 0.25;

  // Financial factor (30% weight)
  const financialScore = evaluateFinancialRisk(businessIdea);
  factors.financial = { score: financialScore, details: {} };
  totalScore += financialScore * 0.3;

  // Technology factor (15% weight)
  const technologyScore = evaluateTechnologyRisk(businessIdea);
  factors.technology = { score: technologyScore, details: {} };
  totalScore += technologyScore * 0.15;

  // Competition factor (10% weight)
  const competitionScore = evaluateCompetitionRisk(businessIdea);
  factors.competition = { score: competitionScore, details: {} };
  totalScore += competitionScore * 0.1;

  // Determine risk level
  let riskLevel: string;
  if (totalScore >= 80) {
    riskLevel = "LOW";
    recommendations.push("Excellent opportunity with minimal risk factors.");
  } else if (totalScore >= 60) {
    riskLevel = "MEDIUM";
    recommendations.push(
      "Good opportunity with manageable risk factors to monitor.",
    );
  } else if (totalScore >= 40) {
    riskLevel = "HIGH";
    recommendations.push(
      "Consider additional due diligence before investment.",
    );
  } else {
    riskLevel = "VERY_HIGH";
    recommendations.push(
      "Significant risk factors present. Investment not recommended without major improvements.",
    );
  }

  return {
    score: Math.round(totalScore),
    level: riskLevel,
    factors,
    recommendations,
  };
}

function evaluateMarketRisk(businessIdea: BusinessIdea): number {
  // Simplified market risk evaluation
  const category = businessIdea.category?.toLowerCase() || "";
  const highGrowthSectors = [
    "technology",
    "healthcare",
    "fintech",
    "sustainability",
  ];

  if (highGrowthSectors.some((sector) => category.includes(sector))) {
    return 75; // Lower risk for high-growth sectors
  }

  return 50; // Medium risk for other sectors
}

function evaluateTeamRisk(
  businessIdea: BusinessIdea,
  userProfile: UserProfile,
): number {
  let score = 50; // Base score

  // Evaluate based on user profile experience
  const experience = userProfile.profile?.experience || 0;
  if (experience > 5) score += 20;
  else if (experience > 2) score += 10;

  // Team size factor
  const teamSize = parseInt(businessIdea.teamInfo?.split(" ")[0] || "1");
  if (teamSize >= 3) score += 15;
  else if (teamSize >= 2) score += 10;

  return Math.min(score, 100);
}

function evaluateFinancialRisk(businessIdea: BusinessIdea): number {
  // Simplified financial risk evaluation
  const budget = businessIdea.budget || "";
  const amount = parseInt(budget.replace(/[^\d]/g, "")) || 0;

  if (amount > 5000000) return 40; // Very high budget = higher risk
  if (amount > 1000000) return 60; // High budget = medium risk
  if (amount > 500000) return 75; // Medium budget = lower risk
  return 85; // Low budget = lowest risk
}

function evaluateTechnologyRisk(businessIdea: BusinessIdea): number {
  // Simplified technology risk evaluation
  const description = businessIdea.description?.toLowerCase() || "";
  const highTechTerms = [
    "ai",
    "blockchain",
    "iot",
    "machine learning",
    "ar",
    "vr",
  ];

  if (highTechTerms.some((term) => description.includes(term))) {
    return 60; // Higher tech complexity = higher risk
  }

  return 75; // Standard technology risk
}

function evaluateCompetitionRisk(businessIdea: BusinessIdea): number {
  // Simplified competition risk evaluation
  const category = businessIdea.category?.toLowerCase() || "";
  const highCompetitionSectors = ["e-commerce", "food delivery", "taxi"];

  if (highCompetitionSectors.some((sector) => category.includes(sector))) {
    return 45; // High competition = higher risk
  }

  return 70; // Medium competition risk
}

// Update portfolio metrics for an investor
export const updatePortfolioMetrics = onCall<UpdatePortfolioMetricsData>(
  async (request) => {
    // Check if user is an investor
    if (!request.auth || request.auth.token?.role !== "investor") {
      throw new Error("Only investors can update portfolio metrics.");
    }

    const { investorId } = request.data;

    // Ensure investor can only update their own portfolio
    if (request.auth.uid !== investorId) {
      throw new Error("Can only update your own portfolio.");
    }

    try {
      // Get all investments for this investor
      const investmentsQuery = await admin
        .firestore()
        .collection("investments")
        .where("investorId", "==", investorId)
        .get();

      const investments: Investment[] = investmentsQuery.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Investment,
      );

      // Calculate portfolio metrics
      const metrics = calculatePortfolioMetrics(investments);

      // Update or create portfolio document
      const portfolioRef = admin
        .firestore()
        .collection("portfolios")
        .doc(investorId);

      await portfolioRef.set(
        {
          userId: investorId,
          investments,
          totalValue: metrics.totalValue,
          roi: metrics.roi,
          performance: metrics.performance,
          diversification: metrics.diversification,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      // Log portfolio update
      await admin
        .firestore()
        .collection("logs")
        .add({
          userId: request.auth.uid,
          action: "PORTFOLIO_UPDATED",
          data: {
            totalValue: metrics.totalValue,
            roi: metrics.roi,
            investmentCount: investments.length,
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

      return {
        success: true,
        metrics,
      };
    } catch (error) {
      console.error("Error updating portfolio metrics:", error);
      throw new Error("Failed to update portfolio metrics.");
    }
  },
);

function calculatePortfolioMetrics(investments: Investment[]): {
  totalValue: number;
  roi: number;
  performance: Portfolio["performance"];
  diversification: Portfolio["diversification"];
} {
  if (investments.length === 0) {
    return {
      totalValue: 0,
      roi: 0,
      performance: {
        byCategory: {},
        bestPerforming: "",
        worstPerforming: "",
      },
      diversification: {
        score: 0,
        categories: 0,
        recommendation: "Start investing to build a diversified portfolio",
      },
    };
  }

  // Calculate total value and ROI
  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrentValue = investments.reduce(
    (sum, inv) => sum + inv.currentValue,
    0,
  );
  const roi =
    totalInvested > 0 ? (totalCurrentValue / totalInvested - 1) * 100 : 0;

  // Calculate performance by category
  const performanceByCategory: Record<string, number> = {};
  investments.forEach((inv) => {
    const category = inv.category;
    const categoryRoi =
      inv.amount > 0 ? (inv.currentValue / inv.amount - 1) * 100 : 0;

    if (performanceByCategory[category]) {
      performanceByCategory[category] =
        (performanceByCategory[category] + categoryRoi) / 2;
    } else {
      performanceByCategory[category] = categoryRoi;
    }
  });

  // Find best and worst performing categories
  const sortedCategories = Object.entries(performanceByCategory).sort(
    (a, b) => b[1] - a[1],
  );
  const bestPerforming = sortedCategories[0]?.[0] || "";
  const worstPerforming =
    sortedCategories[sortedCategories.length - 1]?.[0] || "";

  // Calculate diversification
  const uniqueCategories = new Set(investments.map((inv) => inv.category)).size;
  const diversificationScore = Math.min((uniqueCategories / 5) * 100, 100);

  let diversificationRecommendation = "";
  if (diversificationScore >= 80) {
    diversificationRecommendation = "Well diversified portfolio";
  } else if (diversificationScore >= 60) {
    diversificationRecommendation =
      "Good diversification, consider adding more sectors";
  } else {
    diversificationRecommendation = "Consider diversifying across more sectors";
  }

  return {
    totalValue: totalCurrentValue,
    roi,
    performance: {
      byCategory: performanceByCategory,
      bestPerforming,
      worstPerforming,
    },
    diversification: {
      score: diversificationScore,
      categories: uniqueCategories,
      recommendation: diversificationRecommendation,
    },
  };
}

// Get platform analytics (admin only)
export const getPlatformAnalytics = onCall(async (request) => {
  // Check if user is an admin
  if (!request.auth || request.auth.token?.role !== "admin") {
    throw new Error("Only admins can access platform analytics.");
  }

  try {
    // Get user statistics
    const usersQuery = await admin.firestore().collection("users").get();
    const users = usersQuery.docs.map((doc) => doc.data());

    const usersByRole: Record<string, number> = {};
    users.forEach((user) => {
      const role = user.role || "unknown";
      usersByRole[role] = (usersByRole[role] || 0) + 1;
    });

    // Get business ideas statistics
    const businessIdeasQuery = await admin
      .firestore()
      .collection("businessIdeas")
      .get();
    const businessIdeas = businessIdeasQuery.docs.map((doc) => doc.data());

    const businessIdeasByCategory: Record<string, number> = {};
    const businessIdeasByStatus: Record<string, number> = {};

    businessIdeas.forEach((idea) => {
      const category = idea.category || "uncategorized";
      const status = idea.status || "pending";

      businessIdeasByCategory[category] =
        (businessIdeasByCategory[category] || 0) + 1;
      businessIdeasByStatus[status] = (businessIdeasByStatus[status] || 0) + 1;
    });

    // Get investment statistics
    const investmentsQuery = await admin
      .firestore()
      .collection("investments")
      .get();
    const investments = investmentsQuery.docs.map((doc) => doc.data());

    const proposalsByStatus: Record<string, number> = {};
    let totalFunded = 0;
    let totalProposalAmount = 0;

    investments.forEach((investment) => {
      const status = investment.status || "pending";
      proposalsByStatus[status] = (proposalsByStatus[status] || 0) + 1;

      if (status === "funded") {
        totalFunded += investment.amount || 0;
      }
      totalProposalAmount += investment.amount || 0;
    });

    const averageAmount =
      investments.length > 0 ? totalProposalAmount / investments.length : 0;

    // Get activity logs
    const logsQuery = await admin
      .firestore()
      .collection("logs")
      .orderBy("timestamp", "desc")
      .limit(1000)
      .get();

    const recentActions: Record<string, number> = {};
    logsQuery.docs.forEach((doc) => {
      const log = doc.data();
      const action = log.action || "unknown";
      recentActions[action] = (recentActions[action] || 0) + 1;
    });

    const analytics: PlatformAnalytics = {
      users: {
        total: users.length,
        byRole: usersByRole,
      },
      businessIdeas: {
        total: businessIdeas.length,
        byCategory: businessIdeasByCategory,
        byStatus: businessIdeasByStatus,
      },
      investments: {
        totalProposals: investments.length,
        totalFunded,
        proposalsByStatus,
        averageAmount,
      },
      activity: {
        recentActions,
        totalLogs: logsQuery.size,
      },
    };

    return analytics;
  } catch (error) {
    console.error("Error getting platform analytics:", error);
    throw new Error("Failed to get platform analytics.");
  }
});

// Scheduled function to update all portfolio metrics daily
export const updateAllPortfolios = onSchedule(
  "0 3 * * *", // Run daily at 3 AM
  async () => {
    try {
      // Get all investors
      const investorsQuery = await admin
        .firestore()
        .collection("users")
        .where("role", "==", "investor")
        .get();

      const updatePromises = investorsQuery.docs.map(async (doc) => {
        const investorId = doc.id;

        try {
          // Get all investments for this investor
          const investmentsQuery = await admin
            .firestore()
            .collection("investments")
            .where("investorId", "==", investorId)
            .get();

          const investments: Investment[] = investmentsQuery.docs.map(
            (invDoc) =>
              ({
                id: invDoc.id,
                ...invDoc.data(),
              }) as Investment,
          );

          // Calculate and update portfolio metrics
          const metrics = calculatePortfolioMetrics(investments);

          await admin.firestore().collection("portfolios").doc(investorId).set(
            {
              userId: investorId,
              investments,
              totalValue: metrics.totalValue,
              roi: metrics.roi,
              performance: metrics.performance,
              diversification: metrics.diversification,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          );

          console.log(`Updated portfolio for investor: ${investorId}`);
        } catch (error) {
          console.error(
            `Error updating portfolio for investor ${investorId}:`,
            error,
          );
        }
      });

      await Promise.allSettled(updatePromises);

      // Log the batch update
      await admin
        .firestore()
        .collection("logs")
        .add({
          userId: "system",
          action: "PORTFOLIOS_BATCH_UPDATE",
          data: {
            investorCount: investorsQuery.size,
            updatedAt: new Date().toISOString(),
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

      console.log(`Updated ${investorsQuery.size} investor portfolios`);
    } catch (error) {
      console.error("Error in updateAllPortfolios:", error);
    }
  },
);
