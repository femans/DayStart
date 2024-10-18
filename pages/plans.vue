<script setup lang="ts">
import type { Database, Tables } from '~~/types/database.types'

type Plan = Tables<'plans'>;

const client = useSupabaseClient<Database>()
const user = useSupabaseUser()

const loading = ref(false)
const newPlan = ref('')

const plans = usePlans();

async function addPlan() {
  if (newPlan.value.trim().length === 0) return

  loading.value = true

  const { data } = await client.from('plans')
    .upsert({
      responsible_id: user.value.id,
      title: newPlan.value,
      done: false,
    })
    .select('id, title, done')
    .single()

  newPlan.value = ''
  loading.value = false
}

const completePlan = async (plan: Plan) => {
  await client.from('plans').update({ done: plan.done }).match({ id: plan.id })
}

const removePlan = async (plan: Plan) => {
  await client.from('plans').update({archived: true}).match({ id: plan.id })
}

</script>

<template>
  <div class="w-full my-[50px]">
    <form
      class="flex gap-2 my-2"
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
    <UCard
      v-if="plans?.length > 0"
      class="px-6 py-2 overflow-hidden"
    >
      <ul>
        <li
          v-for="plan of plans"
          :key="plan.id"
          class="border-b border-gray-200 divide-y divide-gray-200"
        >
          <div class="py-2">
            <UFormGroup
              :label-class="`block font-medium ${plan.done ? 'line-through u-text-gray-500' : 'u-text-gray-700'}`"
              :label="plan.title"
              :name="String(plan.id)"
              class="flex items-center justify-between w-full"
            >
              <div class="flex items-center justify-between">
                <div @click="completePlan(plan)">
                  <UToggle
                    v-model="plan.done"
                    :name="String(plan.id)"
                    icon-off="heroicons-solid:x"
                    icon-on="heroicons-solid:check"
                  />
                </div>
                <UButton
                  class="ml-3 text-red-600"
                  size="sm"
                  color="red"
                  variant="ghost"
                  icon="i-heroicons-outline-trash"
                  @click="removePlan(plan)"
                />
              </div>
            </UFormGroup>
          </div>
        </li>
      </ul>
    </UCard>
  </div>
</template>

<style lang="postcss">
ul > li:last-child {
  @apply border-b-0;
}
</style>