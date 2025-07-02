#!/bin/bash

# InvestBridge Firebase Setup Script
# This script helps set up Firebase for the first time

set -e

echo "🚀 Setting up InvestBridge with Firebase..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
else
    echo "✅ Firebase CLI found"
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please log in to Firebase..."
    firebase login
else
    echo "✅ Already logged in to Firebase"
fi

# List available projects
echo "📋 Available Firebase projects:"
firebase projects:list

# Prompt for project selection
echo ""
read -p "Enter your Firebase project ID: " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Project ID cannot be empty"
    exit 1
fi

# Set Firebase project
echo "🔧 Setting Firebase project to: $PROJECT_ID"
firebase use $PROJECT_ID

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please update .env with your Firebase configuration"
    echo "   You can find these values in Firebase Console → Project Settings → General"
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Install Cloud Functions dependencies
echo "📦 Installing Cloud Functions dependencies..."
cd functions
npm install
cd ..

# Deploy Firestore rules and indexes
echo "🛡️  Deploying Firestore security rules..."
firebase deploy --only firestore:rules

echo "📊 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

echo "🗄️  Deploying Storage rules..."
firebase deploy --only storage

# Deploy Cloud Functions
echo "⚡ Building and deploying Cloud Functions..."
cd functions
npm run build
cd ..
firebase deploy --only functions

echo ""
echo "🎉 Firebase setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with Firebase configuration"
echo "2. Enable Authentication providers in Firebase Console"
echo "3. Configure Cloud Messaging VAPID keys"
echo "4. Run 'npm run start:emulators' for local development"
echo "5. Run 'npm run dev' to start the development server"
echo ""
echo "📚 Documentation: README.md"
echo "🎯 Dashboard: http://localhost:5173"
echo "🔧 Emulator UI: http://localhost:4000"
