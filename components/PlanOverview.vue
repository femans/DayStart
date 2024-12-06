<script lang="ts" setup>
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { ArrangeableList, type MovingItem, useMovingItem } from 'vue-arrange'
import type { Tables } from '~~/types/database.types'

const { isMoving } = useMovingItem()

type Plan = Tables<'plans'>

const props = defineProps<{ planId: number | null }>()
const plans = useTable('plans', { verbose: true, autoFetch: true })

function moveItem(item: MovingItem<Plan>) {
  console.log('Moving item:', item)
  if (!item.destination) return
  if (item.destination.identifier === 'trashbin') {
    plans.update(item.payload.id, { archived: true })
    return
  }
  if (item.destination.identifier === thisList) {
    const destinationIndex = item.destination.index ?? -1
    const aboveItem = (destinationIndex > 0) ? item.destination.listItems!.at(destinationIndex - 1) : undefined
    const belowItem = (destinationIndex + 1 < item.destination.listItems!.length) ? item.destination.listItems!.at(destinationIndex + 1) : undefined
    console.log('Above item:', aboveItem?.priority, aboveItem, 'Below item:', belowItem?.priority, belowItem, item.destination.index, item.destination.listItems)
    let newPriority
    if (aboveItem && belowItem) {
      newPriority = ((aboveItem.priority ?? 0) + (belowItem.priority ?? 0)) / 2
    }
    else if (aboveItem) {
      newPriority = (aboveItem.priority ?? 0) + 1
    }
    else if (belowItem) {
      newPriority = (belowItem.priority ?? 0) - 1
    }
    else {
      newPriority = 0
    }
    console.log('New priority:', newPriority)
    item.payload.priority = newPriority
    plans.update(item.payload.id, { priority: newPriority })
    return
  }
  if (item.destination.group === 'plansGroup') {
    const destinationPlan = plans.data.value.find(p => p.id === item.destination!.identifier)
    if (!destinationPlan) return
    item.payload.parent_id = destinationPlan.id
    plans.update(item.payload.id, { parent_id: destinationPlan.id })
  }
}

const plansList = computed(() =>
  plans.data.value
    .filter(p => !p.archived)
    .filter(p => p.parent_id === props.planId)
    .toSorted((a, b) => {
      if (a.done === b.done) {
        return (a.priority ?? 0) - (b.priority ?? 0)
      }
      return a.done ? 1 : -1
    }),
)

const completePlan = async (p: Plan) => {
  await plans.update(p.id, { done: !p.done })
}

const finishedChildren = (itemId: number) =>
  plans.data.value.filter(p => p.parent_id === itemId && p.done).length
const unfinishedChildren = (itemId: number) =>
  plans.data.value.filter(p => p.parent_id === itemId && !p.done).length
</script>

<template>
  <ArrangeableList
    v-if="plansList.length > 0"
    :list="plansList"
    list-key="id"
    :options="{
      hoverClass:
        'cursor-grabbing drop-shadow-[0_10px_10px_rgba(0,0,0,1)] scale-105 select-none',
      defaultItemClass: 'border-b dark:border-black',
      liftDelay: 200,
      handle: true,
    }"
    :identifier="props.planId ?? 'home'"
    group="plansGroup"
    @drop-item="moveItem"
  >
    <template #default="{ item }">
      <Disclosure v-slot="{ open }" ref="disclosures">
        <div class="flex w-full flex-row">
          <div
            class="mr-auto flex select-none items-center font-medium"
            :class="item.done ? 'line-through u-text-gray-500' : 'u-text-gray-700'"
          >
            <UIcon name="i-heroicons-ellipsis-vertical" class="cursor-grab" data-handle />
            <DisclosureButton class="flex cursor-pointer">
              <UIcon
                :name="open ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-right-16-solid'"
                class="self-center"
              />
            </DisclosureButton>
            <NuxtLink :to="{ name: 'plans-id', params: { id: item.id } }">
              {{ item.title }}<span class="mx-1 text-xs text-slate-400">{{ item.id }}</span>
              <UBadge
                v-if="unfinishedChildren(item.id)"
                class="rounded-full bg-red-200 text-black"
              >
                {{ unfinishedChildren(item.id) }}
              </UBadge>
              <UBadge
                v-if="finishedChildren(item.id) && !unfinishedChildren(item.id)"
                class="rounded-full bg-green-400"
              >
                <UIcon name="i-heroicons-check-20-solid" />
              </UBadge>
            </NuxtLink>
          </div>
          <div v-if="!isMoving(item)" class="flex items-center">
            <UToggle
              v-model="item.done"
              :color="unfinishedChildren(item.id) ? 'red' : 'violet'"
              :on-icon="
                unfinishedChildren(item.id)
                  ? 'i-heroicons-hand-raised-solid'
                  : 'i-heroicons-check-20-solid'
              "
              @click="completePlan(item)"
            />
          </div>
        </div>
        <DisclosurePanel class="w-full pl-4">
          <PlanOverview :plan-id="item.id" />
        </DisclosurePanel>
      </Disclosure>
    </template>
  </ArrangeableList>
</template>
