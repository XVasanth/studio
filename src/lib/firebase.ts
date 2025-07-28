
import { initializeApp, getApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBBKlcHaUnzS13C3YDTjhcfr1IftgRXXt0",
  authDomain: "cad-comparator.firebaseapp.com",
  projectId: "cad-comparator",
  storageBucket: "cad-comparator.firebasestorage.app",
  messagingSenderId: "185419698184",
  appId: "1:185419698184:web:a9db6f767e879da01a41bd"
};

// --- IMPORTANT ---
// This is the single email address that will have admin access.
// You must add this user in the Firebase Authentication console and set a password for them.
const ADMIN_EMAIL = 'ajayvasanth@psgitech.ac.in';

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

/**
 * Checks if a user's email is the designated admin email.
 * @param email The user's email address.
 * @returns A boolean indicating if the user is the admin.
 */
const isAdmin = async (email: string | null): Promise<boolean> => {
    if (!email) return false;
    return email === ADMIN_EMAIL;
};


export { app, storage, auth, provider, isAdmin, ADMIN_EMAIL };
