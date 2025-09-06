import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { JobSearchBar } from "@/components/job-search-bar"
import { JobList } from "@/components/job-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Building, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
              Find Your <span className="text-primary">Dream Job</span> Today
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
              Connect with top employers and discover opportunities that match your skills and aspirations. Your next
              career move starts here.
            </p>

            <JobSearchBar />

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Search className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">10,000+</h3>
                  <p className="text-muted-foreground">Active Job Listings</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-accent/10 rounded-full">
                      <Users className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">50,000+</h3>
                  <p className="text-muted-foreground">Registered Users</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Building className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">2,500+</h3>
                  <p className="text-muted-foreground">Partner Companies</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Featured Opportunities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover hand-picked job opportunities from top companies looking for talented professionals like you.
            </p>
          </div>

          <JobList />

          <div className="text-center mt-12">
            <Button size="lg" variant="outline">
              View All Jobs
              <TrendingUp className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Popular Categories</h2>
            <p className="text-muted-foreground">Explore jobs by category and find the perfect match for your skills</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              "Technology",
              "Marketing",
              "Design",
              "Sales",
              "Finance",
              "Healthcare",
              "Education",
              "Engineering",
              "Customer Service",
              "Operations",
              "Human Resources",
              "Legal",
            ].map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="p-3 text-center justify-center hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
