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

export interface ChangeUserRoleData {
  newRole: "user" | "investor" | "business_person" | "business_advisor";
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

export interface LoanProposalData {
  // 1. Loan Details
  loanPurpose: string; // Why the loan is needed
  loanAmount: string; // Exact amount requested
  repaymentPlan: {
    repaymentPeriod: string; // e.g., "5 years"
    interestRate: string; // e.g., "10%"
    incomeSources: string; // Description of sources for repayment
  };
  collateral?: {
    description: string; // Description of collateral assets
    estimatedValue: string; // Financial value of collateral
  }[];

  // 2. Business Information
  businessOverview: {
    history: string;
    legalStructure: string;
    productsOrServices: string;
    targetMarket: string;
  };
  financialInformation: {
    incomeStatements: string; // Or links to documents
    balanceSheets: string;
    cashFlowProjections: string;
  };
  marketAnalysis: string;
  managementTeam: string;

  // 3. Supporting Documents
  supportingDocuments: {
    personalAndBusinessDocs: string[]; // e.g., PAN card, business license identifiers or URLs
    financialRecords: string[]; // e.g., bank statements, tax returns URLs
    quotationsAndInvoices?: string[]; // Optional
    otherDocuments?: string[]; // Optional
  };

  // 4. Executive Summary
  executiveSummary: string;

  createdAt?: any;
  updatedAt?: any;
  status?: string; // e.g., "pending", "reviewed", "approved"
  userId?: string; // owner of the proposal
}

export interface UserProfile {
  id: string;
  email: string;
  role: string;
  isComplete?: boolean;
  profile?: {
    name?: string;
    fullName?: string;
    mobileNumber?: string;
    companyName?: string;
    institutionName?: string;
    designation?: string;
    businessCategory?: string;
    briefDescription?: string;
    investmentBudget?: string;
    preferredSectors?: string[];
    preferredStages?: string[];
    investmentExperience?: string;
    investmentCriteria?: string;
    areaOfExpertise?: string[];
    professionalSummary?: string;
    qualifications?: string;
    yearsOfExperience?: string;
    experienceYears?: string;
    website?: string;
    linkedIn?: string;
    isComplete?: boolean;
    // Legacy fields for backward compatibility
    bio?: string;
    experience?: number;
    skills?: string[];
    location?: string;
  };
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface CompleteProfileData {
  fullName: string;
  mobileNumber: string;
  [key: string]: any;
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

export interface PlatformAnalytics {
  users: {
    total: number;
    byRole: Record<string, number>;
  };
  businessIdeas: {
    total: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
  };
  investments: {
    totalProposals: number;
    totalFunded: number;
    proposalsByStatus: Record<string, number>;
    averageAmount: number;
  };
  activity: {
    recentActions: Record<string, number>;
    totalLogs: number;
  };
}
