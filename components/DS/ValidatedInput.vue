<script lang="ts" setup>
import type { Tables } from '~~/types/database.types'

defineOptions({ inheritAttrs: false })

type Plan = Tables<'plans'>

const { updatePlan } = useDatabaseHelpers()

const props = defineProps <{
  plan: Plan
  field: keyof Plan
  inputType: 'number' | 'text' | 'url'
}>()

const input = ref(String(props.plan?.[props.field] ?? ''))

// Validate input based on type
const validInput = computed(() => {
  if (props.inputType === 'text') return true
  if (props.inputType === 'number') return input.value === undefined || !isNaN(Number(input.value))
  if (props.inputType === 'url') {
    if (!input.value) return true
    // Trim whitespace before validating
    const trimmedValue = input.value.trim()
    // Simple URL validation - doesn't require protocol prefix
    return /^[\w.-]+\.[a-zA-Z]{2,}(\S*)?$/.test(trimmedValue) || /^https?:\/\//.test(trimmedValue)
  }
  return true
})

const changeHandler = (event: Event) => {
  if (validInput.value) {
    let value: string | null = (event.target as HTMLInputElement).value
    if (value === '' && props.inputType === 'number') value = null
    updatePlan({ uuid: props.plan.uuid, [props.field]: value })
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
    class="transition-all w-full"
    :class="{
      'bg-red-300': !validInput,
    }"
    @change="changeHandler"
    @keydown.enter="(event) => (event.target as HTMLInputElement).blur()"
  >
</template>
