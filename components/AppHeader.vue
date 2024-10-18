<script setup lang="ts">
const client = useSupabaseClient()
const user = useSupabaseUser()
const colorMode = useColorMode()

const toggleDark = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const colorModeIcon = computed(() => colorMode.preference === 'dark' ? 'i-heroicons-outline-moon' : 'i-heroicons-outline-sun')

const logout = async () => {
  await client.auth.signOut()
  navigateTo('/')
}
</script>

<template>
  <div class="bg-sky-300">
    <Title>DayStart.IO</Title>
    <div class="flex items-center md:justify-between justify-center">
      <div class="bg-yellow-200 font-bold text-3xl m-4 p-2 outline outline-double rounded-tl-xl rounded-br-xl">Day Start</div>
      <div class="flex items-center ml-auto">
        <div v-if="user" class="flex items-center">
          <UAvatar :src="user.user_metadata.avatar_url" size="xs" class="mx-1"/>
          {{ user.user_metadata.full_name }}
          <UButton variant="link" color="gray" icon="i-heroicons-outline-logout" @click="logout" />
        </div>
        <UButton variant="link" color="gray" :icon="colorModeIcon" @click="toggleDark" />
      </div>
    </div>
  </div>
</template>