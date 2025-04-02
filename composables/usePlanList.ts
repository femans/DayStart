import type { Tables } from '~~/types/database.types'

type Plan = Tables<'plans'>
type CalculationFields = keyof Plan & 'manhours_required' | 'budget'

export const usePlanList = () => {
  const plans = useTable('plans', { verbose: true, autoFetch: true })

  const completePlan = async (p: Plan) => {
    await plans.update(p.uuid, { done: !p.done })
  }

  const finishedChildren = (itemId: string | null): number =>
    plans.data.value.filter(p => p.parent === itemId && p.done && !p.archived).length
  const unfinishedChildren = (itemId: string | null): number | null =>
    plans.data.value.filter(p => p.parent === itemId && !p.done && !p.archived).length
  const totalChildren = (itemId: string | null) =>
    plans.data.value.filter(p => p.parent === itemId && !p.archived).length
  const calculatedAmountRequired = (itemId: string, field: CalculationFields): number =>
    plans.data.value.filter(p => p.parent === itemId && !p.archived).reduce((
      total,
      plan,
    ) => total + (plan[field] || 0), 0)
  const redFlag = (item: Plan, field: CalculationFields): boolean =>
    item[field] !== null && (calculatedAmountRequired(item.uuid, field) > (item[field]))

  /**
 * placeholder: calculate the average of the time needed for each unfinished subtask that has no estimate yet
 */
  const placeholder = (item: Plan, field: CalculationFields): string => {
    if (item.done || item.archived) return '(0)'
    if (redFlag(item, field)) return '!'
    const parent = (item.parent && plans.data.value.find(({ uuid }) => uuid === item.parent))
    if (parent) {
      if (redFlag(parent, field)) return '!'
      const unestimatedSiblings = plans.data.value.filter(p => p.parent === parent.uuid && !p.done && !p.archived && p[field] === null)
      const summedNumber = plans.data.value
        .filter(p => p.parent === parent.uuid && !p.archived && p[field])
        .reduce((total, plan) => total + plan[field]!, 0)
      return unestimatedSiblings
        ? `(${parent[field] ? ((parent[field] - summedNumber) / unestimatedSiblings.length).toFixed(1).replace(/\.0$/, '') : '0'})`
        : 'err'
    }
    else if (totalChildren(item.uuid)) {
      return `(${calculatedAmountRequired(item.uuid, field)})`
    }
    return ''
  }

  return {
    completePlan,
    finishedChildren,
    unfinishedChildren,
    totalChildren,
    calculatedTimeRequired: calculatedAmountRequired,
    redFlag,
    placeholder,
  }
}
