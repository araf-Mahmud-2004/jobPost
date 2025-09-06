"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, CheckCircle } from "lucide-react"
import { applicationService } from "@/services/applicationService"
import { useToast } from "@/components/ui/use-toast"

interface ApplyModalProps {
  isOpen: boolean
  onClose: () => void
  jobId: string
  jobTitle: string
  company: string
}

export function ApplyModal({ isOpen, onClose, jobId, jobTitle, company }: ApplyModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    coverLetter: "",
    resume: null as File | null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, resume: file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.resume) {
      setError("Please upload your resume")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      // In a real app, you would upload the resume file first
      // For now, we'll just send the resume file name
      const resumeName = formData.resume.name
      
      await applicationService.apply(jobId, {
        coverLetter: formData.coverLetter,
        resumeName,
      })

      // Show success toast
      toast({
        title: "Application submitted!",
        description: `Your application for ${jobTitle} at ${company} has been received.`,
      })

      setIsSubmitted(true)
      
      // Refresh the page to show updated application status
      router.refresh()
    } catch (err: any) {
      console.error("Error submitting application:", err)
      const errorMessage = err?.response?.data?.message || "Failed to submit application. Please try again."
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({ coverLetter: "", resume: null })
    setIsSubmitted(false)
    setError("")
    onClose()
  }

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-accent/10 rounded-full">
                <CheckCircle className="h-8 w-8 text-accent" />
              </div>
            </div>
            <DialogTitle className="text-2xl">Application Submitted!</DialogTitle>
            <DialogDescription>
              Your application for {jobTitle} at {company} has been successfully submitted.
            </DialogDescription>
          </DialogHeader>

          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              We'll review your application and get back to you within 3-5 business days.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply for {jobTitle}</DialogTitle>
          <DialogDescription>
            Submit your application to {company}. Please note that you need to be logged in to apply.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Application form fields */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="resume">Resume *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="resume" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    {formData.resume ? (
                      <>
                        <FileText className="h-8 w-8 text-primary" />
                        <p className="text-sm font-medium">{formData.resume.name}</p>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
              <Textarea
                id="coverLetter"
                placeholder="Tell us why you're interested in this position..."
                value={formData.coverLetter}
                onChange={(e) => setFormData((prev) => ({ ...prev, coverLetter: e.target.value }))}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.resume}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
