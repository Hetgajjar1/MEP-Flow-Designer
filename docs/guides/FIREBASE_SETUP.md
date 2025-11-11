# Firebase Setup Guide

## Prerequisites

### Required Software
- **Node.js** 18+ (20 recommended for Cloud Functions)
- **Java** 17+ (required for Firestore, Functions, Storage emulators)
- **Git** (for version control)
- **Firebase CLI** 12+

### Installation Commands (Windows PowerShell)

```powershell
# Check Node.js version
node -v

# Check Java version
java -version

# Install Firebase CLI globally
npm install -g firebase-tools

# Verify Firebase CLI installation
firebase --version

# Login to Firebase
firebase login
```

---

## Project Initialization

### 1. Create Firebase Project (Console)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add Project**
3. Enter project name: `flowforge-mep-designer` (or your choice)
4. Disable Google Analytics (optional for this project)
5. Click **Create Project**

### 2. Enable Firebase Services

#### Authentication
1. Navigate to **Build** → **Authentication**
2. Click **Get Started**
3. Enable **Email/Password** provider
4. (Optional) Enable **Google** for future OAuth support

#### Firestore Database
1. Navigate to **Build** → **Firestore Database**
2. Click **Create Database**
3. Select **Production Mode** (rules will be deployed from code)
4. Choose location (e.g., `us-central1`)

#### Cloud Storage
1. Navigate to **Build** → **Storage**
2. Click **Get Started**
3. Select **Production Mode**
4. Use default bucket or create custom bucket

#### Cloud Functions
1. Navigate to **Build** → **Functions**
2. Upgrade to **Blaze** (pay-as-you-go) plan if needed
3. Functions will be deployed via CLI (no console setup required)

### 3. Initialize Firebase in Local Project

```powershell
# Navigate to project directory
cd C:\Users\hetga\MEP-Flow-Designer

# Initialize Firebase (if not already done)
firebase init

# Select services:
#  - Firestore
#  - Functions
#  - Hosting
#  - Storage
#  - Emulators

# Follow prompts:
#  - Use existing project: flowforge-mep-designer
#  - Firestore rules: firestore.rules
#  - Firestore indexes: firestore.indexes.json
#  - Functions language: JavaScript
#  - ESLint: No (or Yes, your choice)
#  - Install dependencies: Yes
#  - Hosting public directory: public
#  - Single-page app: Yes
#  - Automatic builds with GitHub: No
#  - Storage rules: storage.rules
#  - Emulators to set up: Auth, Functions, Firestore, Storage, Hosting
```

---

## Configuration Files

### firebase.json

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "ignore": [
        "node_modules",
        ".git",
        "firebase-debug.log",
        "firebase-debug.*.log"
      ]
    }
  ],
  "hosting": {
    "public": "public",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "storage": {
    "rules": "storage.rules"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "hosting": {
      "port": 5000
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "port": 4000
    },
    "singleProjectMode": true
  }
}
```

### functions/package.json

```json
{
  "name": "functions",
  "description": "Cloud Functions for MEP Flow Designer",
  "scripts": {
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "20"
  },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0"
  },
  "devDependencies": {
    "firebase-functions-test": "^3.1.0"
  },
  "private": true
}
```

### .firebaserc

```json
{
  "projects": {
    "default": "flowforge-mep-designer"
  }
}
```

---

## Environment Setup

### Development Environment Variables

Create `.env` file (not committed to Git):

```env
# Firebase Project Configuration
FIREBASE_PROJECT_ID=flowforge-mep-designer
FIREBASE_API_KEY=your-api-key-here
FIREBASE_AUTH_DOMAIN=flowforge-mep-designer.firebaseapp.com
FIREBASE_STORAGE_BUCKET=flowforge-mep-designer.firebasestorage.app

# Emulator Ports (Development Only)
AUTH_EMULATOR_PORT=9099
FIRESTORE_EMULATOR_PORT=8080
FUNCTIONS_EMULATOR_PORT=5001
STORAGE_EMULATOR_PORT=9199
HOSTING_EMULATOR_PORT=5000
```

**Note**: For security, never commit `.env` to version control. Add to `.gitignore`.

### Emulator Configuration

The emulators automatically detect when running on localhost and connect to local emulator instances. No additional configuration needed in `public/js/firebase-config.js` if using the existing setup.

---

## Firebase Console Configuration

### Get Firebase Config

1. Go to Firebase Console
2. Click **Project Settings** (gear icon)
3. Scroll to **Your apps** → **Web apps**
4. Click **Add app** (if no web app exists)
5. Register app with nickname: "MEP Flow Designer Web"
6. Copy the `firebaseConfig` object

### Update firebase-config.js

Replace the placeholder values in `public/js/firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "flowforge-mep-designer.firebaseapp.com",
    projectId: "flowforge-mep-designer",
    storageBucket: "flowforge-mep-designer.firebasestorage.app",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

