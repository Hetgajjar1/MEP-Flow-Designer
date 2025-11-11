// Firebase Configuration for MEP Flow Designer - Production Ready
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Real Firebase configuration from your project
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

// Export app instance
export default app;

console.log('🔥 Firebase initialized for production:', firebaseConfig.projectId);
