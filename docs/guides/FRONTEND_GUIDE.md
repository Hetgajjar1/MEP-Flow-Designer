# Frontend Guide

## Overview

The MEP Flow Designer frontend is built with **vanilla JavaScript (ES6 modules)**, HTML5, and CSS3. This approach provides simplicity, zero build time, and direct browser support for modern features.

---

## Module Architecture

### Module Organization

```
public/js/
├── firebase-config.js    # Firebase initialization & emulator setup
├── auth.js               # Authentication flows & role management
├── projects.js           # Project CRUD & calculations
├── file-upload.js        # Storage uploads & file management
├── admin.js              # Admin panel (role management)
└── app.js                # Application bootstrap & global handlers
```

### Module Loading

**index.html**:
```html
<script type="module" src="js/firebase-config.js"></script>
<script type="module" src="js/auth.js"></script>
<script type="module" src="js/projects.js"></script>
<script type="module" src="js/file-upload.js"></script>
<script type="module" src="js/admin.js"></script>
<script type="module" src="js/app.js"></script>
```

All modules load as ES6 modules (`type="module"`), enabling:
- Import/export syntax
- Deferred execution (no blocking)
- Scoped variables (no global pollution)

---

## Core Modules

### 1. firebase-config.js

**Purpose**: Initialize Firebase SDK and connect to emulators in development.

**Exports**:
```javascript
export const auth;       // Firebase Authentication instance
export const db;         // Firestore instance
export const storage;    // Cloud Storage instance
export const functions;  // Cloud Functions instance
export const config;     // Configuration object
```

**Key Features**:
- Detects `localhost` and auto-connects to emulators
- Exports service instances for use in other modules
- Handles emulator connection errors gracefully

**Usage in Other Modules**:
```javascript
import { auth, db, functions } from './firebase-config.js';
```

---

### 2. auth.js

**Purpose**: Handle user authentication, role resolution, and UI state management.

**Class**: `AuthManager`

**Key Methods**:
- `openAuthModal(isSignup)`: Opens login/signup modal
- `login(email, password)`: Email/password login
- `signup(email, password, name, role)`: Create account + persist role
- `logout()`: Sign out user
- `updateUIForAuthState(user)`: Toggle UI based on auth state
- `applyRolePermissions(role)`: Enable/disable features by role
- `resolveUserRole(user)`: Read role from custom claims or Firestore

**Auth State Management**:
```javascript
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User logged in
    const role = await this.resolveUserRole(user);
    localStorage.setItem('mep_user_role', role);
    this.updateUIForAuthState(user);
  } else {
    // User logged out
    this.updateUIForAuthState(null);
  }
});
```

**Role Resolution Flow**:
1. Check custom claims in JWT token
2. Fallback to Firestore `users/{uid}.role`
3. Default to `null` if both fail

**Exports**:
```javascript
export const authManager;  // Singleton instance
export { auth };           // Re-export auth instance
```

---

### 3. projects.js

**Purpose**: Project management, real-time dashboard, calculations, and file uploads.

**Class**: `ProjectsManager`

**Key Methods**:
- `setupRealtimeProjectListener()`: Firestore `onSnapshot` for live updates
- `renderProjects()`: Render project cards in grid
- `handleProjectSubmit(e)`: Create new project via callable
- `runCalculations(projectId)`: Orchestrate 4 calculation callables
- `showCalculationResults(results)`: Display results in modal
- `updateProjectStats()`: Update dashboard statistics

**Real-Time Dashboard**:
```javascript
setupRealtimeProjectListener() {
  const projectsQuery = query(
    collection(db, 'projects'),
    where('createdBy', '==', auth.currentUser.uid),
    orderBy('createdAt', 'desc')
  );

  this.unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
    this.projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    this.renderProjects();
    this.updateProjectStats();
  });
}
```

