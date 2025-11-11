# 🏗️ MEP Flow Designer — Product Roadmap

**Project:** MEP Flow Designer (Building Information Modeling & Engineering Calculations)  
**Owner:** Hetgajjar1  
**Created:** November 11, 2025  
**Status:** Phase 0 (Foundation) — In Progress

---

## 📊 Timeline Overview

```
Phase 0: FOUNDATION          [████████░░░░░░░░░░░░░░░░] 1-2 weeks
├─ Setup + Validation
├─ Firebase + Local Dev
└─ Git + Folder Structure

Phase 1: CORE BACKEND        [░░░░░░░░░░░░░░░░░░░░░░░░░░] 2-3 weeks
├─ Firestore Data Model
├─ CRUD Operations
└─ Auth + File Upload

Phase 2: FRONTEND APP        [░░░░░░░░░░░░░░░░░░░░░░░░░░] 2-3 weeks
├─ Electron + React UI
├─ Project List View
└─ File Upload Interface

Phase 3: MEP ENGINE          [░░░░░░░░░░░░░░░░░░░░░░░░░░] 3-4 weeks
├─ Plumbing Calculations
├─ HVAC Calculations
├─ Electrical Calculations
└─ Results Storage

Phase 4: REPORTS + EXPORTS   [░░░░░░░░░░░░░░░░░░░░░░░░░░] 2-3 weeks
├─ PDF/Excel Generation
├─ Cloud Functions Automation
└─ Code Compliance Checks

Phase 5: AI + CLOUD UPGRADE  [░░░░░░░░░░░░░░░░░░░░░░░░░░] 3-4 weeks
├─ AI Element Detection
├─ Real-time Collaboration
└─ Cloud Run Migration

Phase 6: QA + LAUNCH         [░░░░░░░░░░░░░░░░░░░░░░░░░░] 2-3 weeks
├─ CI/CD Pipeline
├─ Testing & QA
└─ Release & Documentation

TOTAL ESTIMATED: 15-22 weeks (~4-5 months)
```

---

## 🧩 PHASE 0 — FOUNDATION (Setup + Validation)

**Duration:** 1-2 weeks  
**Priority:** 🔴 CRITICAL  
**Goal:** Make sure all tools, structure, and accounts are ready before building anything.

### ✅ Tasks:

#### 1. Firebase Project Setup

- [ ] Go to Firebase Console → create project `flowforge-mep-designer` ✅ DONE
- [ ] Enable Firestore ✅ DONE
- [ ] Enable Authentication (Email/Password + Google) ✅ DONE (Email/Password)
- [ ] Enable Storage ✅ DONE
- [ ] Enable Cloud Functions ✅ DONE (Pending: Blaze plan)
- [ ] Set up test environment (emulators)

**Status:** 80% Complete  
**Blocker:** Cloud Functions require Blaze (paid) plan upgrade

#### 2. Local Dev Environment

- [ ] Install VS Code ✅ DONE
- [ ] Install Node.js v20+ ✅ DONE (v20.19.5)
- [ ] Install npm ✅ DONE (v10.8.2)
- [ ] Install Firebase CLI ✅ DONE (v14.24.2)
- [ ] Login & connect to Firebase ✅ DONE
- [ ] Initialize Firebase in project ✅ DONE

**Status:** 100% Complete

#### 3. Git + Version Control

- [ ] Create GitHub repo ✅ DONE (Hetgajjar1/MEP-Flow-Designer)
- [ ] Set up `.gitignore` ✅ DONE
- [ ] Initialize local repo & push ✅ DONE (3 commits)
- [ ] Configure branching model (main + feature branches) ⏳ TODO

**Status:** 75% Complete

#### 4. Project Structure

- [ ] Create folder structure (src/frontend, src/backend, src/models) ✅ DONE
- [ ] Document folder purpose (README) ⏳ TODO
- [ ] Create `docs/` folder for architecture ✅ DONE

**Status:** 75% Complete

#### 5. Confirm Everything Works

