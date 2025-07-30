

# 🏢 InvestBridge - Firebase-Powered Investment Platform

> **Bridge Between Investors and Business People**

InvestBridge is a modern web application that connects visionary entrepreneurs with smart investors, featuring role-based authentication, real-time notifications, and comprehensive business management tools.

  🔗 Live Demo

[![Live Demo](https://img.shields.io/badge/LIVE-DEMO-green?style=for-the-badge&logo=firebase)](https://investbridge-9720e.web.app)

👉 [Click here to view the live site](https://investbridge-9720e.web.app)


## 🚀 Features

### 🔐 Authentication & Authorization

- **Firebase Authentication** with role-based access control
- **5 User Roles**: User, Business Person, Investor, Banker, Business Advisor
- **Custom claims** for granular permissions
- **Profile management** with image uploads

### 💼 Business Features

- **Business Idea Posting** with categorization and tagging
- **Investment Proposal System** with status tracking
- **Expert Advisory Panel** with Q&A functionality
- **Loan Scheme Management** by banking partners
- **Portfolio Tracking** for investors
- **Risk Assessment Tools** for bankers

### 🔔 Real-time Notifications

- **Firebase Cloud Messaging** for push notifications
- **In-app notifications** with read/unread status
- **Email notifications** for critical events
- **Topic-based subscriptions** for targeted messaging

### 📊 Analytics & Insights

- **Risk assessment algorithms** for loan decisions
- **Portfolio performance tracking** with ROI calculations
- **Platform analytics** for administrators
- **User activity logging** for compliance

## 🛠 Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Radix UI** components for accessibility
- **React Router 6** for navigation
- **TanStack Query** for data fetching

### Backend & Database

- **Firebase Authentication** for user management
- **Cloud Firestore** for real-time database
- **Firebase Storage** for file uploads
- **Cloud Functions** for server-side logic
- **Firebase Cloud Messaging** for notifications

### DevOps & Deployment

- **Firebase Hosting** for frontend
- **Firebase Emulators** for local development
- **GitHub Actions** for CI/CD (optional)
- **Firebase Extensions** for enhanced functionality

## 📦 Project Structure

```
├── client/                     # React frontend
│   ├── components/ui/          # Reusable UI components
│   ├── lib/                    # Firebase services & utilities
│   │   ├── firebase.ts         # Firebase configuration
│   │   ├── auth.ts             # Authentication service
│   │   ├── firestore.ts        # Database operations
│   │   ├── messaging.ts        # Push notifications
│   │   └── logging.ts          # User action logging
│   ├── pages/                  # Route components
│   └── hooks/                  # Custom React hooks
├── functions/                  # Firebase Cloud Functions
│   ├── src/
│   │   ├── auth.ts             # Auth-related functions
│   │   ├── triggers.ts         # Firestore triggers
│   │   ├── notifications.ts    # Notification handlers
│   │   └── analytics.ts        # Analytics & risk assessment
├── firestore.rules            # Database security rules
├── storage.rules              # Storage security rules
└── firebase.json              # Firebase project configuration
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with enabled services

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/investbridge.git
cd investbridge
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 3. Firebase Setup

#### Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable the following services:
   - **Authentication** (Email/Password provider)
   - **Firestore Database**
   - **Storage**
   - **Cloud Functions**
   - **Cloud Messaging**

#### Get Firebase Configuration

1. In Project Settings → General → Web apps
2. Create a new web app or select existing
3. Copy the Firebase config object

#### Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your Firebase configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

#### Initialize Firebase

```bash
# Login to Firebase
firebase login

# Initialize project (if not already done)
firebase init

# Select the following features:
# ✓ Firestore: Configure security rules and indexes
# ✓ Functions: Configure a Cloud Functions directory
# ✓ Hosting: Configure files for Firebase Hosting
# ��� Storage: Configure a security rules file for Cloud Storage
# ✓ Emulators: Set up local emulators
```

### 4. Deploy Firestore Rules and Indexes

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy storage rules
firebase deploy --only storage

# Deploy indexes
firebase deploy --only firestore:indexes
```

### 5. Deploy Cloud Functions

```bash
# Build and deploy functions
npm run build:server
firebase deploy --only functions
```

### 6. Start Development

#### Option A: With Firebase Emulators (Recommended)

```bash
# Start emulators
firebase emulators:start

# In another terminal, start frontend
npm run dev
```

#### Option B: Against Live Firebase

```bash
# Start frontend only
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) to see the application.

## 🔧 Development Guide

### Firebase Emulators

The project is configured to use Firebase emulators for local development:

- **Authentication**: http://localhost:9099
- **Firestore**: http://localhost:8080
- **Functions**: http://localhost:5001
- **Storage**: http://localhost:9199
- **Emulator UI**: http://localhost:4000

### Adding New Features

#### 1. Database Operations

```typescript
// Use existing services in client/lib/firestore.ts
import { businessIdeasService } from "@/lib/firestore";

// Create new business idea
const ideaId = await businessIdeasService.create({
  title: "My Startup Idea",
  category: "Technology",
  description: "Revolutionary AI platform...",
  // ...
});
```

#### 2. Authentication & Authorization

```typescript
// Check user role
import { useRole, useHasRole } from "@/lib/AuthContext";

const userRole = useRole();
const isInvestor = useHasRole("investor");
```

#### 3. Real-time Notifications

```typescript
// Send notification via Cloud Function
import { createNotification } from "@/lib/messaging";

await createNotification(
  userId,
  "New Business Proposal",
  "Check out this exciting opportunity!",
  "NEW_BUSINESS_PROPOSAL",
);
```

#### 4. Cloud Functions

```typescript
// Add new trigger in functions/src/triggers.ts
export const onNewEvent = functions.firestore
  .document("events/{eventId}")
  .onCreate(async (snap, context) => {
    // Handle new event creation
  });
```

### Security Rules Development

#### Firestore Rules Testing

```bash
# Test rules locally
firebase emulators:start --only firestore
npm run test:rules
```

#### Storage Rules Testing

```bash
# Test storage rules
firebase emulators:start --only storage
# Upload test files through the UI
```

## 🚀 Deployment

### Production Build

```bash
# Build frontend
npm run build

# Build functions
cd functions
npm run build
cd ..
```

### Deploy to Firebase

```bash
# Deploy everything
firebase deploy

# Or deploy specific services
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### Environment-Specific Deployments

```bash
# Deploy to staging
firebase use staging
firebase deploy

# Deploy to production
firebase use production
firebase deploy
```

## 📊 Data Schema

### Users Collection

```typescript
{
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'business_person' | 'investor' | 'banker' | 'business_advisor';
  photoURL?: string;
  profile?: {
    company?: string;
    location?: string;
    bio?: string;
    expertise?: string[];
    experience?: number;
    investmentRange?: { min: number; max: number };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Business Ideas Collection

```typescript
{
  id: string;
  userId: string;
  title: string;
  category: string;
  description: string;
  budget: string;
  timeline: string;
  status: 'draft' | 'published' | 'funded' | 'closed';
  views: number;
  interested: number;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Investment Proposals Collection

```typescript
{
  id: string;
  investorId: string;
  businessIdeaId: string;
  amount: number;
  terms: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## 🔒 Security

### Authentication

- Firebase Authentication with email/password
- Custom claims for role-based access control
- Secure session management

### Database Security

- Comprehensive Firestore security rules
- Role-based read/write permissions
- Data validation in Cloud Functions

### File Security

- Storage security rules for file uploads
- User-specific access controls
- Virus scanning via Firebase Extensions

## 📈 Analytics & Monitoring

### Built-in Analytics

- User registration and activity tracking
- Business proposal performance metrics
- Investment success rates
- Platform usage statistics

### Error Monitoring

- Cloud Functions error logging
- Frontend error tracking
- Real-time performance monitoring

### Custom Metrics

- Risk assessment accuracy
- User engagement scores
- ROI tracking for investors

## 🧪 Testing

### Unit Tests

```bash
# Run frontend tests
npm test

# Run function tests
cd functions
npm test
```

### Integration Tests

```bash
# Test with emulators
firebase emulators:start
npm run test:integration
```

### Security Rules Tests

```bash
# Test Firestore rules
npm run test:firestore-rules

# Test Storage rules
npm run test:storage-rules
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Ensure security rules are updated
- Test with Firebase emulators

## 📚 API Documentation

### Cloud Functions Endpoints

#### Authentication

- `setUserRole(uid, role)` - Set user role with custom claims
- `verifyUserEmail(email)` - Send email verification

#### Notifications

- `sendNotification(userId, title, body, type, data)` - Send individual notification
- `sendBulkNotifications(userIds, title, body, type, data)` - Send bulk notifications

#### Analytics

- `generateRiskAssessment(businessIdeaId)` - Generate risk assessment
- `updatePortfolioMetrics(investorId)` - Update investor portfolio
- `getPlatformAnalytics()` - Get platform-wide analytics (admin only)

## 🐛 Troubleshooting

### Common Issues

#### Firebase Connection

```bash
# Check Firebase project
firebase projects:list

# Switch project
firebase use your-project-id
```

#### Emulator Issues

```bash
# Clear emulator data
firebase emulators:start --import=./emulator-data --export-on-exit

# Reset emulators
rm -rf ./emulator-data
firebase emulators:start
```

#### Authentication Issues

- Verify Firebase Auth is enabled
- Check custom claims are set correctly
- Ensure security rules allow access

#### Build Issues

```bash
# Clear cache
npm run build:clean
rm -rf node_modules package-lock.json
npm install
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [ ] **Phase 1**: Core MVP features ✅
- [ ] **Phase 2**: Advanced analytics and AI recommendations
- [ ] **Phase 3**: Mobile app development
- [ ] **Phase 4**: Blockchain integration for transparent investments
- [ ] **Phase 5**: International expansion and multi-currency support

## 📞 Support

For support and questions:

- 📧 Email: darshanthakkar782@gmail.com
- 💬 Discord: [Join our community](https://discord.gg/investbridge)
- 📖 Documentation: [docs.investbridge.com](https://docs.investbridge.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/investbridge/issues)

---

**Built with ❤️ by the Darshan Thakkar**
