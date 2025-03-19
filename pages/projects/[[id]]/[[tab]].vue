<script setup lang="ts">
import { useRoute } from 'vue-router'
import { PlansHeaderBudget, PlansHeaderExpenses, PlansHeaderOverview, PlansHeaderPlanning, PlansHeaderTracking } from '#components'

// Route and component mapping
const route = useRoute()
const componentMap: Record<string, Component> = {
  overview: PlansHeaderOverview,
  planning: PlansHeaderPlanning,
  tracking: PlansHeaderTracking,
  budget: PlansHeaderBudget,
  expenses: PlansHeaderExpenses,
}
</script>

<template>
  <component :is="componentMap[(route.params.tab as string).toLowerCase()]" />
</template>
