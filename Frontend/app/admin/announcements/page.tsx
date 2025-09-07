"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Megaphone, Send, Calendar, Users, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { adminService } from "@/services/adminService"
import { useAuth } from "@/contexts/AuthContext"

interface Announcement {
  _id: string
  title: string
  message: string
  sentBy: {
    name: string
    email: string
  }
  sentAt: string
  recipientCount: number
}

export default function AnnouncementsPage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
  })

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedAnnouncements = await adminService.getAllAnnouncements()
      setAnnouncements(fetchedAnnouncements)
    } catch (err) {
      console.error('Failed to fetch announcements:', err)
      setError('Failed to load announcements')
      toast({
        title: "Error",
        description: "Failed to load announcements. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to send announcements.",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)
    try {
      const newAnnouncement = await adminService.createAnnouncement({
        title: formData.title,
        message: formData.message,
        sentBy: user.id,
      })

      setAnnouncements([newAnnouncement, ...announcements])
      setFormData({ title: "", message: "" })
      toast({
        title: "Success",
        description: "Announcement sent successfully to all users!",
      })
    } catch (err) {
      console.error('Failed to send announcement:', err)
      toast({
        title: "Error",
        description: "Failed to send announcement. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteAnnouncement = async (announcementId: string) => {
    try {
      await adminService.deleteAnnouncement(announcementId)
      // Refresh the announcements list
      await fetchAnnouncements()
      toast({
        title: "Success",
        description: "Announcement deleted successfully.",
      })
    } catch (err) {
      console.error('Failed to delete announcement:', err)
      toast({
        title: "Error",
        description: "Failed to delete announcement. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        </div>
        <div className="space-y-4">
          <div className="h-12 bg-muted rounded animate-pulse" />
          <div className="h-64 bg-muted rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchAnnouncements}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
                  Estimated recipients: <strong>{announcements.length > 0 ? announcements[0]?.recipientCount || 0 : 0} users</strong>
                </p>
              </div>

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? (
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
            <CardTitle>Previous Announcements ({announcements.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((announcement, index) => (
                <div key={announcement._id}>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-foreground">{announcement.title}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Sent
                        </Badge>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteAnnouncement(announcement._id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{announcement.message}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{new Date(announcement.sentAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{announcement.recipientCount.toLocaleString()} recipients</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Sent by: {announcement.sentBy.name}
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
