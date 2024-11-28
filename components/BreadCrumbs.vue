<script lang="ts" setup>
const props = defineProps<{ plan: number | null }>()

const plans = useTable('plans', { verbose: true, autoFetch: true, autoSubscribe: true })
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
  <div class="flex gap-2">
    <NuxtLink
      :to="{ name: 'plans-id', params: { id: null } }"
    >
      🏡
      <template v-if="trail.length > 3">
        ...⭢
      </template>
    </NuxtLink>
    <template
      v-for="(plan, i) in trail.slice(-3)"
      :key="i"
    >
      <NuxtLink
        :to="{ name: 'plans-id', params: { id: plan.id } }"
      >
        {{ plan.title }}
      </NuxtLink>
      <span v-if="i < trail.length - 1">⭢</span>
    </template>
    <NuxtLink
      v-if="trail.length > 0"
      :to="{ name: 'plans-id', params: { id: trail.at(-1)?.parent_id } }"
    >
      ⮌
    </NuxtLink>
  </div>
</template>
