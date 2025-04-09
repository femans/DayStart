<script setup lang="ts">
const client = useSupabaseClient()
const user = useSupabaseUser()
const colorMode = useColorMode()
const { realtimeSubscriptionStatus } = useDataBase()

const toggleDark = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
const { plans } = useDatabaseHelpers()

const searchItems = computed(() => {
  return plans.data.value.map(plan => ({
    label: `${plan.id} - ${plan.title}`,
    id: plan.id,
    plan,
  }))
})
const searchFocus = ref<boolean>(false)
const searchInput = ref()
watch(searchInput, () => {
  if (searchInput.value) {
    navigateTo({ name: 'projects-id', params: { id: searchInput.value.id } })
    searchInput.value = ''
  }
})

const logout = async () => {
  await client.auth.signOut()
  navigateTo('/')
}

const topNavLinks = [
  { label: 'Home', icon: 'i-heroicons-outline-home', to: '/' },
  { label: 'Projects', icon: 'i-heroicons-outline-calendar', to: '/projects' },
  { label: 'Tasks', icon: 'i-heroicons-clipboard-document-list', to: '/tasks' },
  // { label: 'Settings', icon: 'i-heroicons-outline-cog', to: '/settings' },
]
</script>

<template>
  <header
    class="flex h-20 w-full items-center justify-center bg-sky-300 transition-colors duration-300 md:justify-between dark:bg-sky-950 dark:bg-gradient-to-b dark:from-black"
  >
    <div
      class="relative m-4 select-none rounded-br-xl rounded-tl-xl bg-yellow-200 p-2 text-3xl font-bold text-black outline-double transition-colors dark:bg-slate-200"
    >
      DayStart
      <UIcon
        v-if="realtimeSubscriptionStatus !== 'SUBSCRIBED'"
        name="i-heroicons-bolt-slash"
        class="absolute right-1 top-1 size-2 bg-red-500"
      />
      <UIcon
        v-else
        name="i-heroicons-bolt"
        class="absolute right-1 top-1 size-2 bg-green-500"
      />
    </div>
    <div class="hidden md:flex items-center bg-amber-100 dark:bg-amber-900 px-2 py-1 rounded-md text-xs font-medium italic">
      <span class="text-amber-800 dark:text-amber-200">Embryonic Pre-Alpha</span>
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
    <div class="ml-auto flex items-center">
      <USelectMenu
        v-if="searchItems.length"
        v-model="searchInput"
        v-model:open="searchFocus"
        class="rounded-full transition-all mx-2"
        :class="searchFocus || searchInput ? 'w-60' : 'w-10'"
        :highlight-on-hover="false"
        icon="i-heroicons-magnifying-glass"
        size="md"
        variant="none"
        color="neutral"
        trailing-icon=""
        :reset-search-term-on-blur="true"
        :items="searchItems"
      >
        <template #item="{ item }">
          <NuxtLink
            :to="{ name: 'projects-id', params: { id: item.id } }"
            class="break-words w-56"
            :class="item.plan.archived ? 'text-(--ui-text-muted)' : ''"
          >
            <UIcon v-if="item.plan.archived" name="i-heroicons-archive-box" />
            {{ item.label }}
            <UIcon v-if="item.plan.done" name="i-heroicons-check-circle" class="bg-green-600" />
          </NuxtLink>
        </template>
      </USelectMenu>
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
