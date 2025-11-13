<script setup lang="ts">
import { VueFinalModal } from "vue-final-modal";

defineEmits<{
  (e: "close"): void;
  (e: "updated"): void;
}>();
</script>

<template>
  <VueFinalModal
    class="fixed inset-0"
    content-class="w-[60%] absolute right-0 top-0 h-full flex flex-col bg-white rounded-l-8 p-8"
    overlay-class="bg-black/40"
    content-transition="vfm-slide-right"
    overlay-transition="vfm-fade"
    :hide-overlay="false"
    @close="$emit('close')"
  >
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-6">
        <button
          class="h-11 w-11 flex items-center justify-center rounded-lg bg-gray-100"
          @click="$emit('close')"
        >
          <div class="i-jq-close h-4 w-4" />
        </button>
        <div class="text-xl text-gray-900 font-bold">
          Редактирование склада
        </div>
      </div>
    </div>

    <div class="my-6 h-px w-full bg-gray-200" />

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
      <slot />
    </div>
  </VueFinalModal>
</template>
