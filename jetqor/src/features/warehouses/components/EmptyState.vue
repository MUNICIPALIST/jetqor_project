<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  icon?: string;
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center border border-grayscale-200 rounded-lg border-dashed bg-white p-10">
    <div v-if="icon" class="mb-4 size-16 flex items-center justify-center rounded-full bg-grayscale-100 text-grey">
      <div :class="`i-jq-${icon} h-8 w-8`" />
    </div>
    <h3 class="text-lg font-semibold">
      {{ title }}
    </h3>
    <p class="mt-2 text-center text-sm text-grey">
      {{ description }}
    </p>
    <div v-if="$slots.default" class="mt-6">
      <slot />
    </div>
  </div>
</template>
