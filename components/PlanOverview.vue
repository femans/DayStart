<script lang="ts" setup>

import { Disclosure, DisclosurePanel, DisclosureButton } from '@headlessui/vue'
import type { Tables } from '~~/types/database.types'
type Plan = Tables<'plans'>;

// as a prop we pass the id of a plan
const props = defineProps<{ plan: number|null }>()

const plans = useTable('plans' );
const plansData = plans.data;
const topLevelPlans = computed(() => plans.data.value.filter(p => p.parent_id === props.plan))

const completePlan = async (p: Plan) => {
  await plans.update(p.id, { done: !p.done })
}
</script>

<template>
    <UCard v-if="plansData.length > 0" class="px-6 py-2 overflow-hidden">
      <ul>
        <li v-for="topLevelPlan of topLevelPlans" :key="topLevelPlan.id" class="border-b border-gray-200 divide-y divide-gray-200">
          <Disclosure v-slot="{open}">
            <DisclosureButton class="flex items-center justify-between w-full">
              <span
                class="flex items-center font-medium"
                :class="topLevelPlan.done ? 'line-through u-text-gray-500' : 'u-text-gray-700'">
                <UIcon
                  name="i-heroicons-plus"
                  :class="open ? 'transition-transform transform rotate-135 duration-300' : 'transition-transform transform duration-300' + 
                  ' ' + (plansData.some(p => p.parent_id === topLevelPlan.id) ? 'visible' : 'invisible')"
                  class="w-5 h-5 mr-2 gray" />
                {{ topLevelPlan.title }}
              </span>
            </DisclosureButton>
            <Transition 
              v-if="plansData.some(p => p.parent_id === topLevelPlan.id)"
              enter-active-class="transition-all ease-in-out duration-300"
              enter-from-class="max-h-0 opacity-0" 
              enter-to-class="max-h-screen opacity-100"
              leave-active-class="transition-all ease-in-out duration-300" 
              leave-from-class="max-h-screen opacity-100"
              leave-to-class="max-h-0 opacity-0"
            >
              <DisclosurePanel class="pl-14">
                <ul>
                  <li
                    v-for="subPlan of plansData.filter(p => p.parent_id === topLevelPlan.id)" :key="subPlan.id"
                    class="border-b border-gray-200 divide-y divide-gray-200">
                    <div class="flex items-center justify-between">
                      <span class="flex items-center font-medium" :class="subPlan.done ? 'line-through u-text-gray-500' : 'u-text-gray-700'">
                        {{ subPlan.title }}
                      </span>
                      <div class="flex items-center">
                        <UToggle v-model="subPlan.done" icon="i-heroicons-outline-check" @click="completePlan(subPlan)"/>
                      </div>
                    </div>
                  </li>
                </ul>
              </DisclosurePanel>
            </Transition>
          </Disclosure>
        </li>
      </ul>
    </UCard>
</template>

