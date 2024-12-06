<script setup lang="ts">
const user = useSupabaseUser();
</script>

<template>
  <div v-if="user" class="m-10 text-4xl font-extrabold">
    Good morning, {{ user.user_metadata.full_name }}!
  </div>
  <div v-else>
    <LoginOAuth />
  </div>
</template>
