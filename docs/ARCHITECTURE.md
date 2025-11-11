# MEP Flow Designer - System Architecture

## Overview

MEP Flow Designer is a cloud-native web application for mechanical, electrical, and plumbing (MEP) system design and calculation. Built on Firebase/GCP, it provides role-based collaboration, real-time updates, and extensible calculation engines.

## Architecture Principles

1. **Serverless-First**: Cloud Functions handle all business logic; no server management
2. **Real-Time Sync**: Firestore listeners provide instant updates across clients
3. **Security by Default**: Defense-in-depth with custom claims, Firestore rules, and Storage rules
4. **Progressive Enhancement**: Core features work without JavaScript; enhanced UX with modern APIs
5. **Modular Design**: Independent calculation engines, pluggable file processors

---

## System Components

### Frontend Layer

**Technology**: Vanilla JavaScript (ES6 modules), HTML5, CSS3

**Modules**:
- `firebase-config.js`: Firebase SDK initialization, emulator connections
- `auth.js`: Authentication flows, role resolution, UI state management
- `projects.js`: Project CRUD, real-time dashboard, calculation orchestration
- `file-upload.js`: Storage uploads, progress tracking, file metadata
- `admin.js`: User role management (admin-only)
- `app.js`: Application bootstrap and global event handlers

**State Management**:
- Local: `localStorage` for role cache, user preferences
- Remote: Firestore real-time listeners for projects, calculations
- Auth: Firebase Auth state observer for user session

**UI Patterns**:
- Modal dialogs for auth and project creation
- Card-based dashboard grid
- Progress bars for file uploads
- Role-based component visibility (via CSS `display` toggling)

---

### Backend Layer

**Technology**: Firebase Cloud Functions (Node.js 20)

**Function Categories**:

1. **Authentication & Users**
   - `updateUserProfile`: Persists user profile + role; sets custom claims
   - `syncMyClaims`: Re-syncs custom claims from Firestore profile
   - `listUsersProfiles`: Admin-only; returns all users
   - `setUserRole`: Admin-only; updates role in Firestore + custom claims

2. **Project Management**
   - `createProject`: Validates and creates project with initial structure
   - `getUserProjects`: Returns user's projects ordered by date
   - `getProjectStats`: Aggregates project analytics by type

3. **Calculations** (Phase 1: Placeholders)
   - `calculateHVACLoad`: HVAC heating/cooling/ventilation
   - `calculateElectricalLoad`: Electrical load/amperage
   - `calculatePlumbingFlow`: Water supply/drainage
   - `calculateFireProtection`: Sprinkler/hydrant systems

4. **File Management**
   - `processFileUpload`: Merges file metadata into project document

**Error Handling**:
- All functions throw `functions.https.HttpsError` with appropriate codes
- Client receives structured error responses
- Server logs errors with `functions.logger`

---

## Data Models

### Firestore Schema

```
/projects/{projectId}
  ├─ name: string
  ├─ type: "hvac" | "electrical" | "plumbing" | "fire" | "integrated"
  ├─ description: string
  ├─ buildingType: string
  ├─ location: string (Phase 2)
  ├─ area: number (Phase 2)
  ├─ floors: number (Phase 2)
  ├─ createdBy: uid
  ├─ createdByEmail: string
  ├─ createdByName: string
  ├─ createdAt: timestamp
  ├─ updatedAt: timestamp
  ├─ status: "active" | "archived"
  ├─ files: string[] (download URLs)
  ├─ settings:
  │   ├─ units: "imperial" | "metric"
  │   ├─ standards: "ASHRAE" | "IBC" | "UPC"
  │   └─ calculations: { hvac, electrical, plumbing, fire }
  └─ calculations:
      └─ loads: { heating, cooling, electrical, water }

/projects/{projectId}/calculations/{calcId}
  ├─ type: "hvac" | "electrical" | "plumbing" | "fire"
  ├─ loadCalculations: object (system-specific)
  ├─ created: timestamp
  └─ updatedBy: uid

/users/{uid}
  ├─ email: string
  ├─ name: string
  ├─ role: "designer" | "engineer" | "reviewer" | "admin"
  └─ updatedAt: timestamp

/activity/{activityId} (Future: audit log)
  ├─ userId: uid
  ├─ action: string
  ├─ resource: { type, id }
  └─ timestamp: timestamp
```

### Custom Claims (JWT)

```json
{
  "role": "admin" | "engineer" | "designer" | "reviewer"
}
```

Claims are set via `admin.auth().setCustomUserClaims()` and accessible in:
- Firestore rules: `request.auth.token.role`
- Storage rules: `request.auth.token.role`
- Client: `user.getIdTokenResult().claims.role`

---

## Security Model

### Defense Layers

1. **Custom Claims (JWT)**
   - Role stored in ID token; verified server-side
   - No client tampering possible
   - Refresh required after role changes

2. **Firestore Security Rules**
   - Document-level access control
   - Owner-based permissions for projects
   - Role-based permissions for calculations
   - Admin override for all operations

3. **Storage Security Rules**
   - Path-based access control
   - Owner/admin can write; authenticated can read
   - Firestore lookup to verify project ownership

