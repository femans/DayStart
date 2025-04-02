<script setup lang="ts">
import type { Tables } from '~~/types/database.types'

type Plan = Tables<'plans'>

const { blockers, planMap } = useDatabaseHelpers()

defineProps <{
  plan: Plan | null
}>()
</script>

<template>
  <UTooltip
    v-if="plan && blockers.get(plan.id)?.length"
    :text="`First finish: ${blockers.get(plan.id)?.map(id => `'${id} - ${planMap.get(id)?.title}'`).join(', ')}`"
  >
    <UIcon name="i-heroicons-hand-raised" v-bind="$attrs" />
  </UTooltip>
</template>
