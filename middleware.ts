import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "your_secret_key";

// Public paths that don't require authentication
const publicPaths = [
  '/',
  '/products',
  '/auth/signin',
  '/auth/signup',
  '/auth/verify',
  '/auth/reset-password',
  '/auth/forgot-password',
  '/auth/signout',
  '/api/auth',
];

// Function to check if the path is public
const isPublicPath = (path: string) =>
  publicPaths.some((publicPath) => path === publicPath) ||
  path.startsWith('/auth') ||
  path.startsWith('/api/auth') ||
  path.startsWith('/api/orders') ||
  path.startsWith('/api/reviews') ||
  path.startsWith('/products') ||
  path.startsWith('/_next') ||
  path.startsWith('/static') ||
  path.startsWith('/images') ||
  path.startsWith('/uploads') ||
  path.startsWith('/favicon') ||
  /\.(.*)$/.test(path); // Allow static assets

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Immediately redirect any legacy /dashboard routes to the /admin panel
  if (path === '/dashboard' || path.startsWith('/dashboard/')) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Allow public paths without authentication
  if (isPublicPath(path)) {
    return NextResponse.next();
  }
  
  // Protected routes check
  try {
    const token = await getToken({ 
      req: request,
      secret: NEXTAUTH_SECRET
    });
    
    // If not authenticated, redirect to signin
    if (!token) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error(`[Middleware] Error processing ${path}:`, error);
    if (!isPublicPath(path)) {
      const url = new URL('/auth/signin', request.url);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }
}

// Configure paths for middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};