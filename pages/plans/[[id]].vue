<script setup lang="ts">
import { DropZone, useMovingItem } from 'vue-arrange'
import BreadCrumbs from '~/components/BreadCrumbs.vue'
import type { Tables, TablesInsert } from '~~/types/database.types'
import SubPlanList from '~/components/SubPlanList.vue'

const plans = useTable('plans', { verbose: true, autoFetch: true })
const route = useRoute()
const user = useSupabaseUser()

type Plan = Tables<'plans'>
const { movingItem } = useMovingItem<Plan>()

const pagePlanId = computed(() =>
  isNaN(parseInt(route.params.id as string))
    ? null
    : parseInt(route.params.id as string),
)
const pagePlanArchivedChildrenCount = computed(() =>
  plans.data.value.filter(p => p.parent_id === pagePlanId.value && p.archived).length,
)
const loading = ref(false)
const newPlan = ref('')

async function addPlan() {
  if (!user.value) return
  if (!newPlan.value) return
  loading.value = true
  const plan: TablesInsert<'plans'> = {
    title: newPlan.value,
    assignee_id: user.value.id,
    parent_id: pagePlanId.value,
    priority: Math.max(0, ...plans.data.value.filter(p => p.parent_id === pagePlanId.value).map(p => p.priority || 0)) + 1,
  }
  plans
    .create(plan)
    .then(
      () => (newPlan.value = ''),
      error => console.error('Error adding plan:', error),
    )
    .finally(() => (loading.value = false))
}

const showArchived = ref(false)

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
  <div class="flex w-full flex-col items-start">
    <BreadCrumbs
      class="m-2 w-full self-start text-slate-500"
      :plan="pagePlanId"
    />
    <UCard class="w-full overflow-hidden px-6 py-2">
      <PlanPageHead />
      <form class="my-2 flex w-full gap-2" @submit.prevent="addPlan">
        <UInput
          v-model="newPlan"
          :loading="loading"
          class="w-full dark:border-green-400"
          size="xl"
          variant="outline"
          type="text"
          name="newPlan"
          placeholder="Type something"
          autofocus
          autocomplete="off"
        />
        <UTooltip
          text="Add new plan"
          col
          :shortcuts="['⤶']"
          :popper="{ arrow: true }"
        >
          <UButton type="submit" variant="outline">
            Add
          </UButton>
        </UTooltip>
      </form>
      <div class="flex w-full select-none flex-row border-b font-bold dark:border-black">
        <div class="mr-auto flex items-center">
          Projects: {{ plans.data.value.filter(p => p.parent_id === pagePlanId && !p.archived).length }}
        </div>
        <div class="flex items-center">
          Done?
        </div>
      </div>
      <SubPlanList ref="planOverview" :plan-id="pagePlanId" :show-archived="showArchived" />
    </UCard>
    <DropZone
      v-slot="{ isHovering }"
      identifier="trashbin"
      group="plansGroup"
    >
      <UTooltip :popper="{ arrow: true }" :prevent="isHovering" text="Toggle to show archived items">
        <UCard
          class="m-2 flex w-auto flex-col items-center rounded-lg bg-sky-50 transition-all hover:bg-sky-100"
          :class="{
            'border-red-500': movingItem?.payload.archived,
            'border-gray-300': !movingItem?.payload.archived,
          }"
          @click="() => { !isHovering && (showArchived = !showArchived) }"
        >
          <div class="flex flex-col items-center">
            <span
              class="m-1 flex select-none transition-all"
              :class="{
                'text-red-500': isHovering && movingItem?.payload.archived,
              }"
              size="xs"
            >
              {{ movingItem?.payload.archived ? 'Drop here to DELETE forever' : (movingItem ? 'Drop here to archive' : `Archive: ${pagePlanArchivedChildrenCount || 'empty'}`) }}
            </span>
            <span v-if="movingItem?.payload.archived && plans.data.value.some(p => p.parent_id === movingItem?.payload.id)" class="flex items-center text-sm">
              <UIcon name="i-heroicons-information-circle" />
              This item can not be deleted, because it has dependencies
            </span>
            <span v-else-if="movingItem?.payload.archived" class="flex items-center text-sm text-red-500">
              <UIcon name="i-heroicons-exclamation-triangle" />
              This action is irreversible
            </span>
            <div class="flex items-center">
              <UIcon
                class="transition-all "
                :class="{
                  'size-16': isHovering,
                  'size-12': !isHovering,
                  'text-red-500': isHovering && movingItem?.payload.archived,
                  'text-gray-400': !isHovering || !movingItem?.payload.archived,
                }"
                :name="movingItem?.payload.archived ? 'i-heroicons-trash' : (isHovering ? 'i-heroicons-archive-box-arrow-down' : 'i-heroicons-archive-box')"
              />
              <UToggle
                v-if="!movingItem"
                :model-value="showArchived"
                on-icon="i-heroicons-eye"
                off-icon="i-heroicons-eye-slash"
                class="m-1"
              />
            </div>
          </div>
        </UCard>
      </UTooltip>
    </DropZone>
  </div>
</template>
