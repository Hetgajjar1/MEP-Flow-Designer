// Authentication Module for MEP Flow Designer
import { auth, functions, db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { httpsCallable } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-functions.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isSignupMode = false;
        this.initializeEventListeners();
        this.initializeAuthStateListener();
    }

    initializeEventListeners() {
        // Modal controls
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        const getStartedBtn = document.getElementById('get-started-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const authModal = document.getElementById('auth-modal');
        const authForm = document.getElementById('auth-form');
        const authSwitchLink = document.getElementById('auth-switch-link');
        const closeButtons = document.querySelectorAll('.close');

        // Open login modal
        [loginBtn, getStartedBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', () => this.openAuthModal(false));
            }
        });

        // Open signup modal
        if (signupBtn) {
            signupBtn.addEventListener('click', () => this.openAuthModal(true));
        }

        // Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Form submission
        if (authForm) {
            authForm.addEventListener('submit', (e) => this.handleAuthSubmit(e));
        }

        // Switch between login/signup
        if (authSwitchLink) {
            authSwitchLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAuthMode();
            });
        }

        // Close modals
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeModals());
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });
    }

    initializeAuthStateListener() {
        onAuthStateChanged(auth, async (user) => {
            this.currentUser = user;
            // Try to resolve and cache role via claims or Firestore
            if (user) {
                const role = await this.resolveUserRole(user);
                if (role) {
                    localStorage.setItem('mep_user_role', role);
                }
            }
            this.updateUIForAuthState(user);
        });
    }

    openAuthModal(isSignup = false) {
        this.isSignupMode = isSignup;
        this.updateAuthModalMode();
        document.getElementById('auth-modal').style.display = 'block';
    }

    updateAuthModalMode() {
        const title = document.getElementById('auth-title');
        const submitBtn = document.getElementById('auth-submit');
        const nameGroup = document.getElementById('name-group');
        const roleGroup = document.getElementById('role-group');
        const switchText = document.getElementById('auth-switch-text');
        const switchLink = document.getElementById('auth-switch-link');

        if (this.isSignupMode) {
            title.textContent = 'Sign Up';
            submitBtn.textContent = 'Sign Up';
            nameGroup.style.display = 'block';
            roleGroup.style.display = 'block';
            switchText.textContent = 'Already have an account?';
            switchLink.textContent = 'Log in';
            document.getElementById('name').required = true;
        } else {
            title.textContent = 'Login';
            submitBtn.textContent = 'Login';
            nameGroup.style.display = 'none';
            roleGroup.style.display = 'none';
            switchText.textContent = "Don't have an account?";
            switchLink.textContent = 'Sign up';
            document.getElementById('name').required = false;
        }
    }

    toggleAuthMode() {
        this.isSignupMode = !this.isSignupMode;
        this.updateAuthModalMode();
        // Clear form
        document.getElementById('auth-form').reset();
        this.clearMessages();
    }

    async handleAuthSubmit(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const name = document.getElementById('name').value.trim();
        const role = document.getElementById('role').value;

        if (!email || !password) {
            this.showMessage('Please fill in all required fields', 'error');
            return;
        }

        if (this.isSignupMode && !name) {
            this.showMessage('Please enter your full name', 'error');
            return;
        }

        try {
            this.setLoading(true);
            
            if (this.isSignupMode) {
                await this.signup(email, password, name, role);
            } else {
                await this.login(email, password);
            }
        } catch (error) {
            this.showMessage(this.getErrorMessage(error), 'error');
        } finally {
            this.setLoading(false);
        }
    }

    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful:', userCredential.user.email);
            this.closeModals();
            this.showMessage('Login successful!', 'success');
        } catch (error) {
            throw error;
        }
    }

    async signup(email, password, name, role) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Update profile with name
            await updateProfile(userCredential.user, {
                displayName: name
            });

            // Persist role and profile via Cloud Function
            try {
                const updateProfileFn = httpsCallable(functions, 'updateUserProfile');
                await updateProfileFn({ name, role });
                // Immediately sync custom claims so role-based UI appears without re-login
                const syncClaimsFn = httpsCallable(functions, 'syncMyClaims');
                await syncClaimsFn();
                // Refresh ID token to pick up claims
                await auth.currentUser.getIdToken(true);
                localStorage.setItem('mep_user_role', role);
            } catch (fnError) {
                console.warn('Profile/claims sync failed:', fnError.message);
                localStorage.setItem('mep_user_role', role); // still cache locally
            }

            this.closeModals();
            this.showMessage('Account created successfully!', 'success');
        } catch (error) {
            throw error;
        }
    }

    async logout() {
        try {
            await signOut(auth);
            console.log('Logout successful');
            this.showMessage('Logged out successfully', 'success');
        } catch (error) {
            this.showMessage('Error logging out: ' + error.message, 'error');
        }
    }

    updateUIForAuthState(user) {
        const loginSection = document.getElementById('login-section');
        const userSection = document.getElementById('user-section');
        const dashboard = document.getElementById('dashboard');
        const welcomeSection = document.getElementById('welcome-section');
        const userEmail = document.getElementById('user-email');
        const newProjectBtn = document.getElementById('new-project-btn');
        const adminPanel = document.getElementById('admin-panel');

        if (user) {
            // User is logged in
            loginSection.style.display = 'none';
            userSection.style.display = 'block';
            dashboard.style.display = 'block';
            welcomeSection.style.display = 'none';
            
            userEmail.textContent = user.displayName || user.email;
            // Retrieve role from Firestore if loaded later; fallback to designer
            // We stored it via Cloud Function; for now optimistic gating based on cached value in localStorage
            const cachedRole = localStorage.getItem('mep_user_role') || 'designer';
            this.applyRolePermissions(cachedRole);
            if (adminPanel) adminPanel.style.display = cachedRole === 'admin' ? 'block' : 'none';
            
            console.log('User logged in:', {
                email: user.email,
                displayName: user.displayName,
                uid: user.uid
            });
        } else {
            // User is not logged in
            loginSection.style.display = 'block';
            userSection.style.display = 'none';
            dashboard.style.display = 'none';
            welcomeSection.style.display = 'block';
            if (newProjectBtn) newProjectBtn.disabled = false;
            
            console.log('User logged out');
            if (adminPanel) adminPanel.style.display = 'none';
        }
    }

    applyRolePermissions(role) {
        const newProjectBtn = document.getElementById('new-project-btn');
        if (!newProjectBtn) return;
        // Reviewers cannot create projects; designers & engineers can; admins always can
        const canCreate = ['designer', 'engineer', 'admin'].includes(role);
        newProjectBtn.disabled = !canCreate;
        newProjectBtn.title = canCreate ? '' : 'Your role does not permit creating projects';
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
        document.getElementById('auth-form').reset();
        this.clearMessages();
    }

    setLoading(isLoading) {
        const submitBtn = document.getElementById('auth-submit');
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Loading...';
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = this.isSignupMode ? 'Sign Up' : 'Login';
        }
    }

    showMessage(message, type = 'info') {
        this.clearMessages();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        const form = document.getElementById('auth-form');
        form.insertBefore(messageDiv, form.firstChild);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }

    clearMessages() {
        document.querySelectorAll('.message').forEach(msg => msg.remove());
    }

    getErrorMessage(error) {
        switch (error.code) {
            case 'auth/user-not-found':
                return 'No account found with this email address';
            case 'auth/wrong-password':
                return 'Incorrect password';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters';
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later';
            default:
                return error.message || 'An error occurred. Please try again.';
        }
    }

    // Public methods for other modules
    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    async resolveUserRole(user) {
        if (!user) return null;
        // Try custom claims first
        try {
            const tokenResult = await user.getIdTokenResult(true);
            if (tokenResult?.claims?.role) return tokenResult.claims.role;
        } catch (e) {
            console.warn('Token claim fetch failed', e);
        }
        // Fallback to Firestore user doc
        try {
            const snap = await getDoc(doc(db, 'users', user.uid));
            if (snap.exists()) return snap.data().role || null;
        } catch (e) {
            console.warn('Firestore role fetch failed', e);
        }
        return null;
    }
}

// Initialize and export auth manager
export const authManager = new AuthManager();

// Export auth state for other modules
export { auth };