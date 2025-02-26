<script lang="ts" setup>
import { DropZone, useMovingItem } from 'vue-arrange'
import type { Tables } from '~~/types/database.types'

type Plan = Tables<'plans'>
const { movingItem } = useMovingItem<Plan>()
const plans = useTable('plans', { verbose: true, autoFetch: true })
const route = useRoute()
const { archiveDoneChildren } = useDatabaseHelpers()

defineProps<{
  showArchived: boolean
}>()

defineEmits<{
  (e: 'toggleShowArchived', value: boolean): void
}>()

const pagePlanId = computed(() =>
  isNaN(parseInt(route.params.id as string))
    ? null
    : parseInt(route.params.id as string),
)

const pagePlanArchivedChildrenCount = computed(() =>
  plans.data.value.filter(p => p.parent_id === pagePlanId.value && p.archived).length,
)

const finishedChildren = computed(() =>
  plans.data.value.some(p => p.parent_id === pagePlanId.value && p.done && !p.archived),
)
</script>

<template>
  <DropZone
    v-slot="{ isHovering }"
    identifier="Archive Panel"
    group="plansGroup"
  >
    <UCard
      class="m-2 flex w-auto flex-col items-center rounded-lg bg-sky-50 transition-all hover:bg-sky-100"
      :class="{
        'border-red-500': movingItem?.payload.archived,
        'border-gray-300': !movingItem?.payload.archived,
      }"
      @click="!isHovering && $emit('toggleShowArchived', !showArchived)"
    >
      <!-- flex div needed because ucard renders an internal div, so flex class does not work otherwise -->
      <div class="flex flex-col items-center">
        <span
          class="m-1 flex select-none transition-all"
          :class="{
            'text-red-500': isHovering && movingItem?.payload.archived,
          }"
          size="xs"
        >
          {{ movingItem?.payload.archived ? 'Drop here to DELETE forever' : (movingItem ? 'Drop here to archive' : `Archive: ${pagePlanArchivedChildrenCount || 'empty'}`) }}
        </span>
        <span v-if="movingItem?.payload.archived && plans.data.value.some(p => p.parent_id === movingItem?.payload.id)" class="flex items-center text-sm">
          <UIcon name="i-heroicons-information-circle" />
          This item can not be deleted, because it has dependencies
        </span>
        <span v-else-if="movingItem?.payload.archived" class="flex items-center text-sm text-red-500">
          <UIcon name="i-heroicons-exclamation-triangle" />
          This action is irreversible
        </span>
        <UTooltip :popper="{ arrow: true, placement: 'right' }" :prevent="isHovering" text="Toggle to show archived items">
          <div class="flex items-center">
            <UIcon
              class="transition-all "
              :class="{
                'size-16': isHovering,
                'size-12': !isHovering,
                'text-red-500': isHovering && movingItem?.payload.archived,
                'text-gray-400': !isHovering || !movingItem?.payload.archived,
              }"
              :name="movingItem?.payload.archived ? 'i-heroicons-trash' : (isHovering ? 'i-heroicons-archive-box-arrow-down' : 'i-heroicons-archive-box')"
            />
            <UToggle
              v-if="!movingItem"
              :model-value="showArchived"
              on-icon="i-heroicons-eye"
              off-icon="i-heroicons-eye-slash"
              class="m-1"
            />
          </div>
        </UTooltip>
        <UButton
          v-if="finishedChildren"
          class="ml-auto hover:text-red-500 hover:ring-red-400"
          variant="solid"
          size="xs"
          color="gray"
          @click="archiveDoneChildren"
        >
          Archive all done tasks/projects
        </UButton>
      </div>
    </UCard>
  </DropZone>
</template>
