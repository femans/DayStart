<script setup lang="ts">
const { pagePlanId } = useDatabaseHelpers()
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
  <template v-if="totalChildren(pagePlanId)">
    <PlansListHeader :columns="columns" />
    <PlansListContents :plan-id="pagePlanId" :show-archived="showArchived" :columns="columns" />
  </template>
</template>
