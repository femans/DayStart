<script setup lang="ts">
import { PlansTabOverview, PlansTabTasks, PlansTabTracking, PlansTabPlanning, PlansTabBudget, PlansTabExpenses } from '#components'

// Route and component mapping
const route = useRoute()
const componentMap: Record<string, Component> = {
  overview: PlansTabOverview,
  tasks: PlansTabTasks,
  tracking: PlansTabTracking,
  planning: PlansTabPlanning,
  budget: PlansTabBudget,
  expenses: PlansTabExpenses,
}
</script>

<template>
  <component :is="componentMap[(route.params.tab as string).toLowerCase()]" />
</template>
