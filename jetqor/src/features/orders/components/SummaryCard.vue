<script lang="ts" setup>
const props = defineProps<{
  title: string;
  value: string;
  change?: string;
  icon: string;
  iconColor: string;
}>();

const iconClasses = computed(() => [
  props.icon,
  `${props.iconColor}`,
]);

const isPositiveChange = computed(() => {
  if (!props.change)
    return false;
  return !props.change.startsWith("-");
});
</script>

<template>
  <div class="w-full flex flex-col rounded-xl bg-white">
    <div class="flex items-center gap-2 p-4">
      <!-- Icon wrapper -->
      <div class="size-6 flex items-center justify-center">
        <div :class="iconClasses" class="text-4" />
      </div>

      <span class="text-3 text-grey">{{ title }}</span>

      <!-- Info icon -->
      <div class="ml-auto size-6">
        <div class="i-jq-info text-4 text-grey" />
      </div>
    </div>

    <!-- Value and change section -->
    <div class="flex items-end justify-between px-4 pb-5">
      <span class="text-7 text-black fw-500 leading-none">{{ value }}</span>
      <div v-if="change" class="flex flex-col items-end">
        <span
          class="mb-1 rounded-sm bg-#4AAF571A p1.5 text-2.5 text-green font-medium fw-500"
        >
          {{ change }}
        </span>
        <span class="text-3 text-grey">с прош. мес.</span>
      </div>
    </div>
  </div>
</template>
