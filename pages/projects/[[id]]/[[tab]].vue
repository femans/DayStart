<script setup lang="ts">
import { PlansTabOverview, PlansTabTasks, PlansTabPlanning, PlansTabBudget } from '#components'

// Route and component mapping
const route = useRoute()
const componentMap: Record<string, Component> = {
  overview: PlansTabOverview,
  tasks: PlansTabTasks,
  planning: PlansTabPlanning,
  budget: PlansTabBudget,
}
</script>

<template>
  <component :is="componentMap[(route.params.tab as string).toLowerCase()]" />
</template>
