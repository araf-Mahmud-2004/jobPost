import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building, MapPin, Calendar, DollarSign, ExternalLink } from "lucide-react"

interface Application {
  id: string
  jobTitle: string
  company: string
  appliedDate: string
  status: string
  location: string
  salary?: string
}

interface ApplicationCardProps {
  application: Application
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | null | undefined; color: string }> = {
  pending: { label: "Pending", variant: "secondary", color: "text-muted-foreground" },
  reviewing: { label: "Under Review", variant: "default", color: "text-primary" },
  interview: { label: "Interview", variant: "default", color: "text-accent" },
  offer: { label: "Offer Received", variant: "default", color: "text-accent" },
  rejected: { label: "Not Selected", variant: "destructive", color: "text-destructive" },
  // Default fallback for unknown statuses
  default: { label: "In Progress", variant: "secondary", color: "text-muted-foreground" },
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const status = statusConfig[application.status.toLowerCase()] || statusConfig.default
  const appliedDate = new Date(application.appliedDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">{application.jobTitle}</h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Building className="h-4 w-4 mr-1" />
                  <span>{application.company}</span>
                </div>
              </div>
              <Badge variant={status.variant} className={status.color}>
                {status.label}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{application.location}</span>
              </div>
              {application.salary && (
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>{application.salary}</span>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Applied {appliedDate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            {application.status === "interview" && (
              <Button size="sm" variant="outline">
                Schedule Interview
              </Button>
            )}
            {application.status === "offer" && <Button size="sm">View Offer</Button>}
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/jobs/${application.id}`} className="flex items-center">
              <ExternalLink className="h-4 w-4 mr-1" />
              View Job
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
