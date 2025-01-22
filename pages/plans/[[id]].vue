<script setup lang="ts">
import BreadCrumbs from '~/components/BreadCrumbs.vue'
import type { TablesInsert } from '~~/types/database.types'
import SubPlanList from '~/components/PlanPage/SubPlanList.vue'
import PlanPageHead from '~/components/PlanPage/PlanPageHead.vue'
import ArchiveSection from '~/components/PlanPage/ArchiveSection.vue'

const plans = useTable('plans', { verbose: true, autoFetch: true })
const route = useRoute()
const user = useSupabaseUser()

const pagePlanId = computed(() =>
  isNaN(parseInt(route.params.id as string))
    ? null
    : parseInt(route.params.id as string),
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
      <SubPlanList :plan-id="pagePlanId" :show-archived="showArchived" />
    </UCard>
    <ArchiveSection :show-archived="showArchived" @toggle-show-archived="(value: boolean) => showArchived = value" />
  </div>
</template>
