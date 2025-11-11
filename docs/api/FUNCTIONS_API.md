# Cloud Functions API Reference

## Overview

All Cloud Functions are **HTTPS callable functions**, designed for direct invocation from the web client. They handle authentication automatically and return structured responses.

### Base URL (Emulator)
```
http://localhost:5001/flowforge-mep-designer/us-central1/<functionName>
```

### Base URL (Production)
```
https://us-central1-flowforge-mep-designer.cloudfunctions.net/<functionName>
```

### Client Invocation Pattern

```javascript
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase-config.js';

const myFunction = httpsCallable(functions, 'functionName');
const result = await myFunction({ param1: 'value1', param2: 'value2' });
console.log(result.data);  // { success: true, ... }
```

---

## Authentication & User Management

### updateUserProfile

**Purpose**: Create or update user profile with role. Sets custom claims for role-based access control.

**Authentication**: Required

**Parameters**:
```typescript
{
  name: string,      // User's display name
  role: string       // One of: 'designer', 'engineer', 'reviewer', 'admin'
}
```

**Response**:
```typescript
{
  success: boolean,
  message: string
}
```

**Example**:
```javascript
const updateProfile = httpsCallable(functions, 'updateUserProfile');
const result = await updateProfile({
  name: 'John Doe',
  role: 'engineer'
});
// result.data = { success: true, message: 'Profile updated successfully' }
```

**Errors**:
- `unauthenticated`: User not signed in
- `internal`: Database write failed

**Side Effects**:
- Creates/updates document in `users/{uid}`
- Sets custom claim `role` in user's JWT token

---

### syncMyClaims

**Purpose**: Refresh custom claims from Firestore profile. Call after role changes to sync JWT.

**Authentication**: Required

**Parameters**: None

**Response**:
```typescript
{
  success: boolean,
  role: string
}
```

**Example**:
```javascript
const syncClaims = httpsCallable(functions, 'syncMyClaims');
const result = await syncClaims();
// result.data = { success: true, role: 'engineer' }

// Refresh token to apply new claims
await auth.currentUser.getIdToken(true);
```

**Errors**:
- `unauthenticated`: User not signed in
- `internal`: Firestore read or claim update failed

---

### listUsersProfiles

**Purpose**: Retrieve all user profiles. **Admin-only**.

**Authentication**: Required (Admin role)

**Parameters**: None

**Response**:
```typescript
{
  success: boolean,
  users: Array<{
    id: string,
    email: string,
    name: string,
    role: string,
    updatedAt: Timestamp
  }>,
  count: number
}
```

**Example**:
```javascript
const listUsers = httpsCallable(functions, 'listUsersProfiles');
const result = await listUsers();
// result.data = { success: true, users: [...], count: 15 }
```

**Errors**:
- `unauthenticated`: User not signed in
- `permission-denied`: User is not admin
- `internal`: Firestore query failed

**Rate Limit**: Returns up to 500 users (implement pagination for larger sets)

---

### setUserRole

**Purpose**: Change a user's role. **Admin-only**.

**Authentication**: Required (Admin role)

**Parameters**:
```typescript
{
  uid: string,    // Target user's UID
  role: string    // New role: 'designer', 'engineer', 'reviewer', 'admin'
}
```

**Response**:
```typescript
{
  success: boolean
}
```

**Example**:
```javascript
const setRole = httpsCallable(functions, 'setUserRole');
const result = await setRole({
  uid: 'abc123xyz',
  role: 'engineer'
});
// result.data = { success: true }
```

**Errors**:
- `unauthenticated`: User not signed in
- `permission-denied`: Caller is not admin
- `invalid-argument`: Missing uid/role or invalid role value
- `internal`: Firestore or Auth update failed

**Side Effects**:
- Updates `users/{uid}.role` in Firestore
- Sets custom claim `role` in target user's JWT

**Note**: Target user must refresh their token to see updated role.

---

## Project Management

### createProject

**Purpose**: Create a new MEP project with initial structure.

**Authentication**: Required

