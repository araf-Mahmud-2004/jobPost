"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MapPin, Briefcase } from "lucide-react"

export function JobSearchBar() {
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("")

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log("Search:", { searchQuery, location, category })
  }

  return (
    <div className="bg-card border rounded-lg p-6 shadow-sm max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Job title or keywords"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 text-muted-foreground mr-2" />
              <SelectValue placeholder="Category" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="design">Design</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="education">Education</SelectItem>
            <SelectItem value="engineering">Engineering</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSearch} className="w-full">
          <Search className="h-4 w-4 mr-2" />
          Search Jobs
        </Button>
      </div>
    </div>
  )
}
