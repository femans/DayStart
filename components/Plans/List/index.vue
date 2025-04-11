<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const { pagePlan } = useDatabaseHelpers()
const { totalChildren } = usePlanList()

// Define column widths
const isMobile = ref(false)

// Check screen size on client side only
onMounted(() => {
  isMobile.value = window.innerWidth < 640
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 640
  })
})

// Use responsive column widths based on screen size
const columns = computed(() => [
  {
    width: 64,
    title: 'Budget',
  },
  {
    width: 64,
    title: 'Hours',
  },
  {
    width: 48,
    title: 'Done?',
  },
])

defineProps<{
  showArchived: boolean
}>()
</script>

<template>
  <template v-if="totalChildren(pagePlan?.uuid || null)">
    <PlansListHeader :columns="columns" />
    <PlansListContents :plan-uuid="pagePlan?.uuid || null" :show-archived="showArchived" :columns="columns" />
  </template>
</template>
