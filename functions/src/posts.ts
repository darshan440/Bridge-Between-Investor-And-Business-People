import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { onCall } from "firebase-functions/v2/https";

const db = admin.firestore();

// Interface definitions
interface BusinessIdeaData {
  title: string;
  category: string;
  description: string;
  budget: string;
  timeline: string;
  targetMarket?: string;
  revenue?: string;
  team?: string;
  createdAt?: any;
  [key: string]: any;
}

interface LoanSchemeData {
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
}

interface PostSolutionData {
  queryId: string;
  solution: string;
}

// Post business idea
export const postBusinessIdea = onCall<BusinessIdeaData>(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated to post business ideas.");
  }

  const {
    title,
    category,
    description,
    budget,
    timeline,
    targetMarket,
    revenue,
    team,
  } = request.data;

  // Validate required fields
  if (!title?.trim()) {
    throw new Error("Title is required.");
  }
  if (!category) {
    throw new Error("Category is required.");
  }
  if (!description?.trim()) {
    throw new Error("Description is required.");
  }
  if (!budget?.trim()) {
    throw new Error("Budget is required.");
  }
  if (!timeline) {
    throw new Error("Timeline is required.");
  }

  try {
    // Get user profile for additional context
    const userDoc = await db.collection("users").doc(request.auth.uid).get();
    const userProfile = userDoc.data();

    if (!userProfile) {
      throw new Error("User profile not found.");
    }

    const profile = userProfile?.profile || {};
    if (
      userProfile.role === "business_person" &&
      !profile.companyName?.trim()
    ) {
      throw new Error(
        "failed-precondition: Your company name is missing. Please complete your profile before posting a business idea.",
      );
    }
    const businessIdeaRef = await db.collection("businessIdeas").add({
      userId: request.auth.uid,
      authorName: userProfile.displayName || profile.fullName || "",
      authorEmail: userProfile.email || "",
      authorProfile: userProfile.isComplete
        ? {
            uid: request.auth.uid,
            fullName: profile.fullName || userProfile.displayName || "",
            email: userProfile.email || "",
            role: userProfile.role || "",
            mobileNumber: profile.mobileNumber ?? null,
            companyName: profile.companyName ?? null,
            designation: profile.designation ?? null,
            isComplete: userProfile.isComplete ?? false,
          }
        : null,
      title,
      category,
      description,
      budget,
      timeline,
      targetMarket: targetMarket || "",
      revenueModel: revenue || "",
      teamInfo: team || "",
      status: "active",
      views: 0,
      interested: 0,
      featured: false,
      tags: extractTags(description, category),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Log the action
    await db.collection("logs").add({
      userId: request.auth.uid,
      action: "BUSINESS_IDEA_POSTED",
      data: {
        businessIdeaId: businessIdeaRef.id,
        title,
        category,
        budget,
      },
      timestamp: FieldValue.serverTimestamp(),
    });

    // Send notification to potential investors
    await notifyPotentialInvestors(businessIdeaRef.id, category, title);

    return {
      success: true,
      businessIdeaId: businessIdeaRef.id,
      message: "Business idea posted successfully!",
    };
  } catch (error) {
    console.error("Error posting business idea:", error);

    if (
      error instanceof Error &&
      error.message.startsWith("failed-precondition")
    ) {
      throw error; // 🔁 Preserve the custom error for frontend to handle
    }

    throw new Error("internal: Failed to post business idea.");
  }
});

// Post loan scheme
export const postLoanScheme = onCall<LoanSchemeData>(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated to post loan schemes.");
  }

  // Check if user is a banker
  const userDoc = await db.collection("users").doc(request.auth.uid).get();
  const userProfile = userDoc.data();

  if (!userProfile || userProfile.role !== "banker") {
    throw new Error("Only bankers can post loan schemes.");
  }

  const {
    schemeName,
    loanType,
    minAmount,
    maxAmount,
    interestRate,
    tenure,
    description,
    eligibility,
    features,
    collateralRequired,
    processingFee,
    processingTime,
  } = request.data;

  // Validate required fields
  if (!schemeName?.trim()) {
    throw new Error("Scheme name is required.");
  }
  if (!loanType) {
    throw new Error("Loan type is required.");
  }
  if (!minAmount?.trim()) {
    throw new Error("Minimum amount is required.");
  }
  if (!maxAmount?.trim()) {
    throw new Error("Maximum amount is required.");
  }
  if (!interestRate?.trim()) {
    throw new Error("Interest rate is required.");
  }
  if (!tenure?.trim()) {
    throw new Error("Tenure is required.");
  }
  if (!description?.trim()) {
    throw new Error("Description is required.");
  }

  try {
    // Create loan scheme document
    const loanSchemeRef = await db.collection("loanSchemes").add({
      userId: request.auth.uid,
      authorName: userProfile.displayName || userProfile.profile?.fullName,
      authorEmail: userProfile.email,
      authorProfile: userProfile.isComplete
        ? {
            uid: request.auth.uid,
            fullName: userProfile.profile?.fullName || userProfile.displayName,
            email: userProfile.email,
            role: userProfile.role,
            mobileNumber: userProfile.profile?.mobileNumber,
            institutionName: userProfile.profile?.institutionName,
            designation: userProfile.profile?.designation,
            isComplete: userProfile.isComplete,
          }
        : null,
      schemeName,
      loanType,
      minAmount,
      maxAmount,
      interestRate,
      tenure,
      description,
      eligibility: eligibility || "",
      features: features || [],
      collateralRequired,
      processingFee: processingFee || "",
      processingTime: processingTime || "",
      status: "active",
      applications: 0,
      approvals: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Log the action
    await db.collection("logs").add({
      userId: request.auth.uid,
      action: "LOAN_SCHEME_POSTED",
      data: {
        loanSchemeId: loanSchemeRef.id,
        schemeName,
        loanType,
        interestRate,
      },
      timestamp: FieldValue.serverTimestamp(),
    });

    // Notify business persons about new loan scheme
    await notifyBusinessPersons(loanSchemeRef.id, schemeName, loanType);

    return {
      success: true,
      loanSchemeId: loanSchemeRef.id,
      message: "Loan scheme posted successfully!",
    };
  } catch (error) {
    console.error("Error posting loan scheme:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to post loan scheme.");
  }
});

