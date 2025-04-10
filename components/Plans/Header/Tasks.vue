<script lang="ts" setup>
import { ArrangeableList, useMovingItem, type MovingItem } from 'vue-arrange'
import type { Tables } from '~~/types/database.types'

type Plan = Tables<'plans'>
const { isMoving } = useMovingItem()
const { pagePlan, plans, calculateMovedItemPriority, planMap } = useDatabaseHelpers()
const { getTrail } = useBreadCrumbs()
const { placeholder } = usePlanList()
const route = useRoute()

const showDone = ref(false)
const recentlyChecked = ref(new Set<string>())

// Function to check if a plan is a descendant of the current project
// and has no done or archived ancestors
const isDescendantOf = (plan: Plan, ancestorUuid: string | null): boolean => {
  // Base case: invalid inputs
  if (!plan || !ancestorUuid) return false

  // Start from the current plan and traverse up the hierarchy
  let currentPlan: Plan | undefined = plan

  while (currentPlan && currentPlan.parent !== ancestorUuid) {
    // Get the parent plan using planMap (more efficient than find)
    // Handle null parent case
    if (!currentPlan.parent) return false
    const parentPlan = planMap.value.get(currentPlan.parent)

    // If parent doesn't exist, this branch is not a descendant
    if (!parentPlan) return false

    // If any ancestor is done or archived, exclude this task
    if (parentPlan.done || parentPlan.archived) return false

    // Move up to the parent
    currentPlan = parentPlan
  }

  // If we reached here and currentPlan exists, it means we found a path
  // to the ancestor without any done or archived plans in between
  return !!currentPlan
}

// Get the current project UUID for filtering
const currentProjectUuid = computed(() => pagePlan.value?.uuid || '')

// Get all tasks (leaf nodes) from the current project and its descendants
const projectTasks = computed(() => {
  // If we're on the home page (no current project), use the taskList from useDatabaseHelpers
  if (!pagePlan.value) {
    const { taskList } = useDatabaseHelpers()
    return taskList.value
      .filter(plan => plan.done === showDone.value || recentlyChecked.value.has(plan.uuid))
      .filter(plan => !plan.archived)
      .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
  }

  // For project pages, show tasks from the current project and its descendants
  return plans.data.value.filter((plan) => {
    // Include the plan if it's a direct child of the current project
    const isDirectChild = plan.parent === currentProjectUuid.value

    // Include the plan if it's a descendant of the current project
    const isDescendant = !isDirectChild && isDescendantOf(plan, currentProjectUuid.value)

    // Only include plans that are leaf nodes (don't have children)
    const hasChildren = plans.data.value.some(p => p.parent === plan.uuid && !p.archived)

    return (isDirectChild || isDescendant) && !hasChildren
  })
    .filter(plan => plan.done === showDone.value || recentlyChecked.value.has(plan.uuid))
    .filter(plan => !plan.archived)
    .sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
})

// Function to get filtered breadcrumbs for a task
const getFilteredBreadcrumbs = (taskUuid: string): Plan[] => {
  // Get the full trail of the task
  const fullTrail = getTrail(taskUuid)

  // If we're on the home page or there's no current project, return all breadcrumbs except the task itself
  if (!pagePlan.value) {
    return fullTrail.slice(0, -1) // Remove the last item (the task itself)
  }

  // Find the index of the current project in the trail
  // Use optional chaining to handle null case
  const currentProjectIndex = fullTrail.findIndex(crumb => crumb.uuid === pagePlan.value?.uuid)

  // If the current project is not in the trail, return an empty array
  if (currentProjectIndex === -1) return []

  // Return only the breadcrumbs after the current project, excluding the task itself
  return fullTrail.slice(currentProjectIndex + 1)
}

const checkDone = async (p: Plan) => {
  recentlyChecked.value.add(p.uuid)
  await plans.update(p.uuid, { done: !p.done })
    .then(() => setTimeout(() => recentlyChecked.value.delete(p.uuid), 10000))
}

