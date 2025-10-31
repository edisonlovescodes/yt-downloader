import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
export async function middleware(request: NextRequest) {
  const userToken = request.headers.get('x-whop-user-token');

  // Allow API routes to handle their own auth if needed
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Require authentication for experience routes
  if (request.nextUrl.pathname.startsWith('/experience/')) {
    if (!userToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No user token' },
        { status: 401 }
      );
    }

    // Token is present; downstream server components will perform full verification
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/experience/:path*',
    '/api/:path*',
  ],
};
