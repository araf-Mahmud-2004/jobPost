'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface Application {
  _id: string;
  job: {
    _id: string;
    title: string;
    company: {
      name: string;
    };
  };
  user: {
    _id: string;
    name: string;
    email: string;
    profile?: {
      title?: string;
      skills?: string[];
    };
  };
  status: string;
  appliedAt: string;
  coverLetter?: string;
  resume: string;
  notes?: string;
  feedback?: string;
  interviewDate?: string;
}

const statusVariant = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export default function MyJobApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch('/api/applications/my-jobs/applications', {
          credentials: 'include',
          headers,
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        
        const data = await response.json();
        setApplications(data.data.applications || []);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast({
          title: 'Error',
          description: 'Failed to load applications. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [toast]);

  const handleStatusUpdate = async (applicationId: string, status: string) => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Update the local state
      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status } : app
      ));

      toast({
        title: 'Success',
        description: `Application ${status === 'accepted' ? 'accepted' : 'rejected'} successfully. The applicant has been notified.`,
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update application status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const downloadResume = (resumeUrl: string, applicantName: string) => {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = `${applicantName.replace(/\s+/g, '-').toLowerCase()}-resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Job Applications</h1>
      </div>

      {applications.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No applications found for your posted jobs.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {applications.map((application) => (
            <Card key={application._id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {application.job.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {application.job.company.name}
                    </p>
                  </div>
                  <Badge className={statusVariant[application.status as keyof typeof statusVariant] || 'bg-gray-100 text-gray-800'}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-medium mb-2">Applicant Details</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {application.user.name}</p>
                      <p><span className="font-medium">Email:</span> {application.user.email}</p>
                      {application.user.profile?.title && (
                        <p><span className="font-medium">Title:</span> {application.user.profile.title}</p>
                      )}
                      {application.user.profile?.skills && application.user.profile.skills.length > 0 && (
                        <div>
                          <span className="font-medium">Skills: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {application.user.profile.skills.map((skill, i) => (
                              <Badge key={i} variant="secondary" className="mr-1 mb-1">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadResume(application.resume, application.user.name)}
                      >
                        Download Resume
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Application Details</h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Applied on:</span>{' '}
                        {(() => {
                          try {
                            return application.appliedAt ? format(new Date(application.appliedAt), 'MMM d, yyyy') : 'N/A';
                          } catch (error) {
                            return 'Invalid date';
                          }
                        })()}
                      </p>
                      
                      {application.coverLetter && (
                        <div className="mt-2">
                          <p className="font-medium mb-1">Cover Letter:</p>
                          <div className="bg-muted/50 p-3 rounded-md text-sm">
                            {application.coverLetter}
                          </div>
                        </div>
                      )}
                      
                      {application.status === 'pending' && (
                        <div className="mt-4">
                          <p className="font-medium mb-2">Actions:</p>
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleStatusUpdate(application._id, 'accepted')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Accept
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleStatusUpdate(application._id, 'rejected')}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {application.feedback && (
                        <div className="mt-4">
                          <p className="font-medium">Your Feedback:</p>
                          <p className="text-sm text-muted-foreground">{application.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
