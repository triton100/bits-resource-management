"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { useAuth } from "@/context/auth-context"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload } from "lucide-react"

const categories = [
  {
    id: "custom-software",
    name: "Custom Software Development",
    description: "Web, mobile, desktop development",
  },
  {
    id: "cloud-offerings",
    name: "Cloud Offerings",
    description: "Azure, cloud migrations, digital transformation",
  },
  {
    id: "intelligent-apps",
    name: "Intelligent Applications",
    description: "AI, ML, bots, OCR, cognitive services",
  },
  {
    id: "bi-big-data",
    name: "BI & Big Data",
    description: "Dashboards, analytics, forecasting",
  },
]

export default function AddSkillPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [category, setCategory] = useState("")
  const [skillName, setSkillName] = useState("")
  const [experience, setExperience] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setFileName(selectedFile.name)
    }
  }

  const handleFileUpload = async () => {
    if (!file || !user) return null

    setIsUploading(true)
    try {
      const storageRef = ref(storage, `skills/${user.uid}/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      setIsUploading(false)
      return downloadURL
    } catch (error) {
      console.error("Error uploading file:", error)
      setIsUploading(false)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "You must be logged in to add skills.",
      })
      return
    }

    if (!category || !skillName) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select a category and enter a skill name.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Upload file if one is selected
      let fileUrl = null
      if (file) {
        fileUrl = await handleFileUpload()
      }

      // Add skill to Firestore
      const skillData = {
        userId: user.uid,
        category,
        name: skillName,
        experience: experience || "Beginner",
        description,
        documentUrl: fileUrl,
        documentName: fileName || null,
        createdAt: serverTimestamp(),
      }

      await addDoc(collection(db, "skills"), skillData)

      toast({
        title: "Skill added",
        description: `${skillName} has been added to your portfolio.`,
      })

      // Reset form
      setCategory("")
      setSkillName("")
      setExperience("")
      setDescription("")
      setFile(null)
      setFileName("")

      // Redirect to portfolio
      router.push("/dashboard/portfolio")
    } catch (error) {
      console.error("Error adding skill:", error)
      toast({
        variant: "destructive",
        title: "Error adding skill",
        description: "There was an error adding your skill. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Skill</h1>
          <p className="text-muted-foreground">Add a new skill to your professional portfolio</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Skill Information</CardTitle>
              <CardDescription>
                Enter the details of your skill and optionally upload supporting documentation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="category">Skill Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <div>
                          <span>{cat.name}</span>
                          <span className="block text-xs text-muted-foreground">{cat.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill-name">Skill Name</Label>
                <Input
                  id="skill-name"
                  placeholder="e.g. React, Azure, Machine Learning"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience Level</Label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger id="experience">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your experience with this skill"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document">Supporting Document (Optional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    ref={fileInputRef}
                    id="document"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {fileName ? "Change File" : "Upload Document"}
                  </Button>
                </div>
                {fileName && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selected file: <span className="font-medium">{fileName}</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/portfolio")}
                disabled={isSubmitting || isUploading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isUploading ? "Uploading..." : isSubmitting ? "Saving..." : "Add Skill"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}
