

// "use client"

// import { useState, useEffect } from "react"
// import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore"
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
// import { db, storage } from "@/lib/firebase"
// import { useAuth } from "@/context/auth-context"
// import DashboardLayout from "@/components/dashboard-layout"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { useToast } from "@/components/ui/use-toast"
// import { Calendar, Plus, Upload, Search, Filter, Eye, CheckCircle, Clock, XCircle } from "lucide-react"
// import { format } from "date-fns"

// type LearningGoalStatus = "not-started" | "in-progress" | "completed"

// interface LearningGoal {
//   id: string
//   userId: string
//   userName: string
//   userEmail: string
//   skill: string
//   description: string
//   status: LearningGoalStatus
//   startDate: string
//   completedDate?: string
//   proofUrl?: string
//   proofFileName?: string
//   createdAt: any
// }

// const statusConfig = {
//   "not-started": {
//     label: "Not Started",
//     color: "bg-gray-100 text-gray-800",
//     icon: XCircle,
//   },
//   "in-progress": {
//     label: "In Progress",
//     color: "bg-yellow-100 text-yellow-800",
//     icon: Clock,
//   },
//   completed: {
//     label: "Completed",
//     color: "bg-green-100 text-green-800",
//     icon: CheckCircle,
//   },
// }

// export default function IDPPage() {
//   const { user, isAdmin } = useAuth()
//   const { toast } = useToast()

//   const [goals, setGoals] = useState<LearningGoal[]>([])
//   const [filteredGoals, setFilteredGoals] = useState<LearningGoal[]>([])
//   const [loading, setLoading] = useState(true)
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false)
//   const [isProofModalOpen, setIsProofModalOpen] = useState(false)
//   const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null)
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   // Form states
//   const [newGoal, setNewGoal] = useState({
//     skill: "",
//     description: "",
//     startDate: "",
//   })
//   const [proofFile, setProofFile] = useState<File | null>(null)

//   // Filter states
//   const [searchTerm, setSearchTerm] = useState("")
//   const [statusFilter, setStatusFilter] = useState<string>("all")
//   const [skillFilter, setSkillFilter] = useState<string>("all")
//   const [employeeFilter, setEmployeeFilter] = useState<string>("all")

//   // Get unique values for filters
//   const uniqueSkills = Array.from(new Set(goals.map((goal) => goal.skill)))
//   const uniqueEmployees = Array.from(new Set(goals.map((goal) => goal.userName)))

//   useEffect(() => {
//     fetchGoals()
//   }, [user, isAdmin])

//   useEffect(() => {
//     applyFilters()
//   }, [goals, searchTerm, statusFilter, skillFilter, employeeFilter])

//   const fetchGoals = async () => {
//     if (!user) return

//     try {
//       console.log("Fetching goals for user:", user.uid, "isAdmin:", isAdmin)
      
//       let goalsQuery
//       if (isAdmin) {
//         // Admin sees all goals
//         goalsQuery = query(collection(db, "learningGoals"))
//       } else {
//         // Employee sees only their goals
//         goalsQuery = query(collection(db, "learningGoals"), where("userId", "==", user.uid))
//       }

//       const querySnapshot = await getDocs(goalsQuery)
//       const goalsData = querySnapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       })) as LearningGoal[]

//       console.log("Fetched goals:", goalsData.length)
//       setGoals(goalsData)
//     } catch (error) {
//       console.error("Error fetching goals:", error)
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: "Failed to fetch learning goals. Check console for details.",
//       })
//     } finally {
//       setLoading(false)
//     }
//   }

//   const applyFilters = () => {
//     let filtered = goals

//     // Search filter
//     if (searchTerm) {
//       filtered = filtered.filter(
//         (goal) =>
//           goal.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           goal.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           goal.description.toLowerCase().includes(searchTerm.toLowerCase()),
//       )
//     }

//     // Status filter
//     if (statusFilter !== "all") {
//       filtered = filtered.filter((goal) => goal.status === statusFilter)
//     }

