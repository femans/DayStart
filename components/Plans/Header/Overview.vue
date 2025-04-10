<script setup lang=ts>
import { USeparator } from '#components'

const plans = useTable('plans', { verbose: true, autoFetch: true })
const { pagePlan, updatePlan } = useDatabaseHelpers()

// For archive panel
const showArchived = ref(false)

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
  <PlansHeader tab="overview">
    <!-- For home page, only show the projects list without any headers or sections -->
    <template v-if="!pagePlan">
      <PlansNewInputBox />
      <PlansList :show-archived="showArchived" />
    </template>

    <!-- For project pages, show all sections -->
    <template v-else>
      <!-- Definition of Done and Project Status -->
      <textarea
        ref="dodArea"
        v-model="pagePlan.definition_of_done"
        :disabled="pagePlan.archived"
        name="dod"
        class="h-auto w-full overflow-hidden rounded-md border p-1"
        placeholder="Criteria to meet before marking this as &lsquo;done&rsquo;."
        :class="{
          'italic text-slate-400': pagePlan.archived,
          'text-slate-900 dark:text-slate-100': !pagePlan.archived,
        }"
        rows="3"
        oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'"
        @change="updatePlan({ uuid: pagePlan.uuid, definition_of_done: ($event.target as HTMLTextAreaElement).value })"
        @keydown.enter="(event) => (event.target as HTMLInputElement).blur()"
      />
      <div class="flex flex-row mb-1 items-center">
        <!-- Documentation URL field -->
        <PlansDocumentationUrl class="flex-grow" />

        <UCheckbox
          v-model="pagePlan.done"
          label="Done"
          class="ml-2 rounded border border-gray-200 px-1 dark:border-gray-800"
          @update:model-value="done => (typeof done === 'boolean') && pagePlan && updatePlan({ uuid: pagePlan.uuid, done })"
        />
        <UCheckbox
          v-model="pagePlan.archived"
          label="Archived"
          class="ml-1 rounded border border-gray-200 px-1 dark:border-gray-800"
          @update:model-value="archived => typeof archived === 'boolean' && pagePlan && updatePlan({ uuid: pagePlan.uuid, archived })"
        />
      </div>

      <!-- Dependencies Section -->
      <USeparator />
      <h3 class="text-lg font-semibold mb-2">
        Dependencies
      </h3>
      <PlansDependencies />

      <!-- Progress and Time Tracking -->
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

      <!-- Budget Section -->
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

      <!-- Subprojects Section -->
      <USeparator />
      <h3 class="text-lg font-semibold my-2">
        Subprojects & Tasks
      </h3>
      <PlansNewInputBox />
      <PlansList :show-archived="showArchived" />
    </template>
  </PlansHeader>
</template>
