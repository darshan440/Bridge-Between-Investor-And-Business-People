import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Your Firebase config object
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain:
    process.env.VITE_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket:
    process.env.VITE_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId:
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.VITE_FIREBASE_APP_ID || "your-app-id",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Initialize messaging only if supported (not in Node.js environment)
let messaging: any = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
});

export { messaging };

// Connect to emulators in development
if (process.env.NODE_ENV === "development") {
  // Connect to emulators if they're not already connected
  try {
    connectAuthEmulator(auth, "http://localhost:9099", {
      disableWarnings: true,
    });
    connectFirestoreEmulator(db, "localhost", 8080);
    connectStorageEmulator(storage, "localhost", 9199);
    connectFunctionsEmulator(functions, "localhost", 5001);
  } catch (error) {
    // Emulators already connected or not available
    console.log("Firebase emulators connection attempt:", error);
  }
}

// Firestore collection names (centralized for consistency)
export const COLLECTIONS = {
  USERS: "users",
  BUSINESS_IDEAS: "businessIdeas",
  INVESTMENT_PROPOSALS: "investmentProposals",
  QUERIES: "queries",
  RESPONSES: "responses",
  ADVISOR_SUGGESTIONS: "advisorSuggestions",
  LOAN_SCHEMES: "loanSchemes",
  PORTFOLIOS: "portfolios",
  NOTIFICATIONS: "notifications",
  LOGS: "logs",
} as const;

// User roles enum
export const USER_ROLES = {
  USER: "user",
  BUSINESS_PERSON: "business_person",
  INVESTOR: "investor",
  BANKER: "banker",
  BUSINESS_ADVISOR: "business_advisor",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Export app for use in other files
export default app;
