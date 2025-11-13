<script setup lang="ts">
defineProps<{
  label: string;
  value: string | number;
  change?: number;
}>();
</script>

<template>
  <div class="rounded-xl bg-white p-6">
    <h3 class="mb-2 text-gray-600">
      {{ label }}
    </h3>
    <p class="mb-2 heading-3 text-second">
      {{ value }}
    </p>
    <div v-if="change" class="flex items-center gap-1">
      <span :class="change >= 0 ? 'text-green' : 'text-red'">
        {{ change >= 0 ? '+' : '' }}{{ change }}%
      </span>
    </div>
  </div>
</template>
