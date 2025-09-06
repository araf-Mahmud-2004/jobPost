"use client"

import { useEffect, useState } from "react"
import { ApplicationCard } from "@/components/application-card"
import { applicationService } from "@/services/applicationService"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

import { Application as ApplicationType } from "@/services/applicationService"

// Extend the Application type from the service with our UI-specific properties
interface Application extends Omit<ApplicationType, 'job' | 'status'> {
  job: {
    _id: string
    title: string
    company: {
      name: string
    }
    location: string
    salary?: number
  }
  status: 'pending' | 'reviewing' | 'interview' | 'offer' | 'rejected' | string
  appliedAt: string
  coverLetter?: string
  resume?: string
}

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// Helper function to format salary
const formatSalary = (salary?: number) => {
  if (!salary) return "Not specified"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(salary)
}

interface ApplicationsListProps {
  limit?: number
}

export function ApplicationsList({ limit }: ApplicationsListProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const data = await applicationService.getMyApplications()
        setApplications(limit ? data.slice(0, limit) : data)
      } catch (err: any) {
        console.error("Failed to fetch applications:", err)
        setError(err?.response?.data?.message || "Failed to load applications")
        toast({
          title: "Error",
          description: "Failed to load your applications. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [limit, toast])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: limit || 3 }).map((_, index) => (
          <div key={index} className="p-6 border rounded-lg">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error || applications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {error || "No applications yet. Start browsing jobs to apply!"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <ApplicationCard
          key={application._id}
          application={{
            id: application._id,
            jobTitle: application.job.title,
            company: application.job.company.name,
            appliedDate: formatDate(application.appliedAt),
            status: application.status as any, // Cast to any to avoid type issues with the component
            location: application.job.location,
            salary: formatSalary(application.job.salary),
          }}
        />
      ))}
    </div>
  )
}