4. **Cloud Functions**
   - All callables verify `context.auth`
   - Admin functions check `isAdminContext()`
   - Input validation before Firestore writes

5. **Client UI Gating**
   - Buttons disabled based on role
   - Features hidden for unauthorized users
   - Local checks before callable invocations

### Role Permissions Matrix

| Action | Designer | Engineer | Reviewer | Admin |
|--------|----------|----------|----------|-------|
| Create project | ✅ | ✅ | ❌ | ✅ |
| View projects | ✅ | ✅ | ✅ | ✅ |
| Edit own project | ✅ | ✅ | ❌ | ✅ |
| Edit any project | ❌ | ❌ | ❌ | ✅ |
| Run calculations | ❌ | ✅ | ❌ | ✅ |
| Upload files | ✅ (own) | ✅ (own) | ❌ | ✅ (any) |
| Manage user roles | ❌ | ❌ | ❌ | ✅ |

---

## Data Flow Diagrams

### Project Creation Flow

```
User (Browser)
    │
    ├─► [auth.onAuthStateChanged] ──► Check role ──► Enable/disable "New Project" button
    │
    ├─► [Fill project form] ──► Validate inputs
    │
    └─► [Submit] ──► httpsCallable('createProject', data)
                         │
                         └─► Cloud Function
                                 │
                                 ├─► Verify context.auth
                                 ├─► Validate data
                                 ├─► Firestore.collection('projects').add(projectData)
                                 ├─► Initialize calculations subcollection
                                 └─► Return { success, projectId }
                                         │
                                         └─► Client receives response
                                                 │
                                                 ├─► Close modal
                                                 ├─► Show success message
                                                 └─► Firestore listener auto-updates dashboard
```

### Calculation Flow

```
User clicks "Run Calculations"
    │
    ├─► Check cached role (engineer/admin only)
    │
    └─► For each system type:
            │
            └─► httpsCallable('calculate[System]Load', { projectId })
                     │
                     └─► Cloud Function
                             │
                             ├─► Verify auth
                             ├─► Execute calculation logic
                             ├─► Write to Firestore calculations subcollection
                             └─► Return { success, results }
                                     │
                                     └─► Client aggregates results
                                             │
                                             └─► Display in modal
```

### File Upload Flow

```
User selects file ──► Drag-and-drop or file input
    │
    ├─► Validate file (size, type)
    │
    └─► uploadBytesResumable(storageRef, file)
            │
            ├─► Progress updates ──► Update UI progress bar
            │
            └─► Upload complete ──► getDownloadURL()
                                        │
                                        └─► httpsCallable('processFileUpload', {
                                                projectId, fileName, downloadURL
                                            })
                                                │
                                                └─► Cloud Function
                                                        │
                                                        ├─► Verify ownership
                                                        ├─► Firestore.doc(projectId).update({
                                                        │       files: arrayUnion(downloadURL)
                                                        │   })
                                                        └─► Return { success }
```

### Admin Role Management Flow

```
Admin opens Admin Panel
    │
    ├─► [role check] ──► If not admin, panel hidden
    │
    └─► Click "Refresh Users"
            │
            └─► httpsCallable('listUsersProfiles')
                     │
                     └─► Cloud Function
                             │
                             ├─► isAdminContext() check
                             ├─► Firestore.collection('users').get()
                             └─► Return { users: [...] }
                                     │
                                     └─► Render user list with roles
                                             │
                                             └─► Admin clicks "Set Role"
                                                     │
                                                     └─► httpsCallable('setUserRole', { uid, role })
                                                             │
                                                             └─► Cloud Function
                                                                     │
                                                                     ├─► isAdminContext() check
                                                                     ├─► Firestore.doc(uid).update({ role })
                                                                     ├─► admin.auth().setCustomUserClaims(uid, { role })
                                                                     └─► Return { success }
                                                                             │
                                                                             └─► Target user refreshes token
                                                                                     │
                                                                                     └─► New role takes effect
```

---

## Firebase Services Integration

### Authentication
- **Provider**: Email/Password (extensible to Google, SAML, etc.)
- **Custom Claims**: Role-based access control
- **Session**: Persistent across page reloads
- **Emulator**: Port 9099 (dev)

### Firestore
- **Mode**: Native mode (not Datastore mode)
- **Indexes**: Composite index on `createdBy + createdAt` for projects
- **Real-Time**: `onSnapshot` listeners for live updates
- **Emulator**: Port 8080 (dev)

### Cloud Functions
- **Runtime**: Node.js 20
- **Trigger**: HTTPS callable (for client invocation)
- **CORS**: Automatic for callable functions
- **Emulator**: Port 5001 (dev)

### Storage
- **Buckets**: Default bucket `{projectId}.firebasestorage.app`
- **Path Structure**: `/projects/{projectId}/files/{fileName}`
- **Security**: Rules-based with Firestore lookups
- **Emulator**: Port 9199 (dev)

### Hosting
- **Deployment**: `public/` directory
- **Rewrites**: SPA fallback to `index.html`
- **Emulator**: Port 5000 (dev)

