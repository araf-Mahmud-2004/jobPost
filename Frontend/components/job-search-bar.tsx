"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function JobSearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim())
    } else {
      params.delete('search')
    }
    
    // Update the URL with the search query
    router.push(`/jobs?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="max-w-3xl mx-auto bg-white p-2 rounded-lg shadow-md">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for jobs, companies, or keywords"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base border-0 focus-visible:ring-2 focus-visible:ring-blue-500"
          />
        </div>
        <Button type="submit" size="lg" className="h-12 px-6">
          Search
        </Button>
      </div>
    </form>
  )
}
