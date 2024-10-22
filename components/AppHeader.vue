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

const topNavLinks = [
  { label: 'Home', icon: 'i-heroicons-outline-home', to: '/' },
  { label: 'Projects', icon: 'i-heroicons-outline-calendar', to: '/plans' },
  // { label: 'Settings', icon: 'i-heroicons-outline-cog', to: '/settings' },
];
</script>

<template>
  <div class="bg-sky-300">
    <Title>DayStart.IO</Title>
    <div class="flex items-center md:justify-between justify-center">
      <div class="bg-yellow-200 font-bold text-3xl m-4 p-2 outline-double rounded-tl-xl rounded-br-xl">DayStart</div>
      <div class="flex items-center">
        <UButton v-for="link in topNavLinks" :key="link.to" :to="link.to" variant="link" color="gray" :icon="link.icon" :label="link.label" />
      </div>
      <div class="flex items-center ml-auto">
        <div v-if="user" class="flex items-center">
          <UAvatar 
            :src="user.user_metadata.avatar_url" size="xs" class="mx-1" 
            :alt="user.user_metadata.full_name"/>
            <span class="hidden md:inline-flex">{{ user.user_metadata.full_name }}</span>
          <UButton variant="link" color="gray" icon="i-heroicons-outline-logout" @click="logout" />
        </div>
        <UButton variant="link" color="gray" :icon="colorModeIcon" @click="toggleDark" />
      </div>
    </div>
  </div>
</template>