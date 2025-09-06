"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Megaphone, Send, Calendar, Users } from "lucide-react"

interface Announcement {
  id: string
  title: string
  message: string
  sentDate: string
  recipientCount: number
  status: "sent" | "draft"
}

// Mock data - in real app, this would come from API
const mockAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "Platform Maintenance Scheduled",
    message: "We will be performing scheduled maintenance on our platform this weekend...",
    sentDate: "2024-01-18",
    recipientCount: 1247,
    status: "sent",
  },
  {
    id: "2",
    title: "New Features Available",
    message: "We're excited to announce new features that will enhance your job search experience...",
    sentDate: "2024-01-15",
    recipientCount: 1200,
    status: "sent",
  },
  {
    id: "3",
    title: "Welcome to JobPortal",
    message: "Thank you for joining our platform. Here's how to get started...",
    sentDate: "2024-01-10",
    recipientCount: 1150,
    status: "sent",
  },
]

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    try {
      // TODO: Implement actual announcement sending logic
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        title: formData.title,
        message: formData.message,
        sentDate: new Date().toISOString().split("T")[0],
        recipientCount: 1247, // Mock recipient count
        status: "sent",
      }

      setAnnouncements([newAnnouncement, ...announcements])
      setFormData({ title: "", message: "" })
      setMessage("Announcement sent successfully to all users!")
    } catch (error) {
      setMessage("Failed to send announcement. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Announcements</h1>
        <p className="text-muted-foreground">Send announcements and messages to all users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Announcement Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Megaphone className="h-5 w-5 mr-2" />
              Send New Announcement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Announcement Title</Label>
                <Input
                  id="title"
                  placeholder="Enter announcement title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your announcement message..."
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  rows={6}
                  required
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <Users className="h-4 w-4 mr-2" />
                  <span>This announcement will be sent to all registered users</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Estimated recipients: <strong>1,247 users</strong>
                </p>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Announcement
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Previous Announcements */}
        <Card>
          <CardHeader>
            <CardTitle>Previous Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((announcement, index) => (
                <div key={announcement.id}>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-foreground">{announcement.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {announcement.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{announcement.message}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{new Date(announcement.sentDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{announcement.recipientCount.toLocaleString()} recipients</span>
                      </div>
                    </div>
                  </div>
                  {index < announcements.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}

              {announcements.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No announcements sent yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
