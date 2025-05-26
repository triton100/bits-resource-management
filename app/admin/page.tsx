
"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs, doc, getDoc,query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Search, Mail, Download, ArrowLeft, User, Briefcase, MapPin, Phone, Calendar, Award } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

// Define types for our data structure
type Certification = {
  name?: string
  issueDate?: string
  issuer?: string
}

type Skill = {
  id: number
  name: string
  description: string
  level: string
  years: number
  certifications: Certification[]
}

type UserProfile = {
  id: string
  name: string
  email: string
  department: string
  bio: string
  location: string
  phone: string
  role: string
  joinDate: string
  skills: Skill[]
}

export default function AdminPage() {
  const { user, loading, isAdmin  } = useAuth() // Use your auth context
  const router = useRouter()
  const { logout } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchType, setSearchType] = useState("role") // Default to searching by role
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [departments, setDepartments] = useState<string[]>([]) // For filter options
  const [roles, setRoles] = useState<string[]>([]) // For filter options
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const { toast } = useToast()

  // Check auth and fetch users
  useEffect(() => {
    // Wait for auth to initialize
    if (loading) return

    // Redirect if not logged in or not admin
    if (!user) {
      router.push("/login")
      return
    }

    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Access denied",
        description: "You don't have permission to access this page.",
      })
      router.push("/dashboard")
      return
    }

const fetchUsers = async () => {
  try {
    const profilesSnapshot = await getDocs(collection(db, "profiles"))

    const usersWithSkills: UserProfile[] = []
    const uniqueDepartments = new Set<string>()
    const uniqueRoles = new Set<string>()

    for (const profileDoc of profilesSnapshot.docs) {
      const profileData = profileDoc.data()
      const profileId = profileDoc.id

      if (profileId === user?.uid) continue // Skip the admin profile

      if (profileData.department) uniqueDepartments.add(profileData.department)
      if (profileData.role) uniqueRoles.add(profileData.role)

      // ✅ Fetch the skills document by user ID
      const skillDocRef = doc(db, "skills", profileId)
      const skillDocSnap = await getDoc(skillDocRef)

      let skills: any[] = []
      if (skillDocSnap.exists()) {
        const skillData = skillDocSnap.data()
        skills = skillData.skills || []
      }

      console.log(`Skills for ${profileId}:`, skills)

      usersWithSkills.push({
        id: profileId,
        name: profileData.name || "Unknown",
        email: profileData.email || "",
        department: profileData.department || "Unassigned",
        bio: profileData.bio || "",
        location: profileData.location || "",
        phone: profileData.phone || "",
        role: profileData.role || "Unassigned",
        joinDate: profileData.joinDate || "",
        skills
      })
    }

    console.log("✅ Users with skills:", usersWithSkills)

    setUsers(usersWithSkills)
    setFilteredUsers(usersWithSkills)
    setDepartments(Array.from(uniqueDepartments))
    setRoles(Array.from(uniqueRoles))
  } catch (error) {
    console.error("Error fetching users and skills:", error)
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load user data. Please try again later.",
    })
  } finally {
    setIsLoading(false)
  }
}
    fetchUsers()
  }, [user, loading, isAdmin, router, toast])

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users)
      return
    }

    const query = searchQuery.toLowerCase()
    let filtered: UserProfile[] = []

    // Filter based on selected search type
    if (searchType === "role") {
      filtered = users.filter((user) => 
        user.role.toLowerCase().includes(query)
      )
    } else if (searchType === "department") {
      filtered = users.filter((user) => 
        user.department.toLowerCase().includes(query)
      )
    } else if (searchType === "skill") {
      // Still allow searching by skill if needed
      filtered = users.filter((user) => 
        user.skills.some((skill) => skill.name.toLowerCase().includes(query))
      )
    } else {
      // Default to all fields
      filtered = users.filter((user) => 
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        user.department.toLowerCase().includes(query) ||
        user.skills.some((skill) => skill.name.toLowerCase().includes(query))
      )
    }

    setFilteredUsers(filtered)
  }, [searchQuery, searchType, users])

  // Open user details dialog
  const handleViewUser = (userProfile: UserProfile) => {
    setSelectedUser(userProfile)
    setShowUserDetails(true)
  }

  // Close user details dialog
  const handleCloseUserDetails = () => {
    setShowUserDetails(false)
  }

  // Format date from ISO to readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (e) {
      return dateString
    }
  }

