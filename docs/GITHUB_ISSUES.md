# GitHub Issues — MEP Flow Designer Product Roadmap

**How to Use This File:**

1. Copy each issue template
2. Go to GitHub → MEP-Flow-Designer → Issues → New Issue
3. Paste the content and adjust as needed
4. Link to this roadmap in the description

---

## 🏷️ Phase 0: FOUNDATION

### Issue: Phase 0 Epic — Foundation & Setup

```
Title: [EPIC] Phase 0: Foundation — Setup + Validation

Description:
This is the umbrella issue for Phase 0 (Foundation). All Phase 0 tasks should be subtasks of this epic.

**Goal:** Make sure all tools, structure, and accounts are ready before building anything.

**Expected Duration:** 1-2 weeks
**Priority:** 🔴 CRITICAL

**Acceptance Criteria:**
- [ ] Firebase project created and connected
- [ ] Local dev environment stable (Node, npm, Firebase CLI)
- [ ] Git repo initialized with multiple commits
- [ ] React app running locally
- [ ] Dark theme applied
- [ ] Login component integrated and tested
- [ ] All team members can pull and run code

**Blockers:**
- [ ] Firebase Blaze plan upgrade (needed for Phase 1+)

**Related Links:**
- Product Roadmap: PRODUCT_ROADMAP.md
- Setup Guide: docs/guides/FIREBASE_SETUP.md
- Dev Guide: docs/guides/DEVELOPMENT.md

Labels: epic, phase-0, setup, critical
Assignee: @Hetgajjar1
```

### Issue: Phase 0 Task 1 — Firebase Project Setup

```
Title: [Phase 0] Task 1: Firebase Project Setup

Description:
Set up Firebase project with all required services and test environment.

**Tasks:**
- [ ] Create Firebase project `flowforge-mep-designer`
- [ ] Enable Firestore database
- [ ] Enable Firebase Authentication (Email/Password + Google)
- [ ] Enable Cloud Storage (for DWG/PDF uploads)
- [ ] Enable Cloud Functions runtime (Node.js)
- [ ] Set up test environment with emulators
- [ ] Document project ID and settings in README

**Expected Duration:** 2-3 hours
**Priority:** 🔴 CRITICAL

**Acceptance Criteria:**
- ✅ Firebase Console shows all services enabled
- ✅ Local dev can connect to Firebase
- ✅ Emulators run without errors
- ✅ Project ID documented in code comments

**Related:**
- Parent Epic: #1 (Phase 0 Epic)
- Firebase Setup Guide: docs/guides/FIREBASE_SETUP.md

Labels: phase-0, firebase, setup
Assignee: @Hetgajjar1
```

### Issue: Phase 0 Task 2 — Local Dev Environment

```
Title: [Phase 0] Task 2: Local Dev Environment Setup

Description:
Set up all tools needed for local development.

**Tasks:**
- [ ] Install VS Code
- [ ] Install Node.js v20+
- [ ] Install npm/yarn
- [ ] Install Firebase CLI globally
- [ ] Login to Firebase CLI
- [ ] Initialize Firebase in project
- [ ] Document environment setup in DEVELOPMENT.md

**Expected Duration:** 1 hour
**Priority:** 🔴 CRITICAL

**Acceptance Criteria:**
- ✅ `node --version` shows v20+
- ✅ `npm --version` works
- ✅ `firebase --version` works
- ✅ All team members have identical setup

**Related:**
- Parent Epic: #1 (Phase 0 Epic)
- Dev Guide: docs/guides/DEVELOPMENT.md

Labels: phase-0, setup, environment
Assignee: @Hetgajjar1
```

### Issue: Phase 0 Task 3 — Git Repository & Version Control

