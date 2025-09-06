"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { UserHeader } from "@/components/user-header"
import { Footer } from "@/components/footer"
import { ApplicationsList } from "@/components/applications-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Search, 
  TrendingUp, 
  AlertCircle,
  User,
  Briefcase,
  CheckCircle2,
  XCircle
} from "lucide-react"
import Link from "next/link"
import { applicationService } from "@/services/applicationService"
import { jobService } from "@/services/jobService"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { isAdmin } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isAdmin) {
      router.replace('/admin')
    }
  }, [isAdmin, router])
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    interviewsScheduled: 0,
    offersReceived: 0,
    profileCompletion: 0
  })
  const [recommendedJobs, setRecommendedJobs] = useState<Array<{
    _id: string
    title: string
    company: { name: string }
    location: string
    type: string
    matchScore: number
  }>>([])
  const [userName, setUserName] = useState("")
  const [profileStatus, setProfileStatus] = useState({
    resume: false,
    skills: false,
    bio: false
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch user applications
        const applications = await applicationService.getMyApplications()
        
        // Calculate stats
        const pending = applications.filter(app => app.status === 'pending').length
        const interviews = applications.filter(app => 
          ['interview', 'interview_scheduled'].includes(app.status)
        ).length
        const offers = applications.filter(app => app.status === 'offer').length
        
        // Calculate profile completion (simplified)
        const profileComplete = 75 // This would come from user profile
        
        setStats({
          totalApplications: applications.length,
          pendingApplications: pending,
          interviewsScheduled: interviews,
          offersReceived: offers,
          profileCompletion: profileComplete
        })
        
        // Fetch recommended jobs (simplified - would use ML in production)
        const recommended = await jobService.getJobs({ limit: 3 })
        setRecommendedJobs(recommended.jobs.map(job => ({
          ...job,
          matchScore: Math.floor(Math.random() * 20) + 80 // Random match score 80-100%
        })))
        
        // Set mock user data (in real app, this would come from auth context)
        setUserName("John")
        setProfileStatus({
          resume: true,
          skills: true,
          bio: false
        })
        
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
      <div className="min-h-screen flex flex-col">
        <UserHeader />
        <main className="flex-1 py-8 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-5 w-80 mb-8" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 rounded-lg" />
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Skeleton className="h-96 rounded-lg" />
              </div>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-48 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <UserHeader />

      <main className="flex-1 py-8 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {userName || 'there'}!
            </h1>
            <p className="text-muted-foreground">Here's an overview of your job search activity.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalApplications}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalApplications > 0 
                    ? `${Math.ceil(stats.totalApplications / 0.7)}% of your monthly goal`
                    : 'Start applying to jobs!'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingApplications > 0 
                    ? 'Applications in review'
                    : 'No pending applications'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Interviews</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.interviewsScheduled}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.interviewsScheduled > 0 
                    ? 'Upcoming interviews'
                    : 'No interviews scheduled'
                  }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Offers</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.offersReceived}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.offersReceived > 0 
                    ? '🎉 Congratulations!'
                    : 'Keep applying!'
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Applications List */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Applications</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/applications">View All</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ApplicationsList limit={5} />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    asChild
                  >
                    <Link href="/jobs" className="flex items-center">
                      <Search className="mr-2 h-4 w-4" />
                      Browse Jobs
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start bg-transparent" 
                    asChild
                  >
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      {stats.profileCompletion < 100 ? 'Complete Profile' : 'View Profile'}
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start bg-transparent" 
                    asChild
                  >
                    <Link href="/profile#resume" className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      {profileStatus.resume ? 'Update Resume' : 'Upload Resume'}
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start bg-transparent" 
                    asChild
                  >
                    <Link href="/applications" className="flex items-center">
                      <Briefcase className="mr-2 h-4 w-4" />
                      View Applications
                      {stats.pendingApplications > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {stats.pendingApplications}
                        </Badge>
                      )}
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Profile Completion */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Completion</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Profile Strength</span>
                      <span>{stats.profileCompletion}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          stats.profileCompletion > 70 ? 'bg-green-500' : 
                          stats.profileCompletion > 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} 
                        style={{ width: `${stats.profileCompletion}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Resume uploaded</span>
                      {profileStatus.resume ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Skills added</span>
                      {profileStatus.skills ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Bio completed</span>
                      {profileStatus.bio ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full bg-transparent hover:bg-primary/10" 
                    asChild
                  >
                    <Link href="/profile">
                      {stats.profileCompletion < 100 ? 'Complete Profile' : 'View Profile'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Recommended Jobs */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recommended for You</CardTitle>
                    <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                      <Link href="/jobs">
                        <span className="sr-only">View all jobs</span>
                        <span className="text-xs text-muted-foreground">View All</span>
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recommendedJobs.length > 0 ? (
                    recommendedJobs.map((job) => (
                      <div
                        key={job._id}
                        className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => router.push(`/jobs/${job._id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm font-medium text-foreground line-clamp-1">
                              {job.title}
                            </p>
                            <div className="flex items-center text-xs text-muted-foreground mt-1 space-x-2">
                              <span className="flex items-center">
                                <Briefcase className="h-3 w-3 mr-1" />
                                {job.company.name}
                              </span>
                              <span>•</span>
                              <span>{job.location}</span>
                            </div>
                            <div className="mt-1">
                              <Badge variant="outline" className="text-xs">
                                {job.type}
                              </Badge>
                            </div>
                          </div>
                          <Badge 
                            variant={job.matchScore > 85 ? 'default' : 'secondary'} 
                            className="text-xs"
                          >
                            {job.matchScore}% match
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <Search className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Complete your profile to get job recommendations
                      </p>
                      <Button variant="link" size="sm" className="mt-2 h-auto p-0" asChild>
                        <Link href="/profile">Update Profile</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
