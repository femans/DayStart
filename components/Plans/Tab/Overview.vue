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
        class="h-auto w-full overflow-hidden rounded-sm sm:rounded-md border p-1 text-sm sm:text-base"
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
        <div class="flex space-x-2 mr-2">
          <UCheckbox
            v-model="pagePlan.done"
            label="Done"
            class="rounded border border-gray-200 px-1 dark:border-gray-800 text-sm"
            @update:model-value="done => (typeof done === 'boolean') && pagePlan && updatePlan({ uuid: pagePlan.uuid, done })"
          />
          <UCheckbox
            v-model="pagePlan.archived"
            label="Archived"
            class="rounded border border-gray-200 px-1 dark:border-gray-800 text-sm"
            @update:model-value="archived => typeof archived === 'boolean' && pagePlan && updatePlan({ uuid: pagePlan.uuid, archived })"
          />
        </div>
        <!-- Documentation URL field -->
        <PlansDocumentationUrl class="flex-grow" />
      </div>

      <!-- Subprojects Section -->
      <USeparator class="my-1 sm:my-2" />
      <h3 class="text-base sm:text-lg font-semibold my-1 sm:my-2">
        Project Subdivision
      </h3>
      <PlansNewInputBox />
      <PlansList :show-archived="showArchived" />
    </template>
  </PlansTab>
</template>
