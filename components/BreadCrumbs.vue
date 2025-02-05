<script lang="ts" setup>
const props = defineProps<{ plan: number | null }>()

const plans = useTable('plans', { verbose: true, autoFetch: true })
const trail = computed(() => {
  const trail = []
  let current = props.plan
  while (current) {
    const plan = plans.data.value.find(p => p.id === current)
    if (!plan) break
    trail.unshift(plan)
    current = plan.parent_id
  }
  return trail
})
</script>

<template>
  <div class="flex items-center gap-2">
    <NuxtLink :to="{ name: 'projects-id', params: { id: null } }" class="flex items-center text-2xl">
      <UIcon name="i-heroicons-home" />
    </NuxtLink>
    <template v-if="trail.length > 3">
      <UIcon name="i-heroicons-arrow-right-16-solid" />
      ...
    </template>
    <UIcon v-if="trail.length > 0" name="i-heroicons-arrow-right-16-solid" />
    <template v-for="(trailPlan, i) in trail.slice(-3)" :key="i">
      <NuxtLink :to="{ name: 'projects-id', params: { id: trailPlan.id } }">
        {{ trailPlan.title }}
      </NuxtLink>
      <UIcon
        v-if="i < Math.min(trail.length - 1, 2)"
        name="i-heroicons-arrow-right-16-solid"
      />
    </template>
    <NuxtLink
      v-if="trail.length > 0"
      class="flex items-center"
      :to="{ name: 'projects-id', params: { id: trail.at(-1)?.parent_id } }"
    >
      <UIcon
        name="i-heroicons-arrow-uturn-left-16-solid"
      />
    </NuxtLink>
  </div>
</template>
