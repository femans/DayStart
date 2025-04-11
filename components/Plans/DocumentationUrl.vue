<script lang="ts" setup>
const { pagePlan } = useDatabaseHelpers()
const isFocused = ref(false)

// Format URL for opening (add protocol if missing)
const formattedUrl = computed(() => {
  if (!pagePlan.value?.documentation_url) return ''
  const url = pagePlan.value.documentation_url.trim()
  return url.startsWith('http') ? url : `https://${url}`
})

// Check if URL is valid
const isValidUrl = computed(() => {
  if (!pagePlan.value?.documentation_url) return false
  const trimmedValue = pagePlan.value.documentation_url.trim()
  return /^[\w.-]+\.[a-zA-Z]{2,}(\S*)?$/.test(trimmedValue) || /^https?:\/\//.test(trimmedValue)
})

// Open URL in new tab
const openUrl = () => {
  if (pagePlan.value?.documentation_url && isValidUrl.value) {
    window.open(formattedUrl.value, '_blank')
  }
}
</script>

<template>
  <div v-if="pagePlan" class="flex items-center" :class="{ 'w-full': isFocused, 'w-auto': !isFocused }">
    <!-- Documentation URL icon -->
    <UIcon
      name="i-heroicons-link"
      class="text-gray-500 mr-1 flex-shrink-0"
      size="xs"
    />

    <div class="relative" :class="{ 'flex-grow': isFocused, 'w-40 sm:w-64': !isFocused }">
      <DSValidatedInput
        :plan="pagePlan"
        field="documentation_url"
        input-type="url"
        :class="{
          'italic text-slate-400': pagePlan.archived,
          'pr-6': pagePlan.documentation_url && isValidUrl && !isFocused, // Add padding for the button
          'truncate': !isFocused,
        }"
        :disabled="pagePlan.archived"
        placeholder="Documentation URL"
        class="w-full rounded-md border border-gray-200 p-0.5 text-xs dark:border-gray-800"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

      <!-- Open URL button (positioned absolutely inside the input) -->
      <UButton
        v-if="pagePlan.documentation_url && isValidUrl && !isFocused"
        icon="i-heroicons-arrow-top-right-on-square"
        variant="ghost"
        size="xs"
        class="absolute right-0.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-0"
        @click="openUrl"
      />
    </div>
  </div>
</template>
