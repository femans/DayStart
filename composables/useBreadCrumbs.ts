export const useBreadCrumbs = () => {
  const plans = useTable('plans', { verbose: true, autoFetch: true })

  return {
    getTrail: (id: number | null) => {
      const trail = []
      let current = id
      while (current) {
        const plan = plans.data.value.find(p => p.id === current)
        if (!plan) break
        trail.unshift(plan)
        current = plan.parent_id
      }
      return trail
    },
  }
}
