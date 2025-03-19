<script setup lang="ts">
const plans = useTable('plans', { verbose: true, autoFetch: true })
const { pagePlanId } = useDatabaseHelpers()
</script>

<template>
  <div class="flex w-full select-none flex-row border-b dark:border-black">
    <div class="mr-auto flex items-center">
      Subprojects: {{ plans.data.value.filter(p => p.parent_id === pagePlanId && !p.archived && plans.data.value.some(q => q.parent_id === p.id && !q.archived)).length }};
      Tasks: {{ plans.data.value.filter(p => p.parent_id === pagePlanId && !p.archived && !plans.data.value.some(q => q.parent_id === p.id && !q.archived)).length }}
    </div>
    <div class="flex w-10 justify-center bg-sky-100 p-1 text-xs">
      Budget
    </div>
    <div class="flex w-10 justify-center bg-teal-100 p-1 text-xs">
      Cost
    </div>
    <div class="flex w-10 justify-center bg-green-100 p-1 text-xs">
      Hrs
    </div>
    <div class="flex w-10 justify-center p-1 text-xs">
      Done?
    </div>
  </div>
</template>
