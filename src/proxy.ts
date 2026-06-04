import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage =
    req.nextUrl.pathname.startsWith('/login') ||
    req.nextUrl.pathname.startsWith('/register');

  if (!isLoggedIn && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/builder/:path*',
    '/history/:path*',
    '/api/cv/:path*',
    '/api/byok/:path*',
    '/api/user/:path*',
    '/api/job/:path*',
    '/api/resume/:path*',
  ],
};
