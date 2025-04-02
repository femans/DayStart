export const useBreadCrumbs = () => {
  const plans = useTable('plans', { verbose: true, autoFetch: true })

  return {
    getTrail: (uuid: string | null) => {
      const trail = []
      let current = uuid
      while (current) {
        const plan = plans.data.value.find(p => p.uuid === current)
        if (!plan) break
        trail.unshift(plan)
        current = plan.parent
      }
      return trail
    },
  }
}
