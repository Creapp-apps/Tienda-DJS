import { NextResponse } from 'next/server';

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas excepto:
     * 1. /api/ (endpoints de API)
     * 2. /_next/ (archivos internos de Next.js)
     * 3. /_static/ (archivos estáticos si existieran)
     * 4. Todos los archivos con extensiones (ej. favicon.ico, logo.png, etc.)
     */
    '/((?!api/|_next/|_static/|[_#]|favicon.ico|.*\\..*).*)',
  ],
};

export default function middleware(req) {
  const url = req.nextUrl;

  // Obtener el Host de la petición (ej. lozano.com, martinez.tiendadjs.com, localhost:3001)
  const hostname = req.headers.get('host') || 'tiendadjs.com';

  // Verificar si es entorno local de desarrollo
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1');

  let currentHost = '';
  if (isLocalhost) {
    // Si estás en local y usas un subdominio, ej: lozano.localhost:3001
    const parts = hostname.split('.');
    if (parts.length > 1 && !parts[0].includes('localhost')) {
      currentHost = parts[0];
    }
  } else {
    // Dominios y subdominios en producción
    const mainDomains = ['tiendadjs.com', 'tienda-djs.vercel.app', 'tienda-djs.vercel.app'];
    const matchingMainDomain = mainDomains.find(domain => hostname.endsWith(domain));

    if (matchingMainDomain) {
      // Es un subdominio oficial, ej: lozano.tiendadjs.com
      const subdomain = hostname.replace(`.${matchingMainDomain}`, '');
      if (subdomain !== hostname && subdomain !== 'www' && subdomain !== '') {
        currentHost = subdomain;
      }
    } else {
      // Es un dominio personalizado propio del artista (ej: lozano.com)
      currentHost = hostname;
    }
  }

  const searchParams = url.searchParams.toString();
  const path = `${url.pathname}${searchParams ? `?${searchParams}` : ''}`;

  // Evitar interceptar o reescribir la ruta global de SUPERADMIN
  if (url.pathname.startsWith('/superadmin')) {
    return NextResponse.next();
  }

  // Si detectamos un host especial (subdominio o dominio propio)
  if (currentHost && currentHost !== 'www') {
    // Evitar bucle infinito si la ruta ya apunta a /artists/
    if (url.pathname.startsWith('/artists')) {
      return NextResponse.next();
    }

    // Si es la página principal u otra sección de la web, hacemos un rewrite interno transparente.
    // Ejemplo: lozano.com/ -> /artists/lozano/
    // Ejemplo: lozano.com/shows -> /artists/lozano/shows
    return NextResponse.rewrite(
      new URL(`/artists/${currentHost}${path}`, req.url)
    );
  }

  return NextResponse.next();
}
