"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { UserHeader } from "@/components/user-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { 
  Briefcase,
  FileText,
  Search,
  Clock as ClockIcon
} from "lucide-react"
import Link from "next/link"
import { applicationService } from "@/services/applicationService"
import { jobService } from "@/services/jobService"

// Define our application type based on the service response
type Application = {
  _id: string
  job: {
    _id: string
    title: string
    company: {
      _id: string
      name: string
    }
    location?: string
    type?: string
  }
  status: string
  coverLetter?: string
  resume?: string
  appliedAt: string
  updatedAt: string
  createdAt?: string
}

type Job = {
  _id: string
  title: string
  company: {
    name: string
  }
  location: string
  type: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isAdmin } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [userName, setUserName] = useState<string>("User")
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
  })
  const [recentActivity, setRecentActivity] = useState<Application[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<Array<Job & { matchScore?: number }>>([])

  useEffect(() => {
    if (isAdmin) {
      router.replace('/admin')
    }
  }, [isAdmin, router])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch user data
        const [applications, recommended] = await Promise.all([
          applicationService.getMyApplications(),
          jobService.getJobs({ limit: 3 })
        ])
        
        // Map and type the applications
        const typedApplications: Application[] = applications.map(app => ({
          _id: app._id,
          status: app.status || 'pending',
          job: {
            _id: app.job?._id || '',
            title: app.job?.title || 'Untitled Job',
            company: {
              _id: app.job?.company?._id || '',
              name: app.job?.company?.name || 'Unknown Company'
            },
            location: app.job?.location || '',
            type: app.job?.type || 'Full-time'
          },
          appliedAt: app.appliedAt || new Date().toISOString(),
          updatedAt: app.updatedAt || new Date().toISOString(),
          coverLetter: app.coverLetter,
          resume: app.resume
        }))
        
        // Calculate stats
        const pending = typedApplications.filter(app => app.status === 'pending').length
        
        setStats({
          totalApplications: typedApplications.length,
          pendingApplications: pending,
        })
        
        // Set recent activity (3 most recent applications)
        setRecentActivity(typedApplications.slice(0, 3))
        
        // Set recommended jobs with match scores
        setRecommendedJobs(recommended.jobs.map(job => ({
          ...job,
          matchScore: Math.floor(Math.random() * 20) + 80 // Random score between 80-100
        })))
        
        // Set user data (in real app, this would come from auth context)
        setUserName("John")
        
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [toast])

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'pending': return 'secondary'
      case 'interview':
      case 'interview_scheduled':
      case 'offer':
        return 'default'
      case 'rejected':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <UserHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-6">
            <Skeleton className="h-8 w-64 mb-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-32 rounded-lg" />
              <Skeleton className="h-32 rounded-lg" />
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <Skeleton className="h-96 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <UserHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">Here's what's happening with your job search</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.totalApplications}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.pendingApplications} pending review
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Job Search</CardTitle>
              <Search className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {recommendedJobs.length > 0 ? recommendedJobs.length : '0'}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {recommendedJobs.length > 0 ? 'Recommended jobs for you' : 'No recommendations yet'}
              </p>
              <Button variant="link" className="p-0 h-auto mt-2 text-green-600" asChild>
                <Link href="/jobs">
                  {recommendedJobs.length > 0 ? 'View jobs →' : 'Find jobs →'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activity */}
        <div className="space-y-6">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">My Applications</h2>
            <Card className="bg-white shadow-sm">
              <CardContent className="p-0">
                {recentActivity.length > 0 ? (
                  <div className="divide-y">
                    {recentActivity.map((app) => (
                      <div key={app._id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{app.job.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {app.job.company.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={getStatusVariant(app.status)}
                              className="capitalize"
                            >
                              {app.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center mt-2 text-sm text-muted-foreground">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Applied on {new Date(app.appliedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <h3 className="text-lg font-medium text-gray-900">No recent activity</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Get started by applying to jobs that match your skills.
                    </p>
                    <div className="mt-6">
                      <Button asChild>
                        <Link href="/jobs">Browse Jobs</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Posted Jobs Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                <span>My Posted Jobs</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                View and manage applications for your posted jobs
              </p>
              <Button asChild className="w-full">
                <Link href="/dashboard/my-jobs">
                  <FileText className="mr-2 h-4 w-4" /> View Applications
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
