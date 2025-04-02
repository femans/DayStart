<script lang="ts" setup>
import type { Tables } from '~~/types/database.types'

type Dependency = Tables<'plan_dependencies'>
type Plan = Tables<'plans'>
type DepListing = {
  label: string
  id: string
  slug: string
}

const user = useSupabaseUser()
const { plans, planDependencies, pagePlan, planMap } = useDatabaseHelpers()

const labelMaker = (planUuid: string) => {
  const plan = planMap.value.get(planUuid)!
  return `${plan.done ? '✅' : ''} ${plan.id} - ${plan.title}`
}
const menuList = computed<DepListing[]>(() => plans.data.value
  .filter(plan => (!plan.archived && !plan.done))
  .map((plan: Plan) => ({
    id: plan.uuid,
    label: labelMaker(plan.uuid),
    slug: String(plan.id),
  })),
)
const dependencies = computed<DepListing[]>(() => {
  if (!pagePlan.value) return []
  return planDependencies.data.value
    .filter((d: Dependency) => d.plan === pagePlan.value!.uuid)
    .map((d: Dependency) => ({
      id: d.depends_on,
      label: labelMaker(d.depends_on),
      slug: String(planMap.value.get(d.depends_on)!.id),
    }))
})

const inputList = computed<DepListing[]>({
  get() {
    return dependencies.value
  },
  set(newList: DepListing[]) {
    if (!pagePlan.value) return
    const addedDeps = newList?.filter(newDep => !dependencies.value?.some(oldDep => newDep.id === oldDep.id))
    addedDeps?.forEach(addedDep => planDependencies.create({
      created_by: user.value?.id,
      plan: pagePlan.value!.uuid,
      depends_on: addedDep.id,
    }))
    const droppedDeps = dependencies.value?.filter(oldDep => !newList?.some(newDep => oldDep.id === newDep.id))
    droppedDeps?.forEach((droppedDep) => {
      const dep = planDependencies.data.value.find(d => d.plan === pagePlan.value!.uuid && d.depends_on === droppedDep.id)
      if (dep) planDependencies.remove(dep.uuid)
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
      <NuxtLink :to="{ name: 'projects-id', params: { id: item.slug } }">
        {{ item.label }}
      </NuxtLink>
    </template>
    <template #item-label="{ item }">
      {{ item.label }}
    </template>
  </UInputMenu>
</template>
