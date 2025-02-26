<script setup lang="ts">
useHead({
  bodyAttrs: {
    class: '',
  },
})

const { subscribe } = useDataBase({
  verbose: true,
})

subscribe()
</script>

<template>
  <Title>DayStart.IO</Title>
  <AppHeader />
  <NuxtPage
    class="mx-auto flex min-w-min max-w-4xl items-center justify-center sm:px-6 lg:px-8"
    page-key="nuxt-page"
  />
</template>
