<script lang="ts" setup>
import type { Tables } from '~~/types/database.types'

type Plan = Tables<'plans'>

const { pagePlan } = useDatabaseHelpers()

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
    <PlansValidatedInput
      :plan="pagePlan"
      :field="field"
      :input-type="inputType"
      class="ml-auto rounded-md border border-slate-300 p-1 text-right text-sm"
    />
  </div>
</template>
