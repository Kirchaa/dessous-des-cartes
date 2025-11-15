import { createClient } from "../../_lib/supabase/server";
import { redirect } from "next/navigation";
import VideoDetailClient from "../../_components/VideoDetailClient";

export default async function VideoDetailPage({ params }: { params: { video_id: string } }) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/auth/login');

  const videoId = params.video_id;
  return <VideoDetailClient videoId={videoId} />;
}
