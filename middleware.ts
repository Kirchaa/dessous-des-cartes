import { updateSession } from "@/app/_lib/supabase/middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// ⚙️ protège seulement /videos et /packs
export const config = {
  matcher: ["/videos/:path*", "/packs/:path*"],
};
