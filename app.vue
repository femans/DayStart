<script setup lang="ts">
useHead({
  bodyAttrs: {
    class: '',
  },
})
</script>

<template>
  <Title>DayStart.IO</Title>
  <AppHeader />
  <NuxtPage
    class="max-w-2xl min-w-min mx-auto sm:px-6 lg:px-8 flex items-center justify-center"
    page-key="nuxt-page"
  />
</template>
