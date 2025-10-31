import { NextRequest, NextResponse } from "next/server";

// app/api/backend/[...path]/route.ts

export async function GET(request: NextRequest) {
  return handleProxyRequest(request);
}

export async function POST(request: NextRequest) {
  return handleProxyRequest(request);
}

export async function PUT(request: NextRequest) {
  return handleProxyRequest(request);
}

export async function PATCH(request: NextRequest) {
  return handleProxyRequest(request);
}

export async function DELETE(request: NextRequest) {
  return handleProxyRequest(request);
}

async function handleProxyRequest(request: NextRequest) {
  // Extract params from the URL
  const pathname = request.nextUrl.pathname;
  
  // Remove '/api/backend' prefix (3 segments: ['api', 'backend', ...rest])
  const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
  
  // Correct path slicing - remove first 2 segments ('api', 'backend')
  const backendPathSegments = pathSegments.slice(2);
  
  if (backendPathSegments.length === 0) {
    return NextResponse.json(
      { success: false, error: "No endpoint specified" },
      { status: 400 }
    );
  }
  
  // Build the correct backend URL
  const backendUrl = `https://rootrise.onrender.com/api/v1/${backendPathSegments.join('/')}`;
  
  console.log('🔄 Proxying request:', {
    original: pathname,
    backendPath: backendPathSegments.join('/'),
    fullUrl: backendUrl
  });
  
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
    
    // Copy other relevant headers
    const contentType = request.headers.get('content-type');
    if (contentType && contentType !== 'application/json') {
      headers['Content-Type'] = contentType;
    }
    
    // Get the request body for non-GET requests
    let body: BodyInit | undefined;
    if (request.method !== 'GET') {
      body = await request.text();
    }
    
    // Make the request to the backend
    const response = await fetch(backendUrl, {
      method: request.method,
      headers: headers,
      body: body || undefined,
    });
    
    // Handle response
    if (!response.ok) {
      console.error('❌ Backend error:', response.status, response.statusText);
      
      // Try to get error details from backend
      let errorData;
      try {
        errorData = await response.text();
      } catch {
        errorData = 'No error details';
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: `Backend responded with ${response.status}: ${response.statusText}`,
          details: errorData,
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