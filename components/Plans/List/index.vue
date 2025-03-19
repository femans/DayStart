<script setup lang="ts">
const { pagePlanId } = useDatabaseHelpers()

defineProps<{
  showArchived: boolean
}>()
</script>

<template>
  <PlansListHeader />
  <PlansListContents :plan-id="pagePlanId" :show-archived="showArchived" />
</template>
