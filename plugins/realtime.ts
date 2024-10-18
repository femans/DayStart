import type { Database, Tables } from '~~/types/database.types';
type Plan = Tables<'plans'>;

export default defineNuxtPlugin(() => {
  const supabase = useSupabaseClient<Database>()

  const plans = usePlans();
  const isLoading = useState<boolean>('isLoadingPlans', () => true)

  const fetchInitial = async () => {
    console.log("Fetching plans")
    isLoading.value = true
    const { data, error } = await supabase.from('plans').select('*').eq('archived', false)
    if (error) {
      console.error('Error fetching plans:', error)
    } else {
      plans.value = data as Plan[]
    }
    isLoading.value = false
  }

  const setupRealTimeUpdates = () => {
    console.log('Setting up real-time updates')
    const realtimeChannel = supabase.channel('schema-db-changes');

    const subscriptions = [
      { event: 'INSERT', table: 'plans', callback: (payload: any) => plans.value = [...plans.value, payload.new as Plan] },
      { event: 'UPDATE', table: 'plans', callback: (payload: any) => plans.value = plans.value.map((plan) => plan.id === payload.new.id ? payload.new : plan) },
    ]
    for(const { event, table, callback } of subscriptions) {
      realtimeChannel.on(
        'postgres_changes',
        {
          event,
          table,
          schema: 'public',
        },
        (payload: { new: Plan }) => {
          console.log(`Received ${event} event on table '${table}' with payload:`, payload);
          callback(payload);
        })
    }
    realtimeChannel.subscribe();
  }

  fetchInitial().then(setupRealTimeUpdates)

});
