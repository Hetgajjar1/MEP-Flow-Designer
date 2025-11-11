# Development Guide

## Development Environment Setup

### Quick Start

```powershell
# 1. Clone repository
git clone https://github.com/your-org/MEP-Flow-Designer.git
cd MEP-Flow-Designer

# 2. Install Functions dependencies
cd functions
npm install
cd ..

# 3. Start Firebase Emulators
firebase emulators:start

# 4. Open application
# Browser: http://localhost:5000
# Emulator UI: http://localhost:4000
```

---

## Firebase Emulator Suite

### What Are Emulators?

Firebase Emulators provide a local environment that mimics Firebase services, allowing you to develop and test without affecting production data or incurring costs.

### Emulator Ports

| Service | Port | URL |
|---------|------|-----|
| Authentication | 9099 | http://localhost:9099 |
| Firestore | 8080 | http://localhost:8080 |
| Cloud Functions | 5001 | http://localhost:5001 |
| Cloud Storage | 9199 | http://localhost:9199 |
| Hosting | 5000 | http://localhost:5000 |
| Emulator UI | 4000 | http://localhost:4000 |

### Starting Emulators

```powershell
# Start all configured emulators
firebase emulators:start

# Start specific emulators only
firebase emulators:start --only auth,firestore

# Start with data import
firebase emulators:start --import=./emulator-data

# Start and export data on exit
firebase emulators:start --export-on-exit=./emulator-data
```

### Emulator UI Features

Access at http://localhost:4000:

- **Authentication**: View/manage test users
- **Firestore**: Browse collections, edit documents
- **Storage**: View uploaded files
- **Functions**: See invocation logs and errors
- **Logs**: Combined logs from all services

---

## Project Structure

```
MEP-Flow-Designer/
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md
│   ├── guides/
│   │   ├── FIREBASE_SETUP.md
│   │   ├── DEVELOPMENT.md
│   │   └── FRONTEND_GUIDE.md
│   └── api/
│       └── FUNCTIONS_API.md
├── functions/                 # Cloud Functions
│   ├── index.js              # Main functions export
│   ├── package.json
│   └── node_modules/
├── public/                    # Frontend assets
│   ├── index.html            # Main HTML file
│   ├── css/
│   │   └── styles.css
│   └── js/
│       ├── firebase-config.js # Firebase initialization
│       ├── auth.js           # Authentication module
│       ├── projects.js       # Project management
│       ├── file-upload.js    # File upload module
│       ├── admin.js          # Admin panel
│       └── app.js            # Main app logic
├── firebase.json              # Firebase config
├── firestore.rules            # Firestore security rules
├── firestore.indexes.json     # Firestore indexes
├── storage.rules              # Storage security rules
├── .firebaserc                # Firebase project aliases
├── .gitignore
├── package.json               # Root package.json (for scripts)
└── README.md
```

---

## Development Workflow

### 1. Feature Development Cycle

```powershell
# Create feature branch
git checkout -b feature/your-feature-name

# Start emulators
firebase emulators:start

# Make code changes (frontend or functions)
# Changes auto-reload in emulators

# Test in browser at http://localhost:5000

# Commit changes
git add .
git commit -m "Add feature description"

# Push to remote
git push origin feature/your-feature-name
```

### 2. Testing Changes

#### Frontend Changes
- Edit files in `public/js/` or `public/css/`
- Refresh browser (no restart needed)
- Use browser DevTools for debugging

#### Cloud Functions Changes
- Edit `functions/index.js`
- Emulator auto-reloads on file save
- Check logs in terminal or Emulator UI

#### Security Rules Changes
- Edit `firestore.rules` or `storage.rules`
- Restart emulators to apply changes:
  ```powershell
  # Ctrl+C to stop, then:
  firebase emulators:start
  ```

---

## Local Testing

### Manual Testing Flow

#### 1. Authentication Testing

```powershell
# Start emulators
firebase emulators:start
```

**Browser Steps**:
1. Open http://localhost:5000
2. Click "Sign Up"
3. Enter test credentials:
   - Email: `designer@test.com`
   - Password: `test123`
   - Name: `Test Designer`
   - Role: `Designer`
4. Submit form
5. Verify:
   - User redirected to dashboard
   - Emulator UI shows user in Auth section
   - Firestore `users/` collection has user document

#### 2. Project Creation Testing

1. Sign in as Designer
2. Click "New Project"
3. Fill form:
   - Name: "Office Building HVAC"
   - Type: HVAC
   - Building Type: Commercial
   - Location: "Dallas, TX"
   - Area: 50000
   - Floors: 3
