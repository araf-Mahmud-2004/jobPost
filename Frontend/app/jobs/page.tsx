import { UserHeader } from "@/components/user-header"
import { Footer } from "@/components/footer"
import { JobSearchBar } from "@/components/job-search-bar"
import { JobList } from "@/components/job-list"
import { Card, CardContent } from "@/components/ui/card"

export default function JobsIndexPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <UserHeader />

      <main className="flex-1 py-10 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Browse Jobs</h1>
            <p className="text-muted-foreground">
              Explore the latest opportunities and apply to roles that match your skills.
            </p>
          </div>

          <div className="mb-8">
            <JobSearchBar />
          </div>

          <Card>
            <CardContent className="p-6">
              <JobList />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
