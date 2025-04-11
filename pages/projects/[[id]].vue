<script setup lang="ts">
import { PlansBreadCrumbs } from '#components'

const { pagePlan } = useDatabaseHelpers()
const route = useRoute()

// Archive panel state is now managed in the Overview component
const showArchived = ref(false)
</script>

<template>
  <div class="flex w-full flex-col items-center">
    <PlansBreadCrumbs
      class="mt-1 sm:mt-2 w-full self-start text-slate-500 px-2 sm:px-0"
      :plan="pagePlan?.uuid"
    />
    <div class="w-full overflow-hidden my-1 sm:my-2">
      <NuxtPage v-if="route.params.tab" />
      <PlansTabOverview v-else />
    </div>
    <ArchivePanel :show-archived="showArchived" class="px-2 sm:px-0" @toggle-show-archived="(value: boolean) => showArchived = value" />
  </div>
</template>
