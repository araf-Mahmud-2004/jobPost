"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { applicationService } from "@/services/applicationService"

export function EditApplicationModal({
  isOpen,
  onClose,
  application,
  onUpdate,
}: {
  isOpen: boolean
  onClose: () => void
  application: any
  onUpdate: (updatedApp: any) => void
}) {
  const [coverLetter, setCoverLetter] = useState(application?.coverLetter || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!application?._id) return
    
    try {
      setIsSubmitting(true)
      setError(null)
      
      // Call the API to update the application
      const updatedApp = await applicationService.updateApplication(application._id, {
        coverLetter,
        // Add other fields you want to update here
      })
      
      // Call the onUpdate callback with the updated application
      onUpdate(updatedApp)
      
      toast({
        title: "Success",
        description: "Your application has been updated successfully.",
      })
      
      onClose()
    } catch (err: any) {
      console.error("Failed to update application:", err)
      setError(err.response?.data?.message || "Failed to update application. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Your Application</DialogTitle>
            <DialogDescription>
              Update your cover letter or other application details.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <Textarea
                id="coverLetter"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Explain why you're a good fit for this position..."
                className="min-h-[200px]"
              />
              <p className="text-sm text-muted-foreground">
                Your cover letter will be shared with the employer.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
