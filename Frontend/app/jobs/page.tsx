import { UserHeader } from "@/components/user-header"
import { Footer } from "@/components/footer"
import { JobSearchBar } from "@/components/job-search-bar"
import { JobList } from "@/components/job-list"
import { JobPostForm } from "@/components/job-post-form"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function JobsIndexPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Get search query from URL parameters
  const searchQuery = searchParams.search
    ? Array.isArray(searchParams.search)
      ? searchParams.search[0]
      : searchParams.search
    : ''

  return (
    <div className="min-h-screen flex flex-col">
      <UserHeader />

      <main className="flex-1 py-10 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {searchQuery ? `Search Results for "${searchQuery}"` : 'Browse Jobs'}
            </h1>
            <p className="text-muted-foreground">
              {searchQuery 
                ? 'Explore the jobs that match your search.'
                : 'Explore the latest opportunities and apply to roles that match your skills.'
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="w-full sm:w-auto flex-1">
              <JobSearchBar />
            </div>
            <JobPostForm />
          </div>

          <Card>
            <CardContent className="p-6">
              <JobList searchQuery={searchQuery} />
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
