<script setup lang="ts">
const client = useSupabaseClient()
const user = useSupabaseUser()
const colorMode = useColorMode()
const { realtimeSubscriptionStatus } = useDataBase()

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
  <header
    class="flex h-20 w-full items-center justify-center bg-sky-300 transition-colors duration-300 md:justify-between dark:bg-sky-950 dark:bg-gradient-to-b dark:from-black"
  >
    <div
      class="m-4 select-none rounded-br-xl rounded-tl-xl bg-yellow-200 p-2 text-3xl font-bold text-black outline-double transition-colors dark:bg-slate-200"
    >
      DayStart
    </div>
    <UIcon
      size="xs"
      :name="
        realtimeSubscriptionStatus === 'SUBSCRIBED'
          ? 'i-heroicons-bolt'
          : 'i-heroicons-bolt-slash'
      "
      :class="
        realtimeSubscriptionStatus === 'SUBSCRIBED'
          ? 'bg-green-700'
          : 'bg-red-500'
      "
    />
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
    <div class="ml-auto flex items-center">
      <div v-if="user" class="flex items-center">
        <UAvatar
          :src="user.user_metadata.avatar_url"
          size="xs"
          class="mx-1"
          :alt="user.user_metadata.full_name"
        />
        <span class="hidden text-gray-700 md:inline-flex dark:text-slate-200">{{
          user.user_metadata.full_name
        }}</span>
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
        :icon="
          colorMode.preference === 'dark'
            ? 'i-heroicons-outline-moon'
            : 'i-heroicons-outline-sun'
        "
        @click="toggleDark"
      />
    </div>
  </header>
</template>