**Development Note**: The current placeholder values work with emulators. Update only for production deployment.

---

## Security Rules Deployment

### Firestore Rules

Deploy rules from `firestore.rules`:

```powershell
firebase deploy --only firestore:rules
```

Verify rules in Firebase Console → Firestore Database → Rules tab.

### Storage Rules

Deploy rules from `storage.rules`:

```powershell
firebase deploy --only storage:rules
```

Verify rules in Firebase Console → Storage → Rules tab.

---

## Cloud Functions Deployment

### Install Dependencies

```powershell
cd functions
npm install
cd ..
```

### Deploy Functions

```powershell
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:createProject
```

### View Function Logs

```powershell
# Real-time logs
firebase functions:log

# Filter by function name
firebase functions:log --only createProject
```

---

## Hosting Deployment

### Build (if using build step)

Currently, the project uses vanilla JavaScript with no build step. If you add a bundler in the future:

```powershell
npm run build
```

### Deploy to Firebase Hosting

```powershell
firebase deploy --only hosting
```

Your app will be live at: `https://flowforge-mep-designer.web.app`

---

## Firestore Indexes

### Composite Indexes

For queries like `projects.where('createdBy', '==', uid).orderBy('createdAt', 'desc')`, create indexes:

**firestore.indexes.json**:

```json
{
  "indexes": [
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "createdBy",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ]
}
```

Deploy indexes:

```powershell
firebase deploy --only firestore:indexes
```

---

## Testing Production Setup

### 1. Deploy All Services

```powershell
firebase deploy
```

### 2. Open Production URL

```
https://flowforge-mep-designer.web.app
```

### 3. Verify Services

- **Auth**: Sign up a test user
- **Firestore**: Create a project
- **Functions**: Run calculations (check Functions logs in Console)
- **Storage**: Upload a file

### 4. Monitor Console

- Firebase Console → Usage & Billing
- Functions → Logs
- Firestore → Data
- Storage → Files

---

## Billing & Quotas

### Free Tier Limits (Spark Plan)

- **Authentication**: 50,000 monthly active users
- **Firestore**: 50K reads, 20K writes, 20K deletes per day
- **Functions**: 125K invocations, 40K GB-seconds, 40K CPU-seconds per month
- **Storage**: 5 GB total storage, 1 GB daily downloads
- **Hosting**: 10 GB storage, 360 MB/day bandwidth

### Blaze Plan (Pay-as-you-go)

Required for:
- Cloud Functions (production)
- Higher quotas

Pricing:
- **Functions**: $0.40 per million invocations + compute time
- **Firestore**: $0.06 per 100K reads, $0.18 per 100K writes
- **Storage**: $0.026 per GB/month

**Recommendation**: Start with Spark (free) for development; upgrade to Blaze when ready for production.

---

## Security Checklist

Before deploying to production:

- [ ] Replace placeholder `apiKey` in `firebase-config.js` with real values
- [ ] Deploy Firestore rules (`firebase deploy --only firestore:rules`)
- [ ] Deploy Storage rules (`firebase deploy --only storage:rules`)
- [ ] Enable Firebase App Check (protects against abuse)
- [ ] Set up billing alerts in GCP Console
- [ ] Review IAM permissions for service accounts
- [ ] Enable HTTPS-only in Hosting (default)
- [ ] Add CSP headers for XSS protection
- [ ] Test role-based access control with real users
- [ ] Set up Cloud Function retry policies

---

## Troubleshooting

### Issue: Emulators Won't Start

**Error**: `Error: Could not start Firestore Emulator, port taken.`

**Fix**:
```powershell
# Kill process on port 8080 (Firestore)
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Or use different ports in firebase.json
```

### Issue: Java Not Found

**Error**: `Error: Java 11 or higher is required.`

**Fix**:
```powershell
# Install Java 17 from Adoptium/Temurin
# https://adoptium.net/temurin/releases/

# Verify installation
java -version
```

### Issue: Functions Not Deploying

**Error**: `HTTP Error: 403, The caller does not have permission`

**Fix**:
```powershell
# Re-authenticate
firebase login --reauth

# Ensure Blaze plan is enabled
firebase projects:list
```

### Issue: CORS Errors in Production

**Error**: `Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy`

**Fix**: Callable functions handle CORS automatically. If using HTTP functions, add CORS middleware:

```javascript
const cors = require('cors')({ origin: true });

exports.myFunction = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    // Your function logic
  });
});
```

---

## Next Steps

1. Complete local development with emulators
2. Deploy Firestore/Storage rules to production
3. Deploy Cloud Functions
4. Deploy Hosting
5. Test production environment
6. Set up monitoring and alerts
7. Configure backup policies for Firestore

See [DEVELOPMENT.md](./guides/DEVELOPMENT.md) for development workflow details.