function changePriority(item: MovingItem<Plan>) {
  if (!item.destination) return
  const destinationIndex = item.destination.index ?? -1
  if (destinationIndex === item.origin.index && item.destination.identifier === item.origin.identifier) return
  const newPriority = calculateMovedItemPriority(item.destination.listItems!, destinationIndex)
  item.payload.priority = newPriority
  plans.update(item.payload.uuid, { priority: newPriority })
    .then(() => {
      console.log('Item priority updated successfully', plans.data.value.find(p => p.id === item.payload.id))
    })
}
</script>

<template>
  <PlansHeader tab="tasks">
    <div class="flex w-full flex-row items-center gap-2 mb-4">
      <h2 class="flex w-full flex-row items-center gap-2 text-xl font-bold">
        <UIcon name="i-heroicons-clipboard-document-list" />
        {{ pagePlan ? 'Project Tasks' : 'All Tasks' }}
      </h2>
      <UButton
        size="sm"
        color="neutral"
        @click="showDone = !showDone"
      >
        {{ showDone ? 'Show To Do' : 'Show Done' }}
      </UButton>
    </div>

    <div class="flex w-full select-none flex-row border-b dark:border-black">
      <div class="mr-auto flex items-center">
        Tasks: {{ projectTasks.length }}
      </div>
      <div class="flex w-10 justify-center p-1 text-xs">
        Hrs
      </div>
      <div class="flex w-10 justify-center p-1 text-xs">
        Done?
      </div>
    </div>

    <div v-if="projectTasks.length === 0" class="py-4 text-center text-gray-500">
      No {{ showDone ? 'completed' : 'pending' }} tasks found for this project.
    </div>

    <ArrangeableList
      v-slot="{ item }"
      :list="projectTasks"
      :options="{
        listTransition: {},
        handle: true,
        hoverClass: 'bg-lime-200',
      }"
      @drop-item="changePriority"
    >
      <div class="flex w-full flex-row py-1">
        <!-- handle and title -->
        <div
          class="mr-auto flex select-none items-center font-medium overflow-hidden max-w-[calc(100%-80px)]"
          :class="[item.done ? 'line-through' : '', item.archived ? 'text-gray-400' : 'text-gray-700']"
        >
          <UIcon name="i-heroicons-ellipsis-vertical" class="cursor-grab" data-handle />
          <PlansBlockersIcon :plan="item" />
          <!-- Use a computed property to avoid calling the function multiple times -->
          <template v-if="getFilteredBreadcrumbs(item.uuid).length > 0">
            <!-- Only show breadcrumbs that are descendants of the current project -->
            <PlansTruncatedBreadcrumbs
              :breadcrumbs="getFilteredBreadcrumbs(item.uuid)"
            />
            <!-- Arrow between breadcrumbs and item -->
            <UIcon
              name="i-heroicons-arrow-right-16-solid"
              class="mx-1"
            />
          </template>
          <NuxtLink
            :to="{ name: 'projects-id-tab', params: { id: item.id, tab: route.params.tab || 'overview' } }"
            class="truncate max-w-64"
            :class="{
              'italic text-slate-400 dark:text-slate-600': item.archived,
              'text-slate-700 dark:text-slate-200': !item.archived,
            }"
          >
            {{ item.title }}
          </NuxtLink>
        </div>
        <!-- details -->
        <div v-if="!isMoving(item)" class="flex flex-row">
          <DSValidatedInput
            class="mb-1 mr-2 w-8 border-b border-solid border-gray-300 px-1 text-right text-sm outline-none"
            field="manhours_required"
            input-type="number"
            :plan="item"
            :placeholder="placeholder(item, 'manhours_required')"
          />
          <div class="flex w-10 justify-center">
            <UCheckbox
              v-model="item.done"
              @click="checkDone(item)"
            />
          </div>
        </div>
      </div>
    </ArrangeableList>
  </PlansHeader>
</template>
