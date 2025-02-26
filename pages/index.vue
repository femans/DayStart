<script setup lang="ts">
const user = useSupabaseUser()
</script>

<template>
  <div v-if="user" class="m-10 flex h-screen flex-col justify-between text-4xl font-extrabold">
    Good morning, {{ user.user_metadata.full_name }}!
    <span class="mt-auto text-sm font-normal text-slate-500">user-id: {{ user.id }}</span>
  </div>
  <div v-else>
    <LoginOAuth />
  </div>
</template>
