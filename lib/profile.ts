import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "./firebase"

export interface UserProfile {
  name: string
  email: string
  role: string
  department: string
  bio: string
  location: string
  phone: string
  joinDate: string 
}

const PROFILE_COLLECTION = "profiles"

// Fetch profile for a user by UID
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, PROFILE_COLLECTION, uid)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    return snap.data() as UserProfile
  }
  return null
}

// Create profile only if it doesn't exist
export async function createUserProfileIfMissing(uid: string, profile: UserProfile): Promise<void> {
  const existing = await fetchUserProfile(uid)
  if (!existing) {
    const ref = doc(db, PROFILE_COLLECTION, uid)
    await setDoc(ref, profile)
  }
}

// Update profile (on save from edit page)
export async function updateUserProfile(uid: string, updatedProfile: Partial<UserProfile>): Promise<void> {
  const ref = doc(db, PROFILE_COLLECTION, uid)
  await updateDoc(ref, updatedProfile)
}

// ✅ New: Get or create profile from Auth user
export async function getOrCreateUserProfile(uid: string, authUser: { displayName: string | null, email: string | null }): Promise<UserProfile> {
  const existing = await fetchUserProfile(uid)
  if (existing) return existing

  const now = new Date().toISOString()
  const newProfile: UserProfile = {
    name: authUser.displayName ?? "New User",
    email: authUser.email ?? "unknown@example.com",
    role: "",
    department: "",
    bio: "",
    location: "",
    phone: "",
    joinDate: now,
  }

  await setDoc(doc(db, PROFILE_COLLECTION, uid), newProfile)
  return newProfile
}
