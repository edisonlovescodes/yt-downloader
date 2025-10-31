import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyUserToken } from './lib/whop-sdk';

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

    try {
      // Verify the token
      await verifyUserToken(async () => request.headers);

      // Token is valid, continue
      return NextResponse.next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/experience/:path*',
    '/api/:path*',
  ],
};
