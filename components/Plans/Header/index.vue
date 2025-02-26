<script lang="ts" setup>
import { UCheckbox } from '#components'

const route = useRoute()
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

const titleArea = ref<HTMLElement | null>(null)

watch(() => route.params, async () => {
  await nextTick()
  if (titleArea.value) {
    titleArea.value.style.height = ''
    titleArea.value.style.height = `${titleArea.value.scrollHeight}px`
  }
})
</script>

<template>
  <!-- Title -->
  <textarea
    v-if="pagePlanId !== null"
    ref="titleArea"
    v-model="pagePlan.title"
    name="title"
    class="h-auto w-full overflow-hidden text-3xl font-bold"
    :class="{
      'italic text-slate-400': pagePlan.archived,
      'text-slate-900 dark:text-slate-100': !pagePlan.archived,
    }"
    rows="1"
    oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'"
    @change="updatePagePlan({ title: ($event.target as HTMLTextAreaElement).value })"
    @keydown.enter="(event) => (event.target as HTMLInputElement).blur()"
  />
  <h1 v-else class="flex flex-row items-center gap-2 text-3xl font-bold">
    <UIcon name="i-heroicons-home" />
    Home
  </h1>
  <!-- plan number and checkboxes -->
  <div v-if="pagePlanId !== null" class="mb-1 flex w-full flex-row items-center">
    <UIcon v-if="pagePlan?.archived" name="i-heroicons-archive-box" class="mr-2 size-5 text-slate-400" />
    <span v-if="pagePlan" class="mr-auto text-sm text-slate-400">
      {{ pagePlan.archived ? `${pagePlan.id} ARCHIVED` : pagePlan.id }}
    </span>
    <UCheckbox
      v-model="pagePlan.done"
      label="Done"
      class="mx-1 rounded border px-1"
      @change="done => updatePagePlan({ done })"
    />
    <UCheckbox
      v-model="pagePlan.archived"
      label="Archived"
      class="mx-1 rounded border px-1"
      @change="archived => updatePagePlan({ archived })"
    />
  </div>
  <!-- overview panel -->
  <UCard v-if="pagePlanId">
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
  </UCard>
</template>
