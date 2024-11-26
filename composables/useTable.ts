import type { RealtimeChannel, RealtimePostgresDeletePayload, RealtimePostgresInsertPayload, RealtimePostgresUpdatePayload } from '@supabase/realtime-js'
import type { Database, TablesInsert, TablesUpdate } from '~~/types/database.types'

export type TableNames = keyof Database['public']['Tables']
export type TableRow<T extends TableNames> = Database['public']['Tables'][T]['Row']

const subscriptions = new Map<string, Ref<RealtimeChannel | null>>()
const database = new Map<string, Ref<TableRow<TableNames>[]> | null>()
const prefetch = new Map<string, boolean>()

/**
 * This composable provides a set of methods to interact with a specific table in the database.
 * @param table The name of the table to interact with.
 * @param options Optional options to configure the behavior of the composable.
 * @param options.autoFetch Whether to fetch the initial data from the database, if nothing has been fetched yet. Default is `true`.
 * @param options.autoSubscribe Whether to subscribe to real-time changes if it hasn't yet. Default is `true`.
 * @param options.prefix A prefix to add to the table name used to store the data in nuxt-useState. Default is `supabase-`.
 * @param options.verbose Whether to log real-time changes to the console. Default is `false`.
 */
export function useTable<T extends TableNames>(
  table: T,
  options?: {
    autoFetch?: boolean
    autoSubscribe?: boolean
    prefix?: string
    verbose?: boolean
  },
) {
  type idType = TableRow<T>['id']

  // Note that we can not use useSupabaseClient outside of the composable because it requires access to the nuxt instance
  const supabase = useSupabaseClient<Database>()

  const subscription = subscriptions.get(table) || subscriptions.set(table, ref(null)).get(table) as Ref<RealtimeChannel | null>
  const rows = database.get(table) || database.set(table, ref([])).get(table) as Ref<TableRow<T>[]>

  /**
   *  Fetch initial data from the database
   * */
  const fetchData = async () => {
    const prefetched = prefetch.get(table) || false;
    prefetch.set(table, true);
    if (options?.verbose) console.log('fetching data for table', table)
    const { data, error } = await supabase.from(table).select('*').returns<TableRow<T>[]>()
    if (error) {
      prefetch.set(table, prefetched);
      throw error
    }
    if (data) rows.value = data
    if (options?.verbose) console.log(rows.value.length + ' rows fetched')
  }

  // Add a new row to the table
  const create = async (newRow: TablesInsert<T>) => {
    if (options?.verbose) console.log('creating new row in table', table, newRow)
    const { data, error } = await supabase
      .from(table as TableNames)
      .insert(newRow).single()
    if (error) throw error
    if (data) rows.value.push(data)
  }

  // Update a row in the table
  const update = async (id: idType, updatedData: TablesUpdate<T>) => {
    if (options?.verbose) console.log('updating row in table', table, id, updatedData)
    const { data, error } = await supabase
      .from(table as TableNames)
      .update(updatedData)
      .eq('id', id)
      .single()
    if (error) throw error
    if (data) {
      const index = rows.value.findIndex(row => row.id === id)
      if (index !== -1) rows.value[index] = data
    }
  }

  // Delete a row from the table
  const remove = async (id: idType) => {
    if (options?.verbose) console.log('deleting row from table', table, id)
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    if (error) throw error
    rows.value = rows.value.filter(row => row.id !== id)
  }

  // Real-time subscription
  const subscribe = () => {
    if (options?.verbose) console.log('subscribing to real-time changes')
    if (subscription.value) subscription.value.unsubscribe()
    try {
      subscription.value = supabase
        .channel(table)
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
          },
          (payload: RealtimePostgresInsertPayload<TableRow<T>>) => {
            if (options?.verbose) console.log('INSERT', payload)
            rows.value.push(payload.new)
          },
        )
        .on('postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
          },
          (payload: RealtimePostgresUpdatePayload<TableRow<T>>) => {
            if (options?.verbose) console.log('UPDATE', payload)
            const index = rows.value.findIndex(row => row.id === payload.old.id)
            if (index !== -1) rows.value[index] = payload.new
          },
        )
        .on('postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
          },
          (payload: RealtimePostgresDeletePayload<TableRow<T>>) => {
            if (options?.verbose) console.log('DELETE', payload)
            rows.value = rows.value.filter(row => row.id !== payload.old.id)
          },
        )
        .subscribe((status) => {
          if (options?.verbose) console.log('subscription status:', status)
        })
    }
    catch (error) {
      console.error('Failed to subscribe to real-time changes:', error)
    }
    if (options?.verbose) console.log(`subscribed to real-time changes on table ${table}`)
  }

  // Initialize data and subscribe to real-time changes
  if (options?.autoSubscribe !== false && subscription.value === null) subscribe()
  if (prefetch.get(table) !== true && options?.autoFetch !== false) fetchData()

  // Return methods for external use
  return {
    data: rows as Readonly<Ref<TableRow<T>[]>>,
    create,
    update,
    remove,
    fetchData,
    subscribe,
  }
}