4. Submit
5. Verify:
   - Project appears in dashboard
   - Firestore `projects/` collection has document
   - Project shows correct metadata

#### 3. Calculation Testing

1. Create project as Engineer or Admin
2. Click "Run Calculations"
3. Verify:
   - Modal shows results for all 4 systems
   - Functions logs show callable invocations
   - Firestore `calculations/` subcollection updated

#### 4. File Upload Testing

1. Open project
2. Drag file onto upload area (or click to select)
3. Verify:
   - Progress bar shows upload
   - File appears in project file list
   - Storage emulator shows file in correct path
   - Firestore project doc has file URL

#### 5. Admin Testing

1. Sign in as Admin
2. Verify Admin Panel visible
3. Click "Refresh Users"
4. Change a user's role to Engineer
5. Sign in as that user
6. Verify:
   - New role reflected in UI permissions
   - Custom claims updated (check token in console)

### Console Testing (Advanced)

Open browser DevTools console:

```javascript
// Check current user role from custom claims
const tokenResult = await auth.currentUser.getIdTokenResult(true);
console.log('Role from claims:', tokenResult.claims.role);

// Manually call a Cloud Function
const createProjectFn = httpsCallable(functions, 'createProject');
const result = await createProjectFn({
  name: 'Test Project',
  type: 'hvac',
  description: 'Console test'
});
console.log('Result:', result.data);

// Query Firestore directly
const snapshot = await getDocs(collection(db, 'projects'));
snapshot.forEach(doc => console.log(doc.id, doc.data()));

// Upload file programmatically
const storageRef = ref(storage, 'projects/test-project/files/test.txt');
await uploadBytes(storageRef, new Blob(['Hello World']));
console.log('File uploaded');
```

---

## Debugging

### Frontend Debugging

**Browser DevTools**:
- **Console**: View logs, errors, and debug statements
- **Network**: Inspect Firebase API calls and responses
- **Application**: View localStorage, IndexedDB, cookies
- **Sources**: Set breakpoints in JavaScript files

**Common Issues**:

| Issue | Solution |
|-------|----------|
| Module not loading | Check console for 404 errors; verify file paths |
| Firebase not connecting | Verify `firebase-config.js` exports are correct |
| Callable function 404 | Ensure Functions emulator is running |
| CORS error in dev | Use Hosting emulator (port 5000), not direct file:// |

### Cloud Functions Debugging

**Terminal Logs**:
- Functions emulator prints logs to terminal
- Use `functions.logger.info()`, `.warn()`, `.error()`

**Emulator UI Logs**:
- http://localhost:4000 → Logs tab
- Filter by function name
- Shows request/response payloads

**Example Debug Logging**:

```javascript
exports.createProject = functions.https.onCall(async (data, context) => {
  functions.logger.info('createProject called', { 
    uid: context.auth?.uid, 
    data 
  });
  
  try {
    // Your logic
    const result = await someOperation();
    functions.logger.info('Project created', { projectId: result.id });
    return { success: true };
  } catch (error) {
    functions.logger.error('createProject failed', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
```

### Security Rules Debugging

**Firestore Rules**:
- Emulator UI → Firestore → Rules Playground
- Test rules with specific auth context and data

**Storage Rules**:
- Use console tests or Postman to simulate requests
- Check emulator logs for rule evaluation details

---

## Code Style & Conventions

### JavaScript Style

- **ES6 Modules**: Use `import`/`export`
- **Async/Await**: Preferred over `.then()` chains
- **Const/Let**: No `var`
- **Naming**:
  - Functions: `camelCase` (e.g., `createProject`)
  - Classes: `PascalCase` (e.g., `AuthManager`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_ROLE`)
  - Files: `kebab-case.js` (e.g., `file-upload.js`)

### Cloud Functions Style

- **Callable Functions**: For client invocations
- **Error Handling**: Use `functions.https.HttpsError` with proper codes
- **Logging**: Use `functions.logger` (not `console.log`)
- **Auth Check**: Always verify `context.auth` exists
- **Input Validation**: Validate all input data before Firestore writes

**Example**:

```javascript
exports.myFunction = functions.https.onCall(async (data, context) => {
  // Auth check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be signed in');
  }
  
  // Input validation
  if (!data.requiredField) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required field');
  }
  
  // Logging
  functions.logger.info('myFunction called', { uid: context.auth.uid, data });
  
  try {
    // Business logic
    const result = await doSomething(data);
    return { success: true, result };
  } catch (error) {
    functions.logger.error('myFunction error', error);
    throw new functions.https.HttpsError('internal', 'Operation failed');
  }
});
```

---

## Git Workflow

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/**: Feature branches (e.g., `feature/cad-editor`)
- **bugfix/**: Bug fix branches (e.g., `bugfix/upload-error`)
- **hotfix/**: Emergency production fixes

### Commit Messages

Follow conventional commits:

```
type(scope): Short description

