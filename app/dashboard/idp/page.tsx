"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import DashboardLayout from "@/components/dashboard-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { useToast } from "@/components/ui/use-toast"
import {
  PlusIcon,
  XMarkIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  ChartBarIcon,
  CogIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"

// Firebase imports
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth, db } from "@/lib/firebase"

// Types
interface Milestone {
  id: string
  title: string
  completed: boolean
  createdAt?: Date
}

interface Goal {
  id: string
  title: string
  description?: string
  type: "short" | "long"
  duration: string
  targetDate?: string
  milestones: Milestone[]
  icon: "book" | "brain" | "trophy" | "clock"
  userId: string
  createdAt: Date
  updatedAt: Date
}

interface CreateGoalForm {
  title: string
  description: string
  type: "short" | "long" | ""
  subtasks: string[]
  targetDate: string
}

interface EditGoalState {
  goalId: string | null
  editingMilestones: Set<string>
}

const iconMap = {
  book: AcademicCapIcon,
  brain: BriefcaseIcon,
  trophy: ChartBarIcon,
  clock: CogIcon,
}

// Firebase service functions
const FirebaseService = {
  // Add a new goal
  async addGoal(goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(db, "goals"), {
        ...goalData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error adding goal:", error)
      throw error
    }
  },

  // Get all goals for a user
  async getGoals(userId: string): Promise<Goal[]> {
    try {
      const q = query(
        collection(db, "goals"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as Goal))
    } catch (error) {
      console.error("Error fetching goals:", error)
      throw error
    }
  },

  // Update a goal
  async updateGoal(goalId: string, updates: Partial<Goal>) {
    try {
      const goalRef = doc(db, "goals", goalId)
      await updateDoc(goalRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating goal:", error)
      throw error
    }
  },

  // Delete a goal
  async deleteGoal(goalId: string) {
    try {
      await deleteDoc(doc(db, "goals", goalId))
    } catch (error) {
      console.error("Error deleting goal:", error)
      throw error
    }
  },

  // Subscribe to goals changes
  subscribeToGoals(userId: string, callback: (goals: Goal[]) => void) {
    const q = query(
      collection(db, "goals"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const goals = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as Goal))
      callback(goals)
    })
  }
}

