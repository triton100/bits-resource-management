import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export async function getUserRole(): Promise<"admin" | "resource"> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");
  
    const token = await user.getIdTokenResult(true);
    return token.claims.role as "admin" | "resource";
  };
  
