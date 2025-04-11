<script setup lang="ts">
const plans = useTable('plans', { verbose: true, autoFetch: true })
defineProps<{
  columns: { width: number, title: string }[]
}>()

const { pagePlan } = useDatabaseHelpers()
</script>

<template>
  <div class="flex w-full select-none flex-row border-b dark:border-black text-xs px-1">
    <div class="mr-auto flex items-center">
      <span class="text-gray-600 dark:text-gray-400">Sub:{{ plans.data.value.filter(p => p.parent === (pagePlan?.uuid || null) && !p.archived && plans.data.value.some(q => q.parent === p.uuid && !q.archived)).length }};</span>
      <span class="ml-1 text-gray-600 dark:text-gray-400">Task:{{ plans.data.value.filter(p => p.parent === (pagePlan?.uuid || null) && !p.archived && !plans.data.value.some(q => q.parent === p.uuid && !q.archived)).length }}</span>
    </div>
    <div
      v-for="column, index in columns"
      :key="index"
      class="flex border-l justify-center p-0.5 text-xs text-gray-600 dark:text-gray-400"
      :class="index === 0 || index === 1 ? 'w-16' : 'w-12'"
    >
      {{ column.title }}
    </div>
  </div>
</template>
