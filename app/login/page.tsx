// REAL ONE

// "use client"

// import { useState, useEffect, useRef } from "react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
// import { doc, setDoc, getDoc } from "firebase/firestore"
// import { auth, db } from "@/lib/firebase"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { useToast } from "@/components/ui/use-toast"
// import { Separator } from "@/components/ui/separator"
// import { useAuth } from "@/context/auth-context"
// import Image from "next/image"

// function AdminRedirect() {
//   const { user, loading, isAdmin } = useAuth();
//   const router = useRouter();
//   console.log("isAdmin? : ", isAdmin);
//   useEffect(() => {
//     // Only proceed if authentication is complete
//     if (!loading) {
//       if (isAdmin) {
//         console.log("Admin user detected, redirecting to admin dashboard");
//         // Redirect admin users to the dashboard/admin route
//         router.push("/admin");
//       } else {
//         console.log("Non-admin user or not logged in");
//       }
//     }
//   }, [loading, isAdmin, router]);

//   return (
//     <div className="p-4">
//       {loading ? (
//         <div className="flex items-center justify-center">
//           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//           <span className="ml-2">Checking authorization...</span>
//         </div>
//       ) : isAdmin ? (
//         <div className="text-green-600">
//           Redirecting to admin dashboard...
//         </div>
//       ) : (
//         <div className="text-red-600">
//           You do not have admin privileges to access this area.
//         </div>
//       )}
//     </div>
//   );
// }


// export default function LoginPage() {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const router = useRouter()
//   const { toast } = useToast()
//   const { user, loading } = useAuth()
  
//   // Use a ref to track if we've already attempted redirection
//   const hasRedirected = useRef(false)

//   // Redirect if already logged in
//       const adminuid = process.env.USER_UID;
//   useEffect(() => {
//     // Only redirect if user is logged in and we haven't already redirected
//     if (!loading && user && !hasRedirected.current) {
//       console.log("User already logged in, redirecting to dashboard")
//       hasRedirected.current = true // Prevent further redirects
   
//        if(user.role==="admin"){
//         router.push("/admin")
//       }else{
//         router.push("/dashboard")
//       }
//       // Redirect to the admin dashboard
//       // router.push("/dashboard/admin"
     
//     }
//   }, [user, loading, router])
//   console.log(user?.uid);
//   const handleEmailLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)
  
//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password)
//       const user = userCredential.user
//       console.log("userCredential2", userCredential);
//       console.log("user2", user);
//       if (!user.emailVerified) {
//         await auth.signOut() // log them out immediately
  
//         toast({
//           variant: "destructive",
//           title: "Email not verified",
//           description: "Please verify your email address before logging in.",
//         })
//         setIsLoading(false)
//         return
//       }
  
//       toast({
//         title: "Login successful",
//         description: "Welcome back to Bits Technologies Resource Management!",
//       })
  
//       // Mark as redirected before pushing to prevent useEffect from triggering again
//       hasRedirected.current = true
//       router.push("/dashboard")

//       console.log("loggin page:", user);
//     } catch (error: any) {
//       console.error("Error during login:", error)
//       toast({
//         variant: "destructive",
//         title: "Login failed",
//         description: error.message || "Please check your credentials and try again.",
//       })
//       setIsLoading(false)
//     }
//   }
  


















  
//   const handleGoogleLogin = async () => {
//     setIsLoading(true)

//     try {
//       const provider = new GoogleAuthProvider()
//       const result = await signInWithPopup(auth, provider)
//       const user = result.user

//       // Ensure user doc exists
//       const userDocRef = doc(db, "users", user.uid)
//       const userDoc = await getDoc(userDocRef)

//       if (!userDoc.exists()) {
//         await setDoc(userDocRef, {
//           fullName: user.displayName || "User",
//           email: user.email,
//           photoURL: user.photoURL,
//           role: "resource",
//           createdAt: new Date().toISOString(),
//         })

//         toast({
//           title: "Account created",
//           description: "Welcome to Bits Technologies Resource Management!",
//         })
//       } else {
//         toast({
//           title: "Login successful",
//           description: "Welcome back to Bits Technologies Resource Management!",
//         })
//       }

//       // Mark as redirected before pushing to prevent useEffect from triggering again
//       hasRedirected.current = true
//       router.push("/dashboard")
//     } catch (error: any) {
//       console.error("Error during Google login:", error)
//       toast({
//         variant: "destructive",
//         title: "Login failed",
//         description: error.message || "There was an error with Google authentication.",
//       })
//       setIsLoading(false)
//     }
//   }

//   // Show loading if auth is still being determined
//   if (loading) {
//     return <div className="p-4 text-center">Loading...</div>
//   }

//   // Prevent showing login form if user is authenticated and being redirected
//   if (user && !loading) {
//     return <div className="p-4 text-center">Redirecting to dashboard...</div>
//   }

