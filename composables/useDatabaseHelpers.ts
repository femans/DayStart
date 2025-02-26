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
    plans.data.value.find(p => p.id === pagePlanId.value) ?? {} as Plan,
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
        .catch(error => console.error('Error caught updating plan:', error))
    }, 150)
  }

  function updatePagePlan(update: Partial<Plan>) {
    if (pagePlanId.value !== null) updatePlan({ id: pagePlanId.value, ...update })
  }

  function archiveDoneChildren() {
    if (!user.value) return
    if (!pagePlanId.value) return
    plans.data.value
      .filter(p => p.parent_id === pagePlanId.value && p.done && !p.archived)
      .forEach(p => plans.update(p.id, { archived: true }))
  }

  const planChildrenMap = computed(() => {
    const map = new Map<number | null, Plan[]>()
    for (const plan of plans.data.value) {
      if (!map.has(plan.parent_id)) {
        map.set(plan.parent_id, [])
      }
      map.get(plan.parent_id)!.push(plan)
    }
    return map
  })

  /**
   * taskList is a list of leaf plan that are currently active; this means that
   * they do not descend from any ancestor plan which are marked as done or archived.
   *
   * For convenience, they are sorted by priority.
   * Archived and done plans are included, and those are sorted at the end.
   */
  const taskList = computed(() => {
    const activeList: Plan[] = []

    function hasNoArchivedOrDoneAncestors(plan: Plan): boolean {
      while (plan) {
        const parent = plans.data.value.find(p => p.id === plan.parent_id)
        if (!parent) break
        plan = parent
        if (plan.done || plan.archived) return false
      }
      return true
    }

    for (const plan of plans.data.value) {
      if (!planChildrenMap.value.has(plan.id) && hasNoArchivedOrDoneAncestors(plan)) {
        activeList.push(plan)
      }
    }

    return activeList.toSorted((a, b) => {
      if (a.archived !== b.archived) {
        return a.archived ? 1 : -1
      }
      if (a.done !== b.done) {
        return a.done ? 1 : -1
      }
      if (a.done && b.done) return new Date(b.done_date ?? 0).getTime() - new Date(a.done_date ?? 0).getTime()
      return (a.priority ?? 0) - (b.priority ?? 0)
    })
  })

  return { plans, pagePlan, pagePlanId, updatePlan, updatePagePlan, archiveDoneChildren, taskList, planChildrenMap }
}
