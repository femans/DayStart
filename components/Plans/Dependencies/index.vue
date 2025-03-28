<script lang="ts" setup>
import type { Tables } from '~~/types/database.types'

type Dependency = Tables<'plan_dependencies'>
type Plan = Tables<'plans'>

const user = useSupabaseUser()
const { plans, planDependencies, pagePlanId, planMap } = useDatabaseHelpers()

const menuList = computed<number[]>(() => plans.data.value
  .filter(plan => (!plan.archived && !plan.done))
  .map((plan: Plan) => plan.id),
)
const dependencies = computed<number[]>(() => {
  return planDependencies.data.value
    .filter((d: Dependency) => d.plan === pagePlanId.value)
    .map((d: Dependency) => d.depends_on)
})

const inputList = computed<number[]>({
  get() {
    return dependencies.value
  },
  set(newList: number[]) {
    const addedIds = newList?.filter(id => !dependencies.value?.some(planId => id === planId))
    const droppedIds = dependencies.value?.filter(id => !newList?.some(input => id === input))
    addedIds?.forEach(addedId => planDependencies.create({
      created_by: user.value?.id,
      plan: pagePlanId.value!,
      depends_on: addedId,
    }))
    droppedIds?.forEach((droppedId) => {
      const dep = planDependencies.data.value.find(d => d.plan === pagePlanId.value && d.depends_on === droppedId)?.id
      if (dep)planDependencies.remove(dep)
    })
  },
})
</script>

<template>
  <span>Blockers:</span>
  <UInputMenu
    v-model="inputList"
    class="w-full dark:border-green-400"
    size="xl"
    variant="outline"
    multiple
    :items="menuList"
  >
    <template #tags-item-text="{ item }">
      <NuxtLink :to="{ name: 'projects-id', params: { id: item } }">
        {{ `${planMap.get(item)!.done ? '✅' : ''} ${planMap.get(item)!.id} - ${planMap.get(item)!.title}` }}
      </NuxtLink>
    </template>
    <template #item-label="{ item }">
      {{ `${planMap.get(item)!.done ? '✅' : ''} ${planMap.get(item)!.id} - ${planMap.get(item)!.title}` }}
    </template>
  </UInputMenu>
</template>
