"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Briefcase, Target, Award, ExternalLink } from "lucide-react"

interface Skill {
  id: string
  name: string
  category: string
  experience: string
  description: string
  documentUrl?: string
  documentName?: string
}

interface LearningGoal {
  id: string
  skill: string
  status: string
  startDate: string
  description: string
}

const categories = {
  "custom-software": "Custom Software Development",
  "cloud-offerings": "Cloud Offerings",
  "intelligent-apps": "Intelligent Applications",
  "bi-big-data": "BI & Big Data",
}

export default function PortfolioPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [skills, setSkills] = useState<Skill[]>([])
  const [learningGoals, setLearningGoals] = useState<LearningGoal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchUserData()
    }
  }, [user])

  const fetchUserData = async () => {
    if (!user) return

    try {
      // Fetch skills
      const skillsQuery = query(collection(db, "skills"), where("userId", "==", user.uid))
      const skillsSnapshot = await getDocs(skillsQuery)
      const skillsData = skillsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Skill[]

      // Fetch learning goals
      const goalsQuery = query(collection(db, "learningGoals"), where("userId", "==", user.uid))
      const goalsSnapshot = await getDocs(goalsQuery)
      const goalsData = goalsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LearningGoal[]

      setSkills(skillsData)
      setLearningGoals(goalsData)
    } catch (error) {
      console.error("Error fetching user data:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch your portfolio data.",
      })
    } finally {
      setLoading(false)
    }
  }

  const groupedSkills = skills.reduce(
    (acc, skill) => {
      const category = skill.category || "other"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(skill)
      return acc
    },
    {} as Record<string, Skill[]>,
  )

  const getExperienceColor = (experience: string) => {
    switch (experience.toLowerCase()) {
      case "expert":
        return "bg-green-100 text-green-800"
      case "advanced":
        return "bg-blue-100 text-blue-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "beginner":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "not-started":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading your portfolio...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || ""} />
                <AvatarFallback className="text-lg">
                  {user?.displayName
                    ? user.displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-2xl">{user?.displayName || "User"}</CardTitle>
                <CardDescription className="text-base">{user?.email}</CardDescription>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    <span>{skills.length} Skills</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>{learningGoals.length} Learning Goals</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    <span>{learningGoals.filter((g) => g.status === "completed").length} Completed</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Portfolio Content */}
        <Tabs defaultValue="skills" className="space-y-4">
          <TabsList>
            <TabsTrigger value="skills">Skills Portfolio</TabsTrigger>
            <TabsTrigger value="goals">Learning Goals</TabsTrigger>
          </TabsList>

          <TabsContent value="skills" className="space-y-6">
            {Object.keys(groupedSkills).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No skills added yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Start building your professional portfolio by adding your first skill.
                  </p>
                  <Button className="bg-teal-600 hover:bg-teal-700">Add Your First Skill</Button>
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedSkills).map(([categoryKey, categorySkills]) => (
                <Card key={categoryKey}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      {categories[categoryKey as keyof typeof categories] || "Other Skills"}
                    </CardTitle>
                    <CardDescription>
                      {categorySkills.length} skill{categorySkills.length !== 1 ? "s" : ""} in this category
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {categorySkills.map((skill) => (
                        <div key={skill.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{skill.name}</h4>
                            <Badge className={getExperienceColor(skill.experience)}>{skill.experience}</Badge>
                          </div>
                          {skill.description && <p className="text-sm text-muted-foreground">{skill.description}</p>}
                          {skill.documentUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(skill.documentUrl, "_blank")}
                              className="w-full"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Certificate
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            {learningGoals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No learning goals set</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Set learning goals to track your professional development journey.
                  </p>
                  <Button className="bg-teal-600 hover:bg-teal-700">Set Your First Goal</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {learningGoals.map((goal) => (
                  <Card key={goal.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{goal.skill}</CardTitle>
                        <Badge className={getStatusColor(goal.status)}>
                          {goal.status.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </Badge>
                      </div>
                      <CardDescription>Started: {new Date(goal.startDate).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    {goal.description && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
