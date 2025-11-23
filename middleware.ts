// middleware.ts (root)

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Middleware neutre : on laisse tout passer, plus aucun appel à Supabase ici
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

// Aucun chemin matché = middleware désactivée pour toutes les routes
export const config = {
  matcher: [],
};
