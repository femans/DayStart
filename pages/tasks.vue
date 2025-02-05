<script setup lang="ts">
import { ArrangeableList, useMovingItem } from 'vue-arrange'
import useDatabaseHelpers from '../composables/useDatabaseHelpers'
import type { Tables } from '~~/types/database.types'

type Plan = Tables<'plans'>
const { isMoving } = useMovingItem()
const { taskList } = useDatabaseHelpers()

const plans = useTable('plans', { verbose: true, autoFetch: true })

const completePlan = async (p: Plan) => {
  await plans.update(p.id, { done: !p.done })
}

const markArchiveRestore = ref<number | null>(null)
const archiveRestore = (id: number) => {
  if (markArchiveRestore.value === id) {
    plans.update(id, { archived: false })
    markArchiveRestore.value = null
  }
  else {
    markArchiveRestore.value = id
  }
}

const showArchived = ref(false)
const showDone = ref(false)
const tasks = computed(() =>
  taskList.value.filter(item => item.done === showDone.value).filter(item => !item.archived || showArchived.value),
)
</script>

<template>
  <UCard class="my-2 w-full overflow-hidden px-6 py-2">
    <div class="flex w-full flex-row items-center gap-2">
      <h1 class="flex w-full flex-row items-center gap-2 text-3xl font-bold">
        <UIcon name="i-heroicons-clipboard-document-list" />
        Task list
      </h1>
      <UButton
        @click="showDone =!showDone"
      >
        {{ showDone ? 'show to do' : 'show done' }}
      </UButton>
    </div>
    <div class="flex w-full select-none flex-row border-b dark:border-black">
      <div class="mr-auto flex items-center">
        Tasks: {{ tasks.length }}
      </div>
      <div class="flex w-10 justify-center p-1 text-xs">
        Hrs
      </div>
      <div class="flex w-10 justify-center p-1 text-xs">
        Done?
      </div>
    </div>
    <ArrangeableList
      v-slot="{ item }"
      list-key="id"
      :list="tasks"
      :options="{ handle: true }"
    >
      <div class="flex w-full flex-row">
        <div
          class="mr-auto flex select-none items-center font-medium"
          :class="[item.done ? 'line-through' : '', item.archived ? 'text-gray-400' : 'text-gray-700']"
        >
          <UIcon name="i-heroicons-ellipsis-vertical" class="cursor-grab" data-handle />
          <UTooltip v-if="item.archived" text="Click 2x to restore from archive">
            <UIcon
              :name="markArchiveRestore === item.id ? 'i-heroicons-archive-box-x-mark': 'i-heroicons-archive-box'"
              class="mr-1 hover:bg-purple-500"
              :class="markArchiveRestore === item.id ? 'bg-purple-500' : ''"
              @click="archiveRestore(item.id)"
            />
          </UTooltip>
          <NuxtLink
            :to="{ name: 'projects-id', params: { id: item.id } }"
            :class="{
              'italic text-slate-400 dark:text-slate-600': item.archived,
              'text-slate-700 dark:text-slate-200': !item.archived,
            }"
          >
            {{ item.title }}
          </NuxtLink>
        </div>
        <div v-if="!isMoving(item)" class="flex flex-row">
          <PlansValidatedInput
            class="mb-1 mr-2  w-8 border-b border-solid border-gray-300 px-1 text-right text-sm outline-none"
            field="manhours_required"
            input-type="number"
            :plan="item"
          />
          <div class="w-10">
            <UToggle
              v-model="item.done"
              on-icon="i-heroicons-check-20-solid"
              :class="{
                'bg-gray-200 dark:bg-gray-700': !item.done,
                'bg-gray-400 dark:bg-gray-500': item.done && item.archived,
              }"
              @click="completePlan(item)"
            />
          </div>
        </div>
      </div>
    </ArrangeableList>
  </UCard>
</template>
