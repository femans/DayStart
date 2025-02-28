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

  const sortedPrioList = computed(() => plans.data.value
    .toSorted((a, b) => a.priority - b.priority)
    .map(p => p.priority),
  // make unique:
    // .filter((p, index, arr) => p !== arr.at(index - 1)),
  )

  /**
   * calculate a new and pseudo-unique priority for an item
   */
  const calculatePriority = (aboveItemPriority: number | undefined, belowItemPriority: number | undefined): number => {
    let newPriority: number | undefined = undefined
    // normal case: average value
    if (aboveItemPriority !== undefined && belowItemPriority !== undefined) {
      newPriority = (aboveItemPriority + belowItemPriority) / 2
    }
    // It may happen that an item is moved to a location where there is a neighbour missing, e.g. top or bottom of the database
    // Then we add/subtract a random number to the priority to the other neighbour.
    // That way we minimize occurrence of duplicates, which would cause the average of 2 priorities be another duplicate.
    else if (aboveItemPriority) {
      newPriority = (aboveItemPriority ?? 0) + Math.random()
    }
    else if (belowItemPriority) {
      newPriority = (belowItemPriority ?? 0) - Math.random()
    }
    else newPriority = Math.random()
    if (!sortedPrioList.value.includes(newPriority)) return newPriority
    // edge case: there is another item with the same priority; take the average of calculated priority with the nearest neighbour
    const nextPriority = sortedPrioList.value.find(p => p > newPriority)
    if (nextPriority !== undefined) return (newPriority + nextPriority) / 2
    // or, if it doesn't exist, just add a random number.
    return newPriority + Math.random()
  }

  /**
   * calculate the priority of a new item place at the end of a list.
   * @params list: list of plans, does not yet include the item
   * @returns priority for new item
   */
  const calculateNewItemPriority = (list: Plan[], parent: Plan | null = pagePlan.value): number => {
    const aboveItemPriority: number = list.length === 0
      ? parent?.priority ?? 0
      : list.at(-1)!.priority
    const belowItemPriority: number | undefined = sortedPrioList.value.find(prio => prio > aboveItemPriority)
    return calculatePriority(aboveItemPriority, belowItemPriority)
  }

  /**
   * calculate the new priority of an item moved into a list based on surrounding items.
   * @params list: the list with the item already in it
   * @params index: the index of the item in the list
   * @returns new priority for the moved item
   */
  const calculateMovedItemPriority = (list: Plan[], index: number): number => {
    // If the item is moved to an empty list, don't change the priority
    if (list.length <= 1) return list[index].priority

    // If the item is moved to an already populated list, make the priority the average of the immediate neighbours
    // At the extremeties of the list, the average priority is taken between the neighbour in the list and the next existing priority in the database.
    const aboveItemPriority = (index > 0)
      ? list.at(index - 1)!.priority
      : sortedPrioList.value.findLast(prio => prio < list[1].priority)

    const belowItemPriority = (index < list.length - 1)
      ? list.at(index + 1)?.priority
      : sortedPrioList.value.find(prio => prio > list.at(index - 1)!.priority)

    return calculatePriority(aboveItemPriority, belowItemPriority)
  }

  return {
    plans,
    pagePlan,
    pagePlanId,
    updatePlan,
    updatePagePlan,
    archiveDoneChildren,
    taskList,
    planChildrenMap,
    calculateNewItemPriority,
    calculateMovedItemPriority,
  }
}
