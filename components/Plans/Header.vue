<script lang="ts" setup>
import useDatabaseHelpers from '../../composables/useDatabaseHelpers'

const route = useRoute()
const plans = useTable('plans', { verbose: true, autoFetch: true })
const { pagePlanId, pagePlan, updatePlan, archiveDoneChildren } = useDatabaseHelpers()

const finishedChildren = computed(() =>
  plans.data.value.filter(p => p.parent_id === pagePlanId.value && p.done && !p.archived),
)

const unfinishedChildren = computed(() =>
  plans.data.value.filter(p => p.parent_id === pagePlanId.value && !p.done && !p.archived),
)

const totalChildren = computed(() => plans.data.value.filter(p => p.parent_id === pagePlanId.value && !p.archived).length)

const manhoursRequiredByChildren = computed(() =>
  unfinishedChildren.value.reduce((
    total,
    plan,
  ) => total + (plan.manhours_required || 0), 0),
)

const titleArea = ref<HTMLElement | null>(null)

watch(() => route.params, async () => {
  await nextTick()
  if (titleArea.value) {
    titleArea.value.style.height = ''
    titleArea.value.style.height = `${titleArea.value.scrollHeight}px`
  }
})
</script>

<template>
  <textarea
    v-if="pagePlanId"
    ref="titleArea"
    v-model="pagePlan.title"
    name="title"
    class="h-auto w-full overflow-hidden text-3xl font-bold"
    :class="{
      'italic text-slate-400': pagePlan.archived,
      'text-slate-900 dark:text-slate-100': !pagePlan.archived,
    }"
    rows="1"
    oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'"
    @change="updatePlan({ title: ($event.target as HTMLTextAreaElement).value })"
    @keydown.enter="(event) => (event.target as HTMLInputElement).blur()"
  />
  <h1 v-else class="flex flex-row items-center gap-2 text-3xl font-bold">
    <UIcon name="i-heroicons-home" />
    Home
  </h1>
  <div class="mb-1 flex w-full flex-row items-center">
    <UIcon v-if="pagePlan?.archived" name="i-heroicons-archive-box" class="mr-2 size-5 text-slate-400" />
    <span v-if="pagePlan" class="text-sm text-slate-400">
      {{ pagePlan.archived ? `${pagePlan.id} ARCHIVED` : pagePlan.id }}
    </span>
    <UButton
      v-if="finishedChildren"
      class="ml-auto"
      variant="solid"
      size="xs"
      color="gray"
      @click="archiveDoneChildren"
    >
      Archive done
    </UButton>
  </div>
  <UCard v-if="pagePlanId">
    <PlansHeaderInput
      :label="totalChildren ? 'Manhours overhead on this project:' : 'Hours required for this task'"
      field="manhours_required"
      input-type="number"
    />
    <div
      v-if="unfinishedChildren"
      class="m-1 flex w-full text-sm"
    >
      <span> Manhours required for subtasks: </span>
      <span class="ml-auto mr-2 p-1">
        {{ manhoursRequiredByChildren }}
      </span>
    </div>
    <UDivider />
    <PlansHeaderInput
      label="Budget:"
      field="budget"
      input-type="number"
    />
  </UCard>
</template>
