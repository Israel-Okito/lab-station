import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Middleware personnalisé pour l'authentification
async function authMiddleware(request) {
  const url = request.nextUrl;
  const currentPath = url.pathname;
  
  // Routes publiques (accessibles sans connexion)
  const publicPaths = ['/login', '/unauthorized'];
  const isPublicPath = publicPaths.some(path => currentPath.includes(path));
  
  // Routes API (ne pas rediriger)
  const isApiPath = currentPath.startsWith('/api/');
  
  // Si c'est une route publique ou API, continuer
  if (isPublicPath || isApiPath) {
    return NextResponse.next();
  }
  
  // Créer le client Supabase pour vérifier la session
  let response = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set({ name, value, ...options });
          });
        },
      },
    }
  );
  
  // Vérifier la session Supabase
  const { data: { session } } = await supabase.auth.getSession();
  
  // Si pas de session et route protégée, rediriger vers login
  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', currentPath);
    return NextResponse.redirect(loginUrl);
  }
  
  // Si session présente, continuer
  return response;
}

// Middleware combiné : internationalisation + authentification
export default createMiddleware(routing, async (request) => {
  const url = request.nextUrl;
  const currentPath = url.pathname;
  
  // Si c'est une route API, laisser passer sans authentification pour l'instant
  if (currentPath.startsWith('/api/')) {
    return NextResponse.next();
  }
  
  // Appliquer d'abord l'internationalisation pour les autres routes
  const intlResponse = createMiddleware(routing)(request);
  
  // Puis appliquer l'authentification
  const authResponse = await authMiddleware(request);
  
  // Si l'authentification redirige, utiliser cette réponse
  if (authResponse.status === 302) {
    return authResponse;
  }
  
  // Sinon, continuer avec la réponse de l'internationalisation
  return intlResponse;
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};