Longer description if needed.

Fixes #123
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Add/update tests
- `chore`: Build/config changes

**Examples**:
```
feat(auth): Add Google OAuth provider
fix(upload): Handle large file timeout
docs(api): Document calculation functions
refactor(projects): Extract calculation logic
```

---

## Performance Optimization

### Frontend Optimization

**Lazy Loading**:
```javascript
// Load admin panel only when needed
if (userRole === 'admin') {
  import('./admin.js').then(module => {
    module.initAdminPanel();
  });
}
```

**Firestore Caching**:
```javascript
// Use local cache for offline support
const db = getFirestore(app);
enableIndexedDbPersistence(db);
```

**Detach Listeners**:
```javascript
// Always detach listeners when component unmounts
const unsubscribe = onSnapshot(query, snapshot => {
  // Handle updates
});

// Later:
unsubscribe();
```

### Cloud Functions Optimization

**Singleton Pattern**:
```javascript
// Initialize once outside handler
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.myFunction = functions.https.onCall(async () => {
  // Reuse db instance
  const snapshot = await db.collection('data').get();
});
```

**Batch Operations**:
```javascript
const batch = admin.firestore().batch();
refs.forEach(ref => batch.set(ref, data));
await batch.commit(); // Single network call
```

---

## Testing Best Practices

### Unit Testing (Future)

When adding tests, use Jest or Mocha:

```javascript
// functions/test/createProject.test.js
const test = require('firebase-functions-test')();
const myFunctions = require('../index');

describe('createProject', () => {
  it('should create project with valid data', async () => {
    const wrapped = test.wrap(myFunctions.createProject);
    const result = await wrapped({
      name: 'Test Project',
      type: 'hvac'
    }, { auth: { uid: 'test-uid' } });
    
    expect(result.success).toBe(true);
  });
});
```

### Integration Testing

Test full flows with emulators:

1. Start emulators with test data
2. Run automated browser tests (Puppeteer, Playwright)
3. Verify Firestore/Storage state after operations

---

## Deployment Workflow

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Firestore rules tested
- [ ] Storage rules tested
- [ ] Environment variables configured
- [ ] Backup current production data
- [ ] Update CHANGELOG.md

### Deployment Commands

```powershell
# Deploy everything
firebase deploy

# Deploy specific services
firebase deploy --only functions
firebase deploy --only hosting
firebase deploy --only firestore:rules
firebase deploy --only storage:rules

# Deploy specific function
firebase deploy --only functions:createProject
```

### Post-Deployment Verification

1. Open production URL
2. Test authentication
3. Create test project
4. Run calculations
5. Upload test file
6. Check Firebase Console for errors
7. Monitor function execution times

---

## Troubleshooting Common Issues

### Emulator Won't Start

**Java Not Found**:
```powershell
# Install Java 17+
# Download from: https://adoptium.net/temurin/releases/
java -version
```

**Port Already in Use**:
```powershell
# Find process using port
netstat -ano | findstr :5001

# Kill process
taskkill /PID <PID> /F

# Or change port in firebase.json
```

### Functions Not Updating

```powershell
# Clear Functions cache
rm -rf functions/node_modules
cd functions
npm install
cd ..

# Restart emulators
firebase emulators:start
```

### CORS Errors

- Use Hosting emulator (port 5000), not `file://` protocol
- Callable functions handle CORS automatically
- For HTTP functions, add CORS middleware

### Firestore Permission Denied

- Check security rules in `firestore.rules`
- Verify user is authenticated
- Use Emulator UI Rules Playground to test

---

## VS Code Extensions (Recommended)

- **Firebase Explorer**: Browse Firestore/Storage in editor
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **Live Server**: Alternative to Hosting emulator
- **Firebase Snippets**: Code snippets for Firebase

---

## Next Steps

1. Read [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md) for frontend architecture
2. Read [FUNCTIONS_API.md](../api/FUNCTIONS_API.md) for API documentation
3. See [MEP_CALCULATIONS.md](../MEP_CALCULATIONS.md) for calculation formulas
4. Check [ROADMAP.md](../ROADMAP.md) for planned features

Happy coding! 🚀
