<script setup lang="ts">
import { PlansHeaderOverview, PlansHeaderTasks, PlansHeaderTracking, PlansHeaderBudget, PlansHeaderExpenses } from '#components'

// Route and component mapping
const route = useRoute()
const componentMap: Record<string, Component> = {
  overview: PlansHeaderOverview,
  tasks: PlansHeaderTasks,
  tracking: PlansHeaderTracking,
  budget: PlansHeaderBudget,
  expenses: PlansHeaderExpenses,
}
</script>

<template>
  <component :is="componentMap[(route.params.tab as string).toLowerCase()]" />
</template>
