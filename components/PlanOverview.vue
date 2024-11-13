<script lang="ts" setup>
import { ArrangeableList } from 'vue-arrange'
import { Disclosure, DisclosurePanel, DisclosureButton } from '@headlessui/vue'
import type { Tables } from '~~/types/database.types'

type Plan = Tables<'plans'>

// as a prop we pass the id of a plan
const props = defineProps<{ plan: number | null }>()

const plans = useTable('plans')
const plansData = plans.data
plansData.value.sort((a, b) => (new Date(a.created_at)).getTime() - (new Date(b.created_at)).getTime())
const topLevelPlans = computed(() => plans.data.value.filter(p => p.parent_id === props.plan))

const completePlan = async (p: Plan) => {
  await plans.update(p.id, { done: !p.done })
}
</script>

<template>
  <UCard
    v-if="plansData.length > 0"
    class="px-6 py-2 overflow-hidden w-full"
  >
    <ArrangeableList
      :list="topLevelPlans"
      :options="{
        hoverClass: 'cursor-grabbing drop-shadow-[0_10px_10px_rgba(0,0,0,1)] scale-105',
        handle: true,
      }"
    >
      <template #default="{ item }">
        <div class="border-b divide-y divide-gray-200">
          <Disclosure v-slot="{ open }">
            <div class="flex items-center w-full">
              <div
                name="handle"
                class="mr-2 cursor-grab"
              >
                &#65049;
              </div>
              <DisclosureButton :class="(plansData.some(p => p.parent_id === item.id) ? 'visible' : 'invisible')">
                <UIcon
                  name="i-heroicons-outline-chevron-right"
                  :class="open ? 'rotate-90' : ''"
                  class="w-5 h-5 mr-2 gray items-center flex transition-transform transform duration-300"
                />
              </DisclosureButton>
              <span
                class="flex items-center font-medium"
                :class="item.done ? 'line-through u-text-gray-500' : 'u-text-gray-700'"
              >
                {{ item.title }}
              </span>
            </div>
            <Transition
              v-if="plansData.some(p => p.parent_id === item.id)"
              enter-active-class="transition-all ease-in-out duration-300"
              enter-from-class="max-h-0 opacity-0"
              enter-to-class="max-h-screen opacity-100"
              leave-active-class="transition-all ease-in-out duration-300"
              leave-from-class="max-h-screen opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <DisclosurePanel class="pl-14">
                <ArrangeableList
                  v-slot="{ item: subPlan }"
                  :list="plansData.filter(p => p.parent_id === item.id)"
                  :options="{
                    hoverClass: 'cursor-grabbing drop-shadow-[0_10px_10px_rgba(0,0,0,1)] scale-105',
                    handle: true,
                  }"
                >
                  <div class="flex items-center justify-between">
                    <span
                      class="flex items-center font-medium"
                      :class="subPlan.done ? 'line-through u-text-gray-500' : 'u-text-gray-700'"
                    >
                      {{ subPlan.title }}
                    </span>
                    <div class="flex items-center">
                      <UToggle
                        v-model="subPlan.done"
                        icon="i-heroicons-outline-check"
                        @click="completePlan(subPlan)"
                      />
                    </div>
                  </div>
                </ArrangeableList>
              </DisclosurePanel>
            </Transition>
          </Disclosure>
        </div>
      </template>
    </ArrangeableList>
  </UCard>
</template>
