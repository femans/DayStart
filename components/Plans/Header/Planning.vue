<script lang="ts" setup>
const plans = useTable('plans', { verbose: true, autoFetch: true })

const menuList = computed(() => plans.data.value
  .filter(plan => (!plan.archived && !plan.done))
  .map(({ id, title }) => ({ label: `${id} ${title}`, id })),
)
const dependencies = ref<{ label: string, id: number }[]>([])
</script>

<template>
  <PlansHeader>
    <UInputMenu
      v-model="dependencies"
      class="w-full dark:border-green-400"
      size="xl"
      variant="outline"
      multiple
      :items="menuList"
    />
    {{ dependencies }}
  </PlansHeader>
</template>
