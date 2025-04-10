<script lang="ts" setup>
import type { Tables } from '~~/types/database.types'

type Plan = Tables<'plans'>

const props = defineProps<{
  breadcrumbs: Plan[]
}>()

const route = useRoute()
const currentTab = computed(() => route.params.tab || 'overview')

// Determine if we should show the ellipsis
const showEllipsis = computed(() => {
  return props.breadcrumbs.length > 3
})

// Get the first breadcrumb
const firstBreadcrumb = computed(() => {
  return props.breadcrumbs.length > 0 ? props.breadcrumbs[0] : null
})

// Get the last breadcrumb
const lastBreadcrumb = computed(() => {
  return props.breadcrumbs.length > 0 ? props.breadcrumbs[props.breadcrumbs.length - 1] : null
})

// Get all breadcrumbs if there are 3 or fewer
const allBreadcrumbs = computed(() => {
  return props.breadcrumbs.length <= 3 ? props.breadcrumbs : []
})
</script>

<template>
  <div class="flex flex-row items-center text-slate-400 overflow-hidden">
    <!-- Show all breadcrumbs if there are 3 or fewer -->
    <template v-if="!showEllipsis">
      <template v-for="(crumb, i) in allBreadcrumbs" :key="i">
        <NuxtLink
          :to="{ name: 'projects-id-tab', params: { id: crumb.id, tab: currentTab } }"
          class="truncate max-w-40"
        >
          {{ crumb.title }}
        </NuxtLink>
        <UIcon
          v-if="i < allBreadcrumbs.length - 1"
          name="i-heroicons-arrow-right-16-solid"
          class="mx-1"
        />
      </template>
    </template>

    <!-- Show first, ellipsis, last if there are more than 3 -->
    <template v-else>
      <!-- First breadcrumb -->
      <NuxtLink
        v-if="firstBreadcrumb"
        :to="{ name: 'projects-id-tab', params: { id: firstBreadcrumb.id, tab: currentTab } }"
        class="truncate max-w-40"
      >
        {{ firstBreadcrumb.title }}
      </NuxtLink>
      <UIcon
        v-if="firstBreadcrumb"
        name="i-heroicons-arrow-right-16-solid"
        class="mx-1"
      />

      <!-- Ellipsis -->
      <span class="mx-1">...</span>
      <UIcon
        name="i-heroicons-arrow-right-16-solid"
        class="mx-1"
      />

      <!-- Last breadcrumb -->
      <NuxtLink
        v-if="lastBreadcrumb"
        :to="{ name: 'projects-id-tab', params: { id: lastBreadcrumb.id, tab: currentTab } }"
        class="truncate max-w-40"
      >
        {{ lastBreadcrumb.title }}
      </NuxtLink>
    </template>
  </div>
</template>
