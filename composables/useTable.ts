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

watch(() => realtimeSubscriptionStatus.value, (status) => {
  if (status === 'CLOSED') {
    console.log('Subscription closing observed, resubscribing...')
    const { subscribe } = useDataBase()
    subscribe()
  }
})

const database = new Map<string, Ref<TableRow<TableNames>[]> | null>()
const prefetch = new Map<string, boolean>()

export function useDataBase(options?: DbOptions) {
  const supabase = useSupabaseClient<Database>()

  const subscribe = async () => {
    if (subscription && realtimeSubscriptionStatus.value !== 'CLOSED')
      await subscription.unsubscribe().then(() => {
        if (options?.verbose)
          console.log('unsubscribed from real-time changes')
      })

    realtimeSubscriptionStatus.value = null

    try {
      subscription = await supabase
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
            const id = 'id' in data ? data.id : null
            if (options?.verbose)
              console.log(`SUPABASE REALTIME: ${event}, payload:`, payload)
            if (!database.has(table)) database.set(table, ref([]))
            const dataTable = database.get(table)!.value
            if (event === 'INSERT' || event === 'UPDATE') {
              const index = dataTable.findIndex(row => row.id === id)
              if (index === -1 && data) dataTable.push(data)
              else dataTable[index] = data
            }
            else if (event === 'DELETE') {
              const index = dataTable.findIndex(row => row.id === id)
              if (index !== -1) dataTable.splice(index, 1)
            }
          },
        )
        .subscribe((status) => {
          if (options?.verbose)
            console.log('SUPABASE REALTIME SUBSCRIPTION STATUS:', status)
          realtimeSubscriptionStatus.value = status
        }, 1000) // default timeout is 10000. For testing purposes I will put a lower value
    }
    catch (error) {
      console.error('Failed to subscribe to real-time changes:', error)
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
  type idType = TableRow<T>['id']

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
    if (options?.verbose) console.log('fetching data for table', table)
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .returns<TableRow<T>[]>()
    if (error) {
      prefetch.set(table, prefetched)
      throw error
    }
    if (data) rows.value = data
    if (options?.verbose) console.log(rows.value.length + ' rows fetched for table', table)
  }

  // Add a new row to the table
  const create = async (newRow: TablesInsert<T>) => {
    if (options?.verbose)
      console.log('creating new row in table', table, newRow)
    const { data, error } = await supabase
      .from(table as TableNames)
      .insert(newRow)
      .single()
    if (error) throw error
    if (data) rows.value.push(data)
  }

  // Update a row in the table
  const update = async (id: idType, updatedData: TablesUpdate<T>) => {
    if (options?.verbose)
      console.log('updating row in table', table, id, updatedData)
    const { data, status, statusText } = await supabase
      .from(table as TableNames)
      .update(updatedData)
      .eq('id', id)
      .select()
    if (status !== 200) throw Error(statusText)
    if (data) {
      const index = rows.value.findIndex(row => row.id === id)
      if (index !== -1) rows.value[index] = data[0]
    }
  }

  // Delete a row from the table
  const remove = async (id: idType) => {
    if (options?.verbose) console.log('deleting row from table', table, id)
    const { status, statusText } = await supabase
      .from(table as TableNames)
      .delete()
      .eq('id', id)
    if (status !== 204) throw Error(statusText)
    rows.value = rows.value.filter(row => row.id !== id)
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
