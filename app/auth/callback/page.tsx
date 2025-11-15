'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/_lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClient()
  const [status, setStatus] = useState('Connexion en cours...')

  useEffect(() => {
    async function handleMagicLink() {
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')

      if (!code) {
        setStatus('Lien de connexion invalide ou expiré.')
        return
      }

      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
      if (error) {
        console.error(error)
        setStatus('Erreur lors de la connexion.')
      } else {
        setStatus('Connexion réussie ✅')
        router.replace('/')
        router.refresh()
      }
    }

    handleMagicLink()
  }, [router, supabase])

  return <p>{status}</p>
}
