<script setup lang="ts">
import { useRoute } from 'vue-router'
import { PlansHeaderBudget, PlansHeaderOverview, PlansHeaderPlanning } from '#components'

// Route and component mapping
const route = useRoute()
const componentMap: Record<string, Component> = {
  overview: PlansHeaderOverview,
  planning: PlansHeaderPlanning,
  budget: PlansHeaderBudget,
}
</script>

<template>
  <component :is="componentMap[(route.params.tab as string).toLowerCase()]" />
</template>
