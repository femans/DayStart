<script setup lang="ts">
import type { TablesInsert } from '~~/types/database.types'

const plans = useTable('plans', { verbose: true, autoFetch: false, autoSubscribe: false })

const user = useSupabaseUser()

const loading = ref(false)
const newPlan = ref('')

async function addPlan() {
  if (!user.value) return
  if (!newPlan.value) return
  loading.value = true
  const plan: TablesInsert<'plans'> = { title: newPlan.value, responsible_id: user.value.id }
  plans.create(plan).then(
    () => newPlan.value = '',
    error => console.error('Error adding plan:', error),
  ).finally(() => loading.value = false)
}
</script>

<template>
  <div class="w-full my-[50px] flex-col">
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
    <ClientOnly>
      <PlanOverview :plan="null" />
    </ClientOnly>
  </div>
</template>
