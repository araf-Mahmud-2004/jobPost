"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { adminService } from "@/services/adminService"

interface Job {
  _id: string
  title: string
  company: {
    name: string
    description?: string
    website?: string
  }
  location: string
  type: string
  createdAt: string
}

export default function ManageJobsPage() {
  const { toast } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedJobs = await adminService.getAllJobs()
      setJobs(fetchedJobs)
    } catch (err) {
      console.error('Failed to fetch jobs:', err)
      setError('Failed to load jobs')
      toast({
        title: "Error",
        description: "Failed to load jobs. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      await adminService.deleteJob(jobId)
      // Refresh the jobs list
      await fetchJobs()
      toast({
        title: "Job Deleted",
        description: "The job has been successfully deleted.",
      })
    } catch (err) {
      console.error('Failed to delete job:', err)
      toast({
        title: "Error",
        description: "Failed to delete job. Please try again.",
        variant: "destructive"
      })
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
              <Button onClick={fetchJobs}>Try Again</Button>
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
        <h1 className="text-3xl font-bold text-foreground">Job Management</h1>
        <p className="text-muted-foreground">View all posted jobs, delete inappropriate or spam content</p>
      </div>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Jobs ({jobs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Posted Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job._id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.company?.name || 'Unknown Company'}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>{job.type}</TableCell>
                  <TableCell>{new Date(job.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteJob(job._id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
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
