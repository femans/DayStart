<script lang="ts" setup>
const route = useRoute()
const { pagePlan, pagePlanId, updatePagePlan } = useDatabaseHelpers()
const { finishedChildren, unfinishedChildren } = usePlanList()

const tabs = ['overview', 'tasks', 'tracking', 'budget', 'expenses']
const titleArea = ref<HTMLElement | null>(null)
const stopwatch = ref<HTMLElement>()

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
    <div class="flex w-full flex-row">
      <PlansBlockersIcon :item="pagePlan" class="text-4xl bg-slate-400" />
      <textarea
        v-if="pagePlanId !== null"
        ref="titleArea"
        v-model="pagePlan.title"
        :disabled="pagePlan.archived"
        name="title"
        class="mr-auto h-auto w-full overflow-hidden text-3xl font-bold"
        :class="{
          'italic text-slate-400': pagePlan.archived,
          'text-slate-900 dark:text-slate-100': !pagePlan.archived,
        }"
        rows="1"
        oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'"
        @change="updatePagePlan({ title: ($event.target as HTMLTextAreaElement).value })"
        @keydown.enter="(event) => (event.target as HTMLInputElement).blur()"
      />
      <h1 v-else class="flex flex-row items-center gap-2 text-3xl font-bold">
        <UIcon name="i-heroicons-home" />
        Home
      </h1>
      <div
        v-if="pagePlan.done || (finishedChildren(pagePlanId) && !unfinishedChildren(pagePlanId))"
        class="flex size-10 min-w-10 items-center justify-center rounded-full "
        :class="{
          'bg-green-500': pagePlan.done,
          'bg-gray-300': !pagePlan.done,
        }"
      >
        <UIcon name="i-heroicons-check-20-solid" class="size-8 bg-white" />
      </div>
      <div
        v-if="pagePlanId"
        ref="stopwatch"
        class="relative flex size-10 min-w-10 cursor-pointer items-center justify-center rounded-full text-5xl"
      >
        <UIcon name="i-heroicons-clock" class="size-8 bg-gray-700 stopwatch" />
        <!-- <div class="stopwatch ">
          ⏱️
        </div> -->
      </div>
    </div>
    <!-- tab row -->
    <div class="mb-1 flex w-full flex-row items-center">
      <UIcon v-if="pagePlan?.archived" name="i-heroicons-archive-box" class="mr-2 size-5 text-slate-400" />
      <span v-if="pagePlan" class="text-sm text-slate-400">
        {{ pagePlan.id }}
      </span>
      <NuxtLink
        v-for="tabName in tabs"
        :key="tabName"
        class="-mb-1 ml-1 rounded-t-md border-b-0 border-gray-200 p-1 px-2  dark:border-gray-800 dark:bg-gray-900"
        :class="tabName === route.params.tab || (tabName === tabs[0] && !route.params.tab) ? 'z-20 border-2 bg-white' : 'z-0 border bg-gray-200 dark:bg-gray-900'"
        :to="{ name: 'projects-id-tab', params: { id: pagePlanId, tab: tabName } }"
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
