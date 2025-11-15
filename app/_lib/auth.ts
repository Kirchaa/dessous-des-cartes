// app/_lib/auth.ts
'use client';
import { createClient } from './supabase/client';

export async function getSessionUser() {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

export async function getMyProfile() {
  const supabase = createClient();
  const u = await getSessionUser();
  if (!u) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, pack_number, role')
    .eq('id', u.id)
    .maybeSingle();
  if (error) {
    console.warn('profiles select error', error.message);
    return null;
  }
  return data;
}
