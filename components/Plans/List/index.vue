<script setup lang="ts">
const { pagePlan } = useDatabaseHelpers()
const { totalChildren } = usePlanList()

const columns = [
  {
    width: 64,
    title: 'Budget',
  },
  {
    width: 64,
    title: 'Hours',
  },
  {
    width: 48,
    title: 'Done?',
  },
]

defineProps<{
  showArchived: boolean
}>()
</script>

<template>
  <template v-if="totalChildren(pagePlan?.uuid || null)">
    <PlansListHeader :columns="columns" />
    <PlansListContents :plan-uuid="pagePlan?.uuid || null" :show-archived="showArchived" :columns="columns" />
  </template>
</template>
