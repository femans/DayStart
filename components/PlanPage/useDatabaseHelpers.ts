import type { Tables } from '~~/types/database.types'

type Plan = Tables<'plans'>

export default function useDatabaseHelpers() {
  const user = useSupabaseUser()
  const route = useRoute()
  const plans = useTable('plans', { verbose: true, autoFetch: true })

  const pagePlanId = computed(() =>
    isNaN(parseInt(route.params.id as string))
      ? null
      : parseInt(route.params.id as string),
  )

  const pagePlan = computed<Plan>(() =>
    plans.data.value.find(p => p.id === pagePlanId.value) ?? {
      title: '',
      manhours_required: 0,
    } as Plan,
  )
  let debounceTimeout: ReturnType<typeof setTimeout> | null = null

  function updatePlan(update: Partial<Plan>) {
    if (debounceTimeout) clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(async () => {
      if (!user.value) return
      if (update.id === undefined) return
      await plans.update(update.id, update).then(
        () => console.log(`Plan ${pagePlanId.value} updated with ${JSON.stringify(update)}`),
        error => console.error('Error updating plan:', error),
      )
    }, 150)
  }

  function archiveDoneChildren() {
    if (!user.value) return
    if (!pagePlanId.value) return
    plans.data.value
      .filter(p => p.parent_id === pagePlanId.value && p.done && !p.archived)
      .forEach(p => plans.update(p.id, { archived: true }))
  }

  return { plans, pagePlan, pagePlanId, updatePlan, archiveDoneChildren }
}