**Parameters**:
```typescript
{
  name: string,               // Project name
  type: string,               // 'hvac', 'electrical', 'plumbing', 'fire', 'integrated'
  description?: string,       // Optional description
  buildingType?: string,      // 'commercial', 'residential', 'industrial', 'institutional', 'mixed'
  location?: string,          // City/region (e.g., "Dallas, TX")
  area?: number,              // Building area in square feet
  floors?: number,            // Number of floors
  settings?: {
    units?: string,           // 'imperial' or 'metric'
    standards?: string        // 'ASHRAE', 'IBC', 'UPC'
  }
}
```

**Response**:
```typescript
{
  success: boolean,
  projectId: string,
  message: string
}
```

**Example**:
```javascript
const createProj = httpsCallable(functions, 'createProject');
const result = await createProj({
  name: 'Downtown Office Tower',
  type: 'integrated',
  buildingType: 'commercial',
  location: 'Dallas, TX',
  area: 75000,
  floors: 12
});
// result.data = { success: true, projectId: 'xyz789', message: '...' }
```

**Errors**:
- `unauthenticated`: User not signed in
- `invalid-argument`: Missing name or type
- `internal`: Firestore write failed

**Side Effects**:
- Creates document in `projects/{projectId}`
- Initializes `calculations` subcollection with templates
- Sets `createdBy` to current user's UID

---

### getUserProjects

**Purpose**: Retrieve all projects owned by the current user.

**Authentication**: Required

**Parameters**: None

**Response**:
```typescript
{
  success: boolean,
  projects: Array<Project>,
  count: number
}
```

**Project Object**:
```typescript
{
  id: string,
  name: string,
  type: string,
  description: string,
  buildingType: string,
  location: string,
  area: number,
  floors: number,
  createdBy: string,
  createdByEmail: string,
  createdByName: string,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  status: string,
  files: string[],
  settings: {...},
  calculations: {...}
}
```

**Example**:
```javascript
const getProjects = httpsCallable(functions, 'getUserProjects');
const result = await getProjects();
// result.data = { success: true, projects: [...], count: 5 }
```

**Errors**:
- `unauthenticated`: User not signed in
- `internal`: Firestore query failed

**Note**: Ordered by `createdAt` descending (newest first)

---

### getProjectStats

**Purpose**: Get aggregated project statistics for the current user.

**Authentication**: Required

**Parameters**: None

**Response**:
```typescript
{
  success: boolean,
  stats: {
    totalProjects: number,
    projectsByType: {
      hvac: number,
      electrical: number,
      plumbing: number,
      fire: number,
      integrated: number
    },
    recentActivity: Array<{
      id: string,
      name: string,
      type: string,
      updatedAt: Timestamp
    }>
  }
}
```

**Example**:
```javascript
const getStats = httpsCallable(functions, 'getProjectStats');
const result = await getStats();
// result.data = { success: true, stats: {...} }
```

**Errors**:
- `unauthenticated`: User not signed in
- `internal`: Firestore query failed

---

## Calculation Functions

All calculation functions follow the same pattern. **Phase 1: Placeholder implementations** return mock data. Replace with real formulas in Phase 3.

### calculateHVACLoad

**Purpose**: Calculate heating, cooling, and ventilation loads.

**Authentication**: Required

**Parameters**:
```typescript
{
  projectId: string,
  inputs?: {               // Optional inputs for real calculations
    area?: number,
    occupancy?: number,
    climate?: string,
    insulation?: string
  }
}
```

**Response (Phase 1)**:
```typescript
{
  success: boolean,
  results: {
    heatingLoad: number,        // BTU/hr
    coolingLoad: number,        // BTU/hr
    ventilation: number,        // CFM
    message: string
  },
  timestamp: string
}
```

**Example**:
```javascript
const calcHVAC = httpsCallable(functions, 'calculateHVACLoad');
const result = await calcHVAC({ projectId: 'xyz789' });
// result.data = {
//   success: true,
//   results: {
//     heatingLoad: 75000,
//     coolingLoad: 48000,
//     ventilation: 1200,
//     message: "Phase 1: HVAC calculation placeholder..."
//   },
//   timestamp: "2025-11-10T..."
// }
```

**Errors**:
- `unauthenticated`: User not signed in
- `invalid-argument`: Missing projectId

**Future (Phase 3)**: Will use ASHRAE formulas based on building parameters.

