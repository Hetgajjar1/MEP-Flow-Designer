// Firebase Configuration for MEP Flow Designer - Phase 2
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { 
    getAuth, 
    connectAuthEmulator 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js';
import { 
    getFirestore, 
    connectFirestoreEmulator 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js';
import { 
    getStorage, 
    connectStorageEmulator 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js';
import { 
    getFunctions, 
    connectFunctionsEmulator 
} from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-functions.js';

// Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyCfnnp5rU-m3_ehRDDjwbGiry70f7dMI4g",
    authDomain: "flowforge-mep-designer.firebaseapp.com",
    projectId: "flowforge-mep-designer",
    storageBucket: "flowforge-mep-designer.firebasestorage.app",
    messagingSenderId: "315884145061",
    appId: "1:315884145061:web:592e38393400ecc11b804c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Development environment detection
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname === '';

// Connect to Firebase Emulators in development
if (isDevelopment) {
    console.log('🔧 Phase 2 Development mode: Connecting to all Firebase Emulators');
    
    // Connect to Auth Emulator
    try {
        connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
        console.log('✅ Connected to Auth Emulator (Port 9099)');
    } catch (error) {
        console.warn('⚠️ Auth Emulator connection failed:', error);
    }
    
    // Connect to Firestore Emulator
    try {
        connectFirestoreEmulator(db, '127.0.0.1', 8080);
        console.log('✅ Connected to Firestore Emulator (Port 8080)');
    } catch (error) {
        console.warn('⚠️ Firestore Emulator not available (requires Java 11+):', error.message);
    }
    
    // Connect to Functions Emulator
    try {
        connectFunctionsEmulator(functions, '127.0.0.1', 5001);
        console.log('✅ Connected to Functions Emulator (Port 5001)');
    } catch (error) {
        console.warn('⚠️ Functions Emulator not available:', error.message);
    }
    
    // Connect to Storage Emulator
    try {
        connectStorageEmulator(storage, '127.0.0.1', 9199);
        console.log('✅ Connected to Storage Emulator (Port 9199)');
    } catch (error) {
        console.warn('⚠️ Storage Emulator not available:', error.message);
    }
} else {
    console.log('🚀 Production mode: Using Firebase Cloud services');
}

// Export configuration status
export const config = {
    isDevelopment,
    projectId: firebaseConfig.projectId,
    emulators: {
        auth: isDevelopment,
        firestore: isDevelopment,
        functions: isDevelopment,
        storage: isDevelopment
    }
};

console.log('🔥 Firebase Phase 2 initialized for MEP Flow Designer');