"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"


export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
  
      await sendEmailVerification(user)
  
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email: user.email,
        role: "resource",
        createdAt: new Date().toISOString(),
      })
  
      toast({
        title: "Account created",
        description: "Please check your inbox to verify your email.",
      })
  
      router.push("/login")
    } catch (error: any) {
      console.error("Error during sign up:", error)
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message || "There was an issue creating your account.",
      })
    } finally {
      setIsLoading(false)
    }
  }
  

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="flex flex-col items-center space-y-2 text-center">
            <Image src="/logo.png" alt="Bits Technologies Logo" width={180} height={60} priority />
            <h1 className="text-3xl font-bold text-[#004E98]">Create your account</h1>
            <p className="text-gray-500">Sign up to access your dashboard</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="name and surname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#004E98] hover:bg-[#003d77]"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-[#F7931E] hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
