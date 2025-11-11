# MEP Flow Designer

> **Cloud-native MEP engineering platform** for mechanical, electrical, and plumbing design with real-time collaboration, role-based access control, and industry-standard calculations.

[![Phase](https://img.shields.io/badge/Phase-2%20Complete-success)](docs/ROADMAP.md)
[![Firebase](https://img.shields.io/badge/Firebase-Emulators%20Ready-orange)](docs/guides/FIREBASE_SETUP.md)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#)

---

## 🏗️ What is MEP Flow Designer?

MEP Flow Designer is a **professional web application** for MEP (Mechanical, Electrical, Plumbing) engineers and designers to:

- 🌡️ **HVAC Design**: Calculate heating/cooling loads, ventilation (ASHRAE standards)
- ⚡ **Electrical Systems**: Load calculations, demand factors, amperage (NEC compliant)
- 🚿 **Plumbing Design**: Fixture units, pipe sizing, pressure analysis (UPC/IPC)
- 🔥 **Fire Protection**: Sprinkler demand, hydrant flow, pump sizing (NFPA standards)
- 📁 **File Management**: Upload DWG, PDF, images to Cloud Storage
- 👥 **Real-Time Collaboration**: Multi-user projects with role-based permissions
- 🔐 **Enterprise Security**: Custom claims, Firestore rules, admin role management

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ (for Cloud Functions)
- **Java** 17+ (for Firestore/Functions/Storage emulators)
- **Firebase CLI**: `npm install -g firebase-tools`
- **VS Code** (recommended)

### Local Development

```powershell
# 1. Clone & open workspace
cd MEP-Flow-Designer
code mep-flow-designer.code-workspace

# 2. Install Functions dependencies
cd functions
npm install
cd ..

# 3. Start Firebase Emulators
firebase emulators:start

# 4. Open application
# - Hosting Emulator: http://localhost:5000
# - Emulator UI: http://localhost:4000
```

**Emulator Ports**:
- Auth: `9099`
- Firestore: `8080`
- Functions: `5001`
- Storage: `9199`
- Hosting: `5000`
- UI: `4000`

📖 **Detailed setup**: [Firebase Setup Guide](docs/guides/FIREBASE_SETUP.md)

---

## 📚 Documentation

### Getting Started
- **[Architecture Overview](docs/ARCHITECTURE.md)** - System design, data models, security
- **[Firebase Setup](docs/guides/FIREBASE_SETUP.md)** - Install, configure, deploy
- **[Development Guide](docs/guides/DEVELOPMENT.md)** - Local dev workflow, testing

### Developer Guides
- **[Frontend Guide](docs/guides/FRONTEND_GUIDE.md)** - Modules, UI patterns, state management
- **[Functions API Reference](docs/api/FUNCTIONS_API.md)** - All callable endpoints documented
- **[MEP Calculations](docs/MEP_CALCULATIONS.md)** - Formulas, standards, implementation

### Planning & Future
- **[Product Roadmap](docs/ROADMAP.md)** - Phase 3-6 features, timelines
- **[CAD Integration](docs/AUTOCAD_INTEGRATION.md)** - Drawing editor technical design

---

## 🎯 Current Status: Phase 2 Complete ✅

**What's Live**:
- ✅ Authentication with role-based access (Designer, Engineer, Reviewer, Admin)
- ✅ Custom claims (JWT roles) + Firestore fallback
- ✅ Project CRUD operations with real-time dashboard
- ✅ Placeholder calculations (4 MEP systems)
- ✅ File upload/management (Cloud Storage)
- ✅ Admin panel for user role management
- ✅ Comprehensive security rules (Firestore + Storage)
- ✅ Emulator-ready development environment

**Next Phase (Q1 2026)**: Real calculation engines with ASHRAE/NEC/UPC/NFPA formulas.

📊 **[View Full Roadmap](docs/ROADMAP.md)**

---

## 📁 Project Structure

```
MEP-Flow-Designer/
├── docs/                       # 📖 Comprehensive documentation
│   ├── ARCHITECTURE.md         # System design & data models
│   ├── MEP_CALCULATIONS.md     # Engineering formulas & standards
│   ├── ROADMAP.md              # Product roadmap & phases
│   ├── AUTOCAD_INTEGRATION.md  # CAD editor technical design
│   ├── guides/
│   │   ├── FIREBASE_SETUP.md   # Setup & deployment
│   │   ├── DEVELOPMENT.md      # Dev workflow & testing
│   │   └── FRONTEND_GUIDE.md   # Frontend architecture
│   └── api/
│       └── FUNCTIONS_API.md    # Cloud Functions reference
│
├── public/                     # 🌐 Frontend (Vanilla JS)
│   ├── index.html              # Main application
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── firebase-config.js  # Firebase SDK init
│       ├── auth.js             # Authentication & roles
│       ├── projects.js         # Project management
│       ├── file-upload.js      # Storage uploads
│       ├── admin.js            # Admin role management
│       └── app.js              # Application bootstrap
│
├── functions/                  # ☁️ Cloud Functions (Node.js 20)
│   ├── index.js                # 10 callable functions
│   └── package.json            # firebase-admin, firebase-functions
│
├── firebase.json               # Firebase config (emulators, hosting)
├── firestore.rules             # Security rules (RBAC)
├── firestore.indexes.json      # Composite indexes
├── storage.rules               # Storage security (owner/admin)
└── README.md                   # You are here
```

---

## 🔧 Key Features

### Authentication & Security
- **Email/Password Auth** with role selection at signup
- **Custom Claims** (JWT) for role-based access: `designer`, `engineer`, `reviewer`, `admin`
- **Firestore Rules** enforce owner-based project access and role-based calculation writes
- **Storage Rules** restrict file uploads to project owners or admins
- **Admin Panel** for managing user roles (admin-only)

### Project Management
- **Real-Time Dashboard**: Firestore `onSnapshot` listeners for live updates
- **Project Types**: HVAC, Electrical, Plumbing, Fire Protection, Integrated
- **Metadata**: Location, area (sq ft), floors, building type
- **Calculations**: Placeholder functions (Phase 2) → Real formulas (Phase 3)
- **File Uploads**: DWG, PDF, images to Cloud Storage with progress tracking

### Cloud Functions (Callable)
- **Auth**: `updateUserProfile`, `syncMyClaims`, `listUsersProfiles`, `setUserRole`
- **Projects**: `createProject`, `getUserProjects`, `getProjectStats`
- **Calculations**: `calculateHVACLoad`, `calculateElectricalLoad`, `calculatePlumbingFlow`, `calculateFireProtection`
- **Files**: `processFileUpload`

📘 **[Full API Reference](docs/api/FUNCTIONS_API.md)**

---

## 🛠️ Development Workflow

### Local Testing
```powershell
# Start all emulators
firebase emulators:start

# Open Emulator UI (inspect data)
# http://localhost:4000

# Test flow:
# 1. Sign up as Admin → Admin Panel appears
# 2. Create project as Designer
# 3. Run calculations as Engineer
# 4. Upload files (Storage integration)
# 5. Admin changes user roles
```

### Debugging
- **Frontend**: Browser DevTools → Console, Network, Application tabs
- **Functions**: Terminal logs or Emulator UI → Logs tab
- **Rules**: Firestore Emulator → Rules Playground

� **[Development Guide](docs/guides/DEVELOPMENT.md)**

---

## 🧪 Testing with Emulators

**End-to-End Test Flow**:
1. Sign up 3 users: Admin, Engineer, Reviewer
2. Admin uses Admin Panel to promote Designer → Engineer
3. Reviewer attempts project creation (blocked by UI)
4. Engineer creates project + runs calculations (modal shows results)
5. Upload file to project (verify Storage + Firestore)
6. Verify Firestore rules: non-owner can't edit projects
7. Verify Storage rules: non-owner can't delete files

**Emulator Data Persistence**:
```powershell
# Export data on exit
firebase emulators:start --export-on-exit=./emulator-data

# Import data on start
firebase emulators:start --import=./emulator-data
```

---

## 🏗️ Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Vanilla JavaScript (ES6 modules) | - |
| **UI** | HTML5, CSS3 | - |
| **Firebase SDK** | Modular Web SDK | 10.7.0 |
| **Backend** | Cloud Functions (Node.js) | 20 |
| **Database** | Firestore (Native mode) | - |
| **Storage** | Cloud Storage for Firebase | - |
| **Authentication** | Firebase Auth (Email/Password) | - |
| **Hosting** | Firebase Hosting | - |
| **Emulators** | Firebase Emulator Suite | - |
| **Build** | None (native ES modules) | - |

**Why Vanilla JS?**
- Zero build time, instant browser updates
- No framework lock-in or deprecation risk
- Direct Firebase SDK usage (no abstractions)
- Easy for contributors to understand

**Future**: Optional TypeScript + Vite in Phase 5.

---

## 🚢 Deployment (Production)

```powershell
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
firebase deploy --only functions
firebase deploy --only hosting
```

**Pre-Deployment Checklist**:
- [ ] Update `firebaseConfig` in `public/js/firebase-config.js` with real API keys
- [ ] Test all Firestore rules with Rules Playground
- [ ] Verify Storage rules block unauthorized writes
- [ ] Run calculations with real inputs
- [ ] Check Function logs for errors
- [ ] Set up billing alerts in GCP Console

📖 **[Firebase Setup Guide](docs/guides/FIREBASE_SETUP.md#deployment-workflow)**

---

## 📊 Roadmap

### Phase 3: Real Calculations (Q1 2026)
- Implement ASHRAE formulas for HVAC loads
- NEC Article 220 for electrical calculations
- UPC fixture unit method for plumbing
- NFPA 13/20 for fire protection
- Analytics dashboard with Chart.js

### Phase 4: CAD Integration (Q2 2026)
- HTML5 Canvas drawing engine (Fabric.js)
- MEP symbol libraries (diffusers, outlets, fixtures, sprinklers)
- Layer management, snap-to-grid, measurement tools
- Real-time multi-user editing
- Import DWG/DXF, export to PDF

### Phase 5: Advanced Features (Q3 2026)
- Equipment selection optimizer
- Code compliance checker (NEC, ASHRAE, UPC, NFPA)
- Project sharing & collaboration
- Mobile PWA (offline mode)
- BIM integration (IFC import/export)

### Phase 6: AI & ML (Q4 2026)
- GPT-4 design assistant
- Load prediction models
- Anomaly detection
- Computer vision (floor plan recognition)

🗺️ **[Full Roadmap](docs/ROADMAP.md)**

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

**Development Setup**: See [Development Guide](docs/guides/DEVELOPMENT.md)

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 🙏 Acknowledgments

- **Firebase**: Cloud platform and emulators
- **ASHRAE**: HVAC standards and formulas
- **NEC/NFPA**: Electrical and fire protection codes
- **UPC/IPC**: Plumbing standards
- **Chart.js**: Data visualization
- **Fabric.js**: Canvas drawing (future CAD integration)

---

## 📧 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/your-org/MEP-Flow-Designer/issues)
- **Documentation**: [docs/](docs/)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/MEP-Flow-Designer/discussions)

---

**Built with ❤️ for MEP engineers and designers worldwide.**
   - Profile management

2. **Project Management**
   - Create projects by MEP system type
   - Project dashboard and overview
   - Real-time project updates

3. **MEP Calculations** (Cloud Functions)
   - HVAC load calculations
   - Electrical load analysis
   - Plumbing flow calculations
   - Code compliance checking

4. **File Management**
   - Upload CAD files (DWG, PDF)
   - Image and document storage
   - File processing and preview

## 🔥 Firebase Emulators

### Available Emulators

- **Authentication** ✅ (Port 9099) - Always available
- **Firestore** ⚠️ (Port 8080) - Requires Java 11+
- **Functions** ⚠️ (Port 5001) - Requires Java 11+
- **Storage** ⚠️ (Port 9199) - Requires Java 11+
- **Emulator UI** ✅ (Port 4000) - Web interface

### Development Notes

- The application gracefully handles missing emulators
- Auth emulator works with Java 8+
- Mock data is provided when other emulators are unavailable
- Full functionality requires Java 11+ for all emulators

## 🎯 Usage Guide

### For Developers

1. **Start Development Environment**:
   ```bash
   firebase emulators:start --only auth
   ```

2. **Open Application**: Use Live Server or open `public/index.html`

3. **Create Test Account**: Use the signup feature with any email/password

4. **Create Test Project**: Use the "New Project" button to create MEP projects

### For MEP Engineers

1. **Sign Up**: Create an account with your professional email
2. **Create Project**: Select your MEP system type (HVAC, Electrical, Plumbing, etc.)
3. **Enter Building Data**: Provide building specifications for calculations
4. **Review Results**: Get load calculations and equipment recommendations
5. **Collaborate**: Share projects with team members for review

## 🔧 Technical Architecture

### Frontend
- **Vanilla JavaScript** with ES6 modules
- **Responsive CSS** with modern layout
- **Firebase SDK v10** for all services
- **Modular architecture** for maintainability

### Backend
- **Firebase Cloud Functions** for business logic
- **Firestore** for real-time data storage
- **Firebase Authentication** for user management
- **Cloud Storage** for file management

### Development Tools
- **VS Code** with recommended extensions
- **Firebase CLI** for project management
- **Live Server** for local development
- **Prettier** for code formatting

## 🚀 Deployment

### Development Deployment
```bash
# Deploy to Firebase
firebase deploy
```

### Production Considerations
- Set up custom domain
- Configure production Firebase project
- Set up CI/CD pipeline
- Configure monitoring and analytics

## 🤝 Contributing

This is a professional MEP engineering tool designed for:
- MEP Design firms
- Engineering consultants
- Architectural firms
- Construction companies
- Educational institutions

## 📄 License

Professional engineering software for MEP design workflows.

## 🆘 Support

For technical support or feature requests:
1. Check the Firebase console for errors
2. Review browser developer console
3. Verify emulator status
4. Check network connectivity

## 🔮 Roadmap

**Phase 1 - Foundation** ✅
- Authentication and user management
- Basic project structure
- Firebase integration

**Phase 2 - Core MEP Features** 🚧
- Advanced HVAC calculations
- Electrical load analysis
- Plumbing system design
- File upload and management

**Phase 3 - Collaboration** 📋
- Real-time collaboration
- Approval workflows
- Team management
- Project sharing

**Phase 4 - Advanced Features** 📋
- 3D visualization
- Code compliance checking
- Energy analysis
- Reporting and documentation

---

Built with ❤️ for the MEP engineering community