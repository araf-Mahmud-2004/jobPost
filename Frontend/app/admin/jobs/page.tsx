"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreHorizontal, Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react"

// Mock data - in real app, this would come from API
const mockJobs = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    company: "TechCorp Inc.",
    location: "San Francisco, CA",
    type: "Full-time",
    status: "active",
    postedDate: "2024-01-15",
    applications: 25,
    postedBy: "john.doe@techcorp.com",
  },
  {
    id: "2",
    title: "Product Marketing Manager",
    company: "StartupXYZ",
    location: "New York, NY",
    type: "Full-time",
    status: "pending",
    postedDate: "2024-01-18",
    applications: 12,
    postedBy: "hr@startupxyz.com",
  },
  {
    id: "3",
    title: "UX/UI Designer",
    company: "Design Studio",
    location: "Remote",
    type: "Contract",
    status: "active",
    postedDate: "2024-01-12",
    applications: 18,
    postedBy: "hiring@designstudio.com",
  },
  {
    id: "4",
    title: "Data Scientist",
    company: "Analytics Pro",
    location: "Austin, TX",
    type: "Full-time",
    status: "expired",
    postedDate: "2024-01-05",
    applications: 8,
    postedBy: "careers@analyticspro.com",
  },
]

export default function ManageJobsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [jobs, setJobs] = useState(mockJobs)

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleJobAction = (jobId: string, action: string) => {
    // TODO: Implement actual job management actions
    console.log(`Action ${action} for job ${jobId}`)

    if (action === "approve") {
      setJobs(jobs.map((job) => (job.id === jobId ? { ...job, status: "active" } : job)))
    } else if (action === "reject") {
      setJobs(jobs.map((job) => (job.id === jobId ? { ...job, status: "rejected" } : job)))
    } else if (action === "delete") {
      setJobs(jobs.filter((job) => job.id !== jobId))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-accent text-accent-foreground">Active</Badge>
      case "pending":
        return <Badge variant="secondary">Pending Review</Badge>
      case "expired":
        return <Badge variant="outline">Expired</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Full-time":
        return <Badge variant="default">Full-time</Badge>
      case "Part-time":
        return <Badge variant="outline">Part-time</Badge>
      case "Contract":
        return <Badge variant="outline">Contract</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Manage Jobs</h1>
        <p className="text-muted-foreground">Review and manage all job postings</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Job Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, company, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Export Jobs</Button>
          </div>

          {/* Jobs Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Details</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Posted Date</TableHead>
                  <TableHead>Applications</TableHead>
                  <TableHead>Posted By</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{job.title}</div>
                        <div className="text-sm text-muted-foreground">{job.company}</div>
                        <div className="text-sm text-muted-foreground">{job.location}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(job.type)}</TableCell>
                    <TableCell>{getStatusBadge(job.status)}</TableCell>
                    <TableCell>{new Date(job.postedDate).toLocaleDateString()}</TableCell>
                    <TableCell>{job.applications}</TableCell>
                    <TableCell>
                      <div className="text-sm">{job.postedBy}</div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleJobAction(job.id, "view")}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleJobAction(job.id, "edit")}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Job
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {job.status === "pending" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleJobAction(job.id, "approve")}
                                className="text-accent"
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleJobAction(job.id, "reject")}
                                className="text-destructive"
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleJobAction(job.id, "delete")}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No jobs found matching your search.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
