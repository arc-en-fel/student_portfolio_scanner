import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Log configuration status (not credentials)
console.debug('[StudentFolio] Supabase configuration:', {
  url_set: !!url,
  key_set: !!key,
  env: import.meta.env.MODE,
})

// Throw if missing, but with a clear message
if (!url) {
  throw new Error(
    'StudentFolio: VITE_SUPABASE_URL environment variable not set. ' +
    'In Netlify, go to: Site Settings > Build & Deploy > Environment, and add VITE_SUPABASE_URL'
  )
}

if (!key) {
  throw new Error(
    'StudentFolio: VITE_SUPABASE_PUBLISHABLE_KEY environment variable not set. ' +
    'In Netlify, go to: Site Settings > Build & Deploy > Environment, and add VITE_SUPABASE_PUBLISHABLE_KEY'
  )
}

export const supabase = createClient(url, key)

// Session expiry interceptor
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
    sessionStorage.removeItem('portfolioEditor')
  }
})

// Session expiry interceptor
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || (event === 'TOKEN_REFRESHED' && !session)) {
    // Clear any sensitive data on logout
    sessionStorage.removeItem('portfolioEditor')
  }
})


