import { initializeApp, setLogLevel } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { getMessaging, isSupported } from "firebase/messaging";
import { connectStorageEmulator, getStorage } from "firebase/storage";

// Check if Firebase is properly configured
const isFirebaseConfigured = () => {
  const requiredEnvVars = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
  ];

  return requiredEnvVars.every((envVar) => {
    const value = import.meta.env[envVar];
    return (
      value &&
      value !== "your-api-key" &&
      value !== "your-project-id" &&
      value !== "your-project.firebaseapp.com" &&
      value !== "your-project.appspot.com" &&
      value !== "123456789" &&
      value !== "your-app-id"
    );
  });
};

// Firebase configuration with validation
const createFirebaseConfig = () => {
  if (!isFirebaseConfigured()) {
    console.warn("⚠️ Firebase is not properly configured. Using demo mode.");
    console.warn("Please set up your environment variables in .env file.");
    console.warn(
      "Copy .env.example to .env and add your Firebase configuration.",
    );
    

    // Return a minimal config for development
    return {
      apiKey: "demo-api-key",
      authDomain: "demo.firebaseapp.com",
      projectId: "demo-project",
      storageBucket: "demo.appspot.com",
      messagingSenderId: "123456789",
      appId: "demo-app-id",
      measurementId: "G-DEMO",
    };
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
  };
};

const firebaseConfig = createFirebaseConfig();
export const isFirebaseEnabled = isFirebaseConfigured();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with error handling
let auth: any = null;
let db: any = null;
let storage: any = null;
let functions: any = null;

try {
  if (isFirebaseEnabled) {
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    functions = getFunctions(app);
  } else {
    console.warn("Firebase services disabled - configuration not found");
  }
} catch (error) {
  console.error("Error initializing Firebase services:", error);
}

export { auth, db, functions, storage };

// Initialize messaging only if supported (not in Node.js environment)
let messaging: any = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
});

export { messaging };


  const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true";
if (import.meta.env.DEV && isFirebaseEnabled && useEmulators) {
  console.log("✅ Running in DEV mode:", import.meta.env.DEV);

  let emulatorsConnected = false;

  const connectToEmulators = () => {
    if (emulatorsConnected || !auth || !db || !storage || !functions) return;

    try {
      // Check if emulators are available by checking if auth emulator is already connected
      if (!auth._config?.emulator) {
        connectAuthEmulator(auth, "http://localhost:9099", {
          disableWarnings: true,
        });
      }

      // Check if Firestore emulator is not already connected
      if (!db._delegate?._databaseId?.projectId?.includes("localhost")) {
        connectFirestoreEmulator(db, "localhost", 8080);
      }

      // Check if Storage emulator is not already connected
      if (!storage._config?.emulator) {
        connectStorageEmulator(storage, "localhost", 9199);
      }

      // Check if Functions emulator is not already connected
      if (!functions._config?.emulator) {
        connectFunctionsEmulator(functions, "localhost", 5001);
      }

      emulatorsConnected = true;
      console.log("🔥 Connected to Firebase emulators");
      console.log("🔥 Firebase config being used:", createFirebaseConfig());
    } catch (error) {
      // Emulators already connected or not available
      console.log(
        "Firebase emulators connection attempt:",
        error?.message || error,
      );
    }
  };

  // Try to connect immediately
  connectToEmulators();

  // Also try after a short delay in case services aren't ready
  setTimeout(connectToEmulators, 100);
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
