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
  <UApp>
    <Title>DayStart.IO (Pre-Alpha)</Title>
    <AppHeader />
    <NuxtPage
      class="mx-auto flex w-full max-w-4xl flex-col items-center justify-center px-0 sm:px-6 lg:px-8"
      page-key="nuxt-page"
    />
  </UApp>
</template>
