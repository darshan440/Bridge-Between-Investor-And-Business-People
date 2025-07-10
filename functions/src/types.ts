// Type definitions for Firebase Cloud Functions

export interface RiskFactor {
  score: number;
  details: Record<string, string | number>;
}

export interface SetUserRoleData {
  uid: string;
  role: "user" | "business_person" | "investor" | "banker" | "business_advisor";
}

export interface PromoteToAdminData {
  uid: string;
}

export interface GenerateRiskAssessmentData {
  businessIdeaId: string;
}

export interface UpdatePortfolioMetricsData {
  investorId: string;
}

export interface WebhookData {
  type: "payment_success" | "investment_milestone";
  data: Record<string, unknown>;
}

export interface SendNotificationData {
  userId: string;
  title: string;
  body: string;
  type?: string;
  data?: Record<string, string>;
}

export interface SendBulkNotificationsData {
  userIds: string[];
  title: string;
  body: string;
  type?: string;
  data?: Record<string, string>;
}

// Business Models
export interface BusinessIdea {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  budget: string;
  targetMarket: string;
  revenueModel: string;
  teamInfo: string;
  status: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  profile?: {
    name?: string;
    bio?: string;
    experience?: number;
    skills?: string[];
    location?: string;
  };
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface Investment {
  id: string;
  amount: number;
  currentValue: number;
  category: string;
  businessIdeaId: string;
  investorId: string;
  status: string;
  createdAt: FirebaseFirestore.Timestamp;
}

export interface Portfolio {
  id: string;
  userId: string;
  investments: Investment[];
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
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface RiskAssessment {
  id: string;
  businessIdeaId: string;
  targetUserId: string;
  assessorId: string;
  riskScore: number;
  riskLevel: string;
  factors: Record<string, RiskFactor>;
  recommendations: string[];
  assessmentDate: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface LogEntry {
  userId: string;
  action: string;
  data: Record<string, unknown>;
  timestamp: FirebaseFirestore.Timestamp;
}
