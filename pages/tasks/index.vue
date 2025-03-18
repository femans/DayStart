<script setup lang="ts">
import { ArrangeableList, useMovingItem, type MovingItem } from 'vue-arrange'
import type { Tables } from '~~/types/database.types'

type Plan = Tables<'plans'>
const { isMoving } = useMovingItem()
const { taskList, calculateMovedItemPriority } = useDatabaseHelpers()
const { getTrail } = useBreadCrumbs()

const plans = useTable('plans', { verbose: true, autoFetch: true })
const { placeholder } = usePlanList()

const checkDone = async (p: Plan) => {
  recentlyChecked.value.add(p.id)
  await plans.update(p.id, { done: !p.done })
    .then(() => setTimeout(() => recentlyChecked.value.delete(p.id), 10000))
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
  const destinationIndex = item.destination.index ?? -1
  if (destinationIndex === item.origin.index && item.destination.identifier === item.origin.identifier) return
  const newPriority = calculateMovedItemPriority(item.destination.listItems!, destinationIndex)
  item.payload.priority = newPriority
  plans.update(item.payload.id, { priority: newPriority })
    .then(() => {
      console.log('Item priority updated successfully', plans.data.value.find(p => p.id === item.payload.id),
      )
    })
}

const showArchived = ref(false)
const showDone = ref(false)

const recentlyChecked = ref(new Set<number>())

const tasks = computed(() => {
  return taskList.value
    .filter(item => item.done === showDone.value || recentlyChecked.value.has(item.id))
    .filter(item => !item.archived || showArchived.value)
})
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
      :list="tasks"
      :options="{
        listTransition: {},
        handle: true,
        hoverClass: 'bg-lime-200',
      }"
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
          <div
            v-for="breadcrumb, i in [0, -3, -2].map(n => getTrail(item.id).at(n)).filter((p, i, a) => !!p && p !== a.at(i - 1))"
            :key="i"
            class="flex flex-row items-center text-slate-400"
          >
            <NuxtLink
              :to="{ name: 'projects-id', params: { id: breadcrumb!.id } }"
            >
              {{ breadcrumb!.title }}
            </NuxtLink>
            <UIcon
              name="i-heroicons-chevron-right-16-solid"
            />
          </div>
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
        <!-- details -->
        <div v-if="!isMoving(item)" class="flex flex-row">
          <DSValidatedInput
            class="mb-1 mr-2  w-8 border-b border-solid border-gray-300 px-1 text-right text-sm outline-none"
            field="manhours_required"
            input-type="number"
            :plan="item"
            :placeholder="placeholder(item)"
          />
          <div class="flex w-10 justify-center">
            <UCheckbox
              v-model="item.done"
              @click="checkDone(item)"
            />
          </div>
        </div>
      </div>
    </ArrangeableList>
  </UCard>
</template>