// Post solution to a query
export const postSolution = onCall<PostSolutionData>(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated to post solutions.");
  }

  // Check if user is a business advisor
  const userDoc = await db.collection("users").doc(request.auth.uid).get();
  const userProfile = userDoc.data();

  if (!userProfile || userProfile.role !== "business_advisor") {
    throw new Error("Only business advisors can post solutions.");
  }

  const { queryId, solution } = request.data;

  // Validate required fields
  if (!queryId?.trim()) {
    throw new Error("Query ID is required.");
  }
  if (!solution?.trim()) {
    throw new Error("Solution is required.");
  }

  try {
    // Verify the query exists
    const queryDoc = await db.collection("queries").doc(queryId).get();
    if (!queryDoc.exists) {
      throw new Error("Query not found.");
    }

    const queryData = queryDoc.data();

    // Create solution document
    const solutionRef = await db.collection("solutions").add({
      queryId,
      advisorId: request.auth.uid,
      advisorName: userProfile.displayName || userProfile.profile?.fullName,
      advisorEmail: userProfile.email,
      advisorProfile: userProfile.isComplete
        ? {
            uid: request.auth.uid,
            fullName: userProfile.profile?.fullName || userProfile.displayName,
            email: userProfile.email,
            role: userProfile.role,
            mobileNumber: userProfile.profile?.mobileNumber,
            institutionName: userProfile.profile?.institutionName,
            designation: userProfile.profile?.designation,
            isComplete: userProfile.isComplete,
          }
        : null,
      solution,
      status: "published",
      likes: 0,
      helpful: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Update query to mark as answered
    await db
      .collection("queries")
      .doc(queryId)
      .update({
        status: "answered",
        answeredAt: FieldValue.serverTimestamp(),
        answeredBy: request.auth.uid,
        solutionCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });

    // Log the action
    await db.collection("logs").add({
      userId: request.auth.uid,
      action: "SOLUTION_POSTED",
      data: {
        queryId,
        solutionId: solutionRef.id,
        queryTitle: queryData?.title,
      },
      timestamp: FieldValue.serverTimestamp(),
    });

    // Notify the query author about the new solution
    if (queryData?.userId) {
      await db.collection("notifications").add({
        userId: queryData.userId,
        title: "New Solution to Your Query",
        body: `${userProfile.displayName || "A business advisor"} has provided a solution to your query: "${queryData.title}"`,
        type: "SOLUTION_RECEIVED",
        data: {
          queryId,
          solutionId: solutionRef.id,
          advisorId: request.auth.uid,
        },
        read: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    return {
      success: true,
      solutionId: solutionRef.id,
      message: "Solution posted successfully!",
    };
  } catch (error) {
    console.error("Error posting solution:", error);
    throw error instanceof Error
      ? error
      : new Error("Failed to post solution.");
  }
});

// Helper function to extract tags from description and category
function extractTags(description: string, category: string): string[] {
  const tags = [category];

  // Add some common tags based on keywords in description
  const keywords = [
    { terms: ["ai", "artificial intelligence", "machine learning"], tag: "AI" },
    { terms: ["blockchain", "crypto", "cryptocurrency"], tag: "Blockchain" },
    { terms: ["mobile", "app", "android", "ios"], tag: "Mobile" },
    { terms: ["web", "website", "online"], tag: "Web" },
    { terms: ["startup", "entrepreneur"], tag: "Startup" },
    { terms: ["b2b", "business to business"], tag: "B2B" },
    { terms: ["b2c", "business to consumer"], tag: "B2C" },
    { terms: ["saas", "software as a service"], tag: "SaaS" },
    { terms: ["iot", "internet of things"], tag: "IoT" },
    { terms: ["fintech", "financial technology"], tag: "FinTech" },
  ];

  const lowerDesc = description.toLowerCase();
  keywords.forEach(({ terms, tag }) => {
    if (terms.some((term) => lowerDesc.includes(term))) {
      tags.push(tag);
    }
  });

  return [...new Set(tags)]; // Remove duplicates
}

// Helper function to notify potential investors about new business ideas
async function notifyPotentialInvestors(
  businessIdeaId: string,
  category: string,
  title: string,
) {
  try {
    // Get investors who might be interested in this category
    const investorsQuery = await db
      .collection("users")
      .where("role", "==", "investor")
      .where("isComplete", "==", true)
      .get();

    const notificationPromises = investorsQuery.docs.map(async (doc) => {
      const investor = doc.data();
      const preferredSectors = investor.profile?.preferredSectors || [];

      // Check if investor is interested in this category
      if (
        preferredSectors.length === 0 ||
        preferredSectors.includes(category)
      ) {
        return db.collection("notifications").add({
          userId: doc.id,
          title: "New Business Opportunity",
          body: `A new ${category} business idea "${title}" is looking for investment.`,
          type: "NEW_BUSINESS_IDEA",
          data: {
            businessIdeaId,
            category,
            title,
          },
          read: false,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
      return null;
    });

    await Promise.allSettled(notificationPromises);
  } catch (error) {
    console.error("Error notifying investors:", error);
    // Don't throw - this is not critical to the main operation
  }
}

// Helper function to notify business persons about new loan schemes
async function notifyBusinessPersons(
  loanSchemeId: string,
  schemeName: string,
  loanType: string,
) {
  try {
    // Get business persons who might be interested
    const businessPersonsQuery = await db
      .collection("users")
      .where("role", "==", "business_person")
      .where("isComplete", "==", true)
      .get();

    const notificationPromises = businessPersonsQuery.docs.map(async (doc) => {
      return db.collection("notifications").add({
        userId: doc.id,
        title: "New Loan Scheme Available",
        body: `A new ${loanType} loan scheme "${schemeName}" is now available.`,
        type: "NEW_LOAN_SCHEME",
        data: {
          loanSchemeId,
          schemeName,
          loanType,
        },
        read: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    });

    await Promise.allSettled(notificationPromises);
  } catch (error) {
    console.error("Error notifying business persons:", error);
    // Don't throw - this is not critical to the main operation
  }
}

// Get business ideas with filtering and pagination
export const getBusinessIdeas = onCall<{
  category?: string;
  search?: string;
  limit?: number;
  lastVisible?: string;
}>(async (request) => {
  const { category, search, limit = 20, lastVisible } = request.data;

  try {
    let query = db
      .collection("businessIdeas")
      .where("status", "==", "active")
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (category && category !== "All Categories") {
      query = query.where("category", "==", category);
    }

    if (lastVisible) {
      const lastDoc = await db
        .collection("businessIdeas")
        .doc(lastVisible)
        .get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }

    const snapshot = await query.get();
    const businessIdeas = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter by search term if provided
    let filteredIdeas = businessIdeas;
    if (search?.trim()) {
      const searchTerm = search.toLowerCase();
      filteredIdeas = businessIdeas.filter(
        (idea: any) =>
          idea.title?.toLowerCase().includes(searchTerm) ||
          idea.description?.toLowerCase().includes(searchTerm) ||
          idea.tags?.some((tag: string) =>
            tag.toLowerCase().includes(searchTerm),
          ),
      );
    }

    return {
      businessIdeas: filteredIdeas,
      hasMore: snapshot.size === limit,
      lastVisible:
        snapshot.docs.length > 0
          ? snapshot.docs[snapshot.docs.length - 1].id
          : null,
    };
  } catch (error) {
    console.error("Error getting business ideas:", error);
    throw new Error("Failed to get business ideas.");
  }
});

// Get loan schemes with filtering
export const getLoanSchemes = onCall<{
  loanType?: string;
  search?: string;
  limit?: number;
}>(async (request) => {
  const { loanType, search, limit = 20 } = request.data;

  try {
    let query = db
      .collection("loanSchemes")
      .where("status", "==", "active")
      .orderBy("createdAt", "desc")
      .limit(limit);

    if (loanType && loanType !== "All Types") {
      query = query.where("loanType", "==", loanType);
    }

    const snapshot = await query.get();
    const loanSchemes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter by search term if provided
    let filteredSchemes = loanSchemes;
    if (search?.trim()) {
      const searchTerm = search.toLowerCase();
      filteredSchemes = loanSchemes.filter(
        (scheme: any) =>
          scheme.schemeName?.toLowerCase().includes(searchTerm) ||
          scheme.description?.toLowerCase().includes(searchTerm),
      );
    }

    return {
      loanSchemes: filteredSchemes,
    };
  } catch (error) {
    console.error("Error getting loan schemes:", error);
    throw new Error("Failed to get loan schemes.");
  }
});
