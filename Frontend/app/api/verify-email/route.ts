import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return new NextResponse(JSON.stringify({ error: 'Token is required' }), {
        status: 400,
      });
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/verify-email/${token}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Verification failed');
    }

    // Redirect to success page after verification
    return NextResponse.redirect(new URL('/verification-success', request.url));
  } catch (error: any) {
    return new NextResponse(
      JSON.stringify({ error: error.message || 'Verification failed' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
