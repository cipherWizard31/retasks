import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { checkRateLimit, validateCsrf } from '@/lib/security';

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate Limiting Protection
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.success) {
    return new NextResponse('Too Many Requests. Please slow down.', {
      status: 429,
      headers: {
        'Retry-After': String(rateLimit.reset),
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': '0',
      },
    });
  }

  // CSRF Protection
  if (!validateCsrf(request)) {
    return new NextResponse('Invalid CSRF Origin', { status: 403 });
  }

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const session = request.cookies.get('session')?.value;

  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(rateLimit.limit));
  response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining));
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
