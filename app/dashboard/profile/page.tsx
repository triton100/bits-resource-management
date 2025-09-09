"use client"

import React, { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"
import { getOrCreateUserProfile, updateUserProfile, UserProfile } from "@/lib/profile"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  const [user] = useAuthState(auth)
  const [userData, setUserData] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const profile = await getOrCreateUserProfile(user.uid, {
          displayName: user.displayName,
          email: user.email,
        })
        setUserData(profile)
        setFormData(profile)
      }
    }
    loadProfile()
  }, [user])

  if (!user || !formData) {
    return <div className="p-4 text-muted-foreground">Loading profile...</div>
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => prev && { ...prev, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData) return
    await updateUserProfile(user.uid, formData)
    setUserData(formData)
    setIsEditing(false)
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    })
  }

  const handleCancel = () => {
    setFormData(userData)
    setIsEditing(false)
  }

  console.log(user);

  return (
    <DashboardLayout>
      <div className="flex flex-col flex-1 min-h-screen p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and account settings</p>
        </div>
  
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList>
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="account">Account Settings</TabsTrigger>
          </TabsList>
  
          {/* Personal Info Tab */}
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader className="space-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details and contact information</CardDescription>
                  </div>
                  {!isEditing && <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/avater.jpg" alt={formData.name} />
                      <AvatarFallback>
                      {formData.name
  ? formData.name.split(" ").map((n) => n[0]).join("")
  : "?"}
                      </AvatarFallback>
                    </Avatar>
                    {/* {isEditing && <Button variant="outline" size="sm">Change Photo</Button>} */}
                  </div>
  
                  {isEditing ? (
                    <form onSubmit={handleSubmit} className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" name="email" value={formData.email} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Job Title</Label>
                          <Input id="role" name="role" value={formData.role} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <Input id="department" name="department" value={formData.department} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input id="location" name="location" value={formData.location} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="bio">Bio</Label>
                          <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} rows={4} />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                        <Button type="submit">Save Changes</Button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex-1 space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div><h3 className="text-sm font-medium text-muted-foreground">Full Name</h3><p>{formData.name || ""}</p></div>
                        <div><h3 className="text-sm font-medium text-muted-foreground">Email</h3><p>{formData.email || ""}</p></div>
                        <div><h3 className="text-sm font-medium text-muted-foreground">Job Title</h3><p>{formData.role || ""}</p></div>
                        <div><h3 className="text-sm font-medium text-muted-foreground">Department</h3><p>{formData.department || ""}</p></div>
                        <div><h3 className="text-sm font-medium text-muted-foreground">Location</h3><p>{formData.location || ""}</p></div>
                        <div><h3 className="text-sm font-medium text-muted-foreground">Phone</h3><p>{formData.phone || ""}</p></div>
                        <div className="md:col-span-2"><h3 className="text-sm font-medium text-muted-foreground">Bio</h3><p>{formData.bio || ""}</p></div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
  
          {/* Account Settings Tab */}
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Account Information</h3>
                  <div className="rounded-md border p-4">
                    <div className="flex justify-between">
                      <div>
                        <div className="text-sm font-medium">Member Since</div>
                        <div className="text-sm text-muted-foreground">{formData.joinDate || "Not available"}</div>
                      </div>
                      <div>
                        <div className="text-sm font-medium">Account Type</div>
                        <div className="text-sm text-muted-foreground">Resource</div>
                      </div>
                    </div>
                  </div>
                </div>
  
                {/* <div className="space-y-2">
                  <h3 className="text-sm font-medium">Password</h3>
                  <div className="rounded-md border p-4">
                    <div className="flex justify-between items-center">
                      <div className="text-sm">Change your password</div>
                      <Button variant="outline" size="sm">Change Password</Button>
                    </div>
                  </div>
                </div> */}
  
                {/* <div className="space-y-2">
                  <h3 className="text-sm font-medium">Notifications</h3>
                  <div className="rounded-md border p-4">
                    <div className="flex justify-between items-center">
                     
                    </div>
                  </div>
                </div> */}
              </CardContent>
              <CardFooter>
                {/* <Button variant="destructive" className="ml-auto">Delete Account</Button> */}
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}  