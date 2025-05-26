"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"


export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  // const [userData, setUserData] = useState(mockUserData)
  const [authChecked, setAuthChecked] = useState(false)
  // Use a ref to prevent multiple redirects
  const hasRedirected = useRef(false)


 const handleTabChange = (value: string) => {
    if (value === 'skills') {
      router.push('/dashboard/skills') // or whatever your skills route is
    }else if(value=='profile'){
      router.push('/dashboard/profile')
    }
    // Handle other tabs similarly
  }


  useEffect(() => {
    // Debug output
    console.log("Auth state:", { loading, user: !!user, authChecked })

    // Only run this effect when loading is complete
    if (!loading) {
      if (!user && !hasRedirected.current) {
        console.log("No user found, redirecting to login")
        hasRedirected.current = true
        router.push("/login")
        return
      }
      
      // Only set authChecked to true if user exists
      if (user && !authChecked) {
        setAuthChecked(true)
      }
    }
  }, [user, loading, router, authChecked])
  // console.log(user);
  // Show loading state
  console.log(user);
  if (loading || (!authChecked && user)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading dashboard...</h2>
          <p className="text-gray-500">Please wait while we prepare your dashboard</p>
        </div>
      </div>
    )
  }
  if(user?.role==='admin'){
    router.push('/admin')
    return null
  }
 
  // If not authenticated, show nothing (redirect will happen)
  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Redirecting to login...</h2>
        </div>
      </div>
    )
  }

  // If authentication check is complete and we're still on this page, render the dashboard
  return (
    <DashboardLayout>
      {/* Your actual dashboard content goes here */}
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard, {user?.displayName || user?.email}</p>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview"         onClick={() => handleTabChange('profile')}
>Profile</TabsTrigger>
 <TabsTrigger 
        value="skills" 
        onClick={() => handleTabChange('skills')}
      >
        Skills
      </TabsTrigger>            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          
         {/* this is where I might mess things up */}

         
          
          <TabsContent value="skills" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Skills Management</CardTitle>
                <CardDescription>
                  Manage your skills and competencies
                </CardDescription>
              </CardHeader>
              {/* <CardContent>
                <p>Skills content coming soon...</p>
              </CardContent> */}
              <CardContent>
  
</CardContent>

            </Card>
          </TabsContent>
          
          <TabsContent value="projects" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Project History</CardTitle>
                <CardDescription>
                  Your project assignments and contributions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Projects content coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {/* Include the rest of your dashboard components here */}
    </DashboardLayout>
  )
}