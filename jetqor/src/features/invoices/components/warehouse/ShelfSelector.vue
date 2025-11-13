<script setup lang="ts">
import type { Shelf } from "../../types";

defineProps<{
  shelves: Shelf[];
  modelValue: number;
}>();

defineEmits<{
  (e: "update:modelValue", value: number): void;
}>();
</script>

<template>
  <div class="flex items-center gap-1 rounded bg-white p-1">
    <button
      v-for="shelf in shelves"
      :key="shelf.id"
      class="flex-1 rounded px-3 py-2.5 text-sm font-normal transition-colors"
      :class="{
        'bg-grayscale-100 font-semibold text-black': modelValue === shelf.id,
        'bg-white text-grey': modelValue !== shelf.id,
      }"
      @click="$emit('update:modelValue', shelf.id)"
    >
      {{ shelf.label }}
    </button>
  </div>
</template>
