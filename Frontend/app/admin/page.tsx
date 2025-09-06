import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, FileText, AlertCircle, Eye, Megaphone } from "lucide-react"

export default function AdminDashboardPage() {
  // Mock data - in real app, this would come from API
  const stats = {
    totalUsers: 1247,
    totalJobs: 89,
    totalApplications: 3456,
    pendingReviews: 23,
    newUsersToday: 12,
    newJobsToday: 3,
    newApplicationsToday: 45,
  }

  const recentActivity = [
    { id: 1, type: "user", message: "New user registered: john.doe@example.com", time: "2 minutes ago" },
    { id: 2, type: "job", message: "New job posted: Senior Frontend Developer at TechCorp", time: "15 minutes ago" },
    { id: 3, type: "application", message: "Application submitted for React Developer position", time: "1 hour ago" },
    { id: 4, type: "user", message: "User profile updated: jane.smith@example.com", time: "2 hours ago" },
    { id: 5, type: "job", message: "Job expired: Marketing Manager at StartupXYZ", time: "3 hours ago" },
  ]

  const pendingReviews = [
    { id: 1, type: "Job Posting", title: "Full Stack Developer", company: "WebCorp", status: "pending" },
    { id: 2, type: "User Report", title: "Inappropriate content report", user: "user123", status: "urgent" },
    { id: 3, type: "Job Posting", title: "Data Scientist", company: "Analytics Pro", status: "pending" },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform activity and management tools</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{stats.newUsersToday} new today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">+{stats.newJobsToday} posted today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApplications.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{stats.newApplicationsToday} submitted today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReviews}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === "user" && <Users className="h-4 w-4 text-primary" />}
                    {activity.type === "job" && <Briefcase className="h-4 w-4 text-accent" />}
                    {activity.type === "application" && <FileText className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Reviews */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingReviews.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{item.type}</Badge>
                      {item.status === "urgent" && <Badge variant="destructive">Urgent</Badge>}
                    </div>
                    <p className="text-sm font-medium mt-1">{item.title}</p>
                    {item.company && <p className="text-xs text-muted-foreground">{item.company}</p>}
                    {item.user && <p className="text-xs text-muted-foreground">User: {item.user}</p>}
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center space-y-2">
              <Megaphone className="h-6 w-6" />
              <span>Send Announcement</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
            >
              <Users className="h-6 w-6" />
              <span>Manage Users</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
            >
              <Briefcase className="h-6 w-6" />
              <span>Review Jobs</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