//     // Skill filter
//     if (skillFilter !== "all") {
//       filtered = filtered.filter((goal) => goal.skill === skillFilter)
//     }

//     // Employee filter
//     if (employeeFilter !== "all") {
//       filtered = filtered.filter((goal) => goal.userName === employeeFilter)
//     }

//     setFilteredGoals(filtered)
//   }

//   const handleAddGoal = async () => {
//     if (!user) {
//       toast({
//         variant: "destructive",
//         title: "Authentication Error",
//         description: "You must be logged in to add goals.",
//       })
//       return
//     }

//     if (!newGoal.skill.trim() || !newGoal.startDate) {
//       toast({
//         variant: "destructive",
//         title: "Missing information",
//         description: "Please fill in all required fields.",
//       })
//       return
//     }

//     setIsSubmitting(true)

//     try {
//       console.log("Adding goal for user:", {
//         uid: user.uid,
//         displayName: user.displayName,
//         email: user.email,
//       })

//       const goalData = {
//         userId: user.uid,
//         userName: user.displayName || user.email?.split('@')[0] || "Unknown User",
//         userEmail: user.email || "",
//         skill: newGoal.skill.trim(),
//         description: newGoal.description.trim(),
//         status: "not-started" as LearningGoalStatus,
//         startDate: newGoal.startDate,
//         createdAt: serverTimestamp(),
//       }

//       console.log("Goal data to be saved:", goalData)

//       const docRef = await addDoc(collection(db, "learningGoals"), goalData)
//       console.log("Goal added successfully with ID:", docRef.id)

//       toast({
//         title: "Goal added",
//         description: "Your learning goal has been added successfully.",
//       })

//       setNewGoal({ skill: "", description: "", startDate: "" })
//       setIsAddModalOpen(false)
//       fetchGoals()
//     } catch (error) {
//       console.error("Error adding goal:", error)
      
//       // More detailed error handling
//       let errorMessage = "Failed to add learning goal."
//       if (error instanceof Error) {
//         errorMessage += ` Error: ${error.message}`
//       }
      
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: errorMessage,
//       })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handleMarkCompleted = async (goalId: string) => {
//     if (!proofFile) {
//       toast({
//         variant: "destructive",
//         title: "Proof required",
//         description: "Please upload proof of completion.",
//       })
//       return
//     }

//     if (!user) {
//       toast({
//         variant: "destructive",
//         title: "Authentication Error",
//         description: "You must be logged in to complete goals.",
//       })
//       return
//     }

//     setIsSubmitting(true)

//     try {
//       console.log("Uploading proof file:", proofFile.name)
      
//       // Upload proof file
//       const storageRef = ref(storage, `idp-proof/${user.uid}/${Date.now()}_${proofFile.name}`)
//       await uploadBytes(storageRef, proofFile)
//       const proofUrl = await getDownloadURL(storageRef)

//       console.log("Proof uploaded, URL:", proofUrl)

//       // Update goal status
//       await updateDoc(doc(db, "learningGoals", goalId), {
//         status: "completed",
//         completedDate: new Date().toISOString(),
//         proofUrl,
//         proofFileName: proofFile.name,
//       })

//       console.log("Goal marked as completed:", goalId)

//       toast({
//         title: "Goal completed",
//         description: "Congratulations! Your learning goal has been marked as completed.",
//       })

//       setProofFile(null)
//       setIsProofModalOpen(false)
//       setSelectedGoal(null)
//       fetchGoals()
//     } catch (error) {
//       console.error("Error marking goal as completed:", error)
      
//       let errorMessage = "Failed to mark goal as completed."
//       if (error instanceof Error) {
//         errorMessage += ` Error: ${error.message}`
//       }
      
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: errorMessage,
//       })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handleStatusChange = async (goalId: string, newStatus: LearningGoalStatus) => {
//     try {
//       console.log("Changing status for goal:", goalId, "to:", newStatus)
      
//       const updateData: any = { status: newStatus }

//       if (newStatus === "in-progress" && goals.find((g) => g.id === goalId)?.status === "not-started") {
//         updateData.startDate = new Date().toISOString()
//       }

