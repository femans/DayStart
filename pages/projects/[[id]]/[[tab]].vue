<script setup lang="ts">
import { useRoute } from 'vue-router'
import { PlansHeaderBudget, PlansHeaderOverview, PlansHeaderScheduling } from '#components'

// Route and component mapping
const route = useRoute()
const componentMap: Record<string, Component> = {
  overview: PlansHeaderOverview,
  scheduling: PlansHeaderScheduling,
  budget: PlansHeaderBudget,
}
</script>

<template>
  <component :is="componentMap[(route.params.tab as string).toLowerCase()]" />
</template>
