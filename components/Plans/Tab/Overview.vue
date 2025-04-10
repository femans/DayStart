<script setup lang=ts>
import { USeparator } from '#components'

const { pagePlan, updatePlan } = useDatabaseHelpers()

// For archive panel
const showArchived = ref(false)
</script>

<template>
  <PlansTab tab="overview">
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

      <!-- Subprojects Section -->
      <USeparator />
      <h3 class="text-lg font-semibold my-2">
        Subprojects & Tasks
      </h3>
      <PlansNewInputBox />
      <PlansList :show-archived="showArchived" />
    </template>
  </PlansTab>
</template>
