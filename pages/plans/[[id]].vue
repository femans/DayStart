<script setup lang="ts">
import { DropZone } from 'vue-arrange'
import BreadCrumbs from '~/components/BreadCrumbs.vue'
import type { TablesInsert } from '~~/types/database.types'
import PlanOverview from '~/components/PlanOverview.vue'

const plans = useTable('plans', { verbose: true, autoFetch: true })
const route = useRoute()
const user = useSupabaseUser()

const pagePlanId = computed(() =>
  isNaN(parseInt(route.params.id as string))
    ? null
    : parseInt(route.params.id as string),
)
const pagePlan = computed(() =>
  plans.data.value.find(p => p.id === pagePlanId.value),
)

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
      <h1 v-else class="flex flex-row items-center gap-2 text-3xl font-bold">
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
      <PlanOverview ref="planOverview" :plan-id="pagePlanId" />
    </UCard>
    <DropZone
      v-slot="{ isHovering }"
      identifier="trashbin"
      group="plansGroup"
      class="inline-block"
    >
      <div
        class="flex size-20 select-none items-center justify-center transition-all"
        :class="isHovering ? 'text-5xl' : 'text-4xl'"
      >
        🗑
      </div>
    </DropZone>
  </div>
</template>
