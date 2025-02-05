<script lang="ts" setup>
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { ArrangeableList, type MovingItem, useMovingItem } from 'vue-arrange'
import ValidatedPlanInput from './ValidatedInput.vue'
import type { Tables } from '~~/types/database.types'

type Plan = Tables<'plans'>

const { isMoving } = useMovingItem()

const props = defineProps<{
  planId: number | null
  showArchived: boolean
}>()
const plans = useTable('plans', { verbose: true, autoFetch: true })

function moveItem(item: MovingItem<Plan>) {
  if (!item.destination) return
  console.log('Moving item:', item)
  if (item.destination.identifier === 'trashbin') {
    if (item.payload.archived) {
      plans.remove(item.payload.id)
      return
    }
    plans.update(item.payload.id, { archived: true })
    return
  }
  if (item.destination.group === plansGroup) {
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
    plans.update(item.payload.id, { priority: newPriority, parent_id: Number(item.destination.identifier) || null })
      .then(() => console.log('Item moved successfully', plans.data.value.find(p => p.id === item.payload.id)))
  }
}

const plansList = computed(() => plans.data.value
  .filter(p => props.showArchived || !p.archived)
  .filter(p => p.parent_id === props.planId)
  .toSorted((a, b) => {
    if (a.archived !== b.archived) {
      return a.archived ? 1 : -1
    }
    if (a.done !== b.done) {
      return a.done ? 1 : -1
    }
    return (a.priority ?? 0) - (b.priority ?? 0)
  }))

const completePlan = async (p: Plan) => {
  await plans.update(p.id, { done: !p.done })
}

const finishedChildren = (itemId: number) =>
  plans.data.value.filter(p => p.parent_id === itemId && p.done && !p.archived).length
const unfinishedChildren = (itemId: number) =>
  plans.data.value.filter(p => p.parent_id === itemId && !p.done && !p.archived).length
const totalChildren = (itemId: number) =>
  plans.data.value.filter(p => p.parent_id === itemId && !p.archived).length

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

const plansGroup = 'plansGroup'
</script>

<template>
  <ArrangeableList
    v-slot="{ item }"
    :list="plansList"
    list-key="id"
    :options="{
      hoverClass: 'cursor-grabbing drop-shadow-[0_10px_10px_rgba(0,0,0,1)] scale-105 select-none',
      hoveredOverListClass: 'bg-blue-100 dark:bg-blue-800 rounded',
      defaultItemClass: 'dark:border-black',
      liftDelay: 200,
      handle: true,
    }"
    :identifier="props.planId ?? 'home'"
    :group="plansGroup"
    @drop-item="moveItem"
  >
    <Disclosure v-slot="{ open }" ref="disclosures">
      <div class="flex w-full flex-row items-center">
        <div
          class="mr-auto flex select-none items-center font-medium"
          :class="[item.done ? 'line-through' : '', item.archived ? 'text-gray-400' : 'text-gray-700']"
        >
          <UIcon name="i-heroicons-ellipsis-vertical" class="cursor-grab" data-handle />
          <DisclosureButton class="flex cursor-pointer">
            <UIcon
              :name="open ? 'i-heroicons-chevron-down-16-solid' : 'i-heroicons-chevron-right-16-solid'"
              class="self-center"
              :class="{
                'bg-gray-700': totalChildren(item.id),
                'bg-slate-300': totalChildren(item.id) === 0,
              }"
            />
          </DisclosureButton>
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
            <span
              :class="
                totalChildren(item.id) ? 'font-bold' : 'font-normal'
              "
            >
              {{ item.title }}
            </span>
            <span class="mx-1 text-xs text-slate-400">{{ item.id }}</span>
            <UBadge v-if="unfinishedChildren(item.id)" class="mr-1 rounded-full bg-red-200 text-black">
              {{ unfinishedChildren(item.id) }}
            </UBadge>
            <UBadge
              v-if="finishedChildren(item.id)"
              class="mr-1 rounded-full"
              :class="item.archived ? 'bg-gray-300' : 'bg-green-400'"
            >
              {{ finishedChildren(item.id) }}
              <UIcon v-if="!unfinishedChildren(item.id)" name="i-heroicons-check-20-solid" />
            </UBadge>
          </NuxtLink>
        </div>
        <div v-if="!isMoving(item)" class="flex flex-row items-center">
          <ValidatedPlanInput
            class="mb-1 mr-2 w-8 border-b border-solid border-gray-300 px-1 text-right text-sm outline-none"
            field="manhours_required"
            input-type="number"
            :plan="item"
          />
          <div class="flex w-10 self-center">
            <UToggle
              v-model="item.done"
              :on-icon="
                unfinishedChildren(item.id)
                  ? 'i-heroicons-hand-raised-solid'
                  : 'i-heroicons-check-20-solid'
              "
              :off-icon="!unfinishedChildren(item.id) && finishedChildren(item.id) ? 'i-heroicons-check-20-solid' : ''"
              :color="unfinishedChildren(item.id) && item.done ? 'red' : 'primary'"
              :class="{
                'bg-gray-200 dark:bg-gray-700': !item.done,
                'bg-gray-400 dark:bg-gray-500': item.done && item.archived,
              }"
              @click="completePlan(item)"
            />
          </div>
        </div>
      </div>
      <DisclosurePanel class="w-full">
        <PlansNestedList
          :plan-id="item.id"
          class="ml-6 min-h-3 rounded-bl border-b border-l pl-1 dark:border-gray-700"
          :show-archived="showArchived"
        />
      </DisclosurePanel>
    </Disclosure>
  </ArrangeableList>
</template>
