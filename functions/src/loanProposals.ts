import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { onCall } from "firebase-functions/v2/https";

const db = admin.firestore();

interface LoanProposalData {
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

export const createLoanProposal = onCall<LoanProposalData>(async (request) => {
  if (!request.auth) {
    throw new Error("User must be authenticated to create loan proposals.");
  }

  const userDoc = await db.collection("users").doc(request.auth.uid).get();
  const userProfile = userDoc.data();

  if (!userProfile || userProfile.role !== "business_person") {
    throw new Error("Only business persons can create loan proposals.");
  }
  const data = request.data;

  if (!data.loanPurpose?.trim()) throw new Error("Loan purpose is required.");
  if (!data.loanAmount?.trim()) throw new Error("Loan amount is required.");
  if (!data.repaymentPlan?.repaymentPeriod?.trim())
    throw new Error("Repayment period is required.");
  if (!data.repaymentPlan?.interestRate?.trim())
    throw new Error("Interest rate is required.");
  if (!data.repaymentPlan?.incomeSources?.trim())
    throw new Error("Income source is required.");
  if (!data.businessOverview?.history?.trim())
    throw new Error("Business history is required.");
  if (!data.executiveSummary?.trim())
    throw new Error("Executive summary is required.");

  try {
    const loanProposal = {
      loanPurpose: String(data.loanPurpose).trim(),
      loanAmount: String(data.loanAmount).trim(),
      repaymentPlan: {
        repaymentPeriod: String(data.repaymentPlan.repaymentPeriod).trim(),
        interestRate: String(data.repaymentPlan.interestRate).trim(),
        incomeSources: String(data.repaymentPlan.incomeSources).trim(),
      },
      collateral: Array.isArray(data.collateral)
        ? data.collateral.map((item) => ({
            description: String(item.description ?? ""),
            estimatedValue: String(item.estimatedValue ?? ""),
          }))
        : [],

      businessOverview: {
        history: String(data.businessOverview.history ?? ""),
        legalStructure: String(data.businessOverview.legalStructure ?? ""),
        productsOrServices: String(
          data.businessOverview.productsOrServices ?? "",
        ),
        targetMarket: String(data.businessOverview.targetMarket ?? ""),
      },
      financialInformation: {
        incomeStatements: String(
          data.financialInformation.incomeStatements ?? "",
        ),
        balanceSheets: String(data.financialInformation.balanceSheets ?? ""),
        cashFlowProjections: String(
          data.financialInformation.cashFlowProjections ?? "",
        ),
      },
      marketAnalysis: String(data.marketAnalysis ?? ""),
      managementTeam: String(data.managementTeam ?? ""),
      supportingDocuments: {
        personalAndBusinessDocs: Array.isArray(
          data.supportingDocuments.personalAndBusinessDocs,
        )
          ? data.supportingDocuments.personalAndBusinessDocs.map(String)
          : [],
        financialRecords: Array.isArray(
          data.supportingDocuments.financialRecords,
        )
          ? data.supportingDocuments.financialRecords.map(String)
          : [],
        quotationsAndInvoices: Array.isArray(
          data.supportingDocuments.quotationsAndInvoices,
        )
          ? data.supportingDocuments.quotationsAndInvoices.map(String)
          : [],
        otherDocuments: Array.isArray(data.supportingDocuments.otherDocuments)
          ? data.supportingDocuments.otherDocuments.map(String)
          : [],
      },
      executiveSummary: String(data.executiveSummary ?? ""),
      userId: request.auth.uid,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const proposalRef = await db.collection("LoanProposals").add(loanProposal);

    await db.collection("logs").add({
      userId: request.auth.uid,
      action: "LOAN_PROPOSAL_CREATED",
      data: {
        proposalId: proposalRef.id,
      },
      timestamp: FieldValue.serverTimestamp(),
    });

    const bankersSnapshot = await db
      .collection("users")
      .where("role", "==", "banker")
      .get();

    const notificationBatch = db.batch();

    bankersSnapshot.forEach((bankerDoc) => {
      const banker = bankerDoc.data();
      const notificationRef = db.collection("notifications").doc();

      notificationBatch.set(notificationRef, {
        toUserId: bankerDoc.id,
        type: "loan_proposal_created",
        message: `New loan proposal submitted by ${userProfile.fullName || userProfile.email}`,
        proposalId: proposalRef.id,
        isRead: false,
        timestamp: FieldValue.serverTimestamp(),
      });

      // Optional: Send push notification if banker has FCM token
      if (banker.fcmToken) {
        admin
          .messaging()
          .send({
            token: banker.fcmToken,
            notification: {
              title: "New Loan Proposal",
              body: `A new loan proposal is available for review.`,
            },
            data: {
              proposalId: proposalRef.id,
              type: "loan_proposal_created",
            },
          })
          .catch((error) => {
            console.error("FCM send error:", error);
          });
      }
    });

    await notificationBatch.commit();

    return {
      success: true,
      loanProposalId: proposalRef.id,
      message: "Loan proposal created successfully!",
    };
  } catch (error) {
    console.error("Error creating loan proposal:", error);
    throw new Error("Failed to create loan proposal.");
  }
});
