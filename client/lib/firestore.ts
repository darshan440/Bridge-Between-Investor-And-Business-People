import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
  writeBatch,
  increment,
} from "firebase/firestore";
import { auth, db, COLLECTIONS } from "./firebase";
import { logUserAction } from "./logging";

// Generic types for common data structures
export interface BusinessIdea {
  id?: string;
  userId: string;
  title: string;
  category: string;
  description: string;
  budget: string;
  timeline: string;
  targetMarket?: string;
  revenueModel?: string;
  teamInfo?: string;
  status: "draft" | "published" | "funded" | "closed";
  views: number;
  interested: number;
  tags: string[];
  createdAt: any;
  updatedAt: any;
}

export interface InvestmentProposal {
  id?: string;
  investorId: string;
  businessIdeaId: string;
  amount: number;
  terms: string;
  timeline: string;
  equity?: number;
  additionalNotes?: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt: any;
  updatedAt: any;
}

export interface Query {
  id?: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: "Low" | "Medium" | "High";
  status: "open" | "answered" | "closed";
  views: number;
  responses: number;
  upvotes: number;
  tags: string[];
  createdAt: any;
  updatedAt: any;
}

export interface Response {
  id?: string;
  queryId: string;
  advisorId: string;
  content: string;
  upvotes: number;
  helpful: boolean;
  createdAt: any;
  updatedAt: any;
}

export interface AdvisorSuggestion {
  id?: string;
  advisorId: string;
  targetUserId?: string;
  title: string;
  content: string;
  category: string;
  type: string;
  priority: "Low" | "Medium" | "High";
  tags: string[];
  views: number;
  helpful: number;
  relatedTo?: string;
  createdAt: any;
  updatedAt: any;
}

export interface LoanScheme {
  id?: string;
  bankerId: string;
  schemeName: string;
  bankName: string;
  schemeType: string;
  minAmount: string;
  maxAmount: string;
  interestRateMin: string;
  interestRateMax: string;
  tenureMin: string;
  tenureMax: string;
  description: string;
  eligibility: string;
  documents?: string;
  features: string[];
  collateralRequired: boolean;
  processingFee?: string;
  processingTime?: string;
  applications: number;
  approved: number;
  status: "active" | "inactive" | "closed";
  createdAt: any;
  updatedAt: any;
}

export interface Portfolio {
  id?: string;
  investorId: string;
  investments: {
    businessIdeaId: string;
    amount: number;
    equity: number;
    dateInvested: any;
    status: "active" | "exited" | "failed";
    currentValue?: number;
  }[];
  totalInvested: number;
  totalValue: number;
  roi: number;
  createdAt: any;
  updatedAt: any;
}

// Business Ideas Service
export const businessIdeasService = {
  // Create new business idea
  async create(
    data: Omit<
      BusinessIdea,
      "id" | "userId" | "views" | "interested" | "createdAt" | "updatedAt"
    >,
  ): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const businessIdea: Omit<BusinessIdea, "id"> = {
      ...data,
      userId: user.uid,
      views: 0,
      interested: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, COLLECTIONS.BUSINESS_IDEAS),
      businessIdea,
    );
    await logUserAction(user.uid, "BUSINESS_IDEA_CREATED", {
      ideaId: docRef.id,
      title: data.title,
    });

    return docRef.id;
  },

  // Get business idea by ID
  async getById(id: string): Promise<BusinessIdea | null> {
    const docSnap = await getDoc(doc(db, COLLECTIONS.BUSINESS_IDEAS, id));
    if (!docSnap.exists()) return null;

    return { id: docSnap.id, ...docSnap.data() } as BusinessIdea;
  },

  // Get all business ideas with pagination
  async getAll(
    pageSize: number = 10,
    lastDoc?: QueryDocumentSnapshot<DocumentData>,
  ): Promise<BusinessIdea[]> {
    let q = query(
      collection(db, COLLECTIONS.BUSINESS_IDEAS),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
      limit(pageSize),
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as BusinessIdea,
    );
  },

  // Get business ideas by user
  async getByUser(userId: string): Promise<BusinessIdea[]> {
    const q = query(
      collection(db, COLLECTIONS.BUSINESS_IDEAS),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as BusinessIdea,
    );
  },

  // Update business idea
  async update(id: string, updates: Partial<BusinessIdea>): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    await updateDoc(doc(db, COLLECTIONS.BUSINESS_IDEAS, id), {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    await logUserAction(user.uid, "BUSINESS_IDEA_UPDATED", {
      ideaId: id,
      updates,
    });
  },

  // Increment view count
  async incrementViews(id: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.BUSINESS_IDEAS, id), {
      views: increment(1),
    });
  },

  // Increment interested count
  async incrementInterested(id: string): Promise<void> {
    await updateDoc(doc(db, COLLECTIONS.BUSINESS_IDEAS, id), {
      interested: increment(1),
    });
  },

  // Search business ideas
  async search(searchTerm: string, category?: string): Promise<BusinessIdea[]> {
    let q = query(
      collection(db, COLLECTIONS.BUSINESS_IDEAS),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
    );

    if (category && category !== "All Categories") {
      q = query(q, where("category", "==", category));
    }

    const querySnapshot = await getDocs(q);
    const allIdeas = querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as BusinessIdea,
    );

    // Client-side search filtering (Firestore doesn't support full-text search natively)
    return allIdeas.filter(
      (idea) =>
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    );
  },
};

