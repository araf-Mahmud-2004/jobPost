"use client"

import { useEffect, useState } from "react";
import { JobCard } from "@/components/job-card";
import { jobService, Job } from "@/services/jobService";
import { Alert, AlertDescription } from "@/components/ui/alert";

// UI shape expected by JobCard
interface UIJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  postedDate: string;
  category: string;
}

function prettyType(type: Job["type"]): string {
  return type
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function relativeFrom(dateStr: string): string {
  const d = new Date(dateStr);
  const diffMs = Date.now() - d.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) {
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours <= 0) return "Just now";
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

function mapJobToUI(job: Job): UIJob {
  return {
    id: job._id,
    title: job.title,
    company: job.company?.name || "Unknown",
    location: job.location,
    type: prettyType(job.type),
    salary:
      typeof job.salary === "number"
        ? `$${new Intl.NumberFormat("en-US").format(job.salary)}`
        : "Not specified",
    description: job.description,
    postedDate: job.createdAt ? relativeFrom(job.createdAt) : "",
    category: job.category,
  };
}

export function JobList() {
  const [jobs, setJobs] = useState<UIJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await jobService.getJobs({ limit: 9 });
        if (!active) return;
        const mapped = (res.jobs || []).map(mapJobToUI);
        setJobs(mapped);
      } catch (e: any) {
        const message = e?.response?.data?.message || e?.message || "Failed to load jobs";
        setError(message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="h-48 rounded-lg border bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No jobs found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
