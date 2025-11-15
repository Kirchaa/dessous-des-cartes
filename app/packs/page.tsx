// app/packs/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/app/_lib/supabase/server";
import PacksClient from "../_components/PacksClient";

export default async function PacksPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return <PacksClient />;
}
