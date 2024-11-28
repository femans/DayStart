<script setup lang="ts">
import { DropZone } from 'vue-arrange'
import BreadCrumbs from '~/components/BreadCrumbs.vue'
import type { TablesInsert } from '~~/types/database.types'

const plans = useTable('plans', { verbose: true, autoFetch: true, autoSubscribe: true })
const route = useRoute()
const user = useSupabaseUser()

const pagePlanId = computed(() => isNaN(parseInt(route.params.id as string)) ? null : parseInt(route.params.id as string))

const loading = ref(false)
const newPlan = ref('')

async function addPlan() {
  if (!user.value) return
  if (!newPlan.value) return
  loading.value = true
  const plan: TablesInsert<'plans'> = { title: newPlan.value, responsible_id: user.value.id, parent_id: pagePlanId.value }
  plans.create(plan).then(
    () => newPlan.value = '',
    error => console.error('Error adding plan:', error),
  ).finally(() => loading.value = false)
}
</script>

<template>
  <div class="w-full flex flex-col items-start">
    <form
      class="flex gap-2 my-2 w-full"
      @submit.prevent="addPlan"
    >
      <UInput
        v-model="newPlan"
        :loading="loading"
        class="w-full"
        size="xl"
        variant="outline"
        type="text"
        name="newPlan"
        placeholder="Type something"
        autofocus
        autocomplete="off"
      />
      <UButton
        type="submit"
        variant="outline"
      >
        Add
      </UButton>
    </form>
    <UCard class="px-6 py-2 overflow-hidden w-full">
      <BreadCrumbs
        class="self-start text-slate-500 w-full border-stone-300 border p-2 rounded"
        :plan="pagePlanId"
      />
      <table class="w-full">
        <thead>
          <tr class="flex-row flex border-b divide-y divide-gray-200">
            <th
              class="flex items-center mr-auto select-none"
            >
              Project
            </th>
            <th
              class="flex items-center"
            >
              Done?
            </th>
          </tr>
        </thead>
        <PlanOverview :plan="pagePlanId" />
      </table>
    </UCard>
    <DropZone
      v-slot="{ isHovering }"
      identifier="trashbin"
      group="plansGroup"
      class="inline-block"
    >
      <div
        class="flex h-20 w-20 items-center justify-center transition-all select-none"
        :class="isHovering ? 'text-5xl' : 'text-4xl'"
      >
        🗑
      </div>
    </DropZone>
  </div>
</template>
