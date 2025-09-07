import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, FileText, Megaphone } from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Simple admin tools for managing the platform</p>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View all registered users, ban or delete spam/fake accounts.
            </p>
            <Button asChild className="w-full">
              <Link href="/admin/users">
                Manage Users
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Job Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Job Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View all posted jobs, delete inappropriate or spam content.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/jobs">
                Manage Jobs
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Application Oversight */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Application Oversight
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              View applicants for jobs to ensure content moderation.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/applicants">
                View Applicants
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="h-5 w-5" />
              Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Send site-wide messages and announcements to all users via email.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/announcements">
                Send Announcements
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