---

### calculateElectricalLoad

**Purpose**: Calculate electrical load, amperage, and demand.

**Authentication**: Required

**Parameters**:
```typescript
{
  projectId: string,
  inputs?: {
    area?: number,
    occupancy?: number,
    equipmentLoad?: number
  }
}
```

**Response (Phase 1)**:
```typescript
{
  success: boolean,
  results: {
    totalLoad: number,      // kW
    demandLoad: number,     // kW (with demand factor)
    amperage: number,       // Amps at 240V 3-phase
    message: string
  },
  timestamp: string
}
```

**Example**:
```javascript
const calcElec = httpsCallable(functions, 'calculateElectricalLoad');
const result = await calcElec({ projectId: 'xyz789' });
// result.data = {
//   success: true,
//   results: { totalLoad: 125, demandLoad: 100, amperage: 416, ... },
//   timestamp: "..."
// }
```

**Future (Phase 3)**: Will use NEC calculations and demand factors.

---

### calculatePlumbingFlow

**Purpose**: Calculate water supply and drainage loads.

**Authentication**: Required

**Parameters**:
```typescript
{
  projectId: string,
  inputs?: {
    fixtureUnits?: number,
    occupancy?: number
  }
}
```

**Response (Phase 1)**:
```typescript
{
  success: boolean,
  results: {
    waterSupplyLoad: number,    // GPM
    drainageLoad: number,       // DFU (Drainage Fixture Units)
    pipeSizing: string,
    message: string
  },
  timestamp: string
}
```

**Example**:
```javascript
const calcPlumbing = httpsCallable(functions, 'calculatePlumbingFlow');
const result = await calcPlumbing({ projectId: 'xyz789' });
```

**Future (Phase 3)**: Will use UPC fixture unit method and pipe sizing charts.

---

### calculateFireProtection

**Purpose**: Calculate fire sprinkler and hydrant requirements.

**Authentication**: Required

**Parameters**:
```typescript
{
  projectId: string,
  inputs?: {
    area?: number,
    occupancyClass?: string,
    storageHeight?: number
  }
}
```

**Response (Phase 1)**:
```typescript
{
  success: boolean,
  results: {
    sprinklerDemand: number,   // GPM
    hydrantFlow: number,       // GPM
    pumpSize: number,          // GPM at PSI
    message: string
  },
  timestamp: string
}
```

**Example**:
```javascript
const calcFire = httpsCallable(functions, 'calculateFireProtection');
const result = await calcFire({ projectId: 'xyz789' });
```

**Future (Phase 3)**: Will use NFPA 13 and NFPA 14 standards.

---

## File Management

### processFileUpload

**Purpose**: Save file metadata to project document after upload to Storage.

**Authentication**: Required

**Parameters**:
```typescript
{
  projectId: string,
  fileName: string,
  downloadURL: string,
  fileSize?: number,
  fileType?: string
}
```

**Response**:
```typescript
{
  success: boolean
}
```

**Example**:
```javascript
// After uploading to Storage
const downloadURL = await getDownloadURL(storageRef);

const processUpload = httpsCallable(functions, 'processFileUpload');
const result = await processUpload({
  projectId: 'xyz789',
  fileName: 'floor-plan.pdf',
  downloadURL: downloadURL,
  fileSize: 1024000,
  fileType: 'application/pdf'
});
// result.data = { success: true }
```

**Errors**:
- `unauthenticated`: User not signed in
- `invalid-argument`: Missing projectId, fileName, or downloadURL
- `internal`: Firestore update failed

**Side Effects**:
- Adds downloadURL to `projects/{projectId}.files` array
- Updates `projects/{projectId}.updatedAt` timestamp

---

## Error Codes Reference

| Code | Description | Common Causes |
|------|-------------|---------------|
| `unauthenticated` | User not signed in | No auth token, expired session |
| `permission-denied` | Insufficient privileges | Non-admin calling admin function |
| `invalid-argument` | Missing or invalid parameters | Null values, wrong type, invalid enum |
| `not-found` | Resource doesn't exist | Invalid projectId, uid |
| `already-exists` | Resource conflict | Duplicate project name (if implemented) |
| `resource-exhausted` | Quota exceeded | Too many requests, storage limit |
| `internal` | Server error | Database failure, network issue |
| `unavailable` | Service temporarily down | Firebase outage, emulator not running |