export default function IDPPage() {
  // Auth state
  const [user, loading, error] = useAuthState(auth)
  const { toast } = useToast()

  // Component state
  const [activeTab, setActiveTab] = useState<"short" | "long">("short")
  const [goals, setGoals] = useState<Goal[]>([])
  const [expandedGoals, setExpandedGoals] = useState<Set<string>>(new Set())
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editState, setEditState] = useState<EditGoalState>({
    goalId: null,
    editingMilestones: new Set(),
  })
  const [createForm, setCreateForm] = useState<CreateGoalForm>({
    title: "",
    description: "",
    type: "",
    subtasks: [""],
    targetDate: "",
  })

  // Load goals when user is authenticated
  useEffect(() => {
    if (!user) return

    const unsubscribe = FirebaseService.subscribeToGoals(user.uid, (updatedGoals) => {
      setGoals(updatedGoals)
    })

    return () => unsubscribe()
  }, [user])

  // Helper functions
  const getGoalsByType = (type: "short" | "long") => 
    goals.filter(goal => goal.type === type)

  const toggleMilestone = async (goalId: string, milestoneId: string) => {
    try {
      const goal = goals.find(g => g.id === goalId)
      if (!goal) return

      const updatedMilestones = goal.milestones.map(milestone =>
        milestone.id === milestoneId 
          ? { ...milestone, completed: !milestone.completed }
          : milestone
      )

      await FirebaseService.updateGoal(goalId, { milestones: updatedMilestones })
      
      toast({
        title: "Milestone updated",
        description: "Progress has been saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update milestone. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleGoalExpansion = (goalId: string) => {
    setExpandedGoals((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(goalId)) {
        newSet.delete(goalId)
      } else {
        newSet.add(goalId)
      }
      return newSet
    })
  }

  const addSubtask = () => {
    setCreateForm((prev) => ({
      ...prev,
      subtasks: [...prev.subtasks, ""],
    }))
  }

  const removeSubtask = (index: number) => {
    setCreateForm((prev) => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index),
    }))
  }

  const updateSubtask = (index: number, value: string) => {
    setCreateForm((prev) => ({
      ...prev,
      subtasks: prev.subtasks.map((task, i) => (i === index ? value : task)),
    }))
  }

  const resetForm = () => {
    setCreateForm({
      title: "",
      description: "",
      type: "",
      subtasks: [""],
      targetDate: "",
    })
  }

  const createGoal = async () => {
    if (!user || !createForm.title.trim()) return

    setIsSubmitting(true)
    
    try {
      const goalType = createForm.type || activeTab
      const milestones: Milestone[] = createForm.subtasks
        .filter((task) => task.trim())
        .map((task, index) => ({
          id: `milestone-${Date.now()}-${index}`,
          title: task.trim(),
          completed: false,
          createdAt: new Date(),
        }))

      const newGoal = {
        title: createForm.title.trim(),
        description: createForm.description.trim() || undefined,
        type: goalType as "short" | "long",
        duration: goalType === "short" ? "1-11 months" : "1-3 years",
        targetDate: createForm.targetDate || undefined,
        icon: goalType === "short" ? "book" as const : "trophy" as const,
        milestones,
        userId: user.uid,
      }

      await FirebaseService.addGoal(newGoal)
      
      toast({
        title: "Goal created",
        description: "Your new goal has been added successfully!",
      })

      resetForm()
      setShowCreateForm(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleMilestoneEdit = (goalId: string, milestoneId: string) => {
    setEditState((prev) => ({
      ...prev,
      editingMilestones: prev.editingMilestones.has(milestoneId)
        ? new Set([...prev.editingMilestones].filter((id) => id !== milestoneId))
        : new Set([...prev.editingMilestones, milestoneId]),
    }))
  }

  const updateMilestoneTitle = async (goalId: string, milestoneId: string, newTitle: string) => {
    if (!newTitle.trim()) return

    try {
      const goal = goals.find(g => g.id === goalId)
      if (!goal) return

      const updatedMilestones = goal.milestones.map(milestone =>
        milestone.id === milestoneId 
          ? { ...milestone, title: newTitle.trim() }
          : milestone
      )

      await FirebaseService.updateGoal(goalId, { milestones: updatedMilestones })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update milestone title.",
        variant: "destructive",
      })
    }
  }

  const addMilestoneToGoal = async (goalId: string) => {
    try {
      const goal = goals.find(g => g.id === goalId)
      if (!goal) return

      const newMilestone: Milestone = {
        id: `milestone-${Date.now()}`,
        title: "",
        completed: false,
        createdAt: new Date(),
      }

      const updatedMilestones = [...goal.milestones, newMilestone]
      await FirebaseService.updateGoal(goalId, { milestones: updatedMilestones })

      setEditState((prev) => ({
        ...prev,
        editingMilestones: new Set([...prev.editingMilestones, newMilestone.id]),
      }))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add milestone.",
        variant: "destructive",
      })
    }
  }

  const removeMilestone = async (goalId: string, milestoneId: string) => {
    try {
      const goal = goals.find(g => g.id === goalId)
      if (!goal) return

      const updatedMilestones = goal.milestones.filter(m => m.id !== milestoneId)
      await FirebaseService.updateGoal(goalId, { milestones: updatedMilestones })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove milestone.",
        variant: "destructive",
      })
    }
  }

  const deleteGoal = async (goalId: string) => {
    try {
      await FirebaseService.deleteGoal(goalId)
      toast({
        title: "Goal deleted",
        description: "The goal has been removed successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete goal.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your goals...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Please sign in</h2>
            <p className="text-gray-600">You need to be authenticated to view your goals.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const currentGoals = getGoalsByType(activeTab)

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white">
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Individual Development Plan</h1>
                <p className="text-sm text-gray-600 mt-1">Track your professional growth and career milestones</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
          {/* Create Goal Button */}
          <div className="mb-6 flex justify-end">
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="text-white"
              style={{ backgroundColor: '#14b5a5' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f9488'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#14b5a5'}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create Goal
            </Button>
          </div>

          {/* Create Goal Form */}
          <Collapsible open={showCreateForm} onOpenChange={setShowCreateForm}>
            <CollapsibleContent>
              <Card className="mb-6 border border-gray-200 shadow-sm">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <CardTitle className="text-lg font-medium text-gray-900 flex items-center justify-between">
                    Create New {activeTab === "short" ? "Short-Term" : "Long-Term"} Goal
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCreateForm(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Goal Title */}
                    <div className="space-y-2">
                      <Label htmlFor="goal-title" className="text-sm font-medium text-gray-700">
                        Goal Name *
                      </Label>
                      <Input
                        id="goal-title"
                        placeholder="e.g., Learn React Development"
                        value={createForm.title}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, title: e.target.value }))}
                        className="border-gray-300"
                        style={{ borderColor: createForm.title ? '#14b5a5' : undefined } as React.CSSProperties}
                      />
                    </div>

                    {/* Goal Type */}
                    <div className="space-y-2">
                      <Label htmlFor="goal-type" className="text-sm font-medium text-gray-700">
                        Goal Type
                      </Label>
                      <Select
                        value={createForm.type || activeTab}
                        onValueChange={(value: "short" | "long") => setCreateForm((prev) => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select goal type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short-term (1-11 months)</SelectItem>
                          <SelectItem value="long">Long-term (1-3 years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Goal Description */}
                  <div className="space-y-2">
                    <Label htmlFor="goal-description" className="text-sm font-medium text-gray-700">
                      Goal Description
                    </Label>
                    <Textarea
                      id="goal-description"
                      placeholder="Describe your goal and why it's important..."
                      value={createForm.description}
                      onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="border-gray-300 min-h-[80px]"
                    />
                  </div>

                  {/* Target Date */}
                  <div className="space-y-2">
                    <Label htmlFor="target-date" className="text-sm font-medium text-gray-700">
                      Target Completion Date (Optional)
                    </Label>
                    <div className="relative">
                      <Input
                        id="target-date"
                        type="date"
                        value={createForm.targetDate}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, targetDate: e.target.value }))}
                        className="border-gray-300 pl-10"
                      />
                      <CalendarIcon className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Subtasks */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Subtasks / Milestones</Label>
                    <div className="space-y-2">
                      {createForm.subtasks.map((subtask, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            placeholder={`Subtask ${index + 1}`}
                            value={subtask}
                            onChange={(e) => updateSubtask(index, e.target.value)}
                            className="border-gray-300"
                          />
                          {createForm.subtasks.length > 1 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeSubtask(index)}
                              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addSubtask}
                        className="bg-transparent border-gray-300"
                        style={{ color: '#14b5a5', borderColor: '#14b5a5' }}
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Subtask
                      </Button>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => {
                        resetForm()
                        setShowCreateForm(false)
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={createGoal}
                      disabled={!createForm.title.trim() || isSubmitting}
                      className="text-white disabled:bg-gray-300"
                      style={{ backgroundColor: createForm.title.trim() && !isSubmitting ? '#14b5a5' : undefined }}
                    >
                      {isSubmitting ? "Creating..." : "Create Goal"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Tabs */}
          <div className="mb-6">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex">
              <button
                onClick={() => setActiveTab("short")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "short" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Short-Term Goals
                <Badge variant="secondary" className="ml-2 bg-gray-200 text-gray-700">
                  {getGoalsByType("short").length}
                </Badge>
              </button>
              <button
                onClick={() => setActiveTab("long")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === "long" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Long-Term Goals
                <Badge variant="secondary" className="ml-2 bg-gray-200 text-gray-700">
                  {getGoalsByType("long").length}
                </Badge>
              </button>
            </div>
          </div>

          {/* Goals Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentGoals.map((goal) => {
              const completedMilestones = goal.milestones.filter((m) => m.completed).length
              const progressPercentage =
                goal.milestones.length > 0 ? (completedMilestones / goal.milestones.length) * 100 : 0
              const isExpanded = expandedGoals.has(goal.id)

              return (
                <Card key={goal.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg" style={{ backgroundColor: "#14b5a533" }}>
                          {iconMap[goal.icon] &&
                            React.createElement(iconMap[goal.icon], {
                              className: "h-5 w-5",
                              style: { color: "#14b5a5" },
                            })}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-medium text-gray-900">{goal.title}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">{goal.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleGoalExpansion(goal.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGoal(goal.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {goal.description && <p className="text-sm text-gray-600 mt-3 leading-relaxed">{goal.description}</p>}

                    {goal.targetDate && (
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm text-gray-500">
                          {completedMilestones}/{goal.milestones.length} completed
                        </span>
                      </div>
                      <div className="relative w-full bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded-full h-4 shadow-inner overflow-hidden border border-gray-200">
                        <div
                          className="relative h-full rounded-full transition-all duration-700 ease-out shadow-lg overflow-hidden"
                          style={{
                            width: `${progressPercentage}%`,
                            background: "linear-gradient(to right, #14b5a577, #14b5a5, #0f8f82)",
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                          {progressPercentage > 0 && (
                            <div
                              className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg animate-pulse"
                              style={{ border: "2px solid #14b5a5" }}
                            />
                          )}
                        </div>

                        {goal.milestones.map((_, index) => {
                          const milestonePosition = ((index + 1) / goal.milestones.length) * 100
                          const isCompleted = milestonePosition <= progressPercentage
                          return (
                            <div
                              key={index}
                              className={`absolute top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full border-2 transition-all duration-300 ${
                                isCompleted ? "shadow-lg scale-110" : "bg-gray-300 border-gray-400"
                              }`}
                              style={
                                isCompleted
                                  ? { left: `${milestonePosition}%`, marginLeft: "-4px", background: "#14b5a5", borderColor: "#0f8f82" }
                                  : { left: `${milestonePosition}%`, marginLeft: "-4px" }
                              }
                            />
                          )
                        })}
                      </div>

                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-gray-400 font-medium">0%</span>
                        <span
                          className="text-sm font-bold px-3 py-1.5 rounded-full shadow-sm border"
                          style={{
                            color: "#14b5a5",
                            background: "linear-gradient(to right, #f0fdfa, #ccfbf1)",
                            borderColor: "#99f6e4",
                          }}
                        >
                          {Math.round(progressPercentage)}%
                        </span>
                        <span className="text-xs text-gray-400 font-medium">100%</span>
                      </div>
                    </div>

                    {/* Milestones */}
                    <Collapsible open={isExpanded}>
                      <CollapsibleContent>
                        <div className="space-y-3 pt-2 border-t border-gray-100">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">Milestones</h4>
                          {goal.milestones.map((milestone, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                checked={milestone.completed}
                                onChange={() => toggleMilestone(goal.id, milestone.id)}
                                className="mt-1 h-4 w-4 focus:ring-2 border-gray-300 rounded"
                                style={{ accentColor: "#14b5a5" }}
                              />
                              <div className="flex-1 min-w-0">
                                {editState.editingMilestones.has(milestone.id) ? (
                                  <div className="flex items-center space-x-2">
                                    <Input
                                      value={milestone.title}
                                      onChange={(e) => updateMilestoneTitle(goal.id, milestone.id, e.target.value)}
                                      onBlur={() => toggleMilestoneEdit(goal.id, milestone.id)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          toggleMilestoneEdit(goal.id, milestone.id)
                                        }
                                      }}
                                      className="text-sm border-gray-300"
                                      style={{ borderColor: "#14b5a5" }}
                                      autoFocus
                                    />
                                    <Button
                                      size="sm"
                                      onClick={() => removeMilestone(goal.id, milestone.id)}
                                      className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100"
                                    >
                                      <XMarkIcon className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between group">
                                    <span
                                      className={`text-sm cursor-pointer ${
                                        milestone.completed ? "line-through text-gray-500" : "text-gray-700"
                                      }`}
                                      onClick={() => toggleMilestoneEdit(goal.id, milestone.id)}
                                      style={{ color: milestone.completed ? undefined : "#14b5a5" }}
                                    >
                                      {milestone.title}
                                    </span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => removeMilestone(goal.id, milestone.id)}
                                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-1 h-auto"
                                    >
                                      <XMarkIcon className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addMilestoneToGoal(goal.id)}
                            className="bg-transparent"
                            style={{ color: "#14b5a5", borderColor: "#14b5a5" }}
                          >
                            <PlusIcon className="h-3 w-3 mr-1" />
                            Add Milestone
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {currentGoals.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <AcademicCapIcon className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No {activeTab === "short" ? "short-term" : "long-term"} goals yet
              </h3>
              <p className="text-gray-500 mb-4">
                Get started by creating your first goal to track your professional development.
              </p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="text-white"
                style={{ backgroundColor: "#14b5a5", borderColor: "#0f8f82" }}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}