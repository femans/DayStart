/**
 * Supabase Database Connection and Realtime Subscription Management
 *
 * This module provides composables for interacting with Supabase tables and managing
 * realtime subscriptions. It includes robust reconnection logic to handle network
 * interruptions and computer suspend/resume cycles.
 *
 * Key features:
 * - Automatic reconnection after network interruptions
 * - Detection of computer suspend/resume via Page Visibility API
 * - Exponential backoff for reconnection attempts
 * - Comprehensive error handling
 * - Type-safe database operations
 */

import {
  REALTIME_LISTEN_TYPES,
  type RealtimeChannel,
  type RealtimePostgresDeletePayload,
  type RealtimePostgresInsertPayload,
  type RealtimePostgresUpdatePayload,
} from '@supabase/realtime-js'

import type {
  Database,
  TablesInsert,
  TablesUpdate,
} from '~~/types/database.types'

export type TableNames = keyof Database['public']['Tables']
export type TableRow<T extends TableNames> =
  Database['public']['Tables'][T]['Row']

type PostgresChange<T extends TableNames> =
  | RealtimePostgresInsertPayload<TableRow<T>>
  | RealtimePostgresUpdatePayload<TableRow<T>>
  | RealtimePostgresDeletePayload<TableRow<T>>

export type DbOptions = {
  autoFetch?: boolean
  prefix?: string
  verbose?: boolean
}

let subscription: RealtimeChannel | null = null
const realtimeSubscriptionStatus = ref<string | null>()
let reconnectAttempts = 0
const maxReconnectAttempts = 5
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null

watch(() => realtimeSubscriptionStatus.value, (status) => {
  if (status === 'CLOSED') {
    console.log('Subscription closing observed, resubscribing...')
    reconnectWithBackoff()
  }
  else if (status === 'SUBSCRIBED') {
    // Reset reconnect attempts when successfully subscribed
    reconnectAttempts = 0
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout)
      reconnectTimeout = null
    }
  }
})

/**
 * Handle reconnection with exponential backoff strategy
 * Attempts reconnection with increasing delays up to a maximum number of attempts
 * Will reset and try again when page becomes visible or network comes back online
 */
const reconnectWithBackoff = () => {
  // Check if we've reached the maximum number of attempts
  if (reconnectAttempts >= maxReconnectAttempts) {
    console.warn(`Maximum reconnection attempts (${maxReconnectAttempts}) reached. Will try again when page becomes visible.`)
    return
  }

  // Calculate backoff time with exponential increase, capped at 30 seconds
  const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000)
  console.log(`Attempting to reconnect in ${backoffTime}ms (attempt ${reconnectAttempts + 1}/${maxReconnectAttempts})`)

  // Clear any existing timeout to avoid multiple reconnection attempts
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout)
    reconnectTimeout = null
  }

  // Schedule the reconnection attempt
  reconnectTimeout = setTimeout(() => {
    reconnectAttempts++
    const { subscribe } = useDataBase()
    subscribe()
  }, backoffTime)
}

const database = new Map<string, Ref<TableRow<TableNames>[]> | null>()
const prefetch = new Map<string, boolean>()