//       await updateDoc(doc(db, "learningGoals", goalId), updateData)

//       console.log("Status updated successfully")

//       toast({
//         title: "Status updated",
//         description: "Goal status has been updated successfully.",
//       })

//       fetchGoals()
//     } catch (error) {
//       console.error("Error updating status:", error)
      
//       let errorMessage = "Failed to update goal status."
//       if (error instanceof Error) {
//         errorMessage += ` Error: ${error.message}`
//       }
      
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: errorMessage,
//       })
//     }
//   }

//   // Debug user information
//   useEffect(() => {
//     console.log("Current user state:", {
//       user: user ? {
//         uid: user.uid,
//         email: user.email,
//         displayName: user.displayName,
//       } : null,
//       isAdmin,
//     })
//   }, [user, isAdmin])

//   if (loading) {
//     return (
//       <DashboardLayout>
//         <div className="flex items-center justify-center h-64">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
//             <p className="mt-2 text-muted-foreground">Loading learning goals...</p>
//           </div>
//         </div>
//       </DashboardLayout>
//     )
//   }

//   if (!user) {
//     return (
//       <DashboardLayout>
//         <div className="flex items-center justify-center h-64">
//           <div className="text-center">
//             <h2 className="text-xl font-semibold text-red-600">Authentication Required</h2>
//             <p className="mt-2 text-muted-foreground">Please log in to access your learning goals.</p>
//           </div>
//         </div>
//       </DashboardLayout>
//     )
//   }

//   return (
//     <DashboardLayout>
//       <div className="space-y-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl font-bold tracking-tight">
//               {isAdmin ? "Learning Goals Management" : "My Learning Goals"}
//             </h1>
//             <p className="text-muted-foreground">
//               {isAdmin
//                 ? "Manage and track employee learning goals and development plans"
//                 : "Track your professional development and learning objectives"}
//             </p>
//           </div>
//           {!isAdmin && (
//             <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
//               <DialogTrigger asChild>
//                 <Button className="bg-teal-600 hover:bg-teal-700" disabled={isSubmitting}>
//                   <Plus className="mr-2 h-4 w-4" />
//                   Add Goal
//                 </Button>
//               </DialogTrigger>
//               <DialogContent>
//                 <DialogHeader>
//                   <DialogTitle>Add New Learning Goal</DialogTitle>
//                   <DialogDescription>
//                     Set a new learning objective to track your professional development.
//                   </DialogDescription>
//                 </DialogHeader>
//                 <div className="grid gap-4 py-4">
//                   <div className="grid gap-2">
//                     <Label htmlFor="skill">Skill Name *</Label>
//                     <Input
//                       id="skill"
//                       placeholder="e.g., React, Python, Project Management"
//                       value={newGoal.skill}
//                       onChange={(e) => setNewGoal({ ...newGoal, skill: e.target.value })}
//                     />
//                   </div>
//                   <div className="grid gap-2">
//                     <Label htmlFor="description">Description</Label>
//                     <Textarea
//                       id="description"
//                       placeholder="Describe your learning objectives and goals"
//                       value={newGoal.description}
//                       onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
//                       rows={3}
//                     />
//                   </div>
//                   <div className="grid gap-2">
//                     <Label htmlFor="startDate">Start Date *</Label>
//                     <Input
//                       id="startDate"
//                       type="date"
//                       value={newGoal.startDate}
//                       onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
//                     />
//                   </div>
//                 </div>
//                 <DialogFooter>
//                   <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting}>
//                     Cancel
//                   </Button>
//                   <Button 
//                     onClick={handleAddGoal} 
//                     className="bg-teal-600 hover:bg-teal-700"
//                     disabled={isSubmitting}
//                   >
//                     {isSubmitting ? "Adding..." : "Add Goal"}
//                   </Button>
//                 </DialogFooter>
//               </DialogContent>
//             </Dialog>
//           )}
//         </div>

