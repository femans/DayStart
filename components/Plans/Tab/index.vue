<script lang="ts" setup>
const route = useRoute()
const router = useRouter()
const navigateTo = (routeObj: { name: string, params: Record<string, string | null> }) => router.push(routeObj)
const { pagePlan, updatePlan } = useDatabaseHelpers()
const { finishedChildren, unfinishedChildren } = usePlanList()

const tabs = ['overview', 'tasks', 'planning', 'budget']
const titleArea = ref<HTMLElement | null>(null)

// For mobile tab dropdown
const currentTab = ref(typeof route.params.tab === 'string' ? route.params.tab : 'overview')

// Update currentTab when route changes
watch(() => route.params.tab, (newTab) => {
  currentTab.value = typeof newTab === 'string' ? newTab : 'overview'
})

watch(() => route.params, async () => {
  await nextTick()
  if (titleArea.value) {
    titleArea.value.style.height = ''
    titleArea.value.style.height = `${titleArea.value.scrollHeight}px`
  }
})
</script>

<template>
  <div class="relative px-2">
    <!-- Title -->
    <div class="flex w-full flex-row flex-wrap mb-1 sm:mb-2">
      <PlansBlockersIcon v-if="pagePlan" :plan="pagePlan" class="text-3xl sm:text-4xl bg-slate-400" />
      <textarea
        v-if="pagePlan"
        ref="titleArea"
        v-model="pagePlan!.title"
        :disabled="pagePlan!.archived"
        name="title"
        class="mr-auto h-auto w-full overflow-hidden text-2xl sm:text-3xl font-bold p-1 rounded-xs"
        :class="{
          'italic text-slate-400': pagePlan!.archived,
          'text-slate-900 dark:text-slate-100': !pagePlan!.archived,
        }"
        rows="1"
        oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'"
        @change="updatePlan({ uuid: pagePlan.uuid, title: ($event.target as HTMLTextAreaElement).value })"
        @keydown.enter="(event) => (event.target as HTMLInputElement).blur()"
      />
      <h1 v-else class="flex flex-row items-center gap-2 text-2xl sm:text-3xl font-bold mr-auto">
        <UIcon name="i-heroicons-home" />
        Home
      </h1>
      <div
        v-if="pagePlan && (pagePlan.done || (finishedChildren(pagePlan.uuid) && !unfinishedChildren(pagePlan.uuid)))"
        class="flex size-8 sm:size-10 min-w-8 sm:min-w-10 items-center justify-center rounded-full mt-1 sm:mt-0"
        :class="{
          'bg-green-500': pagePlan.done,
          'bg-gray-300': !pagePlan.done,
        }"
      >
        <UIcon name="i-heroicons-check-20-solid" class="size-6 sm:size-8 bg-white" />
      </div>
    </div>
    <!-- tab row - show for all pages -->
    <div class="hidden sm:flex w-full flex-row items-end overflow-x-auto px-2">
      <UIcon v-if="pagePlan?.archived" name="i-heroicons-archive-box" class="mr-2 size-5 text-slate-400 flex-shrink-0" />
      <NuxtLink
        v-for="tabName in tabs"
        :key="tabName"
        class="ml-1 rounded-t-md p-1 px-3 text-sm flex-shrink-0"
        :class="tabName === route.params.tab || (tabName === tabs[0] && !route.params.tab) ? 'z-20 border border-b-0 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900' : 'z-0 border border-gray-200 dark:border-gray-800 bg-gray-200 dark:bg-gray-900'"
        :to="{ name: 'projects-id-tab', params: { id: pagePlan?.id || null, tab: tabName } }"
      >
        {{ tabName }}
      </NuxtLink>
    </div>

    <!-- Mobile tabs buttons -->
    <div class="sm:hidden w-full px-2 mb-2 flex overflow-x-auto">
      <UButton
        v-for="tabName in tabs"
        :key="tabName"
        :variant="tabName === (route.params.tab || 'overview') ? 'solid' : 'outline'"
        :color="tabName === (route.params.tab || 'overview') ? 'primary' : 'neutral'"
        size="xs"
        class="mr-1 flex-shrink-0 capitalize"
        @click="navigateTo({ name: 'projects-id-tab', params: { id: pagePlan?.id || null, tab: tabName } })"
      >
        {{ tabName }}
      </UButton>
    </div>
    <!-- content panel -->
    <div class="relative z-10 p-0 sm:p-4 border border-gray-200 dark:border-gray-800 rounded-md sm:shadow">
      <slot />
    </div>
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