**Calculation Orchestration**:
```javascript
async runCalculations(projectId) {
  const role = localStorage.getItem('mep_user_role');
  if (!['engineer', 'admin'].includes(role)) {
    this.showMessage('Engineer or admin role required', 'error');
    return;
  }

  const systems = ['HVAC', 'Electrical', 'Plumbing', 'FireProtection'];
  const results = {};

  for (const system of systems) {
    const fn = httpsCallable(functions, `calculate${system}Load`);
    const response = await fn({ projectId });
    results[system] = response.data.results;
  }

  this.showCalculationResults(results);
}
```

**Exports**:
```javascript
export const projectsManager;  // Singleton instance
```

---

### 4. file-upload.js

**Purpose**: Handle file uploads to Cloud Storage with progress tracking.

**Class**: `FileUploadManager`

**Key Methods**:
- `uploadFile(file, projectId)`: Upload file with progress
- `processFileMetadata(projectId, fileName, downloadURL)`: Save metadata via callable
- `setupDragAndDrop(element, projectId)`: Enable drag-and-drop
- `renderFileList(projectId)`: Display uploaded files

**Upload with Progress**:
```javascript
async uploadFile(file, projectId) {
  const storageRef = ref(storage, `projects/${projectId}/files/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  uploadTask.on('state_changed',
    (snapshot) => {
      // Progress updates
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      this.updateProgress(progress);
    },
    (error) => {
      // Error handling
      console.error('Upload error', error);
    },
    async () => {
      // Complete
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
      await this.processFileMetadata(projectId, file.name, downloadURL);
    }
  );
}
```

**Exports**:
```javascript
export const fileUploadManager;  // Singleton instance
```

---

### 5. admin.js

**Purpose**: Admin-only role management panel.

**Class**: `AdminPanel`

**Key Methods**:
- `loadUsers()`: Fetch all users via `listUsersProfiles` callable
- `renderUsers()`: Display user list with role badges
- `handleSetRole()`: Change user role via `setUserRole` callable
- `quickAdjustRole(e)`: Promote/demote shortcut buttons

**Role Management UI**:
```javascript
async loadUsers() {
  const listUsersFn = httpsCallable(functions, 'listUsersProfiles');
  const res = await listUsersFn();
  this.cache.users = res.data.users || [];
  this.renderUsers();
}

async applyRoleChange(uid, role) {
  const setUserRoleFn = httpsCallable(functions, 'setUserRole');
  await setUserRoleFn({ uid, role });
  // Refresh list to show updated role
  setTimeout(() => this.loadUsers(), 500);
}
```

**Visibility Gating**:
```javascript
// Only initialize if admin panel exists in DOM
if (document.getElementById('admin-panel')) {
  window.mepAdminPanel = new AdminPanel();
}
```

**Exports**:
```javascript
// Admin panel available globally as window.mepAdminPanel
```

---

### 6. app.js

**Purpose**: Application bootstrap and global event handlers.

**Responsibilities**:
- Initialize all managers on page load
- Set up global error handlers
- Manage modal open/close logic
- Handle window resize events
- Clean up listeners on page unload

**Example**:
```javascript
// Wait for DOM ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('MEP Flow Designer initialized');
  
  // Close modals on outside click
  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.style.display = 'none';
    }
  });
});
```

---

## UI Patterns

### Modal Dialogs

**Structure**:
```html
<div id="auth-modal" class="modal" style="display: none;">
  <div class="modal-content">
    <span class="close">&times;</span>
    <h2 id="auth-title">Login</h2>
    <form id="auth-form">
      <!-- Form fields -->
    </form>
  </div>
</div>
```

**Open Modal**:
```javascript
document.getElementById('auth-modal').style.display = 'block';
```

**Close Modal**:
```javascript
document.getElementById('auth-modal').style.display = 'none';
```

**Close on X or Outside Click**:
```javascript
document.querySelectorAll('.close').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.modal').style.display = 'none';
  });
});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) {
    e.target.style.display = 'none';
  }
});
```

---

### Dashboard Grid

**HTML**:
```html
<div id="projects-grid" class="projects-grid">
  <!-- Project cards dynamically inserted -->
