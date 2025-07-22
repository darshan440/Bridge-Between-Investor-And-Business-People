import * as admin from "firebase-admin";
import { onCall } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";

const db = admin.firestore();

interface InvestmentProposalData {
  businessIdeaId: string;
  amount: number;
  equity: number;
  message?: string;
}

interface AcceptInvestmentData {
  proposalId: string;
}

// Create investment proposal
export const createInvestmentProposal = onCall<InvestmentProposalData>(
  async (request) => {
    if (!request.auth) {
      throw new Error(
        "User must be authenticated to create investment proposals.",
      );
    }

    const { businessIdeaId, amount, equity, message } = request.data;

    // Validate required fields
    if (!businessIdeaId?.trim()) {
      throw new Error("Business idea ID is required.");
    }
    if (!amount || amount <= 0) {
      throw new Error("Valid investment amount is required.");
    }
    if (!equity || equity <= 0 || equity > 100) {
      throw new Error("Valid equity percentage (1-100) is required.");
    }

    try {
      // Get investor profile
      const investorDoc = await db
        .collection("users")
        .doc(request.auth.uid)
        .get();
      const investorProfile = investorDoc.data();

      if (!investorProfile || investorProfile.role !== "investor") {
        throw new Error("Only investors can create investment proposals.");
      }

      // Get business idea details
      const businessIdeaDoc = await db
        .collection("businessIdeas")
        .doc(businessIdeaId)
        .get();
      if (!businessIdeaDoc.exists) {
        throw new Error("Business idea not found.");
      }

      const businessIdeaData = businessIdeaDoc.data();

      // Check if investor already has a proposal for this idea
      const existingProposal = await db
        .collection("investmentProposals")
        .where("businessIdeaId", "==", businessIdeaId)
        .where("investorId", "==", request.auth.uid)
        .get();

      if (!existingProposal.empty) {
        throw new Error("You already have a proposal for this business idea.");
      }

      // Create investment proposal
      const proposalRef = await db.collection("investmentProposals").add({
        businessIdeaId,
        businessIdeaTitle: businessIdeaData?.title,
        businessIdeaUserId: businessIdeaData?.userId,
        investorId: request.auth.uid,
        investorName:
          investorProfile.displayName || investorProfile.profile?.fullName,
        investorEmail: investorProfile.email,
        investorProfile: investorProfile.isComplete
          ? {
              uid: request.auth.uid,
              fullName:
                investorProfile.profile?.fullName ||
                investorProfile.displayName,
              email: investorProfile.email,
              role: investorProfile.role,
              mobileNumber: investorProfile.profile?.mobileNumber,
              companyName: investorProfile.profile?.companyName,
              isComplete: investorProfile.isComplete,
            }
          : null,
        amount,
        equity,
        message: message || "",
        status: "pending",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Notify business person about new proposal
      await db.collection("notifications").add({
        userId: businessIdeaData?.userId,
        title: "New Investment Proposal",
        body: `${investorProfile.displayName || "An investor"} has made an investment proposal of ₹${amount.toLocaleString("en-IN")} for ${equity}% equity in "${businessIdeaData?.title}"`,
        type: "INVESTMENT_PROPOSAL",
        data: {
          proposalId: proposalRef.id,
          businessIdeaId,
          investorId: request.auth.uid,
          amount,
          equity,
        },
        read: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Log the action
      await db.collection("logs").add({
        userId: request.auth.uid,
        action: "INVESTMENT_PROPOSAL_CREATED",
        data: {
          proposalId: proposalRef.id,
          businessIdeaId,
          amount,
          equity,
        },
        timestamp: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        proposalId: proposalRef.id,
        message: "Investment proposal created successfully!",
      };
    } catch (error) {
      console.error("Error creating investment proposal:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to create investment proposal.");
    }
  },
);

// Accept investment proposal
export const acceptInvestmentProposal = onCall<AcceptInvestmentData>(
  async (request) => {
    if (!request.auth) {
      throw new Error(
        "User must be authenticated to accept investment proposals.",
      );
    }

    const { proposalId } = request.data;

    if (!proposalId?.trim()) {
      throw new Error("Proposal ID is required.");
    }

    try {
      // Get proposal details
      const proposalDoc = await db
        .collection("investmentProposals")
        .doc(proposalId)
        .get();
      if (!proposalDoc.exists) {
        throw new Error("Investment proposal not found.");
      }

      const proposalData = proposalDoc.data();

      // Verify the user is the business idea owner
      if (proposalData?.businessIdeaUserId !== request.auth.uid) {
        throw new Error("Only the business idea owner can accept proposals.");
      }

      // Update proposal status
      await db.collection("investmentProposals").doc(proposalId).update({
        status: "accepted",
        acceptedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Create investment record
      const investmentRef = await db.collection("investments").add({
        businessIdeaId: proposalData?.businessIdeaId,
        businessIdeaTitle: proposalData?.businessIdeaTitle,
        businessIdeaCategory: proposalData?.businessIdeaCategory || "General",
        businessPersonId: request.auth.uid,
        investorId: proposalData?.investorId,
        investorName: proposalData?.investorName,
        amount: proposalData?.amount,
        equity: proposalData?.equity,
        currentValue: proposalData?.amount, // Initial value same as investment
        investmentDate: FieldValue.serverTimestamp(),
        status: "active",
        roi: 0, // Initial ROI is 0
        milestones: [],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Notify investor about acceptance
      await db.collection("notifications").add({
        userId: proposalData?.investorId,
        title: "Investment Proposal Accepted",
        body: `Your investment proposal of ₹${proposalData?.amount.toLocaleString("en-IN")} for "${proposalData?.businessIdeaTitle}" has been accepted!`,
        type: "INVESTMENT_ACCEPTED",
        data: {
          investmentId: investmentRef.id,
          businessIdeaId: proposalData?.businessIdeaId,
          amount: proposalData?.amount,
          equity: proposalData?.equity,
        },
        read: false,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      // Log the action
      await db.collection("logs").add({
        userId: request.auth.uid,
        action: "INVESTMENT_PROPOSAL_ACCEPTED",
        data: {
          proposalId,
          investmentId: investmentRef.id,
          amount: proposalData?.amount,
          equity: proposalData?.equity,
        },
        timestamp: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        investmentId: investmentRef.id,
        message: "Investment proposal accepted successfully!",
      };
    } catch (error) {
      console.error("Error accepting investment proposal:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to accept investment proposal.");
    }
  },
);

// Get investment proposals for business person
export const getMyProposals = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated.");
  }

  try {
    const proposalsSnapshot = await db
      .collection("investmentProposals")
      .where("businessIdeaUserId", "==", request.auth.uid)
      .orderBy("createdAt", "desc")
      .get();

    const proposals = proposalsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      proposals,
    };
  } catch (error) {
    console.error("Error getting proposals:", error);
    throw new Error("Failed to get investment proposals.");
  }
});

// Get investments for investor
export const getMyInvestments = onCall(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated.");
  }

  try {
    const investmentsSnapshot = await db
      .collection("investments")
      .where("investorId", "==", request.auth.uid)
      .orderBy("investmentDate", "desc")
      .get();

    const investments = investmentsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      investments,
    };
  } catch (error) {
    console.error("Error getting investments:", error);
    throw new Error("Failed to get investments.");
  }
});
