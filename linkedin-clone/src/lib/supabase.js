import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// When Supabase isn't configured, export a stub that mimics the query builder
// and resolves to an error result, so callers fall back to seeded data instead
// of the whole app crashing on a synchronous `createClient` throw at import.
function createStub() {
  const result = { data: null, error: { message: 'Supabase not configured' }, count: null }
  const builder = {
    select: () => builder,
    insert: () => builder,
    update: () => builder,
    upsert: () => builder,
    delete: () => builder,
    eq: () => builder,
    order: () => builder,
    limit: () => builder,
    single: () => builder,
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  }
  return { from: () => builder }
}

export const supabase = url && key ? createClient(url, key) : createStub()
