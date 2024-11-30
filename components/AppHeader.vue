<script setup lang="ts">
const client = useSupabaseClient()
const user = useSupabaseUser()
const colorMode = useColorMode()

const toggleDark = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const logout = async () => {
  await client.auth.signOut()
  navigateTo('/')
}

const topNavLinks = [
  { label: 'Home', icon: 'i-heroicons-outline-home', to: '/' },
  { label: 'Projects', icon: 'i-heroicons-outline-calendar', to: '/plans' },
  // { label: 'Settings', icon: 'i-heroicons-outline-cog', to: '/settings' },
]
</script>

<template>
  <header class="flex items-center md:justify-between justify-center bg-sky-300 dark:bg-sky-950 dark:bg-gradient-to-b dark:from-black w-full h-20 transition-colors duration-300">
    <div class="bg-yellow-200 dark:bg-slate-200 font-bold text-black text-3xl m-4 p-2 outline-double rounded-tl-xl rounded-br-xl select-none transition-colors">
      DayStart
    </div>
    <div class="flex items-center">
      <UButton
        v-for="link in topNavLinks"
        :key="link.to"
        :to="link.to"
        variant="link"
        class="text-gray-700 dark:text-slate-200"
        :icon="link.icon"
        :label="link.label"
      />
    </div>
    <div class="flex items-center ml-auto">
      <div
        v-if="user"
        class="flex items-center"
      >
        <UAvatar
          :src="user.user_metadata.avatar_url"
          size="xs"
          class="mx-1"
          :alt="user.user_metadata.full_name"
        />
        <span class="text-gray-700 dark:text-slate-200 hidden md:inline-flex">{{ user.user_metadata.full_name }}</span>
        <UButton
          variant="link"
          class="text-gray-700 dark:text-slate-200"
          icon="i-heroicons-outline-logout"
          @click="logout"
        />
      </div>
      <UButton
        variant="link"
        class="text-yellow-100 dark:text-slate-200"
        :icon="colorMode.preference === 'dark' ? 'i-heroicons-outline-moon' : 'i-heroicons-outline-sun'"
        @click="toggleDark"
      />
    </div>
  </header>
</template>
