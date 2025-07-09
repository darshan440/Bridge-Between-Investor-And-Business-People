import * as admin from "firebase-admin";
import * as functions from "firebase-functions/v1";

// Generate risk assessment for a business idea
export const generateRiskAssessment = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
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
          riskScore: riskAssessment.overallScore,
          riskLevel: riskAssessment.riskLevel,
          factors: riskAssessment.factors,
          recommendations: riskAssessment.recommendations,
          assessmentDate: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      // Log the assessment
      await admin
        .firestore()
        .collection("logs")
        .add({
          userId: request.auth.uid,
          action: "RISK_ASSESSMENT_GENERATED",
          data: {
            assessmentId: assessmentRef.id,
            businessIdeaId,
            targetUserId: businessIdea.userId,
            riskScore: riskAssessment.overallScore,
            riskLevel: riskAssessment.riskLevel,
          },
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

      return {
        success: true,
        assessmentId: assessmentRef.id,
        riskAssessment,
      };
    } catch (error) {
      console.error("Error generating risk assessment:", error);
      throw new Error("Failed to generate risk assessment.");
    }
  },
);

// Update portfolio metrics for an investor
export const updatePortfolioMetrics = functions.https.onCall(
  async (data: any, context: functions.https.CallableContext) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated.",
      );
    }

    const { investorId } = request.data;

    // Only allow investors to update their own portfolio or bankers to update any
    if (
      request.auth.uid !== investorId &&
      request.auth.token?.role !== "banker"
    ) {
      throw new Error("Insufficient permissions to update portfolio.");
    }

    try {
      // Get portfolio
      const portfolioDoc = await admin
        .firestore()
        .collection("portfolios")
        .doc(investorId)
        .get();

      if (!portfolioDoc.exists) {
        throw new Error("Portfolio not found.");
      }

      const portfolioData = portfolioDoc.data();
      if (!portfolioData) {
        throw new Error("Portfolio data not found.");
      }
      const portfolio = portfolioData as Portfolio;
      const investments = portfolio.investments || [];

      // Calculate updated metrics
      const metrics = calculatePortfolioMetrics(investments);

      // Update portfolio with new metrics
      await admin.firestore().collection("portfolios").doc(investorId).update({
        totalValue: metrics.totalValue,
        roi: metrics.roi,
        performance: metrics.performance,
        diversification: metrics.diversification,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Log metrics update
      await admin
        .firestore()
        .collection("logs")
        .add({
          userId: request.auth.uid,
          action: "PORTFOLIO_METRICS_UPDATED",
          data: {
            investorId,
            oldROI: portfolio.roi || 0,
            newROI: metrics.roi,
            totalValue: metrics.totalValue,
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

// Get platform analytics (admin only)
export const getPlatformAnalytics = functions.https.onCall(
  async (data, context: functions.https.CallableContext) => {
    if (!context.auth || context.auth.token.role !== "admin") {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only admins can access platform analytics.",
      );
    }

  try {
    const analytics = await generatePlatformAnalytics();
    return analytics;
  } catch (error) {
    console.error("Error getting platform analytics:", error);
    throw new Error("Failed to get platform analytics.");
  }
});

// Helper function to calculate risk score
function calculateRiskScore(
  businessIdea: BusinessIdea,
  userProfile: UserProfile,
): {
  overallScore: number;
  riskLevel: string;
  factors: Record<string, RiskFactor>;
  recommendations: string[];
} {
  const factors: Record<string, RiskFactor> = {};
  let totalScore = 0;

  // Market risk (20%)
  const marketRisk = assessMarketRisk(businessIdea);
  factors.marketRisk = marketRisk;
  totalScore += marketRisk.score * 0.2;

  // Financial risk (25%)
  const financialRisk = assessFinancialRisk(businessIdea);
  factors.financialRisk = financialRisk;
  totalScore += financialRisk.score * 0.25;

  // Team risk (20%)
  const teamRisk = assessTeamRisk(businessIdea, userProfile);
  factors.teamRisk = teamRisk;
  totalScore += teamRisk.score * 0.2;

  // Technology risk (15%)
  const technologyRisk = assessTechnologyRisk(businessIdea);
  factors.technologyRisk = technologyRisk;
  totalScore += technologyRisk.score * 0.15;

  // Competition risk (20%)
  const competitionRisk = assessCompetitionRisk(businessIdea);
  factors.competitionRisk = competitionRisk;
  totalScore += competitionRisk.score * 0.2;

  const overallScore = Math.round(totalScore);
  const riskLevel = getRiskLevel(overallScore);
  const recommendations = generateRecommendations(factors, overallScore);

  return {
    overallScore,
    riskLevel,
    factors,
    recommendations,
  };
}

// Helper functions for risk assessment
function assessMarketRisk(businessIdea: BusinessIdea): RiskFactor {
  let score = 50; // Base score
  const details: Record<string, string | number> = {};

  // Adjust based on category
  const highRiskCategories = ["Cryptocurrency", "Gaming", "Entertainment"];
  const lowRiskCategories = ["Healthcare", "Education", "Agriculture"];

  if (highRiskCategories.includes(businessIdea.category)) {
    score += 20;
    details.categoryRisk = "High";
  } else if (lowRiskCategories.includes(businessIdea.category)) {
    score -= 15;
    details.categoryRisk = "Low";
  } else {
    details.categoryRisk = "Medium";
  }

  // Adjust based on target market
  if (businessIdea.targetMarket?.toLowerCase().includes("global")) {
    score += 10;
    details.marketScope = "Global (Higher Risk)";
  } else if (businessIdea.targetMarket?.toLowerCase().includes("local")) {
    score -= 5;
    details.marketScope = "Local (Lower Risk)";
  }

  return { score: Math.max(0, Math.min(100, score)), details };
}

function assessFinancialRisk(businessIdea: BusinessIdea): RiskFactor {
  let score = 50;
  const details: Record<string, string | number> = {};

  // Parse budget amount
  const budgetStr = businessIdea.budget?.replace(/[^\d]/g, "") || "0";
  const budget = parseInt(budgetStr);

  if (budget > 5000000) {
    // > 50L
    score += 25;
    details.budgetRisk = "Very High";
  } else if (budget > 2000000) {
    // > 20L
    score += 15;
    details.budgetRisk = "High";
  } else if (budget > 1000000) {
    // > 10L
    score += 5;
    details.budgetRisk = "Medium";
  } else {
    score -= 10;
    details.budgetRisk = "Low";
  }

  // Revenue model assessment
  if (!businessIdea.revenueModel || businessIdea.revenueModel.length < 50) {
    score += 15;
    details.revenueModelRisk = "Unclear revenue model";
  } else {
    details.revenueModelRisk = "Well-defined revenue model";
  }

  return { score: Math.max(0, Math.min(100, score)), details };
}

function assessTeamRisk(
  businessIdea: BusinessIdea,
  userProfile: UserProfile,
): RiskFactor {
  let score = 50;
  const details: Record<string, string | number> = {};

  // Team size
  const teamInfo = businessIdea.teamInfo || "";
  if (teamInfo.length < 50) {
    score += 20;
    details.teamDescription = "Insufficient team information";
  } else {
    score -= 10;
    details.teamDescription = "Good team information provided";
  }

  // User experience
  const experience = userProfile.profile?.experience || 0;
  if (experience > 5) {
    score -= 15;
    details.founderExperience = "Experienced founder";
  } else if (experience > 2) {
    score -= 5;
    details.founderExperience = "Some experience";
  } else {
    score += 10;
    details.founderExperience = "Limited experience";
  }

  return { score: Math.max(0, Math.min(100, score)), details };
}

function assessTechnologyRisk(businessIdea: BusinessIdea): RiskFactor {
  let score = 50;
  const details: Record<string, string | number> = {};

  const techCategories = ["Technology", "AI", "Blockchain", "IoT"];
  const description = businessIdea.description?.toLowerCase() || "";

  if (techCategories.includes(businessIdea.category)) {
    score += 15;
    details.technologyComplexity = "High-tech solution";

    // Check for specific high-risk technologies
    if (description.includes("ai") || description.includes("blockchain")) {
      score += 10;
      details.emergingTech = "Uses emerging technologies";
    }
  } else {
    score -= 5;
    details.technologyComplexity = "Traditional business model";
  }

  return { score: Math.max(0, Math.min(100, score)), details };
}

function assessCompetitionRisk(businessIdea: BusinessIdea): RiskFactor {
  let score = 50;
  const details: Record<string, string | number> = {};

  const description = businessIdea.description?.toLowerCase() || "";

  // High competition indicators
  if (description.includes("uber") || description.includes("airbnb")) {
    score += 20;
    details.competitionLevel = "High competition market";
  } else if (
    description.includes("unique") ||
    description.includes("innovative")
  ) {
    score -= 10;
    details.competitionLevel = "Claims uniqueness";
  }

  return { score: Math.max(0, Math.min(100, score)), details };
}

function getRiskLevel(score: number): string {
  if (score >= 80) return "Very High";
  if (score >= 60) return "High";
  if (score >= 40) return "Medium";
  if (score >= 20) return "Low";
  return "Very Low";
}

function generateRecommendations(
  factors: Record<string, RiskFactor>,
  overallScore: number,
): string[] {
  const recommendations: string[] = [];

  if (overallScore > 70) {
    recommendations.push(
      "Consider requiring additional collateral or higher interest rates",
    );
    recommendations.push("Recommend business mentorship programs");
  }

  if (factors.financialRisk?.score > 60) {
    recommendations.push("Request detailed financial projections");
    recommendations.push("Consider staged funding approach");
  }

  if (factors.teamRisk?.score > 60) {
    recommendations.push("Evaluate team composition and experience");
    recommendations.push("Suggest advisory board formation");
  }

  if (factors.marketRisk?.score > 60) {
    recommendations.push("Conduct thorough market research");
    recommendations.push("Consider pilot testing in smaller market");
  }

  if (recommendations.length === 0) {
    recommendations.push("Business shows good potential for funding");
    recommendations.push("Standard loan terms may be appropriate");
  }

  return recommendations;
}

// Helper function to calculate portfolio metrics
function calculatePortfolioMetrics(investments: Investment[]): {
  totalValue: number;
  roi: number;
  performance: {
    byCategory: Record<string, number>;
    bestPerforming: string;
    worstPerforming: string;
  };
  diversification: {
    score: number;
    categories: number;
    recommendation: string;
  };
} {
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

  // Performance by category
  const performanceByCategory: Record<string, number> = {};
  const categoryCount: Record<string, number> = {};

  investments.forEach((inv) => {
    const category = inv.category || "Unknown";
    if (!performanceByCategory[category]) {
      performanceByCategory[category] = 0;
      categoryCount[category] = 0;
    }
    const invROI =
      inv.amount > 0 ? ((inv.currentValue - inv.amount) / inv.amount) * 100 : 0;
    performanceByCategory[category] += invROI;
    categoryCount[category]++;
  });

  Object.keys(performanceByCategory).forEach((category) => {
    performanceByCategory[category] /= categoryCount[category];
  });

  // Diversification metrics
  const uniqueCategories = Object.keys(categoryCount).length;
  const diversificationScore = Math.min(uniqueCategories / 5, 1) * 100; // Max score at 5+ categories

  return {
    totalValue,
    roi,
    performance: {
      byCategory: performanceByCategory,
      bestPerforming:
        Object.keys(performanceByCategory).length > 0
          ? Object.keys(performanceByCategory).reduce((a, b) =>
            performanceByCategory[a] > performanceByCategory[b] ? a : b,
          )
          : "None",
      worstPerforming:
        Object.keys(performanceByCategory).length > 0
          ? Object.keys(performanceByCategory).reduce((a, b) =>
            performanceByCategory[a] < performanceByCategory[b] ? a : b,
          )
          : "None",
    },
    diversification: {
      score: diversificationScore,
      categories: uniqueCategories,
      recommendation:
        uniqueCategories < 3
          ? "Consider diversifying across more sectors"
          : "Well diversified portfolio",
    },
  };
}

// Generate comprehensive platform analytics
async function generatePlatformAnalytics(): Promise<PlatformAnalytics> {
  const analytics: Partial<PlatformAnalytics> = {};

  try {
    // User statistics
    const usersQuery = await admin.firestore().collection("users").get();
    const usersByRole: Record<string, number> = {};
    let totalUsers = 0;

    usersQuery.docs.forEach((doc) => {
      const userData = doc.data();
      const role = userData.role || "unknown";
      usersByRole[role] = (usersByRole[role] || 0) + 1;
      totalUsers++;
    });

    analytics.users = {
      total: totalUsers,
      byRole: usersByRole,
    };

    // Business ideas statistics
    const businessIdeasQuery = await admin
      .firestore()
      .collection("businessIdeas")
      .get();
    const ideasByCategory: Record<string, number> = {};
    const ideasByStatus: Record<string, number> = {};

    businessIdeasQuery.docs.forEach((doc) => {
      const ideaData = doc.data();
      const category = ideaData.category || "unknown";
      const status = ideaData.status || "unknown";

      ideasByCategory[category] = (ideasByCategory[category] || 0) + 1;
      ideasByStatus[status] = (ideasByStatus[status] || 0) + 1;
    });

    analytics.businessIdeas = {
      total: businessIdeasQuery.size,
      byCategory: ideasByCategory,
      byStatus: ideasByStatus,
    };

    // Investment statistics
    const proposalsQuery = await admin
      .firestore()
      .collection("investmentProposals")
      .get();

    let totalInvestmentAmount = 0;
    const proposalsByStatus: Record<string, number> = {};

    proposalsQuery.docs.forEach((doc) => {
      const proposalData = doc.data();
      const status = proposalData.status || "unknown";
      proposalsByStatus[status] = (proposalsByStatus[status] || 0) + 1;

      if (status === "accepted") {
        totalInvestmentAmount += proposalData.amount || 0;
      }
    });

    analytics.investments = {
      totalProposals: proposalsQuery.size,
      totalFunded: totalInvestmentAmount,
      proposalsByStatus: proposalsByStatus,
      averageAmount:
        proposalsQuery.size > 0
          ? totalInvestmentAmount / (proposalsByStatus.accepted || 1)
          : 0,
    };

    // Platform activity
    const logsQuery = await admin
      .firestore()
      .collection("logs")
      .orderBy("timestamp", "desc")
      .limit(1000)
      .get();

    const activityByAction: Record<string, number> = {};
    logsQuery.docs.forEach((doc) => {
      const logData = doc.data();
      const action = logData.action || "unknown";
      activityByAction[action] = (activityByAction[action] || 0) + 1;
    });

    analytics.activity = {
      recentActions: activityByAction,
      totalLogs: logsQuery.size,
    };

    return analytics as PlatformAnalytics;
  } catch (error) {
    console.error("Error generating platform analytics:", error);
    throw error;
  }
}

// Scheduled function to update all portfolio metrics daily
export const dailyPortfolioUpdate = onSchedule("0 3 * * *", async (_event) => {
  console.log("Running daily portfolio update");

  try {
    const portfoliosQuery = await admin
      .firestore()
      .collection("portfolios")
      .get();

    const updatePromises = portfoliosQuery.docs.map(async (doc) => {
      const portfolio = doc.data();
      const metrics = calculatePortfolioMetrics(portfolio.investments || []);

      return admin.firestore().collection("portfolios").doc(doc.id).update({
        totalValue: metrics.totalValue,
        roi: metrics.roi,
        performance: metrics.performance,
        diversification: metrics.diversification,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await Promise.all(updatePromises);

    console.log(`Updated ${portfoliosQuery.size} portfolios`);

    // Log the batch update
    await admin
      .firestore()
      .collection("logs")
      .add({
        userId: "system",
        action: "DAILY_PORTFOLIO_UPDATE",
        data: {
          portfoliosUpdated: portfoliosQuery.size,
        },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    console.error("Error in daily portfolio update:", error);
  }
});
