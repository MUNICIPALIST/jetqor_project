<script setup lang="ts">
import BaseButton from "@/components/ui/BaseButton/index.vue";

import { VueFinalModal } from "vue-final-modal";

const props = defineProps<{
  title?: string;
  onClose?: () => void;
  onSave?: () => void;
}>();

function handleClose() {
  props.onClose?.();
}

function handleSave() {
  props.onSave?.();
}
</script>

<template>
  <VueFinalModal
    class="fixed inset-0"
    content-class="w-60% absolute right-0 top-0 h-full flex flex-col bg-grayscale-100 rounded-l-8 gap-6 p8"
    overlay-class="bg-black/40"
    content-transition="vfm-slide-right"
    overlay-transition="vfm-fade"
    :hide-overlay="false"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-6">
        <button
          class="size-11 flex items-center justify-center rounded-full bg-white p2.5 transition-all active:scale-90 hover:scale-105"
          @click="handleClose"
        >
          <div class="i-jq-close text-4 text-black" />
        </button>
        <div class="text-h4 text-black fw-700">
          {{ title }}
        </div>
      </div>

      <div class="flex gap-3">
        <BaseButton variant="secondary" @click="handleClose">
          Отмена
        </BaseButton>
        <BaseButton variant="primary" @click="handleSave">
          Создать товар
        </BaseButton>
      </div>
    </div>

    <div class="h-1px w-full bg-grayscale-300" />

    <slot />
  </VueFinalModal>
</template>
