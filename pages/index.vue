<script setup lang="ts">
const user = useSupabaseUser();
</script>

<template>
  <div v-if="user">
  </div>
  <div v-else>
    <LoginOAuth />
  </div>

</template>