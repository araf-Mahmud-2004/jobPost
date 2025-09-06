"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { UserHeader } from "@/components/user-header"
import { Footer } from "@/components/footer"
import { ProfileForm } from "@/components/profile-form"
import { ChangePasswordForm } from "@/components/change-password-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, FileText, Lock, Download, Eye } from "lucide-react"
import { userService, UserProfile } from "@/services/userService"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { logout } = useAuth()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userData = await userService.getProfile()
        setUser(userData)
      } catch (err: any) {
        console.error("Failed to fetch user profile:", err)
        setError(err?.response?.data?.message || "Failed to load profile")
        toast({
          title: "Error",
          description: "Failed to load profile. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [toast])

  const handleUpdateProfile = async (updatedUser: any) => {
    try {
      const userData = await userService.updateProfile(updatedUser)
      setUser(userData)
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
    } catch (err: any) {
      console.error("Failed to update profile:", err)
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <UserHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">Loading profile...</div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <UserHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground">{error || 'Failed to load profile'}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <UserHeader />

      <main className="flex-1 py-8 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information and preferences.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <Avatar className="h-20 w-20 mx-auto mb-4">
                      <AvatarImage src={user.avatar || ""} alt={user.name} />
                      <AvatarFallback className="text-lg">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Member since{" "}
                      {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>

                      <div className="mt-4">
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => {
                            logout();
                            toast({
                              title: "Logged out",
                              description: "You have been successfully logged out.",
                            });
                          }}
                        >
                          Logout
                        </Button>
                      </div>

                      {user.skills && user.skills.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {user.skills.map((skill) => (
                              <Badge key={skill} variant="secondary">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}                  {user.resume && (
                    <div>
                      <h4 className="font-medium mb-2">Resume</h4>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">
                            {user.resume.split('/').pop() || 'resume.pdf'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            asChild
                            onClick={() => window.open(user.resume, '_blank')}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            asChild
                          >
                            <a href={user.resume} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Profile Forms */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="profile" className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Profile Info
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center">
                    <Lock className="h-4 w-4 mr-2" />
                    Security
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ProfileForm 
                        user={{
                          name: user.name,
                          email: user.email,
                          bio: user.bio || '',
                          skills: user.skills || [],
                          resumeFileName: user.resume ? user.resume.split('/').pop() : undefined,
                          avatar: user.avatar
                        }} 
                        onUpdate={handleUpdateProfile} 
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="security">
                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChangePasswordForm 
                        onSuccess={() => {
                          toast({
                            title: "Success",
                            description: "Your password has been updated successfully.",
                          });
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