```
Title: [Phase 0] Task 3: Git Repository & Version Control Setup

Description:
Initialize Git repository and establish branching/collaboration workflow.

**Tasks:**
- [ ] Initialize local Git repo
- [ ] Create GitHub repo (public or private)
- [ ] Create .gitignore (node_modules, .env, build/)
- [ ] Set up main branch protection rules
- [ ] Create feature branch naming convention (feature/*, bugfix/*, hotfix/*)
- [ ] First commit: project structure
- [ ] Document Git workflow in DEVELOPMENT.md

**Expected Duration:** 1-2 hours
**Priority:** 🔴 CRITICAL

**Acceptance Criteria:**
- ✅ GitHub repo exists and is accessible
- ✅ .gitignore excludes build artifacts
- ✅ Branch protection configured
- ✅ At least 3 commits on main

**Related:**
- Parent Epic: #1 (Phase 0 Epic)
- GitHub Repo: https://github.com/Hetgajjar1/MEP-Flow-Designer

Labels: phase-0, git, setup
Assignee: @Hetgajjar1
```

### Issue: Phase 0 Task 4 — Project Folder Structure

```
Title: [Phase 0] Task 4: Create Project Folder Structure

Description:
Organize project folders for frontend, backend, and models.

**Expected Structure:**
```

mep-flow-designer/
├── react-app/ # Frontend (React + TypeScript)
│ ├── src/
│ │ ├── components/ # React components
│ │ ├── lib/ # Utilities and configs
│ │ ├── types/ # TypeScript types
│ │ └── App.tsx
│ └── package.json
├── functions/ # Backend (Cloud Functions)
│ ├── src/
│ ├── index.js
│ └── package.json
├── docs/ # Documentation
│ ├── ARCHITECTURE.md
│ ├── ROADMAP.md
│ └── guides/
│ ├── FIREBASE_SETUP.md
│ └── DEVELOPMENT.md
├── firebase.json # Firebase config
└── README.md

```

**Tasks:**
- [ ] Create folder structure
- [ ] Add README to each folder
- [ ] Document folder purposes
- [ ] Create sample files (index.js, App.tsx)

**Expected Duration:** 1 hour
**Priority:** 🔴 CRITICAL

**Acceptance Criteria:**
- ✅ Folder structure matches above
- ✅ Each folder has README explaining purpose
- ✅ All files committed to git

**Related:**
- Parent Epic: #1 (Phase 0 Epic)

Labels: phase-0, structure, documentation
Assignee: @Hetgajjar1
```

### Issue: Phase 0 Task 5 — Confirm Everything Works

```
Title: [Phase 0] Task 5: Integration Test & Confirmation

Description:
End-to-end test to confirm all Phase 0 tools work together.

**Tasks:**
- [ ] Run React dev server locally
- [ ] Test Firebase connection from app
- [ ] Test Authentication (sign up, login, logout)
- [ ] Test file upload to Firebase Storage
- [ ] Test Firestore read/write
- [ ] All team members test their setup
- [ ] Document any issues in GitHub Issues

**Expected Duration:** 2 hours
**Priority:** 🔴 CRITICAL

**Acceptance Criteria:**
- ✅ Dev server runs at http://localhost:5173
- ✅ Firebase connection logs show "Connected"
- ✅ Auth flows work without errors
- ✅ No console errors
- ✅ Team can sync code and run locally

**Related:**
- Parent Epic: #1 (Phase 0 Epic)

Labels: phase-0, testing, integration
Assignee: @Hetgajjar1
```

---

## 🏷️ Phase 1: CORE BACKEND MODEL

### Issue: Phase 1 Epic — Core Backend Model

```
Title: [EPIC] Phase 1: Core Backend Model — Project Data Setup

Description:
This is the umbrella issue for Phase 1 (Core Backend Model). All Phase 1 tasks should be subtasks of this epic.

**Goal:** Build a reliable structure for storing projects, drawings, and MEP parameters using Firestore.

**Expected Duration:** 2-3 weeks
**Priority:** 🔴 CRITICAL

**Acceptance Criteria:**
- [ ] Firestore schema designed and documented
- [ ] CRUD operations (Create, Read, Update, Delete) fully functional
- [ ] User authentication with role-based access working
- [ ] File upload/download to Firebase Storage working
- [ ] All operations tested with sample data
- [ ] Code deployed to Firebase

**Blockers:**
- [ ] Firebase Blaze plan (required for Cloud Functions in later phases)

**Related:**
- Product Roadmap: PRODUCT_ROADMAP.md
- Phase 0 Epic: #1

Labels: epic, phase-1, backend, critical
Assignee: @Hetgajjar1
```

