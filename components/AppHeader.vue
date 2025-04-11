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
  { label: 'Network', icon: 'i-heroicons-user-group', to: '/network' },
  // { label: 'Settings', icon: 'i-heroicons-outline-cog', to: '/settings' },
]

// Mobile menu state
const mobileMenuOpen = ref(false)
const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>

<template>
  <header
    class="flex h-auto min-h-16 sm:min-h-20 w-full flex-wrap items-center justify-between bg-sky-300 px-2 sm:px-4 py-1 sm:py-2 transition-colors duration-300 dark:bg-sky-950 dark:bg-gradient-to-b dark:from-black sm:h-20 sm:flex-nowrap"
  >
    <!-- Logo and brand -->
    <div class="flex items-center">
      <div
        class="relative select-none rounded-br-xl rounded-tl-xl bg-yellow-200 p-1 sm:p-2 text-xl sm:text-2xl md:text-3xl font-bold text-black outline-double transition-colors dark:bg-slate-200"
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
      <!-- Pre-alpha tag -->
      <div class="ml-1 sm:ml-2 flex items-center bg-amber-100 dark:bg-amber-900 px-1 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium italic">
        <span class="text-amber-800 dark:text-amber-200">Pre-Alpha</span>
      </div>
    </div>

    <!-- Mobile menu button -->
    <UButton
      class="sm:hidden"
      variant="ghost"
      icon="i-heroicons-bars-3"
      @click="toggleMobileMenu"
    />

    <!-- Desktop navigation and controls -->
    <div class="hidden w-full flex-grow items-center justify-between sm:flex sm:w-auto">
      <!-- Navigation links -->
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

      <!-- Right side controls -->
      <div class="flex items-center">
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
          <span class="hidden text-gray-700 md:inline-flex dark:text-slate-200">{{ user.user_metadata.full_name }}</span>
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
    </div>

    <!-- Mobile menu (collapsible) -->
    <div
      v-if="mobileMenuOpen"
      class="w-full sm:hidden mt-1 border-t border-sky-400 dark:border-sky-800 pt-1"
    >
      <!-- Mobile navigation links -->
      <div class="flex flex-col space-y-1">
        <UButton
          v-for="link in topNavLinks"
          :key="link.to"
          :to="link.to"
          block
          variant="ghost"
          size="sm"
          class="justify-start text-gray-700 dark:text-slate-200"
          :icon="link.icon"
          :label="link.label"
        />
      </div>

      <!-- Mobile search -->
      <div class="mt-1">
        <USelectMenu
          v-if="searchItems.length"
          v-model="searchInput"
          v-model:open="searchFocus"
          class="w-full"
          placeholder="Search projects..."
          icon="i-heroicons-magnifying-glass"
          size="sm"
          variant="outline"
          color="neutral"
          :reset-search-term-on-blur="true"
          :items="searchItems"
        >
          <template #item="{ item }">
            <NuxtLink
              :to="{ name: 'projects-id', params: { id: item.id } }"
              class="break-words w-full"
              :class="item.plan.archived ? 'text-(--ui-text-muted)' : ''"
            >
              <UIcon v-if="item.plan.archived" name="i-heroicons-archive-box" />
              {{ item.label }}
              <UIcon v-if="item.plan.done" name="i-heroicons-check-circle" class="bg-green-600" />
            </NuxtLink>
          </template>
        </USelectMenu>
      </div>

      <!-- Mobile user controls -->
      <div v-if="user" class="mt-1 flex items-center justify-between border-t border-sky-400 dark:border-sky-800 pt-1">
        <div class="flex items-center">
          <UAvatar
            :src="user.user_metadata.avatar_url"
            size="sm"
            class="mr-2"
            :alt="user.user_metadata.full_name"
          />
          <span class="text-gray-700 dark:text-slate-200">{{ user.user_metadata.full_name }}</span>
        </div>
        <div class="flex items-center space-x-2">
          <UButton
            variant="ghost"
            class="text-gray-700 dark:text-slate-200"
            icon="i-heroicons-outline-logout"
            @click="logout"
          />
          <UButton
            variant="ghost"
            class="text-yellow-100 dark:text-slate-200"
            :icon="colorMode.preference === 'dark' ? 'i-heroicons-outline-moon' : 'i-heroicons-outline-sun'"
            @click="toggleDark"
          />
        </div>
      </div>
    </div>
  </header>
</template>
