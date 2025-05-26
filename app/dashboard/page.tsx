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
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Profile Completion
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user?.displayName}%</div>
                  {/* <Progress value={user?.displayName} className="mt-2" /> */}
                  <p className="text-xs text-muted-foreground mt-2">
                    Complete your profile to improve visibility
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    My Skills
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user?.displayName}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Skills added to your profile
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Department</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{user?.displayName}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Your organizational unit
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Role</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{user?.displayName}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Your current position
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest actions and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* <div className="space-y-4">
                    {user.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-center gap-4">
                        <div className="rounded-full w-2 h-2 bg-primary" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {activity.action}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div> */}
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Popular Skills</CardTitle>
                  <CardDescription>
                    Most common skills across the organization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* <div className="space-y-4">
                    {userData.popularSkills.map((skill) => (
                      <div key={skill.name} className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">{skill.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{skill.count} people</span>
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        </div>
                      </div>
                    ))}
                  </div> */}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
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