---

## Development Workflow

### Local Development
1. Start Firebase Emulators: `firebase emulators:start`
2. Open http://localhost:5000 (Hosting) or `public/index.html`
3. Emulator UI at http://localhost:4000

### Testing Flow
1. Sign up users with different roles
2. Verify role-based UI gating
3. Test project CRUD operations
4. Run placeholder calculations
5. Upload files to Storage
6. Admin: Change user roles
7. Verify Firestore and Storage rules enforcement

### Deployment (Future)
1. `firebase deploy --only firestore:rules`
2. `firebase deploy --only storage:rules`
3. `firebase deploy --only functions`
4. `firebase deploy --only hosting`

---

## Performance Considerations

### Frontend Optimization
- ES6 modules loaded on-demand
- Firestore listeners detached on component unmount
- File upload uses resumable sessions (large files)
- LocalStorage caching for role (reduces Firestore reads)

### Backend Optimization
- Firestore batch writes for initialization
- Cloud Functions use singleton Firebase Admin instance
- Calculation results cached in Firestore (no re-computation)
- Storage download URLs cached in project documents

### Scalability
- Firestore: 1 million concurrent connections
- Cloud Functions: Auto-scales to demand
- Storage: Unlimited file uploads
- Auth: 10,000 simultaneous authentications (free tier)

---

## Extensibility Points

### Adding New Calculation Types
1. Create new callable function in `functions/index.js`
2. Add calculation logic module in `functions/calculations/`
3. Update `projects.js` to call new function
4. Add UI for displaying new calculation results

### Adding New Roles
1. Update `firestore.rules` with new role permissions
2. Add role option in `public/index.html` signup form
3. Update `functions/index.js` validation in `setUserRole`
4. Add role-specific UI gating in `auth.js` and `projects.js`

### Integrating CAD Editor (Future)
1. Add `public/js/cad-editor.js` module
2. Use Canvas API or WebGL for rendering
3. Store drawing data in Firestore `projects/{id}/drawings`
4. Implement real-time collaboration with Firestore transactions
5. Export to DXF/DWG via Cloud Functions + external library

---

## Security Best Practices

### Implemented
✅ Custom claims for role enforcement  
✅ Firestore rules prevent unauthorized access  
✅ Storage rules verify project ownership  
✅ All Cloud Functions verify `context.auth`  
✅ Admin functions check admin status  
✅ Input validation in callables  
✅ HTTPS-only in production  

### Recommended Additions
🔲 Rate limiting on Cloud Functions (via Firebase App Check)  
🔲 Content Security Policy headers in Hosting  
🔲 File type validation in Storage (prevent executable uploads)  
🔲 Audit logging for admin actions  
🔲 Data encryption at rest (Firestore + Storage default)  
🔲 Periodic security rule audits  

---

## Monitoring & Observability

### Current State
- Firebase Console: Real-time dashboard for Auth, Firestore, Functions
- Cloud Functions logs: Available in GCP Logs Explorer
- Emulator UI: Inspect data during development

### Production Recommendations
- Enable Cloud Logging for all Functions
- Set up alerting for failed function invocations
- Monitor Firestore read/write quotas
- Track Storage bandwidth usage
- Use Firebase Performance Monitoring for frontend

---

## Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Vanilla JavaScript (ES6) | - |
| UI Framework | None (Plain HTML/CSS) | - |
| Firebase SDK | Modular Web SDK (v10) | 10.7.0 |
| Cloud Functions | Node.js | 20 |
| Database | Cloud Firestore | Native |
| Storage | Cloud Storage for Firebase | - |
| Authentication | Firebase Auth | - |
| Hosting | Firebase Hosting | - |
| Build Tool | None (native ES modules) | - |
| Dev Server | Live Server / Firebase Hosting emulator | - |

---

## Migration Path (Future)

### From Placeholders to Real Calculations
1. Replace mock returns in calculation functions with real formulas
2. Add calculation modules: `functions/calculations/hvac.js`, etc.
3. Implement industry-standard formulas (ASHRAE, NEC, UPC, NFPA)
4. Add input validation for building parameters
5. Store calculation history in Firestore for audit trail

### From Vanilla JS to Framework (Optional)
1. Evaluate React, Vue, or Svelte for complex UI
2. Migrate modules to components
3. Add build step (Vite or Webpack)
4. Keep Firebase integration unchanged
5. Deploy compiled bundle to Hosting

### From Firestore to Hybrid (Optional)
1. Add PostgreSQL/Cloud SQL for relational data
2. Use Firestore for real-time sync
3. Cloud Functions bridge between databases
4. Maintain Firestore for access control

---

## Conclusion

The MEP Flow Designer architecture balances simplicity (vanilla JS, serverless) with scalability (Firestore, Cloud Functions) and security (custom claims, rules-based enforcement). The modular design allows incremental feature additions without major refactoring.

Next phases will focus on:
- Real calculation engines with engineering formulas
- CAD-inspired drawing editor
- Project collaboration and sharing
- Audit logging and compliance reporting
- Mobile-responsive design enhancements
