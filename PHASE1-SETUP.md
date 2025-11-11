# MEP Flow Designer - Phase 1 Setup Guide

## 🚀 Quick Start (Phase 1)

### Prerequisites
- **Node.js** 20+ installed
- **Firebase CLI** installed globally: `npm install -g firebase-tools`
- **Git** (optional, for version control)

### Phase 1 Installation & Setup

1. **Install Dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install Functions dependencies
   cd functions && npm install
   cd ..
   ```

2. **Start Development Environment**

   **Option A: Auth Only (Simplest - No Java required)**
   ```bash
   npm run start
   ```
   Then open `public/index.html` in your browser or use Live Server in VS Code.

   **Option B: Full Emulator Suite (Requires Java 11+)**
   ```bash
   npm run start:full
   ```
   Access at http://localhost:5000

   **Option C: Development Mode with Live Reload**
   ```bash
   npm run dev
   ```

## 📋 Phase 1 Features Complete

### ✅ Authentication System
- **Email/Password Signup & Login**
- **User Role Management** (Designer, Engineer, Reviewer, Admin)
- **Firebase Auth Emulator** integration
- **Secure logout** functionality

### ✅ Project Management Dashboard
- **Create New Projects** with MEP type selection:
  - HVAC (Heating, Ventilation, Air Conditioning)
  - Electrical Systems
  - Plumbing & Water Systems
  - Fire Protection Systems
  - Integrated MEP
- **Project Dashboard** showing all user projects
- **Building Type** classification
- **Project Description** and metadata

### ✅ Cloud Functions Backend
- **createProject** - Secure project creation with validation
- **calculateHVACLoad** - Phase 1 placeholder returning mock data
- **calculateElectricalLoad** - Phase 1 placeholder returning mock data
- **calculatePlumbingFlow** - Phase 1 placeholder returning mock data
- **calculateFireProtection** - Phase 1 placeholder returning mock data
- **updateUserProfile** - User profile and role management
- **getProjectStats** - Dashboard analytics

### ✅ UI/UX Design
- **Modern responsive design** with CSS Grid and Flexbox
- **Professional color scheme** with engineering theme
- **Modal dialogs** for forms
- **Loading states** and error handling
- **Mobile-responsive** layout

## 🧪 Testing Phase 1

### 1. Start Auth Emulator
```bash
npm run start
```

### 2. Open Application
- **Direct**: Open `public/index.html` in browser
- **VS Code Live Server**: Right-click on `index.html` → "Open with Live Server"
- **Full Emulator**: http://localhost:5000 (if using `npm run start:full`)

### 3. Test User Flow
1. **Signup** → Choose role (Designer/Engineer/Reviewer/Admin)
2. **Login** → Access dashboard
3. **Create Project** → Select MEP type, add details
4. **View Dashboard** → See created projects
5. **Test Calculations** → Access mock calculation results

## 🔧 Development Commands

| Command | Description |
|---------|-------------|
| `npm run start` | Auth emulator only (no Java required) |
| `npm run start:full` | Full Firebase emulators (requires Java 11+) |
| `npm run dev` | Development with live reload |
| `npm run setup` | Install functions dependencies |
| `npm run deploy:functions` | Deploy functions to Firebase |
| `npm run deploy:hosting` | Deploy web app to Firebase Hosting |

## 📁 Project Structure (Phase 1)

```
/MEP-Flow-Designer
├── /functions/                 # Cloud Functions
│   ├── index.js               # ✅ Project management & calculation APIs
│   └── package.json           # ✅ Node.js dependencies
├── /public/                   # Frontend Web App
│   ├── index.html            # ✅ Main UI with auth & dashboard
│   ├── /js/
│   │   ├── firebase-config.js # ✅ Firebase setup & emulator connection
│   │   ├── auth.js           # ✅ Authentication functions
│   │   ├── projects.js       # ✅ Project management
│   │   └── app.js            # ✅ Main application logic
│   └── /css/
│       └── styles.css        # ✅ Professional responsive styling
├── firebase.json             # ✅ Firebase configuration with hosting
├── firestore.rules          # ✅ Database security rules
└── package.json             # ✅ Project dependencies & scripts
```

## 🎯 What's Ready for Testing

1. **Complete Authentication Flow**
2. **Project Creation & Management**
3. **User Dashboard Interface**
4. **Mock MEP Calculations** (returns sample data)
5. **Professional UI/UX Design**
6. **Firebase Emulator Integration**

## ⚡ Next Steps (Phase 2 Preview)

- **Real MEP Calculations** (load calculations, ductwork sizing, pipe flow)
- **File Upload & Management** (DWG, PDF, calculations)
- **Firestore Database Integration** (project persistence)
- **Advanced Project Collaboration**
- **Report Generation**

## 🐛 Troubleshooting

### Firebase Emulator Issues
- **Java Not Found**: Auth emulator works without Java. For full emulators, install Java 11+
- **Port Conflicts**: Check if ports 9099, 5001, 8080 are available
- **CORS Errors**: Use Firebase Hosting emulator (`npm run start:full`)

### Development Issues
- **Module Errors**: Ensure Firebase SDK versions match in `firebase-config.js`
- **Auth Not Working**: Verify emulator is running on port 9099
- **Functions Not Loading**: Check `functions/package.json` dependencies

---

## 🎉 Phase 1 Complete!

You now have a **fully functional MEP design platform** with authentication, project management, and placeholder calculations. The foundation is ready for Phase 2 implementation of real engineering calculations and advanced features.

**Ready to test?** Run `npm run start` and open `public/index.html`!