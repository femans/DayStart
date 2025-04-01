<script setup lang="ts">
import type { Tables } from '~~/types/database.types'

type Plan = Tables<'plans'>

const { blockers, planMap } = useDatabaseHelpers()

defineProps <{
  item: Plan
}>()
</script>

<template>
  <UTooltip
    v-if="blockers.get(item.id)?.length"
    :text="`First finish: ${blockers.get(item.id)?.map(id => `'${id} - ${planMap.get(id)?.title}'`).join(', ')}`"
  >
    <UIcon name="i-heroicons-hand-raised" v-bind="$attrs" />
  </UTooltip>
</template>
