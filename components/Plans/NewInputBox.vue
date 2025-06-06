<script lang="ts" setup>
const user = useSupabaseUser()
const plans = useTable('plans', { verbose: true, autoFetch: true })
const { calculateNewItemPriority, pagePlan } = useDatabaseHelpers()

const loading = ref(false)
const newPlan = ref('')

const sortedSiblings = computed(() => plans.data.value
  .filter(p => p.parent === (pagePlan.value?.uuid || null))
  .filter(p => !p.archived)
  .toSorted((a, b) => (a.priority ?? 0) - (b.priority ?? 0)),
)

/**
 * Create a new plan within a project based on a title.
 * The assignee of the new plan is always the current user.
 * The priority is the average between the last element in the list and the following plan
 */
async function addPlan() {
  if (!user.value) return
  if (!newPlan.value) return

  loading.value = true
  plans
    .create({
      title: newPlan.value,
      assignee_id: user.value.id,
      parent: pagePlan.value?.uuid || null,
      priority: calculateNewItemPriority(sortedSiblings.value),
    })
    .then(
      () => (newPlan.value = ''),
      error => console.error('Error adding plan:', error),
    )
    .finally(() => (loading.value = false))
}
</script>

<template>
  <form v-if="!pagePlan?.archived" class="my-1 sm:my-2 flex w-full gap-1 sm:gap-2" @submit.prevent="addPlan">
    <UInput
      v-model="newPlan"
      :loading="loading"
      class="w-full dark:border-green-400"
      size="sm"
      variant="outline"
      type="text"
      name="newPlan"
      placeholder="Type something here to make a new task/subproject"
      autocomplete="off"
    />
    <UButton
      type="submit"
      variant="outline"
      size="sm"
      color="primary"
      class="flex-shrink-0"
    >
      Add
    </UButton>
  </form>
</template>
