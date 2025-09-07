import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

// This is a server-side API route
export async function GET() {
  try {
    const user = getCurrentUser();
    
    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: 'Not authenticated' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${backendUrl}/api/applications/my-jobs/applications`, {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${user.token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return new NextResponse(
        JSON.stringify({ 
          error: errorData.message || 'Failed to fetch applications',
          details: errorData.details
        }), 
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
