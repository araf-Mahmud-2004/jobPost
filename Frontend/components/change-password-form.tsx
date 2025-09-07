"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff } from "lucide-react"
import { userService } from "@/services/userService"
import { useToast } from "@/components/ui/use-toast"

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Basic validation
    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    try {
      await userService.changePassword(formData.oldPassword, formData.newPassword)
      
      toast({
        title: "Success",
        description: "Password changed successfully!",
      })
      
      // Reset form
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setError("")
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }
      
      // Refresh the page to ensure all auth state is updated
      router.refresh()
    } catch (error: any) {
      console.error("Error changing password:", error)
      setError(error?.response?.data?.message || "Failed to change password. Please check your current password and try again.")
      
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="oldPassword">Current Password</Label>
        <div className="relative">
          <Input
            id="oldPassword"
            type={showPasswords.current ? "text" : "password"}
            value={formData.oldPassword}
            onChange={(e) => handleInputChange("oldPassword", e.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
            onClick={() => togglePasswordVisibility("current")}
          >
            {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Input
            id="newPassword"
            type={showPasswords.new ? "text" : "password"}
            value={formData.newPassword}
            onChange={(e) => handleInputChange("newPassword", e.target.value)}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => togglePasswordVisibility("new")}
          >
            {showPasswords.new ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showPasswords.confirm ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => togglePasswordVisibility("confirm")}
          >
            {showPasswords.confirm ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Password requirements:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>At least 8 characters long</li>
          <li>Include both uppercase and lowercase letters</li>
          <li>Include at least one number (0-9)</li>
          <li>Include at least one special character (!@#$%^&*)</li>
        </ul>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Changing Password..." : "Change Password"}
      </Button>
    </form>
  )
}