### Issue: Phase 1 Task 1 — Design Firestore Data Model

````
Title: [Phase 1] Task 1: Design Firestore Data Model

Description:
Design and document the Firestore schema for projects, users, and MEP data.

**Data Model:**
```json
users/{uid}
├── email
├── displayName
├── role (engineer, reviewer, admin)
├── createdAt
└── profile (optional)

projects/{projectId}
├── name
├── description
├── owner (uid reference)
├── type (commercial, residential, industrial)
├── status (draft, in-review, approved)
├── createdAt
├── lastModified
├── files[] (array of file objects)
├── mep (object with plumbing, hvac, electrical, fire data)
└── calculations (reference to calculation results)

calculations/{calcId}
├── projectId (reference)
├── type (plumbing, hvac, electrical, fire)
├── inputs (calculation parameters)
├── results (calculation outputs)
├── createdAt
└── createdBy (uid)
````

**Tasks:**

- [ ] Document schema in docs/ARCHITECTURE.md
- [ ] Create Firestore Security Rules
- [ ] Design indexes (for common queries)
- [ ] Create sample data for testing

**Expected Duration:** 4-6 hours  
**Priority:** 🔴 CRITICAL

**Acceptance Criteria:**

- ✅ Schema documented and reviewed
- ✅ Security rules prevent unauthorized access
- ✅ Indexes optimize common queries
- ✅ Sample data created in Firestore

**Related:**

- Parent Epic: #7 (Phase 1 Epic)
- Architecture: docs/ARCHITECTURE.md

Labels: phase-1, firestore, schema, design
Assignee: @Hetgajjar1

```

### Issue: Phase 1 Task 2 — Implement Firestore CRUD
```

Title: [Phase 1] Task 2: Implement Firestore CRUD Operations

Description:
Create, Read, Update, Delete operations for projects in Firestore.

**Tasks:**

- [ ] Create project endpoint (backend function)
- [ ] Read project list endpoint
- [ ] Read single project endpoint
- [ ] Update project endpoint
- [ ] Delete project endpoint
- [ ] Add input validation for all operations
- [ ] Add error handling
- [ ] Write unit tests

**Expected Duration:** 2-3 days  
**Priority:** 🔴 CRITICAL

**Acceptance Criteria:**

- ✅ All CRUD operations work without errors
- ✅ Input validation prevents bad data
- ✅ Error messages are clear and actionable
- ✅ All endpoints tested (manual + unit tests)
- ✅ No security vulnerabilities

**Example API:**

```
POST   /projects              # Create
GET    /projects              # List
GET    /projects/:id          # Read
PUT    /projects/:id          # Update
DELETE /projects/:id          # Delete
```

**Related:**

- Parent Epic: #7 (Phase 1 Epic)

Labels: phase-1, backend, crud, api
Assignee: @Hetgajjar1

```

