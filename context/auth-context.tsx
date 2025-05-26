
// "use client"
// import type React from "react"
// import { createContext, useContext, useEffect, useState } from "react"
// import { onAuthStateChanged } from "firebase/auth"
// import { doc, getDoc } from "firebase/firestore"
// import { auth, db } from "@/lib/firebase"

// type UserRole = "admin" | "resource"

// interface UserData {
//   uid: string
//   email: string | null
//   displayName: string | null
//   photoURL: string | null
//   role: UserRole
// }

// interface AuthContextType {
//   user: UserData | null
//   loading: boolean
//   isAdmin: boolean
//   authChecked: boolean
// }

// const AuthContext = createContext<AuthContextType>({
//   user: null,
//   loading: true,
//   isAdmin: false,
//   authChecked: false,
// })

// export const useAuth = () => useContext(AuthContext)

// export function AuthProvider({ children }: { children: React.ReactNode }) {
//   const [user, setUser] = useState<UserData | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [authChecked, setAuthChecked] = useState(false)

//   useEffect(() => {
//     console.log("Auth provider initializing...")

//     const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
//       console.log("Auth state changed:", firebaseUser ? `User: ${firebaseUser.email}` : "No user")

//       try {
//         if (firebaseUser) {
//           // If email/password user, ensure email is verified
//           const isEmailPassword = firebaseUser.providerData.some(
//             (provider) => provider.providerId === "password"
//           )
//           if (isEmailPassword && !firebaseUser.emailVerified) {
//             console.log("Email not verified, setting user to null")
//             setUser(null)
//             return
//           }

//           // Fetch user role and extra info from Firestore
//           const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
//           const userData = userDoc.exists() ? userDoc.data() : {}

//           setUser({
//             uid: firebaseUser.uid,
//             email: firebaseUser.email,
//             displayName: firebaseUser.displayName || userData.fullName || null,
//             photoURL: firebaseUser.photoURL,
//             role: userData.role || "resource",
//           })
//         } else {
//           setUser(null)
//         }
//       } catch (error) {
//         console.error("Error fetching user data:", error)
//         if (firebaseUser) {
//           setUser({
//             uid: firebaseUser.uid,
//             email: firebaseUser.email,
//             displayName: firebaseUser.displayName,
//             photoURL: firebaseUser.photoURL,
//             role: "resource",
//           })
//         } else {
//           setUser(null)
//         }
//       } finally {
//         setTimeout(() => {
//           setLoading(false)
//           setAuthChecked(true)
//           console.log("Auth loading complete")
//         }, 500)
//       }
//     })

//     return () => unsubscribe()
//   }, [])

//   const isAdmin = user?.role === "admin"

//   return (
//     <AuthContext.Provider value={{ user, loading, isAdmin, authChecked }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }


"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useMemo } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"

type UserRole = "admin" | "resource"

interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role: UserRole
}

interface AuthContextType {
  user: UserData | null
  loading: boolean
  isAdmin: boolean
  authChecked: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  authChecked: false,
  logout: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    console.log("Auth provider initializing...")

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser ? `User: ${firebaseUser.email}` : "No user")

      try {
        if (firebaseUser) {
          // If email/password user, ensure email is verified
          const isEmailPassword = firebaseUser.providerData.some(
            (provider) => provider.providerId === "password"
          )
          if (isEmailPassword && !firebaseUser.emailVerified) {
            console.log("Email not verified, setting user to null")
            setUser(null)
            return
          }

          // Fetch user role and extra info from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          const userData = userDoc.exists() ? userDoc.data() : {}

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || userData.fullName || null,
            photoURL: firebaseUser.photoURL,
            role: userData.role || "resource",
          })
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: "resource",
          })
        } else {
          setUser(null)
        }
      } finally {
        setTimeout(() => {
          setLoading(false)
          setAuthChecked(true)
          console.log("Auth loading complete")
        }, 500)
      }
    })

    return () => unsubscribe()
  }, [])

  async function logout() {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const isAdmin = user?.role === "admin"

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      isAdmin,
      authChecked,
      logout,
    }),
    [user, loading, isAdmin, authChecked]
  )

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

