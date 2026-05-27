import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, audios, logos (static public assets)
     */
    '/((?!api/|_next/static|_next/image|images/|favicon.ico).*)',
  ],
};

export async function middleware(req) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';
  const pathname = url.pathname;

  // Default fallback artist
  let slug = 'nehuen-lozano';

  // Resolve custom domains or localhost testing ports to their respective artist slug
  // In production, we will query Supabase table 'artists' to match 'custom_domain' dynamically.
  if (hostname.includes('otrodj.com')) {
    slug = 'otro-dj';
  } else if (hostname.includes('nehuenlozano.com')) {
    slug = 'nehuen-lozano';
  }

  // Rewrite request internally to /artists/[slug]/...
  url.pathname = `/artists/${slug}${pathname}`;

  return NextResponse.rewrite(url);
}
