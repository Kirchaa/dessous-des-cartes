
import { redirect } from "next/navigation"
import { createClient } from "@/app/_lib/supabase/server"
import VideosClient from "../_components/VideosClient"

export default async function VideosPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) redirect("/auth/login")

  // Tu peux aussi passer la session en prop si tu veux
  return <VideosClient />
}
