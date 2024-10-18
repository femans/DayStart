<script setup lang="ts">
const { auth } = useSupabaseClient()
</script>

<template>
  <div class="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <h2 class="my-6 text-center text-3xl font-extrabold">
      Sign in to your account
    </h2>
    <UButton class="mt-3" icon="i-mdi-github" block label="Github" color="primary" variant="solid"
      @click="auth.signInWithOAuth({ provider: 'github', options: {
        redirectTo: '/plans',
      } })" />
    <UButton class="mt-3" icon="i-mdi-google" block label="Google" color="gray" variant="solid" disabled
      @click="auth.signInWithOAuth({ provider: 'google' })" />
  </div>
</template>