//         {isAdmin ? (
//           // Admin View - Table with filters
//           <div className="space-y-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Filter className="h-5 w-5" />
//                   Filters
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                   <div className="relative">
//                     <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//                     <Input
//                       placeholder="Search goals..."
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="pl-8"
//                     />
//                   </div>
//                   <Select value={statusFilter} onValueChange={setStatusFilter}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Filter by status" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Statuses</SelectItem>
//                       <SelectItem value="not-started">Not Started</SelectItem>
//                       <SelectItem value="in-progress">In Progress</SelectItem>
//                       <SelectItem value="completed">Completed</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <Select value={skillFilter} onValueChange={setSkillFilter}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Filter by skill" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Skills</SelectItem>
//                       {uniqueSkills.map((skill) => (
//                         <SelectItem key={skill} value={skill}>
//                           {skill}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Filter by employee" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       <SelectItem value="all">All Employees</SelectItem>
//                       {uniqueEmployees.map((employee) => (
//                         <SelectItem key={employee} value={employee}>
//                           {employee}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Learning Goals ({filteredGoals.length})</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="rounded-md border">
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Employee</TableHead>
//                         <TableHead>Skill</TableHead>
//                         <TableHead>Status</TableHead>
//                         <TableHead>Start Date</TableHead>
//                         <TableHead>Actions</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {filteredGoals.length === 0 ? (
//                         <TableRow>
//                           <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
//                             No learning goals found.
//                           </TableCell>
//                         </TableRow>
//                       ) : (
//                         filteredGoals.map((goal) => {
//                           const StatusIcon = statusConfig[goal.status].icon
//                           return (
//                             <TableRow key={goal.id}>
//                               <TableCell>
//                                 <div>
//                                   <div className="font-medium">{goal.userName}</div>
//                                   <div className="text-sm text-muted-foreground">{goal.userEmail}</div>
//                                 </div>
//                               </TableCell>
//                               <TableCell>
//                                 <div>
//                                   <div className="font-medium">{goal.skill}</div>
//                                   {goal.description && (
//                                     <div className="text-sm text-muted-foreground line-clamp-2">{goal.description}</div>
//                                   )}
//                                 </div>
//                               </TableCell>
//                               <TableCell>
//                                 <Badge className={statusConfig[goal.status].color}>
//                                   <StatusIcon className="mr-1 h-3 w-3" />
//                                   {statusConfig[goal.status].label}
//                                 </Badge>
//                               </TableCell>
//                               <TableCell>
//                                 {goal.startDate ? format(new Date(goal.startDate), "MMM dd, yyyy") : "Not set"}
//                               </TableCell>
//                               <TableCell>
//                                 <div className="flex items-center gap-2">
//                                   {goal.proofUrl && (
//                                     <Button
//                                       variant="outline"
//                                       size="sm"
//                                       onClick={() => window.open(goal.proofUrl, "_blank")}
//                                     >
//                                       <Eye className="h-4 w-4" />
//                                     </Button>
//                                   )}
//                                   <Select
//                                     value={goal.status}
//                                     onValueChange={(value) => handleStatusChange(goal.id, value as LearningGoalStatus)}
//                                   >
//                                     <SelectTrigger className="w-32">
//                                       <SelectValue />
//                                     </SelectTrigger>
//                                     <SelectContent>
//                                       <SelectItem value="not-started">Not Started</SelectItem>
//                                       <SelectItem value="in-progress">In Progress</SelectItem>
//                                       <SelectItem value="completed">Completed</SelectItem>
//                                     </SelectContent>
//                                   </Select>
//                                 </div>
//                               </TableCell>
//                             </TableRow>
//                           )
//                         })
//                       )}
//                     </TableBody>
//                   </Table>
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         ) : (
//           // Employee View - Cards
//           <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {filteredGoals.length === 0 ? (
//               <div className="col-span-full text-center py-12">
//                 <div className="text-muted-foreground">
//                   <Calendar className="mx-auto h-12 w-12 mb-4" />
//                   <h3 className="text-lg font-medium mb-2">No learning goals yet</h3>
//                   <p>Start your professional development journey by adding your first learning goal.</p>
//                 </div>
//               </div>
//             ) : (
//               filteredGoals.map((goal) => {
//                 const StatusIcon = statusConfig[goal.status].icon
//                 return (
//                   <Card key={goal.id} className="hover:shadow-md transition-shadow">
//                     <CardHeader>
//                       <div className="flex items-center justify-between">
//                         <CardTitle className="text-lg">{goal.skill}</CardTitle>
//                         <Badge className={statusConfig[goal.status].color}>
//                           <StatusIcon className="mr-1 h-3 w-3" />
//                           {statusConfig[goal.status].label}
//                         </Badge>
//                       </div>
//                       <CardDescription>
//                         Started: {goal.startDate ? format(new Date(goal.startDate), "MMM dd, yyyy") : "Not set"}
//                       </CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                       {goal.description && <p className="text-sm text-muted-foreground">{goal.description}</p>}
//                       {goal.completedDate && (
//                         <p className="text-sm text-green-600 mt-2">
//                           Completed: {format(new Date(goal.completedDate), "MMM dd, yyyy")}
//                         </p>
//                       )}
//                     </CardContent>
//                     <CardFooter className="flex gap-2">
//                       {goal.status !== "completed" && (
//                         <>
//                           {goal.status === "not-started" && (
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => handleStatusChange(goal.id, "in-progress")}
//                             >
//                               Start Learning
//                             </Button>
//                           )}
//                           <Button
//                             size="sm"
//                             className="bg-teal-600 hover:bg-teal-700"
//                             onClick={() => {
//                               setSelectedGoal(goal)
//                               setIsProofModalOpen(true)
//                             }}
//                           >
//                             <CheckCircle className="mr-2 h-4 w-4" />
//                             Mark Complete
//                           </Button>
//                         </>
//                       )}
//                       {goal.proofUrl && (
//                         <Button variant="outline" size="sm" onClick={() => window.open(goal.proofUrl, "_blank")}>
//                           <Eye className="mr-2 h-4 w-4" />
//                           View Proof
//                         </Button>
//                       )}
//                     </CardFooter>
//                   </Card>
//                 )
//               })
//             )}
//           </div>
//         )}

