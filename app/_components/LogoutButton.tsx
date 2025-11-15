'use client';

import { createClient } from '@/app/_lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <Button variant="outline" onClick={handleLogout}>
      Se déconnecter
    </Button>
  );
}
