"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2, Ban } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { adminService } from "@/services/adminService"

interface User {
  _id: string
  name: string
  email: string
  role: string
  isBanned: boolean
  createdAt: string
}

export default function ManageUsersPage() {
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedUsers = await adminService.getAllUsers()
      setUsers(fetchedUsers)
    } catch (err) {
      console.error('Failed to fetch users:', err)
      setError('Failed to load users')
      toast({
        title: "Error",
        description: "Failed to load users. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleBanUser = async (userId: string) => {
    try {
      await adminService.toggleUserBan(userId)
      // Refresh the users list
      await fetchUsers()
      toast({
        title: "User Banned",
        description: "The user has been banned from the platform.",
      })
    } catch (err) {
      console.error('Failed to ban user:', err)
      toast({
        title: "Error",
        description: "Failed to ban user. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await adminService.deleteUser(userId)
      // Refresh the users list
      await fetchUsers()
      toast({
        title: "User Deleted",
        description: "The user has been permanently deleted.",
      })
    } catch (err) {
      console.error('Failed to delete user:', err)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (user: User) => {
    if (user.isBanned) {
      return <Badge variant="destructive">Banned</Badge>
    }
    return <Badge className="bg-green-100 text-green-800">Active</Badge>
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="default">Admin</Badge>
      case "user":
        return <Badge variant="outline">User</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
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
              <Button onClick={fetchUsers}>Try Again</Button>
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
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">View all registered users, ban or delete spam/fake accounts</p>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell>{getStatusBadge(user)}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {!user.isBanned && user.role !== "admin" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBanUser(user._id)}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Ban
                        </Button>
                      )}
                      {user.role !== "admin" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
