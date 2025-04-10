<script lang="ts" setup>
const route = useRoute()
const { pagePlan, updatePlan } = useDatabaseHelpers()
const { finishedChildren, unfinishedChildren } = usePlanList()

const tabs = ['overview', 'tasks', 'tracking', 'planning', 'budget', 'expenses']
const titleArea = ref<HTMLElement | null>(null)

watch(() => route.params, async () => {
  await nextTick()
  if (titleArea.value) {
    titleArea.value.style.height = ''
    titleArea.value.style.height = `${titleArea.value.scrollHeight}px`
  }
})
</script>

<template>
  <div class="relative">
    <!-- Title -->
    <div class="flex w-full flex-row mb-2">
      <PlansBlockersIcon v-if="pagePlan" :plan="pagePlan" class="text-4xl bg-slate-400" />
      <textarea
        v-if="pagePlan"
        ref="titleArea"
        v-model="pagePlan!.title"
        :disabled="pagePlan!.archived"
        name="title"
        class="mr-auto h-auto w-full overflow-hidden text-3xl font-bold p-1 rounded-xs"
        :class="{
          'italic text-slate-400': pagePlan!.archived,
          'text-slate-900 dark:text-slate-100': !pagePlan!.archived,
        }"
        rows="1"
        oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'"
        @change="updatePlan({ uuid: pagePlan.uuid, title: ($event.target as HTMLTextAreaElement).value })"
        @keydown.enter="(event) => (event.target as HTMLInputElement).blur()"
      />
      <h1 v-else class="flex flex-row items-center gap-2 text-3xl font-bold mr-auto">
        <UIcon name="i-heroicons-home" />
        Home
      </h1>
      <div
        v-if="pagePlan && (pagePlan.done || (finishedChildren(pagePlan.uuid) && !unfinishedChildren(pagePlan.uuid)))"
        class="flex size-10 min-w-10 items-center justify-center rounded-full "
        :class="{
          'bg-green-500': pagePlan.done,
          'bg-gray-300': !pagePlan.done,
        }"
      >
        <UIcon name="i-heroicons-check-20-solid" class="size-8 bg-white" />
      </div>
    </div>
    <!-- tab row - show for all pages -->
    <div class="mb-1 flex w-full flex-row items-center">
      <UIcon v-if="pagePlan?.archived" name="i-heroicons-archive-box" class="mr-2 size-5 text-slate-400" />
      <NuxtLink
        v-for="tabName in tabs"
        :key="tabName"
        class="-mb-1 ml-1 rounded-t-md border-b-0 border-gray-200 p-1 px-2  dark:border-gray-800 dark:bg-gray-900"
        :class="tabName === route.params.tab || (tabName === tabs[0] && !route.params.tab) ? 'z-20 border-2 bg-white' : 'z-0 border bg-gray-200 dark:bg-gray-900'"
        :to="{ name: 'projects-id-tab', params: { id: pagePlan?.id || null, tab: tabName } }"
      >
        {{ tabName }}
      </NuxtLink>
    </div>
    <!-- overview panel -->
    <UCard class="relative z-10">
      <slot />
    </UCard>
  </div>
</template>

<style scoped>
.stopwatch {
  animation: rotateStopwatch 3s linear infinite;
}

@keyframes rotateStopwatch {
  0% { transform: rotateY(0deg); }
  100% { transform: rotateY(360deg);}
}
</style>
