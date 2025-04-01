<script setup lang=ts>
import { USeparator } from '#components'

const plans = useTable('plans', { verbose: true, autoFetch: true })
const { pagePlanId, pagePlan, updatePagePlan } = useDatabaseHelpers()

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

const progress = computed(() => finishedTaskTimeSpent.value / (calculatedTimeRequired.value || 1) * 100)
</script>

<template>
  <PlansHeader tab="overview">
    <textarea
      v-if="pagePlanId !== null"
      ref="dodArea"
      v-model="pagePlan.definition_of_done"
      :disabled="pagePlan.archived"
      name="dod"
      class="h-auto w-full overflow-hidden rounded-md border p-1"
      placeholder="Short description of done:&#10;Criteria to meet before checking off this project/task."
      :class="{
        'italic text-slate-400': pagePlan.archived,
        'text-slate-900 dark:text-slate-100': !pagePlan.archived,
      }"
      rows="3"
      oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'"
      @change="updatePagePlan({ definition_of_done: ($event.target as HTMLTextAreaElement).value })"
      @keydown.enter="(event) => (event.target as HTMLInputElement).blur()"
    />
    <div class="flex flex-row mb-1">
      <UCheckbox
        v-model="pagePlan.done"
        label="Done"
        class="ml-auto rounded border border-gray-200 px-1 dark:border-gray-800"
        @update:model-value="done => typeof done === 'boolean' && updatePagePlan({ done })"
      />
      <UCheckbox
        v-model="pagePlan.archived"
        label="Archived"
        class="ml-1 rounded border border-gray-200 px-1 dark:border-gray-800"
        @update:model-value="archived => typeof archived === 'boolean' && updatePagePlan({ archived })"
      />
    </div>
    <USeparator />
    <UProgress v-model="progress" indicator />
    <PlansHeaderInput
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
    <USeparator />
    <PlansHeaderInput
      label="Budget:"
      field="budget"
      input-type="number"
      :class="{
        'italic text-slate-400': pagePlan.archived,
      }"
      :disabled="pagePlan.archived"
    />
  </PlansHeader>
</template>
