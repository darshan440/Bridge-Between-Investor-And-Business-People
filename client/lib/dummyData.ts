// Dummy data for when real data is not available
export const dummyBusinessIdeas = [
  {
    id: "dummy-1",
    title: "Eco-Friendly Food Delivery App",
    category: "Technology",
    description:
      "A sustainable food delivery platform that uses electric vehicles and biodegradable packaging to reduce environmental impact while connecting local restaurants with conscious consumers.",
    budget: "₹15-25 Lakhs",
    timeline: "6-9 months",
    views: 127,
    interested: 8,
    status: "active",
    featured: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    author: "Sample Entrepreneur",
    targetMarket: "Urban millennials and Gen Z",
    revenue: "Commission-based model",
  },
  {
    id: "dummy-2",
    title: "AI-Powered Learning Platform for Rural Education",
    category: "Education",
    description:
      "An adaptive learning platform that uses AI to provide personalized education content for students in rural areas, working with limited internet connectivity.",
    budget: "₹8-12 Lakhs",
    timeline: "4-6 months",
    views: 89,
    interested: 12,
    status: "active",
    featured: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    author: "Education Innovator",
    targetMarket: "Rural students aged 10-18",
    revenue: "Subscription and licensing model",
  },
  {
    id: "dummy-3",
    title: "Smart Home Security System",
    category: "Technology",
    description:
      "IoT-based home security system with AI-powered threat detection, mobile app integration, and affordable pricing for middle-class households.",
    budget: "₹20-30 Lakhs",
    timeline: "8-12 months",
    views: 156,
    interested: 15,
    status: "active",
    featured: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    author: "Tech Entrepreneur",
    targetMarket: "Urban homeowners",
    revenue: "Hardware sales + subscription model",
  },
];

export const dummyInvestments = [
  {
    id: "inv-dummy-1",
    businessIdeaId: "dummy-1",
    businessIdeaTitle: "Eco-Friendly Food Delivery App",
    businessIdeaCategory: "Technology",
    amount: 500000, // ₹5 Lakhs
    currentValue: 650000, // ₹6.5 Lakhs
    investmentDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
    status: "active" as const,
    roi: 30.0,
    businessPersonName: "Sample Entrepreneur",
    description: "Sustainable food delivery with growing user base",
    milestones: [
      { title: "MVP Launch", completed: true, date: "2023-12-01" },
      { title: "First 1000 Users", completed: true, date: "2024-01-15" },
      { title: "Series A Funding", completed: false, date: "2024-06-01" },
    ],
    updatedAt: new Date(),
  },
  {
    id: "inv-dummy-2",
    businessIdeaId: "dummy-2",
    businessIdeaTitle: "AI Learning Platform",
    businessIdeaCategory: "Education",
    amount: 300000, // ₹3 Lakhs
    currentValue: 360000, // ₹3.6 Lakhs
    investmentDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months ago
    status: "active" as const,
    roi: 20.0,
    businessPersonName: "Education Innovator",
    description: "AI-powered education platform showing steady growth",
    milestones: [
      { title: "Pilot Program", completed: true, date: "2024-01-01" },
      { title: "10 Schools Onboarded", completed: false, date: "2024-03-01" },
    ],
    updatedAt: new Date(),
  },
];

