import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await request.json();
    const applicationId = params.id;

    // Get the authorization header from the incoming request
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    if (!authHeader && !cookieHeader) {
      return new NextResponse(
        JSON.stringify({ error: 'Not authenticated' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Forward the request to the backend with the same headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }
    
    const response = await fetch(`${backendUrl}/api/applications/${applicationId}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return new NextResponse(
        JSON.stringify({ 
          error: errorData.message || 'Failed to update application status',
          details: errorData.details
        }), 
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating application status:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
