import { createError } from 'h3'
import type { Database } from '~~/types/database.types'
import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient<Database>(event)

  if (!user) {
    throw createError({ statusMessage: 'User not logged in' })
  }

  const { data, error } = await client.from('plans').select('id, title, done').eq('responsible_id', user.id).order('created_at')
  if (error) {
    throw createError({ statusMessage: error.message })
  }

  return data
})