<script setup lang="ts">
import { PlansBreadCrumbs } from '#components'

const { pagePlan } = useDatabaseHelpers()
const route = useRoute()

const showArchived = ref(false)
</script>

<template>
  <div class="flex w-full flex-col items-center">
    <PlansBreadCrumbs
      class="mt-2 w-full self-start text-slate-500"
      :plan="pagePlan?.uuid"
    />
    <UCard class="w-full overflow-hidden px-6 py-2 my-2">
      <NuxtPage v-if="route.params.tab" />
      <PlansHeaderOverview v-else />
      <PlansNewInputBox />
      <PlansList :show-archived="showArchived" />
    </UCard>
    <ArchivePanel :show-archived="showArchived" @toggle-show-archived="(value: boolean) => showArchived = value" />
  </div>
</template>
