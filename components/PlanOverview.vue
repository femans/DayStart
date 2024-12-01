<script lang="ts" setup>
import { ArrangeableList, type MovingItem, useMovingItem } from 'vue-arrange'
import type { Tables } from '~~/types/database.types'

const { isMoving } = useMovingItem()

type Plan = Tables<'plans'>

function moveItem(item: MovingItem<Plan>) {
  console.log('Moving item:', item)
  if (!item.destination) return
  if (item.destination.identifier === 'trashbin') {
    plans.update(item.payload.id, { archived: true })
    return
  }
  if (item.destination.identifier === thisList) {
    item.destination.listItems?.forEach((listItem, index) => {
      listItem.priority = index
      plans.update(listItem.id, { priority: index })
    })
    return
  }
}

const props = defineProps<{ planId: number | null }>()

const plans = useTable('plans', { verbose: true, autoFetch: true })
const plansList = computed(() => plans.data.value
  .filter(p => !p.archived)
  .filter(p => p.parent_id === props.planId)
  .toSorted((a, b) => (a.priority ?? 0) - (b.priority ?? 0)))

const completePlan = async (p: Plan) => {
  await plans.update(p.id, { done: !p.done })
}

const finishedChildren = (itemId: number) => plans.data.value.filter(p => p.parent_id === itemId && p.done).length
const unfinishedChildren = (itemId: number) => plans.data.value.filter(p => p.parent_id === itemId && !p.done).length
const thisList = Symbol()
</script>

<template>
  <ArrangeableList
    v-if="plansList.length > 0"
    tag="tbody"
    list-item-tag="tr"
    :list="plansList"
    list-key="id"
    :options="{
      hoverClass: 'flex flex-row cursor-grabbing drop-shadow-[0_10px_10px_rgba(0,0,0,1)] scale-105 select-none',
      defaultItemClass: 'flex-row flex border-b dark:border-black',
      liftDelay: 200,
      handle: true,
    }"
    :identifier="thisList"
    group="plansGroup"
    @drop-item="moveItem"
  >
    <template #default="{ item }">
      <td
        class="flex items-center mr-auto font-medium select-none"
        :class="item.done ? 'line-through u-text-gray-500' : 'u-text-gray-700'"
      >
        <span
          name="handle"
          class="mx-2 cursor-grab"
        >
          ⋮
        </span>
        <NuxtLink
          :to="{ name: 'plans-id', params: { id: item.id } }"
        >
          {{ item.title }}
          <UBadge
            v-if="unfinishedChildren(item.id)"
            class="bg-red-200 rounded-full text-black"
          >
            {{ unfinishedChildren(item.id) }}
          </UBadge>
          <UBadge
            v-if="finishedChildren(item.id) && !unfinishedChildren(item.id)"
            class="bg-green-400 rounded-full"
          >
            <UIcon name="i-heroicons-check-20-solid" />
          </UBadge>
        </NuxtLink>
      </td>
      <td
        v-if="!isMoving(item)"
        class="flex items-center"
      >
        <UToggle
          v-model="item.done"
          :color="unfinishedChildren(item.id) ? 'red' : 'violet'"
          :on-icon="unfinishedChildren(item.id) ? 'i-heroicons-hand-raised-solid' : 'i-heroicons-check-20-solid'"
          @click="completePlan(item)"
        />
      </td>
    </template>
  </ArrangeableList>
</template>
