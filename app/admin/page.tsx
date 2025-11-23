// app/admin/page.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/app/_lib/supabase/server';
import AdminClient from 'app/_components/AdminClient';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/auth/login');
  }

  // Vérifier que l'utilisateur est admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .maybeSingle();

  if (!profile || profile.role !== 'admin') {
    redirect('/');
  }

  // Récupérer tous les profils
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, pack_number, role')
    .order('created_at', { ascending: true });

  return <AdminClient initialProfiles={profiles ?? []} />;
}
