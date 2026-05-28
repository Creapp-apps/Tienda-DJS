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

  // 1. Exclude admin portal from any internal rewrites
  if (pathname.startsWith('/superadmin')) {
    return NextResponse.next();
  }

  let slug = '';

  // 2. Resolve custom domains
  if (hostname.includes('otrodj.com')) {
    slug = 'otro-dj';
  } else if (hostname.includes('nehuenlozano.com')) {
    slug = 'nehuen-lozano';
  }

  // 3. Resolve subdomains (e.g. artist-slug.localhost:3000 or artist-slug.tiendadjs.com)
  if (!slug) {
    let subdomain = '';
    const parts = hostname.split('.');
    if (parts.length > 2) {
      subdomain = parts[0];
    } else if (parts.length === 2 && parts[1].includes('localhost')) {
      subdomain = parts[0];
    }

    if (subdomain && subdomain !== 'www') {
      slug = subdomain;
    }
  }

  // 4. If an active dynamic tenant slug is detected, rewrite internally to /artists/[slug]/...
  if (slug) {
    url.pathname = `/artists/${slug}${pathname}`;
    return NextResponse.rewrite(url);
  }

  // 5. Otherwise, serve the default platform pages (e.g. main template, layouts, base home page)
  return NextResponse.next();
}
