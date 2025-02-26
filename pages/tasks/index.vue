<script setup lang="ts">
import { ArrangeableList, useMovingItem, type MovingItem } from 'vue-arrange'
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

function changePriority(item: MovingItem<Plan>) {
  if (!item.destination) return
  console.log('Changing priority of item:', item)
  const destinationIndex = item.destination.index ?? 0
  if (destinationIndex === item.origin.index && item.destination.identifier === item.origin.identifier) return
  // compute the new priority
  const aboveItem = (destinationIndex > 0) ? item.destination.listItems!.at(destinationIndex - 1) : undefined
  const belowItem = (destinationIndex + 1 < item.destination.listItems!.length) ? item.destination.listItems!.at(destinationIndex + 1) : undefined
  let newPriority = 0
  if (aboveItem && belowItem) {
    newPriority = ((aboveItem.priority ?? 0) + (belowItem.priority ?? 0)) / 2
  }
  else if (aboveItem) {
    newPriority = (aboveItem.priority ?? 0) + 1
  }
  else if (belowItem) {
    newPriority = (belowItem.priority ?? 0) - 1
  }
  console.log('New priority:', newPriority)
  item.payload.priority = newPriority
  plans.update(item.payload.id, { priority: newPriority })
    .then(() => console.log('Item moved successfully', plans.data.value.find(p => p.id === item.payload.id)))
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
      @drop-item="changePriority"
    >
      <div class="flex w-full flex-row">
        <!-- handle and title -->
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
            {{ item.title }} {{ item.priority }}
          </NuxtLink>
        </div>
        <!-- details -->
        <div v-if="!isMoving(item)" class="flex flex-row">
          <DSValidatedInput
            class="mb-1 mr-2  w-8 border-b border-solid border-gray-300 px-1 text-right text-sm outline-none"
            field="manhours_required"
            input-type="number"
            :plan="item"
          />
          <div class="flex w-10 justify-center">
            <UCheckbox
              v-model="item.done"
              @click="completePlan(item)"
            />
          </div>
        </div>
      </div>
    </ArrangeableList>
  </UCard>
</template>