//   return (
//     <div className="flex min-h-screen flex-col">
//       <div className="container flex flex-1 flex-col items-center justify-center px-4 py-12">
//         <div className="mx-auto w-full max-w-md space-y-6">
//           <div className="flex flex-col items-center space-y-2 text-center">
//             <Image src="/logo.png" alt="Bits Technologies Logo" width={180} height={60} priority />
//             <h1 className="text-3xl font-bold text-[#004E98]">Welcome back</h1>
//             <p className="text-gray-500">Log in to access your resource dashboard</p>
//           </div>

//           <div className="space-y-4">
//             <Button
//               type="button"
//               variant="outline"
//               className="w-full"
//               onClick={handleGoogleLogin}
//               disabled={isLoading}
//             >
//               <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
//                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
//                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
//                 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
//                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
//               </svg>
//               Log in with Google
//             </Button>

//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <Separator className="w-full" />
//               </div>
//               <div className="relative flex justify-center text-xs uppercase">
//                 <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
//               </div>
//             </div>

//             <form onSubmit={handleEmailLogin} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="john@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="password">Password</Label>
//                   <Link href="/forgot-password" className="text-sm text-[#F7931E] hover:underline">
//                     Forgot password?
//                   </Link>
//                 </div>
//                 <Input
//                   id="password"
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//               </div>
//               <Button type="submit" className="w-full bg-[#004E98] hover:bg-[#003d77]" disabled={isLoading}>
//                 {isLoading ? "Logging in..." : "Log In"}
//               </Button>
//             </form>

//             <div className="text-center text-sm">
//               Don&apos;t have an account?{" "}
//               <Link href="/signup" className="text-[#F7931E] hover:underline">
//                 Sign up
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }



// "use client";

// import { useState, useEffect, useRef } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import {
//   signInWithEmailAndPassword,
//   GoogleAuthProvider,
//   signInWithPopup,
// } from "firebase/auth";
// import { doc, setDoc, getDoc } from "firebase/firestore";
// import { auth, db } from "@/lib/firebase";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useToast } from "@/components/ui/use-toast";
// import { Separator } from "@/components/ui/separator";
// import { useAuth } from "@/context/auth-context";
// import Image from "next/image";
// import { getIdTokenResult, getAuth } from "firebase/auth"

// export default function LoginPage() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();
//   const { toast } = useToast();
//   const { user, loading } = useAuth();
//   const hasRedirected = useRef(false);

//   console.log("user", user);
//   useEffect(() => {
//     if (!loading && user && !hasRedirected.current) {
//       hasRedirected.current = true;
//       if (user.role === "admin") {
//         router.push("/admin");
//       } else {
//         router.push("/dashboard");
//       }
//     }
//   }, [user, loading, router]);

//   const handleEmailLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
//       const currentUser = userCredential.user;

//       if (!currentUser.emailVerified) {
//         await auth.signOut();
//         toast({
//           variant: "destructive",
//           title: "Email not verified",
//           description: "Please verify your email address before logging in.",
//         });
//         setIsLoading(false);
//         return;
//       }

//       toast({
//         title: "Login successful",
//         description: "Welcome back to Bits Technologies Resource Management!",
//       });

//       hasRedirected.current = true;
//       router.push("/dashboard");
//     } catch (error: any) {
//       console.error("Error during login:", error);
//       toast({
//         variant: "destructive",
//         title: "Login failed",
//         description: error.message || "Please check your credentials and try again.",
//       });
//       setIsLoading(false);
//     }
//   };

//   const handleGoogleLogin = async () => {
//     setIsLoading(true);

//     try {
//       const provider = new GoogleAuthProvider();
//       const result = await signInWithPopup(auth, provider);
//       const currentUser = result.user;

//       const userDocRef = doc(db, "users", currentUser.uid);
//       const userDoc = await getDoc(userDocRef);

//       if (!userDoc.exists()) {
//         await setDoc(userDocRef, {
//           fullName: currentUser.displayName || "User",
//           email: currentUser.email,
//           photoURL: currentUser.photoURL,
//           role: "resource",
//           createdAt: new Date().toISOString(),
//         });

//         toast({
//           title: "Account created",
//           description: "Welcome to Bits Technologies Resource Management!",
//         });
//       } else {
//         toast({
//           title: "Login successful",
//           description: "Welcome back to Bits Technologies Resource Management!",
//         });
//       }

//       hasRedirected.current = true;
//       router.push("/dashboard");
//     } catch (error: any) {
//       console.error("Error during Google login:", error);
//       toast({
//         variant: "destructive",
//         title: "Login failed",
//         description: error.message || "There was an error with Google authentication.",
//       });
//       setIsLoading(false);
//     }
//   };

//   if (loading) {
//     return <div className="p-4 text-center">Loading...</div>;
//   }

//   if (user && !loading) {
//     return <div className="p-4 text-center">Redirecting to dashboard...</div>;
//   }

//   return (
//     <div className="flex min-h-screen flex-col">
//       <div className="container flex flex-1 flex-col items-center justify-center px-4 py-12">
//         <div className="mx-auto w-full max-w-md space-y-6">
//           <div className="flex flex-col items-center space-y-2 text-center">
//             <Image src="/logo.png" alt="Bits Technologies Logo" width={180} height={60} priority />
//             <h1 className="text-3xl font-bold text-[#004E98]">Welcome back</h1>
//             <p className="text-gray-500">Log in to access your resource dashboard</p>
//           </div>