---

## Rate Limiting & Quotas

### Free Tier (Spark Plan)
- **Cloud Functions**: 125,000 invocations/month
- **Compute Time**: 40,000 GB-seconds/month
- **Network Egress**: 5 GB/month

### Blaze Plan (Pay-as-you-go)
- **Invocations**: $0.40 per million invocations
- **Compute Time**: $0.0000025 per GB-second
- **Network Egress**: $0.12 per GB

### Best Practices
- Cache results client-side when possible
- Use Firestore real-time listeners instead of polling functions
- Batch operations when feasible
- Implement exponential backoff for retries

---

## Security Considerations

### Authentication Verification
All functions check `context.auth`:
```javascript
if (!context.auth) {
  throw new functions.https.HttpsError('unauthenticated', 'User must be signed in');
}
```

### Admin Functions
Admin-only functions check role:
```javascript
async function isAdminContext(context) {
  if (!context?.auth) return false;
  const tokenRole = context.auth.token?.role;
  if (tokenRole === 'admin') return true;
  // Fallback to Firestore
  const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
  return userDoc.data()?.role === 'admin';
}
```

### Input Validation
```javascript
if (!data.projectId || typeof data.projectId !== 'string') {
  throw new functions.https.HttpsError('invalid-argument', 'Valid projectId required');
}
```

### Firestore Security Rules
Functions respect Firestore rules. Even with valid auth, operations may fail if rules deny access.

---

## Testing with Emulators

### Start Functions Emulator

```powershell
firebase emulators:start --only functions
```

### Call Function from CLI

```powershell
# Using curl
curl -X POST \
  http://localhost:5001/flowforge-mep-designer/us-central1/createProject \
  -H "Content-Type: application/json" \
  -d '{"data": {"name": "Test Project", "type": "hvac"}}'
```

### Call from Browser Console

```javascript
const fn = httpsCallable(functions, 'createProject');
const result = await fn({ name: 'Test Project', type: 'hvac' });
console.log(result.data);
```

### View Logs

- Terminal: Watch emulator output
- Emulator UI: http://localhost:4000 → Logs tab
- Production: Firebase Console → Functions → Logs

---

## Deployment

### Deploy All Functions

```powershell
firebase deploy --only functions
```

### Deploy Specific Function

```powershell
firebase deploy --only functions:createProject
```

### View Production Logs

```powershell
firebase functions:log
firebase functions:log --only createProject
```

---

## Migration from Placeholders to Real Calculations

### Phase 3 Implementation Plan

1. **Create Calculation Modules**
   ```
   functions/calculations/
   ├── hvac.js        # ASHRAE formulas
   ├── electrical.js  # NEC calculations
   ├── plumbing.js    # UPC methods
   └── fire.js        # NFPA standards
   ```

2. **Update Functions**
   ```javascript
   const hvacCalc = require('./calculations/hvac');
   
   exports.calculateHVACLoad = functions.https.onCall(async (data, context) => {
     if (!context.auth) throw new functions.https.HttpsError('unauthenticated');
     
     const results = await hvacCalc.compute(data.inputs);
     
     // Save to Firestore
     await admin.firestore()
       .collection('projects').doc(data.projectId)
       .collection('calculations').doc('hvac')
       .set(results, { merge: true });
     
     return { success: true, results };
   });
   ```

3. **Add Input Validation**
   ```javascript
   function validateHVACInputs(inputs) {
     if (!inputs.area || inputs.area <= 0) {
       throw new functions.https.HttpsError('invalid-argument', 'Valid area required');
     }
     // More validation...
   }
   ```

4. **Deploy & Test**
   ```powershell
   firebase deploy --only functions:calculateHVACLoad
   ```

---

## Next Steps

- See [MEP_CALCULATIONS.md](../MEP_CALCULATIONS.md) for real calculation formulas
- Check [DEVELOPMENT.md](../guides/DEVELOPMENT.md) for testing workflows
- Review [ARCHITECTURE.md](../ARCHITECTURE.md) for system design