### Issue: Phase 1 Task 3 — User Authentication & Roles
```

Title: [Phase 1] Task 3: User Authentication & Role-Based Access

Description:
Set up Firebase Authentication with role-based access control (RBAC).

**Tasks:**

- [ ] Test Firebase Email/Password auth
- [ ] Add Google Sign-In (optional)
- [ ] Create user profile in Firestore on signup
- [ ] Implement role assignment (engineer, reviewer, admin)
- [ ] Create middleware to enforce role-based access
- [ ] Add permission checks to CRUD endpoints
- [ ] Test with multiple users and roles

**Expected Duration:** 2-3 days  
**Priority:** 🔴 CRITICAL

**Acceptance Criteria:**

- ✅ Sign up creates user in Firebase Auth + Firestore
- ✅ Login works with email/password
- ✅ Roles assigned correctly
- ✅ Endpoints check permissions before executing
- ✅ Unauthorized access returns 403
- ✅ User can only access their own data (by default)

**Roles:**

- **Engineer:** Create, read, update own projects
- **Reviewer:** Read, comment on projects
- **Admin:** Full access to all projects and users

**Related:**

- Parent Epic: #7 (Phase 1 Epic)

Labels: phase-1, auth, security, rbac
Assignee: @Hetgajjar1

```

### Issue: Phase 1 Task 4 — Firebase Storage Integration
```

Title: [Phase 1] Task 4: Firebase Storage Integration (File Upload/Download)

Description:
Implement file upload to Firebase Storage and track metadata in Firestore.

**Tasks:**

- [ ] Create upload endpoint (DWG, PDF, images)
- [ ] Store file in Firebase Storage
- [ ] Save file metadata in Firestore
- [ ] Generate download URL
- [ ] Create download endpoint
- [ ] Implement file deletion
- [ ] Add file size validation
- [ ] Test with sample files

**Expected Duration:** 2-3 days  
**Priority:** 🔴 CRITICAL

**Acceptance Criteria:**

- ✅ Files upload without errors
- ✅ Metadata saved to Firestore
- ✅ Download links work
- ✅ File size validated (<100 MB)
- ✅ Only owner can access their files
- ✅ Deletion removes both file and metadata

**File Metadata Schema:**

```json
{
  "fileName": "Floor_Plan_L1.dwg",
  "fileType": "dwg",
  "fileSize": 2097152,
  "fileUrl": "gs://bucket/path/to/file",
  "downloadUrl": "https://firebaseStorage...",
  "uploadedAt": "2025-11-11T00:00:00Z",
  "uploadedBy": "uid_user"
}
```

**Related:**

- Parent Epic: #7 (Phase 1 Epic)

Labels: phase-1, storage, file-upload, backend
Assignee: @Hetgajjar1

```

---

## 🏷️ Phase 2: FRONTEND APP

### Issue: Phase 2 Epic — Frontend App (Electron)
```

Title: [EPIC] Phase 2: Frontend App — Desktop Electron Interface

Description:
This is the umbrella issue for Phase 2 (Frontend App). Build a desktop application with Electron for 2D MEP design.

**Goal:** Create a simple 2D MEP design interface with file upload and project management.

**Expected Duration:** 2-3 weeks  
**Priority:** 🟡 HIGH

**Acceptance Criteria:**

- [ ] Electron app runs on Windows/Mac/Linux
- [ ] Project list loaded from Firestore
- [ ] File upload working
- [ ] 2D preview displayed
- [ ] Sidebar navigation functional
- [ ] Responsive UI

**Related:**

- Product Roadmap: PRODUCT_ROADMAP.md
- Phase 1 Epic: #7

Labels: epic, phase-2, frontend, electron
Assignee: @Hetgajjar1

```

---

## 🏷️ Phase 3: MEP CALCULATION ENGINE

### Issue: Phase 3 Epic — MEP Calculation Engine
```

Title: [EPIC] Phase 3: MEP Calculation Engine — Engineering Calculations

Description:
This is the umbrella issue for Phase 3 (MEP Calculation Engine). Implement all MEP calculations.

**Goal:** Provide engineering-grade calculations for Plumbing, HVAC, Electrical, and Fire Protection systems.

**Expected Duration:** 3-4 weeks  
**Priority:** 🔴 CRITICAL

**Acceptance Criteria:**

- [ ] Plumbing calculations accurate (±5%)
- [ ] HVAC calculations accurate (±5%)
- [ ] Electrical calculations accurate (±5%)
- [ ] Fire Protection calculations accurate (±5%)
- [ ] All results saved to Firestore
- [ ] Results displayed in UI
- [ ] Calculation history tracked

**Standards Used:**

- IPC (International Plumbing Code)
- NEC (National Electrical Code)
- ASHRAE (Heating, Ventilation, Air Conditioning)
- NFPA (Fire Protection)

**Related:**

- Product Roadmap: PRODUCT_ROADMAP.md
- Phase 2 Epic: #17

Labels: epic, phase-3, calculations, critical
Assignee: @Hetgajjar1

```

