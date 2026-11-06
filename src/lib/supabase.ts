import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !key) throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY')

export const supabase = createClient(url, key)

// Session expiry interceptor
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
    // Clear any sensitive data on logout
    sessionStorage.removeItem('portfolioEditor')
  }
})

// Add error interceptor for 401 responses
const originalFrom = supabase.from.bind(supabase)
;(supabase as any).from = function (table: string) {
  const result = originalFrom(table)

  // Wrap the original methods to handle 401 errors
  const wrapMethod = (method: any) => {
    return async function (...args: any[]) {
      try {
        return await method.apply(result, args)
      } catch (error: any) {
        if (error?.status === 401 || error?.message?.includes('401')) {
          // Save current form state to sessionStorage
          const editorState = sessionStorage.getItem('portfolioEditor')
          if (editorState) {
            sessionStorage.setItem('portfolioEditor:restore', editorState)
          }
          // Trigger logout which will redirect to login
          await supabase.auth.signOut()
        }
        throw error
      }
    }
  }

  return {
    ...result,
    select: wrapMethod(result.select),
    insert: wrapMethod(result.insert),
    update: wrapMethod(result.update),
    delete: wrapMethod(result.delete),
  }
}