const getSkillLevelColor = (level: string): string => {
  switch (level.toLowerCase()) {
    case 'beginner':
      return 'bg-slate-50 text-slate-600 border-l-4 border-slate-300'
    case 'intermediate':
      return 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-300'
    case 'advanced':
      return 'bg-emerald-100 text-emerald-800 border-l-4 border-emerald-500'
    case 'expert':
      return 'bg-emerald-200 text-emerald-900 border-l-4 border-emerald-600'
    default:
      return 'bg-gray-50 text-gray-500 border-l-4 border-gray-300'
  }
}


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is already handled by the useEffect
  }

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const toggleAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((user) => user.id))
    }
  }

  const exportUserData = async () => {
    try {
      toast({
        title: "Data export in progress",
        description: "Preparing user data for export...",
      })
      
      // Just for demonstration, show success after a delay
      setTimeout(() => {
        toast({
          title: "Data exported",
          description: "User data has been exported successfully.",
        })
      }, 1500)
    } catch (error) {
      console.error('Error exporting data:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export user data. Please try again later.",
      })
    }
  }

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <p>Loading authentication data...</p>
        </div>
      </DashboardLayout>
    )
  }

  // Show access denied if not admin
  if (!user || !isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex h-[50vh] items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You don't have permission to access this page.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Please contact an administrator if you believe this is an error.</p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }
  return (
  <DashboardLayout>
    <div className="p-6 space-y-6">
      {/* <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={exportUserData} variant="outline">
          <Download className="mr-2 h-4 w-4" /> Export Users
        </Button>
      </div> */}

      {/* Search bar and filter */}
      <form onSubmit={handleSearch} className="flex items-center gap-4">
        <Input
          type="text"
          placeholder="Search resources by role, department, skill..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/2"
        />
        <Select value={searchType} onValueChange={setSearchType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Search type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="role">Role</SelectItem>
            <SelectItem value="department">Department</SelectItem>
            <SelectItem value="skill">Skill</SelectItem>
            <SelectItem value="all">All Fields</SelectItem>
          </SelectContent>
        </Select>
      </form>

      {/* User table */}
      {isLoading ? (
        <div className="text-center">Loading users...</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    checked={selectedUsers.length === filteredUsers.length}
                    onCheckedChange={toggleAllUsers}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => toggleUserSelection(user.id)}
                    />
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge>{user.role}</Badge>
                  </TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {user.skills.slice(0, 3).map((skill) => (
                      <Badge key={skill.id} className="mr-1 mb-1">
                        {skill.name}
                      </Badge>
                    ))}
                    {user.skills.length > 3 && (
                      <span className="text-muted-foreground">+{user.skills.length - 3} more</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleViewUser(user)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>

    {/* Dialog for viewing user details */}
    {selectedUser && (
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-3xl overflow-y-auto max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedUser.name}</DialogTitle>
            <DialogDescription>{selectedUser.email}</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" /> {selectedUser.role}
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> {selectedUser.department}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> {selectedUser.location}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> {selectedUser.phone}
            </div>
            <div className="flex items-center gap-2 col-span-2">
              <Calendar className="h-4 w-4" /> Joined: {formatDate(selectedUser.joinDate)}
            </div>
            <div className="col-span-2 mt-4">
              <h3 className="text-lg font-semibold mb-2">Bio</h3>
              <p className="text-muted-foreground">{selectedUser.bio}</p>
            </div>

            <div className="col-span-2 mt-4">
              <h3 className="text-lg font-semibold mb-2">Skills</h3>
              <div className="space-y-4">
                {selectedUser.skills.map((skill) => (
                  <Card key={skill.id} className={getSkillLevelColor(skill.level)}>
                    <CardHeader>
                      <CardTitle>{skill.name}</CardTitle>
                      <CardDescription>{skill.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Experience: {skill.years} years</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {skill.certifications.map((cert, idx) => (
                          <Badge key={idx} variant="outline">
                            <Award className="h-3 w-3 mr-1" /> {cert.name} ({cert.issuer})
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleCloseUserDetails} variant="secondary">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )}
  </DashboardLayout>
)

}