<script setup lang="ts">
import { DropZone, useMovingItem } from 'vue-arrange'
import BreadCrumbs from '~/components/BreadCrumbs.vue'
import type { Tables, TablesInsert } from '~~/types/database.types'
import PlanOverview from '~/components/PlanOverview.vue'

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
const pagePlan = computed(() =>
  plans.data.value.find(p => p.id === pagePlanId.value),
)

const pagePlanHasDoneChildren = computed(() =>
  plans.data.value.some(p => p.parent_id === pagePlanId.value && p.done && !p.archived),
)
const pagePlanArchivedChildrenCount = computed(() =>
  plans.data.value.filter(p => p.parent_id === pagePlanId.value && p.archived).length,
)
function archiveDoneChildren() {
  if (!user.value) return
  if (!pagePlanId.value) return
  plans.data.value
    .filter(p => p.parent_id === pagePlanId.value && p.done && !p.archived)
    .forEach(p => plans.update(p.id, { archived: true }))
}

const loading = ref(false)
const newPlan = ref('')

async function addPlan() {
  if (!user.value) return
  if (!newPlan.value) return
  loading.value = true
  const plan: TablesInsert<'plans'> = {
    title: newPlan.value,
    responsible_id: user.value.id,
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

let timeout: ReturnType<typeof setTimeout> | null = null

async function updatePlan(event: Event) {
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(async () => {
    if (!user.value) return
    if (!pagePlan.value) return
    const target = event.target as HTMLInputElement
    const title = target.value
    plans.update(pagePlan.value.id, { title }).then(
      () =>
        console.log(`Plan ${pagePlanId.value} updated with title: ${title}`),
      error => console.error('Error updating plan:', error),
    )
  }, 150)
}

const showArchived = ref(false)
</script>

<template>
  <div class="flex w-full flex-col items-start">
    <BreadCrumbs
      class="m-2 w-full self-start text-slate-500"
      :plan="pagePlanId"
    />
    <UCard class="w-full overflow-hidden px-6 py-2">
      <textarea
        v-if="pagePlan"
        :value="pagePlan.title"
        class="h-auto w-full overflow-hidden text-3xl font-bold"
        rows="1"
        oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'"
        @change="updatePlan"
        @keydown.enter="(event) => (event.target as HTMLInputElement).blur()"
      />
      <div class="flex w-full flex-row">
        <span v-if="pagePlan" class="text-sm text-slate-400">
          {{ pagePlan.id }}
        </span>
        <UButton
          v-if="pagePlanHasDoneChildren"
          class="ml-auto"
          variant="solid"
          size="xs"
          color="gray"
          @click="archiveDoneChildren"
        >
          Archive done
        </UButton>
      </div>
      <h1 v-if="!pagePlan" class="flex flex-row items-center gap-2 text-3xl font-bold">
        <UIcon name="i-heroicons-home" />
        Home
      </h1>
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
        <UButton type="submit" variant="outline">
          Add
        </UButton>
      </form>
      <div class="flex w-full select-none flex-row border-b font-bold dark:border-black">
        <div class="mr-auto flex items-center">
          Project
        </div>
        <div class="flex items-center">
          Done?
        </div>
      </div>
      <PlanOverview ref="planOverview" :plan-id="pagePlanId" :show-archived="showArchived" />
    </UCard>
    <DropZone
      v-slot="{ isHovering }"
      identifier="trashbin"
      group="plansGroup"
    >
      <UCard
        class="m-2 flex w-auto flex-col items-center rounded-lg bg-sky-50"
        :class="{
          'border-red-500': movingItem?.payload.archived,
          'border-gray-300': !movingItem?.payload.archived,
        }"
      >
        <div class="flex flex-col items-center">
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
          </div>
          <UTooltip class="flex items-center" :prevent="isHovering" text="Toggle to show archived items">
            <UButton
              class="m-1 flex select-none transition-all"
              variant="solid"
              :color="isHovering && movingItem?.payload.archived ? 'red' : 'gray'"
              size="xs"
              @click="() => { !isHovering && (showArchived = !showArchived) }"
            >
              {{ movingItem?.payload.archived ? 'Drop here to delete forever' : (movingItem ? 'Drop here to archive' : `Archive: ${pagePlanArchivedChildrenCount || 'empty'}`) }}
            </UButton>
            <UToggle
              v-if="!movingItem"
              v-model="showArchived"
              on-icon="i-heroicons-eye"
              off-icon="i-heroicons-eye-slash"
              class="m-1"
            />
          </UTooltip>
        </div>
      </UCard>
    </DropZone>
  </div>
</template>