export const dummyProposals = [
  {
    id: "prop-dummy-1",
    businessIdeaId: "dummy-1",
    businessIdeaTitle: "Eco-Friendly Food Delivery App",
    businessIdeaUserId: "sample-user-1",
    investorId: "sample-investor-1",
    investorName: "Sample Investor",
    amount: 500000,
    equity: 15,
    status: "pending",
    message:
      "Interested in your sustainable approach. Would like to discuss terms.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  },
  {
    id: "prop-dummy-2",
    businessIdeaId: "dummy-3",
    businessIdeaTitle: "Smart Home Security System",
    businessIdeaUserId: "sample-user-2",
    investorId: "sample-investor-2",
    investorName: "Tech Investor",
    amount: 1000000,
    equity: 20,
    status: "accepted",
    message: "Excellent market opportunity. Let's move forward.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

export const dummyLoanSchemes = [
  {
    id: "loan-dummy-1",
    schemeName: "Startup Growth Loan",
    loanType: "Business Loan",
    minAmount: "₹2 Lakhs",
    maxAmount: "₹50 Lakhs",
    interestRate: "12% - 18%",
    tenure: "1-5 years",
    description:
      "Flexible business loans for startups and growing businesses with minimal collateral requirements.",
    eligibility: "Businesses with 6+ months operation history",
    features: ["Quick approval", "Minimal documentation", "Flexible repayment"],
    collateralRequired: false,
    processingFee: "1-2% of loan amount",
    processingTime: "7-14 days",
    status: "active",
    applications: 23,
    approvals: 18,
    userId: "banker-1",
    authorName: "Sample Banker",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: "loan-dummy-2",
    schemeName: "Women Entrepreneur Loan",
    loanType: "Priority Sector Loan",
    minAmount: "₹1 Lakh",
    maxAmount: "₹25 Lakhs",
    interestRate: "10% - 14%",
    tenure: "6 months - 3 years",
    description:
      "Special loan scheme for women entrepreneurs with subsidized interest rates and government backing.",
    eligibility: "Women-owned businesses, 51% women ownership",
    features: [
      "Subsidized rates",
      "Government guarantee",
      "Mentorship support",
    ],
    collateralRequired: false,
    processingFee: "0.5% of loan amount",
    processingTime: "5-10 days",
    status: "active",
    applications: 15,
    approvals: 12,
    userId: "banker-1",
    authorName: "Sample Banker",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  },
];

export const dummyQueries = [
  {
    id: "query-dummy-1",
    title: "How to scale digital marketing for B2B SaaS?",
    description:
      "Our B2B SaaS product has good product-market fit but we're struggling to scale our marketing efforts effectively.",
    category: "Marketing",
    priority: "High",
    status: "open",
    author: "SaaS Founder",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    responses: 0,
  },
  {
    id: "query-dummy-2",
    title: "Best practices for remote team management?",
    description:
      "Managing a distributed team of 20+ people across different time zones. Looking for tools and processes that work.",
    category: "Management",
    priority: "Medium",
    status: "open",
    author: "Startup CEO",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    responses: 2,
  },
];

export const dummySolutions = [
  {
    id: "sol-dummy-1",
    queryId: "query-dummy-1",
    solution:
      "For B2B SaaS marketing, focus on content marketing, LinkedIn outreach, and building strategic partnerships. Start with identifying your ideal customer profile and create targeted content that addresses their pain points.",
    advisorId: "advisor-1",
    advisorName: "Marketing Expert",
    helpful: 8,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

export const dummyStats = {
  business_person: {
    totalIdeas: 3,
    totalProposals: 2,
    totalViews: 372,
    totalInterested: 35,
  },
  investor: {
    totalInvestments: 2,
    totalAmount: 800000,
    averageROI: 25.0,
    bestPerforming: "Eco-Friendly Food Delivery App",
  },
  business_advisor: {
    totalSolutions: 1,
    totalQueries: 2,
    helpfulVotes: 8,
    averageRating: 4.5,
  },
  banker: {
    totalSchemes: 2,
    totalApplications: 38,
    approvalRate: 75,
    averageAmount: 1500000,
  },
  admin: {
    totalUsers: 150,
    totalBusinessIdeas: 45,
    totalInvestments: 23,
    totalQueries: 18,
    platformActivity: 85,
  },
};

export const dummyUsersByRole = {
  user: 45,
  business_person: 35,
  investor: 28,
  business_advisor: 18,
  banker: 12,
  admin: 2,
};

// Helper function to get dummy data based on role
export const getDummyDashboardData = (role: string) => {
  switch (role) {
    case "business_person":
      return {
        businessIdeas: dummyBusinessIdeas,
        proposals: dummyProposals,
        stats: dummyStats.business_person,
      };
    case "investor":
      return {
        investments: dummyInvestments,
        portfolio: {
          totalInvested: 800000,
          totalValue: 1010000,
          roi: 26.25,
          activeInvestments: 2,
        },
        stats: dummyStats.investor,
      };
    case "business_advisor":
      return {
        openQueries: dummyQueries,
        mySolutions: dummySolutions,
        stats: dummyStats.business_advisor,
      };
    case "banker":
      return {
        loanSchemes: dummyLoanSchemes,
        stats: dummyStats.banker,
      };
    case "admin":
      return {
        totalUsers: 140,
        usersByRole: dummyUsersByRole,
        stats: dummyStats.admin,
      };
    default:
      return {};
  }
};