- [ ] Run dev server ✅ DONE (http://localhost:5173/)
- [ ] Test Firebase connection ✅ DONE
- [ ] Test Authentication (Login component) ✅ DONE
- [ ] Commit and push ✅ DONE

**Status:** 100% Complete

### 📍 Phase 0 Checkpoint:

- ✅ Firebase project created and connected
- ✅ Local environment stable (Node, npm, Firebase CLI)
- ✅ Git repo initialized with 3 commits
- ✅ React app running locally + deployed to Firebase Hosting
- ✅ Dark theme applied
- ✅ Login component integrated
- ⏳ Next: Upgrade Firebase to Blaze plan for Cloud Functions

---

## 🧩 PHASE 1 — CORE BACKEND MODEL (Project Data Setup)

**Duration:** 2-3 weeks  
**Priority:** 🔴 CRITICAL  
**Goal:** Build a reliable structure for storing projects, drawings, and MEP parameters.

### 📋 Tasks:

#### 1. Design Firestore Data Model

```json
{
  "projects/{projectId}": {
    "name": "Office Building Phase 1",
    "description": "10-floor commercial building",
    "owner": "uid_demo_user",
    "createdAt": "2025-11-11T00:00:00Z",
    "lastModified": "2025-11-11T00:00:00Z",
    "status": "draft | in-review | approved",
    "type": "commercial | residential | industrial",
    "files": [
      {
        "fileName": "Floor_Plan_L1.dwg",
        "fileType": "dwg",
        "fileUrl": "gs://bucket/path/to/file",
        "uploadedAt": "2025-11-11T00:00:00Z"
      }
    ],
    "mep": {
      "plumbing": {
        "pipeSizes": [1, 1.25, 1.5, 2],
        "flowRates": [10, 15, 20, 25],
        "fixtureCounts": { "toilets": 20, "sinks": 30, "showers": 5 }
      },
      "hvac": {
        "ductSizes": [12, 14, 16, 18],
        "airflows": [500, 750, 1000, 1250],
        "coolingLoadBTU": 50000
      },
      "electrical": {
        "loads": [100, 200, 300, 400],
        "circuits": 50,
        "mainService": "200A"
      }
    }
  }
}
```

**Status:** ⏳ TODO  
**Effort:** 3-4 hours

#### 2. Implement Firestore CRUD

- [ ] Create project → Firestore
- [ ] Read project list → UI
- [ ] Update project fields
- [ ] Delete project with confirmation
- [ ] Add data validation

**Status:** ⏳ TODO  
**Effort:** 1-2 days

#### 3. Test User Authentication

- [ ] Email/Password auth ✅ DONE
- [ ] Google Sign-In (optional)
- [ ] Assign roles (Designer, Reviewer, Admin)
- [ ] Test permission-based data access

**Status:** 50% Complete  
**Effort:** 1 day

#### 4. Integrate Firebase Storage

- [ ] Upload DWG/PDF files
- [ ] Retrieve download URL
- [ ] Save file metadata in Firestore
- [ ] Delete files from Storage + metadata

**Status:** ⏳ TODO  
**Effort:** 1-2 days

### 📍 Phase 1 Checkpoint:

- ✅ Firestore schema defined and documented
- ✅ CRUD operations fully functional
- ✅ Auth with role-based access
- ✅ File upload/download working
- ✅ All tested with sample projects

**Estimated Completion:** 2-3 weeks from now (end of November 2025)

---

## 🧩 PHASE 2 — FRONTEND APP (Desktop/Electron)

**Duration:** 2-3 weeks  
**Priority:** 🟡 HIGH  
**Goal:** Create a simple 2D MEP design interface for users.

### 📋 Tasks:

#### 1. Set up Electron + React

- [ ] Create Electron main process
- [ ] Link with React front-end
- [ ] Create menu (File, Edit, View, Help)
- [ ] Create sidebar (project tree)
- [ ] Create canvas area (main workspace)
- [ ] Create toolbar (tools, properties)

**Status:** ⏳ TODO  
**Effort:** 2-3 days

#### 2. Link Firebase

- [ ] Load project list from Firestore
- [ ] Display in sidebar
- [ ] Upload DWG file → Firebase Storage
- [ ] Save file metadata
- [ ] Show file info/properties

**Status:** ⏳ TODO  
**Effort:** 1-2 days

#### 3. Add DWG Reader (MVP)

- [ ] Integrate `ezdxf` (Python backend) or use web-based library
- [ ] Extract 2D geometry (lines, arcs, circles)
- [ ] Parse layer data
- [ ] Render on React Canvas or Fabric.js

**Status:** ⏳ TODO  
**Effort:** 2-3 days

### 📍 Phase 2 Checkpoint:

- ✅ Desktop app can open and display projects
- ✅ 2D file preview working
- ✅ File upload/download integrated
- ✅ Responsive UI on multiple screen sizes

**Estimated Completion:** 5-6 weeks from now (mid-December 2025)

---

## 🧩 PHASE 3 — MEP CALCULATION ENGINE (Local Logic)

**Duration:** 3-4 weeks  
**Priority:** 🔴 CRITICAL  
**Goal:** Implement engineering calculations inside your app.

### 📋 Tasks:

#### 1. Plumbing Calculations ✅ DONE (Basic)

- ✅ Pipe sizing formula (Hunter's Curve)
- ✅ Pressure drop calculation
- ✅ Water demand per fixture
- [ ] Refine formulas per IPC code
- [ ] Add more fixture types

**Status:** 60% Complete  
**Effort:** 1-2 days (remaining)

#### 2. HVAC Calculations ✅ DONE (Basic)

- ✅ Duct sizing (equal friction method)
- ✅ Airflow balance
- [ ] Cooling load estimation (full ASHRAE)
- [ ] Heating load calculation
- [ ] Add equipment sizing

**Status:** 50% Complete  
**Effort:** 2-3 days (remaining)

#### 3. Electrical Calculations ✅ DONE (Basic)

- ✅ Load estimation (wattage + diversity)
- ✅ Cable sizing (ampacity)
- ✅ Voltage drop check
- [ ] Breaker sizing per NEC
- [ ] Ground fault detection

**Status:** 60% Complete  
**Effort:** 1-2 days (remaining)

#### 4. Fire Protection (Sprinkler) Calculations ✅ DONE (Basic)

- ✅ Sprinkler head spacing
- ✅ Standpipe sizing
- ✅ Pump sizing
- [ ] NFPA compliance checks

**Status:** 70% Complete  
**Effort:** 1 day (remaining)

#### 5. Data Integration

- [ ] Store results in Firestore
- [ ] Create result summary table (React)
- [ ] Add export to CSV/Excel
- [ ] Create calculation history

**Status:** ⏳ TODO  
**Effort:** 1-2 days

### 📍 Phase 3 Checkpoint:

- ✅ All 4 MEP domains have working calculations
- ✅ Results saved to Firestore
- ✅ UI shows results clearly
- ✅ No manual spreadsheet needed

**Estimated Completion:** 9-10 weeks from now (late December 2025 / early January 2026)

---

## 🧩 PHASE 4 — REPORTS + EXPORTS

**Duration:** 2-3 weeks  
**Priority:** 🟡 HIGH  
**Goal:** Let users export professional deliverables.

### 📋 Tasks:

#### 1. Generate Reports

- [ ] Create PDF report template (Node.js + pdfkit)
- [ ] Create Excel report template (xlsx)
- [ ] Populate with calculation results
- [ ] Upload report to Firebase Storage
- [ ] Generate download link

**Status:** ⏳ TODO  
**Effort:** 2-3 days

#### 2. Cloud Function Automation

- [ ] Trigger report generation on project update
- [ ] Send email notification with report link
- [ ] Auto-archive old reports
- [ ] Test with sample projects

**Status:** ⏳ TODO  
**Effort:** 1-2 days

#### 3. Compliance Validation (Optional)

- [ ] Check against IPC/NEC/ASHRAE limits
- [ ] Highlight warnings/errors in UI
- [ ] Generate compliance report section

**Status:** ⏳ TODO  
**Effort:** 2-3 days

### 📍 Phase 4 Checkpoint:

- ✅ Professional PDF/Excel reports generated
- ✅ Automated email delivery
- ✅ Compliance checks performed
- ✅ Archive system working

**Estimated Completion:** 12-14 weeks from now (mid-January 2026)

---

## 🧩 PHASE 5 — AI & CLOUD UPGRADE (Future)

**Duration:** 3-4 weeks  
**Priority:** 🟢 LOW (Future Enhancement)  
**Goal:** Add intelligence and advanced collaboration.

### 📋 Tasks:

#### 1. AI Auto-Recognition

- [ ] Train/integrate Cloud Vision API model
- [ ] Detect MEP symbols (pipes, ducts, wires) in 2D drawings
- [ ] Auto-tag elements with type/size
- [ ] Suggest calculations based on detected elements

**Status:** ⏳ TODO  
**Effort:** 2-3 weeks

#### 2. Real-time Collaboration

- [ ] Firestore real-time sync for live editing
- [ ] Multi-user project editing
- [ ] Comment/annotation system
- [ ] Change history & rollback

**Status:** ⏳ TODO  
**Effort:** 1-2 weeks

#### 3. Cloud Run Upgrade

- [ ] Migrate heavy computation to Cloud Run
- [ ] Trigger from Firebase Functions
- [ ] Scale based on workload
- [ ] Monitor performance

**Status:** ⏳ TODO  
**Effort:** 1 week

#### 4. Analytics Dashboard

- [ ] Web dashboard (React + Firestore)
- [ ] User activity tracking
- [ ] Design trends (common pipe sizes, etc.)
- [ ] Time saved vs manual work

**Status:** ⏳ TODO  
**Effort:** 1-2 weeks

### 📍 Phase 5 Checkpoint:

- ✅ AI model provides accurate element detection
- ✅ Collaboration system fully tested
- ✅ Heavy tasks offloaded to cloud
- ✅ Dashboard shows useful analytics

**Estimated Completion:** 17-18 weeks from now (late January / early February 2026)

---

## 🧩 PHASE 6 — DEPLOYMENT + QA

**Duration:** 2-3 weeks  
**Priority:** 🔴 CRITICAL  
**Goal:** Make sure the software is solid, version-controlled, and ready for wider use.

### 📋 Tasks:

#### 1. CI/CD Pipeline ✅ PARTIALLY DONE

- ✅ GitHub Actions workflow created
- ✅ Auto-build on push/PR
- [ ] Auto-run tests
- [ ] Build Electron app
- [ ] Auto-upload to GitHub Releases
- [ ] Deploy Firebase functions on tag

**Status:** 40% Complete  
**Effort:** 1-2 days

#### 2. Testing & QA

- [ ] Unit tests for calculations
- [ ] Integration tests for Firebase operations
- [ ] End-to-end testing (UI automation)
- [ ] Manual QA with sample projects
- [ ] Performance profiling

**Status:** ⏳ TODO  
**Effort:** 3-4 days

#### 3. User Testing

- [ ] Recruit 3-5 real MEP engineers
- [ ] Conduct testing sessions
- [ ] Gather feedback & bug reports
- [ ] Fix critical issues

**Status:** ⏳ TODO  
**Effort:** 1-2 weeks

#### 4. Documentation & Release

- [ ] Update README with setup instructions
- [ ] Create user guide (PDF/video)
- [ ] Create admin guide
- [ ] Tag release v1.0.0
- [ ] Publish on GitHub Releases

**Status:** ⏳ TODO  
**Effort:** 2-3 days

### 📍 Phase 6 Checkpoint:

- ✅ App passes all automated tests
- ✅ User testing completed with positive feedback
- ✅ No critical bugs
- ✅ Ready for public release

**Estimated Completion:** 19-21 weeks from now (mid-February 2026)

---

## 📈 Metrics & Success Criteria

| Phase | Metric                 | Target               |
| ----- | ---------------------- | -------------------- |
| **0** | Firebase + Local Setup | ✅ 100% Done         |
| **1** | Data Model Complete    | 50 fields documented |
| **2** | DWG Preview Working    | <2 sec load time     |
| **3** | Calculation Accuracy   | ±5% of manual calc   |
| **4** | Report Generation      | <30 sec per report   |
| **5** | AI Detection Accuracy  | >85% precision       |
| **6** | User Adoption          | 10+ active users     |

---

## 🎯 Current Status Summary

**Phase:** 0 (Foundation) — 80% Complete  
**Overall Progress:** 2/42 tasks complete  
**Team:** 1 developer (you)  
**Blockers:**

- [ ] Firebase Blaze plan upgrade (required for Cloud Functions)

**Next Actions (Priority Order):**

1. Commit dark theme + Login auth updates to GitHub
2. Upgrade Firebase to Blaze plan
3. Begin Phase 1: Firestore CRUD implementation
4. Create GitHub Issues for Phase 1 tasks

**Estimated MVP Release:** Mid-December 2025  
**Estimated v1.0 Release:** Mid-February 2026

---

## 📝 Notes

- All calculations use industry-standard formulas (IPC, NEC, ASHRAE).
- Firebase Spark plan sufficient for Phase 0-3; Blaze required for Cloud Functions.
- Electron app can be packaged for Windows/Mac/Linux.
- Consider hiring 1-2 more engineers for faster delivery.
- Marketing/sales planning should start by Phase 5.

---

**Last Updated:** November 11, 2025  
**Next Review:** November 18, 2025 (end of Phase 0)
