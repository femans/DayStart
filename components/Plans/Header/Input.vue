<script lang="ts" setup>
import type { Tables } from '~~/types/database.types'

type Plan = Tables<'plans'>

const { pagePlan } = useDatabaseHelpers()

defineProps <{
  label: string
  field: keyof Plan
  inputType: 'number' | 'text' | 'url'
}>()
</script>

<template>
  <div
    v-if="pagePlan"
    class="m-1 flex flex-row items-center gap-2 text-sm"
    :class="$attrs.class"
  >
    <span>
      {{ label }}
    </span>
    <!-- Use ValidatedInput for all field types -->
    <DSValidatedInput
      :plan="pagePlan"
      v-bind="$attrs"
      :field="field"
      :input-type="inputType"
      class="ml-auto rounded-md border border-gray-200 p-1 text-sm dark:border-gray-800"
      :class="{
        'text-right': inputType === 'number',
        'w-full': inputType === 'text' || inputType === 'url',
      }"
    />
  </div>
</template>
