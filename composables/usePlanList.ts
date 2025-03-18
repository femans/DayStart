import type { Tables } from '~~/types/database.types'

type Plan = Tables<'plans'>

export const usePlanList = () => {
  const plans = useTable('plans', { verbose: true, autoFetch: true })

  const completePlan = async (p: Plan) => {
    await plans.update(p.id, { done: !p.done })
  }

  const finishedChildren = (itemId: number) =>
    plans.data.value.filter(p => p.parent_id === itemId && p.done && !p.archived).length
  const unfinishedChildren = (itemId: number) =>
    plans.data.value.filter(p => p.parent_id === itemId && !p.done && !p.archived).length
  const totalChildren = (itemId: number) =>
    plans.data.value.filter(p => p.parent_id === itemId && !p.archived).length
  const calculatedTimeRequired = (itemId: number): number =>
    plans.data.value.filter(p => p.parent_id === itemId && !p.archived).reduce((
      total,
      plan,
    ) => total + (plan.manhours_required || 0), 0)
  const redFlag = (item: Plan): boolean => item.manhours_required !== null && (calculatedTimeRequired(item.id) > (item.manhours_required))

  /**
 * placeholder: calculate the average of the time needed for each unfinished subtask that has no estimate yet
 */
  const placeholder = (item: Plan): string => {
    if (item.done || item.archived) return '(0)'
    if (redFlag(item)) return '!'
    const parent = (item.parent_id && plans.data.value.find(({ id }) => id === item.parent_id))
    if (parent) {
      if (redFlag(parent)) return '!'
      const unestimatedSiblings = plans.data.value.filter(p => p.parent_id === parent.id && !p.done && !p.archived && p.manhours_required === null).length
      const doneHoursSpent = plans.data.value
        .filter(p => p.parent_id === parent.id && p.done && !p.archived && p.manhours_required)
        .reduce((total, plan) => total + plan.manhours_required!, 0)
      return unestimatedSiblings
        ? `(${parent.manhours_required ? ((parent.manhours_required - doneHoursSpent) / unestimatedSiblings).toFixed(1).replace(/\.0$/, '') : '0'})`
        : 'err'
    }
    else if (totalChildren(item.id)) {
      return `(${calculatedTimeRequired(item.id)})`
    }
    return ''
  }

  return {
    completePlan,
    finishedChildren,
    unfinishedChildren,
    totalChildren,
    calculatedTimeRequired,
    redFlag,
    placeholder,
  }
}