// Investment Proposals Service
export const investmentProposalsService = {
  // Create investment proposal
  async create(
    data: Omit<
      InvestmentProposal,
      "id" | "investorId" | "createdAt" | "updatedAt"
    >,
  ): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const proposal: Omit<InvestmentProposal, "id"> = {
      ...data,
      investorId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, COLLECTIONS.INVESTMENT_PROPOSALS),
      proposal,
    );
    await logUserAction(user.uid, "INVESTMENT_PROPOSAL_CREATED", {
      proposalId: docRef.id,
      businessIdeaId: data.businessIdeaId,
      amount: data.amount,
    });

    return docRef.id;
  },

  // Get proposals by business idea
  async getByBusinessIdea(
    businessIdeaId: string,
  ): Promise<InvestmentProposal[]> {
    const q = query(
      collection(db, COLLECTIONS.INVESTMENT_PROPOSALS),
      where("businessIdeaId", "==", businessIdeaId),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as InvestmentProposal,
    );
  },

  // Get proposals by investor
  async getByInvestor(investorId: string): Promise<InvestmentProposal[]> {
    const q = query(
      collection(db, COLLECTIONS.INVESTMENT_PROPOSALS),
      where("investorId", "==", investorId),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as InvestmentProposal,
    );
  },

  // Update proposal status
  async updateStatus(
    id: string,
    status: InvestmentProposal["status"],
  ): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    await updateDoc(doc(db, COLLECTIONS.INVESTMENT_PROPOSALS, id), {
      status,
      updatedAt: serverTimestamp(),
    });

    await logUserAction(user.uid, "INVESTMENT_PROPOSAL_STATUS_UPDATED", {
      proposalId: id,
      status,
    });
  },
};

// Queries Service
export const queriesService = {
  // Create new query
  async create(
    data: Omit<
      Query,
      | "id"
      | "userId"
      | "views"
      | "responses"
      | "upvotes"
      | "createdAt"
      | "updatedAt"
    >,
  ): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const queryData: Omit<Query, "id"> = {
      ...data,
      userId: user.uid,
      views: 0,
      responses: 0,
      upvotes: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, COLLECTIONS.QUERIES), queryData);
    await logUserAction(user.uid, "QUERY_CREATED", {
      queryId: docRef.id,
      title: data.title,
    });

    return docRef.id;
  },

  // Get query by ID
  async getById(id: string): Promise<Query | null> {
    const docSnap = await getDoc(doc(db, COLLECTIONS.QUERIES, id));
    if (!docSnap.exists()) return null;

    return { id: docSnap.id, ...docSnap.data() } as Query;
  },

  // Get all open queries
  async getOpen(): Promise<Query[]> {
    const q = query(
      collection(db, COLLECTIONS.QUERIES),
      where("status", "==", "open"),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Query,
    );
  },

  // Get queries by user
  async getByUser(userId: string): Promise<Query[]> {
    const q = query(
      collection(db, COLLECTIONS.QUERIES),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Query,
    );
  },
};

// Responses Service
export const responsesService = {
  // Create response to query
  async create(
    data: Omit<
      Response,
      "id" | "advisorId" | "upvotes" | "helpful" | "createdAt" | "updatedAt"
    >,
  ): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const batch = writeBatch(db);

    // Create response
    const responseRef = doc(collection(db, COLLECTIONS.RESPONSES));
    const responseData: Omit<Response, "id"> = {
      ...data,
      advisorId: user.uid,
      upvotes: 0,
      helpful: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    batch.set(responseRef, responseData);

    // Update query response count and status
    const queryRef = doc(db, COLLECTIONS.QUERIES, data.queryId);
    batch.update(queryRef, {
      responses: increment(1),
      status: "answered",
      updatedAt: serverTimestamp(),
    });

    await batch.commit();
    await logUserAction(user.uid, "RESPONSE_CREATED", {
      responseId: responseRef.id,
      queryId: data.queryId,
    });

    return responseRef.id;
  },

  // Get responses for a query
  async getByQuery(queryId: string): Promise<Response[]> {
    const q = query(
      collection(db, COLLECTIONS.RESPONSES),
      where("queryId", "==", queryId),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as Response,
    );
  },
};

