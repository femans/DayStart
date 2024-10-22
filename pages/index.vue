<script setup lang="ts">
const user = useSupabaseUser();
</script>

<template>
  <div v-if="user">
    <plans/>
  </div>
  <div v-else>
    <LoginOAuth />
  </div>

</template>