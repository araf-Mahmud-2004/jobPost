"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { UserHeader } from "@/components/user-header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ApplyModal } from "@/components/apply-modal"
import { MapPin, Clock, DollarSign, Building, Calendar, ArrowLeft, Briefcase } from "lucide-react"
import { jobService, Job } from "@/services/jobService"
import { applicationService } from "@/services/applicationService"
import { useAuth } from "@/contexts/AuthContext"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { WithdrawConfirmDialog } from "@/components/withdraw-confirm-dialog"
import { EditApplicationModal } from "@/components/edit-application-modal"

function formatSalary(salary?: number): string {
  if (typeof salary !== "number") return "Not specified"
  return `${new Intl.NumberFormat("en-US").format(salary)}`
}

function prettyType(type: Job["type"]): string {
  return type
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ")
}

export default function JobDetailsPage() {
  const params = useParams() as { id?: string }
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [existingApplication, setExistingApplication] = useState<any>(null)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    let active = true
    const id = params?.id as string
    if (!id) return

    const fetchData = async () => {
      try {
        const [jobData, applications] = await Promise.all([
          jobService.getJob(id),
          user ? applicationService.getMyApplications() : Promise.resolve([])
        ])
        
        if (!active) return
        
        setJob(jobData)
        
        // Check if user has already applied to this job
        if (user) {
          const existingApp = applications.find((app: any) => app.job._id === id)
          if (existingApp) {
            setExistingApplication(existingApp)
          }
        }
      } catch (e: any) {
        const message = e?.response?.data?.message || e?.message || "Failed to load job"
        setError(message)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchData()
    
    return () => {
      active = false
    }
  }, [params?.id, user])

  const ui = useMemo(() => {
    if (!job) return null
    return {
      id: job._id,
      title: job.title,
      company: job.company?.name || "Company not specified",
      location: job.location || "Location not specified",
      type: prettyType(job.type || "full-time"),
      salary: formatSalary(job.salary),
      description: job.description || "No description provided.",
      requirements: Array.isArray(job.requirements) && job.requirements.length > 0 
        ? job.requirements 
        : ["No specific requirements listed"],
      postedDate: job.createdAt || new Date().toISOString(),
      category: job.category || "General"
    }
  }, [job])

  return (
    <div className="min-h-screen flex flex-col">
      <UserHeader />

      <main className="flex-1 py-8 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/jobs">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Link>
          </Button>

          {loading ? (
            <div className="space-y-4">
              <div className="h-32 rounded-lg border bg-muted animate-pulse" />
              <div className="h-32 rounded-lg border bg-muted animate-pulse" />
              <div className="h-32 rounded-lg border bg-muted animate-pulse" />
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : !ui ? null : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Job Header */}
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-foreground">{ui.title}</h1>
                        <div className="flex items-center text-muted-foreground">
                          <Building className="h-5 w-5 mr-2" />
                          <span className="text-lg">{ui.company}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{ui.location}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{ui.type}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>{ui.salary}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Posted {new Date(ui.postedDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge>{ui.category}</Badge>
                      <Badge variant="outline">{ui.type}</Badge>
                    </div>
                  </CardHeader>
                </Card>

                {/* Job Description */}
                <Card>
                  <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{ui.description}</p>
                  </CardContent>
                </Card>

                {/* Requirements */}
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {ui.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span className="text-muted-foreground">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

              </div>

              {/* Apply Section */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Apply for this position</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {existingApplication ? (
                      <div className="space-y-4 text-center">
                        <div className="p-4 bg-green-50 text-green-800 rounded-md">
                          <p className="font-medium">Application Submitted</p>
                          <p className="text-sm">Status: <span className="capitalize">{existingApplication.status}</span></p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setShowEditModal(true)}
                          >
                            Edit Application
                          </Button>
                          <Button 
                            variant="destructive" 
                            className="flex-1"
                            onClick={() => setShowWithdrawDialog(true)}
                          >
                            Withdraw
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        className="w-full" 
                        size="lg" 
                        onClick={() => {
                          if (!user) {
                            // Redirect to login or show login modal
                            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
                            return
                          }
                          setIsApplyModalOpen(true)
                        }}
                      >
                        Apply Now
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground text-center">
                      By applying, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <WithdrawConfirmDialog
        isOpen={showWithdrawDialog}
        onClose={() => setShowWithdrawDialog(false)}
        onConfirm={async () => {
          if (!existingApplication?._id) return
          await applicationService.withdraw(existingApplication._id)
          setExistingApplication(null)
        }}
      />

      {existingApplication && (
        <EditApplicationModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          application={existingApplication}
          onUpdate={(updatedApp) => {
            // Update the local state with the updated application
            setExistingApplication(updatedApp)
            
            // Show success toast
            toast({
              title: "Success",
              description: "Your application has been updated successfully.",
            })
          }}
        />
      )}

      {ui && !existingApplication && (
        <ApplyModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          jobId={job?._id || ''}
          jobTitle={ui.title}
          company={ui.company}
        />
      )}
    </div>
  )
}
