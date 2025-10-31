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
  const pathname = request.nextUrl.pathname;
  const pathSegments = pathname.split('/').filter(segment => segment.length > 0);
  const backendPathSegments = pathSegments.slice(2);
  
  if (backendPathSegments.length === 0) {
    return NextResponse.json(
      { success: false, error: "No endpoint specified" },
      { status: 400 }
    );
  }
  
  const backendUrl = `https://rootrise.onrender.com/api/v1/${backendPathSegments.join('/')}`;
  
  console.log('🔄 Proxying request:', {
    original: pathname,
    backendPath: backendPathSegments.join('/'),
    fullUrl: backendUrl
  });
  
  try {
    // Get all relevant headers from the original request
    const headers: Record<string, string> = {};
    
    // Copy authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
      console.log('🔐 Auth header present');
    } else {
      console.log('⚠️ No auth header found');
    }
    
    // Copy content-type
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    } else {
      headers['Content-Type'] = 'application/json';
    }
    
    // Copy other headers that might be needed
    const userAgent = request.headers.get('user-agent');
    if (userAgent) {
      headers['User-Agent'] = userAgent;
    }
    
    // Get request body
    let body: BodyInit | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      body = await request.text();
    }
    
    console.log('📤 Forwarding request to backend:', {
      method: request.method,
      url: backendUrl,
      headers: Object.keys(headers)
    });
    
    // Make request to backend
    const response = await fetch(backendUrl, {
      method: request.method,
      headers: headers,
      body: body,
    });
    
    // Handle backend response
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend error:', {
        status: response.status,
        statusText: response.statusText,
        url: backendUrl,
        error: errorText
      });
      
      // Return the exact error from backend
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(errorData, { status: response.status });
      } catch {
        return NextResponse.json(
          { 
            success: false,
            error: `Backend error: ${response.status} ${response.statusText}`,
            details: errorText
          },
          { status: response.status }
        );
      }
    }
    
    const data = await response.json();
    console.log('✅ Backend response successful');
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Proxy error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to connect to backend',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}