// Advisor Suggestions Service
export const advisorSuggestionsService = {
  // Create suggestion
  async create(
    data: Omit<
      AdvisorSuggestion,
      "id" | "advisorId" | "views" | "helpful" | "createdAt" | "updatedAt"
    >,
  ): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const suggestion: Omit<AdvisorSuggestion, "id"> = {
      ...data,
      advisorId: user.uid,
      views: 0,
      helpful: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, COLLECTIONS.ADVISOR_SUGGESTIONS),
      suggestion,
    );
    await logUserAction(user.uid, "ADVISOR_SUGGESTION_CREATED", {
      suggestionId: docRef.id,
      title: data.title,
    });

    return docRef.id;
  },

  // Get all suggestions
  async getAll(): Promise<AdvisorSuggestion[]> {
    const q = query(
      collection(db, COLLECTIONS.ADVISOR_SUGGESTIONS),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as AdvisorSuggestion,
    );
  },

  // Get suggestions for user
  async getForUser(userId: string): Promise<AdvisorSuggestion[]> {
    const q = query(
      collection(db, COLLECTIONS.ADVISOR_SUGGESTIONS),
      where("targetUserId", "in", [userId, ""]),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as AdvisorSuggestion,
    );
  },
};

// Loan Schemes Service
export const loanSchemesService = {
  // Create loan scheme
  async create(
    data: Omit<
      LoanScheme,
      | "id"
      | "bankerId"
      | "applications"
      | "approved"
      | "createdAt"
      | "updatedAt"
    >,
  ): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const scheme: Omit<LoanScheme, "id"> = {
      ...data,
      bankerId: user.uid,
      applications: 0,
      approved: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, COLLECTIONS.LOAN_SCHEMES),
      scheme,
    );
    await logUserAction(user.uid, "LOAN_SCHEME_CREATED", {
      schemeId: docRef.id,
      schemeName: data.schemeName,
    });

    return docRef.id;
  },

  // Get all active loan schemes
  async getActive(): Promise<LoanScheme[]> {
    const q = query(
      collection(db, COLLECTIONS.LOAN_SCHEMES),
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as LoanScheme,
    );
  },

  // Get schemes by banker
  async getByBanker(bankerId: string): Promise<LoanScheme[]> {
    const q = query(
      collection(db, COLLECTIONS.LOAN_SCHEMES),
      where("bankerId", "==", bankerId),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() }) as LoanScheme,
    );
  },
};

// Portfolio Service
export const portfolioService = {
  // Get or create portfolio for investor
  async getOrCreate(investorId: string): Promise<Portfolio> {
    const portfolioDoc = await getDoc(
      doc(db, COLLECTIONS.PORTFOLIOS, investorId),
    );

    if (portfolioDoc.exists()) {
      return { id: portfolioDoc.id, ...portfolioDoc.data() } as Portfolio;
    }

    // Create new portfolio
    const newPortfolio: Omit<Portfolio, "id"> = {
      investorId,
      investments: [],
      totalInvested: 0,
      totalValue: 0,
      roi: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(doc(db, COLLECTIONS.PORTFOLIOS, investorId), newPortfolio);
    return { id: investorId, ...newPortfolio } as Portfolio;
  },

  // Add investment to portfolio
  async addInvestment(
    investorId: string,
    investment: Portfolio["investments"][0],
  ): Promise<void> {
    const portfolioRef = doc(db, COLLECTIONS.PORTFOLIOS, investorId);
    const portfolioDoc = await getDoc(portfolioRef);

    if (portfolioDoc.exists()) {
      const portfolio = portfolioDoc.data() as Portfolio;
      const updatedInvestments = [...portfolio.investments, investment];
      const newTotalInvested = portfolio.totalInvested + investment.amount;

      await updateDoc(portfolioRef, {
        investments: updatedInvestments,
        totalInvested: newTotalInvested,
        updatedAt: serverTimestamp(),
      });
    }
  },
};
