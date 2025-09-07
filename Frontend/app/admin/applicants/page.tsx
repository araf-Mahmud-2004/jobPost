"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { adminService } from "@/services/adminService"

interface Application {
  _id: string
  user: {
    name: string
    email: string
  } | null
  job: {
    title: string
    company: {
      name: string
      description?: string
      website?: string
    } | null
  } | null
  status: string
  appliedAt: string
}

export default function ApplicantsPage() {
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch applications on component mount
  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedApplications = await adminService.getAllApplications()
      setApplications(fetchedApplications)
    } catch (err) {
      console.error('Failed to fetch applications:', err)
      setError('Failed to load applications')
      toast({
        title: "Error",
        description: "Failed to load applications. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewApplication = (applicationId: string) => {
    // TODO: Implement view application modal/details
    console.log(`View application ${applicationId}`)
    toast({
      title: "View Application",
      description: "Application details modal would open here.",
    })
  }

  const handleDeleteApplication = async (applicationId: string) => {
    try {
      await adminService.deleteApplication(applicationId)
      // Refresh the applications list
      await fetchApplications()
      toast({
        title: "Application Deleted",
        description: "The application has been successfully deleted.",
      })
    } catch (err) {
      console.error('Failed to delete application:', err)
      toast({
        title: "Error",
        description: "Failed to delete application. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "under_review":
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>
      case "accepted":
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        </div>
        <div className="space-y-4">
          <div className="h-12 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchApplications}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Application Oversight</h1>
        <p className="text-muted-foreground">View applicants for jobs to ensure content moderation</p>
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Applications ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application._id}>
                  <TableCell className="font-medium">{application.job?.title || 'Unknown Job'}</TableCell>
                  <TableCell>{application.job?.company?.name || 'Unknown Company'}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{application.user?.name || 'Unknown User'}</div>
                      <div className="text-sm text-muted-foreground">{application.user?.email || 'No email'}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(application.status)}</TableCell>
                  <TableCell>{new Date(application.appliedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewApplication(application._id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteApplication(application._id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
