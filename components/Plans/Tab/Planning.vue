<script setup lang="ts">
import { USeparator } from '#components'

const plans = useTable('plans', { verbose: true, autoFetch: true })
const { pagePlan } = useDatabaseHelpers()

const unfinishedChildren = computed(() =>
  plans.data.value.filter(p => p.parent === (pagePlan.value?.uuid || null) && !p.done && !p.archived),
)

const children = computed(() =>
  plans.data.value.filter(p => p.parent === (pagePlan.value?.uuid || null) && !p.archived),
)

const totalChildren = computed(() =>
  plans.data.value.filter(p => p.parent === (pagePlan.value?.uuid || null) && !p.archived).length,
)

const calculatedTimeRequired = computed(() =>
  children.value.reduce((
    total,
    plan,
  ) => total + (plan.manhours_required || 0), 0),
)

const finishedTaskTimeSpent = computed(() =>
  calculatedTimeRequired.value - unfinishedChildren.value.reduce((
    total,
    plan,
  ) => total + (plan.manhours_required || 0), 0),
)

const progress = computed(() => finishedTaskTimeSpent.value / (calculatedTimeRequired.value || 1) * 100)
</script>

<template>
  <PlansTab tab="planning">
    <template v-if="pagePlan">
      <!-- Dependencies Section -->
      <h3 class="text-lg font-semibold mb-2">
        Dependencies
      </h3>
      <PlansDependencies />

      <!-- Progress and Time Tracking -->
      <USeparator />
      <h3 class="text-lg font-semibold mb-2">
        Progress Tracking
      </h3>
      <UProgress v-model="progress" indicator />
      <PlansTabInput
        :label="totalChildren ? 'Total projected manhours' : 'Hours estimated for task'"
        :class="{
          'text-red-500': pagePlan.manhours_required !== null && (pagePlan.manhours_required < calculatedTimeRequired),
          'italic text-slate-400': pagePlan.archived,
        }"
        field="manhours_required"
        :placeholder="calculatedTimeRequired"
        input-type="number"
        :disabled="pagePlan.archived"
      />
      <div
        v-if="children.length"
        class="m-1 flex w-full text-sm"
      >
        <span>Calculated time required for subtasks: </span>
        <span
          class="ml-auto mr-2 p-1"
        >
          {{ calculatedTimeRequired }}h
        </span>
      </div>
      <div
        v-if="children.length && pagePlan.manhours_required !== null"
        class="m-1 flex w-full text-sm"
        :class="{
          'text-red-500': pagePlan.manhours_required !== null && (pagePlan.manhours_required < calculatedTimeRequired),
        }"
      >
        <span v-if="pagePlan.manhours_required !== null && (pagePlan.manhours_required < calculatedTimeRequired)">Overtime:</span>
        <span v-else>Margin:</span>
        <span
          class="ml-auto mr-2 p-1"
        >
          {{ Math.abs((pagePlan.manhours_required ?? 0) - calculatedTimeRequired) }}h / {{ Math.abs(pagePlan.manhours_required ? ((pagePlan.manhours_required) - calculatedTimeRequired) / pagePlan.manhours_required * 100 : 0).toFixed() }}%
        </span>
      </div>
    </template>
  </PlansTab>
</template>
