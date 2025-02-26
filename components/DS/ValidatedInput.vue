<script lang="ts" setup>
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

const changeHandler = (event: Event) => {
  if (validInput.value) {
    let value: string | null = (event.target as HTMLInputElement).value
    if (value === '' && props.inputType === 'number') value = null
    updatePlan({ id: props.plan.id || undefined, [props.field]: value })
  }
}
watch(() => props.plan, (newPlan) => {
  if (newPlan) {
    input.value = String(newPlan[props.field] || '')
  }
}, { deep: true, immediate: true })
</script>

<template>
  <input
    v-if="plan.id !== undefined"
    v-model="input"
    v-bind="$attrs"
    class="transition-all"
    :class="{
      'bg-red-300': !validInput,
    }"
    @change="changeHandler"
    @keydown.enter="(event) => (event.target as HTMLInputElement).blur()"
  >
</template>
