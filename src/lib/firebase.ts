
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
// For this prototype, we're hardcoding the admin emails.
// In a production app, you should use Firebase Custom Claims for role-based access control.
const ADMIN_EMAILS = ['ajayvasanth@psgitech.ac.in', 'you@example.com'];

// Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

/**
 * Checks if a user's email is in the list of admin emails.
 * @param email The user's email address.
 * @returns A boolean indicating if the user is an admin.
 */
const isAdmin = async (email: string | null): Promise<boolean> => {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email);
};


export { app, storage, auth, provider, isAdmin };
