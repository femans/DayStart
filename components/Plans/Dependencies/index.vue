<script lang="ts" setup>
import type { Tables } from '~~/types/database.types'

type Dependency = Tables<'plan_dependencies'>
type Plan = Tables<'plans'>
type DepListing = {
  label: string
  id: number
}

const user = useSupabaseUser()
const { plans, planDependencies, pagePlanId, planMap } = useDatabaseHelpers()

const labelMaker = (item: number) => {
  const plan = planMap.value.get(item)!
  return `${plan.done ? '✅' : ''} ${plan.id} - ${plan.title}`
}
const menuList = computed<DepListing[]>(() => plans.data.value
  .filter(plan => (!plan.archived && !plan.done))
  .map((plan: Plan) => ({
    id: plan.id,
    label: labelMaker(plan.id),
  })),
)
const dependencies = computed<DepListing[]>(() => {
  return planDependencies.data.value
    .filter((d: Dependency) => d.plan === pagePlanId.value)
    .map((d: Dependency) => ({
      id: d.depends_on,
      label: labelMaker(d.depends_on),
    }))
})

const inputList = computed<DepListing[]>({
  get() {
    return dependencies.value
  },
  set(newList: DepListing[]) {
    const addedDeps = newList?.filter(newDep => !dependencies.value?.some(oldDep => newDep.id === oldDep.id))
    const droppedDeps = dependencies.value?.filter(oldDep => !newList?.some(newDep => oldDep.id === newDep.id))
    addedDeps?.forEach(addedDep => planDependencies.create({
      created_by: user.value?.id,
      plan: pagePlanId.value!,
      depends_on: addedDep.id,
    }))
    droppedDeps?.forEach((droppedDep) => {
      const dep = planDependencies.data.value.find(d => d.plan === pagePlanId.value && d.depends_on === droppedDep.id)
      if (dep) planDependencies.remove(dep.id)
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
      <NuxtLink :to="{ name: 'projects-id', params: { id: item.id } }">
        {{ item.label }}
      </NuxtLink>
    </template>
    <template #item-label="{ item }">
      {{ item.label }}
    </template>
  </UInputMenu>
</template>
