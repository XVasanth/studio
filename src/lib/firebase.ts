
import { initializeApp, getApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
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
