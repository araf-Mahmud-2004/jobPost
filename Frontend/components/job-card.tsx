import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, DollarSign, Building } from "lucide-react"

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary: string
  description: string
  postedDate: string
  category: string
}

interface JobCardProps {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg text-foreground line-clamp-1">{job.title}</h3>
            <div className="flex items-center text-muted-foreground">
              <Building className="h-4 w-4 mr-1" />
              <span className="text-sm">{job.company}</span>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {job.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{job.location}</span>
          <span className="mx-2">•</span>
          <span>{job.type}</span>
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          <DollarSign className="h-4 w-4 mr-1" />
          <span>{job.salary}</span>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>Posted {job.postedDate}</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/jobs/${job.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
