import { type NextRequest, NextResponse } from 'next/server';

function authMiddleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  console.log('Requested Pathname:', pathname);
  console.log('AccessToken', req.cookies.get('seller_access_token'));

  return NextResponse.next();
}

export function proxy(req: NextRequest) {
  return authMiddleware(req);
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
