"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Plus, FileText } from "lucide-react"
import { userService } from "@/services/userService"
import { useToast } from "@/components/ui/use-toast"

interface User {
  name: string
  email: string
  bio?: string
  skills: string[]
  resumeFileName?: string
  avatar?: string | null
}

interface ProfileFormProps {
  user: User
  onUpdate: (user: any) => Promise<void>
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio || "",
    skills: user.skills || [],
    newSkill: "",
  })
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddSkill = () => {
    if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill.trim()],
        newSkill: "",
      }))
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }))
  }

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setResumeFile(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      // First upload resume if a new file was selected
      let resumeUrl = user.resumeFileName
      if (resumeFile) {
        const uploadResponse = await userService.uploadResume(resumeFile)
        resumeUrl = uploadResponse.url
      }

      // Update profile with the form data
      const updatedUser = {
        name: formData.name,
        bio: formData.bio,
        skills: formData.skills,
        resume: resumeUrl,
      }

      await onUpdate(updatedUser)
      
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
      
      // Refresh the page to show updated data
      router.refresh()
    } catch (error: any) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          value={user.email} 
          disabled 
          className="bg-muted" 
          aria-label="Email (read-only)"
        />
        <p className="text-xs text-muted-foreground">Email cannot be changed. Contact support if needed.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          placeholder="Tell us about yourself, your experience, and what you're looking for..."
          value={formData.bio}
          onChange={(e) => handleInputChange("bio", e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Skills</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.skills.length > 0 ? (
            formData.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                {skill}
                <button 
                  type="button" 
                  onClick={() => handleRemoveSkill(skill)} 
                  className="ml-1 hover:text-destructive"
                  aria-label={`Remove ${skill} skill`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No skills added yet</p>
          )}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add a skill"
            value={formData.newSkill}
            onChange={(e) => handleInputChange("newSkill", e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSkill())}
            aria-label="Add a new skill"
          />
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleAddSkill}
            disabled={!formData.newSkill.trim()}
            aria-label="Add skill"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="resume">Resume</Label>
        <div className="border-2 border-dashed border-border rounded-lg p-4">
          <input 
            id="resume" 
            type="file" 
            accept=".pdf,.doc,.docx" 
            onChange={handleResumeChange} 
            className="hidden" 
            aria-label="Upload resume"
          />
          <label htmlFor="resume" className="cursor-pointer block">
            <div className="flex flex-col items-center space-y-2 text-center">
              {resumeFile || user.resumeFileName ? (
                <>
                  <FileText className="h-8 w-8 text-primary" />
                  <p className="text-sm font-medium">
                    {resumeFile ? resumeFile.name : user.resumeFileName}
                  </p>
                  <p className="text-xs text-muted-foreground">Click to change file</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm font-medium">Upload your resume</p>
                  <p className="text-xs text-muted-foreground">PDF, DOC, or DOCX (max 5MB)</p>
                </>
              )}
            </div>
          </label>
        </div>
        {resumeFile && (
          <p className="text-xs text-muted-foreground">
            Selected file: {resumeFile.name} ({(resumeFile.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Updating..." : "Update Profile"}
      </Button>
    </form>
  )
}
