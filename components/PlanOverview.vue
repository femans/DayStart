<script lang="ts" setup>
import { ArrangeableList, type MovingItem } from 'vue-arrange'
import type { Tables } from '~~/types/database.types'

type Plan = Tables<'plans'>

function moveItem(item: MovingItem<Plan>) {
  console.log('Moving item:', item)
  if (!item.destination) return
  if (item.destination.identifier === 'trashbin') {
    plans.update(item.payload.id, { archived: true })
  }
}

const props = defineProps<{ plan: number | null }>()

const plans = useTable('plans', { verbose: true, autoFetch: true, autoSubscribe: true })
const plansList = computed(() => plans.data.value
  .filter(p => !p.archived)
  .filter(p => p.parent_id === props.plan)
  .toSorted((a, b) => (new Date(a.created_at)).getTime() - (new Date(b.created_at)).getTime()))

const completePlan = async (p: Plan) => {
  await plans.update(p.id, { done: !p.done })
}
</script>

<template>
  <ArrangeableList
    v-if="plansList.length > 0"
    tag="tbody"
    list-item-tag="tr"
    :list="plansList"
    :options="{
      hoverClass: 'flex flex-row cursor-grabbing drop-shadow-[0_10px_10px_rgba(0,0,0,1)] scale-105 select-none',
      defaultItemClass: 'flex-row flex border-b divide-y divide-gray-200',
      liftDelay: 200,
    }"
    group="plansGroup"
    @drop-item="moveItem"
  >
    <template #default="{ item }">
      <td
        class="flex items-center mr-auto font-medium select-none"
        :class="item.done ? 'line-through u-text-gray-500' : 'u-text-gray-700'"
      >
        {{ item.title }}
      </td>
      <td class="flex items-center">
        <UToggle
          v-model="item.done"
          color="violet"
          on-icon="i-heroicons-check-20-solid"
          @click="completePlan(item)"
        />
      </td>
    </template>
  </ArrangeableList>
</template>
