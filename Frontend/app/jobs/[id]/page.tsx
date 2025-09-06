"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ApplyModal } from "@/components/apply-modal"
import { MapPin, Clock, DollarSign, Building, Users, Calendar, ArrowLeft, Share2, Bookmark } from "lucide-react"
import { jobService, Job } from "@/services/jobService"
import { Alert, AlertDescription } from "@/components/ui/alert"

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

  useEffect(() => {
    let active = true
    const id = params?.id as string
    if (!id) return
    ;(async () => {
      try {
        const data = await jobService.getJob(id)
        if (!active) return
        setJob(data)
      } catch (e: any) {
        const message = e?.response?.data?.message || e?.message || "Failed to load job"
        setError(message)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [params?.id])

  const ui = useMemo(() => {
    if (!job) return null
    return {
      id: job._id,
      title: job.title,
      company: job.company?.name || "Unknown",
      location: job.location,
      type: prettyType(job.type),
      salary: formatSalary(job.salary),
      description: job.description,
      requirements: job.requirements,
      postedDate: job.createdAt || "",
      category: job.category,
      companySize: "",
      companyDescription: job.company?.description || "",
    }
  }, [job])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/">
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
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Bookmark className="h-4 w-4" />
                        </Button>
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

                {/* Benefits placeholder - your backend doesn't return benefits */}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Apply Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Apply for this position</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full" size="lg" onClick={() => setIsApplyModalOpen(true)}>
                      Apply Now
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      By applying, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </CardContent>
                </Card>

                {/* Company Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>About {ui.company}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{ui.companySize}</span>
                    </div>
                    <Separator />
                    <p className="text-sm text-muted-foreground leading-relaxed">{ui.companyDescription}</p>
                    <Button variant="outline" className="w-full bg-transparent">
                      View Company Profile
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {ui && (
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