</div>
```

**CSS**:
```css
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
```

**Rendering Cards**:
```javascript
renderProjects() {
  const grid = document.getElementById('projects-grid');
  grid.innerHTML = '';
  
  this.projects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <h3>${project.name}</h3>
      <p>${project.type}</p>
      <button onclick="projectsManager.runCalculations('${project.id}')">
        Run Calculations
      </button>
    `;
    grid.appendChild(card);
  });
}
```

---

### Progress Bars

**HTML**:
```html
<div class="progress-bar">
  <div class="progress-fill" style="width: 0%;"></div>
</div>
```

**Update Progress**:
```javascript
updateProgress(percent) {
  const fill = document.querySelector('.progress-fill');
  fill.style.width = `${percent}%`;
}
```

---

### Message Notifications

**Show Message**:
```javascript
showMessage(message, type = 'info') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = message;
  
  document.body.appendChild(messageDiv);
  
  // Auto-remove after 5 seconds
  setTimeout(() => messageDiv.remove(), 5000);
}
```

**CSS**:
```css
.message {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 1rem 1.5rem;
  border-radius: 6px;
  animation: slideIn 0.3s ease;
}
.message.success { background: #4caf50; color: white; }
.message.error { background: #f44336; color: white; }
.message.info { background: #2196f3; color: white; }
```

---

## State Management

### Local State (localStorage)

**Keys**:
- `mep_user_role`: Cached user role (designer, engineer, reviewer, admin)
- (Future: `mep_preferences`, `mep_recent_projects`)

**Usage**:
```javascript
// Set
localStorage.setItem('mep_user_role', 'engineer');

// Get
const role = localStorage.getItem('mep_user_role') || 'designer';

// Remove
localStorage.removeItem('mep_user_role');

// Clear all
localStorage.clear();
```

**When to Use**:
- Role caching (avoid Firestore reads on every page load)
- User preferences (theme, units, etc.)
- Temporary UI state (collapsed sections, etc.)

**When NOT to Use**:
- Sensitive data (tokens are handled by Firebase SDK)
- Large datasets (use IndexedDB or Firestore)
- Data that needs multi-device sync (use Firestore)

---

### Remote State (Firestore Real-Time)

**Pattern**:
```javascript
// Set up listener
const unsubscribe = onSnapshot(query, (snapshot) => {
  this.data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  this.render();
});

// Clean up when component unmounts
unsubscribe();
```

**Best Practices**:
- Always detach listeners when done
- Use `where()` and `orderBy()` for efficient queries
- Cache Firestore data in component state to avoid re-renders
- Handle loading/error states

---

## Event Handling

### Form Submission

```javascript
document.getElementById('project-form').addEventListener('submit', async (e) => {
  e.preventDefault();  // Prevent page reload
  
  const formData = {
    name: document.getElementById('project-name').value,
    type: document.getElementById('project-type').value,
  };
  
  await this.handleProjectSubmit(formData);
});
```

### Button Clicks

```javascript
document.getElementById('logout-btn').addEventListener('click', () => {
  authManager.logout();
});
```

### Delegated Events (Dynamic Elements)

```javascript
// For dynamically created elements, use event delegation
document.getElementById('projects-grid').addEventListener('click', (e) => {
  if (e.target.classList.contains('run-calc-btn')) {
    const projectId = e.target.dataset.projectId;
    projectsManager.runCalculations(projectId);
  }
});
```

---

## Error Handling

### Try-Catch Pattern

```javascript
async function someOperation() {
  try {
    const result = await riskyOperation();
    this.showMessage('Success!', 'success');
    return result;
  } catch (error) {
    console.error('Operation failed', error);
    this.showMessage(this.getErrorMessage(error), 'error');
  }
}
```

### Firebase Callable Errors

```javascript
try {
  const fn = httpsCallable(functions, 'createProject');
  const result = await fn(data);
} catch (error) {
  switch (error.code) {
    case 'unauthenticated':
      console.error('User not signed in');
      break;
    case 'permission-denied':
      console.error('Insufficient permissions');
      break;
    case 'invalid-argument':
      console.error('Invalid data', error.message);
      break;
    default:
      console.error('Unknown error', error);
  }
}
```

---

## Performance Tips

### 1. Debounce Search Input

```javascript
let searchTimeout;
document.getElementById('search').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    this.performSearch(e.target.value);
  }, 300);
});
```

### 2. Lazy Load Modules

```javascript
// Load admin panel only when user is admin
if (role === 'admin') {
  import('./admin.js').then(module => {
    window.adminPanel = new module.AdminPanel();
  });
}
```

### 3. Virtual Scrolling (Future)

For large lists, render only visible items:
```javascript
// Implement IntersectionObserver for lazy rendering
```

### 4. Minimize Firestore Reads

```javascript
// Cache data locally
let cachedProjects = [];

function getProjects() {
  if (cachedProjects.length > 0) {
    return Promise.resolve(cachedProjects);
  }
  return fetchFromFirestore();
}
```

---

## Accessibility (a11y)

### Keyboard Navigation

```javascript
// Add keyboard support for modals
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.style.display = 'none';
    });
  }
});
```

### ARIA Labels

```html
<button aria-label="Close modal" class="close">&times;</button>
<input aria-describedby="email-help" id="email" type="email">
<span id="email-help">Enter your work email address</span>
```

### Focus Management

```javascript
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.style.display = 'block';
  modal.querySelector('input')?.focus();  // Focus first input
}
```

---

## Testing Frontend Code

### Manual Testing

1. Open DevTools Console
2. Run code snippets to test functions
3. Inspect Network tab for Firebase calls
4. Use Firestore Emulator UI to verify data

### Automated Testing (Future)

**Playwright Example**:
```javascript
test('user can create project', async ({ page }) => {
  await page.goto('http://localhost:5000');
  await page.click('#login-btn');
  await page.fill('#email', 'test@example.com');
  await page.fill('#password', 'test123');
  await page.click('#auth-submit');
  await page.click('#new-project-btn');
  await page.fill('#project-name', 'Test Project');
  await page.selectOption('#project-type', 'hvac');
  await page.click('button[type="submit"]');
  await expect(page.locator('.project-card')).toContainText('Test Project');
});
```

---

## Future Enhancements

### 1. Component System

Migrate to Web Components:
```javascript
class ProjectCard extends HTMLElement {
  connectedCallback() {
    this.render();
  }
  render() {
    this.innerHTML = `<div class="card">${this.getAttribute('name')}</div>`;
  }
}
customElements.define('project-card', ProjectCard);
```

### 2. State Management Library

Use Zustand, Redux, or similar for complex state:
```javascript
import create from 'zustand';

const useStore = create((set) => ({
  projects: [],
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project]
  }))
}));
```

### 3. Build Step

Add Vite for:
- TypeScript support
- CSS preprocessing (SCSS)
- Tree-shaking
- Code splitting
- Hot Module Replacement (HMR)

---

## Common Patterns Summary

| Pattern | Use Case |
|---------|----------|
| Singleton | Managers (auth, projects, fileUpload) |
| Observer | Firestore real-time listeners |
| Event Delegation | Dynamic element click handling |
| Try-Catch | Async operations, Firebase calls |
| Debounce | Search input, resize events |
| LocalStorage | Role caching, preferences |
| Modal | Auth forms, project creation |

---

## Next Steps

- Read [FUNCTIONS_API.md](../api/FUNCTIONS_API.md) for backend endpoints
- See [MEP_CALCULATIONS.md](../MEP_CALCULATIONS.md) for calculation logic
- Check [ROADMAP.md](../ROADMAP.md) for planned features