//         {/* Proof Upload Modal */}
//         <Dialog open={isProofModalOpen} onOpenChange={setIsProofModalOpen}>
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Mark Goal as Completed</DialogTitle>
//               <DialogDescription>
//                 Upload proof of completion for: <strong>{selectedGoal?.skill}</strong>
//               </DialogDescription>
//             </DialogHeader>
//             <div className="grid gap-4 py-4">
//               <div className="grid gap-2">
//                 <Label htmlFor="proof">Upload Proof (PDF or Image)</Label>
//                 <Input
//                   id="proof"
//                   type="file"
//                   accept=".pdf,.jpg,.jpeg,.png"
//                   onChange={(e) => setProofFile(e.target.files?.[0] || null)}
//                 />
//                 <p className="text-xs text-muted-foreground">Accepted formats: PDF, JPG, JPEG, PNG</p>
//               </div>
//             </div>
//             <DialogFooter>
//               <Button variant="outline" onClick={() => setIsProofModalOpen(false)} disabled={isSubmitting}>
//                 Cancel
//               </Button>
//               <Button
//                 onClick={() => selectedGoal && handleMarkCompleted(selectedGoal.id)}
//                 className="bg-teal-600 hover:bg-teal-700"
//                 disabled={!proofFile || isSubmitting}
//               >
//                 <Upload className="mr-2 h-4 w-4" />
//                 {isSubmitting ? "Completing..." : "Complete Goal"}
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </DashboardLayout>
//   )
// }
"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, Plus, Upload, Search, Filter, Eye, CheckCircle, Clock, XCircle } from "lucide-react"
import { format } from "date-fns"

type LearningGoalStatus = "not-started" | "in-progress" | "completed"