export function useDataBase(options?: DbOptions) {
  const supabase = useSupabaseClient<Database>()

  // Setup visibility change listener to handle computer suspend/resume
  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('online', handleOnlineStatus)
    window.addEventListener('offline', handleOfflineStatus)
  })

  onUnmounted(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('online', handleOnlineStatus)
    window.removeEventListener('offline', handleOfflineStatus)
  })

  /**
   * Handle visibility change events (page shown/hidden)
   * This is crucial for detecting when the computer wakes from sleep/suspend
   */
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      console.log('Page became visible, checking Supabase connection...')
      if (realtimeSubscriptionStatus.value !== 'SUBSCRIBED') {
        console.log('Reconnecting to Supabase after visibility change')
        reconnectAttempts = 0 // Reset reconnect attempts
        subscribe()
      }
    }
  }

  /**
   * Handle browser online events
   * Reconnects to Supabase when the browser regains internet connectivity
   */
  const handleOnlineStatus = () => {
    console.log('Browser is online, checking Supabase connection...')
    if (realtimeSubscriptionStatus.value !== 'SUBSCRIBED') {
      console.log('Reconnecting to Supabase after coming online')
      reconnectAttempts = 0 // Reset reconnect attempts
      subscribe()
    }
  }

  /**
   * Handle browser offline events
   * Logs the offline status but doesn't attempt to reconnect
   */
  const handleOfflineStatus = () => {
    console.log('Browser is offline, Supabase connection may be interrupted')
  }

  const subscribe = () => {
    // Unsubscribe from existing subscription if it exists and is not already closed
    if (subscription && realtimeSubscriptionStatus.value !== 'CLOSED') {
      subscription.unsubscribe()
      if (options?.verbose) {
        console.log('unsubscribed from real-time changes')
      }
    }

    realtimeSubscriptionStatus.value = null

    try {
      // Create a new subscription
      subscription = supabase
        .channel('realtime')
        .on(
          REALTIME_LISTEN_TYPES.POSTGRES_CHANGES,
          {
            event: '*',
            schema: '*',
          },
          (payload: PostgresChange<TableNames>) => {
            const table = payload.table as TableNames
            const event = payload.eventType
            const data = payload.new as TableRow<TableNames>
            const uuid = 'uuid' in data ? data.uuid : null

            if (options?.verbose) {
              console.log(`SUPABASE REALTIME: ${event}, payload:`, payload)
            }

            // Ensure the table exists in our local database
            if (!database.has(table)) {
              database.set(table, ref([]))
            }

            const dataTable = database.get(table)!.value

            // Handle different event types
            if (event === 'INSERT' || event === 'UPDATE') {
              const index = dataTable.findIndex(row => row.uuid === uuid)
              if (index === -1 && data) {
                dataTable.push(data)
              }
              else {
                dataTable[index] = data
              }
            }
            else if (event === 'DELETE') {
              const index = dataTable.findIndex(row => row.uuid === uuid)
              if (index !== -1) {
                dataTable.splice(index, 1)
              }
            }
          },
        )
        .subscribe((status) => {
          if (options?.verbose) {
            console.log('SUPABASE REALTIME SUBSCRIPTION STATUS:', status)
          }
          realtimeSubscriptionStatus.value = status
        }, 1000) // default timeout is 10000. For testing purposes I will put a lower value
    }
    catch (error) {
      console.error('Failed to subscribe to real-time changes:', error)
      // If subscription fails, try to reconnect with backoff
      reconnectWithBackoff()
    }
  }

  return { subscribe, realtimeSubscriptionStatus }
}
/**
 * This composable provides a set of methods to interact with a specific table in the database.
 * @param table The name of the table to interact with.
 * @param options Optional options to configure the behavior of the composable.
 * @param options.autoFetch Whether to fetch the initial data from the database, if nothing has been fetched yet. Default is `true`.
 * @param options.prefix A prefix to add to the table name used to store the data in nuxt-useState. Default is `supabase-`.
 * @param options.verbose Whether to log real-time changes to the console. Default is `false`.
 */
export function useTable<T extends TableNames>(table: T, options?: DbOptions) {
  type idType = TableRow<T>['uuid']

  // Note that we can not use useSupabaseClient outside of the composable because it requires access to the nuxt instance
  const supabase = useSupabaseClient<Database>()

  const rows
    = database.get(table)
      || (database.set(table, ref([])).get(table) as Ref<TableRow<T>[]>)

  /**
   *  Fetch initial data from the database
   * */
  const fetchData = async () => {
    const prefetched = prefetch.get(table) || false
    prefetch.set(table, true)

    if (options?.verbose) {
      console.log('fetching data for table', table)
    }

    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .returns<TableRow<T>[]>()

      if (error) {
        throw error
      }

      if (data) {
        rows.value = data
      }

      if (options?.verbose) {
        console.log(`${rows.value.length} rows fetched for table ${table}`)
      }
    }
    catch (error) {
      prefetch.set(table, prefetched) // Reset prefetch flag on error
      console.error(`Error fetching data for table ${table}:`, error)
      throw error
    }
  }

  // Add a new row to the table
  const create = async (newRow: TablesInsert<T>) => {
    if (options?.verbose) {
      console.log('creating new row in table', table, newRow)
    }

    try {
      const { data, error } = await supabase
        .from(table as TableNames)
        .insert(newRow)
        .single()

      if (error) {
        throw error
      }

      if (data) {
        rows.value.push(data)
      }
    }
    catch (error) {
      console.error(`Error creating row in table ${table}:`, error)
      throw error
    }
  }

  // Update a row in the table
  const update = async (uuid: idType, updatedData: TablesUpdate<T>) => {
    if (options?.verbose) {
      console.log('updating row in table', table, uuid, updatedData)
    }

    try {
      const { data, status, statusText } = await supabase
        .from(table as TableNames)
        .update(updatedData)
        .eq('uuid', uuid)
        .select()

      if (status !== 200) {
        throw Error(statusText)
      }

      if (data) {
        const index = rows.value.findIndex(row => row.uuid === uuid)
        if (index !== -1) {
          rows.value[index] = data[0]
        }
      }
    }
    catch (error) {
      console.error(`Error updating row in table ${table}:`, error)
      throw error
    }
  }

  // Delete a row from the table
  const remove = async (uuid: idType) => {
    if (options?.verbose) {
      console.log('deleting row from table', table, uuid)
    }

    try {
      const { status, statusText } = await supabase
        .from(table as TableNames)
        .delete()
        .eq('uuid', uuid)

      if (status !== 204) {
        throw Error(statusText)
      }

      rows.value = rows.value.filter(row => row.uuid !== uuid)
    }
    catch (error) {
      console.error(`Error deleting row from table ${table}:`, error)
      throw error
    }
  }

  // Initialize data
  if (prefetch.get(table) !== true && options?.autoFetch !== false) fetchData()

  // Return methods for external use
  return {
    data: rows as Readonly<Ref<TableRow<T>[]>>,
    create,
    update,
    remove,
    fetchData,
  }
}
