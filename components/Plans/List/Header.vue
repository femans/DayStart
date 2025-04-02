<script setup lang="ts">
const plans = useTable('plans', { verbose: true, autoFetch: true })
defineProps<{
  columns: { width: number, title: string }[]
}>()

const { pagePlan } = useDatabaseHelpers()
</script>

<template>
  <div class="flex w-full select-none flex-row border-b dark:border-black">
    <div class="mr-auto flex items-center">
      Subprojects: {{ plans.data.value.filter(p => p.parent === (pagePlan?.uuid || null) && !p.archived && plans.data.value.some(q => q.parent === p.uuid && !q.archived)).length }};
      Tasks: {{ plans.data.value.filter(p => p.parent === (pagePlan?.uuid || null) && !p.archived && !plans.data.value.some(q => q.parent === p.uuid && !q.archived)).length }}
    </div>
    <div
      v-for="column, index in columns"
      :key="index"
      :style="{ width: `${column.width}px` }"
      class="flex border-l justify-center p-1 text-xs"
    >
      {{ column.title }}
    </div>
  </div>
</template>