//           <div className="space-y-4">
//             <Button
//               type="button"
//               variant="outline"
//               className="w-full"
//               onClick={handleGoogleLogin}
//               disabled={isLoading}
//             >
//               <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
//                 <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
//                 <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
//                 <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
//                 <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
//               </svg>
//               Log in with Google
//             </Button>

//             <div className="relative">
//               <div className="absolute inset-0 flex items-center">
//                 <Separator className="w-full" />
//               </div>
//               <div className="relative flex justify-center text-xs uppercase">
//                 <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
//               </div>
//             </div>

//             <form onSubmit={handleEmailLogin} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="john@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <div className="flex items-center justify-between">
//                   <Label htmlFor="password">Password</Label>
//                   <Link href="/forgot-password" className="text-sm text-[#F7931E] hover:underline">
//                     Forgot password?
//                   </Link>
//                 </div>
//                 <Input
//                   id="password"
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                 />
//               </div>
//               <Button type="submit" className="w-full bg-[#004E98] hover:bg-[#003d77]" disabled={isLoading}>
//                 {isLoading ? "Logging in..." : "Log In"}
//               </Button>
//             </form>

//             <div className="text-center text-sm">
//               Don&apos;t have an account?{" "}
//               <Link href="/signup" className="text-[#F7931E] hover:underline">
//                 Sign up
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/context/auth-context"
import Image from "next/image"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading } = useAuth()
  
  // Use a ref to track if we've already attempted redirection
  const hasRedirected = useRef(false)

  // Redirect if already logged in
  useEffect(() => {
    // Only redirect if user is logged in, we have user role data, and we haven't already redirected
    if (!loading && user && !hasRedirected.current) {
      hasRedirected.current = true // Prevent further redirects
      
      console.log("User already logged in:", user)
      
      // Check user role and redirect accordingly
      if (user.role === "admin") {
        console.log("Redirecting admin to admin dashboard")
        router.push("/admin")
      } else {
        console.log("Redirecting resource to dashboard")
        router.push("/dashboard")
      }
    }
  }, [user, loading, router])

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      
      if (!firebaseUser.emailVerified) {
        await auth.signOut() // log them out immediately
  
        toast({
          variant: "destructive",
          title: "Email not verified",
          description: "Please verify your email address before logging in.",
        })
        setIsLoading(false)
        return
      }
      
      // Get user document to check role
      const userDocRef = doc(db, "users", firebaseUser.uid)
      const userDoc = await getDoc(userDocRef)
      
      if (userDoc.exists()) {
        const userData = userDoc.data()
        
        toast({
          title: "Login successful",
          description: "Welcome back to Bits Technologies Resource Management!",
        })
        
        // Mark as redirected before pushing to prevent useEffect from triggering again
        hasRedirected.current = true
        
        // Route based on role
        if (userData.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      } else {
        toast({
          variant: "destructive",
          title: "User profile not found",
          description: "Please contact support.",
        })
        await auth.signOut()
        setIsLoading(false)
      }
    } catch (error: any) {
      console.error("Error during login:", error)
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
      })
      setIsLoading(false)
    }
  }
  
  const handleGoogleLogin = async () => {
    setIsLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const firebaseUser = result.user

      // Check if user doc exists
      const userDocRef = doc(db, "users", firebaseUser.uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        // New user - create profile with default role as "resource"
        const newUserData = {
          fullName: firebaseUser.displayName || "User",
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          role: "resource", // Default role
          createdAt: new Date().toISOString(),
        }
        
        await setDoc(userDocRef, newUserData)

        toast({
          title: "Account created",
          description: "Welcome to Bits Technologies Resource Management!",
        })
        
        // Mark as redirected before pushing
        hasRedirected.current = true
        router.push("/dashboard") // New users are always resources
      } else {
        // Existing user - get their role
        const userData = userDoc.data()
        
        toast({
          title: "Login successful",
          description: "Welcome back to Bits Technologies Resource Management!",
        })

        // Mark as redirected before pushing
        hasRedirected.current = true
        
        // Route based on role
        if (userData.role === "admin") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      }
    } catch (error: any) {
      console.error("Error during Google login:", error)
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "There was an error with Google authentication.",
      })
      setIsLoading(false)
    }
  }

  // Show loading if auth is still being determined
  if (loading) {
    return <div className="p-4 text-center">Loading...</div>
  }

  // Prevent showing login form if user is authenticated and being redirected
  if (user && !loading) {
    return <div className="p-4 text-center">Redirecting to dashboard...</div>
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="flex flex-col items-center space-y-2 text-center">
            <Image src="/logo.png" alt="Bits Technologies Logo" width={180} height={60} priority />
            <h1 className="text-3xl font-bold text-[#004E98]">Welcome back</h1>
            <p className="text-gray-500">Log in to access your resource dashboard</p>
          </div>

          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Log in with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-[#F7931E] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-[#004E98] hover:bg-[#003d77]" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log In"}
              </Button>
            </form>

            <div className="text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#F7931E] hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}