interface LearningGoal {
  id: string
  userId: string
  userName: string
  userEmail: string
  skill: string
  description: string
  status: LearningGoalStatus
  startDate: string
  completedDate?: string
  proofUrl?: string
  proofFileName?: string
  completionNotes?: string
  createdAt: any
}

const statusConfig = {
  "not-started": {
    label: "Not Started",
    color: "bg-gray-100 text-gray-800",
    icon: XCircle,
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-yellow-100 text-yellow-800",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800",
    icon: CheckCircle,
  },
}

export default function IDPPage() {
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()

  const [goals, setGoals] = useState<LearningGoal[]>([])
  const [filteredGoals, setFilteredGoals] = useState<LearningGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [newGoal, setNewGoal] = useState({
    skill: "",
    description: "",
    startDate: "",
  })
  const [completionData, setCompletionData] = useState({
    notes: "",
    proofFile: null as File | null,
  })

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [skillFilter, setSkillFilter] = useState<string>("all")
  const [employeeFilter, setEmployeeFilter] = useState<string>("all")

  // Get unique values for filters
  const uniqueSkills = Array.from(new Set(goals.map((goal) => goal.skill)))
  const uniqueEmployees = Array.from(new Set(goals.map((goal) => goal.userName)))

  useEffect(() => {
    fetchGoals()
  }, [user, isAdmin])

  useEffect(() => {
    applyFilters()
  }, [goals, searchTerm, statusFilter, skillFilter, employeeFilter])

  const fetchGoals = async () => {
    if (!user) return

    try {
      console.log("Fetching goals for user:", user.uid, "isAdmin:", isAdmin)
      
      let goalsQuery
      if (isAdmin) {
        // Admin sees all goals
        goalsQuery = query(collection(db, "learningGoals"))
      } else {
        // Employee sees only their goals
        goalsQuery = query(collection(db, "learningGoals"), where("userId", "==", user.uid))
      }

      const querySnapshot = await getDocs(goalsQuery)
      const goalsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as LearningGoal[]

      console.log("Fetched goals:", goalsData.length)
      setGoals(goalsData)
    } catch (error) {
      console.error("Error fetching goals:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch learning goals. Check console for details.",
      })
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = goals

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (goal) =>
          goal.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
          goal.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          goal.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((goal) => goal.status === statusFilter)
    }

    // Skill filter
    if (skillFilter !== "all") {
      filtered = filtered.filter((goal) => goal.skill === skillFilter)
    }

    // Employee filter
    if (employeeFilter !== "all") {
      filtered = filtered.filter((goal) => goal.userName === employeeFilter)
    }

    setFilteredGoals(filtered)
  }

  const handleAddGoal = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to add goals.",
      })
      return
    }

    if (!newGoal.skill.trim() || !newGoal.startDate) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      console.log("Adding goal for user:", {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
      })

      const goalData = {
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || "Unknown User",
        userEmail: user.email || "",
        skill: newGoal.skill.trim(),
        description: newGoal.description.trim(),
        status: "not-started" as LearningGoalStatus,
        startDate: newGoal.startDate,
        createdAt: serverTimestamp(),
      }

      console.log("Goal data to be saved:", goalData)

      const docRef = await addDoc(collection(db, "learningGoals"), goalData)
      console.log("Goal added successfully with ID:", docRef.id)

      toast({
        title: "Goal added",
        description: "Your learning goal has been added successfully.",
      })

      setNewGoal({ skill: "", description: "", startDate: "" })
      setIsAddModalOpen(false)
      fetchGoals()
    } catch (error) {
      console.error("Error adding goal:", error)
      
      // More detailed error handling
      let errorMessage = "Failed to add learning goal."
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarkCompleted = async (goalId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to complete goals.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const updateData: any = {
        status: "completed",
        completedDate: new Date().toISOString(),
      }

      // Add completion notes if provided
      if (completionData.notes.trim()) {
        updateData.completionNotes = completionData.notes.trim()
      }

      // Try to upload proof file if provided and Firebase Storage is available
      if (completionData.proofFile) {
        try {
          console.log("Attempting to upload proof file:", completionData.proofFile.name)
          
          const storageRef = ref(storage, `idp-proof/${user.uid}/${Date.now()}_${completionData.proofFile.name}`)
          await uploadBytes(storageRef, completionData.proofFile)
          const proofUrl = await getDownloadURL(storageRef)

          updateData.proofUrl = proofUrl
          updateData.proofFileName = completionData.proofFile.name

          console.log("Proof uploaded successfully:", proofUrl)
        } catch (storageError) {
          console.warn("File upload failed (likely due to Firebase Storage not being available):", storageError)
          // Continue without file upload - this is now optional
          toast({
            title: "Note",
            description: "Goal marked as completed, but file upload is not available in the current setup.",
          })
        }
      }

      console.log("Updating goal with data:", updateData)

      // Update goal status
      await updateDoc(doc(db, "learningGoals", goalId), updateData)

      console.log("Goal marked as completed:", goalId)

      toast({
        title: "Goal completed!",
        description: "Congratulations! Your learning goal has been marked as completed.",
      })

      // Reset form
      setCompletionData({ notes: "", proofFile: null })
      setIsCompleteModalOpen(false)
      setSelectedGoal(null)
      fetchGoals()
    } catch (error) {
      console.error("Error marking goal as completed:", error)
      
      let errorMessage = "Failed to mark goal as completed."
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (goalId: string, newStatus: LearningGoalStatus) => {
    try {
      console.log("Changing status for goal:", goalId, "to:", newStatus)
      
      const updateData: any = { status: newStatus }

      if (newStatus === "in-progress" && goals.find((g) => g.id === goalId)?.status === "not-started") {
        updateData.startDate = new Date().toISOString()
      }

      await updateDoc(doc(db, "learningGoals", goalId), updateData)

      console.log("Status updated successfully")

      toast({
        title: "Status updated",
        description: "Goal status has been updated successfully.",
      })

      fetchGoals()
    } catch (error) {
      console.error("Error updating status:", error)
      
      let errorMessage = "Failed to update goal status."
      if (error instanceof Error) {
        errorMessage += ` Error: ${error.message}`
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    }
  }

  // Quick complete function for simple completion without modal
  const handleQuickComplete = async (goalId: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to complete goals.",
      })
      return
    }

    try {
      const updateData = {
        status: "completed",
        completedDate: new Date().toISOString(),
      }

      await updateDoc(doc(db, "learningGoals", goalId), updateData)

      toast({
        title: "Goal completed!",
        description: "Congratulations! Your learning goal has been marked as completed.",
      })

      fetchGoals()
    } catch (error) {
      console.error("Error completing goal:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to complete goal.",
      })
    }
  }

  // Debug user information
  useEffect(() => {
    console.log("Current user state:", {
      user: user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      } : null,
      isAdmin,
    })
  }, [user, isAdmin])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading learning goals...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600">Authentication Required</h2>
            <p className="mt-2 text-muted-foreground">Please log in to access your learning goals.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isAdmin ? "Learning Goals Management" : "My Learning Goals"}
            </h1>
            <p className="text-muted-foreground">
              {isAdmin
                ? "Manage and track employee learning goals and development plans"
                : "Track your professional development and learning objectives"}
            </p>
          </div>
          {!isAdmin && (
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700" disabled={isSubmitting}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Learning Goal</DialogTitle>
                  <DialogDescription>
                    Set a new learning objective to track your professional development.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="skill">Skill Name *</Label>
                    <Input
                      id="skill"
                      placeholder="e.g., React, Python, Project Management"
                      value={newGoal.skill}
                      onChange={(e) => setNewGoal({ ...newGoal, skill: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your learning objectives and goals"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newGoal.startDate}
                      onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddGoal} 
                    className="bg-teal-600 hover:bg-teal-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Adding..." : "Add Goal"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {isAdmin ? (
          // Admin View - Table with filters
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search goals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="not-started">Not Started</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={skillFilter} onValueChange={setSkillFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Skills</SelectItem>
                      {uniqueSkills.map((skill) => (
                        <SelectItem key={skill} value={skill}>
                          {skill}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by employee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Employees</SelectItem>
                      {uniqueEmployees.map((employee) => (
                        <SelectItem key={employee} value={employee}>
                          {employee}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Goals ({filteredGoals.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Skill</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGoals.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No learning goals found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredGoals.map((goal) => {
                          const StatusIcon = statusConfig[goal.status].icon
                          return (
                            <TableRow key={goal.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{goal.userName}</div>
                                  <div className="text-sm text-muted-foreground">{goal.userEmail}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{goal.skill}</div>
                                  {goal.description && (
                                    <div className="text-sm text-muted-foreground line-clamp-2">{goal.description}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={statusConfig[goal.status].color}>
                                  <StatusIcon className="mr-1 h-3 w-3" />
                                  {statusConfig[goal.status].label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {goal.startDate ? format(new Date(goal.startDate), "MMM dd, yyyy") : "Not set"}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {goal.proofUrl && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(goal.proofUrl, "_blank")}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Select
                                    value={goal.status}
                                    onValueChange={(value) => handleStatusChange(goal.id, value as LearningGoalStatus)}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="not-started">Not Started</SelectItem>
                                      <SelectItem value="in-progress">In Progress</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Employee View - Cards
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGoals.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-muted-foreground">
                  <Calendar className="mx-auto h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No learning goals yet</h3>
                  <p>Start your professional development journey by adding your first learning goal.</p>
                </div>
              </div>
            ) : (
              filteredGoals.map((goal) => {
                const StatusIcon = statusConfig[goal.status].icon
                return (
                  <Card key={goal.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{goal.skill}</CardTitle>
                        <Badge className={statusConfig[goal.status].color}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusConfig[goal.status].label}
                        </Badge>
                      </div>
                      <CardDescription>
                        Started: {goal.startDate ? format(new Date(goal.startDate), "MMM dd, yyyy") : "Not set"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {goal.description && <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>}
                      {goal.completedDate && (
                        <p className="text-sm text-green-600 mb-2">
                          Completed: {format(new Date(goal.completedDate), "MMM dd, yyyy")}
                        </p>
                      )}
                      {goal.completionNotes && (
                        <p className="text-sm text-muted-foreground italic">
                          Notes: {goal.completionNotes}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      {goal.status !== "completed" && (
                        <>
                          {goal.status === "not-started" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(goal.id, "in-progress")}
                            >
                              Start Learning
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuickComplete(goal.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Quick Complete
                          </Button>
                          <Button
                            size="sm"
                            className="bg-teal-600 hover:bg-teal-700"
                            onClick={() => {
                              setSelectedGoal(goal)
                              setIsCompleteModalOpen(true)
                            }}
                          >
                            Complete + Add Details
                          </Button>
                        </>
                      )}
                      {goal.proofUrl && (
                        <Button variant="outline" size="sm" onClick={() => window.open(goal.proofUrl, "_blank")}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Proof
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                )
              })
            )}
          </div>
        )}

        {/* Completion Modal with Optional Details */}
        <Dialog open={isCompleteModalOpen} onOpenChange={setIsCompleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Learning Goal</DialogTitle>
              <DialogDescription>
                Mark <strong>{selectedGoal?.skill}</strong> as completed and optionally add details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="completion-notes">Completion Notes (Optional)</Label>
                <Textarea
                  id="completion-notes"
                  placeholder="Add any notes about what you learned, resources used, etc."
                  value={completionData.notes}
                  onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="proof">Upload Certificate/Proof (Optional)</Label>
                <Input
                  id="proof"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setCompletionData({ ...completionData, proofFile: e.target.files?.[0] || null })}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Upload a certificate or proof of completion (PDF, JPG, JPEG, PNG)
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCompleteModalOpen(false)
                  setCompletionData({ notes: "", proofFile: null })
                }} 
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedGoal && handleMarkCompleted(selectedGoal.id)}
                className="bg-teal-600 hover:bg-teal-700"
                disabled={isSubmitting}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {isSubmitting ? "Completing..." : "Complete Goal"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}