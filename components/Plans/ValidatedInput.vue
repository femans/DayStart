<script lang="ts" setup>
import useDatabaseHelpers from '../../composables/useDatabaseHelpers'
import type { Tables } from '~~/types/database.types'

defineOptions({ inheritAttrs: false })

type Plan = Tables<'plans'>

const { updatePlan } = useDatabaseHelpers()

const props = defineProps <{
  plan: Plan
  field: keyof Plan
  inputType: 'number' | 'text'
}>()

const input = ref(String(props.plan?.[props.field] ?? ''))

const validInput = computed(() => {
  return props.inputType === 'text' || (input.value === undefined || !isNaN(Number(input.value)))
})
</script>

<template>
  <input
    v-model="input"
    v-bind="$attrs"
    class="transition-all"
    :class="{
      'bg-red-300': !validInput,
    }"
    @change="event => validInput && updatePlan({ id: plan.id || undefined, [field]: (event.target as HTMLInputElement).value })"
    @keydown.enter="(event) => (event.target as HTMLInputElement).blur()"
  >
</template>
