<script lang="ts" setup>
const { pagePlan } = useDatabaseHelpers()
</script>

<template>
  <PlansHeader>
    <!-- Budget Section -->
    <PlansHeaderInput
      v-if="pagePlan"
      label="Budget:"
      field="budget"
      input-type="number"
      :class="{
        'italic text-slate-400': pagePlan.archived,
      }"
      :disabled="pagePlan.archived"
    />
  </PlansHeader>
</template>
