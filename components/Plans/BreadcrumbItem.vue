<script lang="ts" setup>
// Explicitly import the BreadcrumbListItem component
import PlansBreadcrumbListItem from './BreadcrumbListItem.vue'
import type { Tables } from '~~/types/database.types'

type Plan = Tables<'plans'>

const props = defineProps<{
  plan: Plan
  showBreadcrumbs?: boolean
  useLinks?: boolean
}>()

// Default to using links if not specified
const useLinks = computed(() => props.useLinks !== false)

const route = useRoute()
const { getTrail } = useBreadCrumbs()
const { pagePlan } = useDatabaseHelpers()

// Function to get filtered breadcrumbs for a plan
const getFilteredBreadcrumbs = (planUuid: string): Plan[] => {
  // Get the full trail of the plan
  const fullTrail = getTrail(planUuid)

  // Always remove the last item (the plan itself)
  const trailWithoutPlan = fullTrail.slice(0, -1)

  // If we're on the home page or there's no current project, return all breadcrumbs
  if (!pagePlan.value) {
    return trailWithoutPlan
  }

  // Find the index of the current project in the trail
  const currentProjectIndex = trailWithoutPlan.findIndex(crumb => crumb.uuid === pagePlan.value?.uuid)

  // If the current project is not in the trail, return the full trail without the plan
  // This ensures we always show breadcrumbs
  if (currentProjectIndex === -1) return trailWithoutPlan

  // Return only the breadcrumbs after the current project
  return trailWithoutPlan.slice(currentProjectIndex + 1)
}

// Get breadcrumbs for the current plan
const breadcrumbs = computed(() => {
  if (!props.showBreadcrumbs) return []
  return getFilteredBreadcrumbs(props.plan.uuid)
})

const currentTab = computed(() => route.params.tab || 'overview')
</script>

<template>
  <div class="flex items-center overflow-hidden">
    <PlansBlockersIcon :plan="plan" />

    <!-- Only show breadcrumbs if there are any and showBreadcrumbs is true -->
    <template v-if="breadcrumbs.length > 0 && showBreadcrumbs">
      <PlansBreadcrumbListItem :breadcrumbs="breadcrumbs" :use-links="useLinks" />
      <!-- Arrow between breadcrumbs and item -->
      <UIcon name="i-heroicons-arrow-right-16-solid" class="mx-1" />
    </template>

    <!-- The plan title with link if useLinks is true -->
    <NuxtLink
      v-if="useLinks"
      :to="{ name: 'projects-id-tab', params: { id: plan.id, tab: currentTab } }"
      class="truncate max-w-64"
      :class="{
        'italic text-slate-400 dark:text-slate-600': plan.archived,
        'text-slate-700 dark:text-slate-200': !plan.archived,
        'line-through': plan.done,
      }"
    >
      {{ plan.title }}
    </NuxtLink>

    <!-- The plan title without link if useLinks is false -->
    <span
      v-else
      class="truncate max-w-64"
      :class="{
        'italic text-slate-400 dark:text-slate-600': plan.archived,
        'text-slate-700 dark:text-slate-200': !plan.archived,
        'line-through': plan.done,
      }"
    >
      {{ plan.title }}
    </span>
  </div>
</template>
