<script lang="ts" setup>
import useDatabaseHelpers from './useDatabaseHelpers'
import type { Tables } from '~~/types/database.types'

type Plan = Tables<'plans'>

const { pagePlan, pagePlanId, updatePlan } = useDatabaseHelpers()

defineProps <{
  label: string
  field: keyof Plan
  inputType: 'number' | 'text'
}>()
</script>

<template>
  <div class="m-1 flex flex-row items-center gap-2 text-sm">
    <span>
      {{ label }}
    </span>
    <input
      :value="String(pagePlan[field] ?? '') "
      name="manhours_required"
      class="ml-auto rounded-md border border-slate-300 p-1 text-right text-sm text-slate-700"
      @change="event => updatePlan({ id: pagePlanId || undefined, [field]: (event.target as HTMLInputElement).value })"
      @keydown.enter="(event) => (event.target as HTMLInputElement).blur()"
    >
  </div>
</template>
