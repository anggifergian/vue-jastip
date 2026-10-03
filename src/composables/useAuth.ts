import { supabase } from '@/lib/supabase'
import { ref, readonly } from 'vue'
import type { Session } from '@supabase/supabase-js'

const session = ref<Session | null>(null)

// Sync session from Supabase on init and whenever auth state changes
supabase.auth.getSession().then(({ data }) => {
  session.value = data.session
})

supabase.auth.onAuthStateChange((_event, newSession) => {
  session.value = newSession
})

export function useAuth() {
  async function getAccessToken(): Promise<string | null> {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return {
    session: readonly(session),
    getAccessToken,
    signOut,
  }
}
