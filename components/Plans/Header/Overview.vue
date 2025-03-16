<script setup lang=ts>
const plans = useTable('plans', { verbose: true, autoFetch: true })
const { pagePlanId, pagePlan } = useDatabaseHelpers()

const unfinishedChildren = computed(() =>
  plans.data.value.filter(p => p.parent_id === pagePlanId.value && !p.done && !p.archived),
)

const children = computed(() =>
  plans.data.value.filter(p => p.parent_id === pagePlanId.value && !p.archived),
)

const totalChildren = computed(() =>
  plans.data.value.filter(p => p.parent_id === pagePlanId.value && !p.archived).length,
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
</script>

<template>
  <PlansHeader tab="overview">
    <UDivider />
    <UMeter label="Progress" indicator :value=" finishedTaskTimeSpent / (calculatedTimeRequired || 1) * 100" />
    <PlansHeaderInput
      :label="totalChildren ? 'Total projected manhours' : 'Hours estimated for task'"
      :class="{
        'text-red-500': pagePlan.manhours_required !== null && (pagePlan.manhours_required < calculatedTimeRequired),
      }"
      field="manhours_required"
      :placeholder="calculatedTimeRequired"
      input-type="number"
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
    <UDivider />
    <PlansHeaderInput
      label="Budget:"
      field="budget"
      input-type="number"
    />
  </PlansHeader>
</template>
