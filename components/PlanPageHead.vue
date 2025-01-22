<script lang="ts" setup>
const user = useSupabaseUser()
const route = useRoute()
const plans = useTable('plans', { verbose: true, autoFetch: true })

const pagePlanId = computed(() =>
  isNaN(parseInt(route.params.id as string))
    ? null
    : parseInt(route.params.id as string),
)

const pagePlan = computed(() =>
  plans.data.value.find(p => p.id === pagePlanId.value),
)

const pagePlanHasDoneChildren = computed(() =>
  plans.data.value.some(p => p.parent_id === pagePlanId.value && p.done && !p.archived),
)

function archiveDoneChildren() {
  if (!user.value) return
  if (!pagePlanId.value) return
  plans.data.value
    .filter(p => p.parent_id === pagePlanId.value && p.done && !p.archived)
    .forEach(p => plans.update(p.id, { archived: true }))
}

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

async function updatePlan(event: Event) {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(async () => {
    if (!user.value) return
    if (!pagePlan.value) return
    const target = event.target as HTMLInputElement
    const title = target.value
    plans.update(pagePlan.value.id, { title }).then(
      () =>
        console.log(`Plan ${pagePlanId.value} updated with title: ${title}`),
      error => console.error('Error updating plan:', error),
    )
  }, 150)
}
</script>

<template>
  <textarea
    v-if="pagePlan"
    ref="titleArea"
    :value="pagePlan.title"
    class="h-auto w-full overflow-hidden text-3xl font-bold"
    :class="{
      'italic text-slate-400': pagePlan.archived,
      'text-slate-900 dark:text-slate-100': !pagePlan.archived,
    }"
    rows="1"
    oninput="this.style.height = ''; this.style.height = this.scrollHeight + 'px'"
    @change="updatePlan"
    @keydown.enter="(event) => (event.target as HTMLInputElement).blur()"
  />
  <div class="flex w-full flex-row items-center">
    <UIcon v-if="pagePlan?.archived" name="i-heroicons-archive-box" class="mr-2 size-5 text-slate-400" />
    <span v-if="pagePlan" class="text-sm text-slate-400">
      {{ pagePlan.archived ? `${pagePlan.id} ARCHIVED` : pagePlan.id }}
    </span>
    <UButton
      v-if="pagePlanHasDoneChildren"
      class="ml-auto"
      variant="solid"
      size="xs"
      color="gray"
      @click="archiveDoneChildren"
    >
      Archive done
    </UButton>
  </div>
  <h1 v-if="!pagePlan" class="flex flex-row items-center gap-2 text-3xl font-bold">
    <UIcon name="i-heroicons-home" />
    Home
  </h1>
</template>