---

## 🏷️ Phase 4: REPORTS + EXPORTS

### Issue: Phase 4 Epic — Reports & Exports
```

Title: [EPIC] Phase 4: Reports & Exports — Professional Deliverables

Description:
This is the umbrella issue for Phase 4 (Reports & Exports). Generate professional reports and exports.

**Goal:** Generate PDF/Excel reports with calculation results and enable automated distribution.

**Expected Duration:** 2-3 weeks  
**Priority:** 🟡 HIGH

**Acceptance Criteria:**

- [ ] PDF reports generated successfully
- [ ] Excel reports generated successfully
- [ ] Reports include all calculation results
- [ ] Reports uploaded to Firebase Storage
- [ ] Email notifications sent
- [ ] Compliance checks performed

**Related:**

- Product Roadmap: PRODUCT_ROADMAP.md
- Phase 3 Epic: #23

Labels: epic, phase-4, reports, exports
Assignee: @Hetgajjar1

```

---

## 🏷️ Phase 5: AI & CLOUD UPGRADE

### Issue: Phase 5 Epic — AI & Cloud Upgrade
```

Title: [EPIC] Phase 5: AI & Cloud Upgrade — Intelligence & Collaboration

Description:
This is the umbrella issue for Phase 5 (AI & Cloud Upgrade). Add AI capabilities and real-time collaboration.

**Goal:** Enhance with AI-powered element detection and real-time multi-user collaboration.

**Expected Duration:** 3-4 weeks  
**Priority:** 🟢 LOW (Future Enhancement)

**Acceptance Criteria:**

- [ ] AI detects MEP elements in drawings
- [ ] Multi-user real-time editing works
- [ ] Heavy computation moved to Cloud Run
- [ ] Analytics dashboard functional

**Related:**

- Product Roadmap: PRODUCT_ROADMAP.md
- Phase 4 Epic: #29

Labels: epic, phase-5, ai, cloud, future
Assignee: @Hetgajjar1

```

---

## 🏷️ Phase 6: QA & LAUNCH

### Issue: Phase 6 Epic — QA & Launch
```

Title: [EPIC] Phase 6: QA & Launch — Testing & Release

Description:
This is the umbrella issue for Phase 6 (QA & Launch). Complete testing and release the product.

**Goal:** Ensure product quality and release to users.

**Expected Duration:** 2-3 weeks  
**Priority:** 🔴 CRITICAL

**Acceptance Criteria:**

- [ ] All tests pass
- [ ] User testing completed
- [ ] No critical bugs
- [ ] Documentation complete
- [ ] v1.0.0 released
- [ ] CI/CD pipeline working

**Related:**

- Product Roadmap: PRODUCT_ROADMAP.md
- Phase 5 Epic: #35

Labels: epic, phase-6, qa, launch, critical
Assignee: @Hetgajjar1

````

---

## 📋 How to Import These Issues

**Option 1: Manual (One at a time)**
1. Go to GitHub → Issues → New Issue
2. Copy issue title and description
3. Click "Create"
4. Repeat

**Option 2: GitHub API (Bulk Import)**
```bash
# Use GitHub CLI to bulk create issues
gh issue create --title "Issue Title" --body "Issue description" --label "label1,label2"
````

**Option 3: CSV Import (if GitHub supports it in your workspace)**
Export this as CSV and import to GitHub.

---

**Last Updated:** November 11, 2025  
**Total Issues:** 18  
**Total Epic Tasks:** 6 Epic + 12 Subtasks
