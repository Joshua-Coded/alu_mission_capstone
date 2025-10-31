import { NextRequest, NextResponse } from "next/server";

// app/api/backend/[...path]/route.ts

export async function GET(
  request: NextRequest
) {
  return handleProxyRequest(request);
}

export async function POST(
  request: NextRequest
) {
  return handleProxyRequest(request);
}

export async function PUT(
  request: NextRequest
) {
  return handleProxyRequest(request);
}

export async function PATCH(
  request: NextRequest
) {
  return handleProxyRequest(request);
}

export async function DELETE(
  request: NextRequest
) {
  return handleProxyRequest(request);
}

async function handleProxyRequest(
  request: NextRequest
) {
  // Extract params from the URL
  const pathname = request.nextUrl.pathname;
  const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
  
 
  const backendPathSegments = pathSegments.slice(2); 
  const backendUrl = `https://rootrise.onrender.com/api/v1/${backendPathSegments.join('/')}`;
  
  console.log('🔄 Proxying request to:', backendUrl);
  
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    // Prepare headers for the backend request
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Get the request body for non-GET requests
    let body: string | undefined;
    if (request.method !== 'GET') {
      try {
        body = await request.text();
      } catch {
        // No body provided
      }
    }
    
    // Make the request to the backend
    const response = await fetch(backendUrl, {
      method: request.method,
      headers: headers,
      body: body || undefined,
    });
    
    if (!response.ok) {
      // If it's a 404, try without the /api/v1 prefix
      if (response.status === 404) {
        const altBackendUrl = `https://rootrise.onrender.com/${backendPathSegments.join('/')}`;
        console.log('🔄 Trying alternative URL:', altBackendUrl);
        
        const altResponse = await fetch(altBackendUrl, {
          method: request.method,
          headers: headers,
          body: body || undefined,
        });
        
        if (altResponse.ok) {
          const data = await altResponse.json();
          return NextResponse.json(data);
        }
      }
      
      console.error('❌ Backend responded with error:', response.status, response.statusText);
      return NextResponse.json(
        { 
          success: false,
          error: `Backend responded with ${response.status}: ${response.statusText}`,
          url: backendUrl
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    console.log('✅ Proxy successful for:', backendUrl);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Proxy error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to proxy request to backend',
        message: error instanceof Error ? error.message : 'Unknown error',
        url: backendUrl
      },
      { status: 500 }
    );
  }
}